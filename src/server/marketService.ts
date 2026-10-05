export interface LiveMarketItem {
  symbol: string;
  baseAsset: string;
  quoteAsset: string;
  name: string;
  category: 'Layer 1' | 'DeFi' | 'AI' | 'Solana' | 'Payments' | 'Infra';
  price: number;
  priceChange: number;
  priceChangePercent: number;
  high24h: number;
  low24h: number;
  volume24h: number;
  quoteVolume24h: number;
  marketCap: number;
  maxLeverage: number;
  fundingRate: number;
  updatedAt: string;
}

const PAIR_METADATA: Record<
  string,
  {
    baseAsset: string;
    quoteAsset: string;
    name: string;
    category: 'Layer 1' | 'DeFi' | 'AI' | 'Solana' | 'Payments' | 'Infra';
    circulatingSupply: number;
    maxLeverage: number;
    fundingRate: number;
  }
> = {
  BTCUSDT: { baseAsset: 'BTC', quoteAsset: 'USDT', name: 'Bitcoin', category: 'Layer 1', circulatingSupply: 19780000, maxLeverage: 125, fundingRate: 0.0100 },
  ETHUSDT: { baseAsset: 'ETH', quoteAsset: 'USDT', name: 'Ethereum', category: 'Layer 1', circulatingSupply: 120400000, maxLeverage: 100, fundingRate: 0.0100 },
  SOLUSDT: { baseAsset: 'SOL', quoteAsset: 'USDT', name: 'Solana', category: 'Solana', circulatingSupply: 474800000, maxLeverage: 75, fundingRate: 0.0125 },
  BNBUSDT: { baseAsset: 'BNB', quoteAsset: 'USDT', name: 'BNB Chain', category: 'Layer 1', circulatingSupply: 145900000, maxLeverage: 75, fundingRate: 0.0085 },
  XRPUSDT: { baseAsset: 'XRP', quoteAsset: 'USDT', name: 'XRP Ledger', category: 'Payments', circulatingSupply: 57000000000, maxLeverage: 75, fundingRate: 0.0092 },
  ADAUSDT: { baseAsset: 'ADA', quoteAsset: 'USDT', name: 'Cardano', category: 'Layer 1', circulatingSupply: 35600000000, maxLeverage: 50, fundingRate: 0.0100 },
  AVAXUSDT: { baseAsset: 'AVAX', quoteAsset: 'USDT', name: 'Avalanche', category: 'Layer 1', circulatingSupply: 409000000, maxLeverage: 50, fundingRate: 0.0105 },
  LINKUSDT: { baseAsset: 'LINK', quoteAsset: 'USDT', name: 'Chainlink', category: 'Infra', circulatingSupply: 626800000, maxLeverage: 50, fundingRate: 0.0100 },
  SUIUSDT: { baseAsset: 'SUI', quoteAsset: 'USDT', name: 'Sui Network', category: 'Layer 1', circulatingSupply: 2840000000, maxLeverage: 50, fundingRate: 0.0140 },
  NEARUSDT: { baseAsset: 'NEAR', quoteAsset: 'USDT', name: 'NEAR Protocol', category: 'AI', circulatingSupply: 1219000000, maxLeverage: 50, fundingRate: 0.0100 },
  RENDERUSDT: { baseAsset: 'RENDER', quoteAsset: 'USDT', name: 'Render Network', category: 'AI', circulatingSupply: 517800000, maxLeverage: 50, fundingRate: 0.0115 },
  UNIUSDT: { baseAsset: 'UNI', quoteAsset: 'USDT', name: 'Uniswap', category: 'DeFi', circulatingSupply: 600400000, maxLeverage: 50, fundingRate: 0.0100 },
  AAVEUSDT: { baseAsset: 'AAVE', quoteAsset: 'USDT', name: 'Aave Protocol', category: 'DeFi', circulatingSupply: 14960000, maxLeverage: 50, fundingRate: 0.0100 },
  ARBUSDT: { baseAsset: 'ARB', quoteAsset: 'USDT', name: 'Arbitrum', category: 'Infra', circulatingSupply: 3970000000, maxLeverage: 50, fundingRate: 0.0100 },
  DOTUSDT: { baseAsset: 'DOT', quoteAsset: 'USDT', name: 'Polkadot', category: 'Layer 1', circulatingSupply: 1435000000, maxLeverage: 50, fundingRate: 0.0100 },
  DOGEUSDT: { baseAsset: 'DOGE', quoteAsset: 'USDT', name: 'Dogecoin', category: 'Payments', circulatingSupply: 146600000000, maxLeverage: 75, fundingRate: 0.0110 },
};

const BINANCE_ENDPOINTS = [
  'https://data-api.binance.vision/api/v3',
  'https://api.binance.com/api/v3',
  'https://api1.binance.com/api/v3',
  'https://api3.binance.com/api/v3',
];

let cachedTickers: LiveMarketItem[] = [];
let lastTickerFetchMs = 0;

async function fetchFromBinanceEndpoints(pathAndQuery: string): Promise<any> {
  let lastError: Error | null = null;
  for (const base of BINANCE_ENDPOINTS) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000);
      const res = await fetch(`${base}${pathAndQuery}`, {
        signal: controller.signal,
        headers: { Accept: 'application/json' },
      });
      clearTimeout(timeout);
      if (res.ok) {
        return await res.json();
      }
      lastError = new Error(`Upstream status ${res.status} from ${base}`);
    } catch (err: any) {
      lastError = err;
    }
  }
  throw lastError || new Error('All live market data upstream providers are unreachable');
}

export async function getLiveTickers(): Promise<LiveMarketItem[]> {
  const now = Date.now();
  if (cachedTickers.length > 0 && now - lastTickerFetchMs < 3500) {
    return cachedTickers;
  }

  const symbols = Object.keys(PAIR_METADATA);
  const encoded = encodeURIComponent(JSON.stringify(symbols));
  const rawList = await fetchFromBinanceEndpoints(`/ticker/24hr?symbols=${encoded}`);

  if (!Array.isArray(rawList) || rawList.length === 0) {
    throw new Error('Upstream market ticker response was empty');
  }

  const updatedAt = new Date().toISOString();
  const parsed: LiveMarketItem[] = [];

  for (const symbol of symbols) {
    const meta = PAIR_METADATA[symbol];
    const row = rawList.find((r: any) => r.symbol === symbol);
    if (!row) continue;
    const price = parseFloat(row.lastPrice);
    if (!price || isNaN(price)) continue;

    parsed.push({
      symbol,
      baseAsset: meta.baseAsset,
      quoteAsset: meta.quoteAsset,
      name: meta.name,
      category: meta.category,
      price,
      priceChange: parseFloat(row.priceChange) || 0,
      priceChangePercent: parseFloat(row.priceChangePercent) || 0,
      high24h: parseFloat(row.highPrice) || price,
      low24h: parseFloat(row.lowPrice) || price,
      volume24h: parseFloat(row.volume) || 0,
      quoteVolume24h: parseFloat(row.quoteVolume) || 0,
      marketCap: Math.round(price * meta.circulatingSupply),
      maxLeverage: meta.maxLeverage,
      fundingRate: meta.fundingRate,
      updatedAt,
    });
  }

  cachedTickers = parsed;
  lastTickerFetchMs = now;
  return parsed;
}

export async function getLivePriceForAsset(asset: string): Promise<number> {
  if (asset === 'USDT' || asset === 'USDC') return 1.0;
  const tickers = await getLiveTickers();
  const pair = tickers.find((t) => t.baseAsset === asset);
  if (!pair) {
    throw new Error(`Live price unavailable for asset ${asset}`);
  }
  return pair.price;
}

export async function getLiveOrderBook(symbol: string, limit = 16) {
  const cleanSymbol = symbol.toUpperCase();
  const data = await fetchFromBinanceEndpoints(`/depth?symbol=${cleanSymbol}&limit=${limit}`);
  if (!data || !Array.isArray(data.asks) || !Array.isArray(data.bids)) {
    throw new Error(`Live orderbook depth unavailable for ${cleanSymbol}`);
  }

  let askCum = 0;
  const asks = data.asks.slice(0, 14).map((entry: [string, string]) => {
    const price = parseFloat(entry[0]);
    const amount = parseFloat(entry[1]);
    askCum += amount;
    return { price, amount, total: askCum, depthPercent: 0 };
  });

  let bidCum = 0;
  const bids = data.bids.slice(0, 14).map((entry: [string, string]) => {
    const price = parseFloat(entry[0]);
    const amount = parseFloat(entry[1]);
    bidCum += amount;
    return { price, amount, total: bidCum, depthPercent: 0 };
  });

  const maxAsk = asks[asks.length - 1]?.total || 1;
  const maxBid = bids[bids.length - 1]?.total || 1;
  asks.forEach((a: any) => (a.depthPercent = Math.min(100, (a.total / maxAsk) * 100)));
  bids.forEach((b: any) => (b.depthPercent = Math.min(100, (b.total / maxBid) * 100)));

  return {
    symbol: cleanSymbol,
    asks: asks.reverse(),
    bids,
    updatedAt: new Date().toISOString(),
  };
}

export async function getLiveRecentTrades(symbol: string, limit = 24) {
  const cleanSymbol = symbol.toUpperCase();
  const data = await fetchFromBinanceEndpoints(`/trades?symbol=${cleanSymbol}&limit=${limit}`);
  if (!Array.isArray(data)) {
    throw new Error(`Live market trades unavailable for ${cleanSymbol}`);
  }

  return data
    .slice()
    .reverse()
    .map((t: any) => {
      const d = new Date(t.time);
      const timeStr = d.toTimeString().split(' ')[0];
      return {
        id: String(t.id),
        price: parseFloat(t.price),
        amount: parseFloat(t.qty),
        time: timeStr,
        isBuyerMaker: Boolean(t.isBuyerMaker),
      };
    });
}

export async function getLiveKlines(symbol: string, interval: string, limit = 60) {
  const cleanSymbol = symbol.toUpperCase();
  const intervalMap: Record<string, string> = {
    '1m': '1m',
    '5m': '5m',
    '15m': '15m',
    '1H': '1h',
    '4H': '4h',
    '1D': '1d',
  };
  const binanceInterval = intervalMap[interval] || '15m';
  const data = await fetchFromBinanceEndpoints(
    `/klines?symbol=${cleanSymbol}&interval=${binanceInterval}&limit=${limit}`
  );

  if (!Array.isArray(data)) {
    throw new Error(`Live kline candlestick data unavailable for ${cleanSymbol}`);
  }

  const candles = data.map((row: any[]) => {
    const time = Number(row[0]);
    const date = new Date(time);
    const label =
      binanceInterval === '1d'
        ? `${date.getMonth() + 1}/${date.getDate()}`
        : `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
    return {
      time,
      label,
      open: parseFloat(row[1]),
      high: parseFloat(row[2]),
      low: parseFloat(row[3]),
      close: parseFloat(row[4]),
      volume: parseFloat(row[5]),
      ma7: 0,
      ma25: 0,
      ma99: 0,
    };
  });

  for (let i = 0; i < candles.length; i++) {
    const s7 = candles.slice(Math.max(0, i - 6), i + 1);
    const s25 = candles.slice(Math.max(0, i - 24), i + 1);
    const s99 = candles.slice(Math.max(0, i - 98), i + 1);
    candles[i].ma7 = s7.reduce((acc, c) => acc + c.close, 0) / s7.length;
    candles[i].ma25 = s25.reduce((acc, c) => acc + c.close, 0) / s25.length;
    candles[i].ma99 = s99.reduce((acc, c) => acc + c.close, 0) / s99.length;
  }

  return candles;
}
