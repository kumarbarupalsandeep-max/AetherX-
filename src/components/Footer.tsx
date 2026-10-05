import React from 'react';
import { useExchange } from '../context/ExchangeContext';
import { RoutePath } from '../types/exchange';

export const Footer: React.FC = () => {
  const { navigate, route } = useExchange();

  // Compact footer on full-viewport trading terminals to maximize chart/orderbook screen real estate
  if (route === '/trade/spot' || route === '/trade/futures') {
    return (
      <footer className="h-8 bg-[var(--bg-secondary)] border-t border-[var(--border-color)] px-4 flex items-center justify-between text-[11px] text-[var(--text-muted)] select-none">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5 text-[#0ECB81] font-medium">
            <span className="w-2 h-2 rounded-full bg-[#0ECB81]" />
            Matching Engine Stable
          </span>
          <button onClick={() => navigate('/fees')} className="hover:text-[var(--text-primary)]">
            0% Maker Fee Promo
          </button>
          <button onClick={() => navigate('/announcements')} className="hover:text-[var(--text-primary)] hidden sm:inline">
            Announcements
          </button>
          <button onClick={() => navigate('/api-docs')} className="hover:text-[var(--text-primary)] hidden md:inline">
            WebSocket & REST API
          </button>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/support')} className="hover:text-[var(--text-primary)]">
            24/7 Support
          </button>
          <button onClick={() => navigate('/sitemap')} className="hover:text-[var(--text-primary)]">
            Sitemap
          </button>
        </div>
      </footer>
    );
  }

  const footerGroups: { title: string; links: { label: string; path: RoutePath }[] }[] = [
    {
      title: 'About Us',
      links: [
        { label: 'About AetherX Pro', path: '/proof-of-reserves' },
        { label: 'Proof of Reserves (1:1)', path: '/proof-of-reserves' },
        { label: 'Announcements & News', path: '/announcements' },
        { label: 'Exchange Sitemap', path: '/sitemap' },
        { label: 'VIP & Fee Schedule', path: '/fees' },
      ],
    },
    {
      title: 'Products & Trading',
      links: [
        { label: 'Spot Trading', path: '/trade/spot' },
        { label: 'USDⓈ-M Futures', path: '/trade/futures' },
        { label: 'Convert & Block Trade', path: '/convert' },
        { label: 'Simple Earn & Staking', path: '/earn' },
        { label: 'Megadrop & Airdrops', path: '/airdrop' },
      ],
    },
    {
      title: 'Buy Crypto & Fiat',
      links: [
        { label: 'Buy Crypto (Card/Bank)', path: '/buy-crypto' },
        { label: 'P2P Trading (0% Fee)', path: '/p2p' },
        { label: 'On-Chain Deposit', path: '/deposit' },
        { label: 'Instant Withdrawal', path: '/withdraw' },
        { label: 'Assets & Portfolio', path: '/wallet' },
      ],
    },
    {
      title: 'Account & Support',
      links: [
        { label: '24/7 Help & Support Center', path: '/support' },
        { label: 'Security & 2FA Center', path: '/security' },
        { label: 'Identity Verification (KYC)', path: '/kyc' },
        { label: 'Referral Program (40%)', path: '/referral' },
        { label: 'Institutional API Docs', path: '/api-docs' },
      ],
    },
  ];

  return (
    <footer className="bg-[var(--bg-secondary)] border-t border-[var(--border-color)] pt-12 pb-8 px-4 lg:px-8 mt-auto">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 pb-10 border-b border-[var(--border-color)]">
          {/* Brand summary */}
          <div className="space-y-3">
            <div className="font-display text-lg font-bold tracking-tight text-[#F0B90B] flex items-center gap-2">
              <svg className="w-5 h-5 fill-[#F0B90B]" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 2L15.8 5.8L12 9.6L8.2 5.8L12 2ZM5.8 8.2L9.6 12L5.8 15.8L2 12L5.8 8.2ZM18.2 8.2L22 12L18.2 15.8L14.4 12L18.2 8.2ZM12 14.4L15.8 18.2L12 22L8.2 18.2L12 14.4ZM12 9.8L14.2 12L12 14.2L9.8 12L12 9.8Z" />
              </svg>
              AETHERX PRO
            </div>
            <p className="text-xs text-[var(--text-muted)] leading-relaxed">
              Global institutional digital asset exchange with deep orderbook liquidity, 1:1 Merkle-tree Proof of Reserves, and sub-millisecond matching architecture.
            </p>
            <div className="pt-1 text-xs text-[var(--text-secondary)] font-mono-num">
              24h Vol: $14.82B USDT · SAFU Fund: $1.0B
            </div>
          </div>

          {footerGroups.map((group) => (
            <div key={group.title} className="space-y-3">
              <h4 className="text-sm font-semibold text-[var(--text-primary)]">{group.title}</h4>
              <ul className="space-y-2">
                {group.links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.path}
                      onClick={(e) => {
                        e.preventDefault();
                        navigate(link.path);
                      }}
                      className="text-xs text-[var(--text-muted)] hover:text-[#F0B90B] transition-colors"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[var(--text-muted)]">
          <div>
            © {new Date().getFullYear()} AetherX Global Exchange. All rights reserved.
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <button onClick={() => navigate('/proof-of-reserves')} className="hover:text-[var(--text-primary)]">
              Proof of Reserves
            </button>
            <span>·</span>
            <button onClick={() => navigate('/fees')} className="hover:text-[var(--text-primary)]">
              Fee Schedule
            </button>
            <span>·</span>
            <button onClick={() => navigate('/support')} className="hover:text-[var(--text-primary)]">
              Risk Disclosure
            </button>
            <span>·</span>
            <button onClick={() => navigate('/sitemap')} className="hover:text-[var(--text-primary)]">
              Sitemap
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
