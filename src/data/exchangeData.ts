import {
  TickerPair,
  AssetBalance,
  P2PAdvert,
  EarnProduct,
  AirdropCampaign,
  NotificationItem,
  ExchangeOrder,
  ExecutedTrade,
  CandleData,
  OrderBookEntry,
  RecentTrade
} from '../types/exchange';

export const INITIAL_TICKERS: TickerPair[] = [
  {
    symbol: 'BTCUSDT',
    baseAsset: 'BTC',
    quoteAsset: 'USDT',
    name: 'Bitcoin',
    category: 'Layer 1',
    price: 89420.50,
    priceChange: 2145.20,
    priceChangePercent: 2.46,
    high24h: 90120.00,
    low24h: 86950.00,
    volume24h: 34892.41,
    quoteVolume24h: 3118429000,
    marketCap: 1768000000000,
    maxLeverage: 125,
    fundingRate: 0.0100,
    isFavorite: true,
  },
  {
    symbol: 'ETHUSDT',
    baseAsset: 'ETH',
    quoteAsset: 'USDT',
    name: 'Ethereum',
    category: 'Layer 1',
    price: 3142.85,
    priceChange: 84.15,
    priceChangePercent: 2.75,
    high24h: 3195.00,
    low24h: 3040.20,
    volume24h: 412890.55,
    quoteVolume24h: 1296500000,
    marketCap: 378200000000,
    maxLeverage: 100,
    fundingRate: 0.0100,
    isFavorite: true,
  },
  {
    symbol: 'SOLUSDT',
    baseAsset: 'SOL',
    quoteAsset: 'USDT',
    name: 'Solana',
    category: 'Solana',
    price: 194.60,
    priceChange: 11.40,
    priceChangePercent: 6.22,
    high24h: 198.40,
    low24h: 181.90,
    volume24h: 4829100.10,
    quoteVolume24h: 938400000,
    marketCap: 92400000000,
    maxLeverage: 75,
    fundingRate: 0.0125,
    isFavorite: true,
  },
  {
    symbol: 'BNBUSDT',
    baseAsset: 'BNB',
    quoteAsset: 'USDT',
    name: 'BNB Chain',
    category: 'Layer 1',
    price: 642.30,
    priceChange: 8.90,
    priceChangePercent: 1.41,
    high24h: 649.00,
    low24h: 630.50,
    volume24h: 382910.00,
    quoteVolume24h: 245900000,
    marketCap: 93800000000,
    maxLeverage: 75,
    fundingRate: 0.0085,
    isFavorite: true,
  },
  {
    symbol: 'XRPUSDT',
    baseAsset: 'XRP',
    quoteAsset: 'USDT',
    name: 'XRP Ledger',
    category: 'Payments',
    price: 1.4820,
    priceChange: -0.0310,
    priceChangePercent: -2.05,
    high24h: 1.5400,
    low24h: 1.4510,
    volume24h: 392810400,
    quoteVolume24h: 582145000,
    marketCap: 84500000000,
    maxLeverage: 75,
    fundingRate: 0.0092,
    isFavorite: false,
  },
  {
    symbol: 'ADAUSDT',
    baseAsset: 'ADA',
    quoteAsset: 'USDT',
    name: 'Cardano',
    category: 'Layer 1',
    price: 0.7840,
    priceChange: 0.0290,
    priceChangePercent: 3.84,
    high24h: 0.8010,
    low24h: 0.7490,
    volume24h: 241920000,
    quoteVolume24h: 189665000,
    marketCap: 27900000000,
    maxLeverage: 50,
    fundingRate: 0.0100,
    isFavorite: false,
  },
  {
    symbol: 'AVAXUSDT',
    baseAsset: 'AVAX',
    quoteAsset: 'USDT',
    name: 'Avalanche',
    category: 'Layer 1',
    price: 34.82,
    priceChange: 1.92,
    priceChangePercent: 5.84,
    high24h: 35.60,
    low24h: 32.50,
    volume24h: 5912400,
    quoteVolume24h: 205860000,
    marketCap: 14250000000,
    maxLeverage: 50,
    fundingRate: 0.0105,
    isFavorite: false,
  },
  {
    symbol: 'LINKUSDT',
    baseAsset: 'LINK',
    quoteAsset: 'USDT',
    name: 'Chainlink',
    category: 'Infra',
    price: 18.64,
    priceChange: 0.74,
    priceChangePercent: 4.13,
    high24h: 19.10,
    low24h: 17.75,
    volume24h: 8940120,
    quoteVolume24h: 166640000,
    marketCap: 11680000000,
    maxLeverage: 50,
    fundingRate: 0.0100,
    isFavorite: true,
  },
  {
    symbol: 'SUIUSDT',
    baseAsset: 'SUI',
    quoteAsset: 'USDT',
    name: 'Sui Network',
    category: 'Layer 1',
    price: 3.284,
    priceChange: 0.241,
    priceChangePercent: 7.92,
    high24h: 3.390,
    low24h: 3.012,
    volume24h: 98412000,
    quoteVolume24h: 323180000,
    marketCap: 9320000000,
    maxLeverage: 50,
    fundingRate: 0.0140,
    isFavorite: false,
  },
  {
    symbol: 'NEARUSDT',
    baseAsset: 'NEAR',
    quoteAsset: 'USDT',
    name: 'NEAR Protocol',
    category: 'AI',
    price: 5.840,
    priceChange: 0.310,
    priceChangePercent: 5.61,
    high24h: 6.020,
    low24h: 5.480,
    volume24h: 24910000,
    quoteVolume24h: 145470000,
    marketCap: 7120000000,
    maxLeverage: 50,
    fundingRate: 0.0100,
    isFavorite: false,
  },
  {
    symbol: 'RENDERUSDT',
    baseAsset: 'RENDER',
    quoteAsset: 'USDT',
    name: 'Render Network',
    category: 'AI',
    price: 7.920,
    priceChange: 0.610,
    priceChangePercent: 8.34,
    high24h: 8.150,
    low24h: 7.210,
    volume24h: 16420000,
    quoteVolume24h: 130046000,
    marketCap: 4100000000,
    maxLeverage: 50,
    fundingRate: 0.0115,
    isFavorite: false,
  },
  {
    symbol: 'UNIUSDT',
    baseAsset: 'UNI',
    quoteAsset: 'USDT',
    name: 'Uniswap',
    category: 'DeFi',
    price: 9.480,
    priceChange: -0.180,
    priceChangePercent: -1.86,
    high24h: 9.850,
    low24h: 9.310,
    volume24h: 11290000,
    quoteVolume24h: 107029000,
    marketCap: 5690000000,
    maxLeverage: 50,
    fundingRate: 0.0100,
    isFavorite: false,
  },
  {
    symbol: 'AAVEUSDT',
    baseAsset: 'AAVE',
    quoteAsset: 'USDT',
    name: 'Aave Protocol',
    category: 'DeFi',
    price: 184.50,
    priceChange: 6.80,
    priceChangePercent: 3.83,
    high24h: 189.20,
    low24h: 176.40,
    volume24h: 642100,
    quoteVolume24h: 118467000,
    marketCap: 2760000000,
    maxLeverage: 50,
    fundingRate: 0.0100,
    isFavorite: false,
  },
  {
    symbol: 'ARBUSDT',
    baseAsset: 'ARB',
    quoteAsset: 'USDT',
    name: 'Arbitrum',
    category: 'Infra',
    price: 0.9420,
    priceChange: -0.0190,
    priceChangePercent: -1.98,
    high24h: 0.9780,
    low24h: 0.9250,
    volume24h: 89412000,
    quoteVolume24h: 84226000,
    marketCap: 3740000000,
    maxLeverage: 50,
    fundingRate: 0.0100,
    isFavorite: false,
  },
  {
    symbol: 'DOTUSDT',
    baseAsset: 'DOT',
    quoteAsset: 'USDT',
    name: 'Polkadot',
    category: 'Layer 1',
    price: 6.420,
    priceChange: 0.140,
    priceChangePercent: 2.23,
    high24h: 6.590,
    low24h: 6.210,
    volume24h: 14290000,
    quoteVolume24h: 91741000,
    marketCap: 9210000000,
    maxLeverage: 50,
    fundingRate: 0.0100,
    isFavorite: false,
  },
  {
    symbol: 'DOGEUSDT',
    baseAsset: 'DOGE',
    quoteAsset: 'USDT',
    name: 'Dogecoin',
    category: 'Payments',
    price: 0.2415,
    priceChange: 0.0112,
    priceChangePercent: 4.86,
    high24h: 0.2498,
    low24h: 0.2280,
    volume24h: 1842900000,
    quoteVolume24h: 445060000,
    marketCap: 35400000000,
    maxLeverage: 75,
    fundingRate: 0.0110,
    isFavorite: false,
  }
];

export const INITIAL_BALANCES: AssetBalance[] = [
  {
    asset: 'USDT',
    name: 'Tether US',
    available: 28450.75,
    inOrder: 3250.00,
    staked: 10000.00,
    btcValuation: 0.4663,
    usdtValuation: 41700.75,
    networks: [
      { name: 'Tron (TRC20)', code: 'TRX', fee: 1.0, minWithdraw: 10, arrivalTime: '~2 mins', depositAddress: 'TQn9Y2khEsLJW1ChVWFMSMeRDow5KcbLSE' },
      { name: 'BNB Smart Chain (BEP20)', code: 'BSC', fee: 0.29, minWithdraw: 10, arrivalTime: '~1 min', depositAddress: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e' },
      { name: 'Ethereum (ERC20)', code: 'ETH', fee: 3.5, minWithdraw: 20, arrivalTime: '~4 mins', depositAddress: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e' },
      { name: 'Arbitrum One', code: 'ARB', fee: 0.15, minWithdraw: 10, arrivalTime: '~1 min', depositAddress: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e' },
      { name: 'Solana', code: 'SOL', fee: 0.8, minWithdraw: 10, arrivalTime: '~30 secs', depositAddress: '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU' },
    ],
  },
  {
    asset: 'BTC',
    name: 'Bitcoin',
    available: 0.6420,
    inOrder: 0.0850,
    staked: 0.2500,
    btcValuation: 0.9770,
    usdtValuation: 87363.83,
    networks: [
      { name: 'Bitcoin Native (SegWit)', code: 'BTC', fee: 0.00012, minWithdraw: 0.001, arrivalTime: '~20 mins', depositAddress: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh' },
      { name: 'BNB Smart Chain (BEP20)', code: 'BSC', fee: 0.000005, minWithdraw: 0.0005, arrivalTime: '~2 mins', depositAddress: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e' },
      { name: 'Lightning Network', code: 'LIGHTNING', fee: 0.000001, minWithdraw: 0.00002, arrivalTime: 'Instant', depositAddress: 'lnbc1p3xnhl2pp5qqqsyqcyq5rqwzqfqqqsyqcyq5rqwzqfqqq' },
    ],
  },
  {
    asset: 'ETH',
    name: 'Ethereum',
    available: 6.4500,
    inOrder: 1.2000,
    staked: 4.0000,
    btcValuation: 0.4094,
    usdtValuation: 36614.20,
    networks: [
      { name: 'Ethereum (ERC20)', code: 'ETH', fee: 0.0012, minWithdraw: 0.01, arrivalTime: '~4 mins', depositAddress: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e' },
      { name: 'Arbitrum One', code: 'ARB', fee: 0.0001, minWithdraw: 0.005, arrivalTime: '~1 min', depositAddress: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e' },
      { name: 'Base Network', code: 'BASE', fee: 0.00008, minWithdraw: 0.005, arrivalTime: '~1 min', depositAddress: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e' },
    ],
  },
  {
    asset: 'SOL',
    name: 'Solana',
    available: 84.50,
    inOrder: 15.00,
    staked: 50.00,
    btcValuation: 0.3253,
    usdtValuation: 29092.70,
    networks: [
      { name: 'Solana Mainnet', code: 'SOL', fee: 0.008, minWithdraw: 0.1, arrivalTime: '~30 secs', depositAddress: '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU' },
    ],
  },
  {
    asset: 'BNB',
    name: 'BNB Chain',
    available: 18.20,
    inOrder: 0,
    staked: 10.00,
    btcValuation: 0.2025,
    usdtValuation: 18112.86,
    networks: [
      { name: 'BNB Smart Chain (BEP20)', code: 'BSC', fee: 0.0005, minWithdraw: 0.02, arrivalTime: '~1 min', depositAddress: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e' },
      { name: 'opBNB', code: 'OPBNB', fee: 0.0001, minWithdraw: 0.01, arrivalTime: '~30 secs', depositAddress: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e' },
    ],
  },
  {
    asset: 'USDC',
    name: 'USD Coin',
    available: 5420.00,
    inOrder: 0,
    staked: 0,
    btcValuation: 0.0606,
    usdtValuation: 5420.00,
    networks: [
      { name: 'Solana', code: 'SOL', fee: 0.8, minWithdraw: 10, arrivalTime: '~30 secs', depositAddress: '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU' },
      { name: 'Ethereum (ERC20)', code: 'ETH', fee: 3.5, minWithdraw: 20, arrivalTime: '~4 mins', depositAddress: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e' },
      { name: 'Polygon POS', code: 'MATIC', fee: 0.2, minWithdraw: 10, arrivalTime: '~2 mins', depositAddress: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e' },
    ],
  },
];

export const INITIAL_ORDERS: ExchangeOrder[] = [
  {
    id: 'ORD-9841204',
    pair: 'BTCUSDT',
    marketType: 'Spot',
    type: 'Limit',
    side: 'Buy',
    price: 87500.00,
    amount: 0.0250,
    filled: 0.0050,
    total: 2187.50,
    status: 'Open',
    createdAt: '2026-10-05 02:41:18',
  },
  {
    id: 'ORD-9841189',
    pair: 'SOLUSDT',
    marketType: 'Spot',
    type: 'Limit',
    side: 'Sell',
    price: 205.00,
    amount: 15.00,
    filled: 0,
    total: 3075.00,
    status: 'Open',
    createdAt: '2026-10-05 01:15:42',
  },
  {
    id: 'ORD-9841102',
    pair: 'ETHUSDT',
    marketType: 'Spot',
    type: 'Stop-Limit',
    side: 'Buy',
    price: 3020.00,
    stopPrice: 3035.00,
    amount: 0.3500,
    filled: 0,
    total: 1057.00,
    status: 'Open',
    createdAt: '2026-10-04 22:08:11',
  },
  {
    id: 'ORD-9839921',
    pair: 'BTCUSDT',
    marketType: 'Spot',
    type: 'Market',
    side: 'Buy',
    price: 88940.00,
    amount: 0.0450,
    filled: 0.0450,
    total: 4002.30,
    status: 'Filled',
    createdAt: '2026-10-04 19:32:04',
  },
  {
    id: 'ORD-9839410',
    pair: 'SOLUSDT',
    marketType: 'Spot',
    type: 'Limit',
    side: 'Buy',
    price: 186.40,
    amount: 25.00,
    filled: 25.00,
    total: 4660.00,
    status: 'Filled',
    createdAt: '2026-10-04 14:19:55',
  },
  {
    id: 'ORD-9838812',
    pair: 'ETHUSDT',
    marketType: 'Futures',
    type: 'Limit',
    side: 'Buy',
    price: 3090.50,
    amount: 2.00,
    filled: 2.00,
    total: 6181.00,
    status: 'Filled',
    leverage: 20,
    createdAt: '2026-10-03 18:04:29',
  },
  {
    id: 'ORD-9837105',
    pair: 'BNBUSDT',
    marketType: 'Spot',
    type: 'Limit',
    side: 'Sell',
    price: 660.00,
    amount: 5.00,
    filled: 0,
    total: 3300.00,
    status: 'Cancelled',
    createdAt: '2026-10-03 09:45:12',
  },
];

export const INITIAL_TRADES: ExecutedTrade[] = [
  {
    id: 'TRD-7729104',
    orderId: 'ORD-9841204',
    pair: 'BTCUSDT',
    side: 'Buy',
    price: 87500.00,
    amount: 0.0050,
    fee: 0.4375,
    feeAsset: 'USDT',
    role: 'Maker',
    total: 437.50,
    timestamp: '2026-10-05 02:44:02',
  },
  {
    id: 'TRD-7728451',
    orderId: 'ORD-9839921',
    pair: 'BTCUSDT',
    side: 'Buy',
    price: 88940.00,
    amount: 0.0450,
    fee: 4.0023,
    feeAsset: 'USDT',
    role: 'Taker',
    total: 4002.30,
    timestamp: '2026-10-04 19:32:04',
  },
  {
    id: 'TRD-7727912',
    orderId: 'ORD-9839410',
    pair: 'SOLUSDT',
    side: 'Buy',
    price: 186.40,
    amount: 25.00,
    fee: 3.4950,
    feeAsset: 'USDT',
    role: 'Maker',
    total: 4660.00,
    timestamp: '2026-10-04 14:20:11',
  },
  {
    id: 'TRD-7726109',
    orderId: 'ORD-9838812',
    pair: 'ETHUSDT',
    side: 'Buy',
    price: 3090.50,
    amount: 2.00,
    fee: 1.2362,
    feeAsset: 'USDT',
    role: 'Maker',
    total: 6181.00,
    timestamp: '2026-10-03 18:04:30',
  },
  {
    id: 'TRD-7724008',
    orderId: 'ORD-9835011',
    pair: 'AVAXUSDT',
    side: 'Sell',
    price: 34.10,
    amount: 60.00,
    fee: 2.0460,
    feeAsset: 'USDT',
    role: 'Taker',
    total: 2046.00,
    timestamp: '2026-10-02 11:18:45',
  },
];

export const P2P_ADVERTS: P2PAdvert[] = [
  {
    id: 'P2P-101',
    merchantName: 'ApexLiquidity_Pro',
    verified: true,
    completedOrders: 4829,
    completionRate: 99.6,
    avgReleaseMinutes: 2,
    side: 'Buy',
    asset: 'USDT',
    fiat: 'USD',
    fiatSymbol: '$',
    price: 1.001,
    available: 84500.00,
    minLimit: 100,
    maxLimit: 25000,
    paymentMethods: ['Bank Transfer', 'Zelle', 'Wire Transfer'],
  },
  {
    id: 'P2P-102',
    merchantName: 'GlobalDesk_OTC',
    verified: true,
    completedOrders: 9120,
    completionRate: 99.8,
    avgReleaseMinutes: 1,
    side: 'Buy',
    asset: 'USDT',
    fiat: 'USD',
    fiatSymbol: '$',
    price: 1.002,
    available: 150000.00,
    minLimit: 500,
    maxLimit: 50000,
    paymentMethods: ['Wire Transfer', 'Revolut', 'Wise'],
  },
  {
    id: 'P2P-103',
    merchantName: 'SatoshiVault_247',
    verified: true,
    completedOrders: 2150,
    completionRate: 98.9,
    avgReleaseMinutes: 3,
    side: 'Buy',
    asset: 'USDT',
    fiat: 'USD',
    fiatSymbol: '$',
    price: 1.003,
    available: 19400.00,
    minLimit: 20,
    maxLimit: 5000,
    paymentMethods: ['Zelle', 'Wise', 'Revolut'],
  },
  {
    id: 'P2P-104',
    merchantName: 'BharatCryptoHub',
    verified: true,
    completedOrders: 6340,
    completionRate: 99.4,
    avgReleaseMinutes: 2,
    side: 'Buy',
    asset: 'USDT',
    fiat: 'INR',
    fiatSymbol: '₹',
    price: 86.45,
    available: 42000.00,
    minLimit: 1000,
    maxLimit: 500000,
    paymentMethods: ['UPI', 'IMPS', 'Bank Transfer (India)'],
  },
  {
    id: 'P2P-105',
    merchantName: 'IndusPrime_OTC',
    verified: true,
    completedOrders: 3410,
    completionRate: 99.1,
    avgReleaseMinutes: 3,
    side: 'Buy',
    asset: 'USDT',
    fiat: 'INR',
    fiatSymbol: '₹',
    price: 86.52,
    available: 95000.00,
    minLimit: 5000,
    maxLimit: 1000000,
    paymentMethods: ['IMPS', 'NEFT', 'UPI'],
  },
  {
    id: 'P2P-106',
    merchantName: 'EuroSettlement_AG',
    verified: true,
    completedOrders: 5210,
    completionRate: 99.7,
    avgReleaseMinutes: 2,
    side: 'Buy',
    asset: 'USDT',
    fiat: 'EUR',
    fiatSymbol: '€',
    price: 0.924,
    available: 110000.00,
    minLimit: 100,
    maxLimit: 40000,
    paymentMethods: ['SEPA Instant', 'Revolut', 'N26'],
  },
  {
    id: 'P2P-107',
    merchantName: 'QuantumSettlement',
    verified: true,
    completedOrders: 3890,
    completionRate: 99.5,
    avgReleaseMinutes: 2,
    side: 'Sell',
    asset: 'USDT',
    fiat: 'USD',
    fiatSymbol: '$',
    price: 0.999,
    available: 65000.00,
    minLimit: 100,
    maxLimit: 20000,
    paymentMethods: ['Zelle', 'Bank Transfer', 'Wise'],
  },
  {
    id: 'P2P-108',
    merchantName: 'MumbaiExpress_P2P',
    verified: true,
    completedOrders: 5190,
    completionRate: 99.3,
    avgReleaseMinutes: 2,
    side: 'Sell',
    asset: 'USDT',
    fiat: 'INR',
    fiatSymbol: '₹',
    price: 86.20,
    available: 50000.00,
    minLimit: 2000,
    maxLimit: 400000,
    paymentMethods: ['UPI', 'IMPS'],
  },
];

export const EARN_PRODUCTS: EarnProduct[] = [
  {
    id: 'EARN-USDT-FLEX',
    asset: 'USDT',
    name: 'Tether Simple Earn',
    apr: 8.45,
    durationDays: 'Flexible',
    minAmount: 10,
    maxQuota: 100000,
    totalSubscribedPercent: 74,
    tag: 'Real-Time APR Bonus',
  },
  {
    id: 'EARN-USDC-FLEX',
    asset: 'USDC',
    name: 'USD Coin Yield',
    apr: 7.90,
    durationDays: 'Flexible',
    minAmount: 10,
    maxQuota: 100000,
    totalSubscribedPercent: 68,
  },
  {
    id: 'EARN-SOL-60',
    asset: 'SOL',
    name: 'Solana Liquid Staking',
    apr: 9.80,
    durationDays: 60,
    minAmount: 0.5,
    maxQuota: 2500,
    totalSubscribedPercent: 86,
    tag: 'High Yield',
  },
  {
    id: 'EARN-ETH-30',
    asset: 'ETH',
    name: 'Ethereum 2.0 Staking',
    apr: 4.25,
    durationDays: 30,
    minAmount: 0.05,
    maxQuota: 500,
    totalSubscribedPercent: 62,
  },
  {
    id: 'EARN-BNB-90',
    asset: 'BNB',
    name: 'BNB Vault + Launchpool',
    apr: 11.40,
    durationDays: 90,
    minAmount: 0.2,
    maxQuota: 1000,
    totalSubscribedPercent: 91,
    tag: 'Airdrop Eligible',
  },
  {
    id: 'EARN-BTC-30',
    asset: 'BTC',
    name: 'BTC Dual Yield Vault',
    apr: 3.15,
    durationDays: 30,
    minAmount: 0.005,
    maxQuota: 50,
    totalSubscribedPercent: 54,
  },
];

export const AIRDROP_CAMPAIGNS: AirdropCampaign[] = [
  {
    id: 'AIR-01',
    project: 'Hyperion ZK Layer',
    token: 'HYPR',
    title: 'HODLer Airdrop Round 14 — Hyperion Modular Rollup',
    description: 'Users holding BNB or staking in Simple Earn Locked/Flexible vaults receive automatic retro-snapshot allocations of HYPR tokens prior to Spot listing.',
    totalRewardPool: '15,000,000 HYPR ($4.5M Est.)',
    participants: 148920,
    status: 'Active',
    endsIn: '03d 14h 22m',
    snapshotAsset: 'BNB',
    minHoldingRequired: 1.0,
    userClaimed: false,
    estimatedAllocation: '245.00 HYPR',
  },
  {
    id: 'AIR-02',
    project: 'AetherAI Compute Network',
    token: 'ATHR',
    title: 'Web3 Quest & Spot Volume Megadrop',
    description: 'Complete decentralized GPU node verification or subscribe SOL/ETH in Simple Earn to multiply your Megadrop point weight.',
    totalRewardPool: '40,000,000 ATHR ($6.8M Est.)',
    participants: 219400,
    status: 'Active',
    endsIn: '06d 09h 45m',
    snapshotAsset: 'SOL',
    minHoldingRequired: 5.0,
    userClaimed: false,
    estimatedAllocation: '580.00 ATHR',
  },
  {
    id: 'AIR-03',
    project: 'OmniBridge Protocol',
    token: 'OMNI',
    title: 'Cross-Chain Liquidity Provider Snapshot',
    description: 'Snapshot completed for all Spot & Futures traders with at least $1,000 equivalent volume in the last 30 days.',
    totalRewardPool: '8,500,000 OMNI',
    participants: 94210,
    status: 'Completed',
    endsIn: 'Ended',
    snapshotAsset: 'USDT',
    minHoldingRequired: 100,
    userClaimed: true,
    estimatedAllocation: '112.50 OMNI',
  },
];

export const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'NOTIF-01',
    category: 'Trade',
    title: 'Partial Fill Executed — BTC/USDT',
    message: 'Your Spot Limit Buy order #ORD-9841204 for BTC/USDT was partially filled (0.0050 BTC at 87,500.00 USDT).',
    timestamp: '14 mins ago',
    read: false,
    actionRoute: '/orders',
  },
  {
    id: 'NOTIF-02',
    category: 'Campaign',
    title: 'HODLer Airdrop Snapshot Live: Hyperion (HYPR)',
    message: 'Hourly BNB balance snapshots are currently active. Check your eligibility and claimable allocation.',
    timestamp: '2 hours ago',
    read: false,
    actionRoute: '/airdrop',
  },
  {
    id: 'NOTIF-03',
    category: 'Security',
    title: 'New Web Session Authorized',
    message: 'Your account was accessed from Chrome on macOS (IP: 103.48.198.14). Hardware Passkey & 2FA verified.',
    timestamp: '6 hours ago',
    read: true,
    actionRoute: '/security',
  },
  {
    id: 'NOTIF-04',
    category: 'Wallet',
    title: 'Simple Earn Daily Yield Distributed',
    message: '+2.31 USDT has been credited to your Spot Wallet from your Flexible USDT Simple Earn subscription.',
    timestamp: '1 day ago',
    read: true,
    actionRoute: '/wallet',
  },
  {
    id: 'NOTIF-05',
    category: 'System',
    title: 'Zero Maker Fee Promotion on BTC/USDC & ETH/USDC',
    message: 'Trade any USDC spot pair with 0% Maker fee and institutional liquidity depth starting today.',
    timestamp: '2 days ago',
    read: true,
    actionRoute: '/fees',
  },
];

// Deterministic generator for realistic candlestick chart data
export function generateCandles(basePrice: number, timeframe: string, count = 64): CandleData[] {
  const candles: CandleData[] = [];
  const stepMs =
    timeframe === '1m' ? 60_000 :
    timeframe === '5m' ? 300_000 :
    timeframe === '15m' ? 900_000 :
    timeframe === '1H' ? 3_600_000 :
    timeframe === '4H' ? 14_400_000 :
    86_400_000;

  let currentClose = basePrice * 0.968;
  const now = Date.now();
  const volatility = basePrice * 0.0045;

  for (let i = count; i >= 0; i--) {
    const time = now - i * stepMs;
    const seed = Math.sin(i * 0.43 + basePrice * 0.01) * 0.55 + Math.cos(i * 0.19) * 0.45;
    const delta = seed * volatility;
    const open = currentClose;
    const close = i === 0 ? basePrice : Math.max(basePrice * 0.5, open + delta + (basePrice - open) / (i + 6));
    const wickUp = Math.abs(Math.sin(i * 1.13)) * volatility * 0.85;
    const wickDown = Math.abs(Math.cos(i * 0.87)) * volatility * 0.85;
    const high = Math.max(open, close) + wickUp;
    const low = Math.min(open, close) - wickDown;
    const volume = (Math.abs(delta) / volatility + 0.4) * (basePrice > 1000 ? 185 : 24500);

    const date = new Date(time);
    const label =
      timeframe === '1D'
        ? `${date.getMonth() + 1}/${date.getDate()}`
        : `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;

    candles.push({
      time,
      label,
      open,
      high,
      low,
      close,
      volume,
    });
    currentClose = close;
  }

  // Compute Moving Averages (MA7, MA25, MA99 approximation)
  for (let i = 0; i < candles.length; i++) {
    const slice7 = candles.slice(Math.max(0, i - 6), i + 1);
    const slice25 = candles.slice(Math.max(0, i - 24), i + 1);
    candles[i].ma7 = slice7.reduce((acc, c) => acc + c.close, 0) / slice7.length;
    candles[i].ma25 = slice25.reduce((acc, c) => acc + c.close, 0) / slice25.length;
    candles[i].ma99 = candles[i].ma25! * 0.994;
  }

  return candles;
}

// Generate realistic live Order Book around current price
export function generateOrderBook(price: number, tickSize?: number): { asks: OrderBookEntry[]; bids: OrderBookEntry[] } {
  const step = tickSize || (price > 10000 ? 1.5 : price > 100 ? 0.08 : price > 1 ? 0.0015 : 0.0002);
  const asks: OrderBookEntry[] = [];
  const bids: OrderBookEntry[] = [];

  let cumulativeAsk = 0;
  for (let i = 1; i <= 14; i++) {
    const levelPrice = price + i * step * (1 + (i % 3) * 0.15);
    const amount = Number(((Math.sin(i * 1.7 + price) + 1.4) * (price > 10000 ? 0.42 : price > 100 ? 12.5 : 850)).toFixed(4));
    cumulativeAsk += amount;
    asks.push({
      price: levelPrice,
      amount,
      total: cumulativeAsk,
      depthPercent: 0,
    });
  }

  let cumulativeBid = 0;
  for (let i = 1; i <= 14; i++) {
    const levelPrice = Math.max(0.0001, price - i * step * (1 + (i % 2) * 0.15));
    const amount = Number(((Math.cos(i * 1.3 + price) + 1.45) * (price > 10000 ? 0.45 : price > 100 ? 13.2 : 910)).toFixed(4));
    cumulativeBid += amount;
    bids.push({
      price: levelPrice,
      amount,
      total: cumulativeBid,
      depthPercent: 0,
    });
  }

  const maxAskTotal = asks[asks.length - 1]?.total || 1;
  const maxBidTotal = bids[bids.length - 1]?.total || 1;
  asks.forEach((a) => (a.depthPercent = Math.min(100, (a.total / maxAskTotal) * 100)));
  bids.forEach((b) => (b.depthPercent = Math.min(100, (b.total / maxBidTotal) * 100)));

  return { asks: asks.reverse(), bids };
}

export function generateRecentTrades(price: number): RecentTrade[] {
  const trades: RecentTrade[] = [];
  const now = new Date();
  for (let i = 0; i < 20; i++) {
    const t = new Date(now.getTime() - i * 2400);
    const jitter = (Math.sin(i * 2.1) * 0.0008) * price;
    const tradePrice = price + jitter;
    const amount = Number(((Math.abs(Math.cos(i * 1.9)) + 0.08) * (price > 10000 ? 0.35 : price > 100 ? 8.4 : 420)).toFixed(4));
    trades.push({
      id: `RT-${i}-${t.getTime()}`,
      price: tradePrice,
      amount,
      time: t.toTimeString().split(' ')[0],
      isBuyerMaker: i % 3 === 0,
    });
  }
  return trades;
}

export function formatPrice(price: number): string {
  if (price >= 1000) return price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  if (price >= 10) return price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 3 });
  if (price >= 1) return price.toLocaleString('en-US', { minimumFractionDigits: 4, maximumFractionDigits: 4 });
  return price.toLocaleString('en-US', { minimumFractionDigits: 4, maximumFractionDigits: 4 });
}

export function formatCompactNumber(num: number): string {
  if (num >= 1_000_000_000) return `${(num / 1_000_000_000).toFixed(2)}B`;
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(2)}M`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(2)}K`;
  return num.toFixed(2);
}
