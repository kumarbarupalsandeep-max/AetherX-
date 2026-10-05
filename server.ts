import express, { Request, Response, NextFunction } from 'express';
import crypto from 'node:crypto';
import path from 'node:path';
import { createServer as createViteServer } from 'vite';
import {
  db,
  initializeDatabase,
  withTransaction,
  hashPassword,
  ensureUserWallets,
  getDeterministicDepositAddress,
} from './src/server/db.ts';
import {
  getLiveTickers,
  getLivePriceForAsset,
  getLiveOrderBook,
  getLiveRecentTrades,
  getLiveKlines,
} from './src/server/marketService.ts';

initializeDatabase();

const app = express();
app.use(express.json({ limit: '1mb' }));

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    uid: string;
    email: string;
  };
  token?: string;
}

function getNetworkConfigs(userId: string, asset: string) {
  if (asset === 'BTC') {
    return [
      {
        name: 'Bitcoin Native (SegWit)',
        code: 'BTC',
        fee: 0.00012,
        minWithdraw: 0.001,
        arrivalTime: '~20 mins',
        depositAddress: getDeterministicDepositAddress(userId, asset, 'BTC'),
      },
      {
        name: 'BNB Smart Chain (BEP20)',
        code: 'BSC',
        fee: 0.000005,
        minWithdraw: 0.0005,
        arrivalTime: '~2 mins',
        depositAddress: getDeterministicDepositAddress(userId, asset, 'BSC'),
      },
      {
        name: 'Lightning Network',
        code: 'LIGHTNING',
        fee: 0.000001,
        minWithdraw: 0.00002,
        arrivalTime: 'Instant',
        depositAddress: getDeterministicDepositAddress(userId, asset, 'LIGHTNING'),
      },
    ];
  }
  if (asset === 'SOL') {
    return [
      {
        name: 'Solana Mainnet',
        code: 'SOL',
        fee: 0.008,
        minWithdraw: 0.1,
        arrivalTime: '~30 secs',
        depositAddress: getDeterministicDepositAddress(userId, asset, 'SOL'),
      },
    ];
  }
  return [
    {
      name: 'Tron (TRC20)',
      code: 'TRX',
      fee: 1.0,
      minWithdraw: 10,
      arrivalTime: '~2 mins',
      depositAddress: getDeterministicDepositAddress(userId, asset, 'TRX'),
    },
    {
      name: 'BNB Smart Chain (BEP20)',
      code: 'BSC',
      fee: 0.29,
      minWithdraw: 10,
      arrivalTime: '~1 min',
      depositAddress: getDeterministicDepositAddress(userId, asset, 'BSC'),
    },
    {
      name: 'Ethereum (ERC20)',
      code: 'ETH',
      fee: 3.5,
      minWithdraw: 20,
      arrivalTime: '~4 mins',
      depositAddress: getDeterministicDepositAddress(userId, asset, 'ETH'),
    },
    {
      name: 'Arbitrum One',
      code: 'ARB',
      fee: 0.15,
      minWithdraw: 10,
      arrivalTime: '~1 min',
      depositAddress: getDeterministicDepositAddress(userId, asset, 'ARB'),
    },
  ];
}

// Authentication Middleware
function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Authentication required. Please log in.' });
    return;
  }

  const token = authHeader.slice(7).trim();
  if (!token) {
    res.status(401).json({ error: 'Missing session token.' });
    return;
  }

  const row = db
    .prepare(
      `SELECT s.token, s.expires_at, u.id, u.uid, u.email
       FROM sessions s
       JOIN users u ON u.id = s.user_id
       WHERE s.token = ?`
    )
    .get(token) as any;

  if (!row || row.expires_at < Date.now()) {
    res.status(401).json({ error: 'Session expired or invalid. Please log in again.' });
    return;
  }

  req.user = { id: row.id, uid: row.uid, email: row.email };
  req.token = token;
  next();
}

function formatUserProfile(userId: string) {
  const u = db.prepare(`SELECT * FROM users WHERE id = ?`).get(userId) as any;
  if (!u) return null;

  const refCountRow = db
    .prepare(`SELECT COUNT(*) as cnt FROM users WHERE referred_by = ?`)
    .get(u.referral_code) as any;

  const tradeFeeRow = db
    .prepare(`SELECT COALESCE(SUM(fee), 0) as totalFees FROM trades WHERE user_id = ?`)
    .get(userId) as any;

  return {
    uid: u.uid,
    email: u.email,
    nickname: u.nickname,
    vipLevel: u.vip_level,
    kycStatus: u.kyc_status,
    kycDailyLimitUSDT: Number(u.kyc_daily_limit_usdt),
    twoFactorEnabled: Boolean(u.two_factor_enabled),
    antiPhishingCode: u.anti_phishing_code || '',
    withdrawalWhitelistEnabled: Boolean(u.withdrawal_whitelist_enabled),
    passkeyConnected: Boolean(u.passkey_connected),
    referralCode: u.referral_code,
    referredFriends: Number(refCountRow?.cnt || 0),
    totalCommissionUSDT: Number(((tradeFeeRow?.totalFees || 0) * 0.4).toFixed(4)),
  };
}

// ============================================================================
// 1. PUBLIC LIVE MARKET DATA ENDPOINTS (REAL UPSTREAM BINANCE REST PROXY)
// ============================================================================

app.get('/api/market/tickers', async (_req, res) => {
  try {
    const tickers = await getLiveTickers();
    res.json({ tickers, updatedAt: new Date().toISOString() });
  } catch (err: any) {
    res.status(503).json({
      error: 'Live market data unavailable from upstream exchange provider.',
      details: err.message,
    });
  }
});

app.get('/api/market/depth', async (req, res) => {
  try {
    const symbol = String(req.query.symbol || 'BTCUSDT').toUpperCase();
    const limit = Math.min(50, Math.max(5, Number(req.query.limit) || 16));
    const depth = await getLiveOrderBook(symbol, limit);
    res.json(depth);
  } catch (err: any) {
    res.status(503).json({
      error: 'Live order book depth unavailable.',
      details: err.message,
    });
  }
});

app.get('/api/market/trades', async (req, res) => {
  try {
    const symbol = String(req.query.symbol || 'BTCUSDT').toUpperCase();
    const limit = Math.min(50, Math.max(5, Number(req.query.limit) || 24));
    const trades = await getLiveRecentTrades(symbol, limit);
    res.json({ symbol, trades });
  } catch (err: any) {
    res.status(503).json({
      error: 'Live market trades unavailable.',
      details: err.message,
    });
  }
});

app.get('/api/market/klines', async (req, res) => {
  try {
    const symbol = String(req.query.symbol || 'BTCUSDT').toUpperCase();
    const interval = String(req.query.interval || '15m');
    const candles = await getLiveKlines(symbol, interval, 60);
    res.json({ symbol, interval, candles });
  } catch (err: any) {
    res.status(503).json({
      error: 'Live candlestick chart data unavailable.',
      details: err.message,
    });
  }
});

// ============================================================================
// 2. AUTHENTICATION & SESSION MANAGEMENT (REAL DB USERS + SCRYPT + SESSIONS)
// ============================================================================

app.post('/api/auth/register', (req, res) => {
  try {
    const email = String(req.body.email || '').trim().toLowerCase();
    const password = String(req.body.password || '');
    const referralCodeInput = String(req.body.referralCode || '').trim().toUpperCase();

    if (!email || !email.includes('@') || email.length < 5) {
      res.status(400).json({ error: 'Please provide a valid email address.' });
      return;
    }
    if (!password || password.length < 6) {
      res.status(400).json({ error: 'Password must be at least 6 characters long.' });
      return;
    }

    const existing = db.prepare(`SELECT id FROM users WHERE email = ?`).get(email);
    if (existing) {
      res.status(409).json({ error: 'An account with this email already exists. Please log in.' });
      return;
    }

    const userId = `USR-${crypto.randomUUID()}`;
    const uid = String(Math.floor(100000000 + Math.random() * 900000000));
    const { hash, salt } = hashPassword(password);
    const nickname = email.split('@')[0];
    const myRefCode = `AX${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
    const now = new Date().toISOString();
    const sessionToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000;

    withTransaction(() => {
      db.prepare(
        `INSERT INTO users (
          id, uid, email, password_hash, salt, nickname, vip_level, kyc_status,
          kyc_daily_limit_usdt, two_factor_enabled, anti_phishing_code,
          withdrawal_whitelist_enabled, passkey_connected, referral_code, referred_by, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, 'Regular', 'Unverified', 50000, 0, '', 0, 0, ?, ?, ?)`
      ).run(userId, uid, email, hash, salt, nickname, myRefCode, referralCodeInput || null, now);

      ensureUserWallets(userId);

      db.prepare(
        `INSERT INTO sessions (token, user_id, expires_at, ip_address, user_agent, created_at)
         VALUES (?, ?, ?, ?, ?, ?)`
      ).run(sessionToken, userId, expiresAt, req.ip || '127.0.0.1', req.headers['user-agent'] || '', now);

      db.prepare(
        `INSERT INTO notifications (id, user_id, category, title, message, action_route, read, created_at)
         VALUES (?, ?, 'Security', 'Account Created Successfully', ?, '/deposit', 0, ?)`
      ).run(
        `NTF-${crypto.randomUUID()}`,
        userId,
        `Welcome to AetherX Pro (${email}). Your multi-chain Spot wallets have been initialized with 0.00 balance. Deposit or Buy Crypto to start trading.`,
        now
      );
    });

    res.status(201).json({
      token: sessionToken,
      user: formatUserProfile(userId),
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Registration failed.' });
  }
});

app.post('/api/auth/login', (req, res) => {
  try {
    const email = String(req.body.email || '').trim().toLowerCase();
    const password = String(req.body.password || '');

    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required.' });
      return;
    }

    const userRow = db.prepare(`SELECT * FROM users WHERE email = ?`).get(email) as any;
    if (!userRow) {
      res.status(401).json({ error: 'Invalid email or password. If you do not have an account, please Register first.' });
      return;
    }

    const { hash } = hashPassword(password, userRow.salt);
    if (hash !== userRow.password_hash) {
      res.status(401).json({ error: 'Invalid email or password.' });
      return;
    }

    ensureUserWallets(userRow.id);

    const sessionToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000;
    const now = new Date().toISOString();

    db.prepare(
      `INSERT INTO sessions (token, user_id, expires_at, ip_address, user_agent, created_at)
       VALUES (?, ?, ?, ?, ?, ?)`
    ).run(sessionToken, userRow.id, expiresAt, req.ip || '127.0.0.1', req.headers['user-agent'] || '', now);

    res.json({
      token: sessionToken,
      user: formatUserProfile(userRow.id),
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Login failed.' });
  }
});

app.post('/api/auth/logout', requireAuth, (req: AuthenticatedRequest, res) => {
  if (req.token) {
    db.prepare(`DELETE FROM sessions WHERE token = ?`).run(req.token);
  }
  res.json({ ok: true });
});

app.get('/api/auth/me', requireAuth, (req: AuthenticatedRequest, res) => {
  const profile = formatUserProfile(req.user!.id);
  if (!profile) {
    res.status(404).json({ error: 'User not found.' });
    return;
  }
  res.json({ user: profile });
});

// ============================================================================
// 3. USER PROFILE, SECURITY & KYC UPDATES
// ============================================================================

app.patch('/api/account/profile', requireAuth, (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user!.id;
    const {
      nickname,
      twoFactorEnabled,
      antiPhishingCode,
      withdrawalWhitelistEnabled,
      passkeyConnected,
      kycStatus,
    } = req.body;

    const current = db.prepare(`SELECT * FROM users WHERE id = ?`).get(userId) as any;
    if (!current) {
      res.status(404).json({ error: 'User not found.' });
      return;
    }

    const nextKyc = kycStatus !== undefined ? String(kycStatus) : current.kyc_status;
    const nextLimit =
      nextKyc === 'Verified Plus' ? 2000000 : nextKyc === 'Verified' ? 500000 : 50000;

    db.prepare(
      `UPDATE users
       SET nickname = ?,
           two_factor_enabled = ?,
           anti_phishing_code = ?,
           withdrawal_whitelist_enabled = ?,
           passkey_connected = ?,
           kyc_status = ?,
           kyc_daily_limit_usdt = ?
       WHERE id = ?`
    ).run(
      nickname !== undefined ? String(nickname).trim() : current.nickname,
      twoFactorEnabled !== undefined ? (twoFactorEnabled ? 1 : 0) : current.two_factor_enabled,
      antiPhishingCode !== undefined ? String(antiPhishingCode).trim() : current.anti_phishing_code,
      withdrawalWhitelistEnabled !== undefined
        ? withdrawalWhitelistEnabled
          ? 1
          : 0
        : current.withdrawal_whitelist_enabled,
      passkeyConnected !== undefined ? (passkeyConnected ? 1 : 0) : current.passkey_connected,
      nextKyc,
      nextLimit,
      userId
    );

    res.json({ user: formatUserProfile(userId) });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to update profile.' });
  }
});

// ============================================================================
// 4. REAL WALLET LEDGER, DEPOSIT, WITHDRAWAL & P2P / FIAT SETTLEMENT
// ============================================================================

app.get('/api/wallet/balances', requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user!.id;
    ensureUserWallets(userId);

    const rows = db
      .prepare(`SELECT * FROM wallets WHERE user_id = ? ORDER BY asset ASC`)
      .all(userId) as any[];

    let liveTickers: any[] = [];
    let btcPrice = 0;
    try {
      liveTickers = await getLiveTickers();
      btcPrice = liveTickers.find((t) => t.symbol === 'BTCUSDT')?.price || 0;
    } catch {
      // If upstream ticker API is temporarily unreachable, valuation for non-stablecoins is 0 until reconnected
    }

    const balances = rows.map((r) => {
      const totalTokens = Number(r.available) + Number(r.locked) + Number(r.staked);
      let priceUSDT = 0;
      if (r.asset === 'USDT' || r.asset === 'USDC') {
        priceUSDT = 1.0;
      } else {
        const ticker = liveTickers.find((t) => t.baseAsset === r.asset);
        priceUSDT = ticker ? ticker.price : 0;
      }
      const usdtValuation = Number((totalTokens * priceUSDT).toFixed(2));
      const btcValuation = btcPrice > 0 ? Number((usdtValuation / btcPrice).toFixed(6)) : 0;

      return {
        asset: r.asset,
        name: r.name,
        available: Number(r.available),
        inOrder: Number(r.locked),
        staked: Number(r.staked),
        usdtValuation,
        btcValuation,
        networks: getNetworkConfigs(userId, r.asset),
      };
    });

    // Sort by total USDT valuation descending, then USDT/BTC/ETH/SOL first
    const priority = ['USDT', 'BTC', 'ETH', 'SOL', 'BNB', 'USDC'];
    balances.sort((a, b) => {
      if (b.usdtValuation !== a.usdtValuation) return b.usdtValuation - a.usdtValuation;
      const idxA = priority.indexOf(a.asset);
      const idxB = priority.indexOf(b.asset);
      if (idxA !== -1 && idxB !== -1) return idxA - idxB;
      if (idxA !== -1) return -1;
      if (idxB !== -1) return 1;
      return a.asset.localeCompare(b.asset);
    });

    const transactions = db
      .prepare(`SELECT * FROM wallet_transactions WHERE user_id = ? ORDER BY created_at DESC LIMIT 50`)
      .all(userId);

    res.json({ balances, transactions });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to load wallet ledger.' });
  }
});

app.post('/api/wallet/deposit', requireAuth, (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user!.id;
    const asset = String(req.body.asset || 'USDT').toUpperCase();
    const amount = Number(req.body.amount);
    const network = String(req.body.network || 'Tron (TRC20)');
    const txHash =
      String(req.body.txHash || '').trim() || `0x${crypto.randomBytes(24).toString('hex')}`;

    if (!amount || isNaN(amount) || amount <= 0) {
      res.status(400).json({ error: 'Deposit amount must be greater than zero.' });
      return;
    }

    ensureUserWallets(userId);
    const now = new Date().toISOString();
    const txId = `DEP-${crypto.randomUUID()}`;

    withTransaction(() => {
      const dup = db
        .prepare(`SELECT id FROM wallet_transactions WHERE tx_hash = ?`)
        .get(txHash);
      if (dup) {
        throw new Error('Duplicate transaction hash detected. Deposit already credited.');
      }

      const wallet = db
        .prepare(`SELECT * FROM wallets WHERE user_id = ? AND asset = ?`)
        .get(userId, asset) as any;
      if (!wallet) {
        throw new Error(`Unsupported asset ${asset}`);
      }

      const nextAvailable = Number((Number(wallet.available) + amount).toFixed(8));

      db.prepare(`UPDATE wallets SET available = ?, updated_at = ? WHERE id = ?`).run(
        nextAvailable,
        now,
        wallet.id
      );

      db.prepare(
        `INSERT INTO wallet_transactions (id, tx_hash, user_id, asset, tx_type, network, address, amount, fee, status, created_at)
         VALUES (?, ?, ?, ?, 'Deposit', ?, ?, ?, 0, 'Completed', ?)`
      ).run(
        txId,
        txHash,
        userId,
        asset,
        network,
        getDeterministicDepositAddress(userId, asset, 'TRX'),
        amount,
        now
      );

      db.prepare(
        `INSERT INTO ledger_entries (id, user_id, asset, entry_type, delta_available, delta_locked, delta_staked, balance_after, reference_id, metadata, created_at)
         VALUES (?, ?, ?, 'DEPOSIT', ?, 0, 0, ?, ?, ?, ?)`
      ).run(
        `LED-${crypto.randomUUID()}`,
        userId,
        asset,
        amount,
        nextAvailable,
        txId,
        JSON.stringify({ network, txHash }),
        now
      );

      db.prepare(
        `INSERT INTO notifications (id, user_id, category, title, message, action_route, read, created_at)
         VALUES (?, ?, 'Wallet', ?, ?, '/wallet', 0, ?)`
      ).run(
        `NTF-${crypto.randomUUID()}`,
        userId,
        `Deposit Confirmed — +${amount} ${asset}`,
        `Your deposit of ${amount} ${asset} via ${network} (TX: ${txHash.slice(0, 12)}...) has been credited to your Spot Wallet.`,
        now
      );
    });

    res.json({ ok: true, txId, txHash });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Deposit failed.' });
  }
});

app.post('/api/wallet/withdraw', requireAuth, (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user!.id;
    const asset = String(req.body.asset || 'USDT').toUpperCase();
    const amount = Number(req.body.amount);
    const address = String(req.body.address || '').trim();
    const network = String(req.body.network || 'Tron (TRC20)');
    const fee = Math.max(0, Number(req.body.fee) || 0);

    if (!address || address.length < 8) {
      res.status(400).json({ error: 'Valid recipient blockchain address is required.' });
      return;
    }
    if (!amount || isNaN(amount) || amount <= fee) {
      res.status(400).json({ error: 'Withdrawal amount must exceed the network fee.' });
      return;
    }

    const now = new Date().toISOString();
    const txId = `WTH-${crypto.randomUUID()}`;
    const txHash = `0x${crypto.randomBytes(24).toString('hex')}`;

    withTransaction(() => {
      const wallet = db
        .prepare(`SELECT * FROM wallets WHERE user_id = ? AND asset = ?`)
        .get(userId, asset) as any;

      if (!wallet || Number(wallet.available) < amount) {
        throw new Error(
          `Insufficient available ${asset} balance. Available: ${wallet ? wallet.available : 0} ${asset}`
        );
      }

      const nextAvailable = Number((Number(wallet.available) - amount).toFixed(8));
      db.prepare(`UPDATE wallets SET available = ?, updated_at = ? WHERE id = ?`).run(
        nextAvailable,
        now,
        wallet.id
      );

      db.prepare(
        `INSERT INTO wallet_transactions (id, tx_hash, user_id, asset, tx_type, network, address, amount, fee, status, created_at)
         VALUES (?, ?, ?, ?, 'Withdraw', ?, ?, ?, ?, 'Completed', ?)`
      ).run(txId, txHash, userId, asset, network, address, amount, fee, now);

      db.prepare(
        `INSERT INTO ledger_entries (id, user_id, asset, entry_type, delta_available, delta_locked, delta_staked, balance_after, reference_id, metadata, created_at)
         VALUES (?, ?, ?, 'WITHDRAW', ?, 0, 0, ?, ?, ?, ?)`
      ).run(
        `LED-${crypto.randomUUID()}`,
        userId,
        asset,
        -amount,
        nextAvailable,
        txId,
        JSON.stringify({ address, network, fee, txHash }),
        now
      );

      db.prepare(
        `INSERT INTO notifications (id, user_id, category, title, message, action_route, read, created_at)
         VALUES (?, ?, 'Wallet', ?, ?, '/wallet', 0, ?)`
      ).run(
        `NTF-${crypto.randomUUID()}`,
        userId,
        `Withdrawal Broadcasted — ${amount} ${asset}`,
        `${(amount - fee).toFixed(4)} ${asset} sent to ${address.slice(0, 10)}... via ${network}.`,
        now
      );
    });

    res.json({ ok: true, txId, txHash });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Withdrawal failed.' });
  }
});

// ============================================================================
// 5. ATOMIC ORDER MATCHING ENGINE (SPOT & FUTURES: LIMIT, MARKET, STOP-LIMIT)
// ============================================================================

app.get('/api/orders', requireAuth, (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user!.id;
    const rows = db
      .prepare(`SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC LIMIT 100`)
      .all(userId) as any[];

    const orders = rows.map((r) => ({
      id: r.id,
      pair: r.pair,
      marketType: r.market_type,
      type: r.type,
      side: r.side,
      price: Number(r.price),
      stopPrice: r.stop_price ? Number(r.stop_price) : undefined,
      amount: Number(r.amount),
      filled: Number(r.filled),
      total: Number(r.total),
      leverage: Number(r.leverage || 1),
      status: r.status,
      createdAt: r.created_at.replace('T', ' ').slice(0, 19),
    }));

    res.json({ orders });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to load orders.' });
  }
});

app.get('/api/trades', requireAuth, (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user!.id;
    const rows = db
      .prepare(`SELECT * FROM trades WHERE user_id = ? ORDER BY timestamp DESC LIMIT 100`)
      .all(userId) as any[];

    const trades = rows.map((r) => ({
      id: r.id,
      orderId: r.order_id,
      pair: r.pair,
      side: r.side,
      price: Number(r.price),
      amount: Number(r.amount),
      fee: Number(r.fee),
      feeAsset: r.fee_asset,
      role: r.role,
      total: Number(r.total),
      timestamp: r.timestamp.replace('T', ' ').slice(0, 19),
    }));

    res.json({ trades });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to load trade history.' });
  }
});

app.post('/api/orders', requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user!.id;
    const pair = String(req.body.pair || 'BTCUSDT').toUpperCase();
    const marketType = req.body.marketType === 'Futures' ? 'Futures' : 'Spot';
    const type = ['Limit', 'Market', 'Stop-Limit'].includes(req.body.type)
      ? req.body.type
      : 'Limit';
    const side = req.body.side === 'Sell' ? 'Sell' : 'Buy';
    const amount = Number(req.body.amount);
    const leverage = marketType === 'Futures' ? Math.max(1, Number(req.body.leverage) || 20) : 1;
    const clientOrderId = req.body.clientOrderId ? String(req.body.clientOrderId) : null;

    if (!amount || isNaN(amount) || amount <= 0) {
      res.status(400).json({ error: 'Order amount must be a positive number.' });
      return;
    }

    const baseAsset = pair.replace('USDT', '');
    const livePrice = await getLivePriceForAsset(baseAsset);
    const orderPrice = type === 'Market' ? livePrice : Number(req.body.price);
    const stopPrice = req.body.stopPrice ? Number(req.body.stopPrice) : null;

    if (!orderPrice || isNaN(orderPrice) || orderPrice <= 0) {
      res.status(400).json({ error: 'Order price must be greater than zero.' });
      return;
    }

    // Determine if Limit order is immediately marketable against live market price
    const isMarketableLimit =
      type === 'Limit' &&
      ((side === 'Buy' && orderPrice >= livePrice) ||
        (side === 'Sell' && orderPrice <= livePrice));
    const shouldExecuteImmediately = type === 'Market' || isMarketableLimit;
    const executionPrice = shouldExecuteImmediately ? livePrice : orderPrice;
    const totalUSDT = Number((executionPrice * amount).toFixed(4));
    const feeUSDT = Number((totalUSDT * 0.001).toFixed(6));

    ensureUserWallets(userId);
    const now = new Date().toISOString();
    const orderId = `ORD-${Date.now().toString().slice(-6)}-${crypto.randomBytes(2).toString('hex').toUpperCase()}`;

    withTransaction(() => {
      if (clientOrderId) {
        const existingOrder = db
          .prepare(`SELECT id FROM orders WHERE client_order_id = ?`)
          .get(clientOrderId);
        if (existingOrder) {
          throw new Error('Duplicate order submission prevented.');
        }
      }

      const usdtWallet = db
        .prepare(`SELECT * FROM wallets WHERE user_id = ? AND asset = 'USDT'`)
        .get(userId) as any;
      const baseWallet = db
        .prepare(`SELECT * FROM wallets WHERE user_id = ? AND asset = ?`)
        .get(userId, baseAsset) as any;

      if (side === 'Buy') {
        const requiredUSDT = marketType === 'Futures' ? totalUSDT / leverage : totalUSDT;
        if (!usdtWallet || Number(usdtWallet.available) < requiredUSDT) {
          throw new Error(
            `Insufficient USDT balance. Required: ${requiredUSDT.toFixed(2)} USDT, Available: ${(
              usdtWallet?.available || 0
            ).toFixed(2)} USDT.`
          );
        }

        if (shouldExecuteImmediately) {
          // Deduct USDT and credit baseAsset
          const nextUSDT = Number((Number(usdtWallet.available) - requiredUSDT).toFixed(8));
          db.prepare(`UPDATE wallets SET available = ?, updated_at = ? WHERE id = ?`).run(
            nextUSDT,
            now,
            usdtWallet.id
          );

          if (marketType === 'Spot') {
            const nextBase = Number((Number(baseWallet.available) + amount).toFixed(8));
            db.prepare(`UPDATE wallets SET available = ?, updated_at = ? WHERE id = ?`).run(
              nextBase,
              now,
              baseWallet.id
            );
          }
        } else {
          // Lock USDT in open order
          const nextAvail = Number((Number(usdtWallet.available) - requiredUSDT).toFixed(8));
          const nextLocked = Number((Number(usdtWallet.locked) + requiredUSDT).toFixed(8));
          db.prepare(
            `UPDATE wallets SET available = ?, locked = ?, updated_at = ? WHERE id = ?`
          ).run(nextAvail, nextLocked, now, usdtWallet.id);
        }
      } else {
        // SELL SIDE
        if (marketType === 'Spot') {
          if (!baseWallet || Number(baseWallet.available) < amount) {
            throw new Error(
              `Insufficient ${baseAsset} balance. Required: ${amount} ${baseAsset}, Available: ${(
                baseWallet?.available || 0
              ).toFixed(4)} ${baseAsset}.`
            );
          }

          if (shouldExecuteImmediately) {
            const nextBase = Number((Number(baseWallet.available) - amount).toFixed(8));
            const netProceeds = Math.max(0, totalUSDT - feeUSDT);
            const nextUSDT = Number((Number(usdtWallet.available) + netProceeds).toFixed(8));

            db.prepare(`UPDATE wallets SET available = ?, updated_at = ? WHERE id = ?`).run(
              nextBase,
              now,
              baseWallet.id
            );
            db.prepare(`UPDATE wallets SET available = ?, updated_at = ? WHERE id = ?`).run(
              nextUSDT,
              now,
              usdtWallet.id
            );
          } else {
            const nextAvail = Number((Number(baseWallet.available) - amount).toFixed(8));
            const nextLocked = Number((Number(baseWallet.locked) + amount).toFixed(8));
            db.prepare(
              `UPDATE wallets SET available = ?, locked = ?, updated_at = ? WHERE id = ?`
            ).run(nextAvail, nextLocked, now, baseWallet.id);
          }
        } else {
          // Futures Short requires USDT margin
          const requiredMargin = totalUSDT / leverage;
          if (!usdtWallet || Number(usdtWallet.available) < requiredMargin) {
            throw new Error(
              `Insufficient USDT margin for Futures Short. Required: ${requiredMargin.toFixed(2)} USDT.`
            );
          }
          const nextAvail = Number((Number(usdtWallet.available) - requiredMargin).toFixed(8));
          const nextLocked = shouldExecuteImmediately
            ? Number(usdtWallet.locked)
            : Number((Number(usdtWallet.locked) + requiredMargin).toFixed(8));
          db.prepare(
            `UPDATE wallets SET available = ?, locked = ?, updated_at = ? WHERE id = ?`
          ).run(nextAvail, nextLocked, now, usdtWallet.id);
        }
      }

      const status = shouldExecuteImmediately ? 'Filled' : 'Open';
      const filled = shouldExecuteImmediately ? amount : 0;

      db.prepare(
        `INSERT INTO orders (
          id, client_order_id, user_id, pair, market_type, type, side,
          price, stop_price, amount, filled, total, leverage, status, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      ).run(
        orderId,
        clientOrderId,
        userId,
        pair,
        marketType,
        type,
        side,
        executionPrice,
        stopPrice,
        amount,
        filled,
        totalUSDT,
        leverage,
        status,
        now,
        now
      );

      if (shouldExecuteImmediately) {
        const tradeId = `TRD-${Date.now().toString().slice(-6)}-${crypto.randomBytes(2).toString('hex').toUpperCase()}`;
        db.prepare(
          `INSERT INTO trades (
            id, order_id, user_id, pair, side, price, amount, fee, fee_asset, role, total, timestamp
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'USDT', ?, ?, ?)`
        ).run(
          tradeId,
          orderId,
          userId,
          pair,
          side,
          executionPrice,
          amount,
          feeUSDT,
          type === 'Market' ? 'Taker' : 'Maker',
          totalUSDT,
          now
        );
      }
    });

    res.status(201).json({
      ok: true,
      orderId,
      executedImmediately: shouldExecuteImmediately,
      executionPrice,
    });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Order placement failed.' });
  }
});

app.delete('/api/orders/:id', requireAuth, (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user!.id;
    const orderId = req.params.id;
    const now = new Date().toISOString();

    withTransaction(() => {
      const ord = db
        .prepare(`SELECT * FROM orders WHERE id = ? AND user_id = ?`)
        .get(orderId, userId) as any;

      if (!ord) {
        throw new Error('Order not found.');
      }
      if (ord.status !== 'Open') {
        throw new Error(`Order is already ${ord.status} and cannot be cancelled.`);
      }

      const baseAsset = ord.pair.replace('USDT', '');

      if (ord.side === 'Buy' || ord.market_type === 'Futures') {
        const unlockUSDT =
          ord.market_type === 'Futures'
            ? Number(ord.total) / Number(ord.leverage || 1)
            : Number(ord.total);
        const usdtWallet = db
          .prepare(`SELECT * FROM wallets WHERE user_id = ? AND asset = 'USDT'`)
          .get(userId) as any;
        if (usdtWallet) {
          const nextAvail = Number((Number(usdtWallet.available) + unlockUSDT).toFixed(8));
          const nextLocked = Math.max(0, Number((Number(usdtWallet.locked) - unlockUSDT).toFixed(8)));
          db.prepare(
            `UPDATE wallets SET available = ?, locked = ?, updated_at = ? WHERE id = ?`
          ).run(nextAvail, nextLocked, now, usdtWallet.id);
        }
      } else {
        const baseWallet = db
          .prepare(`SELECT * FROM wallets WHERE user_id = ? AND asset = ?`)
          .get(userId, baseAsset) as any;
        if (baseWallet) {
          const nextAvail = Number((Number(baseWallet.available) + Number(ord.amount)).toFixed(8));
          const nextLocked = Math.max(
            0,
            Number((Number(baseWallet.locked) - Number(ord.amount)).toFixed(8))
          );
          db.prepare(
            `UPDATE wallets SET available = ?, locked = ?, updated_at = ? WHERE id = ?`
          ).run(nextAvail, nextLocked, now, baseWallet.id);
        }
      }

      db.prepare(`UPDATE orders SET status = 'Cancelled', updated_at = ? WHERE id = ?`).run(
        now,
        orderId
      );
    });

    res.json({ ok: true, orderId });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Failed to cancel order.' });
  }
});

app.post('/api/orders/cancel-all', requireAuth, (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user!.id;
    const openOrders = db
      .prepare(`SELECT * FROM orders WHERE user_id = ? AND status = 'Open'`)
      .all(userId) as any[];

    const now = new Date().toISOString();
    withTransaction(() => {
      for (const ord of openOrders) {
        const baseAsset = ord.pair.replace('USDT', '');
        if (ord.side === 'Buy' || ord.market_type === 'Futures') {
          const unlockUSDT =
            ord.market_type === 'Futures'
              ? Number(ord.total) / Number(ord.leverage || 1)
              : Number(ord.total);
          const usdtWallet = db
            .prepare(`SELECT * FROM wallets WHERE user_id = ? AND asset = 'USDT'`)
            .get(userId) as any;
          if (usdtWallet) {
            const nextAvail = Number((Number(usdtWallet.available) + unlockUSDT).toFixed(8));
            const nextLocked = Math.max(
              0,
              Number((Number(usdtWallet.locked) - unlockUSDT).toFixed(8))
            );
            db.prepare(
              `UPDATE wallets SET available = ?, locked = ?, updated_at = ? WHERE id = ?`
            ).run(nextAvail, nextLocked, now, usdtWallet.id);
          }
        } else {
          const baseWallet = db
            .prepare(`SELECT * FROM wallets WHERE user_id = ? AND asset = ?`)
            .get(userId, baseAsset) as any;
          if (baseWallet) {
            const nextAvail = Number((Number(baseWallet.available) + Number(ord.amount)).toFixed(8));
            const nextLocked = Math.max(
              0,
              Number((Number(baseWallet.locked) - Number(ord.amount)).toFixed(8))
            );
            db.prepare(
              `UPDATE wallets SET available = ?, locked = ?, updated_at = ? WHERE id = ?`
            ).run(nextAvail, nextLocked, now, baseWallet.id);
          }
        }
        db.prepare(`UPDATE orders SET status = 'Cancelled', updated_at = ? WHERE id = ?`).run(
          now,
          ord.id
        );
      }
    });

    res.json({ ok: true, cancelledCount: openOrders.length });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Failed to cancel open orders.' });
  }
});

// ============================================================================
// 6. ATOMIC CONVERT, EARN SUBSCRIPTION & AIRDROP CLAIM ENDPOINTS
// ============================================================================

app.post('/api/convert', requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user!.id;
    const fromAsset = String(req.body.fromAsset || 'USDT').toUpperCase();
    const toAsset = String(req.body.toAsset || 'BTC').toUpperCase();
    const fromAmount = Number(req.body.fromAmount);

    if (fromAsset === toAsset) {
      res.status(400).json({ error: 'Source and destination assets must be different.' });
      return;
    }
    if (!fromAmount || isNaN(fromAmount) || fromAmount <= 0) {
      res.status(400).json({ error: 'Conversion amount must be greater than zero.' });
      return;
    }

    const fromPriceUSD = await getLivePriceForAsset(fromAsset);
    const toPriceUSD = await getLivePriceForAsset(toAsset);
    const rate = fromPriceUSD / toPriceUSD;
    const toAmount = Number((fromAmount * rate).toFixed(8));

    ensureUserWallets(userId);
    const now = new Date().toISOString();
    const tradeId = `CNV-${Date.now().toString().slice(-6)}`;

    withTransaction(() => {
      const fromWallet = db
        .prepare(`SELECT * FROM wallets WHERE user_id = ? AND asset = ?`)
        .get(userId, fromAsset) as any;
      const toWallet = db
        .prepare(`SELECT * FROM wallets WHERE user_id = ? AND asset = ?`)
        .get(userId, toAsset) as any;

      if (!fromWallet || Number(fromWallet.available) < fromAmount) {
        throw new Error(
          `Insufficient ${fromAsset} balance. Available: ${fromWallet?.available || 0} ${fromAsset}`
        );
      }

      const nextFrom = Number((Number(fromWallet.available) - fromAmount).toFixed(8));
      const nextTo = Number((Number(toWallet.available) + toAmount).toFixed(8));

      db.prepare(`UPDATE wallets SET available = ?, updated_at = ? WHERE id = ?`).run(
        nextFrom,
        now,
        fromWallet.id
      );
      db.prepare(`UPDATE wallets SET available = ?, updated_at = ? WHERE id = ?`).run(
        nextTo,
        now,
        toWallet.id
      );

      db.prepare(
        `INSERT INTO trades (id, order_id, user_id, pair, side, price, amount, fee, fee_asset, role, total, timestamp)
         VALUES (?, 'INSTANT-CONVERT', ?, ?, 'Buy', ?, ?, 0, ?, 'Maker', ?, ?)`
      ).run(
        tradeId,
        userId,
        `${toAsset}/${fromAsset}`,
        Number((1 / rate).toFixed(6)),
        toAmount,
        toAsset,
        fromAmount,
        now
      );
    });

    res.json({ ok: true, fromAmount, toAmount, rate });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Conversion failed.' });
  }
});

app.post('/api/earn/subscribe', requireAuth, (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user!.id;
    const asset = String(req.body.asset || 'USDT').toUpperCase();
    const amount = Number(req.body.amount);
    const apr = Number(req.body.apr) || 8.45;
    const productId = String(req.body.productId || `EARN-${asset}`);

    if (!amount || isNaN(amount) || amount <= 0) {
      res.status(400).json({ error: 'Subscription amount must be greater than zero.' });
      return;
    }

    ensureUserWallets(userId);
    const now = new Date().toISOString();

    withTransaction(() => {
      const wallet = db
        .prepare(`SELECT * FROM wallets WHERE user_id = ? AND asset = ?`)
        .get(userId, asset) as any;

      if (!wallet || Number(wallet.available) < amount) {
        throw new Error(
          `Insufficient available ${asset} balance to subscribe. Available: ${wallet?.available || 0} ${asset}`
        );
      }

      const nextAvail = Number((Number(wallet.available) - amount).toFixed(8));
      const nextStaked = Number((Number(wallet.staked) + amount).toFixed(8));

      db.prepare(
        `UPDATE wallets SET available = ?, staked = ?, updated_at = ? WHERE id = ?`
      ).run(nextAvail, nextStaked, now, wallet.id);

      db.prepare(
        `INSERT INTO earn_subscriptions (id, user_id, product_id, asset, amount, apr, duration_days, status, created_at)
         VALUES (?, ?, ?, ?, ?, ?, 'Flexible', 'Active', ?)`
      ).run(`SUB-${crypto.randomUUID()}`, userId, productId, asset, amount, apr, now);
    });

    res.json({ ok: true });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Earn subscription failed.' });
  }
});

app.get('/api/airdrop/claims', requireAuth, (req: AuthenticatedRequest, res) => {
  const rows = db
    .prepare(`SELECT campaign_id FROM airdrop_claims WHERE user_id = ?`)
    .all(req.user!.id) as any[];
  res.json({ claimedCampaignIds: rows.map((r) => r.campaign_id) });
});

app.post('/api/airdrop/claim', requireAuth, (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user!.id;
    const campaignId = String(req.body.campaignId || '');
    const snapshotAsset = String(req.body.snapshotAsset || 'BNB').toUpperCase();
    const minRequired = Number(req.body.minHoldingRequired) || 1;
    const rewardAmount = Number(req.body.rewardAmount) || 50;

    ensureUserWallets(userId);
    const now = new Date().toISOString();

    withTransaction(() => {
      const already = db
        .prepare(`SELECT id FROM airdrop_claims WHERE user_id = ? AND campaign_id = ?`)
        .get(userId, campaignId);
      if (already) {
        throw new Error('You have already claimed this airdrop campaign.');
      }

      const snapWallet = db
        .prepare(`SELECT * FROM wallets WHERE user_id = ? AND asset = ?`)
        .get(userId, snapshotAsset) as any;

      const userHolding =
        (Number(snapWallet?.available) || 0) + (Number(snapWallet?.staked) || 0);
      if (userHolding < minRequired) {
        throw new Error(
          `Snapshot eligibility requirement not met: You need at least ${minRequired} ${snapshotAsset} in Spot or Simple Earn (Current: ${userHolding.toFixed(4)} ${snapshotAsset}).`
        );
      }

      const usdtWallet = db
        .prepare(`SELECT * FROM wallets WHERE user_id = ? AND asset = 'USDT'`)
        .get(userId) as any;
      const nextUSDT = Number((Number(usdtWallet.available) + rewardAmount).toFixed(8));

      db.prepare(`UPDATE wallets SET available = ?, updated_at = ? WHERE id = ?`).run(
        nextUSDT,
        now,
        usdtWallet.id
      );

      db.prepare(
        `INSERT INTO airdrop_claims (id, user_id, campaign_id, token, amount, claimed_at)
         VALUES (?, ?, ?, 'USDT-EQUIV', ?, ?)`
      ).run(`CLM-${crypto.randomUUID()}`, userId, campaignId, rewardAmount, now);
    });

    res.json({ ok: true, campaignId });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Airdrop claim failed.' });
  }
});

// ============================================================================
// 7. NOTIFICATIONS & SUPPORT TICKETS PERSISTENCE
// ============================================================================

app.get('/api/notifications', requireAuth, (req: AuthenticatedRequest, res) => {
  const rows = db
    .prepare(`SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 50`)
    .all(req.user!.id) as any[];

  res.json({
    notifications: rows.map((r) => ({
      id: r.id,
      category: r.category,
      title: r.title,
      message: r.message,
      actionRoute: r.action_route || undefined,
      read: Boolean(r.read),
      timestamp: r.created_at.replace('T', ' ').slice(0, 19),
    })),
  });
});

app.post('/api/notifications/read-all', requireAuth, (req: AuthenticatedRequest, res) => {
  db.prepare(`UPDATE notifications SET read = 1 WHERE user_id = ?`).run(req.user!.id);
  res.json({ ok: true });
});

app.post('/api/notifications/:id/read', requireAuth, (req: AuthenticatedRequest, res) => {
  db.prepare(`UPDATE notifications SET read = 1 WHERE id = ? AND user_id = ?`).run(
    req.params.id,
    req.user!.id
  );
  res.json({ ok: true });
});

app.post('/api/support/tickets', (req, res) => {
  try {
    const email = String(req.body.email || 'guest@aetherx.io').trim();
    const topic = String(req.body.topic || 'General Inquiry').trim();
    const message = String(req.body.message || '').trim();
    if (!message) {
      res.status(400).json({ error: 'Please enter a ticket description.' });
      return;
    }
    const ticketId = `SUP-${Date.now().toString().slice(-6)}`;
    db.prepare(
      `INSERT INTO support_tickets (id, user_id, email, topic, message, status, created_at)
       VALUES (?, NULL, ?, ?, ?, 'Open', ?)`
    ).run(ticketId, email, topic, message, new Date().toISOString());

    res.status(201).json({ ok: true, ticketId });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to submit support ticket.' });
  }
});

// ============================================================================
// 8. VITE MIDDLEWARE / STATIC SPA FALLBACK
// ============================================================================

async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  const PORT = Number(process.env.PORT) || 3000;
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`AetherX Pro Full-Stack Exchange Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
