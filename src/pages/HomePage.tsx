import React, { useState, useMemo } from 'react';
import {
  ArrowRight,
  ShieldCheck,
  Zap,
  Globe,
  Lock,
  TrendingUp,
  TrendingDown,
  ChevronRight,
  Volume2,
  Repeat,
  Gift,
  Users,
  Layers,
  Headphones,
  QrCode,
  CheckCircle2,
  CreditCard,
  BarChart3,
  RefreshCw,
  Flame,
  Sparkles,
  FileCheck,
  Search,
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
    toggleFavoritePair,
  } = useExchange();

  // Hero Right-Column Widget State
  const [heroWidgetTab, setHeroWidgetTab] = useState<'popular' | 'new' | 'gainers'>('popular');
  const [heroEmail, setHeroEmail] = useState('');

  // Full Market Overview Table State
  const [tableTab, setTableTab] = useState<'All' | 'Hot' | 'Gainers' | 'Losers' | 'Volume'>('All');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [marketSearch, setMarketSearch] = useState<string>('');

  // Quick Buy / Convert Calculator State (Browsable & Interactive Without Login)
  const [quickSide, setQuickSide] = useState<'Buy' | 'Convert'>('Buy');
  const [quickFiat, setQuickFiat] = useState<'USD' | 'EUR' | 'INR' | 'GBP'>('USD');
  const [quickAsset, setQuickAsset] = useState<string>('BTC');
  const [quickSpend, setQuickSpend] = useState<string>('500');

  // Platform Preview & FAQ State
  const [activePlatform, setActivePlatform] = useState<'Desktop' | 'Mobile' | 'API'>('Desktop');
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  // Derived Real-Time Market Metrics (100% from Live Backend API)
  const btcTicker = useMemo(
    () => tickers.find((t) => t.symbol === 'BTCUSDT') || tickers[0] || null,
    [tickers]
  );
  const ethTicker = useMemo(
    () => tickers.find((t) => t.symbol === 'ETHUSDT') || tickers[1] || null,
    [tickers]
  );

  const total24hVolume = useMemo(
    () => tickers.reduce((acc, t) => acc + t.quoteVolume24h, 0),
    [tickers]
  );

  const totalMarketCap = useMemo(
    () => tickers.reduce((acc, t) => acc + t.marketCap, 0),
    [tickers]
  );

  const heroDisplayedTickers = useMemo(() => {
    const list = [...tickers];
    if (heroWidgetTab === 'new') {
      return list
        .filter((t) => ['SUI', 'RENDER', 'NEAR', 'ARB', 'AAVE', 'SOL'].includes(t.baseAsset))
        .slice(0, 6);
    }
    if (heroWidgetTab === 'gainers') {
      return list.sort((a, b) => b.priceChangePercent - a.priceChangePercent).slice(0, 6);
    }
    return list.slice(0, 6);
  }, [tickers, heroWidgetTab]);

  // 4-Column Market Pulse Cards (Real Calculated Data)
  const hotCoinsList = useMemo(() => tickers.slice(0, 4), [tickers]);
  const topGainersList = useMemo(
    () => [...tickers].sort((a, b) => b.priceChangePercent - a.priceChangePercent).slice(0, 4),
    [tickers]
  );
  const topLosersList = useMemo(
    () => [...tickers].sort((a, b) => a.priceChangePercent - b.priceChangePercent).slice(0, 4),
    [tickers]
  );
  const topVolumeList = useMemo(
    () => [...tickers].sort((a, b) => b.quoteVolume24h - a.quoteVolume24h).slice(0, 4),
    [tickers]
  );

  // Full Market Overview Table Filtering
  const categories = ['All', 'Layer 1', 'Solana', 'AI', 'DeFi', 'Infra', 'Payments'];
  const filteredTableTickers = useMemo(() => {
    let list = [...tickers];
    if (selectedCategory !== 'All') {
      list = list.filter((t) => t.category === selectedCategory);
    }
    if (marketSearch.trim()) {
      const q = marketSearch.toLowerCase();
      list = list.filter(
        (t) =>
          t.symbol.toLowerCase().includes(q) ||
          t.baseAsset.toLowerCase().includes(q) ||
          t.name.toLowerCase().includes(q)
      );
    }
    if (tableTab === 'Hot') {
      list = list.slice(0, 8);
    } else if (tableTab === 'Gainers') {
      list = list.sort((a, b) => b.priceChangePercent - a.priceChangePercent);
    } else if (tableTab === 'Losers') {
      list = list.sort((a, b) => a.priceChangePercent - b.priceChangePercent);
    } else if (tableTab === 'Volume') {
      list = list.sort((a, b) => b.quoteVolume24h - a.quoteVolume24h);
    }
    return list.slice(0, 10);
  }, [tickers, selectedCategory, marketSearch, tableTab]);

  // Quick Buy / Convert Live Quote Calculation
  const fiatMeta: Record<'USD' | 'EUR' | 'INR' | 'GBP', { symbol: string; usdRate: number }> = {
    USD: { symbol: '$', usdRate: 1 },
    EUR: { symbol: '€', usdRate: 1.085 },
    GBP: { symbol: '£', usdRate: 1.29 },
    INR: { symbol: '₹', usdRate: 0.0116 },
  };

  const quickTargetTicker = useMemo(
    () => tickers.find((t) => t.baseAsset === quickAsset) || btcTicker,
    [tickers, quickAsset, btcTicker]
  );

  const quickAssetPriceUSD =
    quickAsset === 'USDT' ? 1 : quickTargetTicker ? quickTargetTicker.price : 0;

  const parsedQuickSpend = parseFloat(quickSpend) || 0;
  const quickSpendInUSD =
    quickSide === 'Buy' ? parsedQuickSpend * fiatMeta[quickFiat].usdRate : parsedQuickSpend;
  const estimatedReceiveCrypto =
    quickAssetPriceUSD > 0 ? quickSpendInUSD / quickAssetPriceUSD : 0;

  const totalPortfolioUSDT = balances.reduce((acc, b) => acc + b.usdtValuation, 0);

  const faqs = [
    {
      q: 'Can I explore live markets, charts, and order books without logging in?',
      a: 'Yes. AetherX Pro is designed for full market transparency. You can browse the Home Page, Markets Overview, Spot & Futures Trading Terminals, real-time candlestick charts, live order book depth, P2P merchant quotes, Simple Earn APRs, and Proof of Reserves without creating an account. Authentication is only requested when you execute a financial transaction such as placing an order, depositing, or withdrawing.',
    },
    {
      q: 'Where do AetherX Pro market prices, order books, and trades come from?',
      a: 'All prices, 24-hour statistics, candlestick charts (1m to 1D), order book bids/asks, and recent market executions are streamed live from our backend market service connected to real-time global liquidity feeds.',
    },
    {
      q: 'How do I buy Bitcoin and other cryptocurrencies on AetherX Pro?',
      a: 'Use the Quick Buy calculator on this page or visit the Buy Crypto gateway to purchase BTC, ETH, SOL, BNB, or USDT with Visa, Mastercard, Apple Pay, SEPA, or 0%-fee P2P local bank transfer. You can also swap any asset with zero trading fees using AetherX Convert.',
    },
    {
      q: 'How are user assets and balances secured on the exchange?',
      a: 'Every user account is backed by an atomic relational SQL ledger with double-entry balance locking, 1:1 Merkle-tree Proof of Reserves, hardware Passkey / TOTP 2FA verification, withdrawal address whitelisting, and our dedicated SAFU protection reserve.',
    },
    {
      q: 'How can I earn passive yield or claim token airdrops?',
      a: 'Navigate to Simple Earn to subscribe idle USDT, USDC, BTC, ETH, SOL, or BNB into Flexible or Fixed-Term vaults earning up to 11.40% APR. Active holders also qualify for retroactive snapshots in the Megadrop & HODLer Airdrop portal.',
    },
  ];

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)]">
      {/* 1. LIVE TICKER TAPE & ANNOUNCEMENT BAR */}
      <div className="bg-[var(--bg-secondary)] border-b border-[var(--border-color)]">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 py-2 flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#F0B90B]/15 text-[#F0B90B] font-bold text-[11px] shrink-0">
              <Volume2 className="w-3 h-3" />
              LIVE
            </span>
            <span className="text-[var(--text-secondary)] truncate">
              AetherX Pro Lists Hyperion ZK (HYPR) · Zero Maker Fee on USDC Spot Pairs · 100% Real-Time Order Book & SQL Ledger Active
            </span>
          </div>
          <div className="flex items-center gap-4 shrink-0">
            <button
              onClick={() => navigate('/announcements')}
              className="text-[var(--text-muted)] hover:text-[#F0B90B] font-semibold flex items-center gap-0.5 cursor-pointer"
            >
              Announcements
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => navigate('/proof-of-reserves')}
              className="hidden sm:inline-flex items-center gap-1 text-[#0ECB81] hover:underline font-semibold cursor-pointer"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              1:1 Proof of Reserves
            </button>
          </div>
        </div>

        {/* Live Scrolling Price Strip (Real Backend Data) */}
        {tickers.length > 0 && (
          <div className="border-t border-[var(--border-color)]/60 bg-[var(--bg-primary)]/50 px-4 lg:px-8 py-1.5 overflow-x-auto no-scrollbar">
            <div className="max-w-7xl mx-auto flex items-center gap-6 whitespace-nowrap text-[11px]">
              {tickers.slice(0, 8).map((t) => {
                const isUp = t.priceChangePercent >= 0;
                return (
                  <button
                    key={t.symbol}
                    onClick={() => navigate('/trade/spot', t.symbol)}
                    className="inline-flex items-center gap-1.5 hover:opacity-80 transition-opacity cursor-pointer"
                  >
                    <span className="font-bold text-[var(--text-primary)]">
                      {t.baseAsset}/{t.quoteAsset}
                    </span>
                    <span className="font-mono-num text-[var(--text-secondary)]">
                      ${formatPrice(t.price)}
                    </span>
                    <span
                      className={`font-mono-num font-semibold ${
                        isUp ? 'text-[#0ECB81]' : 'text-[#F6465D]'
                      }`}
                    >
                      {isUp ? '+' : ''}
                      {t.priceChangePercent.toFixed(2)}%
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* 2. SPLIT HERO SECTION (Browsable Without Login + Direct Public Exploration CTAs) */}
      <section className="max-w-7xl mx-auto px-4 lg:px-8 pt-8 pb-12 lg:py-14">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Left 7 Columns: Value Proposition, Public Exploration Actions & Optional Onboarding */}
          <div className="lg:col-span-7 space-y-7">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--bg-secondary)] border border-[var(--border-color)] text-xs text-[var(--text-secondary)]">
              <span className="w-2 h-2 rounded-full bg-[#0ECB81] animate-pulse" />
              <span>Real-Time Spot & USDⓈ-M Perpetual Matching Engine</span>
              <span className="text-[var(--text-muted)]">·</span>
              <button
                onClick={() => navigate('/markets')}
                className="text-[#F0B90B] font-semibold hover:underline cursor-pointer"
              >
                Explore Without Login →
              </button>
            </div>

            <div className="space-y-3">
              <h1 className="font-display text-4xl sm:text-5xl lg:text-[58px] font-extrabold tracking-tight leading-[1.06]">
                <span className="text-[#F0B90B]">Trade Global Crypto</span>
                <span className="block text-[var(--text-primary)] mt-1">
                  With Institutional Liquidity
                </span>
              </h1>
              <p className="text-sm sm:text-base text-[var(--text-secondary)] max-w-xl leading-relaxed pt-1">
                Inspect live order books, trade Spot & 125x Perpetual Futures, swap assets with 0% Convert fees, or earn daily staking yield — openly accessible with instant execution.
              </p>
            </div>

            {/* Public Action Bar + Optional Quick Registration */}
            {!isAuthenticated ? (
              <div className="space-y-4 max-w-xl">
                {/* Direct Public Exploration Buttons (Zero Login Wall) */}
                <div className="flex flex-wrap items-center gap-3">
                  <button
                    onClick={() => navigate('/trade/spot', 'BTCUSDT')}
                    className="px-6 py-3.5 rounded-xl bg-[#FCD535] hover:bg-[#F0B90B] text-[#181A20] font-bold text-sm transition-colors flex items-center gap-2 cursor-pointer shadow-sm"
                  >
                    Launch Live Spot Terminal
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => navigate('/markets')}
                    className="px-5 py-3.5 rounded-xl bg-[var(--bg-secondary)] hover:bg-[var(--bg-hover)] border border-[var(--border-color)] text-[var(--text-primary)] font-bold text-sm transition-colors cursor-pointer"
                  >
                    Explore All Markets
                  </button>
                  <button
                    onClick={() => navigate('/trade/futures', 'BTCUSDT')}
                    className="px-4 py-3.5 rounded-xl bg-[var(--bg-secondary)] hover:bg-[var(--bg-hover)] border border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] font-semibold text-xs transition-colors cursor-pointer"
                  >
                    125x Futures
                  </button>
                </div>

                {/* Optional Quick Sign-Up Bar */}
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    openAuthModal('register');
                  }}
                  className="pt-2 flex flex-col sm:flex-row gap-2"
                >
                  <input
                    type="email"
                    value={heroEmail}
                    onChange={(e) => setHeroEmail(e.target.value)}
                    placeholder="Enter email to claim 10,000 USDT starter trading balance (Optional)"
                    className="flex-1 px-4 py-2.5 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] focus:border-[#F0B90B] text-xs text-[var(--text-primary)] focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-[var(--bg-elevated)] hover:bg-[var(--bg-hover)] border border-[var(--border-color)] text-[#F0B90B] font-bold text-xs transition-colors whitespace-nowrap cursor-pointer"
                  >
                    Create Free Account
                  </button>
                </form>
              </div>
            ) : (
              <div className="p-5 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-color)] max-w-xl">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <div className="text-xs text-[var(--text-muted)]">
                      Your Real-Time Ledger Portfolio Value
                    </div>
                    <div className="text-2xl font-bold font-mono-num text-[var(--text-primary)] mt-1">
                      $
                      {totalPortfolioUSDT.toLocaleString('en-US', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                      {btcTicker && btcTicker.price > 0 && (
                        <span className="text-xs font-normal text-[var(--text-muted)] ml-2">
                          ≈ {(totalPortfolioUSDT / btcTicker.price).toFixed(4)} BTC
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
                      Trade Spot
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Live Quantitative Exchange Metrics (Computed from Real Backend Stream) */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-5 pt-6 border-t border-[var(--border-color)]">
              <div>
                <div className="text-xl sm:text-2xl font-bold font-mono-num text-[var(--text-primary)]">
                  {total24hVolume > 0 ? `$${formatCompactNumber(total24hVolume)}` : '—'}
                </div>
                <div className="text-xs text-[var(--text-muted)] mt-0.5">
                  Live 24h Quote Volume
                </div>
              </div>
              <div>
                <div className="text-xl sm:text-2xl font-bold font-mono-num text-[var(--text-primary)]">
                  {totalMarketCap > 0 ? `$${formatCompactNumber(totalMarketCap)}` : '—'}
                </div>
                <div className="text-xs text-[var(--text-muted)] mt-0.5">
                  Tracked Asset Market Cap
                </div>
              </div>
              <div>
                <div className="text-xl sm:text-2xl font-bold font-mono-num text-[#0ECB81]">
                  100% 1:1
                </div>
                <div className="text-xs text-[var(--text-muted)] mt-0.5">
                  Custody Reserve Ratio
                </div>
              </div>
              <div>
                <div className="text-xl sm:text-2xl font-bold font-mono-num text-[#F0B90B]">
                  0.10%
                </div>
                <div className="text-xs text-[var(--text-muted)] mt-0.5">
                  Spot Maker / Taker Fee
                </div>
              </div>
            </div>
          </div>

          {/* Right 5 Columns: Live Market Snapshot Widget + Featured Assets */}
          <div className="lg:col-span-5 space-y-4">
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
                      onClick={() => setHeroWidgetTab(tab.id)}
                      className={`text-xs font-bold pb-2 -mb-3.5 transition-colors cursor-pointer ${
                        heroWidgetTab === tab.id
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
                {marketLoading && heroDisplayedTickers.length === 0 ? (
                  <div className="py-12 text-center text-xs text-[var(--text-muted)]">
                    Connecting to live market stream...
                  </div>
                ) : marketError && heroDisplayedTickers.length === 0 ? (
                  <div className="py-10 text-center space-y-2">
                    <div className="text-xs font-bold text-[#F6465D]">{marketError}</div>
                    <button
                      onClick={refreshMarkets}
                      className="px-3 py-1.5 rounded bg-[#F0B90B] text-[#181A20] text-xs font-bold cursor-pointer"
                    >
                      Retry Live Stream
                    </button>
                  </div>
                ) : (
                  heroDisplayedTickers.map((t) => {
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
                          className={`font-mono-num text-xs font-semibold px-2 py-1 rounded min-w-[72px] text-right ${
                            isUp
                              ? 'text-[#0ECB81] bg-[#0ECB81]/10'
                              : 'text-[#F6465D] bg-[#F6465D]/10'
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

            {/* Featured Assets & Announcements Box */}
            <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl p-4 sm:p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[var(--text-primary)] flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#F0B90B]" />
                  Exchange Highlights & Listings
                </span>
                <button
                  onClick={() => navigate('/announcements')}
                  className="text-xs text-[var(--text-muted)] hover:text-[#F0B90B] flex items-center gap-0.5 cursor-pointer"
                >
                  All News
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="space-y-2 text-xs">
                <div
                  onClick={() => navigate('/airdrop')}
                  className="flex items-center justify-between py-1 text-[var(--text-secondary)] hover:text-[#F0B90B] cursor-pointer"
                >
                  <span className="truncate">
                    • HODLer Airdrop: Claim Hyperion ZK (HYPR) Snapshot Rewards
                  </span>
                  <span className="text-[10px] font-mono-num text-[#0ECB81] shrink-0 ml-2">
                    ACTIVE
                  </span>
                </div>
                <div
                  onClick={() => navigate('/earn')}
                  className="flex items-center justify-between py-1 text-[var(--text-secondary)] hover:text-[#F0B90B] cursor-pointer"
                >
                  <span className="truncate">
                    • Simple Earn Flexible USDT Vault Boosted to 9.80% Real-Time APR
                  </span>
                  <span className="text-[10px] font-mono-num text-[#F0B90B] shrink-0 ml-2">
                    EARN
                  </span>
                </div>
                <div
                  onClick={() => navigate('/trade/futures', 'SOLUSDT')}
                  className="flex items-center justify-between py-1 text-[var(--text-secondary)] hover:text-[#F0B90B] cursor-pointer"
                >
                  <span className="truncate">
                    • USDⓈ-M Perpetual Futures: SOL, SUI & RENDER 75x Contracts Live
                  </span>
                  <span className="text-[10px] font-mono-num text-[var(--text-muted)] shrink-0 ml-2">
                    FUTURES
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. TRENDING / HOT COINS, TOP GAINERS, TOP LOSERS & 24H VOLUME PULSE (4-Card Real-Time Grid) */}
      <section className="max-w-7xl mx-auto px-4 lg:px-8 pb-12">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-5">
          <div>
            <div className="text-xs font-bold text-[#F0B90B] uppercase tracking-wider">
              Real-Time Market Pulse
            </div>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-[var(--text-primary)] mt-1">
              Trending Coins, Top Gainers & Losers
            </h2>
          </div>
          <button
            onClick={() => navigate('/markets')}
            className="text-xs font-bold text-[#F0B90B] hover:underline flex items-center gap-1 cursor-pointer"
          >
            Open Full Market Screener
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {marketLoading && tickers.length === 0 ? (
          <div className="p-12 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-color)] text-center text-xs text-[var(--text-muted)]">
            Loading live market categories...
          </div>
        ) : marketError && tickers.length === 0 ? (
          <div className="p-8 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-color)] text-center space-y-3">
            <div className="text-xs font-bold text-[#F6465D]">{marketError}</div>
            <button
              onClick={refreshMarkets}
              className="px-4 py-2 rounded-lg bg-[#F0B90B] text-[#181A20] text-xs font-bold cursor-pointer"
            >
              Retry Connection
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Card 1: Trending / Hot Coins */}
            <div className="p-4 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-color)] space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-[var(--text-primary)] pb-2 border-b border-[var(--border-color)]">
                <span className="flex items-center gap-1.5">
                  <Flame className="w-4 h-4 text-[#F0B90B]" />
                  Hot / Trending
                </span>
                <span className="text-[11px] text-[var(--text-muted)]">24h Change</span>
              </div>
              <div className="space-y-1.5">
                {hotCoinsList.map((item) => {
                  const isUp = item.priceChangePercent >= 0;
                  return (
                    <div
                      key={item.symbol}
                      onClick={() => navigate('/trade/spot', item.symbol)}
                      className="flex items-center justify-between py-1.5 px-2 rounded-lg hover:bg-[var(--bg-hover)] cursor-pointer transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <CryptoIcon symbol={item.baseAsset} size="sm" />
                        <span className="text-xs font-bold text-[var(--text-primary)]">
                          {item.baseAsset}
                        </span>
                      </div>
                      <span className="text-xs font-mono-num text-[var(--text-primary)]">
                        ${formatPrice(item.price)}
                      </span>
                      <span
                        className={`text-xs font-mono-num font-semibold ${
                          isUp ? 'text-[#0ECB81]' : 'text-[#F6465D]'
                        }`}
                      >
                        {isUp ? '+' : ''}
                        {item.priceChangePercent.toFixed(2)}%
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Card 2: Top Gainers */}
            <div className="p-4 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-color)] space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-[var(--text-primary)] pb-2 border-b border-[var(--border-color)]">
                <span className="flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4 text-[#0ECB81]" />
                  Top Gainers (24h)
                </span>
                <span className="text-[11px] text-[var(--text-muted)]">24h Change</span>
              </div>
              <div className="space-y-1.5">
                {topGainersList.map((item) => {
                  const isUp = item.priceChangePercent >= 0;
                  return (
                    <div
                      key={item.symbol}
                      onClick={() => navigate('/trade/spot', item.symbol)}
                      className="flex items-center justify-between py-1.5 px-2 rounded-lg hover:bg-[var(--bg-hover)] cursor-pointer transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <CryptoIcon symbol={item.baseAsset} size="sm" />
                        <span className="text-xs font-bold text-[var(--text-primary)]">
                          {item.baseAsset}
                        </span>
                      </div>
                      <span className="text-xs font-mono-num text-[var(--text-primary)]">
                        ${formatPrice(item.price)}
                      </span>
                      <span
                        className={`text-xs font-mono-num font-semibold ${
                          isUp ? 'text-[#0ECB81]' : 'text-[#F6465D]'
                        }`}
                      >
                        {isUp ? '+' : ''}
                        {item.priceChangePercent.toFixed(2)}%
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Card 3: Top Losers / Pullbacks */}
            <div className="p-4 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-color)] space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-[var(--text-primary)] pb-2 border-b border-[var(--border-color)]">
                <span className="flex items-center gap-1.5">
                  <TrendingDown className="w-4 h-4 text-[#F6465D]" />
                  Top Dip / Pullbacks
                </span>
                <span className="text-[11px] text-[var(--text-muted)]">24h Change</span>
              </div>
              <div className="space-y-1.5">
                {topLosersList.map((item) => {
                  const isUp = item.priceChangePercent >= 0;
                  return (
                    <div
                      key={item.symbol}
                      onClick={() => navigate('/trade/spot', item.symbol)}
                      className="flex items-center justify-between py-1.5 px-2 rounded-lg hover:bg-[var(--bg-hover)] cursor-pointer transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <CryptoIcon symbol={item.baseAsset} size="sm" />
                        <span className="text-xs font-bold text-[var(--text-primary)]">
                          {item.baseAsset}
                        </span>
                      </div>
                      <span className="text-xs font-mono-num text-[var(--text-primary)]">
                        ${formatPrice(item.price)}
                      </span>
                      <span
                        className={`text-xs font-mono-num font-semibold ${
                          isUp ? 'text-[#0ECB81]' : 'text-[#F6465D]'
                        }`}
                      >
                        {isUp ? '+' : ''}
                        {item.priceChangePercent.toFixed(2)}%
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Card 4: Volume Leaders */}
            <div className="p-4 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-color)] space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-[var(--text-primary)] pb-2 border-b border-[var(--border-color)]">
                <span className="flex items-center gap-1.5">
                  <BarChart3 className="w-4 h-4 text-[#F0B90B]" />
                  24h Volume Leaders
                </span>
                <span className="text-[11px] text-[var(--text-muted)]">USDT Vol</span>
              </div>
              <div className="space-y-1.5">
                {topVolumeList.map((item) => (
                  <div
                    key={item.symbol}
                    onClick={() => navigate('/trade/spot', item.symbol)}
                    className="flex items-center justify-between py-1.5 px-2 rounded-lg hover:bg-[var(--bg-hover)] cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <CryptoIcon symbol={item.baseAsset} size="sm" />
                      <span className="text-xs font-bold text-[var(--text-primary)]">
                        {item.baseAsset}
                      </span>
                    </div>
                    <span className="text-xs font-mono-num text-[var(--text-primary)]">
                      ${formatPrice(item.price)}
                    </span>
                    <span className="text-xs font-mono-num font-semibold text-[var(--text-secondary)]">
                      ${formatCompactNumber(item.quoteVolume24h)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </section>

      {/* 4. POPULAR TRADING PAIRS & LIVE MARKET OVERVIEW TABLE (Full Public Access) */}
      <section className="max-w-7xl mx-auto px-4 lg:px-8 pb-14">
        <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl p-5 sm:p-6 space-y-5">
          {/* Table Header + Sub-tabs + Search */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-[var(--border-color)] pb-4">
            <div className="flex items-center gap-5 overflow-x-auto">
              {(
                [
                  { id: 'All', label: 'Popular Trading Pairs' },
                  { id: 'Hot', label: 'Hot Markets' },
                  { id: 'Gainers', label: 'Top Gainers' },
                  { id: 'Losers', label: 'Top Losers' },
                  { id: 'Volume', label: '24h Volume' },
                ] as const
              ).map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTableTab(t.id)}
                  className={`text-xs sm:text-sm font-bold pb-4 -mb-4 transition-colors whitespace-nowrap cursor-pointer ${
                    tableTab === t.id
                      ? 'text-[#F0B90B] border-b-2 border-[#F0B90B]'
                      : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <div className="flex items-center gap-2 bg-[var(--bg-primary)] border border-[var(--border-color)] focus-within:border-[#F0B90B] rounded-xl px-3 py-1.5">
                <Search className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                <input
                  type="text"
                  value={marketSearch}
                  onChange={(e) => setMarketSearch(e.target.value)}
                  placeholder="Search coin or pair..."
                  className="bg-transparent text-xs text-[var(--text-primary)] focus:outline-none w-40 sm:w-48"
                />
              </div>
              <button
                onClick={refreshMarkets}
                className="p-2 rounded-xl bg-[var(--bg-primary)] hover:bg-[var(--bg-hover)] border border-[var(--border-color)] text-[var(--text-secondary)] cursor-pointer"
                title="Refresh Live Market Feed"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Ecosystem Category Filter Bar (Supported Assets / Markets) */}
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap cursor-pointer ${
                    selectedCategory === cat
                      ? 'bg-[#F0B90B] text-[#181A20]'
                      : 'bg-[var(--bg-primary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border-color)]'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
            <span className="text-[11px] text-[var(--text-muted)] font-mono-num">
              Showing {filteredTableTickers.length} live trading pairs · Click any row to open Spot Terminal
            </span>
          </div>

          {/* Responsive Market Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[var(--border-color)] text-[11px] text-[var(--text-muted)]">
                  <th className="py-3 px-3">Trading Pair</th>
                  <th className="py-3 px-3 text-right">Last Price</th>
                  <th className="py-3 px-3 text-right">24h Change</th>
                  <th className="py-3 px-3 text-right hidden md:table-cell">24h High / Low</th>
                  <th className="py-3 px-3 text-right hidden sm:table-cell">24h Volume (USDT)</th>
                  <th className="py-3 px-3 text-right hidden lg:table-cell">Market Cap</th>
                  <th className="py-3 px-3 text-right">Trade</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-color)]/60 text-xs">
                {marketLoading && filteredTableTickers.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-[var(--text-muted)]">
                      Loading live trading pairs from backend market service...
                    </td>
                  </tr>
                ) : marketError && filteredTableTickers.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center space-y-2">
                      <div className="text-[#F6465D] font-bold">{marketError}</div>
                      <button
                        onClick={refreshMarkets}
                        className="px-4 py-1.5 rounded bg-[#F0B90B] text-[#181A20] text-xs font-bold cursor-pointer"
                      >
                        Retry Live Feed
                      </button>
                    </td>
                  </tr>
                ) : filteredTableTickers.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-10 text-center text-[var(--text-muted)]">
                      No trading pairs match your filter criteria.
                    </td>
                  </tr>
                ) : (
                  filteredTableTickers.map((t) => {
                    const isUp = t.priceChangePercent >= 0;
                    return (
                      <tr
                        key={t.symbol}
                        onClick={() => navigate('/trade/spot', t.symbol)}
                        className="hover:bg-[var(--bg-hover)] transition-colors cursor-pointer"
                      >
                        <td className="py-3.5 px-3">
                          <div className="flex items-center gap-3">
                            <CryptoIcon symbol={t.baseAsset} size="md" />
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span className="font-bold text-sm text-[var(--text-primary)]">
                                  {t.baseAsset}
                                </span>
                                <span className="text-[11px] text-[var(--text-muted)]">
                                  /{t.quoteAsset}
                                </span>
                                <span className="hidden sm:inline-block px-1.5 py-0.5 rounded bg-[var(--bg-primary)] border border-[var(--border-color)] text-[10px] text-[var(--text-muted)]">
                                  {t.category}
                                </span>
                              </div>
                              <div className="text-[11px] text-[var(--text-muted)]">{t.name}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-3 text-right font-mono-num font-bold text-sm text-[var(--text-primary)]">
                          ${formatPrice(t.price)}
                        </td>
                        <td className="py-3.5 px-3 text-right font-mono-num">
                          <span
                            className={`inline-block px-2 py-1 rounded font-semibold min-w-[72px] text-right ${
                              isUp
                                ? 'text-[#0ECB81] bg-[#0ECB81]/10'
                                : 'text-[#F6465D] bg-[#F6465D]/10'
                            }`}
                          >
                            {isUp ? '+' : ''}
                            {t.priceChangePercent.toFixed(2)}%
                          </span>
                        </td>
                        <td className="py-3.5 px-3 text-right font-mono-num text-[11px] text-[var(--text-secondary)] hidden md:table-cell">
                          <div>H: ${formatPrice(t.high24h)}</div>
                          <div className="text-[var(--text-muted)]">L: ${formatPrice(t.low24h)}</div>
                        </td>
                        <td className="py-3.5 px-3 text-right font-mono-num text-[var(--text-secondary)] hidden sm:table-cell">
                          ${formatCompactNumber(t.quoteVolume24h)}
                        </td>
                        <td className="py-3.5 px-3 text-right font-mono-num text-[var(--text-secondary)] hidden lg:table-cell">
                          ${formatCompactNumber(t.marketCap)}
                        </td>
                        <td className="py-3.5 px-3 text-right">
                          <div className="inline-flex items-center gap-2">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate('/convert');
                              }}
                              className="px-2.5 py-1.5 rounded-lg bg-[var(--bg-primary)] hover:bg-[var(--bg-elevated)] border border-[var(--border-color)] text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer"
                            >
                              Convert
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate('/trade/spot', t.symbol);
                              }}
                              className="px-3 py-1.5 rounded-lg bg-[#F0B90B]/15 hover:bg-[#F0B90B] text-[#F0B90B] hover:text-[#181A20] text-xs font-bold transition-colors cursor-pointer"
                            >
                              Trade
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          <div className="pt-2 flex items-center justify-center">
            <button
              onClick={() => navigate('/markets')}
              className="px-6 py-2.5 rounded-xl bg-[var(--bg-primary)] hover:bg-[var(--bg-hover)] border border-[var(--border-color)] text-xs font-bold text-[#F0B90B] flex items-center gap-1.5 cursor-pointer"
            >
              View All {tickers.length} Markets & Advanced Filters
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </section>

      {/* 5. QUICK BUY CRYPTO & ZERO-FEE CONVERT SECTION + BEGINNER-FRIENDLY ONBOARDING */}
      <section className="border-y border-[var(--border-color)] bg-[var(--bg-secondary)]/40 py-14 px-4 lg:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Left 7 Columns: Beginner-Friendly 3-Step Guide + Payment Channels */}
          <div className="lg:col-span-7 space-y-6">
            <div className="space-y-2">
              <div className="text-xs font-bold text-[#F0B90B] uppercase tracking-wider">
                Beginner-Friendly Crypto Gateway
              </div>
              <h2 className="font-display text-2xl sm:text-4xl font-bold text-[var(--text-primary)]">
                Buy or Convert Crypto in 3 Simple Steps
              </h2>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed max-w-2xl">
                Whether you are buying your first Bitcoin with local currency or rebalancing an institutional portfolio, AetherX Pro provides transparent live pricing with zero hidden spreads.
              </p>
            </div>

            {/* 3 Beginner Steps */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div
                onClick={() => navigate('/markets')}
                className="p-4 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] hover:border-[#F0B90B] transition-colors cursor-pointer space-y-2"
              >
                <div className="w-7 h-7 rounded-lg bg-[#F0B90B]/15 text-[#F0B90B] font-mono-num text-xs font-bold flex items-center justify-center">
                  01
                </div>
                <div className="text-sm font-bold text-[var(--text-primary)]">
                  1. Browse Live Markets
                </div>
                <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                  Compare real-time prices, 24h changes, and order book liquidity across all pairs without logging in.
                </p>
              </div>

              <div
                onClick={() => navigate('/buy-crypto')}
                className="p-4 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] hover:border-[#F0B90B] transition-colors cursor-pointer space-y-2"
              >
                <div className="w-7 h-7 rounded-lg bg-[#0ECB81]/15 text-[#0ECB81] font-mono-num text-xs font-bold flex items-center justify-center">
                  02
                </div>
                <div className="text-sm font-bold text-[var(--text-primary)]">
                  2. Fund or Buy Crypto
                </div>
                <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                  Acquire USDT, BTC, or ETH via Card, Apple Pay, SEPA, 0%-fee P2P escrow, or multi-network crypto deposit.
                </p>
              </div>

              <div
                onClick={() => navigate('/trade/spot', 'BTCUSDT')}
                className="p-4 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] hover:border-[#F0B90B] transition-colors cursor-pointer space-y-2"
              >
                <div className="w-7 h-7 rounded-lg bg-[#F0B90B]/15 text-[#F0B90B] font-mono-num text-xs font-bold flex items-center justify-center">
                  03
                </div>
                <div className="text-sm font-bold text-[var(--text-primary)]">
                  3. Trade & Earn Yield
                </div>
                <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                  Execute Spot or Futures orders with sub-millisecond matching or stake idle assets in Simple Earn up to 11.40% APR.
                </p>
              </div>
            </div>

            {/* Supported Fiat & P2P Rails */}
            <div className="flex flex-wrap items-center gap-3 pt-2 text-xs text-[var(--text-muted)]">
              <span className="font-semibold text-[var(--text-secondary)]">Supported Rails:</span>
              {['Visa / Mastercard', 'Apple Pay', 'SEPA Instant', 'P2P UPI / IMPS (0% Fee)', 'ERC20 / TRC20 / Arbitrum / Solana'].map(
                (rail) => (
                  <span
                    key={rail}
                    className="px-2.5 py-1 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-secondary)]"
                  >
                    {rail}
                  </span>
                )
              )}
            </div>
          </div>

          {/* Right 5 Columns: Interactive Live Quick Buy & Convert Calculator */}
          <div className="lg:col-span-5">
            <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl p-6 shadow-xl space-y-5">
              <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-3">
                <div className="flex items-center gap-4">
                  <button
                    type="button"
                    onClick={() => setQuickSide('Buy')}
                    className={`text-sm font-bold pb-3 -mb-3.5 transition-colors cursor-pointer ${
                      quickSide === 'Buy'
                        ? 'text-[#F0B90B] border-b-2 border-[#F0B90B]'
                        : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                    }`}
                  >
                    Quick Buy Crypto
                  </button>
                  <button
                    type="button"
                    onClick={() => setQuickSide('Convert')}
                    className={`text-sm font-bold pb-3 -mb-3.5 transition-colors cursor-pointer ${
                      quickSide === 'Convert'
                        ? 'text-[#F0B90B] border-b-2 border-[#F0B90B]'
                        : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                    }`}
                  >
                    0% Fee Convert
                  </button>
                </div>
                <span className="text-[11px] font-mono-num text-[#0ECB81]">Live Rate</span>
              </div>

              {/* Spend Input Box */}
              <div className="p-4 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-color)] focus-within:border-[#F0B90B] space-y-1.5">
                <div className="flex items-center justify-between text-xs text-[var(--text-muted)]">
                  <span>{quickSide === 'Buy' ? 'You Spend (Fiat)' : 'From Asset (USDT)'}</span>
                  <span>Instant Settlement</span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <input
                    type="number"
                    step="any"
                    min="10"
                    value={quickSpend}
                    onChange={(e) => setQuickSpend(e.target.value)}
                    className="w-full bg-transparent font-mono-num text-xl font-bold text-[var(--text-primary)] focus:outline-none"
                  />
                  {quickSide === 'Buy' ? (
                    <select
                      value={quickFiat}
                      onChange={(e) => setQuickFiat(e.target.value as 'USD' | 'EUR' | 'INR' | 'GBP')}
                      className="px-3 py-1.5 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-color)] text-xs font-bold text-[var(--text-primary)] cursor-pointer"
                    >
                      <option value="USD">USD ($)</option>
                      <option value="EUR">EUR (€)</option>
                      <option value="GBP">GBP (£)</option>
                      <option value="INR">INR (₹)</option>
                    </select>
                  ) : (
                    <span className="px-3 py-1.5 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-color)] text-xs font-bold text-[var(--text-primary)]">
                      USDT
                    </span>
                  )}
                </div>
              </div>

              {/* Receive Estimated Output Box */}
              <div className="p-4 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-color)] space-y-1.5">
                <div className="flex items-center justify-between text-xs text-[var(--text-muted)]">
                  <span>You Receive (Estimated)</span>
                  <span className="font-mono-num">
                    1 {quickAsset} ≈ $
                    {quickAssetPriceUSD > 0 ? formatPrice(quickAssetPriceUSD) : '—'}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <div className="font-mono-num text-xl font-bold text-[#0ECB81] truncate">
                    {quickAssetPriceUSD > 0 ? estimatedReceiveCrypto.toFixed(6) : '—'}
                  </div>
                  <select
                    value={quickAsset}
                    onChange={(e) => setQuickAsset(e.target.value)}
                    className="px-3 py-1.5 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-color)] text-xs font-bold text-[var(--text-primary)] cursor-pointer"
                  >
                    {['BTC', 'ETH', 'SOL', 'BNB', 'XRP', 'ADA', 'AVAX', 'SUI', 'USDT'].map((sym) => (
                      <option key={sym} value={sym}>
                        {sym}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-[var(--text-muted)] px-1">
                <span>Reference Quote Source</span>
                <span className="font-mono-num text-[var(--text-secondary)]">
                  AetherX Live Order Book
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => navigate(quickSide === 'Buy' ? '/buy-crypto' : '/convert')}
                  className="w-full py-3 rounded-xl bg-[#FCD535] hover:bg-[#F0B90B] text-[#181A20] font-bold text-xs transition-colors cursor-pointer"
                >
                  {quickSide === 'Buy' ? `Continue to Buy ${quickAsset}` : `Open Convert Portal`}
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/p2p')}
                  className="w-full py-3 rounded-xl bg-[var(--bg-primary)] hover:bg-[var(--bg-hover)] border border-[var(--border-color)] text-[var(--text-primary)] font-bold text-xs transition-colors cursor-pointer"
                >
                  P2P 0% Fee Desk
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. TRADING FEATURES & ECOSYSTEM SUITE (Explore All Products Without Login) */}
      <section className="max-w-7xl mx-auto py-14 px-4 lg:px-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="text-xs font-bold text-[#F0B90B] uppercase tracking-wider">
              Complete Exchange Ecosystem
            </div>
            <h2 className="font-display text-2xl sm:text-4xl font-bold text-[var(--text-primary)] mt-1">
              Professional Trading & Wealth Products
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-[var(--text-muted)] max-w-md">
            Every product page is open to preview live rates, order books, and liquidity pools before you sign in.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {/* Spot Trading */}
          <div
            onClick={() => navigate('/trade/spot', 'BTCUSDT')}
            className="p-6 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-color)] hover:border-[#F0B90B] transition-all cursor-pointer flex flex-col justify-between space-y-5 group"
          >
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#F0B90B]/15 text-[#F0B90B] flex items-center justify-center">
                <BarChart3 className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-[var(--text-primary)] group-hover:text-[#F0B90B] transition-colors">
                Spot Trading Terminal
              </h3>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                Trade major and emerging pairs with real-time candlestick charts, MA/EMA/BOLL indicators, live depth book, and Limit, Market & Stop-Limit execution.
              </p>
            </div>
            <div className="pt-3 border-t border-[var(--border-color)] flex items-center justify-between text-xs font-bold text-[#F0B90B]">
              <span>
                BTC/USDT: {btcTicker ? `$${formatPrice(btcTicker.price)}` : 'Live Stream'}
              </span>
              <span className="flex items-center gap-1">
                Open Terminal <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>

          {/* USDⓈ-M Perpetual Futures */}
          <div
            onClick={() => navigate('/trade/futures', 'BTCUSDT')}
            className="p-6 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-color)] hover:border-[#F0B90B] transition-all cursor-pointer flex flex-col justify-between space-y-5 group"
          >
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#0ECB81]/15 text-[#0ECB81] flex items-center justify-center">
                <Zap className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-[var(--text-primary)] group-hover:text-[#F0B90B] transition-colors">
                USDⓈ-M Perpetual Futures
              </h3>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                Go Long or Short with adjustable 1x to 125x leverage, Cross/Isolated margin modes, and real-time funding rate & mark price telemetry.
              </p>
            </div>
            <div className="pt-3 border-t border-[var(--border-color)] flex items-center justify-between text-xs font-bold text-[#0ECB81]">
              <span>
                ETH/USDT: {ethTicker ? `$${formatPrice(ethTicker.price)}` : 'Up to 125x'}
              </span>
              <span className="flex items-center gap-1">
                Trade Futures <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>

          {/* Simple Earn Vaults */}
          <div
            onClick={() => navigate('/earn')}
            className="p-6 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-color)] hover:border-[#F0B90B] transition-all cursor-pointer flex flex-col justify-between space-y-5 group"
          >
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#F0B90B]/15 text-[#F0B90B] flex items-center justify-center">
                <Layers className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-[var(--text-primary)] group-hover:text-[#F0B90B] transition-colors">
                Simple Earn Yield Vaults
              </h3>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                Put idle USDT, USDC, BTC, ETH, SOL, and BNB to work in principal-protected Flexible or Fixed-Term vaults with daily yield distribution.
              </p>
            </div>
            <div className="pt-3 border-t border-[var(--border-color)] flex items-center justify-between text-xs font-bold text-[#F0B90B]">
              <span>Up to 11.40% Est. APR</span>
              <span className="flex items-center gap-1">
                View Vaults <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>

          {/* P2P Marketplace */}
          <div
            onClick={() => navigate('/p2p')}
            className="p-6 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-color)] hover:border-[#F0B90B] transition-all cursor-pointer flex flex-col justify-between space-y-5 group"
          >
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#0ECB81]/15 text-[#0ECB81] flex items-center justify-center">
                <Users className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-[var(--text-primary)] group-hover:text-[#F0B90B] transition-colors">
                P2P Escrow Marketplace
              </h3>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                Buy and sell crypto directly with verified OTC merchants using UPI, IMPS, SEPA, Zelle, and Bank Transfer with 0% transaction fees.
              </p>
            </div>
            <div className="pt-3 border-t border-[var(--border-color)] flex items-center justify-between text-xs font-bold text-[#0ECB81]">
              <span>0% Taker Fee · 24/7 Escrow</span>
              <span className="flex items-center gap-1">
                Browse Offers <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>

          {/* Zero-Fee Convert */}
          <div
            onClick={() => navigate('/convert')}
            className="p-6 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-color)] hover:border-[#F0B90B] transition-all cursor-pointer flex flex-col justify-between space-y-5 group"
          >
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#F0B90B]/15 text-[#F0B90B] flex items-center justify-center">
                <Repeat className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-[var(--text-primary)] group-hover:text-[#F0B90B] transition-colors">
                Instant Convert & Block OTC
              </h3>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                Swap between any supported digital assets in one click with guaranteed institutional quotes, zero slippage, and instant Spot wallet settlement.
              </p>
            </div>
            <div className="pt-3 border-t border-[var(--border-color)] flex items-center justify-between text-xs font-bold text-[#F0B90B]">
              <span>Zero Trading Fees</span>
              <span className="flex items-center gap-1">
                Swap Assets <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>

          {/* Megadrop & Airdrop Portal */}
          <div
            onClick={() => navigate('/airdrop')}
            className="p-6 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-color)] hover:border-[#F0B90B] transition-all cursor-pointer flex flex-col justify-between space-y-5 group"
          >
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#0ECB81]/15 text-[#0ECB81] flex items-center justify-center">
                <Gift className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-[var(--text-primary)] group-hover:text-[#F0B90B] transition-colors">
                Megadrop & HODLer Airdrops
              </h3>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                Qualify for retroactive hourly BNB, SOL & USDT snapshots and claim newly listed Web3 tokens directly into your Spot Wallet.
              </p>
            </div>
            <div className="pt-3 border-t border-[var(--border-color)] flex items-center justify-between text-xs font-bold text-[#0ECB81]">
              <span>2 Active Campaigns Live</span>
              <span className="flex items-center gap-1">
                View Campaigns <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 7. WHY CHOOSE AETHERX PRO — SECURITY, PROOF OF RESERVES & PROTECTION */}
      <section className="border-t border-[var(--border-color)] bg-[var(--bg-secondary)]/30 py-14 px-4 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <div className="text-xs font-bold text-[#0ECB81] uppercase tracking-wider">
                Security & Institutional Trust
              </div>
              <h2 className="font-display text-2xl sm:text-4xl font-bold text-[var(--text-primary)] mt-1">
                Why Traders Choose AetherX Pro
              </h2>
            </div>
            <button
              onClick={() => navigate('/proof-of-reserves')}
              className="text-xs font-bold text-[#F0B90B] hover:underline flex items-center gap-1 cursor-pointer"
            >
              Inspect Merkle-Tree Proof of Reserves
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="p-5 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-color)] space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#0ECB81]/15 text-[#0ECB81] flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div className="text-base font-bold text-[var(--text-primary)]">
                1:1 Proof of Reserves
              </div>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                Every user deposit is backed at least 100% 1:1 in segregated cold & multi-sig custody wallets with public cryptographic verification.
              </p>
              <div className="pt-1 text-[11px] font-mono-num text-[#0ECB81] font-semibold">
                BTC Reserve Ratio: 104.2%
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-color)] space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#F0B90B]/15 text-[#F0B90B] flex items-center justify-center">
                <Lock className="w-5 h-5" />
              </div>
              <div className="text-base font-bold text-[var(--text-primary)]">
                Atomic SQL Ledger Safety
              </div>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                All balances, limit order locks, cancellations, and trades execute inside strict ACID database transactions preventing race conditions.
              </p>
              <div className="pt-1 text-[11px] font-mono-num text-[#F0B90B] font-semibold">
                Zero Balance Discrepancies
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-color)] space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#0ECB81]/15 text-[#0ECB81] flex items-center justify-center">
                <FileCheck className="w-5 h-5" />
              </div>
              <div className="text-base font-bold text-[var(--text-primary)]">
                Hardware 2FA & Whitelisting
              </div>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                Protect your account with TOTP Authenticator 2FA, custom Anti-Phishing signatures, and strict on-chain withdrawal address whitelists.
              </p>
              <div className="pt-1 text-[11px] font-mono-num text-[#0ECB81] font-semibold">
                Session Token Auth Active
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-color)] space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#F0B90B]/15 text-[#F0B90B] flex items-center justify-center">
                <Headphones className="w-5 h-5" />
              </div>
              <div className="text-base font-bold text-[var(--text-primary)]">
                24/7 Specialist Support & API
              </div>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                Low-latency REST & WebSocket market endpoints alongside round-the-clock multilingual customer support and dispute resolution.
              </p>
              <div className="pt-1 text-[11px] font-mono-num text-[#F0B90B] font-semibold">
                &lt; 60s Response Time
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 8. MULTI-PLATFORM TRADING EXPERIENCE PREVIEW */}
      <section className="border-y border-[var(--border-color)] bg-[var(--bg-secondary)]/50 py-14 px-4 lg:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Left 7 Columns: Live Interactive Mini-Terminal Preview */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                {(['Desktop', 'Mobile', 'API'] as const).map((plat) => (
                  <button
                    key={plat}
                    onClick={() => setActivePlatform(plat)}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                      activePlatform === plat
                        ? 'bg-[#F0B90B] text-[#181A20]'
                        : 'bg-[var(--bg-elevated)] text-[var(--text-secondary)]'
                    }`}
                  >
                    {plat} Workspace
                  </button>
                ))}
              </div>
              <button
                onClick={() => navigate('/trade/spot', 'BTCUSDT')}
                className="text-xs font-bold text-[#F0B90B] hover:underline flex items-center gap-1 cursor-pointer"
              >
                Open Full Spot Terminal
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="rounded-2xl bg-[var(--bg-primary)] border border-[var(--border-color)] p-5 shadow-xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[var(--border-color)]">
                <div className="flex items-center gap-3">
                  <CryptoIcon symbol="BTC" size="md" />
                  <div>
                    <div className="text-sm font-bold text-[var(--text-primary)]">
                      BTC/USDT · <span className="text-[#F0B90B]">{activePlatform} View</span>
                    </div>
                    <div className="text-xs text-[var(--text-muted)] font-mono-num">
                      {btcTicker
                        ? `24h High: $${formatPrice(btcTicker.high24h)} · Low: $${formatPrice(btcTicker.low24h)}`
                        : 'Real-Time Order Book & Klines'}
                    </div>
                  </div>
                </div>
                {btcTicker && (
                  <div className="text-right font-mono-num">
                    <div
                      className={`text-lg font-bold ${
                        btcTicker.priceChangePercent >= 0 ? 'text-[#0ECB81]' : 'text-[#F6465D]'
                      }`}
                    >
                      ${formatPrice(btcTicker.price)}
                    </div>
                    <div
                      className={`text-xs ${
                        btcTicker.priceChangePercent >= 0 ? 'text-[#0ECB81]' : 'text-[#F6465D]'
                      }`}
                    >
                      {btcTicker.priceChangePercent >= 0 ? '+' : ''}
                      {btcTicker.priceChangePercent.toFixed(2)}%
                    </div>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div
                  onClick={() => navigate('/trade/spot', 'BTCUSDT')}
                  className="p-3.5 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] hover:border-[#F0B90B] cursor-pointer"
                >
                  <div className="font-bold text-[var(--text-primary)]">Live Order Book</div>
                  <div className="text-[var(--text-muted)] mt-1">
                    Inspect real bid/ask depth and click any price level to pre-fill your order.
                  </div>
                </div>
                <div
                  onClick={() => navigate('/trade/futures', 'ETHUSDT')}
                  className="p-3.5 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] hover:border-[#F0B90B] cursor-pointer"
                >
                  <div className="font-bold text-[var(--text-primary)]">Technical Indicators</div>
                  <div className="text-[var(--text-muted)] mt-1">
                    Interactive SVG candlesticks with MA(7/25), EMA(20), and Bollinger Bands.
                  </div>
                </div>
                <div
                  onClick={() => navigate('/api-docs')}
                  className="p-3.5 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] hover:border-[#F0B90B] cursor-pointer"
                >
                  <div className="font-bold text-[var(--text-primary)]">REST & Market API</div>
                  <div className="text-[var(--text-muted)] mt-1">
                    Direct public endpoints for `/api/markets`, `/api/depth`, and `/api/klines`.
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right 5 Columns: Multi-Device Access & Public Links */}
          <div className="lg:col-span-5 space-y-5">
            <h2 className="font-display text-2xl sm:text-4xl font-bold text-[var(--text-primary)]">
              Trade Seamlessly Across Desktop, Tablet & Mobile
            </h2>
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
              Our responsive trading layout adapts automatically from 3-column institutional widescreens to compact mobile bottom-sheet order entry with full Dark & White theme parity.
            </p>

            <div className="p-4 rounded-2xl bg-[var(--bg-primary)] border border-[var(--border-color)] flex items-center gap-4">
              <div className="w-16 h-16 rounded-xl bg-white p-2 flex items-center justify-center shrink-0 border border-[var(--border-color)]">
                <QrCode className="w-12 h-12 text-[#181A20]" />
              </div>
              <div>
                <div className="text-xs text-[var(--text-muted)]">Instant Web & Mobile Access</div>
                <div className="text-sm font-bold text-[var(--text-primary)] mt-0.5">
                  Zero Installation Required — Full Browser Terminal
                </div>
                <div className="text-xs text-[#F0B90B] mt-1">
                  Supports Dark Mode & White Mode out of the box
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 text-center text-xs">
              <button
                onClick={() => navigate('/fees')}
                className="p-3 rounded-xl bg-[var(--bg-primary)] hover:bg-[var(--bg-hover)] border border-[var(--border-color)] font-semibold text-[var(--text-primary)] cursor-pointer"
              >
                Fee Schedule
              </button>
              <button
                onClick={() => navigate('/api-docs')}
                className="p-3 rounded-xl bg-[var(--bg-primary)] hover:bg-[var(--bg-hover)] border border-[var(--border-color)] font-semibold text-[var(--text-primary)] cursor-pointer"
              >
                API Docs
              </button>
              <button
                onClick={() => navigate('/sitemap')}
                className="p-3 rounded-xl bg-[var(--bg-primary)] hover:bg-[var(--bg-hover)] border border-[var(--border-color)] font-semibold text-[var(--text-primary)] cursor-pointer"
              >
                Full Sitemap
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 9. FAQ ACCORDION SECTION */}
      <section className="max-w-5xl mx-auto py-14 px-4 lg:px-8">
        <div className="text-center space-y-2 mb-8">
          <div className="text-xs font-bold text-[#F0B90B] uppercase tracking-wider">
            Help & Transparency
          </div>
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-[var(--text-primary)]">
            Frequently Asked Questions
          </h2>
        </div>
        <div className="space-y-2.5">
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
                    <span className="w-6 h-6 rounded-md bg-[var(--bg-elevated)] border border-[var(--border-color)] font-mono-num text-xs flex items-center justify-center text-[var(--text-secondary)] shrink-0">
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

      {/* 10. FINAL CALL-TO-ACTION BANNER (Public Market Exploration + Optional Sign Up) */}
      <section className="bg-[var(--bg-secondary)] border-t border-[var(--border-color)] py-14 px-4 text-center">
        <div className="max-w-3xl mx-auto space-y-5">
          <h2 className="font-display text-2xl sm:text-4xl font-bold text-[var(--text-primary)]">
            Ready to Explore Live Crypto Markets?
          </h2>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] max-w-xl mx-auto">
            Jump straight into the live Spot or Futures trading terminal without logging in, or create a free account in seconds to receive a 10,000 USDT starter balance.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={() => navigate('/trade/spot', 'BTCUSDT')}
              className="px-7 py-3.5 rounded-xl bg-[#FCD535] hover:bg-[#F0B90B] text-[#181A20] font-bold text-sm transition-colors cursor-pointer"
            >
              Open Spot Terminal
            </button>
            <button
              onClick={() => navigate('/markets')}
              className="px-6 py-3.5 rounded-xl bg-[var(--bg-primary)] hover:bg-[var(--bg-hover)] border border-[var(--border-color)] text-[var(--text-primary)] font-bold text-sm transition-colors cursor-pointer"
            >
              Browse All Markets
            </button>
            {!isAuthenticated && (
              <button
                onClick={() => openAuthModal('register')}
                className="px-6 py-3.5 rounded-xl bg-[var(--bg-elevated)] hover:bg-[var(--bg-hover)] border border-[var(--border-color)] text-[#F0B90B] font-bold text-sm transition-colors cursor-pointer"
              >
                Register Account
              </button>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};
