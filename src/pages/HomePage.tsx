import React, { useState } from 'react';
import {
  ArrowRight,
  ShieldCheck,
  Zap,
  Globe,
  Lock,
  TrendingUp,
  ChevronRight,
  Volume2,
  Repeat,
  Gift,
  Users,
  Layers,
  Headphones,
} from 'lucide-react';
import { useExchange } from '../context/ExchangeContext';
import { formatPrice, formatCompactNumber } from '../data/exchangeData';

export const HomePage: React.FC = () => {
  const { tickers, navigate, isAuthenticated, openAuthModal, balances } = useExchange();
  const [marketTab, setMarketTab] = useState<'popular' | 'gainers' | 'volume'>('popular');
  const [heroEmail, setHeroEmail] = useState('');
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const btcTicker = tickers.find((t) => t.symbol === 'BTCUSDT') || tickers[0];

  const displayedTickers = React.useMemo(() => {
    const list = [...tickers];
    if (marketTab === 'gainers') {
      return list.sort((a, b) => b.priceChangePercent - a.priceChangePercent).slice(0, 6);
    }
    if (marketTab === 'volume') {
      return list.sort((a, b) => b.quoteVolume24h - a.quoteVolume24h).slice(0, 6);
    }
    return list.slice(0, 6);
  }, [tickers, marketTab]);

  const totalPortfolioUSDT = balances.reduce((acc, b) => acc + b.usdtValuation, 0);

  const faqs = [
    {
      q: 'How does AetherX Pro protect user funds and maintain 1:1 reserves?',
      a: 'Every account asset on AetherX Pro is backed at least 1:1 in segregated multi-signature cold storage. Users can verify their individual account inclusion at any time using our cryptographic Merkle-tree Proof of Reserves portal, alongside our $1.0B SAFU emergency protection fund.',
    },
    {
      q: 'Can I browse markets, order books, and live charts without logging in?',
      a: 'Yes. Over 80% of AetherX Pro — including real-time Markets, Spot & Futures candlestick terminals, Order Books, P2P merchant listings, Simple Earn APR vaults, and Airdrop snapshots — is publicly accessible without an account. Authentication is only required when placing orders, depositing, or withdrawing.',
    },
    {
      q: 'What are the Spot and Futures trading fees on AetherX Pro?',
      a: 'Regular Spot trading starts at 0.10% Maker / 0.10% Taker (with 25% discount when holding ecosystem tokens, and 0% Maker fees on USDC pairs). USDⓈ-M Perpetual Futures start at 0.02% Maker / 0.05% Taker.',
    },
    {
      q: 'How do I buy crypto with local currency (USD, INR, EUR, GBP)?',
      a: 'Navigate to Buy Crypto for instant Visa/Mastercard/Apple Pay settlement, or use the P2P Trading marketplace to buy and sell USDT, BTC, and ETH directly with verified merchants via UPI, IMPS, SEPA Instant, Zelle, and bank transfer at 0% platform fee.',
    },
  ];

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)]">
      {/* Top Announcement Bar */}
      <div className="bg-[var(--bg-secondary)] border-b border-[var(--border-color)] px-4 lg:px-8 py-2">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <Volume2 className="w-3.5 h-3.5 text-[#F0B90B] shrink-0" />
            <span className="text-[var(--text-secondary)] truncate">
              [Launchpool & HODLer Airdrop] Hyperion ZK (HYPR) Snapshot Live — Stake BNB or SOL in Simple Earn to Claim Rewards
            </span>
            <span className="hidden md:inline text-[var(--text-muted)]">·</span>
            <span className="hidden md:inline text-[var(--text-muted)]">10-05</span>
          </div>
          <button
            onClick={() => navigate('/announcements')}
            className="text-[#F0B90B] hover:underline font-medium shrink-0 flex items-center gap-0.5 cursor-pointer"
          >
            More
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Split Hero Section */}
      <section className="max-w-7xl mx-auto px-4 lg:px-8 pt-10 pb-14 lg:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Left 7 Columns: Value Prop + CTA + Quantitative Metrics */}
          <div className="lg:col-span-7 space-y-8">
            <div className="space-y-4">
              <div className="text-xs font-medium text-[#F0B90B] tracking-wide">
                INSTITUTIONAL DIGITAL ASSET EXCHANGE · 1:1 PROOF OF RESERVES
              </div>
              <h1 className="font-display text-3xl sm:text-5xl lg:text-[54px] font-bold tracking-tight leading-[1.08] text-[var(--text-primary)]">
                Trade <span className="text-[#F0B90B]">350+ Cryptocurrencies</span> with Deep Institutional Liquidity
              </h1>
              <p className="text-base text-[var(--text-secondary)] max-w-xl leading-relaxed">
                Execute Spot, 125x USDⓈ-M Perpetuals, Zero-Fee Conversions, and Escrow P2P settlements on an ultra-low-latency matching engine trusted globally.
              </p>
            </div>

            {/* Interactive Onboarding / Portfolio Box */}
            {!isAuthenticated ? (
              <div className="max-w-lg space-y-3">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    openAuthModal('register');
                  }}
                  className="flex flex-col sm:flex-row gap-2.5"
                >
                  <input
                    type="email"
                    value={heroEmail}
                    onChange={(e) => setHeroEmail(e.target.value)}
                    placeholder="Enter Email or Phone Number"
                    className="flex-1 px-4 py-3.5 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-color)] text-sm text-[var(--text-primary)] focus:outline-none focus:border-[#F0B90B]"
                  />
                  <button
                    type="submit"
                    className="px-7 py-3.5 rounded-lg bg-[#F0B90B] hover:bg-[#FCD535] text-[#181A20] font-semibold text-sm transition-colors whitespace-nowrap flex items-center justify-center gap-2 cursor-pointer"
                  >
                    Sign Up & Claim $100
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
                <div className="flex flex-wrap items-center gap-4 text-xs text-[var(--text-muted)]">
                  <span>Or continue directly to:</span>
                  <button
                    onClick={() => navigate('/trade/spot', 'BTCUSDT')}
                    className="text-[var(--text-primary)] hover:text-[#F0B90B] font-medium underline underline-offset-4 cursor-pointer"
                  >
                    Spot Terminal (BTC/USDT)
                  </button>
                  <span>·</span>
                  <button
                    onClick={() => navigate('/markets')}
                    className="text-[var(--text-primary)] hover:text-[#F0B90B] font-medium underline underline-offset-4 cursor-pointer"
                  >
                    Explore All Markets
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-5 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] max-w-xl">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <div className="text-xs text-[var(--text-muted)]">Estimated Portfolio Balance</div>
                    <div className="text-2xl font-bold font-mono-num text-[var(--text-primary)] mt-1">
                      ${totalPortfolioUSDT.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      <span className="text-xs font-normal text-[var(--text-muted)] ml-2">
                        ≈ {(totalPortfolioUSDT / btcTicker.price).toFixed(4)} BTC
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => navigate('/deposit')}
                      className="px-4 py-2 rounded-lg bg-[#F0B90B] hover:bg-[#FCD535] text-[#181A20] text-xs font-semibold cursor-pointer"
                    >
                      Deposit
                    </button>
                    <button
                      onClick={() => navigate('/trade/spot')}
                      className="px-4 py-2 rounded-lg bg-[var(--bg-elevated)] hover:bg-[var(--bg-hover)] border border-[var(--border-color)] text-xs font-semibold text-[var(--text-primary)] cursor-pointer"
                    >
                      Trade Spot
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Quantitative Exchange Proof Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 pt-4 border-t border-[var(--border-color)]">
              <div>
                <div className="text-xl sm:text-2xl font-bold font-mono-num text-[var(--text-primary)]">
                  $76.4B
                </div>
                <div className="text-xs text-[var(--text-muted)] mt-0.5">24h Trading Volume</div>
              </div>
              <div>
                <div className="text-xl sm:text-2xl font-bold font-mono-num text-[var(--text-primary)]">
                  350+
                </div>
                <div className="text-xs text-[var(--text-muted)] mt-0.5">Listed Spot & Futures Pairs</div>
              </div>
              <div>
                <div className="text-xl sm:text-2xl font-bold font-mono-num text-[var(--text-primary)]">
                  185M+
                </div>
                <div className="text-xs text-[var(--text-muted)] mt-0.5">Registered Global Traders</div>
              </div>
              <div>
                <div className="text-xl sm:text-2xl font-bold font-mono-num text-[#0ECB81]">
                  &lt; 0.10%
                </div>
                <div className="text-xs text-[var(--text-muted)] mt-0.5">Lowest Tier Trading Fees</div>
              </div>
            </div>
          </div>

          {/* Right 5 Columns: Live Market Widget + Announcement/Airdrop Card */}
          <div className="lg:col-span-5 space-y-4">
            {/* Live Market Card */}
            <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl p-4 sm:p-5">
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-[var(--border-color)]">
                <div className="flex items-center gap-4">
                  {(
                    [
                      { id: 'popular', label: 'Popular' },
                      { id: 'gainers', label: 'Top Gainers' },
                      { id: 'volume', label: '24h Volume' },
                    ] as const
                  ).map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setMarketTab(tab.id)}
                      className={`text-xs font-semibold pb-1 transition-colors cursor-pointer ${
                        marketTab === tab.id
                          ? 'text-[#F0B90B] border-b-2 border-[#F0B90B]'
                          : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => navigate('/markets')}
                  className="text-xs text-[var(--text-muted)] hover:text-[#F0B90B] flex items-center gap-0.5 cursor-pointer"
                >
                  View All 350+
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="space-y-1">
                {displayedTickers.map((t) => {
                  const isUp = t.priceChangePercent >= 0;
                  return (
                    <div
                      key={t.symbol}
                      onClick={() => navigate('/trade/spot', t.symbol)}
                      className="flex items-center justify-between py-2.5 px-2.5 rounded-lg hover:bg-[var(--bg-hover)] transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded-full bg-[var(--bg-elevated)] border border-[var(--border-color)] flex items-center justify-center text-xs font-bold text-[#F0B90B]">
                          {t.baseAsset.slice(0, 3)}
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-[var(--text-primary)] flex items-center gap-1.5">
                            {t.baseAsset}
                            <span className="text-xs font-normal text-[var(--text-muted)]">
                              /{t.quoteAsset}
                            </span>
                          </div>
                          <div className="text-[11px] text-[var(--text-muted)]">{t.name}</div>
                        </div>
                      </div>

                      <div className="text-right font-mono-num">
                        <div className="text-sm font-semibold text-[var(--text-primary)]">
                          ${formatPrice(t.price)}
                        </div>
                        <div className="text-[11px] text-[var(--text-muted)]">
                          Vol ${formatCompactNumber(t.quoteVolume24h)}
                        </div>
                      </div>

                      <div
                        className={`font-mono-num text-xs font-semibold min-w-[72px] text-right ${
                          isUp ? 'text-[#0ECB81]' : 'text-[#F6465D]'
                        }`}
                      >
                        {isUp ? '+' : ''}
                        {t.priceChangePercent.toFixed(2)}%
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Featured Launchpool / Earn Callout */}
            <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl p-4 flex items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="text-xs font-medium text-[#0ECB81]">
                  Simple Earn · Flexible & Locked
                </div>
                <div className="text-sm font-semibold text-[var(--text-primary)]">
                  Earn up to 11.40% APR on USDT, SOL & BNB
                </div>
                <div className="text-xs text-[var(--text-muted)]">
                  Principal-protected vaults with automatic HODLer Airdrop eligibility.
                </div>
              </div>
              <button
                onClick={() => navigate('/earn')}
                className="px-3.5 py-2 rounded-lg bg-[var(--bg-elevated)] hover:bg-[var(--bg-hover)] border border-[var(--border-color)] text-xs font-semibold text-[#F0B90B] shrink-0 cursor-pointer"
              >
                Subscribe
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Action Bar: Core Exchange Gateways */}
      <section className="border-y border-[var(--border-color)] bg-[var(--bg-secondary)]/60 py-10 px-4 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 gap-2">
            <div>
              <h2 className="font-display text-xl sm:text-2xl font-bold text-[var(--text-primary)]">
                Complete Digital Asset Ecosystem
              </h2>
              <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-1">
                Direct access to every trading desk, fiat gateway, and yield instrument.
              </p>
            </div>
            <button
              onClick={() => navigate('/sitemap')}
              className="text-xs font-semibold text-[#F0B90B] hover:underline flex items-center gap-1 cursor-pointer"
            >
              View Full Platform Sitemap
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div
              onClick={() => navigate('/trade/spot')}
              className="p-5 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-color)] hover:border-[#F0B90B]/60 transition-colors cursor-pointer flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <TrendingUp className="w-5 h-5 text-[#F0B90B]" />
                  <span className="text-xs text-[var(--text-muted)] font-mono-num">350+ Pairs</span>
                </div>
                <h3 className="text-base font-bold text-[var(--text-primary)]">Spot Trading Terminal</h3>
                <p className="text-xs text-[var(--text-muted)] mt-1.5 leading-relaxed">
                  Real-time candlestick charts, MA7/25/99 indicators, full depth orderbook, and Limit, Market & Stop-Limit execution.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-[var(--border-color)] flex items-center justify-between text-xs font-semibold text-[#F0B90B]">
                <span>Open Spot Terminal</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>

            <div
              onClick={() => navigate('/trade/futures')}
              className="p-5 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-color)] hover:border-[#F0B90B]/60 transition-colors cursor-pointer flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <Zap className="w-5 h-5 text-[#0ECB81]" />
                  <span className="text-xs text-[#0ECB81] font-mono-num">Up to 125x</span>
                </div>
                <h3 className="text-base font-bold text-[var(--text-primary)]">USDⓈ-M Perpetual Futures</h3>
                <p className="text-xs text-[var(--text-muted)] mt-1.5 leading-relaxed">
                  Trade perpetual contracts settled in USDT/USDC with Cross or Isolated margin, live funding countdown, and TP/SL controls.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-[var(--border-color)] flex items-center justify-between text-xs font-semibold text-[#F0B90B]">
                <span>Trade Derivatives</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>

            <div
              onClick={() => navigate('/p2p')}
              className="p-5 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-color)] hover:border-[#F0B90B]/60 transition-colors cursor-pointer flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <Users className="w-5 h-5 text-[#F0B90B]" />
                  <span className="text-xs text-[#0ECB81] font-mono-num">0% Transaction Fee</span>
                </div>
                <h3 className="text-base font-bold text-[var(--text-primary)]">P2P Fiat Marketplace</h3>
                <p className="text-xs text-[var(--text-muted)] mt-1.5 leading-relaxed">
                  Buy and sell USDT, BTC, and ETH using local bank transfers, UPI, IMPS, SEPA, and Zelle with escrow security.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-[var(--border-color)] flex items-center justify-between text-xs font-semibold text-[#F0B90B]">
                <span>Browse P2P Merchants</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>

            <div
              onClick={() => navigate('/convert')}
              className="p-5 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-color)] hover:border-[#F0B90B]/60 transition-colors cursor-pointer flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <Repeat className="w-5 h-5 text-[#0ECB81]" />
                  <span className="text-xs text-[var(--text-muted)] font-mono-num">Zero Slippage</span>
                </div>
                <h3 className="text-base font-bold text-[var(--text-primary)]">Instant Convert & OTC</h3>
                <p className="text-xs text-[var(--text-muted)] mt-1.5 leading-relaxed">
                  Swap assets in one click with guaranteed institutional quotes, zero trading fees, and immediate Spot Wallet settlement.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-[var(--border-color)] flex items-center justify-between text-xs font-semibold text-[#F0B90B]">
                <span>Convert Crypto Now</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>

            <div
              onClick={() => navigate('/earn')}
              className="p-5 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-color)] hover:border-[#F0B90B]/60 transition-colors cursor-pointer flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <Layers className="w-5 h-5 text-[#F0B90B]" />
                  <span className="text-xs text-[#0ECB81] font-mono-num">Up to 11.40% APR</span>
                </div>
                <h3 className="text-base font-bold text-[var(--text-primary)]">Simple Earn & Staking</h3>
                <p className="text-xs text-[var(--text-muted)] mt-1.5 leading-relaxed">
                  Put idle USDT, USDC, BTC, ETH, and SOL to work in Flexible or Locked yield vaults with daily reward distribution.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-[var(--border-color)] flex items-center justify-between text-xs font-semibold text-[#F0B90B]">
                <span>Explore Yield Vaults</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>

            <div
              onClick={() => navigate('/airdrop')}
              className="p-5 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-color)] hover:border-[#F0B90B]/60 transition-colors cursor-pointer flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <Gift className="w-5 h-5 text-[#F0B90B]" />
                  <span className="text-xs text-[#F0B90B] font-mono-num">$11.3M Rewards</span>
                </div>
                <h3 className="text-base font-bold text-[var(--text-primary)]">Megadrop & HODLer Airdrops</h3>
                <p className="text-xs text-[var(--text-muted)] mt-1.5 leading-relaxed">
                  Participate in early token launches and automatic balance snapshot distributions with zero lockup risk.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-[var(--border-color)] flex items-center justify-between text-xs font-semibold text-[#F0B90B]">
                <span>Check Eligibility</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Security & Proof of Reserves Section */}
      <section className="max-w-7xl mx-auto py-14 px-4 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-5 space-y-4">
            <div className="text-xs font-semibold text-[#0ECB81]">
              SECURITY & CUSTODY ARCHITECTURE
            </div>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-[var(--text-primary)]">
              Your Assets Are Backed 1:1 and Protected by $1.0B SAFU
            </h2>
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
              AetherX Pro maintains transparent, on-chain verifiable reserves exceeding 100% across all user balances, reinforced by hardware passkeys and real-time AI risk monitoring.
            </p>
            <div className="pt-2 flex flex-wrap gap-3">
              <button
                onClick={() => navigate('/proof-of-reserves')}
                className="px-4 py-2.5 rounded-lg bg-[#F0B90B] hover:bg-[#FCD535] text-[#181A20] text-xs font-semibold cursor-pointer"
              >
                Verify Proof of Reserves
              </button>
              <button
                onClick={() => navigate('/security')}
                className="px-4 py-2.5 rounded-lg bg-[var(--bg-secondary)] hover:bg-[var(--bg-hover)] border border-[var(--border-color)] text-xs font-semibold text-[var(--text-primary)] cursor-pointer"
              >
                Security Center
              </button>
            </div>
          </div>

          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-5 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] space-y-2">
              <ShieldCheck className="w-6 h-6 text-[#0ECB81]" />
              <div className="text-sm font-bold text-[var(--text-primary)]">
                104.8% BTC Reserve Ratio
              </div>
              <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                Zero-knowledge Merkle tree verification lets every user independently confirm their account balance is held in full custody.
              </p>
            </div>
            <div className="p-5 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] space-y-2">
              <Lock className="w-6 h-6 text-[#F0B90B]" />
              <div className="text-sm font-bold text-[var(--text-primary)]">
                Hardware Passkey & Whitelisting
              </div>
              <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                Multi-factor withdrawal address whitelisting, anti-phishing verification codes, and biometric WebAuthn support.
              </p>
            </div>
            <div className="p-5 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] space-y-2">
              <Globe className="w-6 h-6 text-[#0ECB81]" />
              <div className="text-sm font-bold text-[var(--text-primary)]">
                $1,000,000,000 SAFU Fund
              </div>
              <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                10% of all trading fees are allocated to our Secure Asset Fund for Users in cold public wallets.
              </p>
            </div>
            <div className="p-5 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] space-y-2">
              <Headphones className="w-6 h-6 text-[#F0B90B]" />
              <div className="text-sm font-bold text-[var(--text-primary)]">
                24/7 Dedicated Multilingual Desk
              </div>
              <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                Instant support resolution for deposit tags, P2P escrow disputes, and institutional API onboarding.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Accordion */}
      <section className="max-w-5xl mx-auto pb-16 px-4 lg:px-8">
        <h2 className="font-display text-2xl font-bold text-[var(--text-primary)] mb-6">
          Frequently Asked Questions
        </h2>
        <div className="divide-y divide-[var(--border-color)] border-y border-[var(--border-color)]">
          {faqs.map((item, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div key={idx} className="py-4">
                <button
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="w-full flex items-center justify-between text-left gap-4 py-1 cursor-pointer"
                >
                  <span className="text-sm sm:text-base font-semibold text-[var(--text-primary)]">
                    <span className="font-mono-num text-[var(--text-muted)] mr-3">
                      0{idx + 1}.
                    </span>
                    {item.q}
                  </span>
                  <span className="text-lg font-mono-num text-[#F0B90B]">
                    {isOpen ? '−' : '+'}
                  </span>
                </button>
                {isOpen && (
                  <p className="mt-2.5 pl-8 text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
                    {item.a}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};
