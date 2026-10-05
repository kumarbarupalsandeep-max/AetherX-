import React, { useState } from 'react';
import { X, ShieldCheck, Lock, Mail, KeyRound, CheckCircle2 } from 'lucide-react';
import { useExchange } from '../context/ExchangeContext';

export const AuthModal: React.FC = () => {
  const { authModalOpen, authModalMode, closeAuthModal, login } = useExchange();
  const [mode, setMode] = useState<'login' | 'register'>(authModalMode);
  const [email, setEmail] = useState('trader.pro@aetherx.io');
  const [password, setPassword] = useState('••••••••••••');
  const [referralCode, setReferralCode] = useState('AETHERVIP20');

  React.useEffect(() => {
    setMode(authModalMode);
  }, [authModalMode]);

  if (!authModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login(email.trim() || 'trader.pro@aetherx.io');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
      <div className="relative w-full max-w-md bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl shadow-2xl overflow-hidden">
        {/* Top bar */}
        <div className="flex items-center justify-between px-6 pt-5 pb-3 border-b border-[var(--border-color)]">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 fill-[#F0B90B]" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M12 2L15.8 5.8L12 9.6L8.2 5.8L12 2ZM5.8 8.2L9.6 12L5.8 15.8L2 12L5.8 8.2ZM18.2 8.2L22 12L18.2 15.8L14.4 12L18.2 8.2ZM12 14.4L15.8 18.2L12 22L8.2 18.2L12 14.4ZM12 9.8L14.2 12L12 14.2L9.8 12L12 9.8Z" />
            </svg>
            <span className="font-display text-base font-bold text-[var(--text-primary)]">
              {mode === 'login' ? 'Log In to AetherX Pro' : 'Create Exchange Account'}
            </span>
          </div>
          <button
            onClick={closeAuthModal}
            className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Security URL Verification Bar */}
        <div className="bg-[#0ECB81]/10 px-6 py-2 flex items-center gap-2 text-xs text-[#0ECB81] border-b border-[#0ECB81]/20">
          <Lock className="w-3.5 h-3.5 shrink-0" />
          <span>URL verification: https://accounts.aetherx.io</span>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Mode Tabs */}
          <div className="grid grid-cols-2 gap-1 p-1 bg-[var(--bg-primary)] rounded-lg border border-[var(--border-color)]">
            <button
              type="button"
              onClick={() => setMode('login')}
              className={`py-2 text-xs font-semibold rounded-md transition-colors ${
                mode === 'login'
                  ? 'bg-[var(--bg-elevated)] text-[#F0B90B]'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
              }`}
            >
              Log In
            </button>
            <button
              type="button"
              onClick={() => setMode('register')}
              className={`py-2 text-xs font-semibold rounded-md transition-colors ${
                mode === 'register'
                  ? 'bg-[var(--bg-elevated)] text-[#F0B90B]'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
              }`}
            >
              Register (Up to $100 Bonus)
            </button>
          </div>

          <div>
            <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">
              Email / Sub-Account
            </label>
            <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-[var(--bg-primary)] border border-[var(--border-color)] focus-within:border-[#F0B90B]">
              <Mail className="w-4 h-4 text-[var(--text-muted)]" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full bg-transparent text-sm text-[var(--text-primary)] focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">
              Password
            </label>
            <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-[var(--bg-primary)] border border-[var(--border-color)] focus-within:border-[#F0B90B]">
              <KeyRound className="w-4 h-4 text-[var(--text-muted)]" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full bg-transparent text-sm text-[var(--text-primary)] focus:outline-none"
              />
            </div>
          </div>

          {mode === 'register' && (
            <div>
              <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">
                Referral ID (Optional — 20% Fee Discount Applied)
              </label>
              <input
                type="text"
                value={referralCode}
                onChange={(e) => setReferralCode(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-[var(--bg-primary)] border border-[var(--border-color)] text-sm text-[var(--text-primary)] font-mono-num focus:outline-none focus:border-[#F0B90B]"
              />
            </div>
          )}

          <button
            type="submit"
            className="w-full py-3 rounded-lg bg-[#F0B90B] hover:bg-[#FCD535] text-[#181A20] font-semibold text-sm transition-colors cursor-pointer"
          >
            {mode === 'login' ? 'Log In & Unlock Trading' : 'Create Verified Account'}
          </button>

          <div className="pt-2 border-t border-[var(--border-color)] flex items-center justify-between text-xs text-[var(--text-muted)]">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[#0ECB81]" />
              Passkey & Authenticator Protected
            </span>
            <span className="flex items-center gap-1 text-[#0ECB81]">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Instant Demo Access
            </span>
          </div>
        </form>
      </div>
    </div>
  );
};
