import React, { useState, useMemo, useEffect } from 'react';
import {
  ChevronDown,
  Star,
  Search,
  Maximize2,
  SlidersHorizontal,
  ArrowUpRight,
  ArrowDownRight,
  Trash2,
} from 'lucide-react';
import { useExchange } from '../context/ExchangeContext';
import {
  generateCandles,
  generateOrderBook,
  generateRecentTrades,
  formatPrice,
  formatCompactNumber,
} from '../data/exchangeData';

interface TradingTerminalPageProps {
  marketMode: 'Spot' | 'Futures';
}

export const TradingTerminalPage: React.FC<TradingTerminalPageProps> = ({ marketMode }) => {
  const {
    tickers,
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
    () => tickers.find((t) => t.symbol === selectedPair) || tickers[0],
    [tickers, selectedPair]
  );

  // Pair selector dropdown state
  const [pairDropdownOpen, setPairDropdownOpen] = useState(false);
  const [pairSearch, setPairSearch] = useState('');

  // Chart controls
  const [timeframe, setTimeframe] = useState<'1m' | '5m' | '15m' | '1H' | '4H' | '1D'>('15m');
  const [chartView, setChartView] = useState<'Candles' | 'Depth'>('Candles');
  const [showMA, setShowMA] = useState(true);
  const [showEMA, setShowEMA] = useState(false);
  const [showBOLL, setShowBOLL] = useState(false);
  const [hoverCandleIdx, setHoverCandleIdx] = useState<number | null>(null);

  // Orderbook filter
  const [obFilter, setObFilter] = useState<'both' | 'bids' | 'asks'>('both');

  // Order Entry State
  const [orderSide, setOrderSide] = useState<'Buy' | 'Sell'>('Buy');
  const [orderType, setOrderType] = useState<'Limit' | 'Market' | 'Stop-Limit'>('Limit');
  const [priceInput, setPriceInput] = useState<string>(currentTicker.price.toString());
  const [stopPriceInput, setStopPriceInput] = useState<string>(
    (currentTicker.price * 0.99).toFixed(2)
  );
  const [amountInput, setAmountInput] = useState<string>('');
  const [percentSlider, setPercentSlider] = useState<number>(0);

  // Futures-specific state
  const [marginMode, setMarginMode] = useState<'Cross' | 'Isolated'>('Cross');
  const [leverage, setLeverage] = useState<number>(20);
  const [tpPrice, setTpPrice] = useState<string>('');
  const [slPrice, setSlPrice] = useState<string>('');

  // Bottom table tab
  const [bottomTab, setBottomTab] = useState<'open' | 'history' | 'trades' | 'assets'>('open');

  // Mobile view switcher for compact screens
  const [mobileTab, setMobileTab] = useState<'chart' | 'book' | 'trades'>('chart');

  // Update default limit price when pair changes
  useEffect(() => {
    setPriceInput(
      currentTicker.price >= 100
        ? currentTicker.price.toFixed(2)
        : currentTicker.price.toFixed(4)
    );
    setStopPriceInput(
      currentTicker.price >= 100
        ? (currentTicker.price * 0.99).toFixed(2)
        : (currentTicker.price * 0.99).toFixed(4)
    );
    setAmountInput('');
    setPercentSlider(0);
  }, [currentTicker.symbol]);

  const candles = useMemo(
    () => generateCandles(currentTicker.price, timeframe, 58),
    [currentTicker.price, timeframe]
  );

  const orderBook = useMemo(
    () => generateOrderBook(currentTicker.price),
    [currentTicker.price]
  );

  const recentTrades = useMemo(
    () => generateRecentTrades(currentTicker.price),
    [currentTicker.price]
  );

  const usdtBalance = useMemo(
    () => balances.find((b) => b.asset === 'USDT')?.available || 0,
    [balances]
  );
  const baseBalance = useMemo(
    () => balances.find((b) => b.asset === currentTicker.baseAsset)?.available || 0,
    [balances, currentTicker.baseAsset]
  );

  const activeCandle =
    hoverCandleIdx !== null && candles[hoverCandleIdx]
      ? candles[hoverCandleIdx]
      : candles[candles.length - 1];

  // Calculate chart geometry
  const chartStats = useMemo(() => {
    const highs = candles.map((c) => c.high);
    const lows = candles.map((c) => c.low);
    const vols = candles.map((c) => c.volume);
    const maxPrice = Math.max(...highs);
    const minPrice = Math.min(...lows);
    const maxVol = Math.max(...vols, 1);
    const range = Math.max(maxPrice - minPrice, 0.0001);
    return { maxPrice, minPrice, range, maxVol };
  }, [candles]);

  const handlePercentageClick = (pct: number) => {
    setPercentSlider(pct);
    const execPrice =
      orderType === 'Market' ? currentTicker.price : parseFloat(priceInput) || currentTicker.price;
    if (orderSide === 'Buy') {
      const usableUSDT =
        marketMode === 'Futures' ? usdtBalance * leverage * (pct / 100) : usdtBalance * (pct / 100);
      const calcAmt = execPrice > 0 ? usableUSDT / execPrice : 0;
      setAmountInput(calcAmt > 0 ? calcAmt.toFixed(4) : '');
    } else {
      const calcAmt =
        marketMode === 'Futures'
          ? ((usdtBalance * leverage * (pct / 100)) / execPrice)
          : baseBalance * (pct / 100);
      setAmountInput(calcAmt > 0 ? calcAmt.toFixed(4) : '');
    }
  };

  const handleOrderSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      openAuthModal('login');
      return;
    }
    const parsedPrice =
      orderType === 'Market' ? currentTicker.price : parseFloat(priceInput) || currentTicker.price;
    const parsedAmount = parseFloat(amountInput);
    if (!parsedAmount || parsedAmount <= 0) return;

    const success = placeOrder({
      pair: currentTicker.symbol,
      marketType: marketMode,
      type: orderType,
      side: orderSide,
      price: parsedPrice,
      stopPrice: orderType === 'Stop-Limit' ? parseFloat(stopPriceInput) : undefined,
      amount: parsedAmount,
      leverage: marketMode === 'Futures' ? leverage : undefined,
    });

    if (success) {
      setAmountInput('');
      setPercentSlider(0);
    }
  };

  const openOrders = orders.filter((o) => o.status === 'Open');
  const historyOrders = orders.filter((o) => o.status !== 'Open');

  const estimatedTotalUSDT =
    (orderType === 'Market' ? currentTicker.price : parseFloat(priceInput) || 0) *
    (parseFloat(amountInput) || 0);

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[var(--bg-primary)] text-[var(--text-primary)] flex flex-col select-none">
      {/* Top Sub-Header: Pair Selector + Live 24h Statistics Bar */}
      <div className="bg-[var(--bg-secondary)] border-b border-[var(--border-color)] px-3 lg:px-4 py-2 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4 flex-wrap">
          {/* Pair Selector Dropdown */}
          <div className="relative">
            <button
              onClick={() => setPairDropdownOpen((prev) => !prev)}
              className="flex items-center gap-2 py-1 px-2 rounded-lg hover:bg-[var(--bg-hover)] transition-colors cursor-pointer"
            >
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleFavoritePair(currentTicker.symbol);
                }}
                className="text-[var(--text-muted)] hover:text-[#F0B90B]"
              >
                <Star
                  className={`w-4 h-4 ${
                    currentTicker.isFavorite ? 'fill-[#F0B90B] text-[#F0B90B]' : ''
                  }`}
                />
              </button>
              <div className="text-left">
                <div className="flex items-center gap-1.5">
                  <span className="text-base sm:text-lg font-bold text-[var(--text-primary)]">
                    {currentTicker.baseAsset}/{currentTicker.quoteAsset}
                  </span>
                  <span className="text-[11px] font-mono-num text-[#F0B90B]">
                    {marketMode === 'Futures' ? `Perp · ${currentTicker.maxLeverage}x` : 'Spot'}
                  </span>
                  <ChevronDown className="w-4 h-4 text-[var(--text-muted)]" />
                </div>
                <div className="text-[11px] text-[var(--text-muted)]">{currentTicker.name}</div>
              </div>
            </button>

            {pairDropdownOpen && (
              <>
                <div className="fixed inset-0 z-30" onClick={() => setPairDropdownOpen(false)} />
                <div className="absolute left-0 top-full mt-1 w-80 bg-[var(--bg-elevated)] border border-[var(--border-color)] rounded-lg shadow-2xl p-3 z-40">
                  <div className="flex items-center gap-2 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded px-2.5 py-1.5 mb-2">
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
                    {tickers
                      .filter(
                        (t) =>
                          t.symbol.toLowerCase().includes(pairSearch.toLowerCase()) ||
                          t.name.toLowerCase().includes(pairSearch.toLowerCase())
                      )
                      .map((item) => (
                        <button
                          key={item.symbol}
                          onClick={() => {
                            setSelectedPair(item.symbol);
                            setPairDropdownOpen(false);
                          }}
                          className={`w-full flex items-center justify-between py-2 px-2 rounded text-xs hover:bg-[var(--bg-hover)] ${
                            item.symbol === currentTicker.symbol ? 'bg-[var(--bg-hover)]' : ''
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <Star
                              className={`w-3.5 h-3.5 ${
                                item.isFavorite ? 'fill-[#F0B90B] text-[#F0B90B]' : 'text-[var(--text-muted)]'
                              }`}
                            />
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
          <div className="pr-2 border-r border-[var(--border-color)]">
            <div
              className={`text-lg sm:text-xl font-bold font-mono-num ${
                currentTicker.priceChangePercent >= 0 ? 'text-[#0ECB81]' : 'text-[#F6465D]'
              }`}
            >
              {formatPrice(currentTicker.price)}
            </div>
            <div className="text-[11px] font-mono-num text-[var(--text-muted)]">
              ≈ ${formatPrice(currentTicker.price)}
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
                {formatPrice(currentTicker.priceChange)} ({currentTicker.priceChangePercent >= 0 ? '+' : ''}
                {currentTicker.priceChangePercent.toFixed(2)}%)
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
                24h Volume ({currentTicker.baseAsset})
              </div>
              <div className="font-mono-num text-[var(--text-primary)]">
                {formatCompactNumber(currentTicker.volume24h)}
              </div>
            </div>
            <div className="hidden lg:block">
              <div className="text-[11px] text-[var(--text-muted)]">24h Volume (USDT)</div>
              <div className="font-mono-num text-[var(--text-primary)]">
                {formatCompactNumber(currentTicker.quoteVolume24h)}
              </div>
            </div>
            {marketMode === 'Futures' && (
              <div>
                <div className="text-[11px] text-[var(--text-muted)]">Funding / Countdown</div>
                <div className="font-mono-num text-[#F0B90B]">
                  +{currentTicker.fundingRate.toFixed(4)}% / 03:41:18
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Mode Switcher Pill */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate(marketMode === 'Spot' ? '/trade/futures' : '/trade/spot')}
            className="px-3 py-1.5 rounded bg-[var(--bg-elevated)] hover:bg-[var(--bg-hover)] border border-[var(--border-color)] text-xs font-semibold text-[#F0B90B] cursor-pointer"
          >
            Switch to {marketMode === 'Spot' ? 'Futures 125x' : 'Spot Terminal'}
          </button>
        </div>
      </div>

      {/* Mobile Tab Switcher (Chart / Order Book / Market Trades) */}
      <div className="flex lg:hidden border-b border-[var(--border-color)] bg-[var(--bg-secondary)] px-3">
        {(
          [
            { id: 'chart', label: 'Chart & Indicators' },
            { id: 'book', label: 'Order Book' },
            { id: 'trades', label: 'Recent Trades' },
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

      {/* Main Pro Trading Grid */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 border-b border-[var(--border-color)]">
        {/* Left & Center: Candlestick Chart + Bottom Open Orders / History (Cols 1-7 on lg) */}
        <div className="lg:col-span-7 xl:col-span-7 flex flex-col border-r border-[var(--border-color)]">
          {/* Chart Toolbar */}
          <div
            className={`${
              mobileTab !== 'chart' ? 'hidden lg:flex' : 'flex'
            } items-center justify-between px-3 py-2 border-b border-[var(--border-color)] bg-[var(--bg-secondary)]/50 text-xs flex-wrap gap-2`}
          >
            <div className="flex items-center gap-1">
              <span className="text-[var(--text-muted)] mr-1">Time</span>
              {(['1m', '5m', '15m', '1H', '4H', '1D'] as const).map((tf) => (
                <button
                  key={tf}
                  onClick={() => setTimeframe(tf)}
                  className={`px-2 py-1 rounded text-xs font-mono-num font-medium cursor-pointer ${
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
                className={`px-2 py-1 rounded text-[11px] font-medium cursor-pointer ${
                  showMA ? 'text-[#F0B90B] bg-[#F0B90B]/10' : 'text-[var(--text-muted)]'
                }`}
              >
                MA
              </button>
              <button
                onClick={() => setShowEMA((p) => !p)}
                className={`px-2 py-1 rounded text-[11px] font-medium cursor-pointer ${
                  showEMA ? 'text-[#0ECB81] bg-[#0ECB81]/10' : 'text-[var(--text-muted)]'
                }`}
              >
                EMA
              </button>
              <button
                onClick={() => setShowBOLL((p) => !p)}
                className={`px-2 py-1 rounded text-[11px] font-medium cursor-pointer ${
                  showBOLL ? 'text-purple-400 bg-purple-400/10' : 'text-[var(--text-muted)]'
                }`}
              >
                BOLL
              </button>
            </div>

            <div className="flex items-center gap-1">
              {(['Candles', 'Depth'] as const).map((v) => (
                <button
                  key={v}
                  onClick={() => setChartView(v)}
                  className={`px-2.5 py-1 rounded text-xs font-medium cursor-pointer ${
                    chartView === v
                      ? 'bg-[var(--bg-hover)] text-[var(--text-primary)]'
                      : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>

          {/* Interactive Candlestick / Depth Canvas */}
          <div
            className={`${
              mobileTab !== 'chart' ? 'hidden lg:flex' : 'flex'
            } flex-col relative h-[360px] sm:h-[420px] bg-[var(--bg-primary)] p-3 overflow-hidden border-b border-[var(--border-color)]`}
          >
            {/* OHLC Legend Header */}
            <div className="flex flex-wrap items-center gap-3 text-[11px] font-mono-num pb-2 z-10">
              <span className="text-[var(--text-muted)]">{activeCandle.label}</span>
              <span>
                O <strong className="text-[var(--text-primary)]">{formatPrice(activeCandle.open)}</strong>
              </span>
              <span>
                H <strong className="text-[var(--text-primary)]">{formatPrice(activeCandle.high)}</strong>
              </span>
              <span>
                L <strong className="text-[var(--text-primary)]">{formatPrice(activeCandle.low)}</strong>
              </span>
              <span>
                C{' '}
                <strong
                  className={
                    activeCandle.close >= activeCandle.open ? 'text-[#0ECB81]' : 'text-[#F6465D]'
                  }
                >
                  {formatPrice(activeCandle.close)}
                </strong>
              </span>
              <span>
                Vol <strong className="text-[var(--text-primary)]">{activeCandle.volume.toFixed(1)}</strong>
              </span>
              {showMA && activeCandle.ma7 && (
                <>
                  <span className="text-[#F0B90B]">MA(7): {formatPrice(activeCandle.ma7)}</span>
                  <span className="text-purple-400">MA(25): {formatPrice(activeCandle.ma25!)}</span>
                  <span className="text-sky-400">MA(99): {formatPrice(activeCandle.ma99!)}</span>
                </>
              )}
            </div>

            {chartView === 'Candles' ? (
              <div className="flex-1 relative w-full h-full">
                <svg
                  viewBox="0 0 840 310"
                  preserveAspectRatio="none"
                  className="w-full h-full overflow-visible"
                  onMouseLeave={() => setHoverCandleIdx(null)}
                >
                  {/* Horizontal Price Grid Lines */}
                  {[0.15, 0.35, 0.55, 0.75].map((ratio, idx) => {
                    const y = ratio * 240;
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

                  {/* Candlesticks + Volume Bars */}
                  {candles.map((c, idx) => {
                    const colWidth = 770 / candles.length;
                    const xCenter = idx * colWidth + colWidth / 2;
                    const bodyWidth = Math.max(3, colWidth * 0.64);
                    const isBull = c.close >= c.open;
                    const color = isBull ? '#0ECB81' : '#F6465D';

                    const yHigh =
                      10 + ((chartStats.maxPrice - c.high) / chartStats.range) * 215;
                    const yLow =
                      10 + ((chartStats.maxPrice - c.low) / chartStats.range) * 215;
                    const yOpen =
                      10 + ((chartStats.maxPrice - c.open) / chartStats.range) * 215;
                    const yClose =
                      10 + ((chartStats.maxPrice - c.close) / chartStats.range) * 215;

                    const bodyTop = Math.min(yOpen, yClose);
                    const bodyHeight = Math.max(2, Math.abs(yClose - yOpen));

                    const volHeight = (c.volume / chartStats.maxVol) * 52;
                    const volTop = 302 - volHeight;

                    return (
                      <g
                        key={c.time}
                        onMouseEnter={() => setHoverCandleIdx(idx)}
                        className="cursor-crosshair"
                      >
                        {/* Hover column highlight */}
                        {hoverCandleIdx === idx && (
                          <line
                            x1={xCenter}
                            y1={0}
                            x2={xCenter}
                            y2={302}
                            stroke="#F0B90B"
                            strokeWidth="0.8"
                            strokeDasharray="2 2"
                          />
                        )}
                        {/* Wick */}
                        <line
                          x1={xCenter}
                          y1={yHigh}
                          x2={xCenter}
                          y2={yLow}
                          stroke={color}
                          strokeWidth="1.2"
                        />
                        {/* Candle Body */}
                        <rect
                          x={xCenter - bodyWidth / 2}
                          y={bodyTop}
                          width={bodyWidth}
                          height={bodyHeight}
                          fill={color}
                          rx="0.5"
                        />
                        {/* Volume Bar */}
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

                  {/* Moving Average Polylines */}
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
                                215;
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
                                215;
                            return `${x},${y}`;
                          })
                          .join(' ')}
                      />
                    </>
                  )}
                </svg>
              </div>
            ) : (
              /* Market Depth Visualization */
              <div className="flex-1 flex items-end gap-2 pt-8 pb-4 px-4">
                <div className="flex-1 h-full flex items-end gap-1 border-b border-[var(--border-color)]">
                  {orderBook.bids
                    .slice()
                    .reverse()
                    .map((b, i) => (
                      <div
                        key={i}
                        style={{ height: `${Math.max(12, b.depthPercent)}%` }}
                        className="flex-1 bg-[#0ECB81]/25 border-t-2 border-[#0ECB81] rounded-t-xs"
                        title={`Bid: ${formatPrice(b.price)} (${b.total.toFixed(2)})`}
                      />
                    ))}
                </div>
                <div className="px-2 text-xs font-mono-num text-[var(--text-muted)] self-center">
                  Mid: ${formatPrice(currentTicker.price)}
                </div>
                <div className="flex-1 h-full flex items-end gap-1 border-b border-[var(--border-color)]">
                  {orderBook.asks
                    .slice()
                    .reverse()
                    .map((a, i) => (
                      <div
                        key={i}
                        style={{ height: `${Math.max(12, a.depthPercent)}%` }}
                        className="flex-1 bg-[#F6465D]/25 border-t-2 border-[#F6465D] rounded-t-xs"
                        title={`Ask: ${formatPrice(a.price)} (${a.total.toFixed(2)})`}
                      />
                    ))}
                </div>
              </div>
            )}
          </div>

          {/* Bottom Panel: Open Orders / Order History / Trade History / Assets */}
          <div className="flex-1 flex flex-col bg-[var(--bg-primary)] min-h-[250px]">
            <div className="flex items-center justify-between px-4 border-b border-[var(--border-color)] bg-[var(--bg-secondary)]/50">
              <div className="flex items-center gap-5 overflow-x-auto">
                {(
                  [
                    { id: 'open', label: `Open Orders (${openOrders.length})` },
                    { id: 'history', label: `Order History (${historyOrders.length})` },
                    { id: 'trades', label: `Trade History (${trades.length})` },
                    { id: 'assets', label: 'Funds / Balances' },
                  ] as const
                ).map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setBottomTab(t.id)}
                    className={`py-2.5 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
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
                  className="text-xs text-[#F6465D] hover:underline font-medium cursor-pointer"
                >
                  Cancel All
                </button>
              )}
            </div>

            <div className="flex-1 overflow-x-auto p-3">
              {!isAuthenticated ? (
                <div className="h-40 flex flex-col items-center justify-center gap-2 text-xs text-[var(--text-muted)]">
                  <div>
                    <button
                      onClick={() => openAuthModal('login')}
                      className="text-[#F0B90B] font-semibold hover:underline cursor-pointer"
                    >
                      Log In
                    </button>{' '}
                    or{' '}
                    <button
                      onClick={() => openAuthModal('register')}
                      className="text-[#F0B90B] font-semibold hover:underline cursor-pointer"
                    >
                      Register Now
                    </button>{' '}
                    to view and manage your live orders and trade history.
                  </div>
                </div>
              ) : bottomTab === 'open' ? (
                openOrders.length === 0 ? (
                  <div className="h-40 flex items-center justify-center text-xs text-[var(--text-muted)]">
                    No active open orders. Use the Buy/Sell order ticket on the right to place an order.
                  </div>
                ) : (
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="text-[11px] text-[var(--text-muted)] border-b border-[var(--border-color)]">
                        <th className="py-2 px-2">Time</th>
                        <th className="py-2 px-2">Pair</th>
                        <th className="py-2 px-2">Type</th>
                        <th className="py-2 px-2">Side</th>
                        <th className="py-2 px-2 text-right">Price</th>
                        <th className="py-2 px-2 text-right">Amount</th>
                        <th className="py-2 px-2 text-right">Filled</th>
                        <th className="py-2 px-2 text-right">Total (USDT)</th>
                        <th className="py-2 px-2 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--border-color)]/50 font-mono-num">
                      {openOrders.map((ord) => (
                        <tr key={ord.id} className="hover:bg-[var(--bg-hover)]">
                          <td className="py-2.5 px-2 text-[var(--text-muted)]">{ord.createdAt.slice(5)}</td>
                          <td className="py-2.5 px-2 font-sans font-semibold text-[var(--text-primary)]">
                            {ord.pair}
                          </td>
                          <td className="py-2.5 px-2 font-sans text-[var(--text-secondary)]">{ord.type}</td>
                          <td
                            className={`py-2.5 px-2 font-sans font-semibold ${
                              ord.side === 'Buy' ? 'text-[#0ECB81]' : 'text-[#F6465D]'
                            }`}
                          >
                            {ord.side}
                          </td>
                          <td className="py-2.5 px-2 text-right">{formatPrice(ord.price)}</td>
                          <td className="py-2.5 px-2 text-right">{ord.amount}</td>
                          <td className="py-2.5 px-2 text-right">
                            {((ord.filled / ord.amount) * 100).toFixed(0)}%
                          </td>
                          <td className="py-2.5 px-2 text-right">{ord.total.toFixed(2)}</td>
                          <td className="py-2.5 px-2 text-right">
                            <button
                              onClick={() => cancelOrder(ord.id)}
                              className="inline-flex items-center gap-1 text-[#F6465D] hover:underline font-sans font-medium cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              Cancel
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )
              ) : bottomTab === 'history' ? (
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="text-[11px] text-[var(--text-muted)] border-b border-[var(--border-color)]">
                      <th className="py-2 px-2">Time</th>
                      <th className="py-2 px-2">Pair</th>
                      <th className="py-2 px-2">Type</th>
                      <th className="py-2 px-2">Side</th>
                      <th className="py-2 px-2 text-right">Price</th>
                      <th className="py-2 px-2 text-right">Filled</th>
                      <th className="py-2 px-2 text-right">Total</th>
                      <th className="py-2 px-2 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border-color)]/50 font-mono-num">
                    {historyOrders.map((ord) => (
                      <tr key={ord.id} className="hover:bg-[var(--bg-hover)]">
                        <td className="py-2.5 px-2 text-[var(--text-muted)]">{ord.createdAt.slice(5)}</td>
                        <td className="py-2.5 px-2 font-sans font-semibold">{ord.pair}</td>
                        <td className="py-2.5 px-2 font-sans">{ord.type}</td>
                        <td
                          className={`py-2.5 px-2 font-sans font-semibold ${
                            ord.side === 'Buy' ? 'text-[#0ECB81]' : 'text-[#F6465D]'
                          }`}
                        >
                          {ord.side}
                        </td>
                        <td className="py-2.5 px-2 text-right">{formatPrice(ord.price)}</td>
                        <td className="py-2.5 px-2 text-right">{ord.filled}</td>
                        <td className="py-2.5 px-2 text-right">{ord.total.toFixed(2)} USDT</td>
                        <td
                          className={`py-2.5 px-2 text-right font-sans font-medium ${
                            ord.status === 'Filled' ? 'text-[#0ECB81]' : 'text-[var(--text-muted)]'
                          }`}
                        >
                          {ord.status}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : bottomTab === 'trades' ? (
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="text-[11px] text-[var(--text-muted)] border-b border-[var(--border-color)]">
                      <th className="py-2 px-2">Time</th>
                      <th className="py-2 px-2">Pair</th>
                      <th className="py-2 px-2">Side</th>
                      <th className="py-2 px-2 text-right">Exec Price</th>
                      <th className="py-2 px-2 text-right">Executed</th>
                      <th className="py-2 px-2 text-right">Fee</th>
                      <th className="py-2 px-2 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border-color)]/50 font-mono-num">
                    {trades.map((tr) => (
                      <tr key={tr.id} className="hover:bg-[var(--bg-hover)]">
                        <td className="py-2.5 px-2 text-[var(--text-muted)]">{tr.timestamp.slice(5)}</td>
                        <td className="py-2.5 px-2 font-sans font-semibold">{tr.pair}</td>
                        <td
                          className={`py-2.5 px-2 font-sans font-semibold ${
                            tr.side === 'Buy' ? 'text-[#0ECB81]' : 'text-[#F6465D]'
                          }`}
                        >
                          {tr.side} ({tr.role})
                        </td>
                        <td className="py-2.5 px-2 text-right">{formatPrice(tr.price)}</td>
                        <td className="py-2.5 px-2 text-right">{tr.amount}</td>
                        <td className="py-2.5 px-2 text-right">
                          {tr.fee} {tr.feeAsset}
                        </td>
                        <td className="py-2.5 px-2 text-right">{tr.total.toFixed(2)} USDT</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="text-[11px] text-[var(--text-muted)] border-b border-[var(--border-color)]">
                      <th className="py-2 px-2">Asset</th>
                      <th className="py-2 px-2 text-right">Available</th>
                      <th className="py-2 px-2 text-right">In Order</th>
                      <th className="py-2 px-2 text-right">USDT Valuation</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border-color)]/50 font-mono-num">
                    {balances.map((b) => (
                      <tr key={b.asset} className="hover:bg-[var(--bg-hover)]">
                        <td className="py-2.5 px-2 font-sans font-bold text-[var(--text-primary)]">
                          {b.asset} <span className="font-normal text-[var(--text-muted)]">· {b.name}</span>
                        </td>
                        <td className="py-2.5 px-2 text-right">{b.available.toLocaleString()}</td>
                        <td className="py-2.5 px-2 text-right text-[var(--text-muted)]">{b.inOrder}</td>
                        <td className="py-2.5 px-2 text-right font-semibold">
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

        {/* Middle Column: Order Book & Recent Market Trades (Cols 8-9 on lg) */}
        <div
          className={`${
            mobileTab === 'chart' ? 'hidden lg:flex' : 'flex'
          } lg:col-span-2 flex-col border-r border-[var(--border-color)] bg-[var(--bg-primary)]`}
        >
          {/* Order Book Section */}
          <div
            className={`${
              mobileTab === 'trades' ? 'hidden lg:flex' : 'flex'
            } flex-col flex-1 border-b border-[var(--border-color)] p-2.5`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-[var(--text-primary)]">Order Book</span>
              <div className="flex items-center gap-1">
                {(['both', 'bids', 'asks'] as const).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setObFilter(mode)}
                    className={`px-1.5 py-0.5 rounded text-[10px] font-medium capitalize cursor-pointer ${
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

            {/* Order Book Headers */}
            <div className="grid grid-cols-3 text-[10px] text-[var(--text-muted)] pb-1.5">
              <span>Price(USDT)</span>
              <span className="text-right">Size({currentTicker.baseAsset})</span>
              <span className="text-right">Sum</span>
            </div>

            {/* Asks (Sell orders in Red) */}
            {(obFilter === 'both' || obFilter === 'asks') && (
              <div className="space-y-0.5 font-mono-num text-[11px]">
                {orderBook.asks.slice(obFilter === 'asks' ? 0 : -8).map((ask, idx) => (
                  <div
                    key={idx}
                    onClick={() => setPriceInput(ask.price.toFixed(currentTicker.price > 100 ? 2 : 4))}
                    className="relative grid grid-cols-3 py-0.5 px-1 cursor-pointer hover:bg-[var(--bg-hover)] overflow-hidden rounded-xs"
                  >
                    <div
                      style={{ width: `${ask.depthPercent}%` }}
                      className="absolute right-0 top-0 bottom-0 bg-[#F6465D]/15 pointer-events-none"
                    />
                    <span className="text-[#F6465D] relative z-10">{formatPrice(ask.price)}</span>
                    <span className="text-right text-[var(--text-primary)] relative z-10">
                      {ask.amount.toFixed(3)}
                    </span>
                    <span className="text-right text-[var(--text-muted)] relative z-10">
                      {ask.total.toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Spread / Last Traded Price Divider */}
            <div className="my-2 py-1.5 px-1 border-y border-[var(--border-color)] flex items-center justify-between">
              <div
                className={`text-sm font-bold font-mono-num flex items-center gap-1 ${
                  currentTicker.priceChangePercent >= 0 ? 'text-[#0ECB81]' : 'text-[#F6465D]'
                }`}
              >
                {formatPrice(currentTicker.price)}
                {currentTicker.priceChangePercent >= 0 ? (
                  <ArrowUpRight className="w-3.5 h-3.5" />
                ) : (
                  <ArrowDownRight className="w-3.5 h-3.5" />
                )}
              </div>
              <span className="text-[11px] font-mono-num text-[var(--text-muted)]">
                ${formatPrice(currentTicker.price)}
              </span>
            </div>

            {/* Bids (Buy orders in Green) */}
            {(obFilter === 'both' || obFilter === 'bids') && (
              <div className="space-y-0.5 font-mono-num text-[11px]">
                {orderBook.bids.slice(0, obFilter === 'bids' ? 14 : 8).map((bid, idx) => (
                  <div
                    key={idx}
                    onClick={() => setPriceInput(bid.price.toFixed(currentTicker.price > 100 ? 2 : 4))}
                    className="relative grid grid-cols-3 py-0.5 px-1 cursor-pointer hover:bg-[var(--bg-hover)] overflow-hidden rounded-xs"
                  >
                    <div
                      style={{ width: `${bid.depthPercent}%` }}
                      className="absolute right-0 top-0 bottom-0 bg-[#0ECB81]/15 pointer-events-none"
                    />
                    <span className="text-[#0ECB81] relative z-10">{formatPrice(bid.price)}</span>
                    <span className="text-right text-[var(--text-primary)] relative z-10">
                      {bid.amount.toFixed(3)}
                    </span>
                    <span className="text-right text-[var(--text-muted)] relative z-10">
                      {bid.total.toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Market Recent Trades Section */}
          <div
            className={`${
              mobileTab === 'book' ? 'hidden lg:flex' : 'flex'
            } flex-col p-2.5 h-60 overflow-hidden`}
          >
            <div className="text-xs font-semibold text-[var(--text-primary)] mb-2">
              Market Trades
            </div>
            <div className="grid grid-cols-3 text-[10px] text-[var(--text-muted)] pb-1">
              <span>Price(USDT)</span>
              <span className="text-right">Amount</span>
              <span className="text-right">Time</span>
            </div>
            <div className="flex-1 overflow-y-auto space-y-0.5 font-mono-num text-[11px]">
              {recentTrades.map((rt) => (
                <div key={rt.id} className="grid grid-cols-3 py-0.5">
                  <span className={rt.isBuyerMaker ? 'text-[#F6465D]' : 'text-[#0ECB81]'}>
                    {formatPrice(rt.price)}
                  </span>
                  <span className="text-right text-[var(--text-primary)]">
                    {rt.amount.toFixed(3)}
                  </span>
                  <span className="text-right text-[var(--text-muted)]">{rt.time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Order Entry Ticket (Buy / Sell Panel) (Cols 10-12 on lg) */}
        <div className="lg:col-span-3 bg-[var(--bg-secondary)]/40 p-3.5 flex flex-col justify-between">
          <div className="space-y-4">
            {/* Futures Margin & Leverage Bar */}
            {marketMode === 'Futures' && (
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() =>
                    setMarginMode((prev) => (prev === 'Cross' ? 'Isolated' : 'Cross'))
                  }
                  className="py-1.5 px-2.5 rounded bg-[var(--bg-elevated)] border border-[var(--border-color)] text-xs font-semibold text-[var(--text-primary)] hover:border-[#F0B90B] cursor-pointer"
                >
                  {marginMode} Margin
                </button>
                <div className="flex items-center justify-between py-1 px-2.5 rounded bg-[var(--bg-elevated)] border border-[var(--border-color)] text-xs">
                  <span className="text-[var(--text-muted)]">Leverage</span>
                  <select
                    value={leverage}
                    onChange={(e) => setLeverage(Number(e.target.value))}
                    className="bg-transparent font-mono-num font-bold text-[#F0B90B] focus:outline-none cursor-pointer"
                  >
                    {[5, 10, 20, 50, 75, 100, 125].map((lv) => (
                      <option key={lv} value={lv} className="bg-[#181A20] text-white">
                        {lv}x
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {/* Buy / Sell Segmented Switcher */}
            <div className="grid grid-cols-2 gap-1 p-1 bg-[var(--bg-primary)] rounded-lg border border-[var(--border-color)]">
              <button
                type="button"
                onClick={() => setOrderSide('Buy')}
                className={`py-2 rounded-md text-xs font-bold transition-colors cursor-pointer ${
                  orderSide === 'Buy'
                    ? 'bg-[#0ECB81] text-white'
                    : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                }`}
              >
                {marketMode === 'Futures' ? 'Open Long / Buy' : `Buy ${currentTicker.baseAsset}`}
              </button>
              <button
                type="button"
                onClick={() => setOrderSide('Sell')}
                className={`py-2 rounded-md text-xs font-bold transition-colors cursor-pointer ${
                  orderSide === 'Sell'
                    ? 'bg-[#F6465D] text-white'
                    : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                }`}
              >
                {marketMode === 'Futures' ? 'Open Short / Sell' : `Sell ${currentTicker.baseAsset}`}
              </button>
            </div>

            {/* Order Type Tabs: Limit / Market / Stop-Limit */}
            <div className="flex items-center gap-4 border-b border-[var(--border-color)] text-xs">
              {(['Limit', 'Market', 'Stop-Limit'] as const).map((tp) => (
                <button
                  key={tp}
                  type="button"
                  onClick={() => setOrderType(tp)}
                  className={`pb-2 font-semibold transition-colors cursor-pointer ${
                    orderType === tp
                      ? 'text-[#F0B90B] border-b-2 border-[#F0B90B]'
                      : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  {tp}
                </button>
              ))}
            </div>

            {/* Available Balance Row */}
            <div className="flex items-center justify-between text-xs">
              <span className="text-[var(--text-muted)]">Available Balance</span>
              <span className="font-mono-num font-semibold text-[var(--text-primary)]">
                {orderSide === 'Buy'
                  ? `${usdtBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })} USDT`
                  : `${baseBalance.toFixed(4)} ${currentTicker.baseAsset}`}
              </span>
            </div>

            {/* Order Entry Form */}
            <form onSubmit={handleOrderSubmit} className="space-y-3">
              {orderType === 'Stop-Limit' && (
                <div>
                  <label className="block text-[11px] text-[var(--text-muted)] mb-1">
                    Stop Trigger Price
                  </label>
                  <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-[var(--bg-primary)] border border-[var(--border-color)] focus-within:border-[#F0B90B]">
                    <input
                      type="number"
                      step="any"
                      value={stopPriceInput}
                      onChange={(e) => setStopPriceInput(e.target.value)}
                      className="w-full bg-transparent text-xs font-mono-num text-[var(--text-primary)] focus:outline-none"
                    />
                    <span className="text-xs text-[var(--text-muted)] ml-2">USDT</span>
                  </div>
                </div>
              )}

              {/* Price Input */}
              <div>
                <label className="block text-[11px] text-[var(--text-muted)] mb-1">
                  Order Price
                </label>
                {orderType === 'Market' ? (
                  <div className="px-3 py-2 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border-color)] text-xs text-[var(--text-muted)] font-mono-num flex justify-between">
                    <span>Best Market Price</span>
                    <span>≈ {formatPrice(currentTicker.price)} USDT</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-[var(--bg-primary)] border border-[var(--border-color)] focus-within:border-[#F0B90B]">
                    <input
                      type="number"
                      step="any"
                      required
                      value={priceInput}
                      onChange={(e) => setPriceInput(e.target.value)}
                      className="w-full bg-transparent text-xs font-mono-num text-[var(--text-primary)] focus:outline-none"
                    />
                    <span className="text-xs text-[var(--text-muted)] ml-2">USDT</span>
                  </div>
                )}
              </div>

              {/* Amount Input */}
              <div>
                <label className="block text-[11px] text-[var(--text-muted)] mb-1">
                  Amount ({currentTicker.baseAsset})
                </label>
                <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-[var(--bg-primary)] border border-[var(--border-color)] focus-within:border-[#F0B90B]">
                  <input
                    type="number"
                    step="any"
                    required
                    value={amountInput}
                    onChange={(e) => setAmountInput(e.target.value)}
                    placeholder="0.0000"
                    className="w-full bg-transparent text-xs font-mono-num text-[var(--text-primary)] focus:outline-none"
                  />
                  <span className="text-xs text-[var(--text-muted)] ml-2">
                    {currentTicker.baseAsset}
                  </span>
                </div>
              </div>

              {/* 25% / 50% / 75% / 100% Quick Allocation Buttons */}
              <div className="grid grid-cols-4 gap-1.5 pt-1">
                {[25, 50, 75, 100].map((pct) => (
                  <button
                    key={pct}
                    type="button"
                    onClick={() => handlePercentageClick(pct)}
                    className={`py-1 rounded text-[11px] font-mono-num font-medium border transition-colors cursor-pointer ${
                      percentSlider === pct
                        ? 'border-[#F0B90B] bg-[#F0B90B]/15 text-[#F0B90B]'
                        : 'border-[var(--border-color)] bg-[var(--bg-primary)] text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                    }`}
                  >
                    {pct}%
                  </button>
                ))}
              </div>

              {/* Futures Take Profit / Stop Loss Optional Fields */}
              {marketMode === 'Futures' && (
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <input
                    type="number"
                    step="any"
                    value={tpPrice}
                    onChange={(e) => setTpPrice(e.target.value)}
                    placeholder="Take Profit (USDT)"
                    className="px-2.5 py-1.5 rounded bg-[var(--bg-primary)] border border-[var(--border-color)] text-[11px] font-mono-num text-[var(--text-primary)] focus:outline-none focus:border-[#0ECB81]"
                  />
                  <input
                    type="number"
                    step="any"
                    value={slPrice}
                    onChange={(e) => setSlPrice(e.target.value)}
                    placeholder="Stop Loss (USDT)"
                    className="px-2.5 py-1.5 rounded bg-[var(--bg-primary)] border border-[var(--border-color)] text-[11px] font-mono-num text-[var(--text-primary)] focus:outline-none focus:border-[#F6465D]"
                  />
                </div>
              )}

              {/* Order Summary */}
              <div className="pt-2 space-y-1 text-xs border-t border-[var(--border-color)]">
                <div className="flex justify-between">
                  <span className="text-[var(--text-muted)]">Order Value</span>
                  <span className="font-mono-num text-[var(--text-primary)]">
                    {estimatedTotalUSDT.toFixed(2)} USDT
                  </span>
                </div>
                {marketMode === 'Futures' && (
                  <div className="flex justify-between">
                    <span className="text-[var(--text-muted)]">Est. Margin Required ({leverage}x)</span>
                    <span className="font-mono-num text-[#F0B90B]">
                      {(estimatedTotalUSDT / leverage).toFixed(2)} USDT
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-[var(--text-muted)]">Est. Fee (0.10%)</span>
                  <span className="font-mono-num text-[var(--text-muted)]">
                    {(estimatedTotalUSDT * 0.001).toFixed(4)} USDT
                  </span>
                </div>
              </div>

              {/* Submit Action Button (Login-gated when unauthenticated) */}
              {isAuthenticated ? (
                <button
                  type="submit"
                  className={`w-full py-3 rounded-lg font-bold text-xs text-white transition-opacity hover:opacity-90 cursor-pointer ${
                    orderSide === 'Buy' ? 'bg-[#0ECB81]' : 'bg-[#F6465D]'
                  }`}
                >
                  {orderSide === 'Buy'
                    ? `${marketMode === 'Futures' ? 'Buy / Long' : 'Buy'} ${currentTicker.baseAsset}`
                    : `${marketMode === 'Futures' ? 'Sell / Short' : 'Sell'} ${currentTicker.baseAsset}`}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => openAuthModal('login')}
                  className="w-full py-3 rounded-lg bg-[#F0B90B] hover:bg-[#FCD535] text-[#181A20] font-bold text-xs transition-colors cursor-pointer"
                >
                  Log In or Register to Trade
                </button>
              )}
            </form>
          </div>

          {/* Quick Asset Transfer / Deposit Links */}
          <div className="pt-4 mt-4 border-t border-[var(--border-color)] grid grid-cols-2 gap-2 text-xs">
            <button
              onClick={() => navigate('/deposit')}
              className="py-2 rounded bg-[var(--bg-elevated)] hover:bg-[var(--bg-hover)] text-[var(--text-primary)] font-medium cursor-pointer"
            >
              Deposit Crypto
            </button>
            <button
              onClick={() => navigate('/convert')}
              className="py-2 rounded bg-[var(--bg-elevated)] hover:bg-[var(--bg-hover)] text-[var(--text-primary)] font-medium cursor-pointer"
            >
              0-Fee Convert
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
