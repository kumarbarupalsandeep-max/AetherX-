import React, { useState, useEffect } from 'react';
import {
  User,
  ShieldCheck,
  FileCheck,
  KeyRound,
  Lock,
  CheckCircle2,
  Smartphone,
  Upload,
} from 'lucide-react';
import { useExchange } from '../context/ExchangeContext';

interface AccountHubPageProps {
  section: 'account' | 'security' | 'kyc';
}

export const AccountHubPage: React.FC<AccountHubPageProps> = ({ section }) => {
  const {
    user,
    balances,
    isAuthenticated,
    openAuthModal,
    updateUserProfile,
    navigate,
    pushToast,
  } = useExchange();

  const [phishingInput, setPhishingInput] = useState(user?.antiPhishingCode || '');
  const [kycCountry, setKycCountry] = useState('United States / Global');
  const [kycDocType, setKycDocType] = useState('Passport');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user?.antiPhishingCode) {
      setPhishingInput(user.antiPhishingCode);
    }
  }, [user?.antiPhishingCode]);

  const totalUSDT = balances.reduce((acc, b) => acc + b.usdtValuation, 0);

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-[var(--bg-primary)] text-[var(--text-primary)] flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl p-8 text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-[#F0B90B]/15 text-[#F0B90B] flex items-center justify-center mx-auto">
            <Lock className="w-6 h-6" />
          </div>
          <h1 className="font-display text-2xl font-bold text-[var(--text-primary)]">
            Sign In to Access Account & Security
          </h1>
          <p className="text-xs text-[var(--text-muted)] leading-relaxed">
            Manage your VIP tier, hardware Passkeys, Google Authenticator 2FA, anti-phishing codes, and KYC verification limits.
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
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Sidebar Navigation */}
        <aside className="lg:col-span-3 space-y-1">
          <div className="p-4 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] mb-4">
            <div className="text-sm font-bold text-[var(--text-primary)] truncate">
              {user.email}
            </div>
            <div className="text-xs font-mono-num text-[var(--text-muted)] mt-1">
              UID: {user.uid} · {user.vipLevel}
            </div>
          </div>

          {(
            [
              { id: 'account', label: 'Account Overview', path: '/account', icon: User },
              { id: 'security', label: 'Security & 2FA', path: '/security', icon: ShieldCheck },
              { id: 'kyc', label: 'Identification (KYC)', path: '/kyc', icon: FileCheck },
            ] as const
          ).map((item) => {
            const Icon = item.icon;
            const active = section === item.id;
            return (
              <button
                key={item.id}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                  active
                    ? 'bg-[#F0B90B] text-[#181A20]'
                    : 'text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                <Icon className="w-4 h-4" />
                {item.label}
              </button>
            );
          })}
        </aside>

        {/* Main Content Panel */}
        <main className="lg:col-span-9 space-y-6">
          {section === 'account' && (
            <>
              {/* Profile Header Card */}
              <div className="p-6 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] flex flex-wrap items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-[#F0B90B] text-[#181A20] font-display font-bold text-lg flex items-center justify-center">
                    {user.nickname.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div className="text-lg font-bold text-[var(--text-primary)]">
                      {user.nickname}
                    </div>
                    <div className="text-xs text-[var(--text-muted)] font-mono-num mt-0.5">
                      UID: {user.uid} · Tier: {user.vipLevel} · KYC: {user.kycStatus}
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => navigate('/wallet')}
                    className="px-4 py-2 rounded-lg bg-[#F0B90B] hover:bg-[#FCD535] text-[#181A20] text-xs font-bold cursor-pointer"
                  >
                    View Portfolio (${totalUSDT.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })})
                  </button>
                  <button
                    onClick={() => navigate('/security')}
                    className="px-4 py-2 rounded-lg bg-[var(--bg-elevated)] hover:bg-[var(--bg-hover)] border border-[var(--border-color)] text-xs font-semibold text-[var(--text-primary)] cursor-pointer"
                  >
                    Security Settings
                  </button>
                </div>
              </div>

              {/* VIP Tier & Fee Schedule Overview */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-5 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] space-y-1">
                  <div className="text-xs text-[var(--text-muted)]">Current Fee Tier</div>
                  <div className="text-xl font-bold text-[#F0B90B]">{user.vipLevel}</div>
                  <div className="text-xs text-[var(--text-secondary)] pt-1">
                    Spot Maker / Taker: <strong className="font-mono-num">0.08% / 0.10%</strong>
                  </div>
                </div>
                <div className="p-5 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] space-y-1">
                  <div className="text-xs text-[var(--text-muted)]">24h Withdrawal Limit</div>
                  <div className="text-xl font-bold font-mono-num text-[var(--text-primary)]">
                    8,000,000 USDT
                  </div>
                  <div className="text-xs text-[#0ECB81] pt-1">
                    {user.kycStatus} Tier Active
                  </div>
                </div>
                <div className="p-5 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] space-y-1">
                  <div className="text-xs text-[var(--text-muted)]">Security Protection Score</div>
                  <div className="text-xl font-bold text-[#0ECB81]">
                    {user.twoFactorEnabled && user.withdrawalWhitelist ? 'High (4/4)' : 'Medium (3/4)'}
                  </div>
                  <div className="text-xs text-[var(--text-secondary)] pt-1">
                    Anti-Phishing: <strong className="font-mono-num">{user.antiPhishingCode}</strong>
                  </div>
                </div>
              </div>
            </>
          )}

          {section === 'security' && (
            <div className="space-y-6">
              <div className="p-6 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] space-y-4">
                <h2 className="text-lg font-bold text-[var(--text-primary)]">
                  Two-Factor Authentication (2FA) & Hardware Keys
                </h2>
                <p className="text-xs text-[var(--text-muted)]">
                  Protect withdrawals, API keys, and account modifications with multi-factor hardware and TOTP authentication persisted to your account profile.
                </p>

                <div className="divide-y divide-[var(--border-color)]">
                  {/* Authenticator App */}
                  <div className="py-4 flex items-center justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <Smartphone className="w-5 h-5 text-[#F0B90B] shrink-0 mt-0.5" />
                      <div>
                        <div className="text-sm font-bold text-[var(--text-primary)]">
                          Authenticator App (TOTP)
                        </div>
                        <div className="text-xs text-[var(--text-muted)]">
                          Time-based 6-digit verification code for login and withdrawals.
                        </div>
                      </div>
                    </div>
                    <button
                      disabled={saving}
                      onClick={async () => {
                        setSaving(true);
                        await updateUserProfile({ twoFactorEnabled: !user.twoFactorEnabled });
                        setSaving(false);
                      }}
                      className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                        user.twoFactorEnabled
                          ? 'bg-[#0ECB81]/15 text-[#0ECB81]'
                          : 'bg-[#F0B90B] text-[#181A20]'
                      }`}
                    >
                      {user.twoFactorEnabled ? 'Enabled (Toggle)' : 'Enable 2FA'}
                    </button>
                  </div>

                  {/* Withdrawal Whitelist */}
                  <div className="py-4 flex items-center justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <KeyRound className="w-5 h-5 text-[#0ECB81] shrink-0 mt-0.5" />
                      <div>
                        <div className="text-sm font-bold text-[var(--text-primary)]">
                          Withdrawal Address Whitelist
                        </div>
                        <div className="text-xs text-[var(--text-muted)]">
                          Restrict crypto withdrawals exclusively to pre-approved on-chain addresses.
                        </div>
                      </div>
                    </div>
                    <button
                      disabled={saving}
                      onClick={async () => {
                        setSaving(true);
                        await updateUserProfile({
                          withdrawalWhitelist: !user.withdrawalWhitelist,
                        });
                        setSaving(false);
                      }}
                      className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                        user.withdrawalWhitelist
                          ? 'bg-[#0ECB81]/15 text-[#0ECB81]'
                          : 'bg-[var(--bg-elevated)] border border-[var(--border-color)] text-[var(--text-primary)]'
                      }`}
                    >
                      {user.withdrawalWhitelist ? 'Active (Disable)' : 'Activate Whitelist'}
                    </button>
                  </div>

                  {/* Anti-Phishing Code */}
                  <div className="pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <div className="text-sm font-bold text-[var(--text-primary)]">
                        Anti-Phishing Code
                      </div>
                      <div className="text-xs text-[var(--text-muted)]">
                        All genuine emails from AetherX Pro will display this custom signature.
                      </div>
                    </div>
                    <form
                      onSubmit={async (e) => {
                        e.preventDefault();
                        if (!phishingInput.trim()) return;
                        setSaving(true);
                        await updateUserProfile({ antiPhishingCode: phishingInput.trim() });
                        setSaving(false);
                      }}
                      className="flex items-center gap-2"
                    >
                      <input
                        type="text"
                        value={phishingInput}
                        onChange={(e) => setPhishingInput(e.target.value)}
                        className="px-3 py-1.5 rounded-lg bg-[var(--bg-primary)] border border-[var(--border-color)] font-mono-num text-xs text-[var(--text-primary)] focus:outline-none focus:border-[#F0B90B]"
                      />
                      <button
                        type="submit"
                        disabled={saving}
                        className="px-3.5 py-1.5 rounded-lg bg-[#F0B90B] text-[#181A20] text-xs font-bold cursor-pointer"
                      >
                        Save Code
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          )}

          {section === 'kyc' && (
            <div className="space-y-6">
              <div className="p-6 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] space-y-5">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <div className="text-xs font-semibold text-[#0ECB81]">
                      IDENTITY VERIFICATION STATUS
                    </div>
                    <h2 className="text-xl font-bold text-[var(--text-primary)] mt-1">
                      Current Status: {user.kycStatus}
                    </h2>
                  </div>
                  <span className="px-3.5 py-1.5 rounded-lg bg-[#0ECB81]/15 text-[#0ECB81] text-xs font-bold flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" />
                    Full Trading & Fiat Enabled
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  <div className="p-4 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-color)] space-y-2">
                    <div className="text-xs font-bold text-[var(--text-primary)]">
                      Verified Tier Privileges
                    </div>
                    <ul className="text-xs text-[var(--text-secondary)] space-y-1.5">
                      <li>• Fiat Deposit & Withdrawal: $50,000 / Day</li>
                      <li>• Crypto Withdrawal Limit: 8,000,000 USDT / Day</li>
                      <li>• P2P Marketplace Trading: Unlimited</li>
                    </ul>
                  </div>

                  <div className="p-4 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-color)] space-y-3">
                    <div className="text-xs font-bold text-[var(--text-primary)]">
                      Upgrade / Re-Submit KYC Document
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <select
                        value={kycCountry}
                        onChange={(e) => setKycCountry(e.target.value)}
                        className="px-2.5 py-1.5 rounded bg-[var(--bg-secondary)] border border-[var(--border-color)] text-xs text-[var(--text-primary)]"
                      >
                        <option>United States / Global</option>
                        <option>European Union (MiCA)</option>
                        <option>India (FIU-IND)</option>
                        <option>United Kingdom</option>
                        <option>United Arab Emirates</option>
                      </select>
                      <select
                        value={kycDocType}
                        onChange={(e) => setKycDocType(e.target.value)}
                        className="px-2.5 py-1.5 rounded bg-[var(--bg-secondary)] border border-[var(--border-color)] text-xs text-[var(--text-primary)]"
                      >
                        <option>Passport</option>
                        <option>National ID Card</option>
                        <option>Driver License</option>
                      </select>
                    </div>
                    <button
                      onClick={async () => {
                        setSaving(true);
                        await updateUserProfile({ kycStatus: 'Verified Plus' });
                        setSaving(false);
                        pushToast({
                          type: 'success',
                          title: 'KYC Tier Confirmed',
                          description: `${kycDocType} (${kycCountry}) verified in database.`,
                        });
                      }}
                      className="w-full py-2 rounded-lg bg-[#F0B90B] hover:bg-[#FCD535] text-[#181A20] text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      Verify {kycDocType}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
