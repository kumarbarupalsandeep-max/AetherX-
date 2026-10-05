import React from 'react';
import { Sun, Moon, Globe } from 'lucide-react';
import { useExchange } from '../context/ExchangeContext';
import { RoutePath } from '../types/exchange';

export const Footer: React.FC = () => {
  const { navigate, route, theme, toggleTheme } = useExchange();

  // Ultra-compact live status bar on full-viewport Spot & Futures trading terminals
  if (route === '/trade/spot' || route === '/trade/futures') {
    return (
      <footer className="h-7 bg-[var(--bg-secondary)] border-t border-[var(--border-color)] px-3 flex items-center justify-between text-[11px] text-[var(--text-muted)] select-none">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5 text-[#0ECB81] font-semibold">
            <span className="w-2 h-2 rounded-full bg-[#0ECB81]" />
            Stable Connection
          </span>
          <button onClick={() => navigate('/fees')} className="hover:text-[var(--text-primary)] cursor-pointer">
            0% Maker Fee Promo
          </button>
          <button onClick={() => navigate('/announcements')} className="hover:text-[var(--text-primary)] hidden sm:inline cursor-pointer">
            Announcements
          </button>
          <button onClick={() => navigate('/api-docs')} className="hover:text-[var(--text-primary)] hidden md:inline cursor-pointer">
            API & WebSocket
          </button>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/support')} className="hover:text-[var(--text-primary)] cursor-pointer">
            Online Support
          </button>
          <button onClick={() => navigate('/sitemap')} className="hover:text-[var(--text-primary)] cursor-pointer">
            Sitemap
          </button>
        </div>
      </footer>
    );
  }

  const footerColumns: { title: string; links: { label: string; path: RoutePath }[] }[] = [
    {
      title: 'About Us',
      links: [
        { label: 'About', path: '/proof-of-reserves' },
        { label: 'Announcements', path: '/announcements' },
        { label: 'News & Square', path: '/announcements' },
        { label: 'Legal & Risk Warning', path: '/support' },
        { label: 'Proof of Reserves (PoR)', path: '/proof-of-reserves' },
        { label: 'Sitemap', path: '/sitemap' },
      ],
    },
    {
      title: 'Products',
      links: [
        { label: 'Exchange (Spot)', path: '/trade/spot' },
        { label: 'Buy Crypto', path: '/buy-crypto' },
        { label: 'Simple Earn', path: '/earn' },
        { label: 'Launchpool & Airdrops', path: '/airdrop' },
        { label: 'Auto-Invest', path: '/buy-crypto' },
        { label: 'ETH Staking', path: '/earn' },
      ],
    },
    {
      title: 'Business & Institutional',
      links: [
        { label: 'P2P Merchant Application', path: '/p2p' },
        { label: 'Institutional & VIP Services', path: '/fees' },
        { label: 'OTC & Block Convert', path: '/convert' },
        { label: 'REST & WebSocket API', path: '/api-docs' },
        { label: 'Affiliate & Referral (40%)', path: '/referral' },
      ],
    },
    {
      title: 'Trade',
      links: [
        { label: 'BTC/USDT Spot', path: '/trade/spot' },
        { label: 'ETH/USDT Spot', path: '/trade/spot' },
        { label: 'SOL/USDT Spot', path: '/trade/spot' },
        { label: 'BNB/USDT Spot', path: '/trade/spot' },
        { label: 'USDⓈ-M Futures 125x', path: '/trade/futures' },
        { label: 'Zero-Fee Convert', path: '/convert' },
      ],
    },
    {
      title: 'Support & Security',
      links: [
        { label: '24/7 Chat Support', path: '/support' },
        { label: 'Support Center', path: '/support' },
        { label: 'Fees & VIP Schedule', path: '/fees' },
        { label: 'APIs', path: '/api-docs' },
        { label: 'Security & 2FA Verification', path: '/security' },
        { label: 'Deposit & Withdrawal Status', path: '/deposit' },
      ],
    },
  ];

  return (
    <footer className="bg-[var(--bg-secondary)] border-t border-[var(--border-color)] pt-12 pb-8 px-4 lg:px-8 mt-auto select-none">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-8 pb-10 border-b border-[var(--border-color)]">
          {/* Column 1: Community & Language/Theme Controls */}
          <div className="col-span-2 sm:col-span-3 lg:col-span-1 space-y-4">
            <div className="font-display text-lg font-extrabold tracking-tight text-[#F0B90B] flex items-center gap-2">
              <svg className="w-5 h-5 fill-[#F0B90B]" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 2L15.8 5.8L12 9.6L8.2 5.8L12 2ZM5.8 8.2L9.6 12L5.8 15.8L2 12L5.8 8.2ZM18.2 8.2L22 12L18.2 15.8L14.4 12L18.2 8.2ZM12 14.4L15.8 18.2L12 22L8.2 18.2L12 14.4ZM12 9.8L14.2 12L12 14.2L9.8 12L12 9.8Z" />
              </svg>
              AETHERX
            </div>

            <div className="text-xs font-bold text-[var(--text-primary)]">Community</div>
            <div className="flex flex-wrap gap-2 text-xs text-[var(--text-muted)]">
              {['X', 'TG', 'DC', 'YT', 'RD', 'IG'].map((soc) => (
                <button
                  key={soc}
                  onClick={() => navigate('/announcements')}
                  className="w-7 h-7 rounded-full bg-[var(--bg-elevated)] hover:bg-[#F0B90B] hover:text-[#181A20] border border-[var(--border-color)] flex items-center justify-center font-bold transition-colors cursor-pointer"
                >
                  {soc}
                </button>
              ))}
            </div>

            <div className="pt-2 space-y-2">
              <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
                <Globe className="w-4 h-4 text-[var(--text-muted)]" />
                <span>English (Global) · USD-$</span>
              </div>
              <div className="flex items-center justify-between pt-1">
                <span className="text-xs text-[var(--text-secondary)]">Theme</span>
                <button
                  onClick={toggleTheme}
                  className="px-2.5 py-1 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border-color)] flex items-center gap-1.5 text-xs font-semibold text-[var(--text-primary)] cursor-pointer"
                >
                  {theme === 'dark' ? (
                    <>
                      <Sun className="w-3.5 h-3.5 text-[#F0B90B]" /> Dark
                    </>
                  ) : (
                    <>
                      <Moon className="w-3.5 h-3.5" /> Light
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Columns 2-6: Directory Links */}
          {footerColumns.map((col) => (
            <div key={col.title} className="space-y-3">
              <h4 className="text-sm font-bold text-[var(--text-primary)]">{col.title}</h4>
              <ul className="space-y-2">
                {col.links.map((link) => (
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
          <div>AetherX © {new Date().getFullYear()} All Rights Reserved</div>
          <div className="flex flex-wrap items-center gap-4">
            <button onClick={() => navigate('/proof-of-reserves')} className="hover:text-[var(--text-primary)] cursor-pointer">
              Cookie Preferences
            </button>
            <span>·</span>
            <button onClick={() => navigate('/proof-of-reserves')} className="hover:text-[var(--text-primary)] cursor-pointer">
              Proof of Reserves
            </button>
            <span>·</span>
            <button onClick={() => navigate('/fees')} className="hover:text-[var(--text-primary)] cursor-pointer">
              Fee Schedule
            </button>
            <span>·</span>
            <button onClick={() => navigate('/sitemap')} className="hover:text-[var(--text-primary)] cursor-pointer">
              Sitemap
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
