import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  ChevronDown,
  Star,
  Search,
  ArrowUpRight,
  ArrowDownRight,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import { useExchange } from '../context/ExchangeContext';
import { formatPrice, formatCompactNumber } from '../data/exchangeData';
import { CryptoIcon } from '../components/CryptoIcon';
import { OrderBookEntry, RecentTrade, CandleData } from '../types/exchange';

interface TradingTerminalPageProps {
  marketMode: 'Spot' | 'Futures';
}

export const TradingTerminalPage: React.FC<TradingTerminalPageProps> = ({ marketMode }) => {
  const {
    tickers,
    marketLoading,
    marketError,
    refreshMarkets,
    selectedPair,
    setSelectedPair,
    toggleFavoritePair,
    isAuthenticated,
    openAuthModal,
    balances,
    orders,
    trades,
    placeOrder,
    cancelOrder,
    cancelAllOpenOrders,
    navigate,
  } = useExchange();

  const currentTicker = useMemo(
    () => tickers.find((t) => t.symbol === selectedPair) || tickers[0] || null,
    [tickers, selectedPair]
  );

  // Pair selector dropdown & Right-column watchlist state
  const [pairDropdownOpen, setPairDropdownOpen] = useState(false);
  const [pairSearch, setPairSearch] = useState('');
  const [watchlistQuoteTab, setWatchlistQuoteTab] = useState<'Fav' | 'USDT' | 'AI' | 'Layer 1'>('USDT');

  // Chart controls
  const [timeframe, setTimeframe] = useState<'1m' | '5m' | '15m' | '1H' | '4H' | '1D'>('15m');
  const [chartView, setChartView] = useState<'Original' | 'TradingView' | 'Depth'>('Original');
  const [showMA, setShowMA] = useState(true);
  const [showEMA, setShowEMA] = useState(false);
  const [showBOLL, setShowBOLL] = useState(false);
  const [hoverCandleIdx, setHoverCandleIdx] = useState<number | null>(null);

  // Live Backend Market Feeds for Selected Pair
  const [candles, setCandles] = useState<CandleData[]>([]);
  const [orderBook, setOrderBook] = useState<{ asks: OrderBookEntry[]; bids: OrderBookEntry[] }>({
    asks: [],
    bids: [],
  });
  const [recentTrades, setRecentTrades] = useState<RecentTrade[]>([]);
  const [terminalLoading, setTerminalLoading] = useState<boolean>(true);
  const [terminalError, setTerminalError] = useState<string | null>(null);

  // Orderbook filter
  const [obFilter, setObFilter] = useState<'both' | 'bids' | 'asks'>('both');

  // Order Entry State
  const [orderType, setOrderType] = useState<'Limit' | 'Market' | 'Stop-Limit'>('Limit');
  const [buyPrice, setBuyPrice] = useState<string>('');
  const [sellPrice, setSellPrice] = useState<string>('');
  const [stopPriceInput, setStopPriceInput] = useState<string>('');
  const [buyAmount, setBuyAmount] = useState<string>('');
  const [sellAmount, setSellAmount] = useState<string>('');
  const [buySlider, setBuySlider] = useState<number>(0);
  const [sellSlider, setSellSlider] = useState<number>(0);
  const [submittingSide, setSubmittingSide] = useState<'Buy' | 'Sell' | null>(null);

  // Futures-specific state
  const [marginMode, setMarginMode] = useState<'Cross' | 'Isolated'>('Cross');
  const [leverage, setLeverage] = useState<number>(20);

  // Bottom table tab
  const [bottomTab, setBottomTab] = useState<'open' | 'history' | 'trades' | 'assets'>('open');

  // Mobile view switcher
  const [mobileTab, setMobileTab] = useState<'chart' | 'book' | 'trades'>('chart');

  // Fetch Real Klines, OrderBook Depth & Recent Market Trades from Backend API
  const fetchPairFeeds = useCallback(async () => {
    try {
      const [klineRes, depthRes, tradesRes] = await Promise.all([
        fetch(`/api/market/klines?symbol=${selectedPair}&interval=${timeframe}`),
        fetch(`/api/market/depth?symbol=${selectedPair}&limit=16`),
        fetch(`/api/market/trades?symbol=${selectedPair}&limit=24`),
      ]);

      if (!klineRes.ok || !depthRes.ok || !tradesRes.ok) {
        throw new Error('Live market stream unavailable from upstream exchange');
      }

      const [klineData, depthData, tradesData] = await Promise.all([
        klineRes.json(),
        depthRes.json(),
        tradesRes.json(),
      ]);

      setCandles(klineData.candles || []);
      setOrderBook({
        asks: depthData.asks || [],
        bids: depthData.bids || [],
      });
      setRecentTrades(tradesData.trades || []);
      setTerminalError(null);
    } catch (err: any) {
      setTerminalError(err.message || 'Live orderbook and chart data unavailable');
    } finally {
      setTerminalLoading(false);
    }
  }, [selectedPair, timeframe]);

  useEffect(() => {
    setTerminalLoading(true);
    fetchPairFeeds();
    const interval = setInterval(fetchPairFeeds, 3500);
    return () => clearInterval(interval);
  }, [fetchPairFeeds]);

  // Initialize default limit price once live ticker loads for selectedPair
  useEffect(() => {
    if (!currentTicker) return;
    const formatted =
      currentTicker.price >= 100
        ? currentTicker.price.toFixed(2)
        : currentTicker.price.toFixed(4);
    setBuyPrice(formatted);
    setSellPrice(formatted);
    setStopPriceInput(
      currentTicker.price >= 100
        ? (currentTicker.price * 0.99).toFixed(2)
        : (currentTicker.price * 0.99).toFixed(4)
    );
    setBuyAmount('');
    setSellAmount('');
    setBuySlider(0);
    setSellSlider(0);
  }, [currentTicker?.symbol]);

  const usdtBalance = useMemo(
    () => balances.find((b) => b.asset === 'USDT')?.available || 0,
    [balances]
  );
  const baseBalance = useMemo(
    () =>
      currentTicker
        ? balances.find((b) => b.asset === currentTicker.baseAsset)?.available || 0
        : 0,
    [balances, currentTicker]
  );

  const activeCandle =
    hoverCandleIdx !== null && candles[hoverCandleIdx]
      ? candles[hoverCandleIdx]
      : candles[candles.length - 1] || null;

  const chartStats = useMemo(() => {
    if (candles.length === 0) {
      return { maxPrice: 1, minPrice: 0, range: 1, maxVol: 1 };
    }
    const highs = candles.map((c) => c.high);
    const lows = candles.map((c) => c.low);
    const vols = candles.map((c) => c.volume);
    const maxPrice = Math.max(...highs);
    const minPrice = Math.min(...lows);
    const maxVol = Math.max(...vols, 1);
    const range = Math.max(maxPrice - minPrice, 0.0001);
    return { maxPrice, minPrice, range, maxVol };
  }, [candles]);

  const handleBuyPercent = (pct: number) => {
    if (!currentTicker) return;
    setBuySlider(pct);
    const execPrice =
      orderType === 'Market' ? currentTicker.price : parseFloat(buyPrice) || currentTicker.price;
    const usableUSDT =
      marketMode === 'Futures' ? usdtBalance * leverage * (pct / 100) : usdtBalance * (pct / 100);
    const calcAmt = execPrice > 0 ? usableUSDT / execPrice : 0;
    setBuyAmount(calcAmt > 0 ? calcAmt.toFixed(4) : '');
  };

  const handleSellPercent = (pct: number) => {
    if (!currentTicker) return;
    setSellSlider(pct);
    const execPrice =
      orderType === 'Market' ? currentTicker.price : parseFloat(sellPrice) || currentTicker.price;
    const calcAmt =
      marketMode === 'Futures'
        ? (usdtBalance * leverage * (pct / 100)) / execPrice
        : baseBalance * (pct / 100);
    setSellAmount(calcAmt > 0 ? calcAmt.toFixed(4) : '');
  };

  const executeSideOrder = async (side: 'Buy' | 'Sell') => {
    if (!isAuthenticated) {
      openAuthModal('login');
      return;
    }
    if (!currentTicker) return;
    const rawPrice = side === 'Buy' ? buyPrice : sellPrice;
    const rawAmt = side === 'Buy' ? buyAmount : sellAmount;
    const parsedPrice =
      orderType === 'Market' ? currentTicker.price : parseFloat(rawPrice) || currentTicker.price;
    const parsedAmount = parseFloat(rawAmt);
    if (!parsedAmount || parsedAmount <= 0) return;

    setSubmittingSide(side);
    try {
      const ok = await placeOrder({
        pair: currentTicker.symbol,
        marketType: marketMode,
        type: orderType,
        side,
        price: parsedPrice,
        stopPrice: orderType === 'Stop-Limit' ? parseFloat(stopPriceInput) : undefined,
        amount: parsedAmount,
        leverage: marketMode === 'Futures' ? leverage : undefined,
      });

      if (ok) {
        if (side === 'Buy') {
          setBuyAmount('');
          setBuySlider(0);
        } else {
          setSellAmount('');
          setSellSlider(0);
        }
      }
    } finally {
      setSubmittingSide(null);
    }
  };

  const filteredWatchlist = useMemo(() => {
    return tickers.filter((t) => {
      if (watchlistQuoteTab === 'Fav' && !t.isFavorite) return false;
      if (watchlistQuoteTab === 'AI' && t.category !== 'AI') return false;
      if (watchlistQuoteTab === 'Layer 1' && t.category !== 'Layer 1') return false;
      if (
        pairSearch &&
        !t.symbol.toLowerCase().includes(pairSearch.toLowerCase()) &&
        !t.name.toLowerCase().includes(pairSearch.toLowerCase())
      ) {
        return false;
      }
      return true;
    });
  }, [tickers, watchlistQuoteTab, pairSearch]);

  const openOrders = orders.filter((o) => o.status === 'Open');
  const historyOrders = orders.filter((o) => o.status !== 'Open');

  const livePrice = currentTicker?.price || 0;
  const buyTotalUSDT =
    (orderType === 'Market' ? livePrice : parseFloat(buyPrice) || 0) *
    (parseFloat(buyAmount) || 0);
  const sellTotalUSDT =
    (orderType === 'Market' ? livePrice : parseFloat(sellPrice) || 0) *
    (parseFloat(sellAmount) || 0);

  if (marketLoading && !currentTicker) {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-[var(--bg-primary)] text-[var(--text-primary)] flex items-center justify-center p-6">
        <div className="flex items-center gap-3 text-xs text-[var(--text-muted)]">
          <RefreshCw className="w-4 h-4 animate-spin text-[#F0B90B]" />
          <span>Connecting to live exchange market stream...</span>
        </div>
      </div>
    );
  }

  if (marketError && !currentTicker) {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-[var(--bg-primary)] text-[var(--text-primary)] flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl p-6 text-center space-y-4">
          <AlertCircle className="w-8 h-8 text-[#F6465D] mx-auto" />
          <div className="text-sm font-bold text-[var(--text-primary)]">
            Live Market Data Unavailable
          </div>
          <p className="text-xs text-[var(--text-muted)]">{marketError}</p>
          <button
            onClick={refreshMarkets}
            className="px-5 py-2.5 rounded-lg bg-[#FCD535] text-[#181A20] text-xs font-bold cursor-pointer"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  const baseAsset = currentTicker?.baseAsset || selectedPair.replace('USDT', '');

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[var(--bg-primary)] text-[var(--text-primary)] flex flex-col select-none">
      {/* Top 24h Ticker Sub-Header Bar */}
      <div className="bg-[var(--bg-secondary)] border-b border-[var(--border-color)] px-3 lg:px-4 py-1.5 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4 flex-wrap">
          {/* Pair Selector */}
          <div className="relative">
            <button
              onClick={() => setPairDropdownOpen((prev) => !prev)}
              className="flex items-center gap-2.5 py-1 px-2 rounded-lg hover:bg-[var(--bg-hover)] transition-colors cursor-pointer"
            >
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  if (currentTicker) toggleFavoritePair(currentTicker.symbol);
                }}
                className="text-[var(--text-muted)] hover:text-[#F0B90B]"
              >
                <Star
                  className={`w-4 h-4 ${
                    currentTicker?.isFavorite ? 'fill-[#F0B90B] text-[#F0B90B]' : ''
                  }`}
                />
              </button>
              <CryptoIcon symbol={baseAsset} size="sm" />
              <div className="text-left">
                <div className="flex items-center gap-1.5">
                  <span className="text-base sm:text-lg font-bold text-[var(--text-primary)]">
                    {baseAsset}/USDT
                  </span>
                  <span className="text-[11px] font-mono-num text-[#F0B90B]">
                    {marketMode === 'Futures'
                      ? `Perp · ${currentTicker?.maxLeverage || 75}x`
                      : '10x'}
                  </span>
                  <ChevronDown className="w-4 h-4 text-[var(--text-muted)]" />
                </div>
                <div className="text-[11px] text-[var(--text-muted)]">
                  {currentTicker?.name || baseAsset} Price
                </div>
              </div>
            </button>

            {pairDropdownOpen && (
              <>
                <div className="fixed inset-0 z-30" onClick={() => setPairDropdownOpen(false)} />
                <div className="absolute left-0 top-full mt-1 w-80 bg-[var(--bg-elevated)] border border-[var(--border-color)] rounded-xl shadow-2xl p-3 z-40">
                  <div className="flex items-center gap-2 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg px-2.5 py-1.5 mb-2">
                    <Search className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                    <input
                      type="text"
                      value={pairSearch}
                      onChange={(e) => setPairSearch(e.target.value)}
                      placeholder="Search pair (e.g. SOL, ETH, SUI)..."
                      autoFocus
                      className="w-full bg-transparent text-xs text-[var(--text-primary)] focus:outline-none"
                    />
                  </div>
                  <div className="max-h-72 overflow-y-auto divide-y divide-[var(--border-color)]/40">
                    {tickers.map((item) => (
                      <button
                        key={item.symbol}
                        onClick={() => {
                          setSelectedPair(item.symbol);
                          setPairDropdownOpen(false);
                        }}
                        className={`w-full flex items-center justify-between py-2 px-2 rounded text-xs hover:bg-[var(--bg-hover)] ${
                          item.symbol === selectedPair ? 'bg-[var(--bg-hover)]' : ''
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <CryptoIcon symbol={item.baseAsset} size="xs" />
                          <span className="font-bold text-[var(--text-primary)]">
                            {item.baseAsset}
                            <span className="font-normal text-[var(--text-muted)]">/USDT</span>
                          </span>
                        </div>
                        <div className="font-mono-num text-right">
                          <span className="text-[var(--text-primary)] mr-3">
                            {formatPrice(item.price)}
                          </span>
                          <span
                            className={
                              item.priceChangePercent >= 0 ? 'text-[#0ECB81]' : 'text-[#F6465D]'
                            }
                          >
                            {item.priceChangePercent >= 0 ? '+' : ''}
                            {item.priceChangePercent.toFixed(2)}%
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Live Ticker Price */}
          {currentTicker && (
            <>
              <div className="pr-3 border-r border-[var(--border-color)]">
                <div
                  className={`text-lg sm:text-xl font-bold font-mono-num ${
                    currentTicker.priceChangePercent >= 0 ? 'text-[#0ECB81]' : 'text-[#F6465D]'
                  }`}
                >
                  {formatPrice(currentTicker.price)}
                </div>
                <div className="text-[11px] font-mono-num text-[var(--text-muted)]">
                  ${formatPrice(currentTicker.price)}
                </div>
              </div>

              {/* 24h Statistics */}
              <div className="hidden sm:flex items-center gap-5 text-xs">
                <div>
                  <div className="text-[11px] text-[var(--text-muted)]">24h Change</div>
                  <div
                    className={`font-mono-num font-semibold ${
                      currentTicker.priceChangePercent >= 0 ? 'text-[#0ECB81]' : 'text-[#F6465D]'
                    }`}
                  >
                    {currentTicker.priceChange >= 0 ? '+' : ''}
                    {formatPrice(currentTicker.priceChange)}{' '}
                    {currentTicker.priceChangePercent >= 0 ? '+' : ''}
                    {currentTicker.priceChangePercent.toFixed(2)}%
                  </div>
                </div>
                <div>
                  <div className="text-[11px] text-[var(--text-muted)]">24h High</div>
                  <div className="font-mono-num text-[var(--text-primary)]">
                    {formatPrice(currentTicker.high24h)}
                  </div>
                </div>
                <div>
                  <div className="text-[11px] text-[var(--text-muted)]">24h Low</div>
                  <div className="font-mono-num text-[var(--text-primary)]">
                    {formatPrice(currentTicker.low24h)}
                  </div>
                </div>
                <div className="hidden xl:block">
                  <div className="text-[11px] text-[var(--text-muted)]">
                    24h Volume({currentTicker.baseAsset})
                  </div>
                  <div className="font-mono-num text-[var(--text-primary)]">
                    {formatCompactNumber(currentTicker.volume24h)}
                  </div>
                </div>
                <div className="hidden lg:block">
                  <div className="text-[11px] text-[var(--text-muted)]">24h Volume(USDT)</div>
                  <div className="font-mono-num text-[var(--text-primary)]">
                    {formatCompactNumber(currentTicker.quoteVolume24h)}
                  </div>
                </div>
                {marketMode === 'Futures' && (
                  <div>
                    <div className="text-[11px] text-[var(--text-muted)]">Funding / Countdown</div>
                    <div className="font-mono-num text-[#F0B90B]">
                      +{currentTicker.fundingRate.toFixed(4)}%
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Mode Switcher */}
        <div className="flex items-center gap-2">
          {marketMode === 'Futures' && (
            <div className="flex items-center gap-1.5 mr-2">
              <button
                onClick={() => setMarginMode((p) => (p === 'Cross' ? 'Isolated' : 'Cross'))}
                className="px-2.5 py-1 rounded bg-[var(--bg-elevated)] border border-[var(--border-color)] text-xs font-semibold text-[var(--text-primary)]"
              >
                {marginMode}
              </button>
              <select
                value={leverage}
                onChange={(e) => setLeverage(Number(e.target.value))}
                className="px-2 py-1 rounded bg-[var(--bg-elevated)] border border-[var(--border-color)] text-xs font-mono-num font-bold text-[#F0B90B]"
              >
                {[5, 10, 20, 50, 75, 100, 125].map((lv) => (
                  <option key={lv} value={lv} className="bg-[#181A20] text-white">
                    {lv}x
                  </option>
                ))}
              </select>
            </div>
          )}
          <button
            onClick={() => navigate(marketMode === 'Spot' ? '/trade/futures' : '/trade/spot')}
            className="px-3 py-1.5 rounded bg-[var(--bg-elevated)] hover:bg-[var(--bg-hover)] border border-[var(--border-color)] text-xs font-semibold text-[#F0B90B] cursor-pointer"
          >
            {marketMode === 'Spot' ? 'Futures 125x' : 'Spot Terminal'}
          </button>
        </div>
      </div>

      {/* Mobile Tab Switcher */}
      <div className="flex lg:hidden border-b border-[var(--border-color)] bg-[var(--bg-secondary)] px-3">
        {(
          [
            { id: 'chart', label: 'Chart' },
            { id: 'book', label: 'Order Book' },
            { id: 'trades', label: 'Trades' },
          ] as const
        ).map((tab) => (
          <button
            key={tab.id}
            onClick={() => setMobileTab(tab.id)}
            className={`py-2.5 px-3 text-xs font-semibold border-b-2 ${
              mobileTab === tab.id
                ? 'border-[#F0B90B] text-[#F0B90B]'
                : 'border-transparent text-[var(--text-muted)]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Authentic 3-Column Binance Spot Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 border-b border-[var(--border-color)]">
        {/* LEFT COLUMN (3 cols): Live Order Book */}
        <div
          className={`${
            mobileTab === 'book' ? 'flex' : 'hidden lg:flex'
          } lg:col-span-3 flex-col border-r border-[var(--border-color)] bg-[var(--bg-primary)] p-2.5`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-[var(--text-primary)]">Order Book</span>
            <div className="flex items-center gap-1">
              {(['both', 'bids', 'asks'] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setObFilter(mode)}
                  className={`px-1.5 py-0.5 rounded text-[10px] font-semibold capitalize cursor-pointer ${
                    obFilter === mode
                      ? 'bg-[var(--bg-hover)] text-[#F0B90B]'
                      : 'text-[var(--text-muted)]'
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-3 text-[10px] text-[var(--text-muted)] pb-1.5">
            <span>Price(USDT)</span>
            <span className="text-right">Amount({baseAsset})</span>
            <span className="text-right">Total</span>
          </div>

          {terminalError ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-4 text-xs text-[var(--text-muted)] gap-2">
              <AlertCircle className="w-5 h-5 text-[#F6465D]" />
              <span>{terminalError}</span>
              <button
                onClick={fetchPairFeeds}
                className="text-[#F0B90B] hover:underline font-semibold cursor-pointer"
              >
                Retry Stream
              </button>
            </div>
          ) : terminalLoading && orderBook.asks.length === 0 ? (
            <div className="flex-1 flex items-center justify-center text-xs text-[var(--text-muted)]">
              Loading live orderbook depth...
            </div>
          ) : (
            <>
              {/* Asks (Red) */}
              {(obFilter === 'both' || obFilter === 'asks') && (
                <div className="space-y-0.5 font-mono-num text-[11px]">
                  {orderBook.asks.slice(obFilter === 'asks' ? 0 : -13).map((ask, idx) => (
                    <div
                      key={idx}
                      onClick={() => {
                        const p = ask.price.toFixed(livePrice > 100 ? 2 : 4);
                        setBuyPrice(p);
                        setSellPrice(p);
                      }}
                      className="relative grid grid-cols-3 py-0.5 px-1 cursor-pointer hover:bg-[var(--bg-hover)] overflow-hidden rounded-xs"
                    >
                      <div
                        style={{ width: `${ask.depthPercent}%` }}
                        className="absolute right-0 top-0 bottom-0 bg-[#F6465D]/15 pointer-events-none"
                      />
                      <span className="text-[#F6465D] relative z-10">{formatPrice(ask.price)}</span>
                      <span className="text-right text-[var(--text-primary)] relative z-10">
                        {ask.amount.toFixed(4)}
                      </span>
                      <span className="text-right text-[var(--text-muted)] relative z-10">
                        {ask.total.toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* Spread / Last Traded Price Divider */}
              <div className="my-2 py-2 px-1 border-y border-[var(--border-color)] flex items-center justify-between">
                <div
                  className={`text-base font-bold font-mono-num flex items-center gap-1 ${
                    (currentTicker?.priceChangePercent || 0) >= 0
                      ? 'text-[#0ECB81]'
                      : 'text-[#F6465D]'
                  }`}
                >
                  {formatPrice(livePrice)}
                  {(currentTicker?.priceChangePercent || 0) >= 0 ? (
                    <ArrowUpRight className="w-4 h-4" />
                  ) : (
                    <ArrowDownRight className="w-4 h-4" />
                  )}
                  <span className="text-xs font-normal text-[var(--text-muted)] ml-1">
                    ${formatPrice(livePrice)}
                  </span>
                </div>
              </div>

              {/* Bids (Green) */}
              {(obFilter === 'both' || obFilter === 'bids') && (
                <div className="space-y-0.5 font-mono-num text-[11px]">
                  {orderBook.bids.slice(0, obFilter === 'bids' ? 20 : 13).map((bid, idx) => (
                    <div
                      key={idx}
                      onClick={() => {
                        const p = bid.price.toFixed(livePrice > 100 ? 2 : 4);
                        setBuyPrice(p);
                        setSellPrice(p);
                      }}
                      className="relative grid grid-cols-3 py-0.5 px-1 cursor-pointer hover:bg-[var(--bg-hover)] overflow-hidden rounded-xs"
                    >
                      <div
                        style={{ width: `${bid.depthPercent}%` }}
                        className="absolute right-0 top-0 bottom-0 bg-[#0ECB81]/15 pointer-events-none"
                      />
                      <span className="text-[#0ECB81] relative z-10">{formatPrice(bid.price)}</span>
                      <span className="text-right text-[var(--text-primary)] relative z-10">
                        {bid.amount.toFixed(4)}
                      </span>
                      <span className="text-right text-[var(--text-muted)] relative z-10">
                        {bid.total.toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        {/* CENTER COLUMN (6 cols): Candlestick Chart + Dual Side-by-Side Buy/Sell Execution Panel */}
        <div className="lg:col-span-6 flex flex-col border-r border-[var(--border-color)]">
          {/* Chart Toolbar */}
          <div
            className={`${
              mobileTab !== 'chart' ? 'hidden lg:flex' : 'flex'
            } items-center justify-between px-3 py-1.5 border-b border-[var(--border-color)] bg-[var(--bg-secondary)]/50 text-xs flex-wrap gap-2`}
          >
            <div className="flex items-center gap-1">
              <span className="text-[var(--text-muted)] mr-1">Time</span>
              {(['1m', '5m', '15m', '1H', '4H', '1D'] as const).map((tf) => (
                <button
                  key={tf}
                  onClick={() => setTimeframe(tf)}
                  className={`px-2 py-0.5 rounded text-xs font-mono-num font-semibold cursor-pointer ${
                    timeframe === tf
                      ? 'bg-[var(--bg-hover)] text-[#F0B90B]'
                      : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  {tf}
                </button>
              ))}
              <span className="mx-1 text-[var(--border-color)]">|</span>
              <button
                onClick={() => setShowMA((p) => !p)}
                className={`px-1.5 py-0.5 rounded text-[11px] font-semibold cursor-pointer ${
                  showMA ? 'text-[#F0B90B] bg-[#F0B90B]/10' : 'text-[var(--text-muted)]'
                }`}
              >
                MA
              </button>
              <button
                onClick={() => setShowEMA((p) => !p)}
                className={`px-1.5 py-0.5 rounded text-[11px] font-semibold cursor-pointer ${
                  showEMA ? 'text-[#0ECB81] bg-[#0ECB81]/10' : 'text-[var(--text-muted)]'
                }`}
              >
                EMA
              </button>
              <button
                onClick={() => setShowBOLL((p) => !p)}
                className={`px-1.5 py-0.5 rounded text-[11px] font-semibold cursor-pointer ${
                  showBOLL ? 'text-purple-400 bg-purple-400/10' : 'text-[var(--text-muted)]'
                }`}
              >
                BOLL
              </button>
            </div>

            <div className="flex items-center gap-1">
              {(['Original', 'TradingView', 'Depth'] as const).map((v) => (
                <button
                  key={v}
                  onClick={() => setChartView(v)}
                  className={`px-2 py-0.5 rounded text-[11px] font-semibold cursor-pointer ${
                    chartView === v
                      ? 'bg-[var(--bg-hover)] text-[#F0B90B]'
                      : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>

          {/* Candlestick / Depth Chart Canvas */}
          <div
            className={`${
              mobileTab !== 'chart' ? 'hidden lg:flex' : 'flex'
            } flex-col relative h-[340px] sm:h-[370px] bg-[var(--bg-primary)] p-2.5 overflow-hidden border-b border-[var(--border-color)]`}
          >
            {terminalError ? (
              <div className="flex-1 flex flex-col items-center justify-center text-xs text-[var(--text-muted)] gap-2">
                <AlertCircle className="w-6 h-6 text-[#F6465D]" />
                <span>{terminalError}</span>
              </div>
            ) : !activeCandle ? (
              <div className="flex-1 flex items-center justify-center text-xs text-[var(--text-muted)]">
                Loading live {selectedPair} ({timeframe}) klines from upstream...
              </div>
            ) : (
              <>
                <div className="flex flex-wrap items-center gap-2.5 text-[11px] font-mono-num pb-1.5 z-10">
                  <span className="text-[var(--text-muted)]">{activeCandle.label}</span>
                  <span>
                    Open <strong className="text-[var(--text-primary)]">{formatPrice(activeCandle.open)}</strong>
                  </span>
                  <span>
                    High <strong className="text-[var(--text-primary)]">{formatPrice(activeCandle.high)}</strong>
                  </span>
                  <span>
                    Low <strong className="text-[var(--text-primary)]">{formatPrice(activeCandle.low)}</strong>
                  </span>
                  <span>
                    Close{' '}
                    <strong
                      className={
                        activeCandle.close >= activeCandle.open ? 'text-[#0ECB81]' : 'text-[#F6465D]'
                      }
                    >
                      {formatPrice(activeCandle.close)}
                    </strong>
                  </span>
                  {showMA && activeCandle.ma7 && (
                    <>
                      <span className="text-[#F0B90B]">MA(7): {formatPrice(activeCandle.ma7)}</span>
                      <span className="text-purple-400">MA(25): {formatPrice(activeCandle.ma25!)}</span>
                      <span className="text-sky-400">MA(99): {formatPrice(activeCandle.ma99!)}</span>
                    </>
                  )}
                </div>

                {chartView !== 'Depth' ? (
                  <div className="flex-1 relative w-full h-full">
                    <svg
                      viewBox="0 0 840 300"
                      preserveAspectRatio="none"
                      className="w-full h-full overflow-visible"
                      onMouseLeave={() => setHoverCandleIdx(null)}
                    >
                      {[0.15, 0.35, 0.55, 0.75].map((ratio, idx) => {
                        const y = ratio * 230;
                        const priceLabel =
                          chartStats.maxPrice - ratio * chartStats.range;
                        return (
                          <g key={idx}>
                            <line
                              x1={0}
                              y1={y}
                              x2={775}
                              y2={y}
                              stroke="currentColor"
                              className="text-[var(--border-color)]"
                              strokeDasharray="3 3"
                              strokeWidth="0.8"
                            />
                            <text
                              x={782}
                              y={y + 4}
                              className="fill-[var(--text-muted)] text-[9px] font-mono-num"
                            >
                              {formatPrice(priceLabel)}
                            </text>
                          </g>
                        );
                      })}

                      {candles.map((c, idx) => {
                        const colWidth = 770 / candles.length;
                        const xCenter = idx * colWidth + colWidth / 2;
                        const bodyWidth = Math.max(3, colWidth * 0.64);
                        const isBull = c.close >= c.open;
                        const color = isBull ? '#0ECB81' : '#F6465D';

                        const yHigh =
                          10 + ((chartStats.maxPrice - c.high) / chartStats.range) * 205;
                        const yLow =
                          10 + ((chartStats.maxPrice - c.low) / chartStats.range) * 205;
                        const yOpen =
                          10 + ((chartStats.maxPrice - c.open) / chartStats.range) * 205;
                        const yClose =
                          10 + ((chartStats.maxPrice - c.close) / chartStats.range) * 205;

                        const bodyTop = Math.min(yOpen, yClose);
                        const bodyHeight = Math.max(2, Math.abs(yClose - yOpen));

                        const volHeight = (c.volume / chartStats.maxVol) * 48;
                        const volTop = 292 - volHeight;

                        return (
                          <g
                            key={c.time}
                            onMouseEnter={() => setHoverCandleIdx(idx)}
                            className="cursor-crosshair"
                          >
                            {hoverCandleIdx === idx && (
                              <line
                                x1={xCenter}
                                y1={0}
                                x2={xCenter}
                                y2={292}
                                stroke="#F0B90B"
                                strokeWidth="0.8"
                                strokeDasharray="2 2"
                              />
                            )}
                            <line
                              x1={xCenter}
                              y1={yHigh}
                              x2={xCenter}
                              y2={yLow}
                              stroke={color}
                              strokeWidth="1.2"
                            />
                            <rect
                              x={xCenter - bodyWidth / 2}
                              y={bodyTop}
                              width={bodyWidth}
                              height={bodyHeight}
                              fill={color}
                              rx="0.5"
                            />
                            <rect
                              x={xCenter - bodyWidth / 2}
                              y={volTop}
                              width={bodyWidth}
                              height={volHeight}
                              fill={color}
                              opacity="0.32"
                            />
                          </g>
                        );
                      })}

                      {showMA && (
                        <>
                          <polyline
                            fill="none"
                            stroke="#F0B90B"
                            strokeWidth="1.4"
                            points={candles
                              .map((c, idx) => {
                                const colWidth = 770 / candles.length;
                                const x = idx * colWidth + colWidth / 2;
                                const y =
                                  10 +
                                  ((chartStats.maxPrice - (c.ma7 || c.close)) /
                                    chartStats.range) *
                                    205;
                                return `${x},${y}`;
                              })
                              .join(' ')}
                          />
                          <polyline
                            fill="none"
                            stroke="#C084FC"
                            strokeWidth="1.3"
                            points={candles
                              .map((c, idx) => {
                                const colWidth = 770 / candles.length;
                                const x = idx * colWidth + colWidth / 2;
                                const y =
                                  10 +
                                  ((chartStats.maxPrice - (c.ma25 || c.close)) /
                                    chartStats.range) *
                                    205;
                                return `${x},${y}`;
                              })
                              .join(' ')}
                          />
                        </>
                      )}
                    </svg>
                  </div>
                ) : (
                  <div className="flex-1 flex items-end gap-2 pt-8 pb-4 px-4">
                    <div className="flex-1 h-full flex items-end gap-1 border-b border-[var(--border-color)]">
                      {orderBook.bids
                        .slice()
                        .reverse()
                        .map((b, i) => (
                          <div
                            key={i}
                            style={{ height: `${Math.max(12, b.depthPercent)}%` }}
                            className="flex-1 bg-[#0ECB81]/25 border-t-2 border-[#0ECB81]"
                          />
                        ))}
                    </div>
                    <div className="px-2 text-xs font-mono-num text-[var(--text-muted)] self-center">
                      ${formatPrice(livePrice)}
                    </div>
                    <div className="flex-1 h-full flex items-end gap-1 border-b border-[var(--border-color)]">
                      {orderBook.asks
                        .slice()
                        .reverse()
                        .map((a, i) => (
                          <div
                            key={i}
                            style={{ height: `${Math.max(12, a.depthPercent)}%` }}
                            className="flex-1 bg-[#F6465D]/25 border-t-2 border-[#F6465D]"
                          />
                        ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Center Bottom: Dual Side-by-Side Spot/Futures Order Execution Panel */}
          <div className="bg-[var(--bg-secondary)]/35 p-3.5 flex-1">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 mb-3 border-b border-[var(--border-color)] text-xs">
              <div className="flex items-center gap-4">
                {(['Limit', 'Market', 'Stop-Limit'] as const).map((tp) => (
                  <button
                    key={tp}
                    type="button"
                    onClick={() => setOrderType(tp)}
                    className={`font-bold pb-2 -mb-2.5 transition-colors cursor-pointer ${
                      orderType === tp
                        ? 'text-[#F0B90B] border-b-2 border-[#F0B90B]'
                        : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                    }`}
                  >
                    {tp}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-3 text-[11px]">
                <button
                  onClick={() => navigate('/deposit')}
                  className="text-[#F0B90B] hover:underline font-semibold cursor-pointer"
                >
                  + Deposit
                </button>
                <button
                  onClick={() => navigate('/convert')}
                  className="text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer"
                >
                  0-Fee Convert
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* LEFT: BUY COLUMN */}
              <div className="space-y-2.5">
                <div className="flex justify-between text-xs">
                  <span className="text-[var(--text-muted)]">Avbl</span>
                  <span className="font-mono-num font-semibold text-[var(--text-primary)]">
                    {usdtBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })} USDT
                  </span>
                </div>

                {orderType === 'Stop-Limit' && (
                  <div className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-[var(--bg-primary)] border border-[var(--border-color)] text-xs">
                    <span className="text-[var(--text-muted)]">Stop</span>
                    <input
                      type="number"
                      step="any"
                      value={stopPriceInput}
                      onChange={(e) => setStopPriceInput(e.target.value)}
                      className="w-28 text-right bg-transparent font-mono-num text-[var(--text-primary)] focus:outline-none"
                    />
                    <span className="text-[var(--text-muted)]">USDT</span>
                  </div>
                )}

                <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-[var(--bg-primary)] border border-[var(--border-color)] focus-within:border-[#F0B90B] text-xs">
                  <span className="text-[var(--text-muted)]">Price</span>
                  {orderType === 'Market' ? (
                    <span className="font-mono-num text-[var(--text-muted)]">Market Price</span>
                  ) : (
                    <input
                      type="number"
                      step="any"
                      value={buyPrice}
                      onChange={(e) => setBuyPrice(e.target.value)}
                      className="w-full text-right bg-transparent font-mono-num font-semibold text-[var(--text-primary)] focus:outline-none mx-2"
                    />
                  )}
                  <span className="text-[var(--text-muted)]">USDT</span>
                </div>

                <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-[var(--bg-primary)] border border-[var(--border-color)] focus-within:border-[#F0B90B] text-xs">
                  <span className="text-[var(--text-muted)]">Amount</span>
                  <input
                    type="number"
                    step="any"
                    value={buyAmount}
                    onChange={(e) => setBuyAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full text-right bg-transparent font-mono-num font-semibold text-[var(--text-primary)] focus:outline-none mx-2"
                  />
                  <span className="text-[var(--text-muted)]">{baseAsset}</span>
                </div>

                <div className="grid grid-cols-4 gap-1.5">
                  {[25, 50, 75, 100].map((pct) => (
                    <button
                      key={pct}
                      type="button"
                      onClick={() => handleBuyPercent(pct)}
                      className={`py-1 rounded text-[11px] font-mono-num font-semibold border transition-colors cursor-pointer ${
                        buySlider === pct
                          ? 'border-[#0ECB81] bg-[#0ECB81]/15 text-[#0ECB81]'
                          : 'border-[var(--border-color)] bg-[var(--bg-primary)] text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                      }`}
                    >
                      {pct}%
                    </button>
                  ))}
                </div>

                <div className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-[var(--bg-primary)]/60 border border-[var(--border-color)] text-xs font-mono-num">
                  <span className="text-[var(--text-muted)] font-sans">Total</span>
                  <span className="text-[var(--text-primary)]">{buyTotalUSDT.toFixed(2)} USDT</span>
                </div>

                {isAuthenticated ? (
                  <button
                    type="button"
                    disabled={submittingSide === 'Buy'}
                    onClick={() => executeSideOrder('Buy')}
                    className="w-full py-2.5 rounded-lg bg-[#0ECB81] hover:opacity-90 disabled:opacity-50 text-white font-bold text-xs transition-opacity cursor-pointer"
                  >
                    {submittingSide === 'Buy'
                      ? 'Submitting...'
                      : `${marketMode === 'Futures' ? 'Buy / Long' : 'Buy'} ${baseAsset}`}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => openAuthModal('login')}
                    className="w-full py-2.5 rounded-lg bg-[#FCD535] hover:bg-[#F0B90B] text-[#181A20] font-bold text-xs transition-colors cursor-pointer"
                  >
                    Log In or Register Now
                  </button>
                )}
              </div>

              {/* RIGHT: SELL COLUMN */}
              <div className="space-y-2.5">
                <div className="flex justify-between text-xs">
                  <span className="text-[var(--text-muted)]">Avbl</span>
                  <span className="font-mono-num font-semibold text-[var(--text-primary)]">
                    {baseBalance.toFixed(4)} {baseAsset}
                  </span>
                </div>

                {orderType === 'Stop-Limit' && (
                  <div className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-[var(--bg-primary)] border border-[var(--border-color)] text-xs">
                    <span className="text-[var(--text-muted)]">Stop</span>
                    <input
                      type="number"
                      step="any"
                      value={stopPriceInput}
                      onChange={(e) => setStopPriceInput(e.target.value)}
                      className="w-28 text-right bg-transparent font-mono-num text-[var(--text-primary)] focus:outline-none"
                    />
                    <span className="text-[var(--text-muted)]">USDT</span>
                  </div>
                )}

                <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-[var(--bg-primary)] border border-[var(--border-color)] focus-within:border-[#F0B90B] text-xs">
                  <span className="text-[var(--text-muted)]">Price</span>
                  {orderType === 'Market' ? (
                    <span className="font-mono-num text-[var(--text-muted)]">Market Price</span>
                  ) : (
                    <input
                      type="number"
                      step="any"
                      value={sellPrice}
                      onChange={(e) => setSellPrice(e.target.value)}
                      className="w-full text-right bg-transparent font-mono-num font-semibold text-[var(--text-primary)] focus:outline-none mx-2"
                    />
                  )}
                  <span className="text-[var(--text-muted)]">USDT</span>
                </div>

                <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-[var(--bg-primary)] border border-[var(--border-color)] focus-within:border-[#F0B90B] text-xs">
                  <span className="text-[var(--text-muted)]">Amount</span>
                  <input
                    type="number"
                    step="any"
                    value={sellAmount}
                    onChange={(e) => setSellAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full text-right bg-transparent font-mono-num font-semibold text-[var(--text-primary)] focus:outline-none mx-2"
                  />
                  <span className="text-[var(--text-muted)]">{baseAsset}</span>
                </div>

                <div className="grid grid-cols-4 gap-1.5">
                  {[25, 50, 75, 100].map((pct) => (
                    <button
                      key={pct}
                      type="button"
                      onClick={() => handleSellPercent(pct)}
                      className={`py-1 rounded text-[11px] font-mono-num font-semibold border transition-colors cursor-pointer ${
                        sellSlider === pct
                          ? 'border-[#F6465D] bg-[#F6465D]/15 text-[#F6465D]'
                          : 'border-[var(--border-color)] bg-[var(--bg-primary)] text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                      }`}
                    >
                      {pct}%
                    </button>
                  ))}
                </div>

                <div className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-[var(--bg-primary)]/60 border border-[var(--border-color)] text-xs font-mono-num">
                  <span className="text-[var(--text-muted)] font-sans">Total</span>
                  <span className="text-[var(--text-primary)]">{sellTotalUSDT.toFixed(2)} USDT</span>
                </div>

                {isAuthenticated ? (
                  <button
                    type="button"
                    disabled={submittingSide === 'Sell'}
                    onClick={() => executeSideOrder('Sell')}
                    className="w-full py-2.5 rounded-lg bg-[#F6465D] hover:opacity-90 disabled:opacity-50 text-white font-bold text-xs transition-opacity cursor-pointer"
                  >
                    {submittingSide === 'Sell'
                      ? 'Submitting...'
                      : `${marketMode === 'Futures' ? 'Sell / Short' : 'Sell'} ${baseAsset}`}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => openAuthModal('login')}
                    className="w-full py-2.5 rounded-lg bg-[var(--bg-elevated)] hover:bg-[var(--bg-hover)] border border-[var(--border-color)] text-[var(--text-primary)] font-bold text-xs transition-colors cursor-pointer"
                  >
                    Log In or Register Now
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN (3 cols): Pair Watchlist + Market Trades Stream */}
        <div
          className={`${
            mobileTab === 'trades' ? 'flex' : 'hidden lg:flex'
          } lg:col-span-3 flex-col bg-[var(--bg-primary)]`}
        >
          {/* Top Half: Searchable Pair Watchlist */}
          <div className="p-2.5 border-b border-[var(--border-color)] flex flex-col h-[310px]">
            <div className="flex items-center gap-2 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg px-2.5 py-1.5 mb-2">
              <Search className="w-3.5 h-3.5 text-[var(--text-muted)]" />
              <input
                type="text"
                value={pairSearch}
                onChange={(e) => setPairSearch(e.target.value)}
                placeholder="Search"
                className="w-full bg-transparent text-xs text-[var(--text-primary)] focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-3 text-[11px] font-bold border-b border-[var(--border-color)] pb-1.5 mb-1.5">
              {(['Fav', 'USDT', 'AI', 'Layer 1'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setWatchlistQuoteTab(tab)}
                  className={`cursor-pointer ${
                    watchlistQuoteTab === tab
                      ? 'text-[#F0B90B]'
                      : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-3 text-[10px] text-[var(--text-muted)] pb-1">
              <span>Pair</span>
              <span className="text-right">Last Price</span>
              <span className="text-right">24h Chg%</span>
            </div>

            <div className="flex-1 overflow-y-auto space-y-0.5 text-[11px]">
              {filteredWatchlist.map((item) => {
                const isUp = item.priceChangePercent >= 0;
                return (
                  <div
                    key={item.symbol}
                    onClick={() => setSelectedPair(item.symbol)}
                    className={`grid grid-cols-3 py-1 px-1 rounded cursor-pointer hover:bg-[var(--bg-hover)] ${
                      item.symbol === selectedPair ? 'bg-[var(--bg-hover)]' : ''
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-semibold text-[var(--text-primary)]">
                      <Star
                        className={`w-3 h-3 ${
                          item.isFavorite
                            ? 'fill-[#F0B90B] text-[#F0B90B]'
                            : 'text-[var(--text-muted)]'
                        }`}
                      />
                      <span>{item.baseAsset}/USDT</span>
                    </div>
                    <span className="text-right font-mono-num text-[var(--text-primary)]">
                      {formatPrice(item.price)}
                    </span>
                    <span
                      className={`text-right font-mono-num font-semibold ${
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

          {/* Bottom Half: Live Market Trades */}
          <div className="p-2.5 flex-1 flex flex-col min-h-[260px]">
            <div className="flex items-center gap-4 text-xs font-bold border-b border-[var(--border-color)] pb-1.5 mb-1.5">
              <span className="text-[#F0B90B] border-b-2 border-[#F0B90B] pb-1.5 -mb-1.5">
                Market Trades
              </span>
            </div>
            <div className="grid grid-cols-3 text-[10px] text-[var(--text-muted)] pb-1">
              <span>Price(USDT)</span>
              <span className="text-right">Amount({baseAsset})</span>
              <span className="text-right">Time</span>
            </div>
            {recentTrades.length === 0 ? (
              <div className="flex-1 flex items-center justify-center text-xs text-[var(--text-muted)]">
                {terminalError ? 'Stream unavailable' : 'Loading live trades...'}
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto space-y-0.5 font-mono-num text-[11px]">
                {recentTrades.map((rt) => (
                  <div key={rt.id} className="grid grid-cols-3 py-0.5">
                    <span className={rt.isBuyerMaker ? 'text-[#F6465D]' : 'text-[#0ECB81]'}>
                      {formatPrice(rt.price)}
                    </span>
                    <span className="text-right text-[var(--text-primary)]">
                      {rt.amount.toFixed(4)}
                    </span>
                    <span className="text-right text-[var(--text-muted)]">{rt.time}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* FULL-WIDTH BOTTOM PANEL: Open Orders / Order History / Trade History / Funds */}
      <div className="flex-1 flex flex-col bg-[var(--bg-primary)] min-h-[220px]">
        <div className="flex items-center justify-between px-4 border-b border-[var(--border-color)] bg-[var(--bg-secondary)]/50">
          <div className="flex items-center gap-6 overflow-x-auto">
            {(
              [
                { id: 'open', label: `Open Orders(${openOrders.length})` },
                { id: 'history', label: `Order History(${historyOrders.length})` },
                { id: 'trades', label: `Trade History(${trades.length})` },
                { id: 'assets', label: 'Funds' },
              ] as const
            ).map((t) => (
              <button
                key={t.id}
                onClick={() => setBottomTab(t.id)}
                className={`py-2.5 text-xs font-bold border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
                  bottomTab === t.id
                    ? 'border-[#F0B90B] text-[#F0B90B]'
                    : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
          {bottomTab === 'open' && openOrders.length > 0 && isAuthenticated && (
            <button
              onClick={cancelAllOpenOrders}
              className="text-xs text-[#F6465D] hover:underline font-semibold cursor-pointer"
            >
              Cancel All
            </button>
          )}
        </div>

        <div className="flex-1 overflow-x-auto p-3">
          {!isAuthenticated ? (
            <div className="h-36 flex items-center justify-center text-xs text-[var(--text-muted)]">
              <button
                onClick={() => openAuthModal('login')}
                className="text-[#F0B90B] font-bold hover:underline mr-1 cursor-pointer"
              >
                Log In
              </button>{' '}
              or{' '}
              <button
                onClick={() => openAuthModal('register')}
                className="text-[#F0B90B] font-bold hover:underline mx-1 cursor-pointer"
              >
                Register Now
              </button>{' '}
              to view and execute real database orders
            </div>
          ) : bottomTab === 'open' ? (
            openOrders.length === 0 ? (
              <div className="h-36 flex items-center justify-center text-xs text-[var(--text-muted)]">
                You have no open orders in the database.
              </div>
            ) : (
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="text-[11px] text-[var(--text-muted)] border-b border-[var(--border-color)]">
                    <th className="py-2 px-2">Date</th>
                    <th className="py-2 px-2">Pair</th>
                    <th className="py-2 px-2">Type</th>
                    <th className="py-2 px-2">Side</th>
                    <th className="py-2 px-2 text-right">Price</th>
                    <th className="py-2 px-2 text-right">Amount</th>
                    <th className="py-2 px-2 text-right">Filled</th>
                    <th className="py-2 px-2 text-right">Total</th>
                    <th className="py-2 px-2 text-right">Cancel</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-color)]/50 font-mono-num">
                  {openOrders.map((ord) => (
                    <tr key={ord.id} className="hover:bg-[var(--bg-hover)]">
                      <td className="py-2 px-2 text-[var(--text-muted)]">{ord.createdAt}</td>
                      <td className="py-2 px-2 font-sans font-bold text-[var(--text-primary)]">
                        {ord.pair}
                      </td>
                      <td className="py-2 px-2 font-sans">{ord.type}</td>
                      <td
                        className={`py-2 px-2 font-sans font-bold ${
                          ord.side === 'Buy' ? 'text-[#0ECB81]' : 'text-[#F6465D]'
                        }`}
                      >
                        {ord.side}
                      </td>
                      <td className="py-2 px-2 text-right">{formatPrice(ord.price)}</td>
                      <td className="py-2 px-2 text-right">{ord.amount}</td>
                      <td className="py-2 px-2 text-right">
                        {((ord.filled / ord.amount) * 100).toFixed(0)}%
                      </td>
                      <td className="py-2 px-2 text-right">{ord.total.toFixed(2)} USDT</td>
                      <td className="py-2 px-2 text-right">
                        <button
                          onClick={() => cancelOrder(ord.id)}
                          className="text-[#F6465D] hover:underline font-sans font-semibold cursor-pointer"
                        >
                          Cancel
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )
          ) : bottomTab === 'history' ? (
            historyOrders.length === 0 ? (
              <div className="h-36 flex items-center justify-center text-xs text-[var(--text-muted)]">
                No historical orders recorded yet.
              </div>
            ) : (
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="text-[11px] text-[var(--text-muted)] border-b border-[var(--border-color)]">
                    <th className="py-2 px-2">Date</th>
                    <th className="py-2 px-2">Pair</th>
                    <th className="py-2 px-2">Type</th>
                    <th className="py-2 px-2">Side</th>
                    <th className="py-2 px-2 text-right">Price</th>
                    <th className="py-2 px-2 text-right">Executed</th>
                    <th className="py-2 px-2 text-right">Total</th>
                    <th className="py-2 px-2 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-color)]/50 font-mono-num">
                  {historyOrders.map((ord) => (
                    <tr key={ord.id} className="hover:bg-[var(--bg-hover)]">
                      <td className="py-2 px-2 text-[var(--text-muted)]">{ord.createdAt}</td>
                      <td className="py-2 px-2 font-sans font-bold">{ord.pair}</td>
                      <td className="py-2 px-2 font-sans">{ord.type}</td>
                      <td
                        className={`py-2 px-2 font-sans font-bold ${
                          ord.side === 'Buy' ? 'text-[#0ECB81]' : 'text-[#F6465D]'
                        }`}
                      >
                        {ord.side}
                      </td>
                      <td className="py-2 px-2 text-right">{formatPrice(ord.price)}</td>
                      <td className="py-2 px-2 text-right">{ord.filled}</td>
                      <td className="py-2 px-2 text-right">{ord.total.toFixed(2)} USDT</td>
                      <td className="py-2 px-2 text-right font-sans font-semibold">
                        {ord.status}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )
          ) : bottomTab === 'trades' ? (
            trades.length === 0 ? (
              <div className="h-36 flex items-center justify-center text-xs text-[var(--text-muted)]">
                No executed trades recorded yet.
              </div>
            ) : (
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="text-[11px] text-[var(--text-muted)] border-b border-[var(--border-color)]">
                    <th className="py-2 px-2">Date</th>
                    <th className="py-2 px-2">Pair</th>
                    <th className="py-2 px-2">Side</th>
                    <th className="py-2 px-2 text-right">Price</th>
                    <th className="py-2 px-2 text-right">Executed</th>
                    <th className="py-2 px-2 text-right">Fee</th>
                    <th className="py-2 px-2 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-color)]/50 font-mono-num">
                  {trades.map((tr) => (
                    <tr key={tr.id} className="hover:bg-[var(--bg-hover)]">
                      <td className="py-2 px-2 text-[var(--text-muted)]">{tr.timestamp}</td>
                      <td className="py-2 px-2 font-sans font-bold">{tr.pair}</td>
                      <td
                        className={`py-2 px-2 font-sans font-bold ${
                          tr.side === 'Buy' ? 'text-[#0ECB81]' : 'text-[#F6465D]'
                        }`}
                      >
                        {tr.side}
                      </td>
                      <td className="py-2 px-2 text-right">{formatPrice(tr.price)}</td>
                      <td className="py-2 px-2 text-right">{tr.amount}</td>
                      <td className="py-2 px-2 text-right">
                        {tr.fee} {tr.feeAsset}
                      </td>
                      <td className="py-2 px-2 text-right">{tr.total.toFixed(2)} USDT</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )
          ) : (
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="text-[11px] text-[var(--text-muted)] border-b border-[var(--border-color)]">
                  <th className="py-2 px-2">Coin</th>
                  <th className="py-2 px-2 text-right">Total Balance</th>
                  <th className="py-2 px-2 text-right">Available</th>
                  <th className="py-2 px-2 text-right">In Order</th>
                  <th className="py-2 px-2 text-right">USDT Value</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-color)]/50 font-mono-num">
                {balances.map((b) => (
                  <tr key={b.asset} className="hover:bg-[var(--bg-hover)]">
                    <td className="py-2 px-2 font-sans font-bold flex items-center gap-2">
                      <CryptoIcon symbol={b.asset} size="xs" />
                      {b.asset}
                    </td>
                    <td className="py-2 px-2 text-right">
                      {(b.available + b.inOrder).toLocaleString()}
                    </td>
                    <td className="py-2 px-2 text-right">{b.available.toLocaleString()}</td>
                    <td className="py-2 px-2 text-right text-[var(--text-muted)]">{b.inOrder}</td>
                    <td className="py-2 px-2 text-right font-semibold">
                      ${b.usdtValuation.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};
