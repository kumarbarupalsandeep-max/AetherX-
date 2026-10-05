import React, { useState } from 'react';
import { ShieldCheck, CheckCircle2, Clock, Filter, AlertCircle } from 'lucide-react';
import { useExchange } from '../context/ExchangeContext';
import { P2P_ADVERTS } from '../data/exchangeData';
import { P2PAdvert } from '../types/exchange';

export const P2PPage: React.FC = () => {
  const { isAuthenticated, openAuthModal, depositAsset, pushToast } = useExchange();

  const [side, setSide] = useState<'Buy' | 'Sell'>('Buy');
  const [selectedAsset, setSelectedAsset] = useState<'USDT' | 'BTC' | 'ETH' | 'USDC'>('USDT');
  const [selectedFiat, setSelectedFiat] = useState<'ALL' | 'USD' | 'INR' | 'EUR'>('ALL');
  const [selectedPayment, setSelectedPayment] = useState<string>('All Payments');
  const [activeOrderModal, setActiveOrderModal] = useState<P2PAdvert | null>(null);
  const [fiatInputAmount, setFiatInputAmount] = useState<string>('500');

  const filteredAdverts = P2P_ADVERTS.filter((ad) => {
    if (ad.side !== side) return false;
    if (selectedFiat !== 'ALL' && ad.fiat !== selectedFiat) return false;
    if (
      selectedPayment !== 'All Payments' &&
      !ad.paymentMethods.some((pm) => pm.toLowerCase().includes(selectedPayment.toLowerCase()))
    ) {
      return false;
    }
    return true;
  });

  const handleOpenAdvert = (ad: P2PAdvert) => {
    if (!isAuthenticated) {
      openAuthModal('login');
      return;
    }
    setFiatInputAmount(ad.minLimit.toString());
    setActiveOrderModal(ad);
  };

  const handleConfirmP2POrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeOrderModal) return;
    const fiatAmt = parseFloat(fiatInputAmount) || activeOrderModal.minLimit;
    const cryptoAmt = Number((fiatAmt / activeOrderModal.price).toFixed(2));

    if (side === 'Buy') {
      depositAsset(selectedAsset, cryptoAmt, `P2P Escrow (${activeOrderModal.merchantName})`);
    } else {
      pushToast({
        type: 'success',
        title: 'P2P Sell Escrow Created',
        description: `${cryptoAmt} ${selectedAsset} locked in escrow for ${activeOrderModal.merchantName}. Awaiting fiat release.`,
      });
    }
    setActiveOrderModal(null);
  };

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] py-8 px-4 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Top Banner */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-[var(--border-color)]">
          <div>
            <div className="text-xs font-semibold text-[#0ECB81] mb-1">
              ESCROW PROTECTED · 0% TRANSACTION FEE
            </div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-[var(--text-primary)]">
              P2P Peer-to-Peer Marketplace
            </h1>
            <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-1">
              Buy and sell crypto directly with verified OTC merchants using local bank transfers, UPI, IMPS, SEPA, and Zelle.
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs text-[var(--text-secondary)]">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[#0ECB81]" />
              24/7 Escrow Protection
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-[#F0B90B]" />
              Avg Release &lt; 2 Mins
            </span>
          </div>
        </div>

        {/* Filter Controls Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 bg-[var(--bg-secondary)] p-3.5 rounded-xl border border-[var(--border-color)]">
          <div className="flex flex-wrap items-center gap-3">
            {/* Buy / Sell Toggle */}
            <div className="grid grid-cols-2 p-1 bg-[var(--bg-primary)] rounded-lg border border-[var(--border-color)]">
              <button
                onClick={() => setSide('Buy')}
                className={`px-4 py-1.5 rounded-md text-xs font-bold transition-colors cursor-pointer ${
                  side === 'Buy'
                    ? 'bg-[#0ECB81] text-white'
                    : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                }`}
              >
                Buy
              </button>
              <button
                onClick={() => setSide('Sell')}
                className={`px-4 py-1.5 rounded-md text-xs font-bold transition-colors cursor-pointer ${
                  side === 'Sell'
                    ? 'bg-[#F6465D] text-white'
                    : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                }`}
              >
                Sell
              </button>
            </div>

            {/* Asset Selector */}
            <div className="flex items-center gap-1">
              {(['USDT', 'BTC', 'ETH', 'USDC'] as const).map((asset) => (
                <button
                  key={asset}
                  onClick={() => setSelectedAsset(asset)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                    selectedAsset === asset
                      ? 'bg-[#F0B90B]/15 text-[#F0B90B] border border-[#F0B90B]'
                      : 'text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]'
                  }`}
                >
                  {asset}
                </button>
              ))}
            </div>
          </div>

          {/* Fiat & Payment Filters */}
          <div className="flex flex-wrap items-center gap-2.5 text-xs">
            <select
              value={selectedFiat}
              onChange={(e) => setSelectedFiat(e.target.value as any)}
              className="px-3 py-2 rounded-lg bg-[var(--bg-primary)] border border-[var(--border-color)] text-[var(--text-primary)] font-semibold focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Currencies (USD / INR / EUR)</option>
              <option value="USD">USD ($)</option>
              <option value="INR">INR (₹)</option>
              <option value="EUR">EUR (€)</option>
            </select>

            <select
              value={selectedPayment}
              onChange={(e) => setSelectedPayment(e.target.value)}
              className="px-3 py-2 rounded-lg bg-[var(--bg-primary)] border border-[var(--border-color)] text-[var(--text-primary)] font-semibold focus:outline-none cursor-pointer"
            >
              <option value="All Payments">All Payment Methods</option>
              <option value="Bank Transfer">Bank Transfer</option>
              <option value="UPI">UPI / IMPS</option>
              <option value="Zelle">Zelle</option>
              <option value="SEPA">SEPA Instant</option>
              <option value="Revolut">Revolut / Wise</option>
            </select>
          </div>
        </div>

        {/* Merchant Adverts Table */}
        <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[var(--border-color)] text-[11px] font-medium text-[var(--text-muted)]">
                  <th className="py-3.5 px-4">Advertiser (Completion Rate)</th>
                  <th className="py-3.5 px-4">Price</th>
                  <th className="py-3.5 px-4">Available / Order Limit</th>
                  <th className="py-3.5 px-4">Payment Methods</th>
                  <th className="py-3.5 px-4 text-right">Trade (0% Fee)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-color)]/60 text-xs">
                {filteredAdverts.map((ad) => (
                  <tr key={ad.id} className="hover:bg-[var(--bg-hover)] transition-colors">
                    <td className="py-4 px-4">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#F0B90B]/20 text-[#F0B90B] font-bold flex items-center justify-center shrink-0">
                          {ad.merchantName.slice(0, 1)}
                        </div>
                        <div>
                          <div className="font-bold text-sm text-[var(--text-primary)] flex items-center gap-1.5">
                            {ad.merchantName}
                            {ad.verified && (
                              <CheckCircle2 className="w-4 h-4 text-[#F0B90B]" title="Verified Merchant" />
                            )}
                          </div>
                          <div className="text-[11px] text-[var(--text-muted)] font-mono-num mt-0.5">
                            {ad.completedOrders.toLocaleString()} orders · {ad.completionRate}% completion · ⏱{' '}
                            {ad.avgReleaseMinutes}m release
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-4">
                      <div className="text-lg font-bold font-mono-num text-[var(--text-primary)]">
                        {ad.fiatSymbol}
                        {ad.price.toFixed(ad.fiat === 'INR' ? 2 : 3)}{' '}
                        <span className="text-xs font-normal text-[var(--text-muted)]">
                          {ad.fiat}
                        </span>
                      </div>
                    </td>

                    <td className="py-4 px-4 font-mono-num">
                      <div className="text-[var(--text-primary)]">
                        <span className="text-[var(--text-muted)] font-sans">Available: </span>
                        {ad.available.toLocaleString()} {selectedAsset}
                      </div>
                      <div className="text-[var(--text-secondary)] mt-0.5">
                        <span className="text-[var(--text-muted)] font-sans">Limit: </span>
                        {ad.fiatSymbol}
                        {ad.minLimit.toLocaleString()} - {ad.fiatSymbol}
                        {ad.maxLimit.toLocaleString()}
                      </div>
                    </td>

                    <td className="py-4 px-4">
                      <div className="flex flex-wrap gap-2">
                        {ad.paymentMethods.map((pm) => (
                          <span
                            key={pm}
                            className="text-[11px] font-medium text-[var(--text-secondary)] border-l-2 border-[#F0B90B] pl-2"
                          >
                            {pm}
                          </span>
                        ))}
                      </div>
                    </td>

                    <td className="py-4 px-4 text-right">
                      <button
                        onClick={() => handleOpenAdvert(ad)}
                        className={`px-5 py-2 rounded-lg font-bold text-xs text-white transition-opacity hover:opacity-90 cursor-pointer ${
                          side === 'Buy' ? 'bg-[#0ECB81]' : 'bg-[#F6465D]'
                        }`}
                      >
                        {side} {selectedAsset}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* P2P Escrow Order Modal */}
      {activeOrderModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="w-full max-w-md bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border-color)]">
              <div>
                <div className="text-sm font-bold text-[var(--text-primary)]">
                  {side} {selectedAsset} from {activeOrderModal.merchantName}
                </div>
                <div className="text-xs text-[var(--text-muted)] font-mono-num">
                  Price: {activeOrderModal.fiatSymbol}
                  {activeOrderModal.price} {activeOrderModal.fiat} · Escrow Protected
                </div>
              </div>
              <button
                onClick={() => setActiveOrderModal(null)}
                className="text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)]"
              >
                Close
              </button>
            </div>

            <form onSubmit={handleConfirmP2POrder} className="space-y-4">
              <div>
                <label className="block text-xs text-[var(--text-muted)] mb-1">
                  Enter Fiat Amount ({activeOrderModal.fiat})
                </label>
                <input
                  type="number"
                  step="any"
                  required
                  min={activeOrderModal.minLimit}
                  max={activeOrderModal.maxLimit}
                  value={fiatInputAmount}
                  onChange={(e) => setFiatInputAmount(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg bg-[var(--bg-primary)] border border-[var(--border-color)] font-mono-num text-sm text-[var(--text-primary)] focus:outline-none focus:border-[#F0B90B]"
                />
              </div>

              <div className="p-3 rounded-lg bg-[var(--bg-primary)] border border-[var(--border-color)] flex justify-between text-xs">
                <span className="text-[var(--text-muted)]">You Receive in Spot Wallet</span>
                <span className="font-mono-num font-bold text-[#0ECB81]">
                  {((parseFloat(fiatInputAmount) || 0) / activeOrderModal.price).toFixed(2)}{' '}
                  {selectedAsset}
                </span>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveOrderModal(null)}
                  className="flex-1 py-2.5 rounded-lg border border-[var(--border-color)] text-xs font-semibold text-[var(--text-secondary)]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`flex-1 py-2.5 rounded-lg text-xs font-bold text-white cursor-pointer ${
                    side === 'Buy' ? 'bg-[#0ECB81]' : 'bg-[#F6465D]'
                  }`}
                >
                  Confirm {side} Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
