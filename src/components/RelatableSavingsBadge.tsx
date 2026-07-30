import React from 'react';

interface Props {
  savingsAmount: number;
}

export const RelatableSavingsBadge: React.FC<Props> = ({ savingsAmount }) => {
  if (savingsAmount <= 0) return null;

  // Compute relatable savings equivalencies
  const milkGallons = (savingsAmount / 3.49).toFixed(1);
  const coffees = Math.floor(savingsAmount / 4.50);
  const pizza = savingsAmount >= 15.00;

  let text = `🥛 ${milkGallons} gallons of milk`;
  if (pizza && savingsAmount >= 18) {
    text = `🍕 dinner for two ($${savingsAmount.toFixed(2)})`;
  } else if (coffees >= 3) {
    text = `☕ ${coffees} specialty coffees`;
  } else if (savingsAmount >= 10) {
    text = `🥛 ${milkGallons} gallons of milk`;
  }

  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, rgba(16, 185, 129, 0.12) 100%)', border: '1px solid rgba(245, 158, 11, 0.35)', color: '#fbbf24', padding: '4px 12px', borderRadius: 'var(--radius-full)', fontSize: '0.82rem', fontWeight: 600 }}>
      <span>🎉 Great Choice! Equal to</span>
      <strong style={{ color: 'white' }}>{text}</strong>
    </div>
  );
};
