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
      {/* App Icon Badge (Squircle container matching brand image with 3D tactile depth) */}
      <div
        style={{
          width: containerSize,
          height: containerSize,
          borderRadius: enclosed ? '22%' : '0%',
          background: enclosed ? 'linear-gradient(145deg, #0e293a 0%, #061523 100%)' : 'transparent',
          boxShadow: enclosed ? '0 8px 20px rgba(0, 0, 0, 0.5), inset 0 1px 1px rgba(255, 255, 255, 0.2), inset 0 -2px 4px rgba(0, 0, 0, 0.6)' : 'none',
          border: enclosed ? '1px solid rgba(255, 255, 255, 0.12)' : 'none',
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
          viewBox="0 0 100 115"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Playful Multi-Stop Gradient from luminous lime to deep forest teal */}
            <linearGradient id="priceiq-playful-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#6EE7B7" />   {/* Light luminous mint-lime */}
              <stop offset="35%" stopColor="#34D399" />  {/* Bright emerald */}
              <stop offset="70%" stopColor="#10B981" />  {/* Rich brand green */}
              <stop offset="100%" stopColor="#047857" /> {/* Deep forest teal */}
            </linearGradient>

            {/* Inner highlight overlay for 3D shine */}
            <linearGradient id="priceiq-shine" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.4" />
              <stop offset="50%" stopColor="#FFFFFF" stopOpacity="0.0" />
            </linearGradient>
          </defs>
          
          {/* Outer P-loop curve & tag shape */}
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
            fill="url(#priceiq-playful-gradient)"
          />

          {/* 3D Top Shine Overlay */}
          <path
            d="M 22 10 H 62 C 85 10, 88 52, 62 52 H 44 V 85 L 32 102 L 20 85 V 22 C 20 14, 22 10, 22 10 Z"
            fill="url(#priceiq-shine)"
          />

          {/* Hole punch in tag top left */}
          <circle cx="33" cy="22" r="5" fill="#061523" />

          {/* Downward arrow cutout inside bottom stem */}
          <path
            d="M 32 88 L 24 76 H 29 V 64 H 35 V 76 H 40 Z"
            fill="#061523"
          />

          {/* P inner hole cut */}
          <path
            d="M 44 26 H 58 C 66 26, 66 36, 58 36 H 44 Z"
            fill="#061523"
          />
        </svg>
      </div>

      {/* Typography: PriceIQ */}
      {showText && (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ fontSize: `${size * 0.7}px`, fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1, color: 'var(--text-main)' }}>
            Price<span style={{
              background: 'linear-gradient(135deg, #6EE7B7 0%, #10B981 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>IQ</span>
          </div>
          {showTagline && (
            <span style={{ fontSize: `${Math.max(10, size * 0.2)}px`, fontWeight: 700, letterSpacing: '0.12em', color: '#34D399', marginTop: '4px', textTransform: 'uppercase' }}>
              Smarter Prices. Better Choices.
            </span>
          )}
        </div>
      )}
    </div>
  );
};
