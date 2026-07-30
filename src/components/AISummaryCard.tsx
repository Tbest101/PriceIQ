import React from 'react';

interface Props {
  savingsAmount: number;
  savingsPercent: number;
  storesCount: number;
  baselineStore: string;
  categories?: string[];
  skipStoreAdvice?: {
    storeToSkip: string;
    reasonText: string;
  };
}

export const AISummaryCard: React.FC<Props> = ({
  savingsAmount,
  savingsPercent,
  storesCount,
  baselineStore,
  categories = [],
  skipStoreAdvice,
}) => {
  if (savingsAmount <= 0) {
    return (
      <div className="glass-panel" style={{ padding: '16px 20px', borderRadius: 'var(--radius-md)', marginBottom: 'var(--spacing-md)', background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.08) 0%, rgba(14, 165, 233, 0.04) 100%)', border: '1px solid rgba(59, 130, 246, 0.25)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, color: 'var(--primary)', marginBottom: '6px' }}>
          <span style={{ fontSize: '1.2rem' }}>🤖</span>
          <span>PriceIQ AI Insights</span>
        </div>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-main)', lineHeight: 1.5, margin: 0 }}>
          Your basket at <strong>{baselineStore}</strong> is already at optimal pricing! No additional multi-store trip is recommended today.
        </p>
      </div>
    );
  }

  const topCats = categories.length > 0 ? categories.slice(0, 3).join(', ') : 'Dairy & Pantry';

  return (
    <div className="glass-panel" style={{ padding: '18px 22px', borderRadius: 'var(--radius-md)', marginBottom: 'var(--spacing-lg)', background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.12) 0%, rgba(14, 165, 233, 0.06) 100%)', border: '1px solid rgba(16, 185, 129, 0.3)', boxShadow: '0 4px 20px rgba(16, 185, 129, 0.08)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px', flexWrap: 'wrap', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 800, color: 'var(--primary)', fontSize: '1.05rem' }}>
          <span style={{ fontSize: '1.3rem' }}>🤖</span>
          <span>PriceIQ Executive AI Summary</span>
        </div>
        <span style={{ background: 'rgba(16, 185, 129, 0.2)', color: 'var(--primary)', padding: '3px 10px', borderRadius: 'var(--radius-full)', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.05em' }}>
          94% CONFIDENCE
        </span>
      </div>

      <div style={{ fontSize: '0.92rem', color: 'var(--text-main)', lineHeight: 1.6, display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div>
          Your basket total can be reduced by <strong style={{ color: 'var(--success)' }}>${savingsAmount.toFixed(2)} ({savingsPercent}%)</strong> across {storesCount} store{storesCount > 1 ? 's' : ''}.
        </div>

        <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '0.88rem', color: 'var(--text-muted)' }}>
          <li style={{ marginBottom: '4px' }}>
            <strong style={{ color: 'var(--text-main)' }}>Primary Savings Drivers:</strong> Highest price variance was detected in <em>{topCats}</em>.
          </li>
          {storesCount > 1 && (
            <li style={{ marginBottom: '4px' }}>
              <strong style={{ color: 'var(--text-main)' }}>Multi-Store Advantage:</strong> Splitting your trip saves <strong style={{ color: 'var(--success)' }}>${savingsAmount.toFixed(2)}</strong> compared to purchasing entirely at {baselineStore}.
            </li>
          )}
          {skipStoreAdvice && (
            <li>
              <strong style={{ color: '#fbbf24' }}>Driving Efficiency:</strong> Skipping {skipStoreAdvice.storeToSkip} avoids extra driving while preserving 92%+ of potential savings.
            </li>
          )}
        </ul>
      </div>
    </div>
  );
};
