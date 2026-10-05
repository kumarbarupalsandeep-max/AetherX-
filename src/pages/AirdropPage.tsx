import React from 'react';
import { Gift, CheckCircle2, Clock, Users, ArrowRight } from 'lucide-react';
import { useExchange } from '../context/ExchangeContext';

export const AirdropPage: React.FC = () => {
  const { airdrops, claimAirdrop, navigate } = useExchange();

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] py-8 px-4 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Hero */}
        <div className="p-6 sm:p-8 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-color)] flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="text-xs font-semibold text-[#F0B90B]">
              MEGADROP & HODLER AIRDROP PORTAL
            </div>
            <h1 className="font-display text-2xl sm:text-4xl font-bold text-[var(--text-primary)]">
              Exclusive Token Launches & Snapshot Distributions
            </h1>
            <p className="text-xs sm:text-sm text-[var(--text-muted)] leading-relaxed">
              Hold BNB, SOL, or USDT in Spot or Simple Earn vaults to qualify for retroactive hourly snapshots and claim newly listed tokens before public Spot trading opens.
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => navigate('/earn')}
              className="px-5 py-3 rounded-xl bg-[#F0B90B] hover:bg-[#FCD535] text-[#181A20] font-bold text-xs cursor-pointer"
            >
              Subscribe Simple Earn
            </button>
          </div>
        </div>

        {/* Campaigns Grid */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-[var(--text-primary)]">
            Active & Completed Airdrop Campaigns
          </h2>

          <div className="grid grid-cols-1 gap-4">
            {airdrops.map((camp) => (
              <div
                key={camp.id}
                className="p-6 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] flex flex-col lg:flex-row lg:items-center justify-between gap-6"
              >
                <div className="space-y-2 max-w-2xl">
                  <div className="flex items-center gap-3 text-xs">
                    <span
                      className={`font-bold ${
                        camp.status === 'Active' ? 'text-[#0ECB81]' : 'text-[var(--text-muted)]'
                      }`}
                    >
                      {camp.status.toUpperCase()}
                    </span>
                    <span className="text-[var(--text-muted)]">·</span>
                    <span className="font-mono-num text-[var(--text-secondary)]">
                      Snapshot Asset: {camp.snapshotAsset} (Min {camp.minHoldingRequired}{' '}
                      {camp.snapshotAsset})
                    </span>
                    <span className="text-[var(--text-muted)]">·</span>
                    <span className="font-mono-num text-[#F0B90B]">Ends in: {camp.endsIn}</span>
                  </div>

                  <h3 className="text-lg font-bold text-[var(--text-primary)]">
                    {camp.title} ({camp.token})
                  </h3>
                  <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                    {camp.description}
                  </p>

                  <div className="flex flex-wrap items-center gap-6 pt-2 text-xs font-mono-num">
                    <div>
                      <span className="text-[var(--text-muted)] font-sans">Reward Pool: </span>
                      <strong className="text-[var(--text-primary)]">{camp.totalRewardPool}</strong>
                    </div>
                    <div>
                      <span className="text-[var(--text-muted)] font-sans">Participants: </span>
                      <strong className="text-[var(--text-primary)]">
                        {camp.participants.toLocaleString()}
                      </strong>
                    </div>
                    <div>
                      <span className="text-[var(--text-muted)] font-sans">Your Est. Allocation: </span>
                      <strong className="text-[#0ECB81]">{camp.estimatedAllocation}</strong>
                    </div>
                  </div>
                </div>

                <div className="shrink-0 flex items-center gap-3">
                  {camp.userClaimed ? (
                    <div className="px-5 py-2.5 rounded-lg bg-[#0ECB81]/15 text-[#0ECB81] text-xs font-bold flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4" />
                      Allocation Claimed
                    </div>
                  ) : (
                    <button
                      onClick={() => claimAirdrop(camp.id)}
                      className="px-6 py-3 rounded-lg bg-[#F0B90B] hover:bg-[#FCD535] text-[#181A20] text-xs font-bold cursor-pointer"
                    >
                      Claim {camp.estimatedAllocation}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
