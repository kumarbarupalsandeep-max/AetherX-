import React, { useState } from 'react';
import { Copy, CheckCircle2, Users, Gift, TrendingUp } from 'lucide-react';
import { useExchange } from '../context/ExchangeContext';

export const ReferralPage: React.FC = () => {
  const { user, pushToast } = useExchange();
  const [copiedType, setCopiedType] = useState<'code' | 'link' | null>(null);
  const referralLink = `https://aetherx.io/register?ref=${user.referralCode}`;

  const handleCopy = (type: 'code' | 'link', text: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedType(type);
    pushToast({
      type: 'info',
      title: 'Referral Copied',
      description: `${type === 'code' ? 'Referral ID' : 'Referral Link'} copied to clipboard.`,
    });
    setTimeout(() => setCopiedType(null), 2000);
  };

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] py-8 px-4 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Top Split Card */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl p-6 sm:p-8">
          <div className="lg:col-span-7 space-y-4">
            <div className="text-xs font-semibold text-[#F0B90B]">
              AFFILIATE & REFERRAL COMMISSION PROGRAM
            </div>
            <h1 className="font-display text-2xl sm:text-4xl font-bold text-[var(--text-primary)]">
              Invite Friends & Earn Up to <span className="text-[#0ECB81]">40% Commission</span> on Every Trade
            </h1>
            <p className="text-xs sm:text-sm text-[var(--text-muted)] leading-relaxed">
              Share your exclusive referral link. Every time your invited friends execute a Spot or Futures trade, you receive real-time USDT rebates directly into your Spot Wallet.
            </p>

            <div className="grid grid-cols-3 gap-4 pt-3">
              <div className="p-3.5 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-color)]">
                <div className="text-[11px] text-[var(--text-muted)]">Your Rebate Rate</div>
                <div className="text-xl font-bold font-mono-num text-[#F0B90B] mt-0.5">40%</div>
              </div>
              <div className="p-3.5 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-color)]">
                <div className="text-[11px] text-[var(--text-muted)]">Referred Traders</div>
                <div className="text-xl font-bold font-mono-num text-[var(--text-primary)] mt-0.5">
                  {user.referredFriends}
                </div>
              </div>
              <div className="p-3.5 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-color)]">
                <div className="text-[11px] text-[var(--text-muted)]">Total Earned (USDT)</div>
                <div className="text-xl font-bold font-mono-num text-[#0ECB81] mt-0.5">
                  ${user.totalCommissionUSDT.toLocaleString()}
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl p-5 space-y-4">
            <div className="text-sm font-bold text-[var(--text-primary)]">
              Default Referral Credentials
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs text-[var(--text-muted)]">Referral ID</label>
              <div className="flex items-center justify-between px-3.5 py-2.5 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-color)]">
                <span className="font-mono-num font-bold text-sm text-[var(--text-primary)]">
                  {user.referralCode}
                </span>
                <button
                  onClick={() => handleCopy('code', user.referralCode)}
                  className="text-xs font-semibold text-[#F0B90B] flex items-center gap-1 cursor-pointer"
                >
                  {copiedType === 'code' ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedType === 'code' ? 'Copied' : 'Copy'}
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs text-[var(--text-muted)]">Referral Link</label>
              <div className="flex items-center justify-between px-3.5 py-2.5 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-color)] gap-2">
                <span className="font-mono-num text-xs text-[var(--text-secondary)] truncate">
                  {referralLink}
                </span>
                <button
                  onClick={() => handleCopy('link', referralLink)}
                  className="text-xs font-semibold text-[#F0B90B] flex items-center gap-1 shrink-0 cursor-pointer"
                >
                  {copiedType === 'link' ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedType === 'link' ? 'Copied' : 'Copy'}
                </button>
              </div>
            </div>

            <div className="pt-2 text-xs text-[var(--text-muted)] flex justify-between">
              <span>Friend Fee Kickback</span>
              <span className="font-mono-num text-[#0ECB81] font-semibold">20% Discount</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
