import React, { useState } from 'react';
import {
  User,
  ShieldCheck,
  FileCheck,
  KeyRound,
  Lock,
  CheckCircle2,
  AlertCircle,
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

  const [phishingInput, setPhishingInput] = useState(user.antiPhishingCode);
  const [kycCountry, setKycCountry] = useState('United States / Global');
  const [kycDocType, setKycDocType] = useState('Passport');

  const totalUSDT = balances.reduce((acc, b) => acc + b.usdtValuation, 0);

  if (!isAuthenticated) {
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
            Log In
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
                    onClick={() => navigate('/security')}
                    className="px-4 py-2 rounded-lg bg-[var(--bg-elevated)] hover:bg-[var(--bg-hover)] border border-[var(--border-color)] text-xs font-semibold text-[var(--text-primary)] cursor-pointer"
                  >
                    Security Settings
                  </button>
                  <button
                    onClick={() => navigate('/wallet')}
                    className="px-4 py-2 rounded-lg bg-[#F0B90B] hover:bg-[#FCD535] text-[#181A20] text-xs font-bold cursor-pointer"
                  >
                    Manage Assets
                  </button>
                </div>
              </div>

              {/* Account Stats Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-5 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)]">
                  <div className="text-xs text-[var(--text-muted)]">Estimated Portfolio Value</div>
                  <div className="text-xl font-bold font-mono-num text-[var(--text-primary)] mt-1">
                    ${totalUSDT.toLocaleString()} USDT
                  </div>
                </div>
                <div className="p-5 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)]">
                  <div className="text-xs text-[var(--text-muted)]">Spot Maker / Taker Fee</div>
                  <div className="text-xl font-bold font-mono-num text-[#0ECB81] mt-1">
                    0.0750% / 0.0750%
                  </div>
                </div>
                <div className="p-5 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)]">
                  <div className="text-xs text-[var(--text-muted)]">24h Withdrawal Limit</div>
                  <div className="text-xl font-bold font-mono-num text-[var(--text-primary)] mt-1">
                    ${user.kycDailyLimitUSDT.toLocaleString()} USDT
                  </div>
                </div>
              </div>
            </>
          )}

          {section === 'security' && (
            <div className="space-y-4">
              <div className="p-6 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] space-y-2">
                <h1 className="font-display text-2xl font-bold text-[var(--text-primary)]">
                  Security & Two-Factor Authentication (2FA)
                </h1>
                <p className="text-xs text-[var(--text-muted)]">
                  Configure hardware Passkeys, Authenticator TOTP, withdrawal address whitelisting, and anti-phishing verification codes.
                </p>
              </div>

              {/* Security Controls List */}
              <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl divide-y divide-[var(--border-color)]">
                {/* Passkey */}
                <div className="p-5 flex flex-wrap items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-2">
                      Biometric Passkeys (WebAuthn / YubiKey)
                      <CheckCircle2 className="w-4 h-4 text-[#0ECB81]" />
                    </div>
                    <div className="text-xs text-[var(--text-muted)]">
                      Hardware-backed phishing-resistant sign-in and withdrawal verification.
                    </div>
                  </div>
                  <button
                    onClick={() => updateUserProfile({ passkeyConnected: !user.passkeyConnected })}
                    className="px-4 py-2 rounded-lg bg-[var(--bg-elevated)] hover:bg-[var(--bg-hover)] border border-[var(--border-color)] text-xs font-semibold text-[var(--text-primary)] cursor-pointer"
                  >
                    {user.passkeyConnected ? 'Connected (Manage)' : 'Enable Passkey'}
                  </button>
                </div>

                {/* Authenticator App */}
                <div className="p-5 flex flex-wrap items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-2">
                      Authenticator App (TOTP 2FA)
                      {user.twoFactorEnabled && <CheckCircle2 className="w-4 h-4 text-[#0ECB81]" />}
                    </div>
                    <div className="text-xs text-[var(--text-muted)]">
                      Time-based 6-digit verification codes for login and API key creation.
                    </div>
                  </div>
                  <button
                    onClick={() => updateUserProfile({ twoFactorEnabled: !user.twoFactorEnabled })}
                    className={`px-4 py-2 rounded-lg text-xs font-bold cursor-pointer ${
                      user.twoFactorEnabled
                        ? 'bg-[var(--bg-elevated)] border border-[var(--border-color)] text-[var(--text-primary)]'
                        : 'bg-[#F0B90B] text-[#181A20]'
                    }`}
                  >
                    {user.twoFactorEnabled ? 'Enabled' : 'Enable 2FA'}
                  </button>
                </div>

                {/* Withdrawal Address Whitelist */}
                <div className="p-5 flex flex-wrap items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="text-sm font-bold text-[var(--text-primary)]">
                      Withdrawal Address Whitelist
                    </div>
                    <div className="text-xs text-[var(--text-muted)]">
                      When enabled, your account can only withdraw to pre-approved cold wallet addresses.
                    </div>
                  </div>
                  <button
                    onClick={() =>
                      updateUserProfile({
                        withdrawalWhitelistEnabled: !user.withdrawalWhitelistEnabled,
                      })
                    }
                    className={`px-4 py-2 rounded-lg text-xs font-bold cursor-pointer ${
                      user.withdrawalWhitelistEnabled
                        ? 'bg-[#0ECB81] text-white'
                        : 'bg-[var(--bg-elevated)] border border-[var(--border-color)] text-[var(--text-primary)]'
                    }`}
                  >
                    {user.withdrawalWhitelistEnabled ? 'Whitelist Active' : 'Enable Whitelist'}
                  </button>
                </div>

                {/* Anti-Phishing Code */}
                <div className="p-5 flex flex-wrap items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="text-sm font-bold text-[var(--text-primary)]">
                      Anti-Phishing Email Code
                    </div>
                    <div className="text-xs text-[var(--text-muted)]">
                      Every genuine email from AetherX Pro will include this custom code in the header.
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={phishingInput}
                      onChange={(e) => setPhishingInput(e.target.value)}
                      className="px-3 py-1.5 rounded-lg bg-[var(--bg-primary)] border border-[var(--border-color)] font-mono-num text-xs text-[var(--text-primary)] focus:outline-none"
                    />
                    <button
                      onClick={() => updateUserProfile({ antiPhishingCode: phishingInput })}
                      className="px-3.5 py-1.5 rounded-lg bg-[#F0B90B] text-[#181A20] text-xs font-bold cursor-pointer"
                    >
                      Save Code
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {section === 'kyc' && (
            <div className="space-y-6">
              <div className="p-6 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] flex flex-wrap items-center justify-between gap-4">
                <div>
                  <div className="text-xs font-semibold text-[#0ECB81]">
                    IDENTITY VERIFICATION (KYC)
                  </div>
                  <h1 className="font-display text-2xl font-bold text-[var(--text-primary)] mt-1">
                    Status: {user.kycStatus}
                  </h1>
                  <p className="text-xs text-[var(--text-muted)] mt-1">
                    Your account enjoys full Spot, Futures, P2P, and $2,000,000 daily withdrawal privileges.
                  </p>
                </div>
                <span className="px-4 py-2 rounded-lg bg-[#0ECB81]/15 text-[#0ECB81] text-xs font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  Tier 2 Verified Plus
                </span>
              </div>

              {/* KYC Tier Limits Breakdown */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-5 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-[var(--text-primary)]">
                      Verified (Standard)
                    </span>
                    <span className="text-xs text-[#0ECB81] font-semibold">Completed</span>
                  </div>
                  <ul className="text-xs text-[var(--text-muted)] space-y-1.5">
                    <li>• Fiat Deposit & Withdrawal: $50,000 / day</li>
                    <li>• Crypto Withdrawal Limit: $1,000,000 USDT / day</li>
                    <li>• P2P Trading & OTC Convert: Unlimited</li>
                  </ul>
                </div>

                <div className="p-5 rounded-xl bg-[var(--bg-secondary)] border border-[#F0B90B]/50 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-[var(--text-primary)]">
                      Verified Plus (Institutional / Proof of Address)
                    </span>
                    <span className="text-xs text-[#F0B90B] font-semibold">Active Tier</span>
                  </div>
                  <ul className="text-xs text-[var(--text-muted)] space-y-1.5">
                    <li>• Fiat Wire & SEPA Limit: $500,000 / day</li>
                    <li>• Crypto Withdrawal Limit: $2,000,000 USDT / day</li>
                    <li>• Dedicated OTC Execution Desk Access</li>
                  </ul>
                </div>
              </div>

              {/* Document Re-submission / Upgrade Form */}
              <div className="p-6 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] space-y-4">
                <h3 className="text-sm font-bold text-[var(--text-primary)]">
                  Update Residency or Institutional KYB Documents
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-[var(--text-muted)] mb-1">
                      Jurisdiction / Country
                    </label>
                    <input
                      type="text"
                      value={kycCountry}
                      onChange={(e) => setKycCountry(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-lg bg-[var(--bg-primary)] border border-[var(--border-color)] text-xs text-[var(--text-primary)]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-[var(--text-muted)] mb-1">
                      Document Type
                    </label>
                    <select
                      value={kycDocType}
                      onChange={(e) => setKycDocType(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-lg bg-[var(--bg-primary)] border border-[var(--border-color)] text-xs text-[var(--text-primary)]"
                    >
                      <option value="Passport">International Passport</option>
                      <option value="National ID">National Identity Card</option>
                      <option value="Institutional KYB">Corporate KYB Certificate</option>
                    </select>
                  </div>
                </div>
                <button
                  onClick={() =>
                    pushToast({
                      type: 'success',
                      title: 'KYC Records Synchronized',
                      description: `Your ${kycDocType} verification for ${kycCountry} is up to date.`,
                    })
                  }
                  className="px-5 py-2.5 rounded-lg bg-[#F0B90B] hover:bg-[#FCD535] text-[#181A20] text-xs font-bold cursor-pointer"
                >
                  Verify & Update Records
                </button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
