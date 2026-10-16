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
  Star,
  Download,
  Smartphone,
  Monitor,
  ExternalLink,
  Trophy,
  HelpCircle,
  MessageSquare,
  BookOpen,
  Laptop,
  Apple,
} from 'lucide-react';
import { useExchange } from '../context/ExchangeContext';
import { formatPrice, formatCompactNumber } from '../data/exchangeData';
import { CryptoIcon } from '../components/CryptoIcon';
import { Sparkline } from '../components/Sparkline';

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
  const [heroWidgetTab, setHeroWidgetTab] = useState<'popular' | 'new' | 'gainers' | 'volume'>('popular');
  const [heroEmail, setHeroEmail] = useState('');

  // Full Market Overview Table State
  const [tableTab, setTableTab] = useState<'All' | 'Spot' | 'Futures' | 'Gainers' | 'Losers' | 'Volume'>('All');
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
  const solTicker = useMemo(
    () => tickers.find((t) => t.symbol === 'SOLUSDT') || tickers[2] || null,
    [tickers]
  );
  const bnbTicker = useMemo(
    () => tickers.find((t) => t.symbol === 'BNBUSDT') || tickers[3] || null,
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
        .slice(0, 5);
    }
    if (heroWidgetTab === 'gainers') {
      return list.sort((a, b) => b.priceChangePercent - a.priceChangePercent).slice(0, 5);
    }
    if (heroWidgetTab === 'volume') {
      return list.sort((a, b) => b.quoteVolume24h - a.quoteVolume24h).slice(0, 5);
    }
    return list.slice(0, 5);
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
    if (tableTab === 'Gainers') {
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
      q: 'What is a cryptocurrency exchange?',
      a: 'A cryptocurrency exchange is a digital marketplace where users can buy, sell, convert, and trade cryptocurrencies like Bitcoin (BTC), Ethereum (ETH), Tether (USDT), and Solana (SOL). Binance provides deep institutional order book liquidity across Spot, USDⓈ-M Perpetual Futures, Zero-Fee Convert, and Escrow P2P markets.',
    },
    {
      q: 'Can I explore live markets, charts, and order books without logging in?',
      a: 'Yes! Binance allows you to inspect 100% of public markets, real-time candlestick charts (1m to 1D), depth order books, 24-hour volume stats, and Proof of Reserves with zero login walls. Authentication is only required when placing orders or managing deposits and withdrawals.',
    },
    {
      q: 'What products does Binance provide?',
      a: 'Binance offers a complete crypto ecosystem: Spot Trading (350+ pairs), USDⓈ-M Perpetual Futures (up to 125x leverage), P2P Local Fiat Trading (0% fee via UPI, IMPS, SEPA, Zelle), Instant Convert & OTC Block Trading, Simple Earn Flexible/Locked staking vaults, and Launchpool token launch airdrops.',
    },
    {
      q: 'How to buy Bitcoin and other cryptocurrencies on Binance?',
      a: 'You can purchase crypto in minutes using Visa/Mastercard, Apple Pay, SEPA, or Bank Transfer on the Buy Crypto gateway, or trade directly with verified peer-to-peer merchants on the P2P Marketplace using your local currency at 0% transaction fee.',
    },
    {
      q: 'How does Binance protect user funds and assets?',
      a: 'Every user account is backed by an atomic relational SQL ledger with double-entry balance locks, 1:1 Merkle-tree Proof of Reserves, hardware Passkey & Google Authenticator TOTP 2FA, withdrawal address whitelisting, and a dedicated $1,000,000,000 SAFU insurance protection reserve.',
    },
    {
      q: 'How can I earn passive income from idle crypto?',
      a: 'Navigate to Simple Earn to subscribe your idle USDT, USDC, BTC, ETH, SOL, or BNB into Flexible or Fixed-Term vaults earning up to 11.40% APR, with automatic eligibility for retroactive HODLer Airdrop token distributions.',
    },
  ];

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)]">
      {/* 1. TOP ANNOUNCEMENT & REAL-TIME TICKER STRIP (EXACT BINANCE BANNER) */}
      <div className="bg-[var(--bg-secondary)] border-b border-[var(--border-color)]">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 py-2.5 flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <Volume2 className="w-3.5 h-3.5 text-[#2E68FF] shrink-0" />
            <span className="text-[var(--text-secondary)] truncate">
              Binance Will List Hyperion ZK (HYPR) with Seed Tag Applied · Zero Maker Fee on USDC Pairs · 1:1 Proof of Reserves Live
            </span>
            <span className="hidden md:inline text-[var(--text-muted)] font-mono-num">2026-10-16</span>
          </div>
          <div className="flex items-center gap-4 shrink-0">
            <button
              onClick={() => navigate('/announcements')}
              className="text-[#2E68FF] hover:underline font-semibold flex items-center gap-0.5 cursor-pointer"
            >
              More
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

        {/* Real-Time Scrolling Price Ticker Tape */}
        {tickers.length > 0 && (
          <div className="border-t border-[var(--border-color)]/60 bg-[var(--bg-primary)]/60 px-4 lg:px-8 py-2 overflow-x-auto no-scrollbar">
            <div className="max-w-7xl mx-auto flex items-center gap-8 whitespace-nowrap text-xs">
              {tickers.slice(0, 8).map((t) => {
                const isUp = t.priceChangePercent >= 0;
                return (
                  <button
                    key={t.symbol}
                    onClick={() => navigate('/trade/spot', t.symbol)}
                    className="inline-flex items-center gap-2 hover:opacity-80 transition-opacity cursor-pointer group"
                  >
                    <span className="font-bold text-[var(--text-primary)] group-hover:text-[#2E68FF] transition-colors">
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

      {/* 2. SPLIT HERO SECTION (EXACT BINANCE REFERENCE: "240,000,000+ USERS TRUST US") */}
      <section className="max-w-7xl mx-auto px-4 lg:px-8 pt-10 pb-14 lg:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Left 7 Columns: Mega Headline, Registration Form, Social Auth & Trust Metrics */}
          <div className="lg:col-span-7 space-y-8">
            <div className="space-y-3">
              <div className="font-display font-extrabold tracking-tight leading-[1.04]">
                <div className="text-4xl sm:text-6xl lg:text-[72px] text-[#2E68FF] font-mono-num">
                  240,000,000+
                </div>
                <div className="text-3xl sm:text-5xl lg:text-[60px] text-[var(--text-primary)] mt-1 uppercase">
                  Users Trust Us
                </div>
              </div>
              <p className="text-sm sm:text-base text-[var(--text-secondary)] max-w-xl leading-relaxed pt-1">
                Buy, trade, and hold 350+ cryptocurrencies on Binance — the world's leading cryptocurrency exchange.
              </p>
            </div>

            {/* Quick Action Input / Logged In Portfolio Snapshot */}
            {!isAuthenticated ? (
              <div className="space-y-4 max-w-xl">
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
                    className="flex-1 px-4 py-3.5 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] hover:border-[#2E68FF]/60 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[#2E68FF] transition-colors"
                  />
                  <button
                    type="submit"
                    className="px-8 py-3.5 rounded-xl bg-[#2E68FF] hover:bg-[#1D4ED8] text-white font-bold text-sm transition-colors whitespace-nowrap flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                  >
                    Sign Up
                  </button>
                </form>

                {/* Continue With & Quick Public Navigation */}
                <div className="flex flex-wrap items-center justify-between gap-4 pt-1 text-xs text-[var(--text-muted)]">
                  <div className="flex items-center gap-3">
                    <span>Or continue with</span>
                    <button
                      type="button"
                      onClick={() => openAuthModal('register')}
                      className="px-3.5 py-1.5 rounded-lg bg-[var(--bg-secondary)] hover:bg-[var(--bg-hover)] border border-[var(--border-color)] text-[var(--text-primary)] font-semibold cursor-pointer transition-colors flex items-center gap-1.5"
                    >
                      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"/>
                        <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"/>
                        <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/>
                        <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
                      </svg>
                      Google
                    </button>
                    <button
                      type="button"
                      onClick={() => openAuthModal('register')}
                      className="px-3.5 py-1.5 rounded-lg bg-[var(--bg-secondary)] hover:bg-[var(--bg-hover)] border border-[var(--border-color)] text-[var(--text-primary)] font-semibold cursor-pointer transition-colors flex items-center gap-1.5"
                    >
                      <Apple className="w-3.5 h-3.5" />
                      Apple
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => navigate('/trade/spot', 'BTCUSDT')}
                      className="text-[#2E68FF] hover:underline font-bold flex items-center gap-1 cursor-pointer"
                    >
                      Trade Without Login
                      <ArrowRight className="w-3.5 h-3.5" />
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
                      className="px-4 py-2.5 rounded-lg bg-[#2E68FF] hover:bg-[#1D4ED8] text-white text-xs font-bold cursor-pointer transition-colors"
                    >
                      Deposit
                    </button>
                    <button
                      onClick={() => navigate('/trade/spot')}
                      className="px-4 py-2.5 rounded-lg bg-[var(--bg-elevated)] hover:bg-[var(--bg-hover)] border border-[var(--border-color)] text-xs font-bold text-[var(--text-primary)] cursor-pointer transition-colors"
                    >
                      Trade Now
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Quantitative Exchange Proof Metrics (Binance 4-Column Bar) */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 pt-6 border-t border-[var(--border-color)]">
              <div>
                <div className="text-xl sm:text-2xl font-bold font-mono-num text-[var(--text-primary)]">
                  {total24hVolume > 0 ? `$${formatCompactNumber(total24hVolume)}` : '$76.4B+'}
                </div>
                <div className="text-xs text-[var(--text-muted)] mt-0.5">
                  24h trading volume on exchange
                </div>
              </div>
              <div>
                <div className="text-xl sm:text-2xl font-bold font-mono-num text-[var(--text-primary)]">
                  {tickers.length > 0 ? `${tickers.length * 20}+` : '350+'}
                </div>
                <div className="text-xs text-[var(--text-muted)] mt-0.5">
                  Cryptocurrencies listed
                </div>
              </div>
              <div>
                <div className="text-xl sm:text-2xl font-bold font-mono-num text-[var(--text-primary)]">
                  $1.0B
                </div>
                <div className="text-xs text-[var(--text-muted)] mt-0.5">
                  SAFU user protection fund
                </div>
              </div>
              <div>
                <div className="text-xl sm:text-2xl font-bold font-mono-num text-[#0ECB81]">
                  &lt;0.10%
                </div>
                <div className="text-xs text-[var(--text-muted)] mt-0.5">
                  Lowest transaction fees
                </div>
              </div>
            </div>
          </div>

          {/* Right 5 Columns: Live Market Card with Mini Sparklines + Announcements */}
          <div className="lg:col-span-5 space-y-4">
            {/* Live Market Card */}
            <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl p-4 sm:p-5 shadow-lg space-y-3">
              <div className="flex items-center justify-between pb-3 border-b border-[var(--border-color)]">
                <div className="flex items-center gap-4">
                  {(
                    [
                      { id: 'popular', label: 'Popular' },
                      { id: 'new', label: 'New Listing' },
                      { id: 'gainers', label: 'Top Gainers' },
                      { id: 'volume', label: '24h Volume' },
                    ] as const
                  ).map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setHeroWidgetTab(tab.id)}
                      className={`text-xs font-bold pb-2 -mb-3.5 transition-colors cursor-pointer ${
                        heroWidgetTab === tab.id
                          ? 'text-[var(--text-primary)] border-b-2 border-[#2E68FF]'
                          : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => navigate('/markets')}
                  className="text-xs text-[var(--text-muted)] hover:text-[#2E68FF] flex items-center gap-0.5 cursor-pointer"
                >
                  View All Markets
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="space-y-1">
                {marketLoading && heroDisplayedTickers.length === 0 ? (
                  <div className="py-12 text-center text-xs text-[var(--text-muted)]">
                    Connecting to live market stream...
                  </div>
                ) : marketError && heroDisplayedTickers.length === 0 ? (
                  <div className="py-10 text-center space-y-2">
                    <div className="text-xs font-bold text-[#F6465D]">{marketError}</div>
                    <button
                      onClick={refreshMarkets}
                      className="px-3 py-1.5 rounded bg-[#2E68FF] text-white text-xs font-bold cursor-pointer"
                    >
                      Retry Connection
                    </button>
                  </div>
                ) : (
                  heroDisplayedTickers.map((t) => {
                    const isUp = t.priceChangePercent >= 0;
                    return (
                      <div
                        key={t.symbol}
                        onClick={() => navigate('/trade/spot', t.symbol)}
                        className="flex items-center justify-between py-2.5 px-2.5 rounded-xl hover:bg-[var(--bg-hover)] transition-colors cursor-pointer group"
                      >
                        <div className="flex items-center gap-3">
                          <CryptoIcon symbol={t.baseAsset} size="md" />
                          <div>
                            <div className="text-sm font-bold text-[var(--text-primary)] group-hover:text-[#2E68FF] transition-colors">
                              {t.baseAsset}
                            </div>
                            <div className="text-[11px] text-[var(--text-muted)]">{t.name}</div>
                          </div>
                        </div>

                        {/* Sparkline preview */}
                        <div className="hidden sm:block">
                          <Sparkline changePercent={t.priceChangePercent} width={72} height={24} />
                        </div>

                        <div className="text-right">
                          <div className="font-mono-num text-sm font-semibold text-[var(--text-primary)]">
                            ${formatPrice(t.price)}
                          </div>
                          <div
                            className={`font-mono-num text-xs font-semibold ${
                              isUp ? 'text-[#0ECB81]' : 'text-[#F6465D]'
                            }`}
                          >
                            {isUp ? '+' : ''}
                            {t.priceChangePercent.toFixed(2)}%
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* News & Announcements Card */}
            <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl p-4 sm:p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[var(--text-primary)] flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#2E68FF]" />
                  News & Announcements
                </span>
                <button
                  onClick={() => navigate('/announcements')}
                  className="text-xs text-[var(--text-muted)] hover:text-[#2E68FF] flex items-center gap-0.5 cursor-pointer"
                >
                  View All News
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="space-y-2 text-xs">
                <div
                  onClick={() => navigate('/airdrop')}
                  className="flex items-center justify-between py-1 text-[var(--text-secondary)] hover:text-[#2E68FF] cursor-pointer"
                >
                  <span className="truncate">
                    • Introducing Hyperion ZK (HYPR) on HODLer Airdrops! Subscribe BNB to Simple Earn
                  </span>
                  <span className="text-[10px] font-mono-num text-[#0ECB81] shrink-0 ml-2">
                    ACTIVE
                  </span>
                </div>
                <div
                  onClick={() => navigate('/fees')}
                  className="flex items-center justify-between py-1 text-[var(--text-secondary)] hover:text-[#2E68FF] cursor-pointer"
                >
                  <span className="truncate">
                    • Notice on Zero Maker Fee Promotion for All USDC Spot & Margin Pairs
                  </span>
                  <span className="text-[10px] font-mono-num text-[#2E68FF] shrink-0 ml-2">
                    PROMO
                  </span>
                </div>
                <div
                  onClick={() => navigate('/trade/futures')}
                  className="flex items-center justify-between py-1 text-[var(--text-secondary)] hover:text-[#2E68FF] cursor-pointer"
                >
                  <span className="truncate">
                    • USDⓈ-M Futures Will Launch SUI & RENDER Perpetual Contracts with 75x Leverage
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

      {/* 2.5 BINANCE FEATURED PROMO / CAMPAIGN BANNER STRIP */}
      <section className="max-w-7xl mx-auto px-4 lg:px-8 pb-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div
            onClick={() => openAuthModal('register')}
            className="group relative overflow-hidden rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-color)] hover:border-[#2E68FF] p-4 sm:p-5 transition-all cursor-pointer flex flex-col justify-between"
          >
            <div className="flex items-start justify-between gap-3">
              <span className="text-[10px] font-bold font-mono-num px-2 py-0.5 rounded-full bg-[#2E68FF]/15 text-[#2E68FF] uppercase tracking-wider">
                New User Gift
              </span>
              <Gift className="w-5 h-5 text-[#2E68FF] group-hover:scale-110 transition-transform" />
            </div>
            <div className="my-3">
              <div className="font-bold text-sm text-[var(--text-primary)] group-hover:text-[#2E68FF] transition-colors">
                Claim up to $100 Welcome Bonus
              </div>
              <p className="text-xs text-[var(--text-secondary)] mt-1 line-clamp-2">
                Sign up and complete task verification to unlock zero-fee spot trading rebate vouchers.
              </p>
            </div>
            <div className="flex items-center gap-1 text-xs font-bold text-[#2E68FF]">
              <span>Claim Voucher</span>
              <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          <div
            onClick={() => navigate('/airdrop')}
            className="group relative overflow-hidden rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-color)] hover:border-[#2E68FF] p-4 sm:p-5 transition-all cursor-pointer flex flex-col justify-between"
          >
            <div className="flex items-start justify-between gap-3">
              <span className="text-[10px] font-bold font-mono-num px-2 py-0.5 rounded-full bg-[#0ECB81]/15 text-[#0ECB81] uppercase tracking-wider">
                Launchpool Live
              </span>
              <Sparkles className="w-5 h-5 text-[#0ECB81] group-hover:scale-110 transition-transform" />
            </div>
            <div className="my-3">
              <div className="font-bold text-sm text-[var(--text-primary)] group-hover:text-[#2E68FF] transition-colors">
                Stake BNB & USDT to Farm HYPR
              </div>
              <p className="text-xs text-[var(--text-secondary)] mt-1 line-clamp-2">
                Deposit crypto into Launchpool pools and earn daily retroactive token rewards up to 34.2% APY.
              </p>
            </div>
            <div className="flex items-center gap-1 text-xs font-bold text-[#0ECB81]">
              <span>Stake to Farm</span>
              <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          <div
            onClick={() => navigate('/trade/spot')}
            className="group relative overflow-hidden rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-color)] hover:border-[#2E68FF] p-4 sm:p-5 transition-all cursor-pointer flex flex-col justify-between"
          >
            <div className="flex items-start justify-between gap-3">
              <span className="text-[10px] font-bold font-mono-num px-2 py-0.5 rounded-full bg-[#2E68FF]/15 text-[#2E68FF] uppercase tracking-wider">
                Fee Holiday
              </span>
              <Zap className="w-5 h-5 text-[#2E68FF] group-hover:scale-110 transition-transform" />
            </div>
            <div className="my-3">
              <div className="font-bold text-sm text-[var(--text-primary)] group-hover:text-[#2E68FF] transition-colors">
                0% Maker Fee on USDC Pairs
              </div>
              <p className="text-xs text-[var(--text-secondary)] mt-1 line-clamp-2">
                Enjoy 0 trading fees when placing maker limit orders across all USDC, EUR, and stablecoin markets.
              </p>
            </div>
            <div className="flex items-center gap-1 text-xs font-bold text-[#2E68FF]">
              <span>Trade Zero Fee</span>
              <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          <div
            onClick={() => navigate('/announcements')}
            className="group relative overflow-hidden rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-color)] hover:border-[#2E68FF] p-4 sm:p-5 transition-all cursor-pointer flex flex-col justify-between"
          >
            <div className="flex items-start justify-between gap-3">
              <span className="text-[10px] font-bold font-mono-num px-2 py-0.5 rounded-full bg-[#2E68FF]/15 text-[#2E68FF] uppercase tracking-wider">
                Tournament
              </span>
              <Trophy className="w-5 h-5 text-[#2E68FF] group-hover:scale-110 transition-transform" />
            </div>
            <div className="my-3">
              <div className="font-bold text-sm text-[var(--text-primary)] group-hover:text-[#2E68FF] transition-colors">
                100,000 USDT Spot Championship
              </div>
              <p className="text-xs text-[var(--text-secondary)] mt-1 line-clamp-2">
                Compete on trading volume leaderboard and share the seasonal prize pool with verified traders.
              </p>
            </div>
            <div className="flex items-center gap-1 text-xs font-bold text-[#2E68FF]">
              <span>Join Challenge</span>
              <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>
      </section>

      {/* 3. 4-CARD TOP MARKET SUMMARY PULSE (HOT COINS, NEW LISTINGS, TOP GAINERS, 24H VOLUME) */}
      <section className="max-w-7xl mx-auto px-4 lg:px-8 pb-12">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-5">
          <div>
            <div className="text-xs font-bold text-[#2E68FF] uppercase tracking-wider">
              Real-Time Market Pulse
            </div>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-[var(--text-primary)] mt-1">
              Trending Cryptocurrencies & Gainers
            </h2>
          </div>
          <button
            onClick={() => navigate('/markets')}
            className="text-xs font-bold text-[#2E68FF] hover:underline flex items-center gap-1 cursor-pointer"
          >
            Open Full Market Screener
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Hot Coins */}
          <div className="p-4 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-color)] space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-[var(--text-primary)] pb-2 border-b border-[var(--border-color)]">
              <span className="flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-[#2E68FF]" />
                Hot Coins
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

          {/* Card 2: New Listings */}
          <div className="p-4 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-color)] space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-[var(--text-primary)] pb-2 border-b border-[var(--border-color)]">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-[#0ECB81]" />
                New Listings
              </span>
              <span className="text-[11px] text-[var(--text-muted)]">24h Change</span>
            </div>
            <div className="space-y-1.5">
              {tickers
                .filter((t) => ['SUI', 'RENDER', 'NEAR', 'ARB'].includes(t.baseAsset))
                .slice(0, 4)
                .map((item) => {
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

          {/* Card 3: Top Gainers */}
          <div className="p-4 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-color)] space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-[var(--text-primary)] pb-2 border-b border-[var(--border-color)]">
              <span className="flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-[#0ECB81]" />
                Top Gainer Coin
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

          {/* Card 4: Top Volume Coin */}
          <div className="p-4 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-color)] space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-[var(--text-primary)] pb-2 border-b border-[var(--border-color)]">
              <span className="flex items-center gap-1.5">
                <BarChart3 className="w-4 h-4 text-[#2E68FF]" />
                Top Volume Coin
              </span>
              <span className="text-[11px] text-[var(--text-muted)]">24h Volume</span>
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
      </section>

      {/* 4. POPULAR TRADING PAIRS & HIGH-DENSITY MARKET OVERVIEW TABLE (WITH 7D SPARKLINES) */}
      <section className="max-w-7xl mx-auto px-4 lg:px-8 pb-14">
        <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl p-5 sm:p-6 space-y-5">
          {/* Sub-tabs & Search */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-[var(--border-color)] pb-4">
            <div className="flex items-center gap-6 overflow-x-auto">
              {(
                [
                  { id: 'All', label: 'Popular Trading Pairs' },
                  { id: 'Spot', label: 'Spot Markets' },
                  { id: 'Futures', label: 'Futures Markets' },
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
                      ? 'text-[#2E68FF] border-b-2 border-[#2E68FF]'
                      : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <div className="flex items-center gap-2 bg-[var(--bg-primary)] border border-[var(--border-color)] focus-within:border-[#2E68FF] rounded-xl px-3 py-1.5">
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

          {/* Category Filter Pills */}
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap cursor-pointer ${
                    selectedCategory === cat
                      ? 'bg-[#2E68FF] text-white'
                      : 'bg-[var(--bg-primary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border-color)]'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
            <span className="text-[11px] text-[var(--text-muted)] font-mono-num">
              Showing {filteredTableTickers.length} live trading pairs · Click any row to trade
            </span>
          </div>

          {/* High Density Market Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[var(--border-color)] text-[11px] text-[var(--text-muted)]">
                  <th className="py-3 px-3">Name</th>
                  <th className="py-3 px-3 text-right">Price</th>
                  <th className="py-3 px-3 text-right">24h Change</th>
                  <th className="py-3 px-3 text-right hidden md:table-cell">24h High / Low</th>
                  <th className="py-3 px-3 text-right hidden sm:table-cell">24h Volume</th>
                  <th className="py-3 px-3 text-right hidden lg:table-cell">Market Cap</th>
                  <th className="py-3 px-3 text-center hidden md:table-cell">7D Chart</th>
                  <th className="py-3 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-color)]/60 text-xs">
                {marketLoading && filteredTableTickers.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-[var(--text-muted)]">
                      Loading live trading pairs from backend market service...
                    </td>
                  </tr>
                ) : marketError && filteredTableTickers.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center space-y-2">
                      <div className="text-[#F6465D] font-bold">{marketError}</div>
                      <button
                        onClick={refreshMarkets}
                        className="px-4 py-1.5 rounded bg-[#2E68FF] text-white text-xs font-bold cursor-pointer"
                      >
                        Retry Live Feed
                      </button>
                    </td>
                  </tr>
                ) : filteredTableTickers.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-10 text-center text-[var(--text-muted)]">
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
                        className="hover:bg-[var(--bg-hover)] transition-colors cursor-pointer group"
                      >
                        <td className="py-3.5 px-3">
                          <div className="flex items-center gap-3">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleFavoritePair(t.symbol);
                              }}
                              className="text-[var(--text-muted)] hover:text-[#2E68FF]"
                            >
                              <Star className={`w-3.5 h-3.5 ${t.isFavorite ? 'fill-[#2E68FF] text-[#2E68FF]' : ''}`} />
                            </button>
                            <CryptoIcon symbol={t.baseAsset} size="md" />
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span className="font-bold text-sm text-[var(--text-primary)] group-hover:text-[#2E68FF] transition-colors">
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
                        <td className="py-3.5 px-3 text-center hidden md:table-cell">
                          <div className="flex justify-center">
                            <Sparkline changePercent={t.priceChangePercent} width={88} height={26} />
                          </div>
                        </td>
                        <td className="py-3.5 px-3 text-right">
                          <div className="inline-flex items-center gap-2">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate('/convert');
                              }}
                              className="px-2.5 py-1.5 rounded-lg bg-[var(--bg-primary)] hover:bg-[var(--bg-elevated)] border border-[var(--border-color)] text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer transition-colors"
                            >
                              Convert
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate('/trade/spot', t.symbol);
                              }}
                              className="px-3 py-1.5 rounded-lg bg-[#2E68FF]/15 hover:bg-[#2E68FF] text-[#2E68FF] hover:text-white text-xs font-bold transition-colors cursor-pointer"
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
              className="px-6 py-2.5 rounded-xl bg-[var(--bg-primary)] hover:bg-[var(--bg-hover)] border border-[var(--border-color)] text-xs font-bold text-[#2E68FF] flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              View All 350+ Markets & Advanced Screeners
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </section>

      {/* 5. QUICK BUY CRYPTO & ZERO-FEE CONVERT SECTION + BEGINNER-FRIENDLY ONBOARDING */}
      <section className="border-y border-[var(--border-color)] bg-[var(--bg-secondary)]/40 py-14 px-4 lg:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Left 7 Columns: Beginner 3-Step Guide */}
          <div className="lg:col-span-7 space-y-6">
            <div className="space-y-2">
              <div className="text-xs font-bold text-[#2E68FF] uppercase tracking-wider">
                Beginner-Friendly Crypto Gateway
              </div>
              <h2 className="font-display text-2xl sm:text-4xl font-bold text-[var(--text-primary)]">
                Buy or Convert Crypto in 3 Simple Steps
              </h2>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed max-w-2xl">
                Whether you are buying your first Bitcoin with local currency or rebalancing a portfolio, Binance provides transparent live pricing with zero hidden spreads.
              </p>
            </div>

            {/* 3 Beginner Steps */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div
                onClick={() => navigate('/markets')}
                className="p-4 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] hover:border-[#2E68FF] transition-colors cursor-pointer space-y-2"
              >
                <div className="w-7 h-7 rounded-lg bg-[#2E68FF]/15 text-[#2E68FF] font-mono-num text-xs font-bold flex items-center justify-center">
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
                className="p-4 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] hover:border-[#2E68FF] transition-colors cursor-pointer space-y-2"
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
                className="p-4 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] hover:border-[#2E68FF] transition-colors cursor-pointer space-y-2"
              >
                <div className="w-7 h-7 rounded-lg bg-[#2E68FF]/15 text-[#2E68FF] font-mono-num text-xs font-bold flex items-center justify-center">
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
                        ? 'text-[#2E68FF] border-b-2 border-[#2E68FF]'
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
                        ? 'text-[#2E68FF] border-b-2 border-[#2E68FF]'
                        : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                    }`}
                  >
                    0% Fee Convert
                  </button>
                </div>
                <span className="text-[11px] font-mono-num text-[#0ECB81]">Live Rate</span>
              </div>

              {/* Spend Input Box */}
              <div className="p-4 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-color)] focus-within:border-[#2E68FF] space-y-1.5">
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
                  Binance Live Order Book
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => navigate(quickSide === 'Buy' ? '/buy-crypto' : '/convert')}
                  className="w-full py-3 rounded-xl bg-[#2E68FF] hover:bg-[#1D4ED8] text-white font-bold text-xs transition-colors cursor-pointer"
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

      {/* 6. TRADING FEATURES & ECOSYSTEM SUITE */}
      <section className="max-w-7xl mx-auto py-14 px-4 lg:px-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="text-xs font-bold text-[#2E68FF] uppercase tracking-wider">
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
            className="p-6 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-color)] hover:border-[#2E68FF] transition-all cursor-pointer flex flex-col justify-between space-y-5 group"
          >
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#2E68FF]/15 text-[#2E68FF] flex items-center justify-center">
                <BarChart3 className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-[var(--text-primary)] group-hover:text-[#2E68FF] transition-colors">
                Spot Trading Terminal
              </h3>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                Trade major and emerging pairs with real-time candlestick charts, MA/EMA/BOLL indicators, live depth book, and Limit, Market & Stop-Limit execution.
              </p>
            </div>
            <div className="pt-3 border-t border-[var(--border-color)] flex items-center justify-between text-xs font-bold text-[#2E68FF]">
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
            className="p-6 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-color)] hover:border-[#2E68FF] transition-all cursor-pointer flex flex-col justify-between space-y-5 group"
          >
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#0ECB81]/15 text-[#0ECB81] flex items-center justify-center">
                <Zap className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-[var(--text-primary)] group-hover:text-[#2E68FF] transition-colors">
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
            className="p-6 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-color)] hover:border-[#2E68FF] transition-all cursor-pointer flex flex-col justify-between space-y-5 group"
          >
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#2E68FF]/15 text-[#2E68FF] flex items-center justify-center">
                <Layers className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-[var(--text-primary)] group-hover:text-[#2E68FF] transition-colors">
                Simple Earn Yield Vaults
              </h3>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                Put idle USDT, USDC, BTC, ETH, SOL, and BNB to work in principal-protected Flexible or Fixed-Term vaults with daily yield distribution.
              </p>
            </div>
            <div className="pt-3 border-t border-[var(--border-color)] flex items-center justify-between text-xs font-bold text-[#2E68FF]">
              <span>Up to 11.40% Est. APR</span>
              <span className="flex items-center gap-1">
                View Vaults <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>

          {/* P2P Marketplace */}
          <div
            onClick={() => navigate('/p2p')}
            className="p-6 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-color)] hover:border-[#2E68FF] transition-all cursor-pointer flex flex-col justify-between space-y-5 group"
          >
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#0ECB81]/15 text-[#0ECB81] flex items-center justify-center">
                <Users className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-[var(--text-primary)] group-hover:text-[#2E68FF] transition-colors">
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
            className="p-6 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-color)] hover:border-[#2E68FF] transition-all cursor-pointer flex flex-col justify-between space-y-5 group"
          >
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#2E68FF]/15 text-[#2E68FF] flex items-center justify-center">
                <Repeat className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-[var(--text-primary)] group-hover:text-[#2E68FF] transition-colors">
                Instant Convert & Block OTC
              </h3>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                Swap between any supported digital assets in one click with guaranteed institutional quotes, zero slippage, and instant Spot wallet settlement.
              </p>
            </div>
            <div className="pt-3 border-t border-[var(--border-color)] flex items-center justify-between text-xs font-bold text-[#2E68FF]">
              <span>Zero Trading Fees</span>
              <span className="flex items-center gap-1">
                Swap Assets <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>

          {/* Megadrop & Airdrop Portal */}
          <div
            onClick={() => navigate('/airdrop')}
            className="p-6 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-color)] hover:border-[#2E68FF] transition-all cursor-pointer flex flex-col justify-between space-y-5 group"
          >
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#0ECB81]/15 text-[#0ECB81] flex items-center justify-center">
                <Gift className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-[var(--text-primary)] group-hover:text-[#2E68FF] transition-colors">
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

      {/* 7. YOUR TRUSTED CRYPTO EXCHANGE — SECURITY, PROOF OF RESERVES & SAFU */}
      <section className="border-t border-[var(--border-color)] bg-[var(--bg-secondary)]/30 py-14 px-4 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <div className="text-xs font-bold text-[#0ECB81] uppercase tracking-wider">
                Security & Institutional Trust
              </div>
              <h2 className="font-display text-2xl sm:text-4xl font-bold text-[var(--text-primary)] mt-1">
                Your Trusted Crypto Exchange
              </h2>
            </div>
            <button
              onClick={() => navigate('/proof-of-reserves')}
              className="text-xs font-bold text-[#2E68FF] hover:underline flex items-center gap-1 cursor-pointer"
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
              <div className="w-10 h-10 rounded-xl bg-[#2E68FF]/15 text-[#2E68FF] flex items-center justify-center">
                <Lock className="w-5 h-5" />
              </div>
              <div className="text-base font-bold text-[var(--text-primary)]">
                Atomic SQL Ledger Safety
              </div>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                All balances, limit order locks, cancellations, and trades execute inside strict ACID database transactions preventing race conditions.
              </p>
              <div className="pt-1 text-[11px] font-mono-num text-[#2E68FF] font-semibold">
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
              <div className="w-10 h-10 rounded-xl bg-[#2E68FF]/15 text-[#2E68FF] flex items-center justify-center">
                <Headphones className="w-5 h-5" />
              </div>
              <div className="text-base font-bold text-[var(--text-primary)]">
                24/7 Specialist Support & API
              </div>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                Low-latency REST & WebSocket market endpoints alongside round-the-clock multilingual customer support and dispute resolution.
              </p>
              <div className="pt-1 text-[11px] font-mono-num text-[#2E68FF] font-semibold">
                &lt; 60s Response Time
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 8. TRADE ON THE GO — EXACT BINANCE MOBILE APP & DESKTOP DOWNLOAD SECTION */}
      <section className="border-y border-[var(--border-color)] bg-[var(--bg-secondary)]/40 py-16 px-4 lg:px-8 overflow-hidden">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left 6 Columns: Realistic Smartphone App Device Frame Mockup */}
          <div className="lg:col-span-6 flex justify-center">
            <div className="w-[300px] sm:w-[340px] rounded-[44px] bg-[#0B0E11] p-3.5 shadow-2xl border-4 border-[#2B313A] relative">
              {/* Phone Dynamic Island */}
              <div className="absolute top-6 left-1/2 -translate-x-1/2 w-24 h-4 bg-black rounded-full z-20 flex items-center justify-end pr-2">
                <div className="w-2.5 h-2.5 rounded-full bg-[#181A20] border border-[#2B313A]" />
              </div>

              {/* Phone Inner Screen */}
              <div className="rounded-[36px] bg-[var(--bg-primary)] border border-[var(--border-color)] p-4 pt-8 space-y-3.5 text-xs overflow-hidden">
                {/* Status Bar */}
                <div className="flex items-center justify-between text-[11px] font-mono-num text-[var(--text-muted)] px-1">
                  <span>9:41</span>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#0ECB81]" />
                    <span>5G</span>
                    <span className="border border-[var(--text-muted)] rounded px-1 text-[9px]">100%</span>
                  </div>
                </div>

                {/* Mobile Terminal Header */}
                <div className="flex items-center justify-between pb-2 border-b border-[var(--border-color)]">
                  <div className="flex items-center gap-2">
                    <CryptoIcon symbol="BTC" size="sm" />
                    <div>
                      <div className="font-bold text-sm text-[var(--text-primary)] flex items-center gap-1">
                        BTC/USDT
                        <span className="text-[10px] px-1 py-0.2 rounded bg-[#0ECB81]/15 text-[#0ECB81] font-semibold">Perp</span>
                      </div>
                      <div className="text-[10px] text-[var(--text-muted)] font-mono-num">
                        Vol {formatCompactNumber(btcTicker?.quoteVolume24h || 1450000000)}
                      </div>
                    </div>
                  </div>
                  <div className="text-right font-mono-num">
                    <div className="text-sm font-bold text-[#0ECB81]">
                      ${formatPrice(btcTicker?.price || 67420)}
                    </div>
                    <div className="text-[10px] text-[#0ECB81]">
                      +{btcTicker?.priceChangePercent?.toFixed(2) || '2.45'}%
                    </div>
                  </div>
                </div>

                {/* Mini Candlestick Graphic */}
                <div className="h-28 bg-[var(--bg-secondary)] rounded-xl p-2 flex flex-col justify-between border border-[var(--border-color)]">
                  <div className="flex items-center justify-between text-[10px] text-[var(--text-muted)] font-mono-num">
                    <span>15m · Candles</span>
                    <span className="text-[#2E68FF]">MA(7): 67,310</span>
                  </div>
                  {/* Candlestick visual bars */}
                  <div className="flex items-end justify-between h-16 px-1 pt-1">
                    {[
                      { h: 42, up: true },
                      { h: 36, up: false },
                      { h: 58, up: true },
                      { h: 48, up: true },
                      { h: 32, up: false },
                      { h: 65, up: true },
                      { h: 74, up: true },
                      { h: 62, up: false },
                      { h: 80, up: true },
                      { h: 92, up: true },
                    ].map((bar, i) => (
                      <div key={i} className="flex flex-col items-center w-3 h-full justify-end">
                        <div className={`w-0.5 h-full ${bar.up ? 'bg-[#0ECB81]' : 'bg-[#F6465D]'}`} />
                        <div
                          style={{ height: `${bar.h}%` }}
                          className={`w-2.5 rounded-xs ${bar.up ? 'bg-[#0ECB81]' : 'bg-[#F6465D]'}`}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Live Mini Depth & Orderbook */}
                <div className="grid grid-cols-2 gap-2 text-[10px] font-mono-num bg-[var(--bg-secondary)] p-2 rounded-xl border border-[var(--border-color)]">
                  <div className="space-y-1">
                    <div className="text-[9px] text-[var(--text-muted)] uppercase">Bid (Buy)</div>
                    <div className="text-[#0ECB81] flex justify-between"><span>67,410.2</span><span>0.84</span></div>
                    <div className="text-[#0ECB81] flex justify-between"><span>67,405.0</span><span>1.22</span></div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-[9px] text-[var(--text-muted)] uppercase">Ask (Sell)</div>
                    <div className="text-[#F6465D] flex justify-between"><span>67,415.5</span><span>0.61</span></div>
                    <div className="text-[#F6465D] flex justify-between"><span>67,422.0</span><span>1.95</span></div>
                  </div>
                </div>

                {/* Mobile Bottom Trade Buttons */}
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    onClick={() => navigate('/trade/spot', 'BTCUSDT')}
                    className="py-2.5 rounded-xl bg-[#0ECB81] text-white font-bold text-center text-xs cursor-pointer shadow-sm hover:opacity-90"
                  >
                    Buy / Long
                  </button>
                  <button
                    onClick={() => navigate('/trade/spot', 'BTCUSDT')}
                    className="py-2.5 rounded-xl bg-[#F6465D] text-white font-bold text-center text-xs cursor-pointer shadow-sm hover:opacity-90"
                  >
                    Sell / Short
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right 6 Columns: Binance Exact Download & Multi-Platform Access */}
          <div className="lg:col-span-6 space-y-6">
            <div className="space-y-2">
              <div className="text-xs font-bold text-[#2E68FF] uppercase tracking-wider">
                Trade On The Go. Anywhere, Anytime.
              </div>
              <h2 className="font-display text-2xl sm:text-4xl font-bold text-[var(--text-primary)]">
                Stay Ahead with the Binance App
              </h2>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed max-w-xl">
                Experience institutional execution, sub-millisecond price alerts, and biometrics on any device with 100% feature and theme synchronization.
              </p>
            </div>

            {/* QR Code Download Card */}
            <div className="p-5 rounded-2xl bg-[var(--bg-primary)] border border-[var(--border-color)] flex items-center gap-5 shadow-sm">
              <div className="w-20 h-20 rounded-xl bg-white p-2 flex items-center justify-center shrink-0 border border-[var(--border-color)] shadow-sm">
                <QrCode className="w-16 h-16 text-[#181A20]" />
              </div>
              <div className="space-y-1">
                <div className="text-xs text-[var(--text-muted)] font-medium">Scan to Download App</div>
                <div className="text-base font-bold text-[var(--text-primary)]">
                  iOS & Android Available
                </div>
                <div className="text-xs text-[#2E68FF] font-semibold">
                  Scan QR code with your mobile camera for instant access
                </div>
              </div>
            </div>

            {/* Platform Download Badges Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[
                { name: 'App Store', sub: 'iOS 15.0+', icon: <Apple className="w-4 h-4 text-[var(--text-primary)]" />, path: '/trade/spot' },
                { name: 'Google Play', sub: 'Android 9.0+', icon: <Smartphone className="w-4 h-4 text-[var(--text-primary)]" />, path: '/trade/spot' },
                { name: 'Android APK', sub: 'Direct Install', icon: <Download className="w-4 h-4 text-[var(--text-primary)]" />, path: '/trade/spot' },
                { name: 'macOS', sub: 'Apple Silicon & Intel', icon: <Laptop className="w-4 h-4 text-[var(--text-primary)]" />, path: '/trade/spot' },
                { name: 'Windows', sub: 'x64 Binary', icon: <Monitor className="w-4 h-4 text-[var(--text-primary)]" />, path: '/trade/spot' },
                { name: 'Linux / API', sub: 'Debian / REST / WS', icon: <ExternalLink className="w-4 h-4 text-[var(--text-primary)]" />, path: '/api-docs' },
              ].map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => navigate(p.path as any)}
                  className="p-3 rounded-xl bg-[var(--bg-primary)] hover:bg-[var(--bg-hover)] border border-[var(--border-color)] hover:border-[#2E68FF] transition-all text-left cursor-pointer group"
                >
                  <div className="flex items-center gap-2">
                    {p.icon}
                    <span className="font-bold text-xs text-[var(--text-primary)] group-hover:text-[#2E68FF] transition-colors">
                      {p.name}
                    </span>
                  </div>
                  <div className="text-[10px] text-[var(--text-muted)] font-mono-num mt-1 pl-6">
                    {p.sub}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 8.5 24/7 CUSTOMER SERVICE & SUPPORT HUBS (EXACT BINANCE THREE-CARD SUPPORT) */}
      <section className="max-w-7xl mx-auto py-14 px-4 lg:px-8">
        <div className="text-center space-y-2 mb-8">
          <div className="text-xs font-bold text-[#2E68FF] uppercase tracking-wider">
            Round-The-Clock Service
          </div>
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-[var(--text-primary)]">
            Need Help? We Are Here For You 24/7
          </h2>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] max-w-xl mx-auto">
            Get round-the-clock support in 40+ languages, chat with live specialists, or consult comprehensive cryptocurrency guides.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div
            onClick={() => navigate('/support')}
            className="p-6 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-color)] hover:border-[#2E68FF] transition-all cursor-pointer space-y-4 group"
          >
            <div className="w-12 h-12 rounded-xl bg-[#2E68FF]/15 text-[#2E68FF] flex items-center justify-center">
              <Headphones className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-base text-[var(--text-primary)] group-hover:text-[#2E68FF] transition-colors">
                24/7 Chat Support
              </h3>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed mt-1.5">
                Connect directly with our customer service team. Average resolution response time is under 60 seconds with 24/7 coverage.
              </p>
            </div>
            <div className="pt-2 flex items-center gap-1 text-xs font-bold text-[#2E68FF]">
              <span>Chat Now</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          <div
            onClick={() => navigate('/support')}
            className="p-6 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-color)] hover:border-[#2E68FF] transition-all cursor-pointer space-y-4 group"
          >
            <div className="w-12 h-12 rounded-xl bg-[#0ECB81]/15 text-[#0ECB81] flex items-center justify-center">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-base text-[var(--text-primary)] group-hover:text-[#2E68FF] transition-colors">
                FAQs & Knowledge Base
              </h3>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed mt-1.5">
                Detailed step-by-step documentation covering deposits, withdrawals, KYC identity verification, and API integration.
              </p>
            </div>
            <div className="pt-2 flex items-center gap-1 text-xs font-bold text-[#0ECB81]">
              <span>Browse Guides</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          <div
            onClick={() => navigate('/announcements')}
            className="p-6 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-color)] hover:border-[#2E68FF] transition-all cursor-pointer space-y-4 group"
          >
            <div className="w-12 h-12 rounded-xl bg-[#2E68FF]/15 text-[#2E68FF] flex items-center justify-center">
              <Globe className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-base text-[var(--text-primary)] group-hover:text-[#2E68FF] transition-colors">
                Community & News
              </h3>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed mt-1.5">
                Stay updated with official token listings, scheduled network upgrades, maintenance windows, and global community channels.
              </p>
            </div>
            <div className="pt-2 flex items-center gap-1 text-xs font-bold text-[#2E68FF]">
              <span>View Announcements</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>
      </section>

      {/* 9. FAQ ACCORDION SECTION */}
      <section className="max-w-5xl mx-auto py-14 px-4 lg:px-8">
        <div className="text-center space-y-2 mb-8">
          <div className="text-xs font-bold text-[#2E68FF] uppercase tracking-wider">
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
                className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)]/50 px-5 py-4 transition-colors"
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
                  <span className="text-lg font-mono-num text-[#2E68FF]">
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

      {/* 10. FINAL CALL-TO-ACTION BANNER */}
      <section className="bg-[var(--bg-secondary)] border-t border-[var(--border-color)] py-14 px-4 text-center">
        <div className="max-w-3xl mx-auto space-y-5">
          <h2 className="font-display text-2xl sm:text-4xl font-bold text-[var(--text-primary)]">
            Start Earning Today
          </h2>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] max-w-xl mx-auto">
            Sign up now to build your own crypto portfolio with institutional-grade security, lowest fees, and real-time execution.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            {!isAuthenticated ? (
              <button
                onClick={() => openAuthModal('register')}
                className="px-8 py-3.5 rounded-xl bg-[#2E68FF] hover:bg-[#1D4ED8] text-white font-bold text-sm transition-colors cursor-pointer shadow-sm"
              >
                Sign Up Now
              </button>
            ) : (
              <button
                onClick={() => navigate('/trade/spot', 'BTCUSDT')}
                className="px-8 py-3.5 rounded-xl bg-[#2E68FF] hover:bg-[#1D4ED8] text-white font-bold text-sm transition-colors cursor-pointer shadow-sm"
              >
                Open Spot Terminal
              </button>
            )}
            <button
              onClick={() => navigate('/markets')}
              className="px-6 py-3.5 rounded-xl bg-[var(--bg-primary)] hover:bg-[var(--bg-hover)] border border-[var(--border-color)] text-[var(--text-primary)] font-bold text-sm transition-colors cursor-pointer"
            >
              Browse All Markets
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
