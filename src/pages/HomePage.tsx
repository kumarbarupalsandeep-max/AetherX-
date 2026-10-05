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
  QrCode,
  Smartphone,
  Monitor,
  CheckCircle2,
} from 'lucide-react';
import { useExchange } from '../context/ExchangeContext';
import { formatPrice, formatCompactNumber } from '../data/exchangeData';
import { CryptoIcon } from '../components/CryptoIcon';

export const HomePage: React.FC = () => {
  const {
    tickers,
    marketLoading,
    marketError,
    refreshMarkets,
    navigate,
    isAuthenticated,
    openAuthModal,
    balances,
  } = useExchange();
  const [marketTab, setMarketTab] = useState<'popular' | 'new' | 'gainers' | 'volume'>('popular');
  const [heroEmail, setHeroEmail] = useState('');
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [activePlatform, setActivePlatform] = useState<'Mobile' | 'Desktop' | 'Pro'>('Desktop');

  const btcTicker = tickers.find((t) => t.symbol === 'BTCUSDT') || tickers[0];
  const btcPrice = btcTicker?.price || 0;
  const total24hVolume = tickers.reduce((acc, t) => acc + t.quoteVolume24h, 0);

  const displayedTickers = React.useMemo(() => {
    const list = [...tickers];
    if (marketTab === 'new') {
      return list.filter((t) => ['SUI', 'RENDER', 'NEAR', 'ARB', 'AAVE', 'SOL'].includes(t.baseAsset));
    }
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
      q: 'What is a cryptocurrency exchange?',
      a: 'A cryptocurrency exchange is a digital marketplace where users can buy, sell, convert, and trade cryptocurrencies like Bitcoin (BTC), Ethereum (ETH), Tether (USDT), and Solana (SOL). AetherX Pro provides deep order book liquidity across Spot, USDⓈ-M Perpetual Futures, Zero-Fee Convert, and Escrow P2P markets.',
    },
    {
      q: 'What products does AetherX Pro provide?',
      a: 'AetherX Pro offers a complete suite of digital asset products: Spot Trading (350+ pairs), USDⓈ-M Perpetual Futures (up to 125x leverage), P2P Local Fiat Trading (0% fee via UPI, IMPS, SEPA, Zelle), Instant Convert & OTC Block Trading, Simple Earn Flexible/Locked staking vaults, and Megadrop/HODLer token launch airdrops.',
    },
    {
      q: 'How to buy Bitcoin and other cryptocurrencies on AetherX Pro?',
      a: 'You can purchase crypto in minutes using Visa/Mastercard, Apple Pay, or Bank Transfer on the Buy Crypto page, or trade directly with verified peer-to-peer merchants on the P2P Marketplace using your local currency at 0% transaction fee.',
    },
    {
      q: 'How to track cryptocurrency prices and live order books?',
      a: 'Visit the Markets Overview or Spot Trading Terminal at any time — no login is required to inspect live 24-hour tickers, candlestick charts, technical indicators (MA/EMA/BOLL), and real-time order book depth.',
    },
    {
      q: 'How to earn passive income from crypto on AetherX Pro?',
      a: 'Navigate to Simple Earn to subscribe your idle USDT, USDC, BTC, ETH, SOL, or BNB into Flexible or Fixed-Term vaults earning up to 11.40% APR, with automatic eligibility for HODLer Airdrop token distributions.',
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
              AetherX Pro Will List Hyperion ZK (HYPR) with Seed Tag Applied & Open HODLer Airdrop Claims
            </span>
            <span className="hidden md:inline text-[var(--text-muted)]">·</span>
            <span className="hidden md:inline text-[var(--text-muted)] font-mono-num">2026-10-05</span>
          </div>
          <button
            onClick={() => navigate('/announcements')}
            className="text-[#F0B90B] hover:underline font-semibold shrink-0 flex items-center gap-0.5 cursor-pointer"
          >
            More
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Split Hero Section (Exact Binance Reference Layout) */}
      <section className="max-w-7xl mx-auto px-4 lg:px-8 pt-8 pb-14 lg:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Left 7 Columns: Giant User Counter + Headline + Sign-Up Input + 4 Trust Pillars */}
          <div className="lg:col-span-7 space-y-8">
            <div className="space-y-3">
              <div className="font-display text-4xl sm:text-6xl lg:text-[68px] font-extrabold tracking-tight leading-[1.04]">
                <div className="text-[#F0B90B] font-mono-num">254,892,410</div>
                <div className="text-[var(--text-primary)] mt-1">USERS TRUST US</div>
              </div>
              <p className="text-sm sm:text-base text-[var(--text-secondary)] max-w-xl leading-relaxed pt-1">
                Trade Bitcoin, Ethereum, Solana, and 350+ cryptocurrencies on the world's most liquid Spot & Perpetual Futures matching engine.
              </p>
            </div>

            {/* Interactive Onboarding Input Bar or Portfolio Summary */}
            {!isAuthenticated ? (
              <div className="max-w-lg space-y-4">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    openAuthModal('register');
                  }}
                  className="flex flex-col sm:flex-row gap-2.5"
                >
                  <input
                    type="text"
                    value={heroEmail}
                    onChange={(e) => setHeroEmail(e.target.value)}
                    placeholder="Email / Phone number"
                    className="flex-1 px-4 py-3.5 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] hover:border-[#F0B90B]/60 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[#F0B90B]"
                  />
                  <button
                    type="submit"
                    className="px-8 py-3.5 rounded-xl bg-[#FCD535] hover:bg-[#F0B90B] text-[#181A20] font-bold text-sm transition-colors whitespace-nowrap flex items-center justify-center gap-2 cursor-pointer"
                  >
                    Sign Up
                  </button>
                </form>

                {/* Or Continue With / App QR Row */}
                <div className="flex flex-wrap items-center gap-6 pt-2 text-xs text-[var(--text-muted)]">
                  <div className="flex items-center gap-3">
                    <span>Or continue with</span>
                    <button
                      type="button"
                      onClick={() => openAuthModal('register')}
                      className="px-3 py-1.5 rounded-lg bg-[var(--bg-secondary)] hover:bg-[var(--bg-hover)] border border-[var(--border-color)] text-[var(--text-primary)] font-semibold cursor-pointer"
                    >
                      Google
                    </button>
                    <button
                      type="button"
                      onClick={() => openAuthModal('register')}
                      className="px-3 py-1.5 rounded-lg bg-[var(--bg-secondary)] hover:bg-[var(--bg-hover)] border border-[var(--border-color)] text-[var(--text-primary)] font-semibold cursor-pointer"
                    >
                      Apple
                    </button>
                  </div>
                  <div className="flex items-center gap-2">
                    <span>Download App</span>
                    <button
                      type="button"
                      onClick={() => navigate('/trade/spot')}
                      className="p-1.5 rounded-lg bg-[var(--bg-secondary)] hover:bg-[var(--bg-hover)] border border-[var(--border-color)] text-[var(--text-primary)] cursor-pointer"
                      title="Open Trading Terminal"
                    >
                      <QrCode className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-5 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-color)] max-w-xl">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <div className="text-xs text-[var(--text-muted)]">Estimated Portfolio Value</div>
                    <div className="text-2xl font-bold font-mono-num text-[var(--text-primary)] mt-1">
                      ${totalPortfolioUSDT.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      {btcPrice > 0 && (
                        <span className="text-xs font-normal text-[var(--text-muted)] ml-2">
                          ≈ {(totalPortfolioUSDT / btcPrice).toFixed(4)} BTC
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => navigate('/deposit')}
                      className="px-4 py-2.5 rounded-lg bg-[#FCD535] hover:bg-[#F0B90B] text-[#181A20] text-xs font-bold cursor-pointer"
                    >
                      Deposit
                    </button>
                    <button
                      onClick={() => navigate('/trade/spot')}
                      className="px-4 py-2.5 rounded-lg bg-[var(--bg-elevated)] hover:bg-[var(--bg-hover)] border border-[var(--border-color)] text-xs font-bold text-[var(--text-primary)] cursor-pointer"
                    >
                      Trade Now
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Quantitative Exchange Proof Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 pt-6 border-t border-[var(--border-color)]">
              <div>
                <div className="text-xl sm:text-2xl font-bold font-mono-num text-[var(--text-primary)]">
                  {total24hVolume > 0 ? `$${formatCompactNumber(total24hVolume)}` : '—'}
                </div>
                <div className="text-xs text-[var(--text-muted)] mt-0.5">
                  Live 24h volume across tracked pairs
                </div>
              </div>
              <div>
                <div className="text-xl sm:text-2xl font-bold font-mono-num text-[var(--text-primary)]">
                  {tickers.length > 0 ? `${tickers.length} Active` : '—'}
                </div>
                <div className="text-xs text-[var(--text-muted)] mt-0.5">
                  Live Spot & Futures pairs
                </div>
              </div>
              <div>
                <div className="text-xl sm:text-2xl font-bold font-mono-num text-[var(--text-primary)]">
                  100% 1:1
                </div>
                <div className="text-xs text-[var(--text-muted)] mt-0.5">
                  Merkle-tree reserve ratio
                </div>
              </div>
              <div>
                <div className="text-xl sm:text-2xl font-bold font-mono-num text-[#0ECB81]">
                  0.10%
                </div>
                <div className="text-xs text-[var(--text-muted)] mt-0.5">
                  Standard Spot maker/taker fee
                </div>
              </div>
            </div>
          </div>

          {/* Right 5 Columns: Live Market Widget Card + News/Launchpool Card */}
          <div className="lg:col-span-5 space-y-4">
            {/* Live Market Card */}
            <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl p-4 sm:p-5 shadow-lg">
              <div className="flex items-center justify-between pb-3 mb-2 border-b border-[var(--border-color)]">
                <div className="flex items-center gap-4">
                  {(
                    [
                      { id: 'popular', label: 'Popular' },
                      { id: 'new', label: 'New Listing' },
                      { id: 'gainers', label: 'Top Gainers' },
                    ] as const
                  ).map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setMarketTab(tab.id)}
                      className={`text-xs font-bold pb-2 -mb-3.5 transition-colors cursor-pointer ${
                        marketTab === tab.id
                          ? 'text-[var(--text-primary)] border-b-2 border-[#F0B90B]'
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
                  View All Markets
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="space-y-0.5">
                {marketLoading && displayedTickers.length === 0 ? (
                  <div className="py-12 text-center text-xs text-[var(--text-muted)]">
                    Loading live market feed...
                  </div>
                ) : marketError && displayedTickers.length === 0 ? (
                  <div className="py-10 text-center space-y-2">
                    <div className="text-xs font-bold text-[#F6465D]">{marketError}</div>
                    <button
                      onClick={refreshMarkets}
                      className="px-3 py-1.5 rounded bg-[#F0B90B] text-[#181A20] text-xs font-bold cursor-pointer"
                    >
                      Retry Connection
                    </button>
                  </div>
                ) : (
                  displayedTickers.map((t) => {
                    const isUp = t.priceChangePercent >= 0;
                    return (
                      <div
                        key={t.symbol}
                        onClick={() => navigate('/trade/spot', t.symbol)}
                        className="flex items-center justify-between py-2.5 px-2.5 rounded-xl hover:bg-[var(--bg-hover)] transition-colors cursor-pointer"
                      >
                        <div className="flex items-center gap-3">
                          <CryptoIcon symbol={t.baseAsset} size="md" />
                          <div className="flex items-baseline gap-1.5">
                            <span className="text-sm font-bold text-[var(--text-primary)]">
                              {t.baseAsset}
                            </span>
                            <span className="text-xs text-[var(--text-muted)]">{t.name}</span>
                          </div>
                        </div>

                        <div className="text-right font-mono-num text-sm font-semibold text-[var(--text-primary)]">
                          ${formatPrice(t.price)}
                        </div>

                        <div
                          className={`font-mono-num text-xs font-semibold min-w-[68px] text-right ${
                            isUp ? 'text-[#0ECB81]' : 'text-[#F6465D]'
                          }`}
                        >
                          {isUp ? '+' : ''}
                          {t.priceChangePercent.toFixed(2)}%
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* News & Announcements Card (Exact Binance Right-Column Bottom Box) */}
            <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl p-4 sm:p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[var(--text-primary)]">News & Announcements</span>
                <button
                  onClick={() => navigate('/announcements')}
                  className="text-xs text-[var(--text-muted)] hover:text-[#F0B90B] flex items-center gap-0.5 cursor-pointer"
                >
                  View All News
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="space-y-2 text-xs">
                <div
                  onClick={() => navigate('/airdrop')}
                  className="text-[var(--text-secondary)] hover:text-[#F0B90B] truncate cursor-pointer"
                >
                  • Introducing Hyperion ZK (HYPR) on HODLer Airdrops! Subscribe BNB to Simple Earn
                </div>
                <div
                  onClick={() => navigate('/fees')}
                  className="text-[var(--text-secondary)] hover:text-[#F0B90B] truncate cursor-pointer"
                >
                  • Notice on Zero Maker Fee Promotion for All USDC Spot & Margin Trading Pairs
                </div>
                <div
                  onClick={() => navigate('/trade/futures')}
                  className="text-[var(--text-secondary)] hover:text-[#F0B90B] truncate cursor-pointer"
                >
                  • USDⓈ-M Futures Will Launch Perpetual Contracts for SUI & RENDER with 75x Leverage
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trade on the Go — Multi-Platform Terminal Preview Section */}
      <section className="border-y border-[var(--border-color)] bg-[var(--bg-secondary)]/50 py-14 px-4 lg:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Left 7 Columns: Live Interactive Mini-Terminal Preview */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {(['Desktop', 'Mobile', 'Pro'] as const).map((plat) => (
                  <button
                    key={plat}
                    onClick={() => setActivePlatform(plat)}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                      activePlatform === plat
                        ? 'bg-[#F0B90B] text-[#181A20]'
                        : 'bg-[var(--bg-elevated)] text-[var(--text-secondary)]'
                    }`}
                  >
                    {plat} Experience
                  </button>
                ))}
              </div>
              <button
                onClick={() => navigate('/trade/spot', 'BTCUSDT')}
                className="text-xs font-bold text-[#F0B90B] hover:underline flex items-center gap-1 cursor-pointer"
              >
                Launch Full Spot Terminal
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Simulated Desktop/Mobile Terminal Frame */}
            <div className="rounded-2xl bg-[var(--bg-primary)] border border-[var(--border-color)] p-5 shadow-xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[var(--border-color)]">
                <div className="flex items-center gap-3">
                  <CryptoIcon symbol="BTC" size="md" />
                  <div>
                    <div className="text-sm font-bold text-[var(--text-primary)]">
                      BTC/USDT · <span className="text-[#F0B90B]">{activePlatform} Mode</span>
                    </div>
                    <div className="text-xs text-[var(--text-muted)] font-mono-num">
                      24h Vol: $3.11B USDT · Matching Latency &lt; 0.8ms
                    </div>
                  </div>
                </div>
                <div className="text-right font-mono-num">
                  <div className="text-lg font-bold text-[#0ECB81]">
                    ${formatPrice(btcTicker.price)}
                  </div>
                  <div className="text-xs text-[#0ECB81]">
                    +{btcTicker.priceChangePercent.toFixed(2)}%
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div
                  onClick={() => navigate('/trade/spot')}
                  className="p-3.5 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] hover:border-[#F0B90B] cursor-pointer"
                >
                  <div className="font-bold text-[var(--text-primary)]">Spot & Margin</div>
                  <div className="text-[var(--text-muted)] mt-1">
                    Limit, Market, Stop-Limit & OCO orders with deep liquidity.
                  </div>
                </div>
                <div
                  onClick={() => navigate('/trade/futures')}
                  className="p-3.5 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] hover:border-[#F0B90B] cursor-pointer"
                >
                  <div className="font-bold text-[var(--text-primary)]">USDⓈ-M Futures 125x</div>
                  <div className="text-[var(--text-muted)] mt-1">
                    Cross/Isolated leverage with real-time TP/SL risk controls.
                  </div>
                </div>
                <div
                  onClick={() => navigate('/p2p')}
                  className="p-3.5 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] hover:border-[#F0B90B] cursor-pointer"
                >
                  <div className="font-bold text-[var(--text-primary)]">P2P 0% Fee Desk</div>
                  <div className="text-[var(--text-muted)] mt-1">
                    Instant local fiat settlement via UPI, IMPS, SEPA & Zelle.
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right 5 Columns: QR Code & Multi-Device Download */}
          <div className="lg:col-span-5 space-y-5">
            <h2 className="font-display text-2xl sm:text-4xl font-bold text-[var(--text-primary)]">
              Trade on the Go. Anywhere, Anytime.
            </h2>
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
              Stay connected to global markets across iOS, Android, macOS, Windows, and Linux with synchronized watchlists and instant price alerts.
            </p>

            <div className="p-4 rounded-2xl bg-[var(--bg-primary)] border border-[var(--border-color)] flex items-center gap-4">
              <div className="w-20 h-20 rounded-xl bg-white p-2 flex items-center justify-center shrink-0">
                <QrCode className="w-16 h-16 text-[#181A20]" />
              </div>
              <div>
                <div className="text-xs text-[var(--text-muted)]">Scan to Download App</div>
                <div className="text-base font-bold text-[var(--text-primary)] mt-0.5">
                  iOS and Android
                </div>
                <div className="text-xs text-[#F0B90B] mt-1">
                  Biometric Passkey & Instant Order Execution
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 text-center text-xs">
              <button
                onClick={() => navigate('/trade/spot')}
                className="p-3 rounded-xl bg-[var(--bg-primary)] hover:bg-[var(--bg-hover)] border border-[var(--border-color)] font-semibold text-[var(--text-primary)] cursor-pointer"
              >
                macOS
              </button>
              <button
                onClick={() => navigate('/trade/spot')}
                className="p-3 rounded-xl bg-[var(--bg-primary)] hover:bg-[var(--bg-hover)] border border-[var(--border-color)] font-semibold text-[var(--text-primary)] cursor-pointer"
              >
                Windows
              </button>
              <button
                onClick={() => navigate('/api-docs')}
                className="p-3 rounded-xl bg-[var(--bg-primary)] hover:bg-[var(--bg-hover)] border border-[var(--border-color)] font-semibold text-[var(--text-primary)] cursor-pointer"
              >
                Linux / API
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Accordion (Exact Numbered Format) */}
      <section className="max-w-5xl mx-auto py-14 px-4 lg:px-8">
        <h2 className="font-display text-2xl sm:text-3xl font-bold text-[var(--text-primary)] mb-8 text-center">
          Frequently Asked Questions
        </h2>
        <div className="space-y-2">
          {faqs.map((item, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div
                key={idx}
                className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)]/50 px-5 py-4"
              >
                <button
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="w-full flex items-center justify-between text-left gap-4 cursor-pointer"
                >
                  <span className="text-sm sm:text-base font-bold text-[var(--text-primary)] flex items-center gap-3">
                    <span className="w-6 h-6 rounded-md bg-[var(--bg-elevated)] border border-[var(--border-color)] font-mono-num text-xs flex items-center justify-center text-[var(--text-secondary)]">
                      {idx + 1}
                    </span>
                    {item.q}
                  </span>
                  <span className="text-lg font-mono-num text-[#F0B90B]">
                    {isOpen ? '−' : '+'}
                  </span>
                </button>
                {isOpen && (
                  <p className="mt-3 pl-9 text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
                    {item.a}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Bottom Yellow CTA Banner ("Start earning today") */}
      <section className="bg-[var(--bg-secondary)] border-t border-[var(--border-color)] py-14 px-4 text-center">
        <div className="max-w-2xl mx-auto space-y-6">
          <h2 className="font-display text-2xl sm:text-4xl font-bold text-[var(--text-primary)]">
            Start Earning Today
          </h2>
          <div className="flex items-center justify-center gap-3">
            {!isAuthenticated ? (
              <button
                onClick={() => openAuthModal('register')}
                className="px-8 py-3.5 rounded-xl bg-[#FCD535] hover:bg-[#F0B90B] text-[#181A20] font-bold text-sm transition-colors cursor-pointer"
              >
                Sign Up Now
              </button>
            ) : (
              <button
                onClick={() => navigate('/trade/spot')}
                className="px-8 py-3.5 rounded-xl bg-[#FCD535] hover:bg-[#F0B90B] text-[#181A20] font-bold text-sm transition-colors cursor-pointer"
              >
                Trade Now
              </button>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};
