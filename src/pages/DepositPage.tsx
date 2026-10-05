import React, { useState } from 'react';
import { Copy, CheckCircle2, ShieldCheck, ArrowRight, Lock } from 'lucide-react';
import { useExchange } from '../context/ExchangeContext';

export const DepositPage: React.FC = () => {
  const { balances, isAuthenticated, openAuthModal, depositAsset, pushToast, navigate } =
    useExchange();

  const [selectedAsset, setSelectedAsset] = useState<string>('USDT');
  const [selectedNetworkIdx, setSelectedNetworkIdx] = useState<number>(0);
  const [copied, setCopied] = useState(false);
  const [simAmount, setSimAmount] = useState<string>('1000');

  const assetObj = balances.find((b) => b.asset === selectedAsset) || balances[0];
  const networkObj = assetObj.networks[selectedNetworkIdx] || assetObj.networks[0];

  const handleCopyAddress = () => {
    navigator.clipboard?.writeText(networkObj.depositAddress);
    setCopied(true);
    pushToast({
      type: 'info',
      title: 'Deposit Address Copied',
      description: `${networkObj.name} address copied to clipboard.`,
    });
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-[var(--bg-primary)] text-[var(--text-primary)] flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl p-8 text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-[#F0B90B]/15 text-[#F0B90B] flex items-center justify-center mx-auto">
            <Lock className="w-6 h-6" />
          </div>
          <h1 className="font-display text-2xl font-bold text-[var(--text-primary)]">
            Log In to Generate Deposit Address
          </h1>
          <p className="text-xs text-[var(--text-muted)] leading-relaxed">
            For your security, unique multi-network deposit addresses and QR codes are assigned exclusively to authenticated accounts.
          </p>
          <button
            onClick={() => openAuthModal('login')}
            className="w-full py-3 rounded-lg bg-[#F0B90B] hover:bg-[#FCD535] text-[#181A20] font-bold text-xs cursor-pointer"
          >
            Log In / Register
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] py-8 px-4 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-4">
          <div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-[var(--text-primary)]">
              Deposit Crypto
            </h1>
            <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-1">
              Select coin and blockchain network to view your dedicated Spot Wallet deposit address.
            </p>
          </div>
          <button
            onClick={() => navigate('/wallet')}
            className="text-xs font-semibold text-[#F0B90B] hover:underline cursor-pointer"
          >
            Back to Wallet Overview
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left 7 Cols: Step-by-Step Deposit Configuration */}
          <div className="lg:col-span-7 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl p-6 space-y-6">
            {/* Step 1: Select Coin */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-[var(--text-secondary)]">
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
                        : 'border-[var(--border-color)] bg-[var(--bg-primary)] text-[var(--text-primary)] hover:bg-[var(--bg-hover)]'
                    }`}
                  >
                    {b.asset}
                  </button>
                ))}
              </div>
            </div>

            {/* Step 2: Select Network */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-[var(--text-secondary)]">
                2. Select Blockchain Network
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
                        : 'border-[var(--border-color)] bg-[var(--bg-primary)] hover:bg-[var(--bg-hover)]'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs font-bold text-[var(--text-primary)]">
                      <span>{net.code}</span>
                      <span className="text-[11px] font-mono-num text-[#0ECB81]">
                        {net.arrivalTime}
                      </span>
                    </div>
                    <div className="text-[11px] text-[var(--text-muted)] mt-0.5">{net.name}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Step 3: Deposit Address & Simulated On-Chain Confirmation */}
            <div className="space-y-3 pt-2 border-t border-[var(--border-color)]">
              <label className="block text-xs font-bold text-[var(--text-secondary)]">
                3. Deposit Address ({networkObj.name})
              </label>
              <div className="p-4 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-color)] flex items-center justify-between gap-3">
                <div className="font-mono-num text-xs sm:text-sm text-[var(--text-primary)] break-all">
                  {networkObj.depositAddress}
                </div>
                <button
                  type="button"
                  onClick={handleCopyAddress}
                  className="px-3 py-2 rounded-lg bg-[#F0B90B] hover:bg-[#FCD535] text-[#181A20] text-xs font-bold flex items-center gap-1.5 shrink-0 cursor-pointer"
                >
                  {copied ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copied ? 'Copied' : 'Copy'}
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs pt-2">
                <div className="flex justify-between">
                  <span className="text-[var(--text-muted)]">Expected Arrival</span>
                  <span className="font-mono-num text-[var(--text-primary)]">
                    {networkObj.arrivalTime}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--text-muted)]">Minimum Deposit</span>
                  <span className="font-mono-num text-[var(--text-primary)]">
                    {networkObj.minWithdraw} {selectedAsset}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right 5 Cols: Instant Testnet/Mainnet Credit Simulator + Network Tips */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl p-5 space-y-4">
              <div className="text-xs font-semibold text-[#0ECB81]">
                INSTANT ON-CHAIN CREDIT SIMULATOR
              </div>
              <h3 className="text-sm font-bold text-[var(--text-primary)]">
                Test Live Wallet Credit ({selectedAsset})
              </h3>
              <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                Verify full-cycle deposit updates: credit {selectedAsset} directly to your Spot balance and immediately use it in Spot, Futures, or Simple Earn.
              </p>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  step="any"
                  value={simAmount}
                  onChange={(e) => setSimAmount(e.target.value)}
                  className="flex-1 px-3 py-2 rounded-lg bg-[var(--bg-primary)] border border-[var(--border-color)] font-mono-num text-xs text-[var(--text-primary)] focus:outline-none focus:border-[#F0B90B]"
                />
                <button
                  onClick={() =>
                    depositAsset(
                      selectedAsset,
                      parseFloat(simAmount) || 100,
                      networkObj.name
                    )
                  }
                  className="px-4 py-2 rounded-lg bg-[#0ECB81] text-white text-xs font-bold hover:opacity-90 cursor-pointer whitespace-nowrap"
                >
                  Confirm Deposit
                </button>
              </div>
            </div>

            <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl p-5 space-y-2 text-xs text-[var(--text-muted)]">
              <div className="font-bold text-[var(--text-primary)] flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#F0B90B]" />
                Network Verification Notice
              </div>
              <p className="leading-relaxed">
                Ensure the sending platform uses the <strong>{networkObj.name}</strong> network. Sending assets via an unsupported chain may result in permanent loss.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
