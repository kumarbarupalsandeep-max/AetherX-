import React from 'react';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
}

export const Logo: React.FC<LogoProps> = ({
  className = '',
  size = 'md',
  showText = true,
}) => {
  const iconSizes = {
    sm: 'w-5 h-5',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  };

  const textSizes = {
    sm: 'text-base',
    md: 'text-[19px]',
    lg: 'text-2xl',
  };

  return (
    <div className={`inline-flex items-center gap-2 select-none shrink-0 ${className}`}>
      {/* Binance-identical 5-Diamond Geometric Emblem */}
      <svg
        className={`${iconSizes[size]} shrink-0 transition-transform hover:scale-105`}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <path d="M12 2.5L15.5 6L12 9.5L8.5 6L12 2.5Z" fill="#2E68FF" />
        <path d="M5.5 9L9 12.5L5.5 16L2 12.5L5.5 9Z" fill="#2E68FF" />
        <path d="M18.5 9L22 12.5L18.5 16L15 12.5L18.5 9Z" fill="#2E68FF" />
        <path d="M12 14.5L15.5 18L12 21.5L8.5 18L12 14.5Z" fill="#2E68FF" />
        <path d="M12 9.8L14.2 12L12 14.2L9.8 12L12 9.8Z" fill="#2E68FF" />
      </svg>

      {showText && (
        <div className="flex items-center gap-1 font-display leading-none">
          <span className={`${textSizes[size]} font-black tracking-wider text-[var(--text-primary)]`}>
            BINANCE
          </span>
        </div>
      )}
    </div>
  );
};
