import React, { useState } from 'react';
import { Trash2, Lock, Filter, Download } from 'lucide-react';
import { useExchange } from '../context/ExchangeContext';
import { formatPrice } from '../data/exchangeData';

interface OrdersCenterPageProps {
  initialTab: 'open' | 'history' | 'trades';
}

export const OrdersCenterPage: React.FC<OrdersCenterPageProps> = ({ initialTab }) => {
  const {
    orders,
    trades,
    isAuthenticated,
    openAuthModal,
    cancelOrder,
    cancelAllOpenOrders,
    navigate,
    pushToast,
  } = useExchange();

  const [pairFilter, setPairFilter] = useState<string>('ALL');
  const [sideFilter, setSideFilter] = useState<'ALL' | 'Buy' | 'Sell'>('ALL');

  const openOrders = orders.filter(
    (o) =>
      o.status === 'Open' &&
      (pairFilter === 'ALL' || o.pair === pairFilter) &&
      (sideFilter === 'ALL' || o.side === sideFilter)
  );

  const historyOrders = orders.filter(
    (o) =>
      (pairFilter === 'ALL' || o.pair === pairFilter) &&
      (sideFilter === 'ALL' || o.side === sideFilter)
  );

  const filteredTrades = trades.filter(
    (t) =>
      (pairFilter === 'ALL' || t.pair === pairFilter) &&
      (sideFilter === 'ALL' || t.side === sideFilter)
  );

  if (!isAuthenticated) {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-[var(--bg-primary)] text-[var(--text-primary)] flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl p-8 text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-[#F0B90B]/15 text-[#F0B90B] flex items-center justify-center mx-auto">
            <Lock className="w-6 h-6" />
          </div>
          <h1 className="font-display text-2xl font-bold text-[var(--text-primary)]">
            Sign In to View Orders & Trade History
          </h1>
          <p className="text-xs text-[var(--text-muted)] leading-relaxed">
            Manage your active Spot and Futures orders, inspect historical fills, and export tax-ready execution statements.
          </p>
          <button
            onClick={() => openAuthModal('login')}
            className="w-full py-3 rounded-lg bg-[#F0B90B] hover:bg-[#FCD535] text-[#181A20] font-bold text-xs cursor-pointer"
          >
            Log In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] py-8 px-4 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Top Navigation Tabs across the 3 Order routes */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[var(--border-color)] pb-3">
          <div className="flex items-center gap-6 text-sm font-semibold">
            <button
              onClick={() => navigate('/orders')}
              className={`pb-3 -mb-3.5 transition-colors cursor-pointer ${
                initialTab === 'open'
                  ? 'text-[#F0B90B] border-b-2 border-[#F0B90B]'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
              }`}
            >
              Open Orders ({orders.filter((o) => o.status === 'Open').length})
            </button>
            <button
              onClick={() => navigate('/order-history')}
              className={`pb-3 -mb-3.5 transition-colors cursor-pointer ${
                initialTab === 'history'
                  ? 'text-[#F0B90B] border-b-2 border-[#F0B90B]'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
              }`}
            >
              Order History ({orders.length})
            </button>
            <button
              onClick={() => navigate('/trade-history')}
              className={`pb-3 -mb-3.5 transition-colors cursor-pointer ${
                initialTab === 'trades'
                  ? 'text-[#F0B90B] border-b-2 border-[#F0B90B]'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
              }`}
            >
              Trade Execution History ({trades.length})
            </button>
          </div>

          <div className="flex items-center gap-2">
            {initialTab === 'open' && openOrders.length > 0 && (
              <button
                onClick={cancelAllOpenOrders}
                className="px-3.5 py-1.5 rounded-lg bg-[#F6465D]/15 text-[#F6465D] hover:bg-[#F6465D] hover:text-white text-xs font-semibold transition-colors cursor-pointer"
              >
                Cancel All Open Orders
              </button>
            )}
            <button
              onClick={() =>
                pushToast({
                  type: 'info',
                  title: 'CSV Statement Exported',
                  description: 'Order & Trade statement has been prepared for download.',
                })
              }
              className="px-3.5 py-1.5 rounded-lg bg-[var(--bg-secondary)] hover:bg-[var(--bg-hover)] border border-[var(--border-color)] text-xs font-semibold text-[var(--text-primary)] flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              Export CSV
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 text-xs">
          <select
            value={pairFilter}
            onChange={(e) => setPairFilter(e.target.value)}
            className="px-3 py-2 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-primary)] font-semibold focus:outline-none cursor-pointer"
          >
            <option value="ALL">All Pairs</option>
            <option value="BTCUSDT">BTC/USDT</option>
            <option value="ETHUSDT">ETH/USDT</option>
            <option value="SOLUSDT">SOL/USDT</option>
            <option value="BNBUSDT">BNB/USDT</option>
          </select>

          <select
            value={sideFilter}
            onChange={(e) => setSideFilter(e.target.value as any)}
            className="px-3 py-2 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-primary)] font-semibold focus:outline-none cursor-pointer"
          >
            <option value="ALL">All Sides (Buy & Sell)</option>
            <option value="Buy">Buy Only</option>
            <option value="Sell">Sell Only</option>
          </select>
        </div>

        {/* Data Table */}
        <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            {initialTab === 'open' && (
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-[var(--border-color)] text-[11px] text-[var(--text-muted)]">
                    <th className="py-3.5 px-4">Date / Order ID</th>
                    <th className="py-3.5 px-4">Pair / Market</th>
                    <th className="py-3.5 px-4">Type</th>
                    <th className="py-3.5 px-4">Side</th>
                    <th className="py-3.5 px-4 text-right">Order Price</th>
                    <th className="py-3.5 px-4 text-right">Amount</th>
                    <th className="py-3.5 px-4 text-right">Filled</th>
                    <th className="py-3.5 px-4 text-right">Total (USDT)</th>
                    <th className="py-3.5 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-color)]/60 font-mono-num">
                  {openOrders.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="py-12 text-center font-sans text-[var(--text-muted)]">
                        No open orders match your filter.{' '}
                        <button
                          onClick={() => navigate('/trade/spot')}
                          className="text-[#F0B90B] font-semibold hover:underline ml-1 cursor-pointer"
                        >
                          Go to Spot Terminal
                        </button>
                      </td>
                    </tr>
                  ) : (
                    openOrders.map((ord) => (
                      <tr key={ord.id} className="hover:bg-[var(--bg-hover)]">
                        <td className="py-3.5 px-4">
                          <div className="text-[var(--text-primary)]">{ord.createdAt}</div>
                          <div className="text-[11px] text-[var(--text-muted)]">{ord.id}</div>
                        </td>
                        <td className="py-3.5 px-4 font-sans font-bold text-[var(--text-primary)]">
                          {ord.pair}{' '}
                          <span className="font-normal text-[var(--text-muted)]">
                            · {ord.marketType}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-sans text-[var(--text-secondary)]">
                          {ord.type}
                        </td>
                        <td
                          className={`py-3.5 px-4 font-sans font-bold ${
                            ord.side === 'Buy' ? 'text-[#0ECB81]' : 'text-[#F6465D]'
                          }`}
                        >
                          {ord.side}
                        </td>
                        <td className="py-3.5 px-4 text-right">{formatPrice(ord.price)}</td>
                        <td className="py-3.5 px-4 text-right">{ord.amount}</td>
                        <td className="py-3.5 px-4 text-right">
                          {ord.filled} ({((ord.filled / ord.amount) * 100).toFixed(0)}%)
                        </td>
                        <td className="py-3.5 px-4 text-right font-semibold">
                          ${ord.total.toFixed(2)}
                        </td>
                        <td className="py-3.5 px-4 text-right font-sans">
                          <button
                            onClick={() => cancelOrder(ord.id)}
                            className="inline-flex items-center gap-1 text-[#F6465D] hover:underline font-semibold cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            Cancel
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}

            {initialTab === 'history' && (
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-[var(--border-color)] text-[11px] text-[var(--text-muted)]">
                    <th className="py-3.5 px-4">Date / Order ID</th>
                    <th className="py-3.5 px-4">Pair / Market</th>
                    <th className="py-3.5 px-4">Type</th>
                    <th className="py-3.5 px-4">Side</th>
                    <th className="py-3.5 px-4 text-right">Price</th>
                    <th className="py-3.5 px-4 text-right">Filled / Amount</th>
                    <th className="py-3.5 px-4 text-right">Total (USDT)</th>
                    <th className="py-3.5 px-4 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-color)]/60 font-mono-num">
                  {historyOrders.map((ord) => (
                    <tr key={ord.id} className="hover:bg-[var(--bg-hover)]">
                      <td className="py-3.5 px-4">
                        <div className="text-[var(--text-primary)]">{ord.createdAt}</div>
                        <div className="text-[11px] text-[var(--text-muted)]">{ord.id}</div>
                      </td>
                      <td className="py-3.5 px-4 font-sans font-bold text-[var(--text-primary)]">
                        {ord.pair} · {ord.marketType}
                      </td>
                      <td className="py-3.5 px-4 font-sans">{ord.type}</td>
                      <td
                        className={`py-3.5 px-4 font-sans font-bold ${
                          ord.side === 'Buy' ? 'text-[#0ECB81]' : 'text-[#F6465D]'
                        }`}
                      >
                        {ord.side}
                      </td>
                      <td className="py-3.5 px-4 text-right">{formatPrice(ord.price)}</td>
                      <td className="py-3.5 px-4 text-right">
                        {ord.filled} / {ord.amount}
                      </td>
                      <td className="py-3.5 px-4 text-right font-semibold">
                        ${ord.total.toFixed(2)}
                      </td>
                      <td
                        className={`py-3.5 px-4 text-right font-sans font-bold ${
                          ord.status === 'Filled'
                            ? 'text-[#0ECB81]'
                            : ord.status === 'Open'
                            ? 'text-[#F0B90B]'
                            : 'text-[var(--text-muted)]'
                        }`}
                      >
                        {ord.status}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {initialTab === 'trades' && (
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-[var(--border-color)] text-[11px] text-[var(--text-muted)]">
                    <th className="py-3.5 px-4">Execution Time / ID</th>
                    <th className="py-3.5 px-4">Pair</th>
                    <th className="py-3.5 px-4">Side / Role</th>
                    <th className="py-3.5 px-4 text-right">Executed Price</th>
                    <th className="py-3.5 px-4 text-right">Quantity</th>
                    <th className="py-3.5 px-4 text-right">Trading Fee</th>
                    <th className="py-3.5 px-4 text-right">Executed Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-color)]/60 font-mono-num">
                  {filteredTrades.map((tr) => (
                    <tr key={tr.id} className="hover:bg-[var(--bg-hover)]">
                      <td className="py-3.5 px-4">
                        <div className="text-[var(--text-primary)]">{tr.timestamp}</div>
                        <div className="text-[11px] text-[var(--text-muted)]">
                          {tr.id} (Order {tr.orderId})
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-sans font-bold text-[var(--text-primary)]">
                        {tr.pair}
                      </td>
                      <td
                        className={`py-3.5 px-4 font-sans font-bold ${
                          tr.side === 'Buy' ? 'text-[#0ECB81]' : 'text-[#F6465D]'
                        }`}
                      >
                        {tr.side} · {tr.role}
                      </td>
                      <td className="py-3.5 px-4 text-right">{formatPrice(tr.price)}</td>
                      <td className="py-3.5 px-4 text-right">{tr.amount}</td>
                      <td className="py-3.5 px-4 text-right text-[var(--text-muted)]">
                        {tr.fee} {tr.feeAsset}
                      </td>
                      <td className="py-3.5 px-4 text-right font-semibold text-[var(--text-primary)]">
                        ${tr.total.toFixed(2)} USDT
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
