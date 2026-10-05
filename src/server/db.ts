import { DatabaseSync } from 'node:sqlite';
import crypto from 'node:crypto';
import path from 'node:path';

const DB_PATH = path.resolve(process.cwd(), 'exchange_ledger.sqlite');

export const db = new DatabaseSync(DB_PATH);

// Enable WAL mode and foreign key enforcement for financial integrity
db.exec('PRAGMA journal_mode = WAL;');
db.exec('PRAGMA foreign_keys = ON;');
db.exec('PRAGMA synchronous = NORMAL;');

export function initializeDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      uid TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      salt TEXT NOT NULL,
      nickname TEXT NOT NULL,
      vip_level TEXT NOT NULL DEFAULT 'Regular',
      kyc_status TEXT NOT NULL DEFAULT 'Unverified',
      kyc_daily_limit_usdt REAL NOT NULL DEFAULT 50000,
      two_factor_enabled INTEGER NOT NULL DEFAULT 0,
      anti_phishing_code TEXT NOT NULL DEFAULT '',
      withdrawal_whitelist_enabled INTEGER NOT NULL DEFAULT 0,
      passkey_connected INTEGER NOT NULL DEFAULT 0,
      referral_code TEXT UNIQUE NOT NULL,
      referred_by TEXT,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS sessions (
      token TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      expires_at INTEGER NOT NULL,
      ip_address TEXT,
      user_agent TEXT,
      created_at TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS wallets (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      asset TEXT NOT NULL,
      name TEXT NOT NULL,
      available REAL NOT NULL DEFAULT 0 CHECK (available >= -0.00000001),
      locked REAL NOT NULL DEFAULT 0 CHECK (locked >= -0.00000001),
      staked REAL NOT NULL DEFAULT 0 CHECK (staked >= -0.00000001),
      updated_at TEXT NOT NULL,
      UNIQUE(user_id, asset),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS ledger_entries (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      asset TEXT NOT NULL,
      entry_type TEXT NOT NULL,
      delta_available REAL NOT NULL DEFAULT 0,
      delta_locked REAL NOT NULL DEFAULT 0,
      delta_staked REAL NOT NULL DEFAULT 0,
      balance_after REAL NOT NULL,
      reference_id TEXT NOT NULL,
      metadata TEXT,
      created_at TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      client_order_id TEXT UNIQUE,
      user_id TEXT NOT NULL,
      pair TEXT NOT NULL,
      market_type TEXT NOT NULL,
      type TEXT NOT NULL,
      side TEXT NOT NULL,
      price REAL NOT NULL,
      stop_price REAL,
      amount REAL NOT NULL,
      filled REAL NOT NULL DEFAULT 0,
      total REAL NOT NULL,
      leverage INTEGER DEFAULT 1,
      status TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS trades (
      id TEXT PRIMARY KEY,
      order_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      pair TEXT NOT NULL,
      side TEXT NOT NULL,
      price REAL NOT NULL,
      amount REAL NOT NULL,
      fee REAL NOT NULL,
      fee_asset TEXT NOT NULL,
      role TEXT NOT NULL,
      total REAL NOT NULL,
      timestamp TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS wallet_transactions (
      id TEXT PRIMARY KEY,
      tx_hash TEXT UNIQUE NOT NULL,
      user_id TEXT NOT NULL,
      asset TEXT NOT NULL,
      tx_type TEXT NOT NULL,
      network TEXT NOT NULL,
      address TEXT NOT NULL,
      amount REAL NOT NULL,
      fee REAL NOT NULL DEFAULT 0,
      status TEXT NOT NULL,
      created_at TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS earn_subscriptions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      product_id TEXT NOT NULL,
      asset TEXT NOT NULL,
      amount REAL NOT NULL,
      apr REAL NOT NULL,
      duration_days TEXT NOT NULL,
      status TEXT NOT NULL,
      created_at TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS airdrop_claims (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      campaign_id TEXT NOT NULL,
      token TEXT NOT NULL,
      amount REAL NOT NULL,
      claimed_at TEXT NOT NULL,
      UNIQUE(user_id, campaign_id),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS notifications (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      category TEXT NOT NULL,
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      action_route TEXT,
      read INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS support_tickets (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      email TEXT NOT NULL,
      topic TEXT NOT NULL,
      message TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'Open',
      created_at TEXT NOT NULL
    );
  `);
}

export function withTransaction<T>(fn: () => T): T {
  db.exec('BEGIN IMMEDIATE TRANSACTION;');
  try {
    const result = fn();
    db.exec('COMMIT;');
    return result;
  } catch (err) {
    db.exec('ROLLBACK;');
    throw err;
  }
}

export function hashPassword(password: string, salt?: string): { hash: string; salt: string } {
  const usedSalt = salt || crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, usedSalt, 64).toString('hex');
  return { hash, salt: usedSalt };
}

export const SUPPORTED_WALLET_ASSETS = [
  { asset: 'USDT', name: 'Tether US' },
  { asset: 'USDC', name: 'USD Coin' },
  { asset: 'BTC', name: 'Bitcoin' },
  { asset: 'ETH', name: 'Ethereum' },
  { asset: 'SOL', name: 'Solana' },
  { asset: 'BNB', name: 'BNB Chain' },
  { asset: 'XRP', name: 'XRP Ledger' },
  { asset: 'ADA', name: 'Cardano' },
  { asset: 'AVAX', name: 'Avalanche' },
  { asset: 'LINK', name: 'Chainlink' },
  { asset: 'SUI', name: 'Sui Network' },
  { asset: 'NEAR', name: 'NEAR Protocol' },
  { asset: 'RENDER', name: 'Render Network' },
  { asset: 'UNI', name: 'Uniswap' },
  { asset: 'AAVE', name: 'Aave Protocol' },
  { asset: 'ARB', name: 'Arbitrum' },
  { asset: 'DOT', name: 'Polkadot' },
  { asset: 'DOGE', name: 'Dogecoin' },
];

export function ensureUserWallets(userId: string) {
  const now = new Date().toISOString();
  const stmt = db.prepare(`
    INSERT OR IGNORE INTO wallets (id, user_id, asset, name, available, locked, staked, updated_at)
    VALUES (?, ?, ?, ?, 0, 0, 0, ?)
  `);
  for (const item of SUPPORTED_WALLET_ASSETS) {
    stmt.run(`WAL-${userId}-${item.asset}`, userId, item.asset, item.name, now);
  }
}

export function getDeterministicDepositAddress(userId: string, asset: string, networkCode: string): string {
  const digest = crypto
    .createHash('sha256')
    .update(`${userId}:${asset}:${networkCode}:aetherx_custody`)
    .digest('hex');

  if (networkCode === 'TRX') {
    return `T${digest.slice(0, 33).toUpperCase()}`;
  }
  if (networkCode === 'BTC') {
    return `bc1q${digest.slice(0, 38)}`;
  }
  if (networkCode === 'LIGHTNING') {
    return `lnbc1${digest.slice(0, 44)}`;
  }
  if (networkCode === 'SOL') {
    return `${digest.slice(0, 43)}`;
  }
  return `0x${digest.slice(0, 40)}`;
}
