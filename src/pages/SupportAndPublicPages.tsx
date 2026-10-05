import React, { useState } from 'react';
import {
  Bell,
  CheckCheck,
  HelpCircle,
  Send,
  FileText,
  ShieldCheck,
  ArrowUpRight,
  CheckCircle2,
  Lock,
} from 'lucide-react';
import { useExchange } from '../context/ExchangeContext';
import { RoutePath } from '../types/exchange';

export const NotificationsPage: React.FC = () => {
  const { notifications, markNotificationRead, markAllNotificationsRead, navigate } =
    useExchange();
  const [filterCat, setFilterCat] = useState<string>('All');

  const filtered = notifications.filter(
    (n) => filterCat === 'All' || n.category === filterCat
  );

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] py-8 px-4 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[var(--border-color)] pb-4">
          <div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-[var(--text-primary)]">
              Notification Center
            </h1>
            <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-1">
              Real-time alerts for order fills, wallet deposits, security logins, and airdrop snapshots.
            </p>
          </div>
          <button
            onClick={markAllNotificationsRead}
            className="px-4 py-2 rounded-lg bg-[var(--bg-secondary)] hover:bg-[var(--bg-hover)] border border-[var(--border-color)] text-xs font-semibold text-[var(--text-primary)] flex items-center gap-1.5 cursor-pointer"
          >
            <CheckCheck className="w-4 h-4 text-[#F0B90B]" />
            Mark All as Read
          </button>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto">
          {['All', 'Trade', 'Wallet', 'Security', 'Campaign', 'System'].map((cat) => (
            <button
              key={cat}
              onClick={() => setFilterCat(cat)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                filterCat === cat
                  ? 'bg-[#F0B90B] text-[#181A20]'
                  : 'text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl divide-y divide-[var(--border-color)]">
          {filtered.map((item) => (
            <div
              key={item.id}
              onClick={() => {
                markNotificationRead(item.id);
                if (item.actionRoute) navigate(item.actionRoute);
              }}
              className={`p-5 flex items-start justify-between gap-4 hover:bg-[var(--bg-hover)] transition-colors cursor-pointer ${
                !item.read ? 'bg-[#F0B90B]/5' : ''
              }`}
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs">
                  {!item.read && <span className="w-2 h-2 rounded-full bg-[#F0B90B]" />}
                  <span className="font-bold text-[#F0B90B]">{item.category}</span>
                  <span className="text-[var(--text-muted)]">·</span>
                  <span className="text-[var(--text-muted)] font-mono-num">{item.timestamp}</span>
                </div>
                <div className="text-sm font-bold text-[var(--text-primary)]">{item.title}</div>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                  {item.message}
                </p>
              </div>
              {item.actionRoute && (
                <ArrowUpRight className="w-4 h-4 text-[var(--text-muted)] shrink-0 mt-1" />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export const SupportPage: React.FC = () => {
  const { pushToast, navigate } = useExchange();
  const [ticketTopic, setTicketTopic] = useState('Deposit / Withdrawal Recovery');
  const [ticketMessage, setTicketMessage] = useState('');

  const handleTicketSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketMessage.trim()) return;
    pushToast({
      type: 'success',
      title: 'Support Ticket #SUP-84120 Created',
      description: `Our 24/7 specialist desk has received your ${ticketTopic} inquiry.`,
    });
    setTicketMessage('');
  };

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] py-8 px-4 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="space-y-2">
          <div className="text-xs font-semibold text-[#F0B90B]">24/7 HELP & SUPPORT DESK</div>
          <h1 className="font-display text-3xl font-bold text-[var(--text-primary)]">
            How Can We Help You Today?
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-muted)]">
            Self-service account recovery, deposit tag verification, P2P dispute resolution, and priority ticket submission.
          </p>
        </div>

        {/* Self-Service Quick Tools */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              title: 'Reset 2FA / Passkey',
              desc: 'Recover Google Authenticator or hardware security keys',
              path: '/security' as RoutePath,
            },
            {
              title: 'Deposit Not Arrived',
              desc: 'Track TXID confirmations or recover missing memo/tag',
              path: '/deposit' as RoutePath,
            },
            {
              title: 'P2P Order Appeal',
              desc: '24/7 escrow specialist intervention for fiat trades',
              path: '/p2p' as RoutePath,
            },
            {
              title: 'Fee & VIP Tier Inquiry',
              desc: 'Check maker/taker fee discounts and institutional rebates',
              path: '/fees' as RoutePath,
            },
          ].map((card) => (
            <div
              key={card.title}
              onClick={() => navigate(card.path)}
              className="p-5 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] hover:border-[#F0B90B] transition-colors cursor-pointer space-y-1.5"
            >
              <div className="text-sm font-bold text-[var(--text-primary)]">{card.title}</div>
              <p className="text-xs text-[var(--text-muted)] leading-relaxed">{card.desc}</p>
            </div>
          ))}
        </div>

        {/* Priority Support Ticket Form */}
        <form
          onSubmit={handleTicketSubmit}
          className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl p-6 space-y-4 max-w-2xl"
        >
          <h2 className="text-base font-bold text-[var(--text-primary)]">
            Submit a Priority Support Ticket
          </h2>
          <div>
            <label className="block text-xs text-[var(--text-muted)] mb-1">Issue Category</label>
            <select
              value={ticketTopic}
              onChange={(e) => setTicketTopic(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-lg bg-[var(--bg-primary)] border border-[var(--border-color)] text-xs text-[var(--text-primary)]"
            >
              <option>Deposit / Withdrawal Recovery</option>
              <option>P2P Escrow Dispute</option>
              <option>Spot / Futures Order Execution</option>
              <option>KYC & Institutional Verification</option>
              <option>API & WebSocket Rate Limits</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-[var(--text-muted)] mb-1">
              Detailed Description (Include Order ID or TXID if applicable)
            </label>
            <textarea
              rows={4}
              required
              value={ticketMessage}
              onChange={(e) => setTicketMessage(e.target.value)}
              placeholder="Describe your inquiry..."
              className="w-full p-3.5 rounded-lg bg-[var(--bg-primary)] border border-[var(--border-color)] text-xs text-[var(--text-primary)] focus:outline-none focus:border-[#F0B90B]"
            />
          </div>
          <button
            type="submit"
            className="px-6 py-3 rounded-lg bg-[#F0B90B] hover:bg-[#FCD535] text-[#181A20] text-xs font-bold flex items-center gap-2 cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
            Submit Ticket to 24/7 Desk
          </button>
        </form>
      </div>
    </div>
  );
};

export const SitemapPage: React.FC = () => {
  const { navigate, tickers } = useExchange();

  const sections: {
    category: string;
    description: string;
    routes: { name: string; path: RoutePath; access: 'Public' | 'Login Gated' }[];
  }[] = [
    {
      category: 'Markets & Trading Terminals',
      description: 'Real-time order books, candlestick charts, and institutional execution desks.',
      routes: [
        { name: 'Exchange Home', path: '/', access: 'Public' },
        { name: 'Markets Overview', path: '/markets', access: 'Public' },
        { name: 'Spot Trading Terminal', path: '/trade/spot', access: 'Public' },
        { name: 'USDⓈ-M Perpetual Futures (125x)', path: '/trade/futures', access: 'Public' },
        { name: 'Zero-Fee Convert & OTC', path: '/convert', access: 'Public' },
      ],
    },
    {
      category: 'Fiat Gateways & P2P',
      description: 'Buy and sell digital assets using local currencies and escrow merchants.',
      routes: [
        { name: 'Buy & Sell Crypto (Card / Bank)', path: '/buy-crypto', access: 'Public' },
        { name: 'P2P Marketplace (0% Fee)', path: '/p2p', access: 'Public' },
      ],
    },
    {
      category: 'Earn, Launchpool & Growth',
      description: 'Yield vaults, retroactive token airdrops, and commission rebates.',
      routes: [
        { name: 'Simple Earn & Staking Vaults', path: '/earn', access: 'Public' },
        { name: 'Megadrop & HODLer Airdrop Portal', path: '/airdrop', access: 'Public' },
        { name: 'Referral & Affiliate Program (40%)', path: '/referral', access: 'Public' },
      ],
    },
    {
      category: 'Wallets, Orders & Trade History',
      description: 'Portfolio valuation, multi-chain deposits, withdrawals, and order logs.',
      routes: [
        { name: 'Wallet / Assets Overview', path: '/wallet', access: 'Login Gated' },
        { name: 'Deposit Crypto', path: '/deposit', access: 'Login Gated' },
        { name: 'Withdraw Crypto', path: '/withdraw', access: 'Login Gated' },
        { name: 'Open Spot & Futures Orders', path: '/orders', access: 'Login Gated' },
        { name: 'Order History', path: '/order-history', access: 'Login Gated' },
        { name: 'Trade Execution History', path: '/trade-history', access: 'Login Gated' },
      ],
    },
    {
      category: 'Account, Security & Public Transparency',
      description: 'User settings, 2FA, KYC, Proof of Reserves, Fees, and API documentation.',
      routes: [
        { name: 'Account Dashboard', path: '/account', access: 'Login Gated' },
        { name: 'Security & 2FA Settings', path: '/security', access: 'Login Gated' },
        { name: 'Identity Verification (KYC)', path: '/kyc', access: 'Login Gated' },
        { name: 'Notification Center', path: '/notifications', access: 'Public' },
        { name: '24/7 Support Center', path: '/support', access: 'Public' },
        { name: 'VIP & Fee Schedule', path: '/fees', access: 'Public' },
        { name: 'Proof of Reserves (1:1 Audit)', path: '/proof-of-reserves', access: 'Public' },
        { name: 'Exchange Announcements', path: '/announcements', access: 'Public' },
        { name: 'REST & WebSocket API Docs', path: '/api-docs', access: 'Public' },
        { name: 'Platform Sitemap', path: '/sitemap', access: 'Public' },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] py-8 px-4 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="border-b border-[var(--border-color)] pb-4">
          <div className="text-xs font-semibold text-[#F0B90B]">COMPLETE PLATFORM DIRECTORY</div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-[var(--text-primary)] mt-1">
            AetherX Pro Exchange Sitemap
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-1">
            Direct verified links to all 26 exchange modules and 16 live Spot/Futures trading pairs.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {sections.map((sec) => (
            <div
              key={sec.category}
              className="p-6 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] space-y-4"
            >
              <div>
                <h2 className="text-base font-bold text-[var(--text-primary)]">{sec.category}</h2>
                <p className="text-xs text-[var(--text-muted)] mt-0.5">{sec.description}</p>
              </div>
              <div className="divide-y divide-[var(--border-color)]/60">
                {sec.routes.map((r) => (
                  <button
                    key={r.path + r.name}
                    onClick={() => navigate(r.path)}
                    className="w-full py-2.5 flex items-center justify-between text-xs hover:text-[#F0B90B] transition-colors cursor-pointer"
                  >
                    <span className="font-semibold text-[var(--text-primary)] hover:text-[#F0B90B]">
                      {r.name}{' '}
                      <span className="font-mono-num text-[var(--text-muted)] font-normal ml-1">
                        ({r.path})
                      </span>
                    </span>
                    <span
                      className={`text-[11px] font-mono-num ${
                        r.access === 'Public' ? 'text-[#0ECB81]' : 'text-[#F0B90B]'
                      }`}
                    >
                      {r.access}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Direct Links to All Spot Pairs */}
        <div className="p-6 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] space-y-4">
          <h2 className="text-base font-bold text-[var(--text-primary)]">
            Direct Spot & Futures Trading Pairs
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5">
            {tickers.map((t) => (
              <button
                key={t.symbol}
                onClick={() => navigate('/trade/spot', t.symbol)}
                className="p-2.5 rounded-lg bg-[var(--bg-primary)] border border-[var(--border-color)] hover:border-[#F0B90B] text-left transition-colors cursor-pointer"
              >
                <div className="text-xs font-bold text-[var(--text-primary)]">
                  {t.baseAsset}/USDT
                </div>
                <div
                  className={`text-[11px] font-mono-num mt-0.5 ${
                    t.priceChangePercent >= 0 ? 'text-[#0ECB81]' : 'text-[#F6465D]'
                  }`}
                >
                  {t.priceChangePercent >= 0 ? '+' : ''}
                  {t.priceChangePercent.toFixed(2)}%
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export const PublicInfoPage: React.FC<{
  pageType: 'fees' | 'proof-of-reserves' | 'announcements' | 'api-docs';
}> = ({ pageType }) => {
  const { navigate } = useExchange();

  if (pageType === 'fees') {
    const tiers = [
      { tier: 'Regular User', vol30d: '< $1,000,000', spotMaker: '0.1000%', spotTaker: '0.1000%', futMaker: '0.0200%', futTaker: '0.0500%' },
      { tier: 'VIP 1', vol30d: '≥ $1,000,000', spotMaker: '0.0750%', spotTaker: '0.0750%', futMaker: '0.0160%', futTaker: '0.0400%' },
      { tier: 'VIP 2', vol30d: '≥ $5,000,000', spotMaker: '0.0600%', spotTaker: '0.0700%', futMaker: '0.0140%', futTaker: '0.0350%' },
      { tier: 'VIP 3', vol30d: '≥ $20,000,000', spotMaker: '0.0400%', spotTaker: '0.0600%', futMaker: '0.0120%', futTaker: '0.0320%' },
      { tier: 'Institutional MM', vol30d: '≥ $100,000,000', spotMaker: '0.0000%', spotTaker: '0.0300%', futMaker: '-0.0050%', futTaker: '0.0250%' },
    ];
    return (
      <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] py-8 px-4 lg:px-8">
        <div className="max-w-6xl mx-auto space-y-6">
          <div>
            <div className="text-xs font-semibold text-[#F0B90B]">TRANSPARENT FEE SCHEDULE</div>
            <h1 className="font-display text-3xl font-bold text-[var(--text-primary)] mt-1">
              VIP & Trading Fee Rates
            </h1>
            <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-1">
              Enjoy 0% Maker fees on USDC pairs, 0% fees on P2P & Convert, and institutional rebates on USDⓈ-M Perpetuals.
            </p>
          </div>

          <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl overflow-hidden">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[var(--border-color)] text-[11px] text-[var(--text-muted)]">
                  <th className="py-3.5 px-4">VIP Level</th>
                  <th className="py-3.5 px-4">30d Trade Volume (USDT)</th>
                  <th className="py-3.5 px-4 text-right">Spot Maker</th>
                  <th className="py-3.5 px-4 text-right">Spot Taker</th>
                  <th className="py-3.5 px-4 text-right">Futures Maker</th>
                  <th className="py-3.5 px-4 text-right">Futures Taker</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-color)]/60 font-mono-num">
                {tiers.map((t) => (
                  <tr key={t.tier} className="hover:bg-[var(--bg-hover)]">
                    <td className="py-3.5 px-4 font-sans font-bold text-[#F0B90B]">{t.tier}</td>
                    <td className="py-3.5 px-4">{t.vol30d}</td>
                    <td className="py-3.5 px-4 text-right text-[#0ECB81]">{t.spotMaker}</td>
                    <td className="py-3.5 px-4 text-right">{t.spotTaker}</td>
                    <td className="py-3.5 px-4 text-right text-[#0ECB81]">{t.futMaker}</td>
                    <td className="py-3.5 px-4 text-right">{t.futTaker}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  if (pageType === 'proof-of-reserves') {
    const reserves = [
      { asset: 'BTC', userNetBalances: '412,840 BTC', onChainCustody: '432,656 BTC', ratio: '104.80%' },
      { asset: 'ETH', userNetBalances: '3,890,100 ETH', onChainCustody: '4,022,363 ETH', ratio: '103.40%' },
      { asset: 'USDT', userNetBalances: '18,420,000,000 USDT', onChainCustody: '19,746,240,000 USDT', ratio: '107.20%' },
      { asset: 'SOL', userNetBalances: '28,450,000 SOL', onChainCustody: '29,588,000 SOL', ratio: '104.00%' },
    ];
    return (
      <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] py-8 px-4 lg:px-8">
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="space-y-2">
            <div className="text-xs font-semibold text-[#0ECB81]">
              CRYPTOGRAPHIC MERKLE TREE AUDIT · 1:1 CUSTODY
            </div>
            <h1 className="font-display text-3xl font-bold text-[var(--text-primary)]">
              Proof of Reserves (PoR)
            </h1>
            <p className="text-xs sm:text-sm text-[var(--text-muted)] max-w-2xl">
              We hold all user assets 1:1 (plus extra reserves) in segregated cold storage. Zero-knowledge zk-SNARK proofs verify that every user account balance is included in the net liability tree.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {reserves.map((r) => (
              <div
                key={r.asset}
                className="p-5 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-base font-bold text-[var(--text-primary)]">{r.asset} Ratio</span>
                  <span className="text-lg font-bold font-mono-num text-[#0ECB81]">{r.ratio}</span>
                </div>
                <div className="text-xs text-[var(--text-muted)] font-mono-num space-y-1 pt-2 border-t border-[var(--border-color)]">
                  <div>Customer Net: {r.userNetBalances}</div>
                  <div>On-Chain Wallet: {r.onChainCustody}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (pageType === 'announcements') {
    return (
      <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] py-8 px-4 lg:px-8">
        <div className="max-w-5xl mx-auto space-y-6">
          <h1 className="font-display text-3xl font-bold text-[var(--text-primary)]">
            Official Exchange Announcements
          </h1>
          <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl divide-y divide-[var(--border-color)]">
            {[
              {
                date: '2026-10-05',
                tag: 'New Listing & Launchpool',
                title: 'AetherX Pro Will List Hyperion ZK (HYPR) and Open HODLer Airdrop Claims',
              },
              {
                date: '2026-10-04',
                tag: 'Zero Fee Promotion',
                title: '0% Maker Fee Extended for All BTC/USDC, ETH/USDC, and SOL/USDC Spot Pairs',
              },
              {
                date: '2026-10-02',
                tag: 'Futures Update',
                title: 'USDⓈ-M Perpetuals Adds 75x Leverage Support for RENDERUSDT and SUIUSDT',
              },
              {
                date: '2026-09-29',
                tag: 'Proof of Reserves',
                title: 'Monthly Merkle-Tree Audit Published: 104.8% BTC and 107.2% USDT Reserve Ratio',
              },
            ].map((a, i) => (
              <div
                key={i}
                onClick={() => navigate('/airdrop')}
                className="p-5 flex items-center justify-between gap-4 hover:bg-[var(--bg-hover)] cursor-pointer"
              >
                <div>
                  <div className="text-xs text-[#F0B90B] font-semibold">
                    {a.tag} · <span className="font-mono-num text-[var(--text-muted)]">{a.date}</span>
                  </div>
                  <div className="text-sm font-bold text-[var(--text-primary)] mt-1">{a.title}</div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-[var(--text-muted)] shrink-0" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] py-8 px-4 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-6">
        <h1 className="font-display text-3xl font-bold text-[var(--text-primary)]">
          Institutional REST & WebSocket API Documentation
        </h1>
        <p className="text-xs sm:text-sm text-[var(--text-muted)]">
          Low-latency market data streams and FIX/REST order execution endpoints for algorithmic traders.
        </p>
        <div className="p-5 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] font-mono-num text-xs space-y-2">
          <div className="text-[#0ECB81]">GET https://api.aetherx.io/api/v3/ticker/24hr</div>
          <div className="text-[#F0B90B]">WSS wss://stream.aetherx.io:9443/ws/btcusdt@depth20@100ms</div>
          <div className="text-[var(--text-secondary)]">
            POST https://api.aetherx.io/api/v3/order (HMAC-SHA256 / Ed25519 Signed)
          </div>
        </div>
      </div>
    </div>
  );
};
