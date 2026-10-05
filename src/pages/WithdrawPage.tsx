import React, { useState } from 'react';
import { ShieldCheck, Lock, AlertTriangle } from 'lucide-react';
import { useExchange } from '../context/ExchangeContext';

export const WithdrawPage: React.FC = () => {
  const { balances, isAuthenticated, openAuthModal, withdrawAsset, navigate } = useExchange();

  const [selectedAsset, setSelectedAsset] = useState<string>('USDT');
  const [selectedNetworkIdx, setSelectedNetworkIdx] = useState<number>(0);
  const [address, setAddress] = useState<string>('');
  const [amount, setAmount] = useState<string>('');

  const assetObj = balances.find((b) => b.asset === selectedAsset) || balances[0];
  const networkObj = assetObj.networks[selectedNetworkIdx] || assetObj.networks[0];

  const parsedAmount = parseFloat(amount) || 0;
  const receiveAmount = Math.max(0, parsedAmount - networkObj.fee);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!address.trim() || parsedAmount <= networkObj.fee) return;
    const ok = withdrawAsset(
      selectedAsset,
      parsedAmount,
      address.trim(),
      networkObj.name,
      networkObj.fee
    );
    if (ok) {
      setAmount('');
      setAddress('');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-[var(--bg-primary)] text-[var(--text-primary)] flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl p-8 text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-[#F0B90B]/15 text-[#F0B90B] flex items-center justify-center mx-auto">
            <Lock className="w-6 h-6" />
          </div>
          <h1 className="font-display text-2xl font-bold text-[var(--text-primary)]">
            Authentication Required for Withdrawals
          </h1>
          <p className="text-xs text-[var(--text-muted)] leading-relaxed">
            Sign in with your 2FA-enabled account to broadcast on-chain crypto withdrawals.
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
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-4">
          <div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-[var(--text-primary)]">
              Withdraw Crypto
            </h1>
            <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-1">
              Send digital assets on-chain with hardware Passkey & 2FA protection.
            </p>
          </div>
          <button
            onClick={() => navigate('/wallet')}
            className="text-xs font-semibold text-[#F0B90B] hover:underline cursor-pointer"
          >
            Back to Wallet Overview
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl p-6 space-y-5"
        >
          {/* Select Asset */}
          <div>
            <label className="block text-xs font-bold text-[var(--text-secondary)] mb-2">
              1. Select Coin
            </label>
            <div className="flex flex-wrap gap-2">
              {balances.map((b) => (
                <button
                  key={b.asset}
                  type="button"
                  onClick={() => {
                    setSelectedAsset(b.asset);
                    setSelectedNetworkIdx(0);
                  }}
                  className={`px-4 py-2 rounded-lg text-xs font-bold border transition-colors cursor-pointer ${
                    selectedAsset === b.asset
                      ? 'border-[#F0B90B] bg-[#F0B90B]/15 text-[#F0B90B]'
                      : 'border-[var(--border-color)] bg-[var(--bg-primary)] text-[var(--text-primary)]'
                  }`}
                >
                  {b.asset} ({b.available})
                </button>
              ))}
            </div>
          </div>

          {/* Recipient Address */}
          <div>
            <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1.5">
              2. Recipient Wallet Address
            </label>
            <input
              type="text"
              required
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder={`Enter ${selectedAsset} recipient address (e.g. ${networkObj.depositAddress.slice(0, 14)}...)`}
              className="w-full px-3.5 py-2.5 rounded-lg bg-[var(--bg-primary)] border border-[var(--border-color)] font-mono-num text-xs text-[var(--text-primary)] focus:outline-none focus:border-[#F0B90B]"
            />
          </div>

          {/* Network Selection */}
          <div>
            <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1.5">
              3. Transfer Network
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {assetObj.networks.map((net, idx) => (
                <button
                  key={net.code}
                  type="button"
                  onClick={() => setSelectedNetworkIdx(idx)}
                  className={`p-3 rounded-lg border text-left transition-colors cursor-pointer ${
                    selectedNetworkIdx === idx
                      ? 'border-[#F0B90B] bg-[#F0B90B]/10'
                      : 'border-[var(--border-color)] bg-[var(--bg-primary)]'
                  }`}
                >
                  <div className="flex justify-between text-xs font-bold text-[var(--text-primary)]">
                    <span>{net.name}</span>
                    <span className="font-mono-num text-[var(--text-muted)]">
                      Fee: {net.fee} {selectedAsset}
                    </span>
                  </div>
                  <div className="text-[11px] text-[var(--text-muted)] mt-0.5">
                    Arrival {net.arrivalTime} · Min {net.minWithdraw} {selectedAsset}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Withdrawal Amount */}
          <div>
            <div className="flex justify-between text-xs mb-1.5">
              <label className="font-bold text-[var(--text-secondary)]">
                4. Withdrawal Amount
              </label>
              <span className="text-[var(--text-muted)] font-mono-num">
                Available: {assetObj.available} {selectedAsset}{' '}
                <button
                  type="button"
                  onClick={() => setAmount(assetObj.available.toString())}
                  className="text-[#F0B90B] font-bold ml-1 hover:underline cursor-pointer"
                >
                  MAX
                </button>
              </span>
            </div>
            <input
              type="number"
              step="any"
              required
              min={networkObj.minWithdraw}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder={`Minimum ${networkObj.minWithdraw} ${selectedAsset}`}
              className="w-full px-3.5 py-2.5 rounded-lg bg-[var(--bg-primary)] border border-[var(--border-color)] font-mono-num text-sm text-[var(--text-primary)] focus:outline-none focus:border-[#F0B90B]"
            />
          </div>

          {/* Summary Footer */}
          <div className="p-4 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-color)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="text-xs text-[var(--text-muted)]">Receive Amount (After Network Fee)</div>
              <div className="text-xl font-bold font-mono-num text-[var(--text-primary)] mt-0.5">
                {receiveAmount.toFixed(4)} {selectedAsset}
              </div>
              <div className="text-[11px] text-[var(--text-muted)] font-mono-num">
                Network Fee: {networkObj.fee} {selectedAsset}
              </div>
            </div>
            <button
              type="submit"
              className="px-6 py-3 rounded-lg bg-[#F0B90B] hover:bg-[#FCD535] text-[#181A20] font-bold text-xs cursor-pointer"
            >
              Withdraw {selectedAsset}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
