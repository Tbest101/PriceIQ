import React from 'react';

interface Props {
  onClose: () => void;
}

export const HowItWorksModal: React.FC<Props> = ({ onClose }) => {
  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 'var(--spacing-md)',
        animation: 'fadeIn 0.3s ease',
      }}
      onClick={onClose}
    >
      <div
        className="glass-panel"
        style={{
          width: '100%', maxWidth: '500px',
          padding: 'var(--spacing-xl)',
          position: 'relative',
          background: 'rgba(15, 15, 20, 0.95)',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.5)'
        }}
        onClick={e => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          style={{ position: 'absolute', top: '12px', right: '16px', color: 'var(--text-muted)', fontSize: '1.5rem', background: 'none', border: 'none', cursor: 'pointer', transition: 'color 0.2s' }}
          onMouseOver={e => e.currentTarget.style.color = 'var(--text-main)'}
          onMouseOut={e => e.currentTarget.style.color = 'var(--text-muted)'}
        >&times;</button>

        <h2 style={{ fontSize: '1.8rem', marginBottom: 'var(--spacing-lg)', textAlign: 'center', color: 'var(--text-main)' }}>
          How <span className="text-gradient">Less4More</span> Works
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-lg)' }}>
          <div style={{ display: 'flex', gap: 'var(--spacing-md)' }}>
            <div style={{ fontSize: '2rem', background: 'rgba(139, 92, 246, 0.1)', width: '48px', height: '48px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>🛒</div>
            <div>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '4px', color: 'var(--text-main)' }}>1. Build Your Basket</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: '1.5', margin: 0 }}>Search for groceries, apparel, and everyday items to build your shopping list. We search live prices across major retailers.</p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 'var(--spacing-md)' }}>
            <div style={{ fontSize: '2rem', background: 'rgba(59, 130, 246, 0.1)', width: '48px', height: '48px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>🏢</div>
            <div>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '4px', color: 'var(--text-main)' }}>2. Select Your Planned Store</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: '1.5', margin: 0 }}>Tell us where you were originally planning to shop (e.g., Target, Walmart, Whole Foods) so we can establish a baseline cost.</p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 'var(--spacing-md)' }}>
            <div style={{ fontSize: '2rem', background: 'rgba(16, 185, 129, 0.1)', width: '48px', height: '48px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>✨</div>
            <div>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '4px', color: 'var(--text-main)' }}>3. Optimize & Compare</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: '1.5', margin: 0 }}>Our engine calculates the absolute cheapest combination of stores for your items and shows your exact savings compared to your original shopping plan.</p>
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          style={{ width: '100%', padding: 'var(--spacing-md)', background: 'var(--gradient-brand)', borderRadius: 'var(--radius-full)', color: '#fff', fontWeight: 600, fontSize: '1.1rem', marginTop: 'var(--spacing-2xl)', border: 'none', cursor: 'pointer', transition: 'transform 0.2s', boxShadow: '0 4px 15px rgba(139, 92, 246, 0.3)' }}
          onMouseOver={e => e.currentTarget.style.transform = 'translateY(-2px)'}
          onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}
        >Got it, let's go!</button>
      </div>
    </div>
  );
};
