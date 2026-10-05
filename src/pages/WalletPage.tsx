import React, { useState } from 'react';
import {
  Wallet,
  Eye,
  EyeOff,
  ArrowDownLeft,
  ArrowUpRight,
  Repeat,
  Search,
  Lock,
  TrendingUp,
} from 'lucide-react';
import { useExchange } from '../context/ExchangeContext';

export const WalletPage: React.FC = () => {
  const { balances, tickers, isAuthenticated, openAuthModal, navigate } = useExchange();
  const [hideBalances, setHideBalances] = useState(false);
  const [hideSmall, setHideSmall] = useState(false);
  const [search, setSearch] = useState('');
  const [walletTab, setWalletTab] = useState<'Overview' | 'Spot' | 'Futures' | 'Earn'>('Overview');

  const btcPrice = tickers.find((t) => t.symbol === 'BTCUSDT')?.price || 0;
  const totalUSDT = balances.reduce((acc, b) => acc + b.usdtValuation, 0);
  const totalStakedUSDT = balances.reduce((acc, b) => {
    const p =
      b.asset === 'USDT' || b.asset === 'USDC'
        ? 1
        : tickers.find((t) => t.baseAsset === b.asset)?.price || 0;
    return acc + b.staked * p;
  }, 0);
  const totalInOrderUSDT = balances.reduce((acc, b) => {
    const p =
      b.asset === 'USDT' || b.asset === 'USDC'
        ? 1
        : tickers.find((t) => t.baseAsset === b.asset)?.price || 0;
    return acc + b.inOrder * p;
  }, 0);
  const totalAvailableUSDT = Math.max(0, totalUSDT - totalStakedUSDT - totalInOrderUSDT);

  const filteredBalances = balances.filter((b) => {
    if (hideSmall && b.usdtValuation < 10) return false;
    if (
      search &&
      !b.asset.toLowerCase().includes(search.toLowerCase()) &&
      !b.name.toLowerCase().includes(search.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  if (!isAuthenticated) {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-[var(--bg-primary)] text-[var(--text-primary)] flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl p-8 text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-[#F0B90B]/15 text-[#F0B90B] flex items-center justify-center mx-auto">
            <Lock className="w-6 h-6" />
          </div>
          <h1 className="font-display text-2xl font-bold text-[var(--text-primary)]">
            Sign In to View Your Assets
          </h1>
          <p className="text-xs text-[var(--text-muted)] leading-relaxed">
            Access your Spot, USDⓈ-M Futures, and Simple Earn portfolio valuations, multi-network deposit addresses, and instant withdrawals.
          </p>
          <div className="flex gap-3 pt-2">
            <button
              onClick={() => openAuthModal('login')}
              className="flex-1 py-3 rounded-lg bg-[#F0B90B] hover:bg-[#FCD535] text-[#181A20] font-bold text-xs cursor-pointer"
            >
              Log In
            </button>
            <button
              onClick={() => openAuthModal('register')}
              className="flex-1 py-3 rounded-lg bg-[var(--bg-elevated)] hover:bg-[var(--bg-hover)] border border-[var(--border-color)] font-bold text-xs text-[var(--text-primary)] cursor-pointer"
            >
              Register
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] py-8 px-4 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Sub-Nav Tabs */}
        <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-3 flex-wrap gap-4">
          <div className="flex items-center gap-6 text-sm font-semibold overflow-x-auto">
            {(['Overview', 'Spot', 'Futures', 'Earn'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setWalletTab(tab)}
                className={`pb-3 -mb-3.5 transition-colors cursor-pointer whitespace-nowrap ${
                  walletTab === tab
                    ? 'text-[#F0B90B] border-b-2 border-[#F0B90B]'
                    : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                }`}
              >
                {tab} Wallet
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/deposit')}
              className="px-4 py-2 rounded-lg bg-[#F0B90B] hover:bg-[#FCD535] text-[#181A20] text-xs font-bold flex items-center gap-1.5 cursor-pointer"
            >
              <ArrowDownLeft className="w-3.5 h-3.5" />
              Deposit
            </button>
            <button
              onClick={() => navigate('/withdraw')}
              className="px-4 py-2 rounded-lg bg-[var(--bg-secondary)] hover:bg-[var(--bg-hover)] border border-[var(--border-color)] text-xs font-semibold text-[var(--text-primary)] flex items-center gap-1.5 cursor-pointer"
            >
              <ArrowUpRight className="w-3.5 h-3.5" />
              Withdraw
            </button>
            <button
              onClick={() => navigate('/convert')}
              className="px-4 py-2 rounded-lg bg-[var(--bg-secondary)] hover:bg-[var(--bg-hover)] border border-[var(--border-color)] text-xs font-semibold text-[var(--text-primary)] flex items-center gap-1.5 cursor-pointer"
            >
              <Repeat className="w-3.5 h-3.5" />
              Convert
            </button>
          </div>
        </div>

        {/* Portfolio Valuation Summary Card */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 p-6 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] flex flex-col justify-between space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs text-[var(--text-muted)] font-medium">
                <span>Estimated Total Balance</span>
                <button
                  onClick={() => setHideBalances((p) => !p)}
                  className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer"
                  aria-label="Toggle balance visibility"
                >
                  {hideBalances ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <span className="text-xs text-[#0ECB81] font-mono-num font-semibold">
                Real-Time Database Ledger Valuation
              </span>
            </div>

            <div>
              <div className="text-3xl sm:text-4xl font-bold font-mono-num text-[var(--text-primary)]">
                {hideBalances
                  ? '•••••••• USDT'
                  : `${totalUSDT.toLocaleString('en-US', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })} USDT`}
              </div>
              <div className="text-xs font-mono-num text-[var(--text-muted)] mt-1">
                {hideBalances
                  ? '≈ •••••••• BTC'
                  : btcPrice > 0
                  ? `≈ ${(totalUSDT / btcPrice).toFixed(6)} BTC`
                  : 'Fetching live BTC rate...'}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-[var(--border-color)] text-xs">
              <div>
                <div className="text-[var(--text-muted)]">Spot Available</div>
                <div className="font-mono-num font-bold text-[var(--text-primary)] mt-0.5">
                  {hideBalances
                    ? '••••••'
                    : `$${totalAvailableUSDT.toLocaleString('en-US', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}`}
                </div>
              </div>
              <div>
                <div className="text-[var(--text-muted)]">Simple Earn Staked</div>
                <div className="font-mono-num font-bold text-[#0ECB81] mt-0.5">
                  {hideBalances
                    ? '••••••'
                    : `$${totalStakedUSDT.toLocaleString('en-US', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}`}
                </div>
              </div>
              <div>
                <div className="text-[var(--text-muted)]">In Open Orders</div>
                <div className="font-mono-num font-bold text-[#F0B90B] mt-0.5">
                  {hideBalances
                    ? '••••••'
                    : `$${totalInOrderUSDT.toLocaleString('en-US', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}`}
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-4 p-6 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] flex flex-col justify-between space-y-4">
            <div>
              <div className="text-xs font-semibold text-[#F0B90B]">YIELD OPTIMIZATION</div>
              <h3 className="text-base font-bold text-[var(--text-primary)] mt-1">
                Auto-Subscribe Idle USDT & SOL
              </h3>
              <p className="text-xs text-[var(--text-muted)] mt-1 leading-relaxed">
                Activate Flexible Simple Earn on your Spot balances to earn up to 9.80% APR paid daily with instant redemption.
              </p>
            </div>
            <button
              onClick={() => navigate('/earn')}
              className="w-full py-2.5 rounded-lg bg-[var(--bg-elevated)] hover:bg-[var(--bg-hover)] border border-[var(--border-color)] text-xs font-bold text-[#F0B90B] cursor-pointer"
            >
              Manage Simple Earn Vaults
            </button>
          </div>
        </div>

        {/* Asset Holdings Table */}
        <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl overflow-hidden">
          <div className="p-4 border-b border-[var(--border-color)] flex flex-wrap items-center justify-between gap-4">
            <h2 className="text-sm font-bold text-[var(--text-primary)]">Asset Holdings</h2>
            <div className="flex flex-wrap items-center gap-4">
              <label className="flex items-center gap-2 text-xs text-[var(--text-secondary)] cursor-pointer">
                <input
                  type="checkbox"
                  checked={hideSmall}
                  onChange={(e) => setHideSmall(e.target.checked)}
                  className="rounded border-[var(--border-color)] accent-[#F0B90B]"
                />
                Hide assets &lt; $10
              </label>
              <div className="flex items-center gap-2 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg px-3 py-1.5">
                <Search className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search coin..."
                  className="bg-transparent text-xs text-[var(--text-primary)] focus:outline-none w-36"
                />
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[var(--border-color)] text-[11px] text-[var(--text-muted)]">
                  <th className="py-3 px-4">Coin</th>
                  <th className="py-3 px-4 text-right">Available</th>
                  <th className="py-3 px-4 text-right">In Order</th>
                  <th className="py-3 px-4 text-right">Simple Earn</th>
                  <th className="py-3 px-4 text-right">USDT Valuation</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-color)]/60 font-mono-num">
                {filteredBalances.map((b) => (
                  <tr key={b.asset} className="hover:bg-[var(--bg-hover)]">
                    <td className="py-3.5 px-4 font-sans">
                      <div className="font-bold text-[var(--text-primary)]">{b.asset}</div>
                      <div className="text-[11px] text-[var(--text-muted)]">{b.name}</div>
                    </td>
                    <td className="py-3.5 px-4 text-right text-[var(--text-primary)]">
                      {hideBalances ? '••••' : b.available.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 text-right text-[var(--text-muted)]">
                      {hideBalances ? '••••' : b.inOrder.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 text-right text-[#0ECB81]">
                      {hideBalances ? '••••' : b.staked.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 text-right font-bold text-[var(--text-primary)]">
                      {hideBalances ? '••••' : `$${b.usdtValuation.toLocaleString()}`}
                    </td>
                    <td className="py-3.5 px-4 text-right font-sans">
                      <div className="inline-flex items-center gap-3 text-xs font-semibold">
                        <button
                          onClick={() => navigate('/deposit')}
                          className="text-[#F0B90B] hover:underline cursor-pointer"
                        >
                          Deposit
                        </button>
                        <button
                          onClick={() => navigate('/withdraw')}
                          className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer"
                        >
                          Withdraw
                        </button>
                        <button
                          onClick={() =>
                            navigate('/trade/spot', b.asset === 'USDT' ? 'BTCUSDT' : `${b.asset}USDT`)
                          }
                          className="text-[#0ECB81] hover:underline cursor-pointer"
                        >
                          Trade
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
