import React, { useState, useMemo } from 'react';
import {
  CreditCard,
  ShieldCheck,
  Repeat,
  ArrowRight,
  Clock,
  CheckCircle2,
  Building2,
} from 'lucide-react';
import { useExchange } from '../context/ExchangeContext';
import { formatPrice } from '../data/exchangeData';

export const BuyCryptoPage: React.FC = () => {
  const { tickers, isAuthenticated, openAuthModal, depositAsset, navigate, pushToast } =
    useExchange();

  const [side, setSide] = useState<'Buy' | 'Sell'>('Buy');
  const [fiatCurrency, setFiatCurrency] = useState<'USD' | 'EUR' | 'INR' | 'GBP'>('USD');
  const [cryptoAsset, setCryptoAsset] = useState<'USDT' | 'BTC' | 'ETH' | 'SOL' | 'BNB'>('USDT');
  const [fiatAmount, setFiatAmount] = useState<string>('500');
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'applepay' | 'sepa' | 'p2p'>('card');
  const [recurringEnabled, setRecurringEnabled] = useState<boolean>(false);

  const fiatRates: Record<string, { symbol: string; rateToUSD: number }> = {
    USD: { symbol: '$', rateToUSD: 1 },
    EUR: { symbol: '€', rateToUSD: 1.085 },
    GBP: { symbol: '£', rateToUSD: 1.29 },
    INR: { symbol: '₹', rateToUSD: 0.0116 },
  };

  const assetPriceUSD = useMemo(() => {
    if (cryptoAsset === 'USDT') return 1.0;
    const found = tickers.find((t) => t.baseAsset === cryptoAsset);
    return found ? found.price : 1.0;
  }, [tickers, cryptoAsset]);

  const parsedFiat = parseFloat(fiatAmount) || 0;
  const usdEquivalent = parsedFiat * fiatRates[fiatCurrency].rateToUSD;
  const estimatedCrypto =
    assetPriceUSD > 0 ? (usdEquivalent * 0.992) / assetPriceUSD : 0;

  const handleAction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      openAuthModal('login');
      return;
    }
    if (parsedFiat <= 0) return;

    if (side === 'Buy') {
      depositAsset(cryptoAsset, Number(estimatedCrypto.toFixed(4)), `Fiat Gateway (${paymentMethod.toUpperCase()})`);
    } else {
      pushToast({
        type: 'success',
        title: `Fiat Sale Order Submitted`,
        description: `Sold ${estimatedCrypto.toFixed(4)} ${cryptoAsset} for ${fiatRates[fiatCurrency].symbol}${parsedFiat.toLocaleString()} ${fiatCurrency}.`,
      });
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] py-8 px-4 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Sub-navigation bar for Fiat & P2P Gateways */}
        <div className="flex items-center gap-6 border-b border-[var(--border-color)] pb-4 mb-8 text-sm font-semibold overflow-x-auto">
          <button className="text-[#F0B90B] border-b-2 border-[#F0B90B] pb-4 -mb-4 whitespace-nowrap">
            Buy & Sell (Card / Bank)
          </button>
          <button
            onClick={() => navigate('/p2p')}
            className="text-[var(--text-muted)] hover:text-[var(--text-primary)] whitespace-nowrap cursor-pointer"
          >
            P2P Trading (0% Fee)
          </button>
          <button
            onClick={() => navigate('/convert')}
            className="text-[var(--text-muted)] hover:text-[var(--text-primary)] whitespace-nowrap cursor-pointer"
          >
            Convert Crypto
          </button>
          <button
            onClick={() => navigate('/deposit')}
            className="text-[var(--text-muted)] hover:text-[var(--text-primary)] whitespace-nowrap cursor-pointer"
          >
            Deposit Crypto
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Left 7 Columns: Value Proposition + Hot Market Rates */}
          <div className="lg:col-span-7 space-y-8">
            <div className="space-y-3">
              <div className="text-xs font-semibold text-[#F0B90B]">
                INSTANT FIAT-TO-CRYPTO GATEWAY
              </div>
              <h1 className="font-display text-3xl sm:text-4xl font-bold text-[var(--text-primary)]">
                {side} {cryptoAsset} with {fiatCurrency} in Seconds
              </h1>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed max-w-xl">
                Purchase Bitcoin, Ethereum, Tether, and Solana directly using Visa, Mastercard, Apple Pay, SEPA Instant, or local bank transfer with real-time settlement to your Spot Wallet.
              </p>
            </div>

            {/* Supported Payment Channels */}
            <div className="space-y-3">
              <h3 className="text-xs font-semibold text-[var(--text-muted)]">
                SELECT PAYMENT CHANNEL
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {(
                  [
                    {
                      id: 'card',
                      title: 'Visa / Mastercard',
                      desc: 'Instant settlement · 3D Secure protected',
                      fee: '1.8% Fee',
                    },
                    {
                      id: 'applepay',
                      title: 'Apple Pay / Google Pay',
                      desc: 'One-tap biometric checkout',
                      fee: '1.5% Fee',
                    },
                    {
                      id: 'sepa',
                      title: 'Bank Transfer / SEPA / Wire',
                      desc: 'High daily limits up to $2,000,000',
                      fee: '0.1% Fee',
                    },
                    {
                      id: 'p2p',
                      title: 'P2P Express Merchant',
                      desc: 'UPI, IMPS, Zelle, Revolut, Wise',
                      fee: '0% Fee',
                    },
                  ] as const
                ).map((pm) => (
                  <button
                    key={pm.id}
                    type="button"
                    onClick={() => setPaymentMethod(pm.id)}
                    className={`p-4 rounded-xl border text-left transition-colors cursor-pointer ${
                      paymentMethod === pm.id
                        ? 'border-[#F0B90B] bg-[#F0B90B]/10'
                        : 'border-[var(--border-color)] bg-[var(--bg-secondary)] hover:bg-[var(--bg-hover)]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-bold text-[var(--text-primary)]">
                        {pm.title}
                      </span>
                      <span className="text-xs font-mono-num text-[#0ECB81] font-semibold">
                        {pm.fee}
                      </span>
                    </div>
                    <div className="text-xs text-[var(--text-muted)]">{pm.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Live Reference Conversion Table */}
            <div className="p-5 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-[var(--text-primary)]">
                  Live {cryptoAsset} Conversion Reference
                </h3>
                <span className="text-xs font-mono-num text-[var(--text-muted)]">
                  1 {cryptoAsset} ≈ ${formatPrice(assetPriceUSD)} USD
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                {[100, 500, 1000, 5000].map((amt) => {
                  const out =
                    ((amt * fiatRates[fiatCurrency].rateToUSD) / assetPriceUSD).toFixed(4);
                  return (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setFiatAmount(amt.toString())}
                      className="p-3 rounded-lg bg-[var(--bg-primary)] border border-[var(--border-color)] hover:border-[#F0B90B] text-left transition-colors cursor-pointer"
                    >
                      <div className="text-xs text-[var(--text-muted)]">
                        {fiatRates[fiatCurrency].symbol}
                        {amt.toLocaleString()} {fiatCurrency}
                      </div>
                      <div className="text-xs font-bold font-mono-num text-[var(--text-primary)] mt-1">
                        {out} {cryptoAsset}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right 5 Columns: Interactive Buy / Sell Widget Card */}
          <div className="lg:col-span-5">
            <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl overflow-hidden shadow-xl">
              {/* Buy / Sell Top Tabs */}
              <div className="grid grid-cols-2 border-b border-[var(--border-color)]">
                <button
                  type="button"
                  onClick={() => setSide('Buy')}
                  className={`py-4 text-sm font-bold transition-colors cursor-pointer ${
                    side === 'Buy'
                      ? 'bg-[var(--bg-secondary)] text-[#0ECB81] border-b-2 border-[#0ECB81]'
                      : 'bg-[var(--bg-primary)] text-[var(--text-muted)]'
                  }`}
                >
                  Buy Crypto
                </button>
                <button
                  type="button"
                  onClick={() => setSide('Sell')}
                  className={`py-4 text-sm font-bold transition-colors cursor-pointer ${
                    side === 'Sell'
                      ? 'bg-[var(--bg-secondary)] text-[#F6465D] border-b-2 border-[#F6465D]'
                      : 'bg-[var(--bg-primary)] text-[var(--text-muted)]'
                  }`}
                >
                  Sell Crypto
                </button>
              </div>

              <form onSubmit={handleAction} className="p-6 space-y-5">
                {/* Spend Input Box */}
                <div className="p-4 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-color)] focus-within:border-[#F0B90B]">
                  <div className="flex items-center justify-between text-xs text-[var(--text-muted)] mb-2">
                    <span>{side === 'Buy' ? 'You Spend' : 'You Receive (Est.)'}</span>
                    <span>Limit: 15 - 50,000 {fiatCurrency}</span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <input
                      type="number"
                      step="any"
                      required
                      value={fiatAmount}
                      onChange={(e) => setFiatAmount(e.target.value)}
                      placeholder="100.00"
                      className="w-full bg-transparent text-2xl font-bold font-mono-num text-[var(--text-primary)] focus:outline-none"
                    />
                    <select
                      value={fiatCurrency}
                      onChange={(e) => setFiatCurrency(e.target.value as any)}
                      className="px-3 py-1.5 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-color)] text-xs font-bold text-[var(--text-primary)] focus:outline-none cursor-pointer"
                    >
                      <option value="USD">USD ($)</option>
                      <option value="EUR">EUR (€)</option>
                      <option value="INR">INR (₹)</option>
                      <option value="GBP">GBP (£)</option>
                    </select>
                  </div>
                </div>

                {/* Receive Output Box */}
                <div className="p-4 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-color)]">
                  <div className="flex items-center justify-between text-xs text-[var(--text-muted)] mb-2">
                    <span>{side === 'Buy' ? 'You Receive (Estimated)' : 'You Sell'}</span>
                    <span className="font-mono-num">
                      1 {cryptoAsset} ≈ {(assetPriceUSD / fiatRates[fiatCurrency].rateToUSD).toFixed(2)}{' '}
                      {fiatCurrency}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <div className="text-2xl font-bold font-mono-num text-[var(--text-primary)]">
                      {estimatedCrypto.toFixed(4)}
                    </div>
                    <select
                      value={cryptoAsset}
                      onChange={(e) => setCryptoAsset(e.target.value as any)}
                      className="px-3 py-1.5 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-color)] text-xs font-bold text-[#F0B90B] focus:outline-none cursor-pointer"
                    >
                      <option value="USDT">USDT</option>
                      <option value="BTC">BTC</option>
                      <option value="ETH">ETH</option>
                      <option value="SOL">SOL</option>
                      <option value="BNB">BNB</option>
                    </select>
                  </div>
                </div>

                {/* Recurring Buy Toggle */}
                <div className="flex items-center justify-between py-2 px-3 rounded-lg bg-[var(--bg-primary)]/60 border border-[var(--border-color)] text-xs">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-[#F0B90B]" />
                    <span className="text-[var(--text-secondary)]">Auto-Invest Recurring Plan</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setRecurringEnabled((p) => !p)}
                    className={`px-2.5 py-1 rounded text-[11px] font-semibold cursor-pointer ${
                      recurringEnabled
                        ? 'bg-[#F0B90B] text-[#181A20]'
                        : 'bg-[var(--bg-elevated)] text-[var(--text-muted)]'
                    }`}
                  >
                    {recurringEnabled ? 'Weekly Active' : 'Enable'}
                  </button>
                </div>

                {/* Action Button */}
                {isAuthenticated ? (
                  <button
                    type="submit"
                    className={`w-full py-3.5 rounded-xl font-bold text-sm transition-opacity hover:opacity-95 cursor-pointer ${
                      side === 'Buy'
                        ? 'bg-[#F0B90B] text-[#181A20]'
                        : 'bg-[#F6465D] text-white'
                    }`}
                  >
                    {side} {cryptoAsset} Instantly
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => openAuthModal('login')}
                    className="w-full py-3.5 rounded-xl bg-[#F0B90B] hover:bg-[#FCD535] text-[#181A20] font-bold text-sm transition-colors cursor-pointer"
                  >
                    Log In / Sign Up to {side} {cryptoAsset}
                  </button>
                )}

                <div className="flex items-center justify-between text-[11px] text-[var(--text-muted)] pt-1">
                  <span className="flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#0ECB81]" />
                    PCI-DSS Level 1 Encrypted
                  </span>
                  <span>Instant Spot Wallet Credit</span>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
