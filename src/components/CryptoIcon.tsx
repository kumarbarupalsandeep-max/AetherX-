import React from 'react';

const COIN_META: Record<
  string,
  { bg: string; fg: string; label: string }
> = {
  BTC: { bg: '#F7931A', fg: '#FFFFFF', label: '₿' },
  ETH: { bg: '#627EEA', fg: '#FFFFFF', label: 'Ξ' },
  BNB: { bg: '#F0B90B', fg: '#181A20', label: 'B' },
  SOL: { bg: '#14F195', fg: '#0B0E11', label: 'S' },
  USDT: { bg: '#26A17B', fg: '#FFFFFF', label: '₮' },
  USDC: { bg: '#2775CA', fg: '#FFFFFF', label: '$' },
  XRP: { bg: '#23292F', fg: '#FFFFFF', label: '✕' },
  ADA: { bg: '#0033AD', fg: '#FFFFFF', label: '₳' },
  DOGE: { bg: '#C2A633', fg: '#FFFFFF', label: 'Ð' },
  AVAX: { bg: '#E84142', fg: '#FFFFFF', label: 'A' },
  LINK: { bg: '#2A5ADA', fg: '#FFFFFF', label: '⬡' },
  SUI: { bg: '#4DA2FF', fg: '#FFFFFF', label: 'S' },
  NEAR: { bg: '#00EC97', fg: '#0B0E11', label: 'N' },
  RENDER: { bg: '#E91E63', fg: '#FFFFFF', label: 'R' },
  UNI: { bg: '#FF007A', fg: '#FFFFFF', label: 'U' },
  AAVE: { bg: '#B6509E', fg: '#FFFFFF', label: 'A' },
  ARB: { bg: '#28A0F0', fg: '#FFFFFF', label: 'A' },
  DOT: { bg: '#E6007A', fg: '#FFFFFF', label: '●' },
};

export const CryptoIcon: React.FC<{
  symbol: string;
  size?: 'xs' | 'sm' | 'md' | 'lg';
}> = ({ symbol, size = 'md' }) => {
  const clean = symbol.replace('USDT', '').replace('USDC', '') || symbol;
  const meta = COIN_META[clean] || {
    bg: '#F0B90B',
    fg: '#181A20',
    label: clean.slice(0, 1),
  };

  const sizeClasses =
    size === 'xs'
      ? 'w-4 h-4 text-[10px]'
      : size === 'sm'
      ? 'w-5 h-5 text-[11px]'
      : size === 'lg'
      ? 'w-8 h-8 text-sm'
      : 'w-6 h-6 text-xs';

  return (
    <span
      style={{ backgroundColor: meta.bg, color: meta.fg }}
      className={`${sizeClasses} rounded-full inline-flex items-center justify-center font-bold shrink-0 select-none shadow-xs`}
    >
      {meta.label}
    </span>
  );
};
