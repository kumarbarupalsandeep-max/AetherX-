export type RoutePath =
  | '/'
  | '/markets'
  | '/trade/spot'
  | '/trade/futures'
  | '/buy-crypto'
  | '/convert'
  | '/p2p'
  | '/earn'
  | '/airdrop'
  | '/referral'
  | '/wallet'
  | '/deposit'
  | '/withdraw'
  | '/orders'
  | '/order-history'
  | '/trade-history'
  | '/account'
  | '/security'
  | '/kyc'
  | '/notifications'
  | '/support'
  | '/sitemap'
  | '/fees'
  | '/announcements'
  | '/proof-of-reserves'
  | '/api-docs';

export interface TickerPair {
  symbol: string;       // e.g. 'BTCUSDT'
  baseAsset: string;    // e.g. 'BTC'
  quoteAsset: string;   // e.g. 'USDT'
  name: string;         // e.g. 'Bitcoin'
  category: 'Layer 1' | 'DeFi' | 'AI' | 'Solana' | 'Payments' | 'Infra';
  price: number;
  priceChange: number;
  priceChangePercent: number;
  high24h: number;
  low24h: number;
  volume24h: number;    // Base volume
  quoteVolume24h: number; // USDT volume
  marketCap: number;
  maxLeverage: number;
  fundingRate: number;
  isFavorite?: boolean;
}

export interface OrderBookEntry {
  price: number;
  amount: number;
  total: number;
  depthPercent: number;
}

export interface RecentTrade {
  id: string;
  price: number;
  amount: number;
  time: string;
  isBuyerMaker: boolean;
}

export interface CandleData {
  time: number;
  label: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  ma7?: number;
  ma25?: number;
  ma99?: number;
}

export interface ExchangeOrder {
  id: string;
  pair: string;
  marketType: 'Spot' | 'Futures';
  type: 'Limit' | 'Market' | 'Stop-Limit';
  side: 'Buy' | 'Sell';
  price: number;
  stopPrice?: number;
  amount: number;
  filled: number;
  total: number;
  status: 'Open' | 'Filled' | 'Cancelled' | 'Partially Filled';
  createdAt: string;
  leverage?: number;
}

export interface ExecutedTrade {
  id: string;
  orderId: string;
  pair: string;
  side: 'Buy' | 'Sell';
  price: number;
  amount: number;
  fee: number;
  feeAsset: string;
  role: 'Maker' | 'Taker';
  total: number;
  timestamp: string;
}

export interface AssetBalance {
  asset: string;
  name: string;
  available: number;
  inOrder: number;
  staked: number;
  btcValuation: number;
  usdtValuation: number;
  networks: {
    name: string;
    code: string;
    fee: number;
    minWithdraw: number;
    arrivalTime: string;
    depositAddress: string;
  }[];
}

export interface P2PAdvert {
  id: string;
  merchantName: string;
  verified: boolean;
  completedOrders: number;
  completionRate: number;
  avgReleaseMinutes: number;
  side: 'Buy' | 'Sell'; // From user perspective: Buy means user buys from merchant
  asset: 'USDT' | 'BTC' | 'ETH' | 'USDC';
  fiat: 'USD' | 'EUR' | 'INR' | 'GBP' | 'AED';
  fiatSymbol: string;
  price: number;
  available: number;
  minLimit: number;
  maxLimit: number;
  paymentMethods: string[];
}

export interface EarnProduct {
  id: string;
  asset: string;
  name: string;
  apr: number;
  durationDays: 'Flexible' | 30 | 60 | 90 | 120;
  minAmount: number;
  maxQuota: number;
  totalSubscribedPercent: number;
  tag?: string;
}

export interface AirdropCampaign {
  id: string;
  project: string;
  token: string;
  title: string;
  description: string;
  totalRewardPool: string;
  participants: number;
  status: 'Active' | 'Upcoming' | 'Completed';
  endsIn: string;
  snapshotAsset: string;
  minHoldingRequired: number;
  userClaimed: boolean;
  estimatedAllocation: string;
}

export interface NotificationItem {
  id: string;
  category: 'System' | 'Trade' | 'Wallet' | 'Security' | 'Campaign';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  actionRoute?: RoutePath;
}

export interface UserProfile {
  uid: string;
  email: string;
  nickname: string;
  vipLevel: 'Regular' | 'VIP 1' | 'VIP 2' | 'VIP 3';
  kycStatus: 'Unverified' | 'Pending' | 'Verified Plus';
  kycDailyLimitUSDT: number;
  twoFactorEnabled: boolean;
  antiPhishingCode: string;
  withdrawalWhitelistEnabled: boolean;
  passkeyConnected: boolean;
  referralCode: string;
  referredFriends: number;
  totalCommissionUSDT: number;
}
