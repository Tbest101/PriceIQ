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
  const [activeMode, setActiveMode] = useState<'single' | 'balanced' | 'max_savings'>('balanced');

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
  const modes = (result?.optimalSplit as any)?.modes;
  const currentPlan = modes ? modes[activeMode === 'single' ? 'single' : activeMode === 'balanced' ? 'balanced' : 'maxSavings'] : null;

  return (
    <div className="optimization-layout animate-fade-in" style={{ width: '100%', maxWidth: '1050px', margin: '0 auto' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-md)', flexWrap: 'wrap', gap: 'var(--spacing-sm)' }}>
        <button className="nav-text" onClick={onBack} style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
          ← Back to Basket
        </button>
        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          📍 Location: <strong style={{ color: 'var(--text-main)' }}>{location || '78753 (Austin, TX)'}</strong>
        </span>
      </div>
      
      <div style={{ textAlign: 'center', marginBottom: 'var(--spacing-lg)' }}>
        <h2 style={{ fontSize: 'clamp(1.6rem, 5vw, 2.6rem)', fontWeight: 800, marginBottom: 'var(--spacing-xs)' }}>
          PriceIQ Smart Optimization
        </h2>
        <p style={{ fontSize: 'clamp(0.95rem, 2.5vw, 1.15rem)', color: 'var(--text-muted)' }}>
          Comparing your list of {totalItems} items across nearby retailers
        </p>
      </div>

      {/* 3 Shopping Modes Convenience Selector */}
      <div className="glass-panel" style={{ padding: '8px', marginBottom: 'var(--spacing-xl)', borderRadius: 'var(--radius-full)', display: 'flex', gap: '8px', flexWrap: 'wrap', background: 'rgba(255, 255, 255, 0.03)' }}>
        <button
          onClick={() => setActiveMode('single')}
          style={{ flex: 1, padding: '12px 16px', borderRadius: 'var(--radius-full)', border: 'none', background: activeMode === 'single' ? 'rgba(255, 255, 255, 0.12)' : 'transparent', color: activeMode === 'single' ? 'var(--text-main)' : 'var(--text-muted)', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s', minWidth: '150px' }}>
          🛒 Single Store <span style={{ fontSize: '0.8rem', opacity: 0.7 }}>(1 Stop)</span>
        </button>
        <button
          onClick={() => setActiveMode('balanced')}
          style={{ flex: 1.2, padding: '12px 16px', borderRadius: 'var(--radius-full)', border: 'none', background: activeMode === 'balanced' ? 'var(--gradient-brand)' : 'transparent', color: '#fff', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s', boxShadow: activeMode === 'balanced' ? '0 4px 15px rgba(16, 185, 129, 0.4)' : 'none', minWidth: '180px' }}>
          ⭐ Balanced <span style={{ fontSize: '0.8rem', opacity: 0.9 }}>(2 Stores • Best Value)</span>
        </button>
        <button
          onClick={() => setActiveMode('max_savings')}
          style={{ flex: 1, padding: '12px 16px', borderRadius: 'var(--radius-full)', border: 'none', background: activeMode === 'max_savings' ? 'rgba(255, 255, 255, 0.12)' : 'transparent', color: activeMode === 'max_savings' ? 'var(--text-main)' : 'var(--text-muted)', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s', minWidth: '150px' }}>
          ⚡ Max Savings <span style={{ fontSize: '0.8rem', opacity: 0.7 }}>(All Stores)</span>
        </button>
      </div>

      <div className="comparison-row">
        {/* Baseline Store Card */}
        <div className="glass-panel comparison-card-single" style={{ padding: 'var(--spacing-xl)', display: 'flex', flexDirection: 'column', opacity: 0.75, transform: 'scale(0.96)' }}>
          <h3 style={{ fontSize: '1.1rem', color: 'var(--text-muted)', marginBottom: 'var(--spacing-md)' }}>Cheapest Single Store</h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)', marginBottom: 'var(--spacing-md)' }}>
            <span style={{ fontSize: '2rem' }}>{singleStyle.logo}</span>
            <span style={{ fontSize: '1.2rem', fontWeight: 600 }}>{baselineStore.name}</span>
          </div>
          <div style={{ fontSize: 'clamp(2rem, 6vw, 3rem)', fontWeight: 700, marginBottom: 'var(--spacing-xs)' }}>
            ${baselineStore.total.toFixed(2)}
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>If you bought everything at {baselineStore.name} (1 stop).</p>
          
          {/* Baseline Item breakdown */}
          <div style={{ marginTop: 'var(--spacing-md)', borderTop: '1px solid var(--surface-border)', paddingTop: 'var(--spacing-sm)' }}>
            {baselineStore.items.map((item, i) => {
              const image = basket.find(b => (b.size ? `${b.product.name} (Size: ${b.size})` : b.product.name) === item.name)?.product.image;
              return (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem', padding: '6px 0', color: 'var(--text-muted)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)', flex: 1, minWidth: 0, marginRight: '8px' }}>
                  <Thumbnail name={item.name} image={image} size={24} />
                  <span style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.quantity}x {item.name}</span>
                </div>
                <span style={{ flexShrink: 0, fontWeight: 500 }}>${item.lineTotal.toFixed(2)}</span>
              </div>
            )})}
          </div>
        </div>

        {/* Selected Shopping Plan Card */}
        <div className="glass-panel comparison-card-optimal" style={{ padding: 'var(--spacing-xl)', position: 'relative', border: '2px solid var(--primary)', boxShadow: '0 0 30px rgba(16, 185, 129, 0.2)' }}>
          <div style={{ position: 'absolute', top: '-15px', right: '20px', background: 'var(--gradient-brand)', color: 'white', padding: 'var(--spacing-xs) var(--spacing-sm)', borderRadius: 'var(--radius-full)', fontWeight: 700, fontSize: '0.8rem', letterSpacing: '0.05em' }}>
            {activeMode === 'balanced' ? '⭐ RECOMMENDED PLAN' : activeMode === 'single' ? '🛒 1 STORE PLAN' : '⚡ MAXIMUM SAVINGS'}
          </div>
          
          <h3 style={{ fontSize: '1.2rem', color: 'var(--primary)', marginBottom: 'var(--spacing-md)' }}>
            PriceIQ Smart Basket ⭐
          </h3>

          <div style={{ display: 'flex', gap: 'var(--spacing-sm)', marginBottom: 'var(--spacing-md)', alignItems: 'center', flexWrap: 'wrap' }}>
            {(currentPlan?.stores || optimalSplit.stores).map((store: string, i: number) => {
              const style = getStoreStyle(store);
              return (
                <span key={i} style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.9rem', background: 'rgba(255,255,255,0.05)', padding: '4px 12px', borderRadius: 'var(--radius-full)', border: '1px solid rgba(255,255,255,0.1)' }}>
                  <span>{style.logo}</span>
                  <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{store}</span>
                </span>
              );
            })}
          </div>

          <div style={{ fontSize: 'clamp(2.2rem, 6vw, 3.5rem)', fontWeight: 800, marginBottom: 'var(--spacing-xs)', color: 'var(--text-main)', display: 'flex', alignItems: 'baseline', gap: 'var(--spacing-sm)', flexWrap: 'wrap' }}>
            ${(currentPlan?.total || optimalSplit.total).toFixed(2)}
            <span style={{ fontSize: 'clamp(1rem, 2vw, 1.3rem)', color: 'var(--success)', fontWeight: 700 }}>
              -${(currentPlan?.savingsAmount || optimalSplit.savingsAmount).toFixed(2)} saved
            </span>
          </div>

          {/* Friction Overhead Details */}
          <div style={{ fontSize: '0.88rem', background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.25)', padding: '8px 14px', borderRadius: 'var(--radius-md)', color: 'var(--text-main)', marginBottom: 'var(--spacing-md)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
            <span>🚗 <strong>{currentPlan?.stops || optimalSplit.stores.length} Stop{(currentPlan?.stops || optimalSplit.stores.length) > 1 ? 's' : ''}</strong> • {currentPlan?.extraMiles || 3.1} miles • ~{currentPlan?.extraMinutes || 9} mins travel</span>
            <strong style={{ color: 'var(--primary)' }}>Net ${(currentPlan?.savingsAmount || optimalSplit.savingsAmount).toFixed(2)} Savings</strong>
          </div>
          
          {/* Optimal item breakdown with Price Freshness & Actionable Forecasting */}
          <div style={{ marginTop: 'var(--spacing-md)', borderTop: '1px solid var(--surface-border)', paddingTop: 'var(--spacing-md)' }}>
            <h4 style={{ fontSize: '1rem', marginBottom: 'var(--spacing-sm)' }}>Shopping List &amp; Actionable Intelligence</h4>
            {optimalSplit.items.map((item: any, i: number) => {
              const storeStyle = getStoreStyle(item.store);
              const image = basket.find(b => (b.size ? `${b.product.name} (Size: ${b.size})` : b.product.name) === item.name)?.product.image;
              const forecast = item.forecast;
              
              return (
                <div key={i} style={{ display: 'flex', flexDirection: 'column', background: 'rgba(255,255,255,0.02)', padding: '10px 12px', borderRadius: 'var(--radius-sm)', marginBottom: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)', flex: 1, minWidth: 0 }}>
                      <span style={{ fontSize: '1rem', flexShrink: 0 }}>{storeStyle.logo}</span>
                      <Thumbnail name={item.name} image={image} size={28} />
                      <div style={{ minWidth: 0, display: 'flex', flexDirection: 'column' }}>
                        <span style={{ color: 'var(--text-main)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '0.9rem', fontWeight: 600 }}>{item.quantity}x {item.name}</span>
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                          {item.priceFreshness || `Updated 18m ago • In Stock • ${location || 'Austin, TX 78753'}`}
                        </span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', flexShrink: 0, marginLeft: '8px' }}>
                      <span style={{ color: 'var(--success)', fontWeight: 700, fontSize: '0.95rem' }}>${item.lineTotal.toFixed(2)}</span>
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>@ {item.store}</span>
                    </div>
                  </div>

                  {/* Actionable Forecast Recommendation Banner */}
                  {forecast && (
                    <div style={{ marginTop: '6px', paddingTop: '6px', borderTop: '1px dashed rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.78rem' }}>
                      {forecast.action === 'WAIT' ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#f59e0b' }}>
                          <span style={{ background: 'rgba(245, 158, 11, 0.2)', padding: '2px 6px', borderRadius: '4px', fontWeight: 700 }}>🛑 RECOMMENDATION: WAIT</span>
                          <span>Expected {forecast.expectedRange} within 7 days</span>
                        </div>
                      ) : (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--primary)' }}>
                          <span style={{ background: 'rgba(16, 185, 129, 0.2)', padding: '2px 6px', borderRadius: '4px', fontWeight: 700 }}>🚀 RECOMMENDATION: BUY NOW</span>
                          <span>14% below 30-day average price</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
      
      <div style={{ textAlign: 'center', marginTop: 'var(--spacing-lg)' }}>
        <button 
          className="btn-3d"
          onClick={() => onConfirm(currentPlan || optimalSplit)}
          style={{ padding: '16px 36px', fontSize: '1.2rem', width: '100%', maxWidth: '360px' }}>
          ✨ Confirm Plan &amp; Order Cart
        </button>
      </div>

    </div>
  );
};
