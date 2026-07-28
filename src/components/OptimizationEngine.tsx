import React, { useState, useEffect } from 'react';
import type { BasketItem } from '../types';

// Store emoji/color mappings for known retailers
const STORE_STYLES: Record<string, { logo: string; color: string }> = {
  'walmart': { logo: '🏪', color: '#0071dc' },
  'target': { logo: '🎯', color: '#cc0000' },
  'whole foods': { logo: '🌿', color: '#00674b' },
  'amazon': { logo: '📦', color: '#ff9900' },
  'kroger': { logo: '🛒', color: '#0066cc' },
  'costco': { logo: '🏬', color: '#e31837' },
  'default': { logo: '🛍️', color: '#8b5cf6' },
};

function getStoreStyle(name: string) {
  const lower = name.toLowerCase();
  for (const key of Object.keys(STORE_STYLES)) {
    if (key !== 'default' && lower.includes(key)) return STORE_STYLES[key];
  }
  return STORE_STYLES['default'];
}

const Thumbnail = ({ name, image, size = 24 }: { name: string, image?: string, size?: number }) => {
  if (image) {
    return <img src={image} alt={name} style={{ width: size, height: size, objectFit: 'contain', borderRadius: '4px', background: 'white', flexShrink: 0 }} />;
  }
  return (
    <div style={{ width: size, height: size, borderRadius: '4px', background: 'var(--surface-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: size * 0.5, color: 'var(--text-muted)', flexShrink: 0, fontWeight: 600 }}>
      {name.charAt(0).toUpperCase()}
    </div>
  );
};

interface OptimizationResult {
  source: string;
  baselineStore: {
    name: string;
    total: number;
    items: { name: string; quantity: number; unitPrice: number; lineTotal: number; title: string }[];
  };
  optimalSplit: {
    stores: string[];
    total: number;
    items: { name: string; quantity: number; store: string; unitPrice: number; lineTotal: number; title: string }[];
    savingsAmount: number;
    savingsPercent: number;
  };
}

interface Props {
  basket: BasketItem[];
  location: string;
  plannedStore: string;
  onBack: () => void;
  onConfirm: (data: any) => void;
}

export const OptimizationEngine: React.FC<Props> = ({ basket, location, plannedStore, onBack, onConfirm }) => {
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<OptimizationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const optimize = async () => {
      setLoading(true);
      setError(null);
      try {
        const items = basket.map(b => ({ name: b.size ? `${b.product.name} (Size: ${b.size})` : b.product.name, quantity: b.quantity }));
        const response = await fetch('/api/optimize', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ items, location: location.trim() || undefined, plannedStore }),
        });
        if (!response.ok) throw new Error(`Server error: ${response.status}`);
        const data = await response.json();
        setResult(data);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        setError(message);
      } finally {
        setLoading(false);
      }
    };
    optimize();
  }, [basket]);

  const totalItems = basket.reduce((acc, curr) => acc + curr.quantity, 0);

  if (loading) {
    return (
      <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '400px', gap: 'var(--spacing-md)', padding: '0 var(--spacing-md)' }}>
        <div style={{ fontSize: '3rem', animation: 'spin 2s linear infinite' }}>⚙️</div>
        <h2 style={{ fontSize: '1.5rem', color: 'var(--text-main)', textAlign: 'center' }}>Optimizing your basket...</h2>
        <p style={{ color: 'var(--text-muted)', textAlign: 'center' }}>Scanning real prices{location ? ` near ${location}` : ''} across retailers</p>
        <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (error || !result) {
    return (
      <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '400px', gap: 'var(--spacing-md)', padding: '0 var(--spacing-md)' }}>
        <div style={{ fontSize: '3rem' }}>⚠️</div>
        <h2 style={{ fontSize: '1.5rem', color: 'var(--text-main)' }}>Optimization Error</h2>
        <p style={{ color: 'var(--text-muted)' }}>{error || 'Something went wrong.'}</p>
        <button onClick={onBack} style={{ color: 'var(--primary)', fontWeight: 500 }}>&larr; Go Back</button>
      </div>
    );
  }

  const { baselineStore, optimalSplit } = result;
  const singleStyle = getStoreStyle(baselineStore.name);

  return (
    <div className="optimization-layout animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--spacing-sm)' }}>
        <button onClick={onBack} style={{ color: 'var(--text-muted)' }}>&larr; Back to Basket</button>
        <span style={{ fontSize: '0.75rem', padding: '2px 10px', borderRadius: 'var(--radius-full)', background: result.source === 'serpapi' ? 'rgba(16,185,129,0.15)' : 'rgba(139,92,246,0.15)', color: result.source === 'serpapi' ? 'var(--success)' : 'var(--primary)' }}>
          {result.source === 'serpapi' ? '🌐 Live Prices' : '📦 Demo Data'}
        </span>
      </div>
      
      <div style={{ textAlign: 'center', marginBottom: 'var(--spacing-lg)' }}>
        <h2 style={{ fontSize: 'clamp(1.5rem, 5vw, 2.5rem)', marginBottom: 'var(--spacing-sm)' }}>Optimization Complete</h2>
        <p style={{ fontSize: 'clamp(0.95rem, 2.5vw, 1.2rem)', color: 'var(--text-muted)' }}>
          We found <strong style={{ color: 'var(--success)' }}>{optimalSplit.savingsPercent}% savings</strong> for your {totalItems} items.
        </p>
      </div>

      <div className="comparison-row">
        {/* Single Retailer Card */}
        <div className="glass-panel comparison-card-single" style={{ padding: 'var(--spacing-xl)', display: 'flex', flexDirection: 'column', opacity: 0.7, transform: 'scale(0.95)' }}>
          <h3 style={{ fontSize: '1.2rem', color: 'var(--text-muted)', marginBottom: 'var(--spacing-md)' }}>Your Planned Store</h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)', marginBottom: 'var(--spacing-lg)' }}>
            <span style={{ fontSize: '2rem' }}>{singleStyle.logo}</span>
            <span style={{ fontSize: '1.2rem', fontWeight: 600 }}>{baselineStore.name}</span>
          </div>
          <div style={{ fontSize: 'clamp(2rem, 6vw, 3rem)', fontWeight: 700, marginBottom: 'var(--spacing-xs)' }}>
            ${baselineStore.total.toFixed(2)}
          </div>
          <p style={{ color: 'var(--text-muted)' }}>If you bought everything at {baselineStore.name}.</p>
          
          {/* Item breakdown */}
          <div style={{ marginTop: 'var(--spacing-md)', borderTop: '1px solid var(--surface-border)', paddingTop: 'var(--spacing-sm)' }}>
            {baselineStore.items.map((item, i) => {
              const image = basket.find(b => (b.size ? `${b.product.name} (Size: ${b.size})` : b.product.name) === item.name)?.product.image;
              return (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem', padding: '4px 0', color: 'var(--text-muted)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)', flex: 1, minWidth: 0, marginRight: '8px' }}>
                  <Thumbnail name={item.name} image={image} size={24} />
                  <span style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.quantity}x {item.name}</span>
                </div>
                <span style={{ flexShrink: 0 }}>${item.lineTotal.toFixed(2)}</span>
              </div>
            )})}
          </div>
        </div>

        {/* Optimized Split Card */}
        <div className="glass-panel comparison-card-optimal" style={{ padding: 'var(--spacing-xl)', position: 'relative', border: '2px solid var(--primary)', boxShadow: '0 0 30px rgba(139, 92, 246, 0.2)' }}>
          <div style={{ position: 'absolute', top: '-15px', right: '20px', background: 'var(--gradient-brand)', color: 'white', padding: 'var(--spacing-xs) var(--spacing-sm)', borderRadius: 'var(--radius-full)', fontWeight: 600, fontSize: '0.8rem' }}>RECOMMENDED</div>
          
          <h3 style={{ fontSize: '1.2rem', color: 'var(--primary)', marginBottom: 'var(--spacing-md)' }}>Optimal Split</h3>
          <div style={{ display: 'flex', gap: 'var(--spacing-sm)', marginBottom: 'var(--spacing-lg)', alignItems: 'center', flexWrap: 'wrap' }}>
            {optimalSplit.stores.map((store, i) => {
              const style = getStoreStyle(store);
              return (
                <span key={i} style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.9rem', background: 'rgba(255,255,255,0.05)', padding: '4px 10px', borderRadius: 'var(--radius-full)' }}>
                  <span>{style.logo}</span>
                  <span style={{ fontWeight: 500, color: 'var(--text-main)' }}>{store}</span>
                </span>
              );
            })}
            <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{optimalSplit.stores.length} Stop{optimalSplit.stores.length > 1 ? 's' : ''}</span>
          </div>
          <div style={{ fontSize: 'clamp(2rem, 6vw, 3.5rem)', fontWeight: 700, marginBottom: 'var(--spacing-xs)', color: 'var(--text-main)', display: 'flex', alignItems: 'baseline', gap: 'var(--spacing-sm)', flexWrap: 'wrap' }}>
            ${optimalSplit.total.toFixed(2)}
            <span style={{ fontSize: 'clamp(0.9rem, 2vw, 1.2rem)', color: 'var(--success)', fontWeight: 500 }}>-${optimalSplit.savingsAmount.toFixed(2)} saved</span>
          </div>

          {/* Travel Overhead & Net Savings Badge */}
          {optimalSplit.stores.length > 1 && (
            <div style={{ fontSize: '0.85rem', background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.3)', padding: '6px 12px', borderRadius: 'var(--radius-md)', color: '#fbbf24', marginTop: 'var(--spacing-xs)', marginBottom: 'var(--spacing-md)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>🚗 Travel Overhead (-${(optimalSplit.stores.length - 1) * 2.50}):</span>
              <strong style={{ color: (optimalSplit.savingsAmount - (optimalSplit.stores.length - 1) * 2.50) > 0 ? 'var(--success)' : '#f87171' }}>
                Net ${Math.max(0, (optimalSplit.savingsAmount - (optimalSplit.stores.length - 1) * 2.50)).toFixed(2)} Value
              </strong>
            </div>
          )}
          
          {/* Optimal item breakdown by store */}
          <div style={{ marginTop: 'var(--spacing-md)', borderTop: '1px solid var(--surface-border)', paddingTop: 'var(--spacing-md)' }}>
            <h4 style={{ fontSize: '1rem', marginBottom: 'var(--spacing-sm)' }}>Shopping List Breakdown</h4>
            {optimalSplit.items.map((item: any, i: number) => {
              const storeStyle = getStoreStyle(item.store);
              const image = basket.find(b => (b.size ? `${b.product.name} (Size: ${b.size})` : b.product.name) === item.name)?.product.image;
              return (
                <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(255,255,255,0.02)', padding: 'var(--spacing-sm)', borderRadius: 'var(--radius-sm)', marginBottom: '4px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)', flex: 1, minWidth: 0 }}>
                    <span style={{ fontSize: '0.9rem', flexShrink: 0 }}>{storeStyle.logo}</span>
                    <Thumbnail name={item.name} image={image} size={28} />
                    <div style={{ minWidth: 0, display: 'flex', flexDirection: 'column' }}>
                      <span style={{ color: 'var(--text-main)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '0.9rem' }}>{item.quantity}x {item.name}</span>
                      {item.unitPriceNormalized && (
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                          ${item.unitPriceNormalized.toFixed(2)}/{item.unitType || 'unit'}
                        </span>
                      )}
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', flexShrink: 0, marginLeft: '8px' }}>
                    <span style={{ color: 'var(--success)', fontWeight: 600, fontSize: '0.9rem' }}>${item.lineTotal.toFixed(2)}</span>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>@ {item.store}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      
      <div style={{ textAlign: 'center', marginTop: 'var(--spacing-lg)' }}>
        <button 
          className="btn-3d"
          onClick={() => onConfirm(optimalSplit)}
          style={{ padding: '16px 36px', fontSize: '1.2rem', width: '100%', maxWidth: '340px' }}>
          ✨ Confirm Route &amp; Fulfillment
        </button>
      </div>

    </div>
  );
};
