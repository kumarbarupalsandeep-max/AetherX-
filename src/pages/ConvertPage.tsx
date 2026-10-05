import React, { useState, useMemo } from 'react';
import { ArrowDownUp, Zap, ShieldCheck, CheckCircle2, RefreshCw } from 'lucide-react';
import { useExchange } from '../context/ExchangeContext';
import { formatPrice } from '../data/exchangeData';

export const ConvertPage: React.FC = () => {
  const { tickers, balances, isAuthenticated, openAuthModal, convertCrypto, navigate } =
    useExchange();

  const [mode, setMode] = useState<'Instant' | 'Limit'>('Instant');
  const [fromAsset, setFromAsset] = useState<string>('USDT');
  const [toAsset, setToAsset] = useState<string>('BTC');
  const [fromAmount, setFromAmount] = useState<string>('1000');

  const assets = ['USDT', 'USDC', 'BTC', 'ETH', 'SOL', 'BNB', 'XRP', 'ADA', 'AVAX', 'LINK', 'SUI'];

  const getUSDPrice = (symbol: string) => {
    if (symbol === 'USDT' || symbol === 'USDC') return 1.0;
    const found = tickers.find((t) => t.baseAsset === symbol);
    return found ? found.price : 1.0;
  };

  const fromPriceUSD = getUSDPrice(fromAsset);
  const toPriceUSD = getUSDPrice(toAsset);
  const conversionRate = toPriceUSD > 0 ? fromPriceUSD / toPriceUSD : 1;

  const parsedFrom = parseFloat(fromAmount) || 0;
  const estimatedToAmount = parsedFrom * conversionRate;

  const availableFromBalance = useMemo(() => {
    return balances.find((b) => b.asset === fromAsset)?.available || 0;
  }, [balances, fromAsset]);

  const handleSwapDirection = () => {
    setFromAsset(toAsset);
    setToAsset(fromAsset);
  };

  const handleExecuteConvert = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      openAuthModal('login');
      return;
    }
    if (parsedFrom <= 0) return;
    convertCrypto(fromAsset, toAsset, parsedFrom, estimatedToAmount);
  };

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] py-10 px-4 lg:px-8">
      <div className="max-w-xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-[#0ECB81]">
            <Zap className="w-3.5 h-3.5" />
            ZERO TRADING FEES · GUARANTEED INSTITUTIONAL QUOTE
          </div>
          <h1 className="font-display text-3xl font-bold text-[var(--text-primary)]">
            AetherX Convert & Block Portal
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-muted)]">
            Swap between any supported digital assets in one click with zero slippage and instant settlement.
          </p>
        </div>

        {/* Convert Card */}
        <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl p-6 shadow-xl space-y-5">
          {/* Mode Switcher */}
          <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-3">
            <div className="flex items-center gap-4">
              {(['Instant', 'Limit'] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMode(m)}
                  className={`text-xs font-bold pb-2 -mb-3.5 border-b-2 transition-colors cursor-pointer ${
                    mode === m
                      ? 'border-[#F0B90B] text-[#F0B90B]'
                      : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  {m} Convert
                </button>
              ))}
            </div>
            <button
              onClick={() => navigate('/trade-history')}
              className="text-xs text-[var(--text-muted)] hover:text-[#F0B90B] cursor-pointer"
            >
              Convert History
            </button>
          </div>

          <form onSubmit={handleExecuteConvert} className="space-y-3">
            {/* From Box */}
            <div className="p-4 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-color)] focus-within:border-[#F0B90B]">
              <div className="flex items-center justify-between text-xs text-[var(--text-muted)] mb-2">
                <span>From</span>
                <span>
                  Available:{' '}
                  <strong className="font-mono-num text-[var(--text-primary)]">
                    {availableFromBalance.toLocaleString()} {fromAsset}
                  </strong>
                  <button
                    type="button"
                    onClick={() => setFromAmount(availableFromBalance.toString())}
                    className="ml-2 text-[#F0B90B] font-semibold hover:underline cursor-pointer"
                  >
                    MAX
                  </button>
                </span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <input
                  type="number"
                  step="any"
                  required
                  value={fromAmount}
                  onChange={(e) => setFromAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full bg-transparent text-2xl font-bold font-mono-num text-[var(--text-primary)] focus:outline-none"
                />
                <select
                  value={fromAsset}
                  onChange={(e) => setFromAsset(e.target.value)}
                  className="px-3 py-2 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-color)] text-xs font-bold text-[var(--text-primary)] focus:outline-none cursor-pointer"
                >
                  {assets.map((a) => (
                    <option key={a} value={a}>
                      {a}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Swap Direction Button */}
            <div className="flex justify-center -my-1.5 relative z-10">
              <button
                type="button"
                onClick={handleSwapDirection}
                className="p-2.5 rounded-full bg-[var(--bg-elevated)] hover:bg-[#F0B90B] hover:text-[#181A20] border border-[var(--border-color)] text-[var(--text-primary)] transition-colors cursor-pointer"
                title="Reverse Pair"
              >
                <ArrowDownUp className="w-4 h-4" />
              </button>
            </div>

            {/* To Box */}
            <div className="p-4 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-color)]">
              <div className="flex items-center justify-between text-xs text-[var(--text-muted)] mb-2">
                <span>To (Receive Guaranteed)</span>
                <span className="text-[#0ECB81] font-medium">0% Trading Fee</span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <div className="text-2xl font-bold font-mono-num text-[var(--text-primary)]">
                  {estimatedToAmount > 0
                    ? estimatedToAmount < 1
                      ? estimatedToAmount.toFixed(6)
                      : estimatedToAmount.toFixed(4)
                    : '0.0000'}
                </div>
                <select
                  value={toAsset}
                  onChange={(e) => setToAsset(e.target.value)}
                  className="px-3 py-2 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-color)] text-xs font-bold text-[#F0B90B] focus:outline-none cursor-pointer"
                >
                  {assets
                    .filter((a) => a !== fromAsset)
                    .map((a) => (
                      <option key={a} value={a}>
                        {a}
                      </option>
                    ))}
                </select>
              </div>
            </div>

            {/* Rate Breakdown */}
            <div className="p-3.5 rounded-xl bg-[var(--bg-primary)]/50 border border-[var(--border-color)] space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-[var(--text-muted)]">Exchange Rate</span>
                <span className="font-mono-num text-[var(--text-primary)] flex items-center gap-1.5">
                  1 {fromAsset} = {conversionRate < 0.01 ? conversionRate.toFixed(7) : conversionRate.toFixed(4)} {toAsset}
                  <RefreshCw className="w-3 h-3 text-[#F0B90B]" />
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--text-muted)]">Inverse Rate</span>
                <span className="font-mono-num text-[var(--text-secondary)]">
                  1 {toAsset} = {formatPrice(1 / Math.max(0.0000001, conversionRate))} {fromAsset}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--text-muted)]">Transaction Fee</span>
                <span className="text-[#0ECB81] font-semibold">0.00 USDT (Zero Fee)</span>
              </div>
            </div>

            {isAuthenticated ? (
              <button
                type="submit"
                className="w-full py-3.5 rounded-xl bg-[#F0B90B] hover:bg-[#FCD535] text-[#181A20] font-bold text-sm transition-colors cursor-pointer"
              >
                Convert {fromAsset} to {toAsset} Instantly
              </button>
            ) : (
              <button
                type="button"
                onClick={() => openAuthModal('login')}
                className="w-full py-3.5 rounded-xl bg-[#F0B90B] hover:bg-[#FCD535] text-[#181A20] font-bold text-sm transition-colors cursor-pointer"
              >
                Log In to Convert Crypto
              </button>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};
