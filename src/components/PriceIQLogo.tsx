import React from 'react';

interface Props {
  size?: number;
  showTagline?: boolean;
  showText?: boolean;
  enclosed?: boolean;
}

export const PriceIQLogo: React.FC<Props> = ({ 
  size = 40, 
  showTagline = false, 
  showText = true,
  enclosed = true 
}) => {
  const iconSize = size;
  const containerSize = enclosed ? size * 1.25 : size;

  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '12px', userSelect: 'none' }}>
      {/* App Icon Badge (Sleek Fintech Squircle Container) */}
      <div
        style={{
          width: containerSize,
          height: containerSize,
          borderRadius: enclosed ? '24%' : '0%',
          background: enclosed ? 'linear-gradient(145deg, #0e2d36 0%, #051418 100%)' : 'transparent',
          boxShadow: enclosed ? '0 10px 25px rgba(0, 0, 0, 0.4), inset 0 1px 1px rgba(255, 255, 255, 0.25), inset 0 -2px 4px rgba(0, 0, 0, 0.7)' : 'none',
          border: enclosed ? '1px solid rgba(255, 255, 255, 0.15)' : 'none',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          padding: enclosed ? '4px' : '0'
        }}
      >
        <svg
          width={iconSize * 0.75}
          height={iconSize * 0.85}
          viewBox="0 0 100 110"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Premium Emerald-to-Teal Fintech Gradient */}
            <linearGradient id="priceiq-fintech-p-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#34D399" />   {/* Luminous Mint-Emerald */}
              <stop offset="50%" stopColor="#059669" />  {/* Deep Emerald Green */}
              <stop offset="100%" stopColor="#0EA5E9" /> {/* Intelligence Teal-Blue */}
            </linearGradient>

            <linearGradient id="p-inner-shadow" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#000000" stopOpacity="0.3" />
            </linearGradient>
          </defs>
          
          {/* Distinctive Stylized Geometric "P" Mark */}
          {/* Vertical Stem */}
          <rect
            x="18"
            y="12"
            width="20"
            height="86"
            rx="10"
            fill="url(#priceiq-fintech-p-gradient)"
          />

          {/* Upper "P" Loop */}
          <path
            d="M 28 12 
               H 60 
               C 78 12, 88 24, 88 40 
               C 88 56, 78 68, 60 68 
               H 28 
               V 48 
               H 58 
               C 64 48, 68 44, 68 40 
               C 68 36, 64 32, 58 32 
               H 28 
               Z"
            fill="url(#priceiq-fintech-p-gradient)"
          />

          {/* Downward Arrow Cutout inside vertical stem symbolizing price drops & savings */}
          <path
            d="M 28 94 L 20 80 H 24 V 68 H 32 V 80 H 36 Z"
            fill="#051418"
          />

          {/* Precision Analytics Spark Cutout */}
          <circle cx="60" cy="40" r="6" fill="#051418" />
        </svg>
      </div>

      {/* Typography: PriceIQ */}
      {showText && (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ fontSize: `${size * 0.72}px`, fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1, color: 'var(--text-main)' }}>
            Price<span style={{
              background: 'linear-gradient(135deg, #10B981 0%, #0EA5E9 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>IQ</span>
          </div>
          {showTagline && (
            <span style={{ fontSize: `${Math.max(10, size * 0.2)}px`, fontWeight: 700, letterSpacing: '0.12em', color: '#10B981', marginTop: '4px', textTransform: 'uppercase' }}>
              Smarter Prices. Better Choices.
            </span>
          )}
        </div>
      )}
    </div>
  );
};
