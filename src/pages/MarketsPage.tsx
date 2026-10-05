import React, { useState, useMemo } from 'react';
import {
  Search,
  Star,
  ArrowUpDown,
  TrendingUp,
  Flame,
  Sparkles,
  BarChart2,
} from 'lucide-react';
import { useExchange } from '../context/ExchangeContext';
import { formatPrice, formatCompactNumber } from '../data/exchangeData';
import { CryptoIcon } from '../components/CryptoIcon';

export const MarketsPage: React.FC = () => {
  const { tickers, marketLoading, marketError, refreshMarkets, navigate, toggleFavoritePair } =
    useExchange();
  const [marketSubTab, setMarketSubTab] = useState<'All' | 'Favorites' | 'Spot' | 'Futures' | 'Zones'>('All');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [search, setSearch] = useState('');
  const [sortField, setSortField] = useState<'symbol' | 'price' | 'change' | 'volume' | 'marketCap'>('volume');
  const [sortAsc, setSortAsc] = useState(false);

  const hotCoins = useMemo(() => tickers.slice(0, 3), [tickers]);
  const newListings = useMemo(
    () => tickers.filter((t) => ['SUI', 'RENDER', 'NEAR'].includes(t.baseAsset)),
    [tickers]
  );
  const topGainers = useMemo(
    () => [...tickers].sort((a, b) => b.priceChangePercent - a.priceChangePercent).slice(0, 3),
    [tickers]
  );
  const topVolume = useMemo(
    () => [...tickers].sort((a, b) => b.quoteVolume24h - a.quoteVolume24h).slice(0, 3),
    [tickers]
  );

  const categories = ['All', 'Layer 1', 'Solana', 'AI', 'DeFi', 'Infra', 'Payments'];

  const filteredTickers = useMemo(() => {
    return tickers
      .filter((t) => {
        if (marketSubTab === 'Favorites' && !t.isFavorite) return false;
        if (selectedCategory !== 'All' && t.category !== selectedCategory) {
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
  }, [tickers, marketSubTab, selectedCategory, search, sortField, sortAsc]);

  const handleSort = (field: typeof sortField) => {
    if (sortField === field) {
      setSortAsc((prev) => !prev);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  const renderCardList = (title: string, items: typeof tickers) => (
    <div className="p-4 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] space-y-3">
      <div className="flex items-center justify-between text-xs font-bold text-[var(--text-muted)]">
        <span>{title}</span>
        <span>24h Change</span>
      </div>
      <div className="space-y-2">
        {items.map((item) => {
          const isUp = item.priceChangePercent >= 0;
          return (
            <div
              key={item.symbol}
              onClick={() => navigate('/trade/spot', item.symbol)}
              className="flex items-center justify-between py-1 px-1.5 rounded-lg hover:bg-[var(--bg-hover)] cursor-pointer transition-colors"
            >
              <div className="flex items-center gap-2">
                <CryptoIcon symbol={item.baseAsset} size="sm" />
                <span className="text-xs font-bold text-[var(--text-primary)]">
                  {item.baseAsset}
                </span>
              </div>
              <span className="text-xs font-mono-num text-[var(--text-primary)]">
                ${formatPrice(item.price)}
              </span>
              <span
                className={`text-xs font-mono-num font-semibold ${
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
  );

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] py-8 px-4 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Top Heading */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-[var(--text-primary)]">
            Markets Overview
          </h1>
          <div className="flex items-center gap-2 bg-[var(--bg-secondary)] border border-[var(--border-color)] focus-within:border-[#F0B90B] rounded-xl px-3.5 py-2 w-full sm:w-80">
            <Search className="w-4 h-4 text-[var(--text-muted)]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search coin name or symbol"
              className="w-full bg-transparent text-xs text-[var(--text-primary)] focus:outline-none"
            />
          </div>
        </div>

        {/* 4-Card Top Market Summary Row (Exact Binance Reference Layout) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {renderCardList('Hot Coins', hotCoins)}
          {renderCardList('New Listings', newListings)}
          {renderCardList('Top Gainer Coin', topGainers)}
          {renderCardList('Top Volume Coin', topVolume)}
        </div>

        {/* Primary Market Sub-Tabs */}
        <div className="flex items-center gap-6 border-b border-[var(--border-color)] text-sm font-bold overflow-x-auto">
          {(
            [
              { id: 'Favorites', label: 'Favorites' },
              { id: 'All', label: 'All Cryptos' },
              { id: 'Spot', label: 'Spot Markets' },
              { id: 'Futures', label: 'Futures Markets' },
              { id: 'Zones', label: 'Trading Zones' },
            ] as const
          ).map((t) => (
            <button
              key={t.id}
              onClick={() => setMarketSubTab(t.id)}
              className={`pb-3 transition-colors whitespace-nowrap cursor-pointer ${
                marketSubTab === t.id
                  ? 'text-[var(--text-primary)] border-b-2 border-[#F0B90B]'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Category Filter Buttons */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-[var(--bg-hover)] text-[#F0B90B]'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
              }`}
            >
              {cat}
            </button>
          ))}
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
                      Name <ArrowUpDown className="w-3 h-3" />
                    </button>
                  </th>
                  <th className="py-3 px-4 text-right">
                    <button
                      onClick={() => handleSort('price')}
                      className="inline-flex items-center gap-1 hover:text-[var(--text-primary)] cursor-pointer"
                    >
                      Price <ArrowUpDown className="w-3 h-3" />
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
                  <th className="py-3 px-4 text-right hidden sm:table-cell">
                    <button
                      onClick={() => handleSort('volume')}
                      className="inline-flex items-center gap-1 hover:text-[var(--text-primary)] cursor-pointer"
                    >
                      24h Volume <ArrowUpDown className="w-3 h-3" />
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
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-color)]/60 text-xs">
                {marketLoading && tickers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-[var(--text-muted)]">
                      Loading live market tickers from upstream provider...
                    </td>
                  </tr>
                ) : marketError && tickers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center space-y-3">
                      <div className="text-[#F6465D] font-bold">{marketError}</div>
                      <button
                        onClick={refreshMarkets}
                        className="px-4 py-2 rounded-lg bg-[#F0B90B] text-[#181A20] text-xs font-bold cursor-pointer"
                      >
                        Retry Live Connection
                      </button>
                    </td>
                  </tr>
                ) : filteredTickers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-[var(--text-muted)]">
                      No trading pairs match "{search}".
                    </td>
                  </tr>
                ) : (
                  filteredTickers.map((t) => {
                    const isUp = t.priceChangePercent >= 0;
                    return (
                      <tr
                        key={t.symbol}
                        onClick={() =>
                          navigate(
                            marketSubTab === 'Futures' ? '/trade/futures' : '/trade/spot',
                            t.symbol
                          )
                        }
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
                            <CryptoIcon symbol={t.baseAsset} size="md" />
                            <div className="flex items-baseline gap-2">
                              <span className="font-bold text-sm text-[var(--text-primary)]">
                                {t.baseAsset}
                              </span>
                              <span className="text-xs text-[var(--text-muted)]">{t.name}</span>
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono-num font-semibold text-sm text-[var(--text-primary)]">
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
                        <td className="py-3.5 px-4 text-right font-mono-num text-[var(--text-secondary)] hidden sm:table-cell">
                          ${formatCompactNumber(t.quoteVolume24h)}
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono-num text-[var(--text-secondary)] hidden lg:table-cell">
                          ${formatCompactNumber(t.marketCap)}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="inline-flex items-center gap-3">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate('/convert');
                              }}
                              className="text-xs text-[#F0B90B] hover:underline font-semibold"
                            >
                              Convert
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate('/trade/spot', t.symbol);
                              }}
                              className="text-xs text-[#F0B90B] hover:underline font-semibold"
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
