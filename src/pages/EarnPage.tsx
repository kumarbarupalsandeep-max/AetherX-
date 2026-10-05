import React, { useState } from 'react';
import { ShieldCheck, TrendingUp, Layers, CheckCircle2 } from 'lucide-react';
import { useExchange } from '../context/ExchangeContext';
import { EARN_PRODUCTS } from '../data/exchangeData';
import { EarnProduct } from '../types/exchange';

export const EarnPage: React.FC = () => {
  const { balances, isAuthenticated, openAuthModal, subscribeEarn } = useExchange();
  const [filterTerm, setFilterTerm] = useState<'All' | 'Flexible' | 'Locked'>('All');
  const [activeProduct, setActiveProduct] = useState<EarnProduct | null>(null);
  const [stakeAmount, setStakeAmount] = useState<string>('100');

  const filteredProducts = EARN_PRODUCTS.filter((p) => {
    if (filterTerm === 'Flexible' && p.durationDays !== 'Flexible') return false;
    if (filterTerm === 'Locked' && p.durationDays === 'Flexible') return false;
    return true;
  });

  const handleOpenSubscribe = (prod: EarnProduct) => {
    if (!isAuthenticated) {
      openAuthModal('login');
      return;
    }
    setStakeAmount(prod.minAmount.toString());
    setActiveProduct(prod);
  };

  const handleConfirmStake = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeProduct) return;
    const amt = parseFloat(stakeAmount) || 0;
    if (amt <= 0) return;
    const ok = subscribeEarn(activeProduct.asset, amt, activeProduct.apr);
    if (ok) {
      setActiveProduct(null);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] py-8 px-4 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Hero Header */}
        <div className="p-6 sm:p-8 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-color)] flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="text-xs font-semibold text-[#0ECB81]">
              SIMPLE EARN · PRINCIPAL PROTECTED YIELD VAULTS
            </div>
            <h1 className="font-display text-2xl sm:text-4xl font-bold text-[var(--text-primary)]">
              Put Idle Crypto to Work — Up to <span className="text-[#0ECB81]">11.40% APR</span>
            </h1>
            <p className="text-xs sm:text-sm text-[var(--text-muted)] leading-relaxed">
              Deposit USDT, USDC, BTC, ETH, SOL, or BNB into Flexible or Fixed-Term vaults. Receive daily yield distributions and automatic HODLer Airdrop snapshots.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 shrink-0">
            <div className="p-4 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-color)]">
              <div className="text-xs text-[var(--text-muted)]">Total Value Staked</div>
              <div className="text-xl font-bold font-mono-num text-[var(--text-primary)] mt-1">
                $4.82B USDT
              </div>
            </div>
            <div className="p-4 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-color)]">
              <div className="text-xs text-[var(--text-muted)]">24h Rewards Paid</div>
              <div className="text-xl font-bold font-mono-num text-[#0ECB81] mt-1">
                +$1,142,900
              </div>
            </div>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-3">
          <div className="flex items-center gap-2">
            {(['All', 'Flexible', 'Locked'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setFilterTerm(t)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                  filterTerm === t
                    ? 'bg-[#F0B90B] text-[#181A20]'
                    : 'text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)]'
                }`}
              >
                {t} Products
              </button>
            ))}
          </div>
          <span className="text-xs text-[var(--text-muted)] hidden sm:inline">
            All subscriptions include 1:1 custody protection
          </span>
        </div>

        {/* Products Table */}
        <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[var(--border-color)] text-[11px] text-[var(--text-muted)]">
                  <th className="py-3.5 px-4">Asset / Vault</th>
                  <th className="py-3.5 px-4">Est. APR</th>
                  <th className="py-3.5 px-4">Duration</th>
                  <th className="py-3.5 px-4">Min Subscription</th>
                  <th className="py-3.5 px-4">Pool Utilization</th>
                  <th className="py-3.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-color)]/60">
                {filteredProducts.map((prod) => (
                  <tr key={prod.id} className="hover:bg-[var(--bg-hover)] transition-colors">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[var(--bg-elevated)] border border-[var(--border-color)] flex items-center justify-center font-bold text-[#F0B90B]">
                          {prod.asset.slice(0, 3)}
                        </div>
                        <div>
                          <div className="font-bold text-sm text-[var(--text-primary)]">
                            {prod.asset}{' '}
                            {prod.tag && (
                              <span className="text-[11px] font-normal text-[#F0B90B] ml-1.5">
                                · {prod.tag}
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-[var(--text-muted)]">{prod.name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4 font-mono-num text-base font-bold text-[#0ECB81]">
                      {prod.apr.toFixed(2)}%
                    </td>
                    <td className="py-4 px-4 font-mono-num font-semibold text-[var(--text-primary)]">
                      {prod.durationDays === 'Flexible'
                        ? 'Flexible (Instant Redeem)'
                        : `${prod.durationDays} Days Locked`}
                    </td>
                    <td className="py-4 px-4 font-mono-num text-[var(--text-secondary)]">
                      {prod.minAmount} {prod.asset}
                    </td>
                    <td className="py-4 px-4">
                      <div className="w-32 bg-[var(--bg-primary)] h-2 rounded-full overflow-hidden border border-[var(--border-color)]">
                        <div
                          style={{ width: `${prod.totalSubscribedPercent}%` }}
                          className="h-full bg-[#F0B90B]"
                        />
                      </div>
                      <div className="text-[10px] font-mono-num text-[var(--text-muted)] mt-1">
                        {prod.totalSubscribedPercent}% Subscribed
                      </div>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <button
                        onClick={() => handleOpenSubscribe(prod)}
                        className="px-4 py-2 rounded-lg bg-[#F0B90B] hover:bg-[#FCD535] text-[#181A20] font-bold text-xs cursor-pointer"
                      >
                        Subscribe
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Subscription Modal */}
      {activeProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="w-full max-w-md bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border-color)]">
              <div>
                <div className="text-sm font-bold text-[var(--text-primary)]">
                  Subscribe {activeProduct.asset} Simple Earn
                </div>
                <div className="text-xs text-[#0ECB81] font-mono-num">
                  Est. APR: {activeProduct.apr.toFixed(2)}% · Duration: {activeProduct.durationDays}
                </div>
              </div>
              <button
                onClick={() => setActiveProduct(null)}
                className="text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)]"
              >
                Close
              </button>
            </div>

            <form onSubmit={handleConfirmStake} className="space-y-4">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-[var(--text-muted)]">Subscription Amount</span>
                  <span className="font-mono-num text-[var(--text-secondary)]">
                    Available:{' '}
                    {balances.find((b) => b.asset === activeProduct.asset)?.available || 0}{' '}
                    {activeProduct.asset}
                  </span>
                </div>
                <input
                  type="number"
                  step="any"
                  required
                  min={activeProduct.minAmount}
                  value={stakeAmount}
                  onChange={(e) => setStakeAmount(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg bg-[var(--bg-primary)] border border-[var(--border-color)] font-mono-num text-sm text-[var(--text-primary)] focus:outline-none focus:border-[#F0B90B]"
                />
              </div>

              <div className="p-3 rounded-lg bg-[var(--bg-primary)] border border-[var(--border-color)] space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-[var(--text-muted)]">Est. Daily Yield</span>
                  <span className="font-mono-num text-[#0ECB81] font-semibold">
                    +{(((parseFloat(stakeAmount) || 0) * (activeProduct.apr / 100)) / 365).toFixed(5)}{' '}
                    {activeProduct.asset} / day
                  </span>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveProduct(null)}
                  className="flex-1 py-2.5 rounded-lg border border-[var(--border-color)] text-xs font-semibold text-[var(--text-secondary)]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-lg bg-[#F0B90B] hover:bg-[#FCD535] text-[#181A20] text-xs font-bold cursor-pointer"
                >
                  Confirm Stake
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
