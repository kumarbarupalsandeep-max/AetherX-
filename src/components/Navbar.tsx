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
} from 'lucide-react';
import { useExchange } from '../context/ExchangeContext';
import { RoutePath } from '../types/exchange';
import { formatPrice } from '../data/exchangeData';

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
  } = useExchange();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
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
  }, [route]);

  const handleMouseEnter = (menu: string) => {
    if (dropdownTimeout.current) window.clearTimeout(dropdownTimeout.current);
    setActiveDropdown(menu);
  };

  const handleMouseLeave = () => {
    dropdownTimeout.current = window.setTimeout(() => {
      setActiveDropdown(null);
    }, 150);
  };

  const navLinkClass = (active: boolean) =>
    `px-2.5 py-1.5 text-sm font-medium transition-colors whitespace-nowrap flex items-center gap-1 cursor-pointer ${
      active
        ? 'text-[#F0B90B]'
        : 'text-[var(--text-primary)] hover:text-[#F0B90B]'
    }`;

  return (
    <header className="sticky top-0 z-40 h-16 w-full bg-[var(--bg-primary)]/95 backdrop-blur border-b border-[var(--border-color)] px-4 lg:px-6 flex items-center justify-between select-none">
      {/* Zone 1: Brand Title */}
      <div className="flex items-center gap-6">
        <a
          href="/"
          onClick={(e) => {
            e.preventDefault();
            navigate('/');
          }}
          className="font-display text-xl font-bold tracking-tight text-[#F0B90B] flex items-center gap-2 shrink-0"
        >
          <svg className="w-6 h-6 fill-[#F0B90B]" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M12 2L15.8 5.8L12 9.6L8.2 5.8L12 2ZM5.8 8.2L9.6 12L5.8 15.8L2 12L5.8 8.2ZM18.2 8.2L22 12L18.2 15.8L14.4 12L18.2 8.2ZM12 14.4L15.8 18.2L12 22L8.2 18.2L12 14.4ZM12 9.8L14.2 12L12 14.2L9.8 12L12 9.8Z" />
          </svg>
          AETHERX
        </a>

        {/* Zone 2: Primary Exchange Navigation Links */}
        <nav className="hidden lg:flex items-center gap-1">
          {/* Buy Crypto Dropdown */}
          <div
            className="relative"
            onMouseEnter={() => handleMouseEnter('buy')}
            onMouseLeave={handleMouseLeave}
          >
            <button
              onClick={() => navigate('/buy-crypto')}
              className={navLinkClass(route === '/buy-crypto' || route === '/p2p')}
            >
              Buy Crypto
              <ChevronDown className="w-3.5 h-3.5 opacity-70" />
            </button>
            {activeDropdown === 'buy' && (
              <div className="absolute left-0 top-full pt-2 w-72 z-50">
                <div className="bg-[var(--bg-elevated)] border border-[var(--border-color)] rounded-lg shadow-xl p-2 space-y-1">
                  <button
                    onClick={() => navigate('/buy-crypto')}
                    className="w-full flex items-start gap-3 p-2.5 rounded-md hover:bg-[var(--bg-hover)] text-left transition-colors"
                  >
                    <CreditCard className="w-5 h-5 text-[#F0B90B] shrink-0 mt-0.5" />
                    <div>
                      <div className="text-sm font-semibold text-[var(--text-primary)]">Quick Buy & Sell</div>
                      <div className="text-xs text-[var(--text-muted)]">Visa, Mastercard, Apple Pay & Bank Transfer</div>
                    </div>
                  </button>
                  <button
                    onClick={() => navigate('/p2p')}
                    className="w-full flex items-start gap-3 p-2.5 rounded-md hover:bg-[var(--bg-hover)] text-left transition-colors"
                  >
                    <Users className="w-5 h-5 text-[#0ECB81] shrink-0 mt-0.5" />
                    <div>
                      <div className="text-sm font-semibold text-[var(--text-primary)]">P2P Trading (0% Fees)</div>
                      <div className="text-xs text-[var(--text-muted)]">Buy/Sell directly from verified merchants via UPI, SEPA, Zelle</div>
                    </div>
                  </button>
                  <button
                    onClick={() => navigate('/deposit')}
                    className="w-full flex items-start gap-3 p-2.5 rounded-md hover:bg-[var(--bg-hover)] text-left transition-colors"
                  >
                    <Wallet className="w-5 h-5 text-[#F0B90B] shrink-0 mt-0.5" />
                    <div>
                      <div className="text-sm font-semibold text-[var(--text-primary)]">Crypto Deposit</div>
                      <div className="text-xs text-[var(--text-muted)]">Instant multi-network on-chain deposits</div>
                    </div>
                  </button>
                </div>
              </div>
            )}
          </div>

          <button
            onClick={() => navigate('/markets')}
            className={navLinkClass(route === '/markets')}
          >
            Markets
          </button>

          {/* Trade Dropdown */}
          <div
            className="relative"
            onMouseEnter={() => handleMouseEnter('trade')}
            onMouseLeave={handleMouseLeave}
          >
            <button
              onClick={() => navigate('/trade/spot')}
              className={navLinkClass(route === '/trade/spot' || route === '/convert')}
            >
              Trade
              <ChevronDown className="w-3.5 h-3.5 opacity-70" />
            </button>
            {activeDropdown === 'trade' && (
              <div className="absolute left-0 top-full pt-2 w-72 z-50">
                <div className="bg-[var(--bg-elevated)] border border-[var(--border-color)] rounded-lg shadow-xl p-2 space-y-1">
                  <button
                    onClick={() => navigate('/trade/spot')}
                    className="w-full flex items-start gap-3 p-2.5 rounded-md hover:bg-[var(--bg-hover)] text-left transition-colors"
                  >
                    <TrendingUp className="w-5 h-5 text-[#F0B90B] shrink-0 mt-0.5" />
                    <div>
                      <div className="text-sm font-semibold text-[var(--text-primary)]">Spot Trading</div>
                      <div className="text-xs text-[var(--text-muted)]">Advanced orderbook, limit/market/stop orders & indicators</div>
                    </div>
                  </button>
                  <button
                    onClick={() => navigate('/convert')}
                    className="w-full flex items-start gap-3 p-2.5 rounded-md hover:bg-[var(--bg-hover)] text-left transition-colors"
                  >
                    <Repeat className="w-5 h-5 text-[#0ECB81] shrink-0 mt-0.5" />
                    <div>
                      <div className="text-sm font-semibold text-[var(--text-primary)]">Convert & Block Trade</div>
                      <div className="text-xs text-[var(--text-muted)]">Zero-fee instant swap with locked institutional quotes</div>
                    </div>
                  </button>
                  <button
                    onClick={() => navigate('/p2p')}
                    className="w-full flex items-start gap-3 p-2.5 rounded-md hover:bg-[var(--bg-hover)] text-left transition-colors"
                  >
                    <Users className="w-5 h-5 text-[#F0B90B] shrink-0 mt-0.5" />
                    <div>
                      <div className="text-sm font-semibold text-[var(--text-primary)]">P2P Marketplace</div>
                      <div className="text-xs text-[var(--text-muted)]">Escrow-protected local currency settlement</div>
                    </div>
                  </button>
                </div>
              </div>
            )}
          </div>

          <button
            onClick={() => navigate('/trade/futures')}
            className={navLinkClass(route === '/trade/futures')}
          >
            Futures
          </button>

          <button
            onClick={() => navigate('/earn')}
            className={navLinkClass(route === '/earn')}
          >
            Earn
          </button>

          {/* More Dropdown */}
          <div
            className="relative"
            onMouseEnter={() => handleMouseEnter('more')}
            onMouseLeave={handleMouseLeave}
          >
            <button
              onClick={() => navigate('/airdrop')}
              className={navLinkClass(
                ['/airdrop', '/referral', '/support', '/sitemap', '/fees', '/proof-of-reserves'].includes(route)
              )}
            >
              More
              <ChevronDown className="w-3.5 h-3.5 opacity-70" />
            </button>
            {activeDropdown === 'more' && (
              <div className="absolute left-0 top-full pt-2 w-80 z-50">
                <div className="bg-[var(--bg-elevated)] border border-[var(--border-color)] rounded-lg shadow-xl p-2 grid grid-cols-1 gap-1">
                  <button
                    onClick={() => navigate('/airdrop')}
                    className="w-full flex items-start gap-3 p-2.5 rounded-md hover:bg-[var(--bg-hover)] text-left transition-colors"
                  >
                    <Gift className="w-5 h-5 text-[#F0B90B] shrink-0 mt-0.5" />
                    <div>
                      <div className="text-sm font-semibold text-[var(--text-primary)]">Megadrop & HODLer Airdrops</div>
                      <div className="text-xs text-[var(--text-muted)]">Exclusive token launches & snapshot rewards</div>
                    </div>
                  </button>
                  <button
                    onClick={() => navigate('/referral')}
                    className="w-full flex items-start gap-3 p-2.5 rounded-md hover:bg-[var(--bg-hover)] text-left transition-colors"
                  >
                    <Users className="w-5 h-5 text-[#0ECB81] shrink-0 mt-0.5" />
                    <div>
                      <div className="text-sm font-semibold text-[var(--text-primary)]">Referral Program</div>
                      <div className="text-xs text-[var(--text-muted)]">Invite friends and earn up to 40% commission rebate</div>
                    </div>
                  </button>
                  <button
                    onClick={() => navigate('/proof-of-reserves')}
                    className="w-full flex items-start gap-3 p-2.5 rounded-md hover:bg-[var(--bg-hover)] text-left transition-colors"
                  >
                    <ShieldCheck className="w-5 h-5 text-[#0ECB81] shrink-0 mt-0.5" />
                    <div>
                      <div className="text-sm font-semibold text-[var(--text-primary)]">Proof of Reserves (1:1)</div>
                      <div className="text-xs text-[var(--text-muted)]">Merkle-tree cryptographic audit & SAFU insurance fund</div>
                    </div>
                  </button>
                  <button
                    onClick={() => navigate('/fees')}
                    className="w-full flex items-start gap-3 p-2.5 rounded-md hover:bg-[var(--bg-hover)] text-left transition-colors"
                  >
                    <Layers className="w-5 h-5 text-[#F0B90B] shrink-0 mt-0.5" />
                    <div>
                      <div className="text-sm font-semibold text-[var(--text-primary)]">VIP & Fee Schedule</div>
                      <div className="text-xs text-[var(--text-muted)]">0% Maker promos & institutional tier rebates</div>
                    </div>
                  </button>
                  <button
                    onClick={() => navigate('/support')}
                    className="w-full flex items-start gap-3 p-2.5 rounded-md hover:bg-[var(--bg-hover)] text-left transition-colors"
                  >
                    <HelpCircle className="w-5 h-5 text-[var(--text-secondary)] shrink-0 mt-0.5" />
                    <div>
                      <div className="text-sm font-semibold text-[var(--text-primary)]">24/7 Support Center</div>
                      <div className="text-xs text-[var(--text-muted)]">Help articles, ticket submission & account recovery</div>
                    </div>
                  </button>
                  <button
                    onClick={() => navigate('/sitemap')}
                    className="w-full flex items-start gap-3 p-2.5 rounded-md hover:bg-[var(--bg-hover)] text-left transition-colors"
                  >
                    <FileText className="w-5 h-5 text-[var(--text-secondary)] shrink-0 mt-0.5" />
                    <div>
                      <div className="text-sm font-semibold text-[var(--text-primary)]">Exchange Sitemap</div>
                      <div className="text-xs text-[var(--text-muted)]">Complete directory of all platform routes & modules</div>
                    </div>
                  </button>
                </div>
              </div>
            )}
          </div>
        </nav>
      </div>

      {/* Zone 3: Quick Search, Wallet/Orders, Auth & Theme Actions */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Quick Pair Search Popover */}
        <div className="relative">
          <button
            onClick={() => setSearchOpen((prev) => !prev)}
            className="p-2 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors flex items-center gap-2"
            title="Search Markets"
          >
            <Search className="w-4 h-4" />
            <span className="hidden xl:inline text-xs text-[var(--text-muted)]">BTC, SOL, ETH...</span>
          </button>

          {searchOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setSearchOpen(false)} />
              <div className="absolute right-0 top-full mt-2 w-80 bg-[var(--bg-elevated)] border border-[var(--border-color)] rounded-lg shadow-2xl p-3 z-50">
                <div className="flex items-center gap-2 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-md px-2.5 py-1.5 mb-2">
                  <Search className="w-4 h-4 text-[var(--text-muted)]" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search pair or token..."
                    autoFocus
                    className="w-full bg-transparent text-xs text-[var(--text-primary)] focus:outline-none"
                  />
                  {searchQuery && (
                    <button onClick={() => setSearchQuery('')} className="text-xs text-[var(--text-muted)]">
                      Clear
                    </button>
                  )}
                </div>
                <div className="text-[11px] font-medium text-[var(--text-muted)] px-1 mb-1.5">
                  Spot & Futures Pairs
                </div>
                <div className="max-h-64 overflow-y-auto divide-y divide-[var(--border-color)]/40">
                  {filteredSearchPairs.map((item) => (
                    <button
                      key={item.symbol}
                      onClick={() => {
                        setSearchOpen(false);
                        navigate('/trade/spot', item.symbol);
                      }}
                      className="w-full flex items-center justify-between py-2 px-2 hover:bg-[var(--bg-hover)] rounded transition-colors text-left"
                    >
                      <div>
                        <div className="text-xs font-semibold text-[var(--text-primary)]">
                          {item.baseAsset}
                          <span className="text-[var(--text-muted)] font-normal">/{item.quoteAsset}</span>
                        </div>
                        <div className="text-[11px] text-[var(--text-muted)]">{item.name}</div>
                      </div>
                      <div className="text-right font-mono-num">
                        <div className="text-xs font-medium text-[var(--text-primary)]">
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

        {/* Deposit Button */}
        <button
          onClick={() => navigate('/deposit')}
          className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 rounded-md bg-[#F0B90B] hover:bg-[#FCD535] text-[#181A20] text-xs font-semibold transition-colors whitespace-nowrap cursor-pointer"
        >
          Deposit
        </button>

        {/* Authenticated vs Unauthenticated Controls */}
        {isAuthenticated ? (
          <div className="hidden md:flex items-center gap-1">
            {/* Wallet Dropdown */}
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
                <div className="absolute right-0 top-full pt-2 w-56 z-50">
                  <div className="bg-[var(--bg-elevated)] border border-[var(--border-color)] rounded-lg shadow-xl p-1.5 space-y-0.5">
                    <button
                      onClick={() => navigate('/wallet')}
                      className="w-full text-left px-3 py-2 text-xs font-medium rounded hover:bg-[var(--bg-hover)] text-[var(--text-primary)]"
                    >
                      Assets Overview
                    </button>
                    <button
                      onClick={() => navigate('/deposit')}
                      className="w-full text-left px-3 py-2 text-xs font-medium rounded hover:bg-[var(--bg-hover)] text-[var(--text-primary)]"
                    >
                      Deposit Crypto
                    </button>
                    <button
                      onClick={() => navigate('/withdraw')}
                      className="w-full text-left px-3 py-2 text-xs font-medium rounded hover:bg-[var(--bg-hover)] text-[var(--text-primary)]"
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
                <div className="absolute right-0 top-full pt-2 w-56 z-50">
                  <div className="bg-[var(--bg-elevated)] border border-[var(--border-color)] rounded-lg shadow-xl p-1.5 space-y-0.5">
                    <button
                      onClick={() => navigate('/orders')}
                      className="w-full text-left px-3 py-2 text-xs font-medium rounded hover:bg-[var(--bg-hover)] text-[var(--text-primary)]"
                    >
                      Open Spot & Futures Orders
                    </button>
                    <button
                      onClick={() => navigate('/order-history')}
                      className="w-full text-left px-3 py-2 text-xs font-medium rounded hover:bg-[var(--bg-hover)] text-[var(--text-primary)]"
                    >
                      Order History
                    </button>
                    <button
                      onClick={() => navigate('/trade-history')}
                      className="w-full text-left px-3 py-2 text-xs font-medium rounded hover:bg-[var(--bg-hover)] text-[var(--text-primary)]"
                    >
                      Trade Execution History
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Profile Dropdown */}
            <div
              className="relative"
              onMouseEnter={() => handleMouseEnter('profile')}
              onMouseLeave={handleMouseLeave}
            >
              <button
                onClick={() => navigate('/account')}
                className="p-2 rounded-lg text-[var(--text-secondary)] hover:text-[#F0B90B] hover:bg-[var(--bg-hover)] transition-colors"
                title="Account Center"
              >
                <User className="w-4 h-4" />
              </button>
              {activeDropdown === 'profile' && (
                <div className="absolute right-0 top-full pt-2 w-64 z-50">
                  <div className="bg-[var(--bg-elevated)] border border-[var(--border-color)] rounded-lg shadow-xl p-3">
                    <div className="pb-2.5 mb-2 border-b border-[var(--border-color)]">
                      <div className="text-xs font-semibold text-[var(--text-primary)] truncate">
                        {user.email}
                      </div>
                      <div className="text-[11px] text-[var(--text-muted)] mt-0.5">
                        UID: {user.uid} · {user.vipLevel} · {user.kycStatus}
                      </div>
                    </div>
                    <div className="space-y-0.5">
                      <button
                        onClick={() => navigate('/account')}
                        className="w-full text-left px-2.5 py-2 text-xs font-medium rounded hover:bg-[var(--bg-hover)] text-[var(--text-primary)]"
                      >
                        Dashboard & Overview
                      </button>
                      <button
                        onClick={() => navigate('/security')}
                        className="w-full text-left px-2.5 py-2 text-xs font-medium rounded hover:bg-[var(--bg-hover)] text-[var(--text-primary)]"
                      >
                        Security & 2FA Settings
                      </button>
                      <button
                        onClick={() => navigate('/kyc')}
                        className="w-full text-left px-2.5 py-2 text-xs font-medium rounded hover:bg-[var(--bg-hover)] text-[var(--text-primary)]"
                      >
                        Identification (KYC)
                      </button>
                      <button
                        onClick={() => navigate('/referral')}
                        className="w-full text-left px-2.5 py-2 text-xs font-medium rounded hover:bg-[var(--bg-hover)] text-[var(--text-primary)]"
                      >
                        Referral & Commissions
                      </button>
                      <button
                        onClick={logout}
                        className="w-full text-left px-2.5 py-2 text-xs font-medium rounded hover:bg-[#F6465D]/10 text-[#F6465D] flex items-center gap-2 mt-1"
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
              className="px-3 py-1.5 rounded-md text-xs font-semibold text-[var(--text-primary)] hover:text-[#F0B90B] transition-colors whitespace-nowrap cursor-pointer"
            >
              Log In
            </button>
            <button
              onClick={() => openAuthModal('register')}
              className="px-3.5 py-1.5 rounded-md bg-[#F0B90B] hover:bg-[#FCD535] text-[#181A20] text-xs font-semibold transition-colors whitespace-nowrap cursor-pointer"
            >
              Sign Up
            </button>
          </div>
        )}

        {/* Notifications Bell */}
        <button
          onClick={() => navigate('/notifications')}
          className="relative p-2 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors cursor-pointer"
          title="Notifications"
        >
          <Bell className="w-4 h-4" />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#F0B90B]" />
          )}
        </button>

        {/* Dark / Light Mode Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors cursor-pointer"
          title={theme === 'dark' ? 'Switch to White Mode' : 'Switch to Dark Mode'}
          aria-label="Toggle color theme"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4 text-[#F0B90B]" /> : <Moon className="w-4 h-4" />}
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

      {/* Responsive Mobile Navigation Drawer */}
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
                  className="py-2.5 rounded-md border border-[var(--border-color)] text-xs font-semibold text-[var(--text-primary)]"
                >
                  Log In
                </button>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    openAuthModal('register');
                  }}
                  className="py-2.5 rounded-md bg-[#F0B90B] text-[#181A20] text-xs font-semibold"
                >
                  Sign Up
                </button>
              </div>
            ) : (
              <div className="p-3 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-color)] flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold text-[var(--text-primary)]">{user.email}</div>
                  <div className="text-[11px] text-[var(--text-muted)]">UID: {user.uid} · {user.vipLevel}</div>
                </div>
                <button
                  onClick={logout}
                  className="text-xs font-medium text-[#F6465D] px-2.5 py-1 rounded hover:bg-[#F6465D]/10"
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
                  className={`flex items-center justify-between p-3 rounded-lg border text-left text-xs font-medium ${
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
  );
};
