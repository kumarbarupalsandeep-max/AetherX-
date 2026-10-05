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
import { AIRDROP_CAMPAIGNS } from '../data/exchangeData';

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
  marketLoading: boolean;
  marketError: string | null;
  refreshMarkets: () => Promise<void>;
  selectedPair: string;
  setSelectedPair: (symbol: string) => void;
  toggleFavoritePair: (symbol: string) => void;
  isLiveConnected: boolean;
  isAuthenticated: boolean;
  authLoading: boolean;
  sessionToken: string | null;
  user: UserProfile | null;
  authModalOpen: boolean;
  authModalMode: 'login' | 'register';
  openAuthModal: (mode?: 'login' | 'register') => void;
  closeAuthModal: () => void;
  loginWithCredentials: (email: string, password: string) => Promise<boolean>;
  registerAccount: (email: string, password: string, referralCode?: string) => Promise<boolean>;
  logout: () => Promise<void>;
  balances: AssetBalance[];
  orders: ExchangeOrder[];
  trades: ExecutedTrade[];
  notifications: NotificationItem[];
  airdrops: AirdropCampaign[];
  refreshUserData: () => Promise<void>;
  placeOrder: (params: {
    pair: string;
    marketType: 'Spot' | 'Futures';
    type: 'Limit' | 'Market' | 'Stop-Limit';
    side: 'Buy' | 'Sell';
    price: number;
    stopPrice?: number;
    amount: number;
    leverage?: number;
  }) => Promise<boolean>;
  cancelOrder: (orderId: string) => Promise<void>;
  cancelAllOpenOrders: () => Promise<void>;
  convertCrypto: (
    fromAsset: string,
    toAsset: string,
    fromAmount: number,
    toAmount: number
  ) => Promise<boolean>;
  depositAsset: (asset: string, amount: number, network: string, txHash?: string) => Promise<boolean>;
  withdrawAsset: (
    asset: string,
    amount: number,
    address: string,
    network: string,
    fee: number
  ) => Promise<boolean>;
  subscribeEarn: (asset: string, amount: number, apr: number) => Promise<boolean>;
  claimAirdrop: (campaignId: string) => Promise<void>;
  markNotificationRead: (id: string) => Promise<void>;
  markAllNotificationsRead: () => Promise<void>;
  updateUserProfile: (patch: Partial<UserProfile>) => Promise<void>;
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

  const [favoriteSymbols, setFavoriteSymbols] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('aetherx_favs');
      return saved ? JSON.parse(saved) : ['BTCUSDT', 'ETHUSDT', 'SOLUSDT', 'BNBUSDT'];
    } catch {
      return ['BTCUSDT', 'ETHUSDT', 'SOLUSDT', 'BNBUSDT'];
    }
  });

  const [tickers, setTickers] = useState<TickerPair[]>([]);
  const [marketLoading, setMarketLoading] = useState<boolean>(true);
  const [marketError, setMarketError] = useState<string | null>(null);
  const [selectedPair, setSelectedPair] = useState<string>('BTCUSDT');
  const [isLiveConnected, setIsLiveConnected] = useState<boolean>(false);

  const [sessionToken, setSessionToken] = useState<string | null>(() => {
    return localStorage.getItem('aetherx_session_token');
  });
  const [user, setUser] = useState<UserProfile | null>(null);
  const [authLoading, setAuthLoading] = useState<boolean>(true);
  const [authModalOpen, setAuthModalOpen] = useState<boolean>(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');

  const [balances, setBalances] = useState<AssetBalance[]>([]);
  const [orders, setOrders] = useState<ExchangeOrder[]>([]);
  const [trades, setTrades] = useState<ExecutedTrade[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [airdrops, setAirdrops] = useState<AirdropCampaign[]>(AIRDROP_CAMPAIGNS);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const pushToast = useCallback((toast: Omit<ToastMessage, 'id'>) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    setToasts((prev) => [...prev, { ...toast, id }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

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

  // Fetch Real Upstream Market Data from Backend API (/api/market/tickers)
  const refreshMarkets = useCallback(async () => {
    try {
      const res = await fetch('/api/market/tickers');
      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}));
        throw new Error(errBody.error || `Market API returned HTTP ${res.status}`);
      }
      const data = await res.json();
      if (!Array.isArray(data.tickers) || data.tickers.length === 0) {
        throw new Error('Live market ticker feed returned empty dataset');
      }

      setTickers(
        data.tickers.map((t: TickerPair) => ({
          ...t,
          isFavorite: favoriteSymbols.includes(t.symbol),
        }))
      );
      setMarketError(null);
      setIsLiveConnected(true);
    } catch (err: any) {
      setIsLiveConnected(false);
      setMarketError(err.message || 'Live market data unavailable');
    } finally {
      setMarketLoading(false);
    }
  }, [favoriteSymbols]);

  useEffect(() => {
    refreshMarkets();
    const interval = setInterval(refreshMarkets, 4000);
    return () => clearInterval(interval);
  }, [refreshMarkets]);

  const toggleFavoritePair = useCallback((symbol: string) => {
    setFavoriteSymbols((prev) => {
      const next = prev.includes(symbol)
        ? prev.filter((s) => s !== symbol)
        : [...prev, symbol];
      localStorage.setItem('aetherx_favs', JSON.stringify(next));
      return next;
    });
    setTickers((prev) =>
      prev.map((t) => (t.symbol === symbol ? { ...t, isFavorite: !t.isFavorite } : t))
    );
  }, []);

  // Fetch Authenticated User's Real SQLite Ledger, Orders, Trades & Notifications
  const refreshUserData = useCallback(
    async (overrideToken?: string | null) => {
      const activeToken = overrideToken !== undefined ? overrideToken : sessionToken;
      if (!activeToken) {
        setUser(null);
        setBalances([]);
        setOrders([]);
        setTrades([]);
        setNotifications([]);
        setAuthLoading(false);
        return;
      }

      const headers = { Authorization: `Bearer ${activeToken}` };
      try {
        const [meRes, walRes, ordRes, trdRes, ntfRes, airRes] = await Promise.all([
          fetch('/api/auth/me', { headers }),
          fetch('/api/wallet/balances', { headers }),
          fetch('/api/orders', { headers }),
          fetch('/api/trades', { headers }),
          fetch('/api/notifications', { headers }),
          fetch('/api/airdrop/claims', { headers }),
        ]);

        if (meRes.status === 401) {
          localStorage.removeItem('aetherx_session_token');
          setSessionToken(null);
          setUser(null);
          setBalances([]);
          setOrders([]);
          setTrades([]);
          setNotifications([]);
          setAuthLoading(false);
          return;
        }

        if (meRes.ok) {
          const meData = await meRes.json();
          setUser(meData.user);
        }
        if (walRes.ok) {
          const walData = await walRes.json();
          setBalances(walData.balances || []);
        }
        if (ordRes.ok) {
          const ordData = await ordRes.json();
          setOrders(ordData.orders || []);
        }
        if (trdRes.ok) {
          const trdData = await trdRes.json();
          setTrades(trdData.trades || []);
        }
        if (ntfRes.ok) {
          const ntfData = await ntfRes.json();
          setNotifications(ntfData.notifications || []);
        }
        if (airRes.ok) {
          const airData = await airRes.json();
          const claimedIds: string[] = airData.claimedCampaignIds || [];
          setAirdrops(
            AIRDROP_CAMPAIGNS.map((c) => ({
              ...c,
              userClaimed: claimedIds.includes(c.id),
            }))
          );
        }
      } catch (err) {
        console.error('Failed to synchronize user account state:', err);
      } finally {
        setAuthLoading(false);
      }
    },
    [sessionToken]
  );

  useEffect(() => {
    refreshUserData();
  }, [refreshUserData]);

  const openAuthModal = useCallback((mode: 'login' | 'register' = 'login') => {
    setAuthModalMode(mode);
    setAuthModalOpen(true);
  }, []);

  const closeAuthModal = useCallback(() => {
    setAuthModalOpen(false);
  }, []);

  const loginWithCredentials = useCallback(
    async (email: string, password: string): Promise<boolean> => {
      try {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });
        const data = await res.json();
        if (!res.ok) {
          pushToast({
            type: 'error',
            title: 'Login Failed',
            description: data.error || 'Invalid credentials.',
          });
          return false;
        }

        localStorage.setItem('aetherx_session_token', data.token);
        setSessionToken(data.token);
        setUser(data.user);
        setAuthModalOpen(false);
        await refreshUserData(data.token);

        pushToast({
          type: 'success',
          title: 'Signed In Successfully',
          description: `Authenticated as ${data.user.email} (UID: ${data.user.uid})`,
        });
        return true;
      } catch (err: any) {
        pushToast({
          type: 'error',
          title: 'Authentication Service Error',
          description: err.message || 'Unable to reach backend authentication service.',
        });
        return false;
      }
    },
    [pushToast, refreshUserData]
  );

  const registerAccount = useCallback(
    async (email: string, password: string, referralCode?: string): Promise<boolean> => {
      try {
        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password, referralCode }),
        });
        const data = await res.json();
        if (!res.ok) {
          pushToast({
            type: 'error',
            title: 'Registration Failed',
            description: data.error || 'Could not register account.',
          });
          return false;
        }

        localStorage.setItem('aetherx_session_token', data.token);
        setSessionToken(data.token);
        setUser(data.user);
        setAuthModalOpen(false);
        await refreshUserData(data.token);

        pushToast({
          type: 'success',
          title: 'Account Created & Wallets Provisioned',
          description: `Welcome ${data.user.email}! Your Spot wallets are ready.`,
        });
        return true;
      } catch (err: any) {
        pushToast({
          type: 'error',
          title: 'Registration Service Error',
          description: err.message || 'Unable to reach backend service.',
        });
        return false;
      }
    },
    [pushToast, refreshUserData]
  );

  const logout = useCallback(async () => {
    if (sessionToken) {
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: { Authorization: `Bearer ${sessionToken}` },
      }).catch(() => {});
    }
    localStorage.removeItem('aetherx_session_token');
    setSessionToken(null);
    setUser(null);
    setBalances([]);
    setOrders([]);
    setTrades([]);
    setNotifications([]);
    pushToast({
      type: 'info',
      title: 'Signed Out',
      description: 'Your session token has been revoked.',
    });
  }, [sessionToken, pushToast]);

  const placeOrder = useCallback(
    async (params: {
      pair: string;
      marketType: 'Spot' | 'Futures';
      type: 'Limit' | 'Market' | 'Stop-Limit';
      side: 'Buy' | 'Sell';
      price: number;
      stopPrice?: number;
      amount: number;
      leverage?: number;
    }): Promise<boolean> => {
      if (!sessionToken || !user) {
        openAuthModal('login');
        return false;
      }

      try {
        const res = await fetch('/api/orders', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${sessionToken}`,
          },
          body: JSON.stringify({
            ...params,
            clientOrderId: `CLI-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          }),
        });
        const data = await res.json();
        if (!res.ok) {
          pushToast({
            type: 'error',
            title: 'Order Rejected',
            description: data.error || 'Could not place order.',
          });
          return false;
        }

        await refreshUserData();
        pushToast({
          type: 'success',
          title: data.executedImmediately
            ? `${params.marketType} ${params.side} Order Filled`
            : `${params.type} ${params.side} Order Placed`,
          description: `${params.amount} ${params.pair.replace('USDT', '')} @ ${Number(
            data.executionPrice
          ).toLocaleString()} USDT (#${data.orderId})`,
        });
        return true;
      } catch (err: any) {
        pushToast({
          type: 'error',
          title: 'Order Execution Error',
          description: err.message || 'Backend order engine unreachable.',
        });
        return false;
      }
    },
    [sessionToken, user, openAuthModal, pushToast, refreshUserData]
  );

  const cancelOrder = useCallback(
    async (orderId: string) => {
      if (!sessionToken) return;
      try {
        const res = await fetch(`/api/orders/${orderId}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${sessionToken}` },
        });
        const data = await res.json();
        if (!res.ok) {
          pushToast({
            type: 'error',
            title: 'Cancel Failed',
            description: data.error || 'Could not cancel order.',
          });
          return;
        }
        await refreshUserData();
        pushToast({
          type: 'info',
          title: 'Order Cancelled',
          description: `Order #${orderId} cancelled and reserved funds unlocked in database.`,
        });
      } catch (err: any) {
        pushToast({
          type: 'error',
          title: 'Network Error',
          description: err.message,
        });
      }
    },
    [sessionToken, pushToast, refreshUserData]
  );

  const cancelAllOpenOrders = useCallback(async () => {
    if (!sessionToken) return;
    try {
      const res = await fetch('/api/orders/cancel-all', {
        method: 'POST',
        headers: { Authorization: `Bearer ${sessionToken}` },
      });
      const data = await res.json();
      if (!res.ok) {
        pushToast({
          type: 'error',
          title: 'Cancel All Failed',
          description: data.error,
        });
        return;
      }
      await refreshUserData();
      pushToast({
        type: 'info',
        title: 'All Open Orders Cancelled',
        description: `${data.cancelledCount} active order(s) cancelled and funds unlocked.`,
      });
    } catch (err: any) {
      pushToast({ type: 'error', title: 'Error', description: err.message });
    }
  }, [sessionToken, pushToast, refreshUserData]);

  const convertCrypto = useCallback(
    async (
      fromAsset: string,
      toAsset: string,
      fromAmount: number,
      _toAmount: number
    ): Promise<boolean> => {
      if (!sessionToken || !user) {
        openAuthModal('login');
        return false;
      }
      try {
        const res = await fetch('/api/convert', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${sessionToken}`,
          },
          body: JSON.stringify({ fromAsset, toAsset, fromAmount }),
        });
        const data = await res.json();
        if (!res.ok) {
          pushToast({
            type: 'error',
            title: 'Conversion Rejected',
            description: data.error || 'Conversion failed.',
          });
          return false;
        }
        await refreshUserData();
        pushToast({
          type: 'success',
          title: 'Zero-Fee Conversion Settled',
          description: `Converted ${data.fromAmount} ${fromAsset} to ${Number(
            data.toAmount
          ).toFixed(6)} ${toAsset} in your Spot Wallet.`,
        });
        return true;
      } catch (err: any) {
        pushToast({
          type: 'error',
          title: 'Conversion Error',
          description: err.message,
        });
        return false;
      }
    },
    [sessionToken, user, openAuthModal, pushToast, refreshUserData]
  );

  const depositAsset = useCallback(
    async (
      asset: string,
      amount: number,
      network: string,
      txHash?: string
    ): Promise<boolean> => {
      if (!sessionToken || !user) {
        openAuthModal('login');
        return false;
      }
      try {
        const res = await fetch('/api/wallet/deposit', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${sessionToken}`,
          },
          body: JSON.stringify({ asset, amount, network, txHash }),
        });
        const data = await res.json();
        if (!res.ok) {
          pushToast({
            type: 'error',
            title: 'Deposit Failed',
            description: data.error,
          });
          return false;
        }
        await refreshUserData();
        pushToast({
          type: 'success',
          title: 'Deposit Credited to Ledger',
          description: `+${amount} ${asset} confirmed on ${network} (TX: ${data.txHash.slice(
            0,
            12
          )}...).`,
        });
        return true;
      } catch (err: any) {
        pushToast({
          type: 'error',
          title: 'Deposit Error',
          description: err.message,
        });
        return false;
      }
    },
    [sessionToken, user, openAuthModal, pushToast, refreshUserData]
  );

  const withdrawAsset = useCallback(
    async (
      asset: string,
      amount: number,
      address: string,
      network: string,
      fee: number
    ): Promise<boolean> => {
      if (!sessionToken || !user) {
        openAuthModal('login');
        return false;
      }
      try {
        const res = await fetch('/api/wallet/withdraw', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${sessionToken}`,
          },
          body: JSON.stringify({ asset, amount, address, network, fee }),
        });
        const data = await res.json();
        if (!res.ok) {
          pushToast({
            type: 'error',
            title: 'Withdrawal Rejected',
            description: data.error,
          });
          return false;
        }
        await refreshUserData();
        pushToast({
          type: 'success',
          title: 'Withdrawal Broadcasted',
          description: `${(amount - fee).toFixed(4)} ${asset} sent to ${address.slice(
            0,
            8
          )}... (TX: ${data.txHash.slice(0, 10)}...)`,
        });
        return true;
      } catch (err: any) {
        pushToast({
          type: 'error',
          title: 'Withdrawal Error',
          description: err.message,
        });
        return false;
      }
    },
    [sessionToken, user, openAuthModal, pushToast, refreshUserData]
  );

  const subscribeEarn = useCallback(
    async (asset: string, amount: number, apr: number): Promise<boolean> => {
      if (!sessionToken || !user) {
        openAuthModal('login');
        return false;
      }
      try {
        const res = await fetch('/api/earn/subscribe', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${sessionToken}`,
          },
          body: JSON.stringify({ asset, amount, apr }),
        });
        const data = await res.json();
        if (!res.ok) {
          pushToast({
            type: 'error',
            title: 'Subscription Rejected',
            description: data.error,
          });
          return false;
        }
        await refreshUserData();
        pushToast({
          type: 'success',
          title: 'Simple Earn Subscription Active',
          description: `Staked ${amount} ${asset} at ${apr}% APR in database ledger.`,
        });
        return true;
      } catch (err: any) {
        pushToast({
          type: 'error',
          title: 'Earn Error',
          description: err.message,
        });
        return false;
      }
    },
    [sessionToken, user, openAuthModal, pushToast, refreshUserData]
  );

  const claimAirdrop = useCallback(
    async (campaignId: string) => {
      if (!sessionToken || !user) {
        openAuthModal('login');
        return;
      }
      const target = airdrops.find((a) => a.id === campaignId);
      if (!target) return;

      try {
        const res = await fetch('/api/airdrop/claim', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${sessionToken}`,
          },
          body: JSON.stringify({
            campaignId,
            snapshotAsset: target.snapshotAsset,
            minHoldingRequired: target.minHoldingRequired,
            rewardAmount: parseFloat(target.estimatedAllocation) || 50,
          }),
        });
        const data = await res.json();
        if (!res.ok) {
          pushToast({
            type: 'error',
            title: 'Airdrop Claim Rejected',
            description: data.error,
          });
          return;
        }
        await refreshUserData();
        pushToast({
          type: 'success',
          title: 'Airdrop Allocation Claimed',
          description: `${target.estimatedAllocation} credited to your Spot USDT Wallet.`,
        });
      } catch (err: any) {
        pushToast({
          type: 'error',
          title: 'Claim Error',
          description: err.message,
        });
      }
    },
    [sessionToken, user, openAuthModal, airdrops, pushToast, refreshUserData]
  );

  const markNotificationRead = useCallback(
    async (id: string) => {
      if (!sessionToken) return;
      await fetch(`/api/notifications/${id}/read`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${sessionToken}` },
      }).catch(() => {});
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    },
    [sessionToken]
  );

  const markAllNotificationsRead = useCallback(async () => {
    if (!sessionToken) return;
    await fetch('/api/notifications/read-all', {
      method: 'POST',
      headers: { Authorization: `Bearer ${sessionToken}` },
    }).catch(() => {});
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    pushToast({
      type: 'info',
      title: 'Notifications Updated',
      description: 'All notifications marked as read.',
    });
  }, [sessionToken, pushToast]);

  const updateUserProfile = useCallback(
    async (patch: Partial<UserProfile>) => {
      if (!sessionToken) return;
      try {
        const res = await fetch('/api/account/profile', {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${sessionToken}`,
          },
          body: JSON.stringify(patch),
        });
        const data = await res.json();
        if (!res.ok) {
          pushToast({
            type: 'error',
            title: 'Update Failed',
            description: data.error,
          });
          return;
        }
        setUser(data.user);
        pushToast({
          type: 'success',
          title: 'Account & Security Updated',
          description: 'Your preferences have been persisted to the database.',
        });
      } catch (err: any) {
        pushToast({
          type: 'error',
          title: 'Update Error',
          description: err.message,
        });
      }
    },
    [sessionToken, pushToast]
  );

  return (
    <ExchangeContext.Provider
      value={{
        route,
        navigate,
        theme,
        toggleTheme,
        tickers,
        marketLoading,
        marketError,
        refreshMarkets,
        selectedPair,
        setSelectedPair,
        toggleFavoritePair,
        isLiveConnected,
        isAuthenticated: Boolean(user && sessionToken),
        authLoading,
        sessionToken,
        user,
        authModalOpen,
        authModalMode,
        openAuthModal,
        closeAuthModal,
        loginWithCredentials,
        registerAccount,
        logout,
        balances,
        orders,
        trades,
        notifications,
        airdrops,
        refreshUserData,
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
