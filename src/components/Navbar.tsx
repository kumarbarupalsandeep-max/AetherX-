import React, { useState, useRef, useEffect } from 'react';
import {
  Search,
  Sun,
  Moon,
  Bell,
  Wallet,
  User,
  Menu,
  X,
  ChevronDown,
  ArrowUpRight,
  ShieldCheck,
  Gift,
  Users,
  Layers,
  Repeat,
  CreditCard,
  TrendingUp,
  LogOut,
  FileText,
  HelpCircle,
  Download,
  Globe,
  QrCode,
  Bot,
  Coins,
  Award,
  Sparkles,
} from 'lucide-react';
import { useExchange } from '../context/ExchangeContext';
import { RoutePath } from '../types/exchange';
import { formatPrice } from '../data/exchangeData';
import { CryptoIcon } from './CryptoIcon';

export const Navbar: React.FC = () => {
  const {
    route,
    navigate,
    theme,
    toggleTheme,
    tickers,
    isAuthenticated,
    user,
    openAuthModal,
    logout,
    notifications,
    pushToast,
  } = useExchange();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [currencyModalOpen, setCurrencyModalOpen] = useState(false);
  const [selectedLang, setSelectedLang] = useState('English (Global)');
  const [selectedCurrency, setSelectedCurrency] = useState('USD - $');
  const dropdownTimeout = useRef<number | null>(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const filteredSearchPairs = tickers.filter(
    (t) =>
      t.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    setMobileMenuOpen(false);
    setActiveDropdown(null);
    setSearchOpen(false);
  }, [route]);

  const handleMouseEnter = (menu: string) => {
    if (dropdownTimeout.current) window.clearTimeout(dropdownTimeout.current);
    setActiveDropdown(menu);
  };

  const handleMouseLeave = () => {
    dropdownTimeout.current = window.setTimeout(() => {
      setActiveDropdown(null);
    }, 140);
  };

  const navLinkClass = (active: boolean) =>
    `px-2.5 py-2 text-[14px] font-medium transition-colors whitespace-nowrap flex items-center gap-1 cursor-pointer ${
      active
        ? 'text-[#F0B90B]'
        : 'text-[var(--text-primary)] hover:text-[#F0B90B]'
    }`;

  return (
    <>
      <header className="sticky top-0 z-40 h-16 w-full bg-[var(--bg-primary)] border-b border-[var(--border-color)] px-4 lg:px-6 flex items-center justify-between select-none">
        {/* Left Zone: Logo + Primary Mega-Menu Navigation */}
        <div className="flex items-center gap-5">
          <a
            href="/"
            onClick={(e) => {
              e.preventDefault();
              navigate('/');
            }}
            className="font-display text-[20px] font-extrabold tracking-tight text-[#F0B90B] flex items-center gap-2 shrink-0"
          >
            <svg className="w-6 h-6 fill-[#F0B90B]" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M12 2L15.8 5.8L12 9.6L8.2 5.8L12 2ZM5.8 8.2L9.6 12L5.8 15.8L2 12L5.8 8.2ZM18.2 8.2L22 12L18.2 15.8L14.4 12L18.2 8.2ZM12 14.4L15.8 18.2L12 22L8.2 18.2L12 14.4ZM12 9.8L14.2 12L12 14.2L9.8 12L12 9.8Z" />
            </svg>
            AETHERX
          </a>

          {/* Primary Exchange Navigation */}
          <nav className="hidden lg:flex items-center gap-0.5">
            {/* Buy Crypto */}
            <div
              className="relative"
              onMouseEnter={() => handleMouseEnter('buy')}
              onMouseLeave={handleMouseLeave}
            >
              <button
                onClick={() => navigate('/buy-crypto')}
                className={navLinkClass(route === '/buy-crypto')}
              >
                Buy Crypto
                <ChevronDown className="w-3.5 h-3.5 opacity-70" />
              </button>
              {activeDropdown === 'buy' && (
                <div className="absolute left-0 top-full pt-1 w-80 z-50">
                  <div className="bg-[var(--bg-elevated)] border border-[var(--border-color)] rounded-xl shadow-2xl p-2.5 space-y-1">
                    <div className="px-2.5 py-1 text-[11px] font-semibold text-[var(--text-muted)] flex items-center justify-between">
                      <span>Pay with</span>
                      <span className="text-[#F0B90B]">USD · EUR · INR · GBP</span>
                    </div>
                    <button
                      onClick={() => navigate('/buy-crypto')}
                      className="w-full flex items-start gap-3 p-2.5 rounded-lg hover:bg-[var(--bg-hover)] text-left transition-colors cursor-pointer"
                    >
                      <CreditCard className="w-5 h-5 text-[#F0B90B] shrink-0 mt-0.5" />
                      <div>
                        <div className="text-sm font-semibold text-[var(--text-primary)]">
                          Quick Buy & Sell (Card / Apple Pay)
                        </div>
                        <div className="text-xs text-[var(--text-muted)]">
                          Buy crypto with Visa, Mastercard, SEPA & Bank Transfer
                        </div>
                      </div>
                    </button>
                    <button
                      onClick={() => navigate('/p2p')}
                      className="w-full flex items-start gap-3 p-2.5 rounded-lg hover:bg-[var(--bg-hover)] text-left transition-colors cursor-pointer"
                    >
                      <Users className="w-5 h-5 text-[#0ECB81] shrink-0 mt-0.5" />
                      <div>
                        <div className="text-sm font-semibold text-[var(--text-primary)]">
                          P2P Trading (0% Fee)
                        </div>
                        <div className="text-xs text-[var(--text-muted)]">
                          Bank Transfer, UPI, IMPS, Zelle & 800+ local options
                        </div>
                      </div>
                    </button>
                    <button
                      onClick={() => navigate('/deposit')}
                      className="w-full flex items-start gap-3 p-2.5 rounded-lg hover:bg-[var(--bg-hover)] text-left transition-colors cursor-pointer"
                    >
                      <Wallet className="w-5 h-5 text-[#F0B90B] shrink-0 mt-0.5" />
                      <div>
                        <div className="text-sm font-semibold text-[var(--text-primary)]">
                          Crypto Deposit
                        </div>
                        <div className="text-xs text-[var(--text-muted)]">
                          Instant multi-network on-chain deposits to Spot Wallet
                        </div>
                      </div>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Markets */}
            <button
              onClick={() => navigate('/markets')}
              className={navLinkClass(route === '/markets')}
            >
              Markets
            </button>

            {/* Trade Mega-Dropdown (2 Columns like Binance) */}
            <div
              className="relative"
              onMouseEnter={() => handleMouseEnter('trade')}
              onMouseLeave={handleMouseLeave}
            >
              <button
                onClick={() => navigate('/trade/spot')}
                className={navLinkClass(
                  route === '/trade/spot' || route === '/convert' || route === '/p2p'
                )}
              >
                Trade
                <ChevronDown className="w-3.5 h-3.5 opacity-70" />
              </button>
              {activeDropdown === 'trade' && (
                <div className="absolute left-0 top-full pt-1 w-[540px] z-50">
                  <div className="bg-[var(--bg-elevated)] border border-[var(--border-color)] rounded-xl shadow-2xl p-4 grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <div className="px-2.5 py-1 text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-wider">
                        Basic
                      </div>
                      <button
                        onClick={() => navigate('/trade/spot')}
                        className="w-full flex items-start gap-3 p-2.5 rounded-lg hover:bg-[var(--bg-hover)] text-left transition-colors cursor-pointer"
                      >
                        <TrendingUp className="w-5 h-5 text-[#F0B90B] shrink-0 mt-0.5" />
                        <div>
                          <div className="text-sm font-semibold text-[var(--text-primary)]">
                            Spot
                          </div>
                          <div className="text-xs text-[var(--text-muted)]">
                            Buy and sell on the Spot market with advanced tools
                          </div>
                        </div>
                      </button>
                      <button
                        onClick={() => navigate('/convert')}
                        className="w-full flex items-start gap-3 p-2.5 rounded-lg hover:bg-[var(--bg-hover)] text-left transition-colors cursor-pointer"
                      >
                        <Repeat className="w-5 h-5 text-[#0ECB81] shrink-0 mt-0.5" />
                        <div>
                          <div className="text-sm font-semibold text-[var(--text-primary)]">
                            Convert & Block Trade
                          </div>
                          <div className="text-xs text-[var(--text-muted)]">
                            The easiest way to trade at all sizes with 0 fees
                          </div>
                        </div>
                      </button>
                      <button
                        onClick={() => navigate('/p2p')}
                        className="w-full flex items-start gap-3 p-2.5 rounded-lg hover:bg-[var(--bg-hover)] text-left transition-colors cursor-pointer"
                      >
                        <Users className="w-5 h-5 text-[#F0B90B] shrink-0 mt-0.5" />
                        <div>
                          <div className="text-sm font-semibold text-[var(--text-primary)]">
                            P2P
                          </div>
                          <div className="text-xs text-[var(--text-muted)]">
                            Buy & sell cryptocurrencies using bank transfer and 800+ options
                          </div>
                        </div>
                      </button>
                    </div>

                    <div className="space-y-1 border-l border-[var(--border-color)] pl-4">
                      <div className="px-2.5 py-1 text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-wider">
                        Advanced
                      </div>
                      <button
                        onClick={() => navigate('/trade/spot')}
                        className="w-full flex items-start gap-3 p-2.5 rounded-lg hover:bg-[var(--bg-hover)] text-left transition-colors cursor-pointer"
                      >
                        <Bot className="w-5 h-5 text-[#F0B90B] shrink-0 mt-0.5" />
                        <div>
                          <div className="text-sm font-semibold text-[var(--text-primary)]">
                            Spot Margin & Grid Bots
                          </div>
                          <div className="text-xs text-[var(--text-muted)]">
                            Increase profits with leverage & automated strategies
                          </div>
                        </div>
                      </button>
                      <button
                        onClick={() => navigate('/api-docs')}
                        className="w-full flex items-start gap-3 p-2.5 rounded-lg hover:bg-[var(--bg-hover)] text-left transition-colors cursor-pointer"
                      >
                        <Layers className="w-5 h-5 text-[#0ECB81] shrink-0 mt-0.5" />
                        <div>
                          <div className="text-sm font-semibold text-[var(--text-primary)]">
                            APIs & Institutional VIP
                          </div>
                          <div className="text-xs text-[var(--text-muted)]">
                            Unlimited opportunities with one sub-millisecond key
                          </div>
                        </div>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Futures Dropdown */}
            <div
              className="relative"
              onMouseEnter={() => handleMouseEnter('futures')}
              onMouseLeave={handleMouseLeave}
            >
              <button
                onClick={() => navigate('/trade/futures')}
                className={navLinkClass(route === '/trade/futures')}
              >
                Futures
                <ChevronDown className="w-3.5 h-3.5 opacity-70" />
              </button>
              {activeDropdown === 'futures' && (
                <div className="absolute left-0 top-full pt-1 w-72 z-50">
                  <div className="bg-[var(--bg-elevated)] border border-[var(--border-color)] rounded-xl shadow-2xl p-2.5 space-y-1">
                    <button
                      onClick={() => navigate('/trade/futures')}
                      className="w-full flex items-start gap-3 p-2.5 rounded-lg hover:bg-[var(--bg-hover)] text-left transition-colors cursor-pointer"
                    >
                      <TrendingUp className="w-5 h-5 text-[#0ECB81] shrink-0 mt-0.5" />
                      <div>
                        <div className="text-sm font-semibold text-[var(--text-primary)]">
                          USDⓈ-M Futures (125x)
                        </div>
                        <div className="text-xs text-[var(--text-muted)]">
                          Perpetual contracts settled in USDT and USDC
                        </div>
                      </div>
                    </button>
                    <button
                      onClick={() => navigate('/trade/futures')}
                      className="w-full flex items-start gap-3 p-2.5 rounded-lg hover:bg-[var(--bg-hover)] text-left transition-colors cursor-pointer"
                    >
                      <Coins className="w-5 h-5 text-[#F0B90B] shrink-0 mt-0.5" />
                      <div>
                        <div className="text-sm font-semibold text-[var(--text-primary)]">
                          COIN-M Futures
                        </div>
                        <div className="text-xs text-[var(--text-muted)]">
                          Contracts settled in underlying cryptocurrency
                        </div>
                      </div>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Earn Dropdown */}
            <div
              className="relative"
              onMouseEnter={() => handleMouseEnter('earn')}
              onMouseLeave={handleMouseLeave}
            >
              <button
                onClick={() => navigate('/earn')}
                className={navLinkClass(route === '/earn')}
              >
                Earn
                <ChevronDown className="w-3.5 h-3.5 opacity-70" />
              </button>
              {activeDropdown === 'earn' && (
                <div className="absolute left-0 top-full pt-1 w-72 z-50">
                  <div className="bg-[var(--bg-elevated)] border border-[var(--border-color)] rounded-xl shadow-2xl p-2.5 space-y-1">
                    <button
                      onClick={() => navigate('/earn')}
                      className="w-full flex items-start gap-3 p-2.5 rounded-lg hover:bg-[var(--bg-hover)] text-left transition-colors cursor-pointer"
                    >
                      <Layers className="w-5 h-5 text-[#F0B90B] shrink-0 mt-0.5" />
                      <div>
                        <div className="text-sm font-semibold text-[var(--text-primary)]">
                          Simple Earn
                        </div>
                        <div className="text-xs text-[var(--text-muted)]">
                          Earn passive income on 300+ crypto assets with Flexible & Locked terms
                        </div>
                      </div>
                    </button>
                    <button
                      onClick={() => navigate('/airdrop')}
                      className="w-full flex items-start gap-3 p-2.5 rounded-lg hover:bg-[var(--bg-hover)] text-left transition-colors cursor-pointer"
                    >
                      <Sparkles className="w-5 h-5 text-[#0ECB81] shrink-0 mt-0.5" />
                      <div>
                        <div className="text-sm font-semibold text-[var(--text-primary)]">
                          Launchpool & HODLer Airdrops
                        </div>
                        <div className="text-xs text-[var(--text-muted)]">
                          Stake BNB & SOL to receive new token launches automatically
                        </div>
                      </div>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Square / Announcements */}
            <div
              className="relative"
              onMouseEnter={() => handleMouseEnter('square')}
              onMouseLeave={handleMouseLeave}
            >
              <button
                onClick={() => navigate('/announcements')}
                className={navLinkClass(route === '/announcements')}
              >
                Square
                <ChevronDown className="w-3.5 h-3.5 opacity-70" />
              </button>
              {activeDropdown === 'square' && (
                <div className="absolute left-0 top-full pt-1 w-72 z-50">
                  <div className="bg-[var(--bg-elevated)] border border-[var(--border-color)] rounded-xl shadow-2xl p-2.5 space-y-1">
                    <button
                      onClick={() => navigate('/announcements')}
                      className="w-full flex items-start gap-3 p-2.5 rounded-lg hover:bg-[var(--bg-hover)] text-left transition-colors cursor-pointer"
                    >
                      <FileText className="w-5 h-5 text-[#F0B90B] shrink-0 mt-0.5" />
                      <div>
                        <div className="text-sm font-semibold text-[var(--text-primary)]">
                          News & Announcements
                        </div>
                        <div className="text-xs text-[var(--text-muted)]">
                          New token listings, Launchpool updates & maintenance notices
                        </div>
                      </div>
                    </button>
                    <button
                      onClick={() => navigate('/airdrop')}
                      className="w-full flex items-start gap-3 p-2.5 rounded-lg hover:bg-[var(--bg-hover)] text-left transition-colors cursor-pointer"
                    >
                      <Gift className="w-5 h-5 text-[#0ECB81] shrink-0 mt-0.5" />
                      <div>
                        <div className="text-sm font-semibold text-[var(--text-primary)]">
                          Megadrop & Quests
                        </div>
                        <div className="text-xs text-[var(--text-muted)]">
                          Early access to Web3 projects with token rewards
                        </div>
                      </div>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* More Mega-Dropdown */}
            <div
              className="relative"
              onMouseEnter={() => handleMouseEnter('more')}
              onMouseLeave={handleMouseLeave}
            >
              <button
                onClick={() => navigate('/sitemap')}
                className={navLinkClass(
                  ['/airdrop', '/referral', '/support', '/sitemap', '/fees', '/proof-of-reserves'].includes(route)
                )}
              >
                More
                <ChevronDown className="w-3.5 h-3.5 opacity-70" />
              </button>
              {activeDropdown === 'more' && (
                <div className="absolute left-0 top-full pt-1 w-[520px] z-50">
                  <div className="bg-[var(--bg-elevated)] border border-[var(--border-color)] rounded-xl shadow-2xl p-4 grid grid-cols-2 gap-3">
                    <button
                      onClick={() => navigate('/airdrop')}
                      className="flex items-start gap-3 p-2.5 rounded-lg hover:bg-[var(--bg-hover)] text-left transition-colors cursor-pointer"
                    >
                      <Gift className="w-5 h-5 text-[#F0B90B] shrink-0 mt-0.5" />
                      <div>
                        <div className="text-sm font-semibold text-[var(--text-primary)]">
                          Megadrop & Airdrop Portal
                        </div>
                        <div className="text-xs text-[var(--text-muted)]">
                          Exclusive token launches & snapshot rewards
                        </div>
                      </div>
                    </button>
                    <button
                      onClick={() => navigate('/referral')}
                      className="flex items-start gap-3 p-2.5 rounded-lg hover:bg-[var(--bg-hover)] text-left transition-colors cursor-pointer"
                    >
                      <Users className="w-5 h-5 text-[#0ECB81] shrink-0 mt-0.5" />
                      <div>
                        <div className="text-sm font-semibold text-[var(--text-primary)]">
                          Referral (40% Rebate)
                        </div>
                        <div className="text-xs text-[var(--text-muted)]">
                          Invite friends and earn real-time USDT commissions
                        </div>
                      </div>
                    </button>
                    <button
                      onClick={() => navigate('/proof-of-reserves')}
                      className="flex items-start gap-3 p-2.5 rounded-lg hover:bg-[var(--bg-hover)] text-left transition-colors cursor-pointer"
                    >
                      <ShieldCheck className="w-5 h-5 text-[#0ECB81] shrink-0 mt-0.5" />
                      <div>
                        <div className="text-sm font-semibold text-[var(--text-primary)]">
                          Proof of Reserves (1:1)
                        </div>
                        <div className="text-xs text-[var(--text-muted)]">
                          Merkle-tree cryptographic audit & $1B SAFU Fund
                        </div>
                      </div>
                    </button>
                    <button
                      onClick={() => navigate('/fees')}
                      className="flex items-start gap-3 p-2.5 rounded-lg hover:bg-[var(--bg-hover)] text-left transition-colors cursor-pointer"
                    >
                      <Award className="w-5 h-5 text-[#F0B90B] shrink-0 mt-0.5" />
                      <div>
                        <div className="text-sm font-semibold text-[var(--text-primary)]">
                          VIP & Institutional Fees
                        </div>
                        <div className="text-xs text-[var(--text-muted)]">
                          0% Maker promos & institutional tier rebates
                        </div>
                      </div>
                    </button>
                    <button
                      onClick={() => navigate('/support')}
                      className="flex items-start gap-3 p-2.5 rounded-lg hover:bg-[var(--bg-hover)] text-left transition-colors cursor-pointer"
                    >
                      <HelpCircle className="w-5 h-5 text-[var(--text-secondary)] shrink-0 mt-0.5" />
                      <div>
                        <div className="text-sm font-semibold text-[var(--text-primary)]">
                          24/7 Support Center
                        </div>
                        <div className="text-xs text-[var(--text-muted)]">
                          Self-service recovery & priority ticket desk
                        </div>
                      </div>
                    </button>
                    <button
                      onClick={() => navigate('/sitemap')}
                      className="flex items-start gap-3 p-2.5 rounded-lg hover:bg-[var(--bg-hover)] text-left transition-colors cursor-pointer"
                    >
                      <FileText className="w-5 h-5 text-[var(--text-secondary)] shrink-0 mt-0.5" />
                      <div>
                        <div className="text-sm font-semibold text-[var(--text-primary)]">
                          Exchange Sitemap
                        </div>
                        <div className="text-xs text-[var(--text-muted)]">
                          Complete directory of all 26 routes & modules
                        </div>
                      </div>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </nav>
        </div>

        {/* Right Zone: Search, Deposit, Auth/User Controls, App QR, Notifications, Language, Theme */}
        <div className="flex items-center gap-1.5 sm:gap-2.5">
          {/* Search Trigger */}
          <div className="relative">
            <button
              onClick={() => setSearchOpen((prev) => !prev)}
              className="p-2 rounded-lg text-[var(--text-secondary)] hover:text-[#F0B90B] hover:bg-[var(--bg-hover)] transition-colors flex items-center gap-2 cursor-pointer"
              title="Search Markets & Functions"
            >
              <Search className="w-4 h-4" />
            </button>

            {searchOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setSearchOpen(false)} />
                <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-[var(--bg-elevated)] border border-[var(--border-color)] rounded-xl shadow-2xl p-3.5 z-50">
                  <div className="flex items-center gap-2 bg-[var(--bg-primary)] border border-[#F0B90B] rounded-lg px-3 py-2 mb-3">
                    <Search className="w-4 h-4 text-[#F0B90B]" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search coin, pair, or function (e.g. BTC, P2P, Earn)"
                      autoFocus
                      className="w-full bg-transparent text-xs text-[var(--text-primary)] focus:outline-none"
                    />
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery('')}
                        className="text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                      >
                        Clear
                      </button>
                    )}
                  </div>

                  {/* Hot Searches Pills */}
                  <div className="mb-3">
                    <div className="text-[11px] font-semibold text-[var(--text-muted)] mb-1.5">
                      Hot Trading Pairs
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {['BTCUSDT', 'SOLUSDT', 'ETHUSDT', 'BNBUSDT', 'SUIUSDT'].map((sym) => (
                        <button
                          key={sym}
                          onClick={() => {
                            setSearchOpen(false);
                            navigate('/trade/spot', sym);
                          }}
                          className="px-2.5 py-1 rounded bg-[var(--bg-primary)] hover:bg-[var(--bg-hover)] border border-[var(--border-color)] text-[11px] font-semibold text-[var(--text-primary)] cursor-pointer"
                        >
                          {sym.replace('USDT', '/USDT')}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="text-[11px] font-semibold text-[var(--text-muted)] px-1 mb-1">
                    Spot & Perpetual Markets
                  </div>
                  <div className="max-h-60 overflow-y-auto divide-y divide-[var(--border-color)]/40">
                    {filteredSearchPairs.map((item) => (
                      <button
                        key={item.symbol}
                        onClick={() => {
                          setSearchOpen(false);
                          navigate('/trade/spot', item.symbol);
                        }}
                        className="w-full flex items-center justify-between py-2 px-2 hover:bg-[var(--bg-hover)] rounded-lg transition-colors text-left cursor-pointer"
                      >
                        <div className="flex items-center gap-2.5">
                          <CryptoIcon symbol={item.baseAsset} size="sm" />
                          <div>
                            <div className="text-xs font-bold text-[var(--text-primary)]">
                              {item.baseAsset}
                              <span className="text-[var(--text-muted)] font-normal">
                                /{item.quoteAsset}
                              </span>
                            </div>
                            <div className="text-[11px] text-[var(--text-muted)]">{item.name}</div>
                          </div>
                        </div>
                        <div className="text-right font-mono-num">
                          <div className="text-xs font-semibold text-[var(--text-primary)]">
                            ${formatPrice(item.price)}
                          </div>
                          <div
                            className={`text-[11px] ${
                              item.priceChangePercent >= 0 ? 'text-[#0ECB81]' : 'text-[#F6465D]'
                            }`}
                          >
                            {item.priceChangePercent >= 0 ? '+' : ''}
                            {item.priceChangePercent.toFixed(2)}%
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Deposit Action Button */}
          <button
            onClick={() => navigate('/deposit')}
            className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#FCD535] hover:bg-[#F0B90B] text-[#181A20] text-xs font-bold transition-colors whitespace-nowrap cursor-pointer"
          >
            Deposit
          </button>

          {/* Authenticated vs Public Controls */}
          {isAuthenticated ? (
            <div className="hidden md:flex items-center gap-1">
              {/* Assets / Wallet Dropdown */}
              <div
                className="relative"
                onMouseEnter={() => handleMouseEnter('wallet')}
                onMouseLeave={handleMouseLeave}
              >
                <button
                  onClick={() => navigate('/wallet')}
                  className={navLinkClass(['/wallet', '/deposit', '/withdraw'].includes(route))}
                >
                  Assets
                  <ChevronDown className="w-3.5 h-3.5 opacity-70" />
                </button>
                {activeDropdown === 'wallet' && (
                  <div className="absolute right-0 top-full pt-1 w-56 z-50">
                    <div className="bg-[var(--bg-elevated)] border border-[var(--border-color)] rounded-xl shadow-2xl p-1.5 space-y-0.5">
                      <button
                        onClick={() => navigate('/wallet')}
                        className="w-full text-left px-3 py-2 text-xs font-semibold rounded-lg hover:bg-[var(--bg-hover)] text-[var(--text-primary)] cursor-pointer"
                      >
                        Overview
                      </button>
                      <button
                        onClick={() => navigate('/wallet')}
                        className="w-full text-left px-3 py-2 text-xs font-semibold rounded-lg hover:bg-[var(--bg-hover)] text-[var(--text-primary)] cursor-pointer"
                      >
                        Spot
                      </button>
                      <button
                        onClick={() => navigate('/deposit')}
                        className="w-full text-left px-3 py-2 text-xs font-semibold rounded-lg hover:bg-[var(--bg-hover)] text-[var(--text-primary)] cursor-pointer"
                      >
                        Deposit Crypto
                      </button>
                      <button
                        onClick={() => navigate('/withdraw')}
                        className="w-full text-left px-3 py-2 text-xs font-semibold rounded-lg hover:bg-[var(--bg-hover)] text-[var(--text-primary)] cursor-pointer"
                      >
                        Withdraw Crypto
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Orders Dropdown */}
              <div
                className="relative"
                onMouseEnter={() => handleMouseEnter('orders')}
                onMouseLeave={handleMouseLeave}
              >
                <button
                  onClick={() => navigate('/orders')}
                  className={navLinkClass(
                    ['/orders', '/order-history', '/trade-history'].includes(route)
                  )}
                >
                  Orders
                  <ChevronDown className="w-3.5 h-3.5 opacity-70" />
                </button>
                {activeDropdown === 'orders' && (
                  <div className="absolute right-0 top-full pt-1 w-56 z-50">
                    <div className="bg-[var(--bg-elevated)] border border-[var(--border-color)] rounded-xl shadow-2xl p-1.5 space-y-0.5">
                      <button
                        onClick={() => navigate('/orders')}
                        className="w-full text-left px-3 py-2 text-xs font-semibold rounded-lg hover:bg-[var(--bg-hover)] text-[var(--text-primary)] cursor-pointer"
                      >
                        Spot & Futures Open Orders
                      </button>
                      <button
                        onClick={() => navigate('/order-history')}
                        className="w-full text-left px-3 py-2 text-xs font-semibold rounded-lg hover:bg-[var(--bg-hover)] text-[var(--text-primary)] cursor-pointer"
                      >
                        Order History
                      </button>
                      <button
                        onClick={() => navigate('/trade-history')}
                        className="w-full text-left px-3 py-2 text-xs font-semibold rounded-lg hover:bg-[var(--bg-hover)] text-[var(--text-primary)] cursor-pointer"
                      >
                        Trade Execution History
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Account Avatar Dropdown */}
              <div
                className="relative"
                onMouseEnter={() => handleMouseEnter('profile')}
                onMouseLeave={handleMouseLeave}
              >
                <button
                  onClick={() => navigate('/account')}
                  className="p-2 rounded-lg text-[var(--text-secondary)] hover:text-[#F0B90B] hover:bg-[var(--bg-hover)] transition-colors cursor-pointer"
                  title="Account Center"
                >
                  <User className="w-4 h-4" />
                </button>
                {activeDropdown === 'profile' && (
                  <div className="absolute right-0 top-full pt-1 w-64 z-50">
                    <div className="bg-[var(--bg-elevated)] border border-[var(--border-color)] rounded-xl shadow-2xl p-3">
                      <div className="pb-2.5 mb-2 border-b border-[var(--border-color)]">
                        <div className="text-xs font-bold text-[var(--text-primary)] truncate">
                          {user?.email || 'Authenticated User'}
                        </div>
                        <div className="text-[11px] text-[#0ECB81] font-mono-num mt-0.5">
                          UID: {user?.uid || '—'} · {user?.vipLevel || 'VIP 0'} · {user?.kycStatus || 'Verified'}
                        </div>
                      </div>
                      <div className="space-y-0.5">
                        <button
                          onClick={() => navigate('/account')}
                          className="w-full text-left px-2.5 py-2 text-xs font-semibold rounded-lg hover:bg-[var(--bg-hover)] text-[var(--text-primary)] cursor-pointer"
                        >
                          Dashboard
                        </button>
                        <button
                          onClick={() => navigate('/security')}
                          className="w-full text-left px-2.5 py-2 text-xs font-semibold rounded-lg hover:bg-[var(--bg-hover)] text-[var(--text-primary)] cursor-pointer"
                        >
                          Security & 2FA
                        </button>
                        <button
                          onClick={() => navigate('/kyc')}
                          className="w-full text-left px-2.5 py-2 text-xs font-semibold rounded-lg hover:bg-[var(--bg-hover)] text-[var(--text-primary)] cursor-pointer"
                        >
                          Identification (KYC)
                        </button>
                        <button
                          onClick={() => navigate('/referral')}
                          className="w-full text-left px-2.5 py-2 text-xs font-semibold rounded-lg hover:bg-[var(--bg-hover)] text-[var(--text-primary)] cursor-pointer"
                        >
                          Referral
                        </button>
                        <button
                          onClick={logout}
                          className="w-full text-left px-2.5 py-2 text-xs font-semibold rounded-lg hover:bg-[#F6465D]/10 text-[#F6465D] flex items-center gap-2 mt-1 cursor-pointer"
                        >
                          <LogOut className="w-3.5 h-3.5" />
                          Log Out
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => openAuthModal('login')}
                className="px-3 py-1.5 rounded-lg bg-[var(--bg-elevated)] hover:bg-[var(--bg-hover)] text-xs font-semibold text-[var(--text-primary)] transition-colors whitespace-nowrap cursor-pointer"
              >
                Log In
              </button>
              <button
                onClick={() => openAuthModal('register')}
                className="px-3.5 py-1.5 rounded-lg bg-[#FCD535] hover:bg-[#F0B90B] text-[#181A20] text-xs font-bold transition-colors whitespace-nowrap cursor-pointer"
              >
                Sign Up
              </button>
            </div>
          )}

          {/* App Download QR Popover */}
          <div
            className="relative hidden xl:block"
            onMouseEnter={() => handleMouseEnter('qr')}
            onMouseLeave={handleMouseLeave}
          >
            <button
              className="p-2 rounded-lg text-[var(--text-secondary)] hover:text-[#F0B90B] hover:bg-[var(--bg-hover)] transition-colors cursor-pointer"
              title="Download iOS / Android & Desktop App"
            >
              <Download className="w-4 h-4" />
            </button>
            {activeDropdown === 'qr' && (
              <div className="absolute right-0 top-full pt-1 w-56 z-50">
                <div className="bg-[var(--bg-elevated)] border border-[var(--border-color)] rounded-xl shadow-2xl p-4 text-center space-y-3">
                  <div className="w-32 h-32 mx-auto rounded-lg bg-white p-2 flex items-center justify-center">
                    <QrCode className="w-24 h-24 text-[#181A20]" />
                  </div>
                  <div className="text-xs font-bold text-[var(--text-primary)]">
                    Scan to Download App
                  </div>
                  <div className="text-[11px] text-[var(--text-muted)]">
                    iOS, Android, macOS & Windows Pro Terminal
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Notifications Bell */}
          <button
            onClick={() => navigate('/notifications')}
            className="relative p-2 rounded-lg text-[var(--text-secondary)] hover:text-[#F0B90B] hover:bg-[var(--bg-hover)] transition-colors cursor-pointer"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#F0B90B]" />
            )}
          </button>

          {/* Language & Currency Selector */}
          <button
            onClick={() => setCurrencyModalOpen(true)}
            className="hidden xl:flex p-2 rounded-lg text-[var(--text-secondary)] hover:text-[#F0B90B] hover:bg-[var(--bg-hover)] transition-colors cursor-pointer"
            title="Language and Currency"
          >
            <Globe className="w-4 h-4" />
          </button>

          {/* Dark / White Theme Switcher */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg text-[var(--text-secondary)] hover:text-[#F0B90B] hover:bg-[var(--bg-hover)] transition-colors cursor-pointer"
            title={theme === 'dark' ? 'Switch to White Mode' : 'Switch to Dark Mode'}
            aria-label="Toggle color theme"
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-[#F0B90B]" />
            ) : (
              <Moon className="w-4 h-4" />
            )}
          </button>

          {/* Mobile Drawer Trigger */}
          <button
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            className="lg:hidden p-2 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            aria-label="Open navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Full-Screen Drawer */}
        {mobileMenuOpen && (
          <div className="fixed inset-x-0 top-16 bottom-0 bg-[var(--bg-primary)] z-50 overflow-y-auto p-4 lg:hidden border-t border-[var(--border-color)]">
            <div className="space-y-4">
              {!isAuthenticated ? (
                <div className="grid grid-cols-2 gap-3 pb-4 border-b border-[var(--border-color)]">
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      openAuthModal('login');
                    }}
                    className="py-2.5 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-color)] text-xs font-bold text-[var(--text-primary)]"
                  >
                    Log In
                  </button>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      openAuthModal('register');
                    }}
                    className="py-2.5 rounded-lg bg-[#FCD535] text-[#181A20] text-xs font-bold"
                  >
                    Sign Up
                  </button>
                </div>
              ) : (
                <div className="p-3 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-[var(--text-primary)]">{user.email}</div>
                    <div className="text-[11px] text-[#0ECB81]">
                      UID: {user.uid} · {user.vipLevel}
                    </div>
                  </div>
                  <button
                    onClick={logout}
                    className="text-xs font-semibold text-[#F6465D] px-2.5 py-1 rounded hover:bg-[#F6465D]/10"
                  >
                    Log Out
                  </button>
                </div>
              )}

              <div className="grid grid-cols-2 gap-2">
                {(
                  [
                    { label: 'Home', path: '/' },
                    { label: 'Markets', path: '/markets' },
                    { label: 'Spot Trading', path: '/trade/spot' },
                    { label: 'Futures 125x', path: '/trade/futures' },
                    { label: 'Buy Crypto', path: '/buy-crypto' },
                    { label: 'Convert (0 Fee)', path: '/convert' },
                    { label: 'P2P Trading', path: '/p2p' },
                    { label: 'Simple Earn', path: '/earn' },
                    { label: 'Airdrop Portal', path: '/airdrop' },
                    { label: 'Referral 40%', path: '/referral' },
                    { label: 'Wallet / Assets', path: '/wallet' },
                    { label: 'Deposit', path: '/deposit' },
                    { label: 'Withdraw', path: '/withdraw' },
                    { label: 'Open Orders', path: '/orders' },
                    { label: 'Order History', path: '/order-history' },
                    { label: 'Trade History', path: '/trade-history' },
                    { label: 'Account Center', path: '/account' },
                    { label: 'Security & 2FA', path: '/security' },
                    { label: 'KYC Verification', path: '/kyc' },
                    { label: 'Notifications', path: '/notifications' },
                    { label: '24/7 Support', path: '/support' },
                    { label: 'Full Sitemap', path: '/sitemap' },
                  ] as { label: string; path: RoutePath }[]
                ).map((item) => (
                  <button
                    key={item.path}
                    onClick={() => navigate(item.path)}
                    className={`flex items-center justify-between p-3 rounded-lg border text-left text-xs font-semibold ${
                      route === item.path
                        ? 'border-[#F0B90B] bg-[#F0B90B]/10 text-[#F0B90B]'
                        : 'border-[var(--border-color)] bg-[var(--bg-secondary)] text-[var(--text-primary)]'
                    }`}
                  >
                    <span>{item.label}</span>
                    <ArrowUpRight className="w-3.5 h-3.5 opacity-60" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Language & Currency Modal */}
      {currencyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="w-full max-w-md bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-3">
              <h3 className="text-sm font-bold text-[var(--text-primary)]">
                Language & Currency Preferences
              </h3>
              <button
                onClick={() => setCurrencyModalOpen(false)}
                className="text-[var(--text-muted)] hover:text-[var(--text-primary)]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="text-xs font-semibold text-[var(--text-muted)]">Language</div>
              <div className="grid grid-cols-2 gap-2">
                {['English (Global)', 'English (India)', 'Español', 'Deutsch'].map((lang) => (
                  <button
                    key={lang}
                    onClick={() => setSelectedLang(lang)}
                    className={`p-2.5 rounded-lg text-xs font-semibold border text-left cursor-pointer ${
                      selectedLang === lang
                        ? 'border-[#F0B90B] text-[#F0B90B] bg-[#F0B90B]/10'
                        : 'border-[var(--border-color)] text-[var(--text-primary)]'
                    }`}
                  >
                    {lang}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <div className="text-xs font-semibold text-[var(--text-muted)]">Display Currency</div>
              <div className="grid grid-cols-2 gap-2">
                {['USD - $', 'INR - ₹', 'EUR - €', 'GBP - £'].map((curr) => (
                  <button
                    key={curr}
                    onClick={() => setSelectedCurrency(curr)}
                    className={`p-2.5 rounded-lg text-xs font-semibold border text-left cursor-pointer ${
                      selectedCurrency === curr
                        ? 'border-[#F0B90B] text-[#F0B90B] bg-[#F0B90B]/10'
                        : 'border-[var(--border-color)] text-[var(--text-primary)]'
                    }`}
                  >
                    {curr}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={() => {
                setCurrencyModalOpen(false);
                pushToast({
                  type: 'success',
                  title: 'Regional Preferences Saved',
                  description: `${selectedLang} · ${selectedCurrency}`,
                });
              }}
              className="w-full py-2.5 rounded-lg bg-[#FCD535] hover:bg-[#F0B90B] text-[#181A20] text-xs font-bold cursor-pointer"
            >
              Save Preferences
            </button>
          </div>
        </div>
      )}
    </>
  );
};
