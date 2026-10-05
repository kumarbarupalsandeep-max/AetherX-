import React, { useState, useMemo } from 'react';
import {
  Search,
  Star,
  ArrowUpDown,
  TrendingUp,
  TrendingDown,
  Flame,
  BarChart3,
} from 'lucide-react';
import { useExchange } from '../context/ExchangeContext';
import { formatPrice, formatCompactNumber } from '../data/exchangeData';

export const MarketsPage: React.FC = () => {
  const { tickers, navigate, toggleFavoritePair } = useExchange();
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [search, setSearch] = useState('');
  const [sortField, setSortField] = useState<'symbol' | 'price' | 'change' | 'volume' | 'marketCap'>('volume');
  const [sortAsc, setSortAsc] = useState(false);

  const topGainer = useMemo(
    () => [...tickers].sort((a, b) => b.priceChangePercent - a.priceChangePercent)[0],
    [tickers]
  );
  const topVolume = useMemo(
    () => [...tickers].sort((a, b) => b.quoteVolume24h - a.quoteVolume24h)[0],
    [tickers]
  );
  const topDip = useMemo(
    () => [...tickers].sort((a, b) => a.priceChangePercent - b.priceChangePercent)[0],
    [tickers]
  );

  const categories = ['All', 'Favorites', 'Layer 1', 'Solana', 'AI', 'DeFi', 'Infra', 'Payments'];

  const filteredTickers = useMemo(() => {
    return tickers
      .filter((t) => {
        if (selectedCategory === 'Favorites' && !t.isFavorite) return false;
        if (
          selectedCategory !== 'All' &&
          selectedCategory !== 'Favorites' &&
          t.category !== selectedCategory
        ) {
          return false;
        }
        if (
          search &&
          !t.symbol.toLowerCase().includes(search.toLowerCase()) &&
          !t.name.toLowerCase().includes(search.toLowerCase())
        ) {
          return false;
        }
        return true;
      })
      .sort((a, b) => {
        let cmp = 0;
        if (sortField === 'symbol') cmp = a.symbol.localeCompare(b.symbol);
        if (sortField === 'price') cmp = a.price - b.price;
        if (sortField === 'change') cmp = a.priceChangePercent - b.priceChangePercent;
        if (sortField === 'volume') cmp = a.quoteVolume24h - b.quoteVolume24h;
        if (sortField === 'marketCap') cmp = a.marketCap - b.marketCap;
        return sortAsc ? cmp : -cmp;
      });
  }, [tickers, selectedCategory, search, sortField, sortAsc]);

  const handleSort = (field: typeof sortField) => {
    if (sortField === field) {
      setSortAsc((prev) => !prev);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] py-8 px-4 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-[var(--text-primary)]">
              Markets Overview
            </h1>
            <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-1">
              Real-time prices, 24h volume, and market capitalization across Spot and Perpetual markets.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/trade/spot')}
              className="px-3.5 py-2 rounded-lg bg-[#F0B90B] hover:bg-[#FCD535] text-[#181A20] text-xs font-semibold cursor-pointer"
            >
              Spot Terminal
            </button>
            <button
              onClick={() => navigate('/trade/futures')}
              className="px-3.5 py-2 rounded-lg bg-[var(--bg-secondary)] hover:bg-[var(--bg-hover)] border border-[var(--border-color)] text-xs font-semibold text-[var(--text-primary)] cursor-pointer"
            >
              USDⓈ-M Futures
            </button>
          </div>
        </div>

        {/* Highlight Cards (Hot / Top Gainer / Volume Leader / Dip Watch) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div
            onClick={() => navigate('/trade/spot', topGainer.symbol)}
            className="p-4 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] hover:border-[#0ECB81]/50 transition-colors cursor-pointer"
          >
            <div className="flex items-center justify-between text-xs text-[var(--text-muted)] mb-2">
              <span className="flex items-center gap-1.5 font-medium text-[#0ECB81]">
                <TrendingUp className="w-3.5 h-3.5" />
                24h Top Gainer
              </span>
              <span>Spot / Futures</span>
            </div>
            <div className="flex items-baseline justify-between">
              <div>
                <div className="text-base font-bold text-[var(--text-primary)]">
                  {topGainer.baseAsset}/USDT
                </div>
                <div className="text-xs text-[var(--text-muted)]">{topGainer.name}</div>
              </div>
              <div className="text-right font-mono-num">
                <div className="text-base font-bold text-[var(--text-primary)]">
                  ${formatPrice(topGainer.price)}
                </div>
                <div className="text-xs font-semibold text-[#0ECB81]">
                  +{topGainer.priceChangePercent.toFixed(2)}%
                </div>
              </div>
            </div>
          </div>

          <div
            onClick={() => navigate('/trade/spot', topVolume.symbol)}
            className="p-4 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] hover:border-[#F0B90B]/50 transition-colors cursor-pointer"
          >
            <div className="flex items-center justify-between text-xs text-[var(--text-muted)] mb-2">
              <span className="flex items-center gap-1.5 font-medium text-[#F0B90B]">
                <Flame className="w-3.5 h-3.5" />
                24h Volume Leader
              </span>
              <span>Deep Liquidity</span>
            </div>
            <div className="flex items-baseline justify-between">
              <div>
                <div className="text-base font-bold text-[var(--text-primary)]">
                  {topVolume.baseAsset}/USDT
                </div>
                <div className="text-xs text-[var(--text-muted)]">
                  Vol ${formatCompactNumber(topVolume.quoteVolume24h)}
                </div>
              </div>
              <div className="text-right font-mono-num">
                <div className="text-base font-bold text-[var(--text-primary)]">
                  ${formatPrice(topVolume.price)}
                </div>
                <div className="text-xs font-semibold text-[#0ECB81]">
                  +{topVolume.priceChangePercent.toFixed(2)}%
                </div>
              </div>
            </div>
          </div>

          <div
            onClick={() => navigate('/trade/spot', topDip.symbol)}
            className="p-4 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] hover:border-[#F6465D]/50 transition-colors cursor-pointer"
          >
            <div className="flex items-center justify-between text-xs text-[var(--text-muted)] mb-2">
              <span className="flex items-center gap-1.5 font-medium text-[#F6465D]">
                <TrendingDown className="w-3.5 h-3.5" />
                Pullback Watch
              </span>
              <span>Volatility Alert</span>
            </div>
            <div className="flex items-baseline justify-between">
              <div>
                <div className="text-base font-bold text-[var(--text-primary)]">
                  {topDip.baseAsset}/USDT
                </div>
                <div className="text-xs text-[var(--text-muted)]">{topDip.name}</div>
              </div>
              <div className="text-right font-mono-num">
                <div className="text-base font-bold text-[var(--text-primary)]">
                  ${formatPrice(topDip.price)}
                </div>
                <div className="text-xs font-semibold text-[#F6465D]">
                  {topDip.priceChangePercent.toFixed(2)}%
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Category Filter Tabs & Search Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-[var(--border-color)]">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-[#F0B90B] text-[#181A20]'
                    : 'text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 bg-[var(--bg-secondary)] border border-[var(--border-color)] focus-within:border-[#F0B90B] rounded-lg px-3 py-1.5 w-full md:w-72">
            <Search className="w-4 h-4 text-[var(--text-muted)]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search coin name or symbol..."
              className="w-full bg-transparent text-xs text-[var(--text-primary)] focus:outline-none"
            />
          </div>
        </div>

        {/* High-Density Market Data Grid */}
        <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[var(--border-color)] text-[11px] font-medium text-[var(--text-muted)]">
                  <th className="py-3 px-4">
                    <button
                      onClick={() => handleSort('symbol')}
                      className="flex items-center gap-1 hover:text-[var(--text-primary)] cursor-pointer"
                    >
                      Name / Pair <ArrowUpDown className="w-3 h-3" />
                    </button>
                  </th>
                  <th className="py-3 px-4 text-right">
                    <button
                      onClick={() => handleSort('price')}
                      className="inline-flex items-center gap-1 hover:text-[var(--text-primary)] cursor-pointer"
                    >
                      Last Price <ArrowUpDown className="w-3 h-3" />
                    </button>
                  </th>
                  <th className="py-3 px-4 text-right">
                    <button
                      onClick={() => handleSort('change')}
                      className="inline-flex items-center gap-1 hover:text-[var(--text-primary)] cursor-pointer"
                    >
                      24h Change <ArrowUpDown className="w-3 h-3" />
                    </button>
                  </th>
                  <th className="py-3 px-4 text-right hidden md:table-cell">24h High / Low</th>
                  <th className="py-3 px-4 text-right hidden sm:table-cell">
                    <button
                      onClick={() => handleSort('volume')}
                      className="inline-flex items-center gap-1 hover:text-[var(--text-primary)] cursor-pointer"
                    >
                      24h Volume (USDT) <ArrowUpDown className="w-3 h-3" />
                    </button>
                  </th>
                  <th className="py-3 px-4 text-right hidden lg:table-cell">
                    <button
                      onClick={() => handleSort('marketCap')}
                      className="inline-flex items-center gap-1 hover:text-[var(--text-primary)] cursor-pointer"
                    >
                      Market Cap <ArrowUpDown className="w-3 h-3" />
                    </button>
                  </th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-color)]/60 text-xs">
                {filteredTickers.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-[var(--text-muted)]">
                      No trading pairs match "{search}" in {selectedCategory}.
                    </td>
                  </tr>
                ) : (
                  filteredTickers.map((t) => {
                    const isUp = t.priceChangePercent >= 0;
                    return (
                      <tr
                        key={t.symbol}
                        onClick={() => navigate('/trade/spot', t.symbol)}
                        className="hover:bg-[var(--bg-hover)] transition-colors cursor-pointer"
                      >
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleFavoritePair(t.symbol);
                              }}
                              className="text-[var(--text-muted)] hover:text-[#F0B90B]"
                              aria-label="Toggle favorite"
                            >
                              <Star
                                className={`w-4 h-4 ${
                                  t.isFavorite ? 'fill-[#F0B90B] text-[#F0B90B]' : ''
                                }`}
                              />
                            </button>
                            <div className="w-7 h-7 rounded-full bg-[var(--bg-elevated)] border border-[var(--border-color)] flex items-center justify-center font-bold text-[#F0B90B]">
                              {t.baseAsset.slice(0, 3)}
                            </div>
                            <div>
                              <div className="font-bold text-[var(--text-primary)] flex items-center gap-1.5">
                                {t.baseAsset}
                                <span className="font-normal text-[var(--text-muted)]">
                                  /{t.quoteAsset}
                                </span>
                                <span className="text-[10px] font-mono-num text-[var(--text-muted)]">
                                  · {t.maxLeverage}x
                                </span>
                              </div>
                              <div className="text-[11px] text-[var(--text-muted)]">
                                {t.name} · {t.category}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono-num font-semibold text-[var(--text-primary)]">
                          ${formatPrice(t.price)}
                        </td>
                        <td
                          className={`py-3.5 px-4 text-right font-mono-num font-semibold ${
                            isUp ? 'text-[#0ECB81]' : 'text-[#F6465D]'
                          }`}
                        >
                          {isUp ? '+' : ''}
                          {t.priceChangePercent.toFixed(2)}%
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono-num text-[var(--text-secondary)] hidden md:table-cell">
                          ${formatPrice(t.high24h)} / ${formatPrice(t.low24h)}
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono-num text-[var(--text-secondary)] hidden sm:table-cell">
                          ${formatCompactNumber(t.quoteVolume24h)}
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono-num text-[var(--text-secondary)] hidden lg:table-cell">
                          ${formatCompactNumber(t.marketCap)}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="inline-flex items-center gap-2">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate('/convert');
                              }}
                              className="text-xs text-[var(--text-secondary)] hover:text-[#F0B90B] font-medium"
                            >
                              Convert
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate('/trade/spot', t.symbol);
                              }}
                              className="px-2.5 py-1 rounded bg-[#F0B90B]/15 text-[#F0B90B] hover:bg-[#F0B90B] hover:text-[#181A20] font-semibold transition-colors"
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
        </div>
      </div>
    </div>
  );
};
