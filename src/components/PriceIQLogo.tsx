import React from 'react';

interface Props {
  size?: number;
  showTagline?: boolean;
  showText?: boolean;
}

export const PriceIQLogo: React.FC<Props> = ({ size = 36, showTagline = false, showText = true }) => {
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '12px', userSelect: 'none' }}>
      {/* PriceIQ Icon - P-tag with downward arrow */}
      <svg
        width={size}
        height={size * 1.15}
        viewBox="0 0 100 115"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ flexShrink: 0 }}
      >
        <defs>
          <linearGradient id="priceiq-green" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#10B981" />
            <stop offset="100%" stopColor="#059669" />
          </linearGradient>
        </defs>
        
        {/* P-shaped price tag body */}
        <path
          d="M 25 10 
             L 60 10 
             C 82 10, 82 48, 60 48 
             L 45 48 
             L 45 80 
             L 32 95 
             L 20 80 
             L 20 25 
             C 20 16, 25 10, 25 10 Z"
          fill="url(#priceiq-green)"
        />

        {/* Outer P-loop curve extension matching brand image */}
        <path
          d="M 22 10 
             H 62 
             C 85 10, 88 52, 62 52 
             H 44 
             V 85 
             L 32 102 
             L 20 85 
             V 22 
             C 20 14, 22 10, 22 10 Z"
          fill="url(#priceiq-green)"
        />

        {/* Hole punch in tag top left */}
        <circle cx="33" cy="22" r="5" fill="#090D16" />

        {/* Downward arrow cutout inside bottom stem */}
        <path
          d="M 32 88 L 24 76 H 29 V 64 H 35 V 76 H 40 Z"
          fill="#FFFFFF"
        />

        {/* P inner hole cut for clean typography */}
        <path
          d="M 44 26 H 58 C 66 26, 66 36, 58 36 H 44 Z"
          fill="#090D16"
        />
      </svg>

      {/* Typography: PriceIQ */}
      {showText && (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ fontSize: `${size * 0.75}px`, fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1, color: 'var(--text-main)' }}>
            Price<span style={{ color: '#10B981' }}>IQ</span>
          </div>
          {showTagline && (
            <span style={{ fontSize: `${Math.max(10, size * 0.22)}px`, fontWeight: 700, letterSpacing: '0.12em', color: '#10B981', marginTop: '4px', textTransform: 'uppercase' }}>
              Smarter Prices. Better Choices.
            </span>
          )}
        </div>
      )}
    </div>
  );
};
