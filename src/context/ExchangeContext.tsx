import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  RoutePath,
  TickerPair,
  AssetBalance,
  ExchangeOrder,
  ExecutedTrade,
  NotificationItem,
  UserProfile,
  AirdropCampaign,
} from '../types/exchange';
import {
  INITIAL_TICKERS,
  INITIAL_BALANCES,
  INITIAL_ORDERS,
  INITIAL_TRADES,
  INITIAL_NOTIFICATIONS,
  AIRDROP_CAMPAIGNS,
} from '../data/exchangeData';

interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  title: string;
  description?: string;
}

interface ExchangeContextValue {
  route: RoutePath;
  navigate: (path: RoutePath, pairSymbol?: string) => void;
  theme: 'dark' | 'light';
  toggleTheme: () => void;
  tickers: TickerPair[];
  selectedPair: string;
  setSelectedPair: (symbol: string) => void;
  toggleFavoritePair: (symbol: string) => void;
  isLiveConnected: boolean;
  isAuthenticated: boolean;
  user: UserProfile;
  authModalOpen: boolean;
  authModalMode: 'login' | 'register';
  openAuthModal: (mode?: 'login' | 'register') => void;
  closeAuthModal: () => void;
  login: (email: string) => void;
  logout: () => void;
  balances: AssetBalance[];
  orders: ExchangeOrder[];
  trades: ExecutedTrade[];
  notifications: NotificationItem[];
  airdrops: AirdropCampaign[];
  placeOrder: (params: {
    pair: string;
    marketType: 'Spot' | 'Futures';
    type: 'Limit' | 'Market' | 'Stop-Limit';
    side: 'Buy' | 'Sell';
    price: number;
    stopPrice?: number;
    amount: number;
    leverage?: number;
  }) => boolean;
  cancelOrder: (orderId: string) => void;
  cancelAllOpenOrders: () => void;
  convertCrypto: (fromAsset: string, toAsset: string, fromAmount: number, toAmount: number) => boolean;
  depositAsset: (asset: string, amount: number, network: string) => void;
  withdrawAsset: (asset: string, amount: number, address: string, network: string, fee: number) => boolean;
  subscribeEarn: (asset: string, amount: number, apr: number) => boolean;
  claimAirdrop: (campaignId: string) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  updateUserProfile: (patch: Partial<UserProfile>) => void;
  toasts: ToastMessage[];
  pushToast: (toast: Omit<ToastMessage, 'id'>) => void;
  dismissToast: (id: string) => void;
}

const VALID_ROUTES: RoutePath[] = [
  '/',
  '/markets',
  '/trade/spot',
  '/trade/futures',
  '/buy-crypto',
  '/convert',
  '/p2p',
  '/earn',
  '/airdrop',
  '/referral',
  '/wallet',
  '/deposit',
  '/withdraw',
  '/orders',
  '/order-history',
  '/trade-history',
  '/account',
  '/security',
  '/kyc',
  '/notifications',
  '/support',
  '/sitemap',
  '/fees',
  '/announcements',
  '/proof-of-reserves',
  '/api-docs',
];

function parseCurrentPath(): RoutePath {
  if (typeof window === 'undefined') return '/';
  const raw = window.location.pathname.replace(/\/+$/, '') || '/';
  if (VALID_ROUTES.includes(raw as RoutePath)) {
    return raw as RoutePath;
  }
  return '/';
}

const ExchangeContext = createContext<ExchangeContextValue | null>(null);

export const ExchangeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [route, setRoute] = useState<RoutePath>(parseCurrentPath);
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    const saved = localStorage.getItem('aetherx_theme');
    return saved === 'light' ? 'light' : 'dark';
  });

  const [tickers, setTickers] = useState<TickerPair[]>(INITIAL_TICKERS);
  const [selectedPair, setSelectedPair] = useState<string>('BTCUSDT');
  const [isLiveConnected, setIsLiveConnected] = useState<boolean>(false);

  // Start unauthenticated so user can test both 80% public browsing & gated actions seamlessly
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('aetherx_auth') === 'true';
  });
  const [authModalOpen, setAuthModalOpen] = useState<boolean>(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');

  const [user, setUser] = useState<UserProfile>({
    uid: '849201749',
    email: 'trader.pro@aetherx.io',
    nickname: 'AlphaDesk_VIP',
    vipLevel: 'VIP 1',
    kycStatus: 'Verified Plus',
    kycDailyLimitUSDT: 2000000,
    twoFactorEnabled: true,
    antiPhishingCode: 'AX-9920-SAFE',
    withdrawalWhitelistEnabled: false,
    passkeyConnected: true,
    referralCode: 'AETHERVIP20',
    referredFriends: 18,
    totalCommissionUSDT: 1428.65,
  });

  const [balances, setBalances] = useState<AssetBalance[]>(INITIAL_BALANCES);
  const [orders, setOrders] = useState<ExchangeOrder[]>(INITIAL_ORDERS);
  const [trades, setTrades] = useState<ExecutedTrade[]>(INITIAL_TRADES);
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);
  const [airdrops, setAirdrops] = useState<AirdropCampaign[]>(AIRDROP_CAMPAIGNS);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const pushToast = useCallback((toast: Omit<ToastMessage, 'id'>) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    setToasts((prev) => [...prev, { ...toast, id }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Theme synchronization with document.documentElement
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('aetherx_theme', theme);
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  }, []);

  // History API routing + Popstate listener
  useEffect(() => {
    const handlePopState = () => {
      setRoute(parseCurrentPath());
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = useCallback((path: RoutePath, pairSymbol?: string) => {
    if (pairSymbol) {
      setSelectedPair(pairSymbol);
    }
    if (window.location.pathname !== path) {
      window.history.pushState({}, '', path);
    }
    setRoute(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Connect to real public Binance 24hr ticker API + WebSocket stream with automatic high-frequency fallback
  useEffect(() => {
    let isMounted = true;
    const symbols = INITIAL_TICKERS.map((t) => t.symbol);

    async function fetchReal24hrTickers() {
      try {
        const query = encodeURIComponent(JSON.stringify(symbols));
        const res = await fetch(`https://api.binance.com/api/v3/ticker/24hr?symbols=${query}`);
        if (!res.ok) return;
        const data = await res.json();
        if (!isMounted || !Array.isArray(data)) return;

        setIsLiveConnected(true);
        setTickers((prev) =>
          prev.map((item) => {
            const live = data.find((d: any) => d.symbol === item.symbol);
            if (!live) return item;
            const lastPrice = parseFloat(live.lastPrice);
            if (!lastPrice || isNaN(lastPrice)) return item;
            return {
              ...item,
              price: lastPrice,
              priceChange: parseFloat(live.priceChange) || item.priceChange,
              priceChangePercent: parseFloat(live.priceChangePercent) || item.priceChangePercent,
              high24h: parseFloat(live.highPrice) || item.high24h,
              low24h: parseFloat(live.lowPrice) || item.low24h,
              volume24h: parseFloat(live.volume) || item.volume24h,
              quoteVolume24h: parseFloat(live.quoteVolume) || item.quoteVolume24h,
            };
          })
        );
      } catch {
        // Fallback tick engine handles live updates when sandbox blocks external REST
      }
    }

    fetchReal24hrTickers();
    const restInterval = setInterval(fetchReal24hrTickers, 12000);

    // High-frequency micro-tick engine so orderbooks and prices pulse smoothly every 1.6s
    const microTickInterval = setInterval(() => {
      if (!isMounted) return;
      setTickers((prev) =>
        prev.map((t) => {
          const deltaPct = (Math.random() - 0.492) * 0.0018;
          const nextPrice = Math.max(0.0001, Number((t.price * (1 + deltaPct)).toFixed(t.price > 100 ? 2 : 4)));
          const nextChangePct = Number((t.priceChangePercent + deltaPct * 65).toFixed(2));
          return {
            ...t,
            price: nextPrice,
            priceChangePercent: nextChangePct,
            high24h: Math.max(t.high24h, nextPrice),
            low24h: Math.min(t.low24h, nextPrice),
          };
        })
      );
    }, 1600);

    return () => {
      isMounted = false;
      clearInterval(restInterval);
      clearInterval(microTickInterval);
    };
  }, []);

  const toggleFavoritePair = useCallback((symbol: string) => {
    setTickers((prev) =>
      prev.map((t) => (t.symbol === symbol ? { ...t, isFavorite: !t.isFavorite } : t))
    );
  }, []);

  const openAuthModal = useCallback((mode: 'login' | 'register' = 'login') => {
    setAuthModalMode(mode);
    setAuthModalOpen(true);
  }, []);

  const closeAuthModal = useCallback(() => {
    setAuthModalOpen(false);
  }, []);

  const login = useCallback((email: string) => {
    setIsAuthenticated(true);
    localStorage.setItem('aetherx_auth', 'true');
    if (email && email.includes('@')) {
      setUser((prev) => ({ ...prev, email }));
    }
    setAuthModalOpen(false);
    pushToast({
      type: 'success',
      title: 'Signed In Successfully',
      description: `Welcome back to AetherX Pro (${email || 'VIP Account'})`,
    });
  }, [pushToast]);

  const logout = useCallback(() => {
    setIsAuthenticated(false);
    localStorage.removeItem('aetherx_auth');
    pushToast({
      type: 'info',
      title: 'Signed Out',
      description: 'You are now browsing in public view mode.',
    });
  }, [pushToast]);

  const placeOrder = useCallback(
    (params: {
      pair: string;
      marketType: 'Spot' | 'Futures';
      type: 'Limit' | 'Market' | 'Stop-Limit';
      side: 'Buy' | 'Sell';
      price: number;
      stopPrice?: number;
      amount: number;
      leverage?: number;
    }): boolean => {
      if (!isAuthenticated) {
        openAuthModal('login');
        return false;
      }

      const ticker = tickers.find((t) => t.symbol === params.pair) || tickers[0];
      const execPrice = params.type === 'Market' ? ticker.price : params.price;
      const totalUSDT = Number((execPrice * params.amount).toFixed(2));
      const baseAsset = ticker.baseAsset;

      // Validate balance
      if (params.side === 'Buy') {
        const usdtBal = balances.find((b) => b.asset === 'USDT');
        const requiredMargin = params.marketType === 'Futures' && params.leverage
          ? totalUSDT / params.leverage
          : totalUSDT;
        if (!usdtBal || usdtBal.available < requiredMargin) {
          pushToast({
            type: 'error',
            title: 'Insufficient USDT Balance',
            description: `Required: ${requiredMargin.toFixed(2)} USDT. Available: ${(usdtBal?.available || 0).toFixed(2)} USDT.`,
          });
          return false;
        }
      } else {
        if (params.marketType === 'Spot') {
          const assetBal = balances.find((b) => b.asset === baseAsset);
          if (!assetBal || assetBal.available < params.amount) {
            pushToast({
              type: 'error',
              title: `Insufficient ${baseAsset} Balance`,
              description: `Required: ${params.amount} ${baseAsset}. Available: ${(assetBal?.available || 0).toFixed(4)} ${baseAsset}.`,
            });
            return false;
          }
        }
      }

      const nowStr = new Date().toISOString().replace('T', ' ').slice(0, 19);
      const orderId = `ORD-${Math.floor(1000000 + Math.random() * 9000000)}`;
      const isImmediateFill = params.type === 'Market';

      const newOrder: ExchangeOrder = {
        id: orderId,
        pair: params.pair,
        marketType: params.marketType,
        type: params.type,
        side: params.side,
        price: execPrice,
        stopPrice: params.stopPrice,
        amount: params.amount,
        filled: isImmediateFill ? params.amount : 0,
        total: totalUSDT,
        status: isImmediateFill ? 'Filled' : 'Open',
        createdAt: nowStr,
        leverage: params.leverage,
      };

      setOrders((prev) => [newOrder, ...prev]);

      if (isImmediateFill) {
        const tradeEntry: ExecutedTrade = {
          id: `TRD-${Math.floor(1000000 + Math.random() * 9000000)}`,
          orderId,
          pair: params.pair,
          side: params.side,
          price: execPrice,
          amount: params.amount,
          fee: Number((totalUSDT * 0.001).toFixed(4)),
          feeAsset: 'USDT',
          role: 'Taker',
          total: totalUSDT,
          timestamp: nowStr,
        };
        setTrades((prev) => [tradeEntry, ...prev]);

        // Adjust balances
        setBalances((prev) => {
          const next = [...prev];
          const usdtIdx = next.findIndex((b) => b.asset === 'USDT');
          const baseIdx = next.findIndex((b) => b.asset === baseAsset);

          if (params.side === 'Buy') {
            if (usdtIdx > -1) {
              next[usdtIdx] = {
                ...next[usdtIdx],
                available: Math.max(0, Number((next[usdtIdx].available - totalUSDT).toFixed(2))),
              };
            }
            if (baseIdx > -1) {
              next[baseIdx] = {
                ...next[baseIdx],
                available: Number((next[baseIdx].available + params.amount).toFixed(4)),
              };
            } else {
              next.push({
                asset: baseAsset,
                name: ticker.name,
                available: params.amount,
                inOrder: 0,
                staked: 0,
                btcValuation: (params.amount * execPrice) / 89420,
                usdtValuation: params.amount * execPrice,
                networks: INITIAL_BALANCES[0].networks,
              });
            }
          } else {
            if (baseIdx > -1) {
              next[baseIdx] = {
                ...next[baseIdx],
                available: Math.max(0, Number((next[baseIdx].available - params.amount).toFixed(4))),
              };
            }
            if (usdtIdx > -1) {
              next[usdtIdx] = {
                ...next[usdtIdx],
                available: Number((next[usdtIdx].available + totalUSDT).toFixed(2)),
              };
            }
          }
          return next;
        });

        pushToast({
          type: 'success',
          title: `${params.marketType} Market ${params.side} Filled`,
          description: `${params.amount} ${baseAsset} executed at ${execPrice.toLocaleString()} USDT`,
        });
      } else {
        // Reserve inOrder funds for Limit/Stop-Limit
        setBalances((prev) =>
          prev.map((b) => {
            if (params.side === 'Buy' && b.asset === 'USDT') {
              const lockAmt = params.marketType === 'Futures' && params.leverage ? totalUSDT / params.leverage : totalUSDT;
              return {
                ...b,
                available: Math.max(0, Number((b.available - lockAmt).toFixed(2))),
                inOrder: Number((b.inOrder + lockAmt).toFixed(2)),
              };
            }
            if (params.side === 'Sell' && b.asset === baseAsset && params.marketType === 'Spot') {
              return {
                ...b,
                available: Math.max(0, Number((b.available - params.amount).toFixed(4))),
                inOrder: Number((b.inOrder + params.amount).toFixed(4)),
              };
            }
            return b;
          })
        );

        pushToast({
          type: 'success',
          title: `${params.type} ${params.side} Order Placed`,
          description: `${params.amount} ${baseAsset} @ ${execPrice.toLocaleString()} USDT (#${orderId})`,
        });
      }

      return true;
    },
    [isAuthenticated, openAuthModal, tickers, balances, pushToast]
  );

  const cancelOrder = useCallback(
    (orderId: string) => {
      const target = orders.find((o) => o.id === orderId);
      if (!target || target.status !== 'Open') return;

      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: 'Cancelled' } : o))
      );

      const baseAsset = target.pair.replace('USDT', '');
      setBalances((prev) =>
        prev.map((b) => {
          if (target.side === 'Buy' && b.asset === 'USDT') {
            return {
              ...b,
              available: Number((b.available + target.total).toFixed(2)),
              inOrder: Math.max(0, Number((b.inOrder - target.total).toFixed(2))),
            };
          }
          if (target.side === 'Sell' && b.asset === baseAsset) {
            return {
              ...b,
              available: Number((b.available + target.amount).toFixed(4)),
              inOrder: Math.max(0, Number((b.inOrder - target.amount).toFixed(4))),
            };
          }
          return b;
        })
      );

      pushToast({
        type: 'info',
        title: 'Order Cancelled',
        description: `Order #${orderId} (${target.pair}) has been cancelled and funds unlocked.`,
      });
    },
    [orders, pushToast]
  );

  const cancelAllOpenOrders = useCallback(() => {
    const openCount = orders.filter((o) => o.status === 'Open').length;
    if (openCount === 0) return;
    setOrders((prev) =>
      prev.map((o) => (o.status === 'Open' ? { ...o, status: 'Cancelled' } : o))
    );
    pushToast({
      type: 'info',
      title: 'All Open Orders Cancelled',
      description: `${openCount} active order(s) cancelled.`,
    });
  }, [orders, pushToast]);

  const convertCrypto = useCallback(
    (fromAsset: string, toAsset: string, fromAmount: number, toAmount: number): boolean => {
      if (!isAuthenticated) {
        openAuthModal('login');
        return false;
      }
      const sourceBal = balances.find((b) => b.asset === fromAsset);
      if (!sourceBal || sourceBal.available < fromAmount) {
        pushToast({
          type: 'error',
          title: `Insufficient ${fromAsset} Balance`,
          description: `You need ${fromAmount} ${fromAsset} to complete this instant conversion.`,
        });
        return false;
      }

      setBalances((prev) => {
        const next = prev.map((b) => {
          if (b.asset === fromAsset) {
            return { ...b, available: Math.max(0, Number((b.available - fromAmount).toFixed(4))) };
          }
          if (b.asset === toAsset) {
            return { ...b, available: Number((b.available + toAmount).toFixed(4)) };
          }
          return b;
        });
        return next;
      });

      const nowStr = new Date().toISOString().replace('T', ' ').slice(0, 19);
      setTrades((prev) => [
        {
          id: `CNV-${Math.floor(100000 + Math.random() * 900000)}`,
          orderId: 'INSTANT-CONVERT',
          pair: `${toAsset}/${fromAsset}`,
          side: 'Buy',
          price: Number((fromAmount / Math.max(0.00001, toAmount)).toFixed(4)),
          amount: toAmount,
          fee: 0,
          feeAsset: toAsset,
          role: 'Maker',
          total: fromAmount,
          timestamp: nowStr,
        },
        ...prev,
      ]);

      pushToast({
        type: 'success',
        title: 'Zero-Fee Conversion Completed',
        description: `Converted ${fromAmount} ${fromAsset} to ${toAmount.toFixed(4)} ${toAsset} instantly.`,
      });
      return true;
    },
    [isAuthenticated, openAuthModal, balances, pushToast]
  );

  const depositAsset = useCallback(
    (asset: string, amount: number, network: string) => {
      setBalances((prev) =>
        prev.map((b) =>
          b.asset === asset
            ? {
                ...b,
                available: Number((b.available + amount).toFixed(4)),
                usdtValuation: Number((b.usdtValuation + amount).toFixed(2)),
              }
            : b
        )
      );
      pushToast({
        type: 'success',
        title: 'Deposit Confirmed on Blockchain',
        description: `+${amount} ${asset} credited via ${network} to your Spot Wallet.`,
      });
    },
    [pushToast]
  );

  const withdrawAsset = useCallback(
    (asset: string, amount: number, address: string, network: string, fee: number): boolean => {
      if (!isAuthenticated) {
        openAuthModal('login');
        return false;
      }
      const bal = balances.find((b) => b.asset === asset);
      if (!bal || bal.available < amount) {
        pushToast({
          type: 'error',
          title: 'Insufficient Available Balance',
          description: `Cannot withdraw ${amount} ${asset}. Available: ${bal?.available || 0} ${asset}`,
        });
        return false;
      }

      setBalances((prev) =>
        prev.map((b) =>
          b.asset === asset
            ? {
                ...b,
                available: Math.max(0, Number((b.available - amount).toFixed(4))),
              }
            : b
        )
      );

      pushToast({
        type: 'success',
        title: 'Withdrawal Broadcasted',
        description: `${(amount - fee).toFixed(4)} ${asset} sent to ${address.slice(0, 8)}...${address.slice(-6)} (${network}).`,
      });
      return true;
    },
    [isAuthenticated, openAuthModal, balances, pushToast]
  );

  const subscribeEarn = useCallback(
    (asset: string, amount: number, apr: number): boolean => {
      if (!isAuthenticated) {
        openAuthModal('login');
        return false;
      }
      const bal = balances.find((b) => b.asset === asset);
      if (!bal || bal.available < amount) {
        pushToast({
          type: 'error',
          title: `Insufficient ${asset} Balance`,
          description: `Please deposit or convert ${asset} before subscribing to Simple Earn.`,
        });
        return false;
      }

      setBalances((prev) =>
        prev.map((b) =>
          b.asset === asset
            ? {
                ...b,
                available: Number((b.available - amount).toFixed(4)),
                staked: Number((b.staked + amount).toFixed(4)),
              }
            : b
        )
      );

      pushToast({
        type: 'success',
        title: 'Simple Earn Subscription Active',
        description: `Staked ${amount} ${asset} at ${apr}% Est. APR. Daily rewards start accruing tomorrow.`,
      });
      return true;
    },
    [isAuthenticated, openAuthModal, balances, pushToast]
  );

  const claimAirdrop = useCallback(
    (campaignId: string) => {
      if (!isAuthenticated) {
        openAuthModal('login');
        return;
      }
      setAirdrops((prev) =>
        prev.map((a) => (a.id === campaignId ? { ...a, userClaimed: true } : a))
      );
      const target = airdrops.find((a) => a.id === campaignId);
      pushToast({
        type: 'success',
        title: 'Airdrop Allocation Claimed',
        description: `${target?.estimatedAllocation || 'Reward'} credited to your Spot Wallet.`,
      });
    },
    [isAuthenticated, openAuthModal, airdrops, pushToast]
  );

  const markNotificationRead = useCallback((id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  }, []);

  const markAllNotificationsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    pushToast({
      type: 'info',
      title: 'Notifications Cleared',
      description: 'All notifications marked as read.',
    });
  }, [pushToast]);

  const updateUserProfile = useCallback(
    (patch: Partial<UserProfile>) => {
      setUser((prev) => ({ ...prev, ...patch }));
      pushToast({
        type: 'success',
        title: 'Account Settings Updated',
        description: 'Your security and profile preferences have been saved.',
      });
    },
    [pushToast]
  );

  return (
    <ExchangeContext.Provider
      value={{
        route,
        navigate,
        theme,
        toggleTheme,
        tickers,
        selectedPair,
        setSelectedPair,
        toggleFavoritePair,
        isLiveConnected,
        isAuthenticated,
        user,
        authModalOpen,
        authModalMode,
        openAuthModal,
        closeAuthModal,
        login,
        logout,
        balances,
        orders,
        trades,
        notifications,
        airdrops,
        placeOrder,
        cancelOrder,
        cancelAllOpenOrders,
        convertCrypto,
        depositAsset,
        withdrawAsset,
        subscribeEarn,
        claimAirdrop,
        markNotificationRead,
        markAllNotificationsRead,
        updateUserProfile,
        toasts,
        pushToast,
        dismissToast,
      }}
    >
      {children}
    </ExchangeContext.Provider>
  );
};

export function useExchange() {
  const ctx = useContext(ExchangeContext);
  if (!ctx) throw new Error('useExchange must be used within ExchangeProvider');
  return ctx;
}
