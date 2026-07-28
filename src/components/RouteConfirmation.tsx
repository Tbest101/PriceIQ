import React, { useState, useMemo } from 'react';

// Reusing store styles
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

// Simple seeded random to keep mock distances consistent per store name
function seededRandom(seedStr: string) {
  let h = 0;
  for (let i = 0; i < seedStr.length; i++) {
    h = Math.imul(31, h) + seedStr.charCodeAt(i) | 0;
  }
  const random = Math.abs(Math.sin(h)) * 10000;
  return random - Math.floor(random);
}

interface Props {
  optimalSplit: {
    stores: string[];
    total: number;
    items: { name: string; quantity: number; store: string; unitPrice: number; lineTotal: number; title: string }[];
    savingsAmount: number;
    savingsPercent: number;
  };
  onBack: () => void;
  onPlaceOrder?: () => void;
}

export const RouteConfirmation: React.FC<Props> = ({ optimalSplit, onBack, onPlaceOrder }) => {
  const [fulfillmentMethod, setFulfillmentMethod] = useState<'pickup' | 'delivery'>('pickup');
  const [isPlaced, setIsPlaced] = useState(false);

  // Group items by store and calculate mock distances
  const groupedStores = useMemo(() => {
    return optimalSplit.stores.map(storeName => {
      const items = optimalSplit.items.filter(i => i.store === storeName);
      const storeTotal = items.reduce((acc, curr) => acc + curr.lineTotal, 0);
      const distance = 1.0 + (seededRandom(storeName) * 6.5); // Random between 1 and 7.5 miles
      return {
        name: storeName,
        items,
        storeTotal,
        distance,
        style: getStoreStyle(storeName)
      };
    });
  }, [optimalSplit]);

  const totalDistance = groupedStores.reduce((acc, curr) => acc + curr.distance, 0);
  const deliveryFeePerStore = 5.95;
  const totalDeliveryFee = fulfillmentMethod === 'delivery' ? deliveryFeePerStore * groupedStores.length : 0;
  const finalTotal = optimalSplit.total + totalDeliveryFee;

  if (isPlaced) {
    return (
      <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '600px', gap: 'var(--spacing-md)', padding: '0 var(--spacing-md)' }}>
        <div style={{ fontSize: '4rem', color: 'var(--success)', animation: 'float 4s ease-in-out infinite' }}>🎉</div>
        <h2 style={{ fontSize: '2rem', color: 'var(--text-main)', textAlign: 'center', margin: 0 }}>Order Confirmed!</h2>
        <p style={{ color: 'var(--text-muted)', textAlign: 'center', maxWidth: '400px' }}>
          {fulfillmentMethod === 'pickup' 
            ? `Your pickup route has been finalized. We've sent the orders to the ${groupedStores.length} stores. They will notify you when ready.` 
            : `Your orders have been placed! Less4More couriers will pick them up from the ${groupedStores.length} stores and deliver them soon.`}
        </p>
        <button 
          onClick={() => window.location.reload()} 
          style={{ marginTop: 'var(--spacing-xl)', color: 'var(--primary)', fontWeight: 600, border: '1px solid var(--primary)', padding: '8px 20px', borderRadius: 'var(--radius-full)' }}
        >Start New Basket</button>
      </div>
    );
  }

  return (
    <div className="optimization-layout animate-fade-in" style={{ maxWidth: '800px' }}>
      <button onClick={onBack} style={{ color: 'var(--text-muted)', alignSelf: 'flex-start' }}>&larr; Back to Optimization</button>
      
      <div style={{ textAlign: 'center', marginBottom: 'var(--spacing-lg)' }}>
        <h2 style={{ fontSize: '2.5rem', marginBottom: 'var(--spacing-sm)' }}>Fulfillment & Route</h2>
        <p style={{ fontSize: '1.1rem', color: 'var(--text-muted)' }}>
          Review your optimal split across {groupedStores.length} stop{groupedStores.length > 1 ? 's' : ''}.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-lg)' }}>
        
        {/* Fulfillment Selection */}
        <div className="glass-panel" style={{ padding: 'var(--spacing-xl)' }}>
          <h3 style={{ fontSize: '1.2rem', marginBottom: 'var(--spacing-md)' }}>Choose Fulfillment Method</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 'var(--spacing-md)' }}>
            
            <button 
              onClick={() => setFulfillmentMethod('pickup')}
              style={{
                display: 'flex', alignItems: 'flex-start', gap: 'var(--spacing-md)', padding: 'var(--spacing-lg)',
                borderRadius: 'var(--radius-md)', textAlign: 'left', transition: 'all 0.2s',
                border: `2px solid ${fulfillmentMethod === 'pickup' ? 'var(--primary)' : 'transparent'}`,
                background: fulfillmentMethod === 'pickup' ? 'rgba(139, 92, 246, 0.1)' : 'rgba(255,255,255,0.03)'
              }}
            >
              <div style={{ fontSize: '1.8rem' }}>🚗</div>
              <div>
                <div style={{ fontWeight: 600, fontSize: '1.1rem', marginBottom: '4px' }}>In-Store Pickup</div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Drive to {groupedStores.length} stores to pick up your items.</div>
                <div style={{ fontWeight: 600, color: 'var(--success)', marginTop: '8px' }}>Free</div>
              </div>
            </button>
            
            <button 
              onClick={() => setFulfillmentMethod('delivery')}
              style={{
                display: 'flex', alignItems: 'flex-start', gap: 'var(--spacing-md)', padding: 'var(--spacing-lg)',
                borderRadius: 'var(--radius-md)', textAlign: 'left', transition: 'all 0.2s',
                border: `2px solid ${fulfillmentMethod === 'delivery' ? 'var(--primary)' : 'transparent'}`,
                background: fulfillmentMethod === 'delivery' ? 'rgba(139, 92, 246, 0.1)' : 'rgba(255,255,255,0.03)'
              }}
            >
              <div style={{ fontSize: '1.8rem' }}>🚚</div>
              <div>
                <div style={{ fontWeight: 600, fontSize: '1.1rem', marginBottom: '4px' }}>Delivery</div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Let a courier pick up and deliver all your items.</div>
                <div style={{ fontWeight: 600, color: 'var(--text-muted)', marginTop: '8px' }}>+${(deliveryFeePerStore * groupedStores.length).toFixed(2)} (${deliveryFeePerStore}/store)</div>
              </div>
            </button>

          </div>
        </div>

        {/* Store Breakdown & Route */}
        <div className="glass-panel" style={{ padding: 'var(--spacing-xl)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-lg)' }}>
            <h3 style={{ fontSize: '1.2rem', margin: 0 }}>Route Summary</h3>
            {fulfillmentMethod === 'pickup' && (
              <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                Total Est. Distance: <span style={{ color: 'var(--text-main)', fontWeight: 600 }}>{totalDistance.toFixed(1)} miles</span>
              </span>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-lg)' }}>
            {groupedStores.map((store, idx) => (
              <div key={idx} style={{ background: 'rgba(255,255,255,0.02)', borderRadius: 'var(--radius-md)', padding: 'var(--spacing-md)', border: '1px solid var(--surface-border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-md)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
                    <span style={{ fontSize: '1.5rem' }}>{store.style.logo}</span>
                    <span style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-main)' }}>{store.name}</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                     <span style={{ fontWeight: 600 }}>${store.storeTotal.toFixed(2)}</span>
                     {fulfillmentMethod === 'pickup' && (
                       <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>📍 ~{store.distance.toFixed(1)} mi away</span>
                     )}
                     {fulfillmentMethod === 'delivery' && (
                       <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>🚚 +${deliveryFeePerStore.toFixed(2)} fee</span>
                     )}
                  </div>
                </div>
                
                <div style={{ paddingTop: 'var(--spacing-sm)', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {store.items.map((item, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                      <span style={{ color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginRight: '8px' }}>{item.quantity}x {item.name}</span>
                      <span style={{ color: 'var(--text-muted)', flexShrink: 0 }}>${item.lineTotal.toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                {/* 1-Click Cart / Search Export */}
                <div style={{ marginTop: 'var(--spacing-sm)', paddingTop: 'var(--spacing-xs)', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'flex-end' }}>
                  <a
                    href={
                      store.name.toLowerCase().includes('walmart')
                        ? `https://www.walmart.com/search?q=${encodeURIComponent(store.items[0]?.name || store.name)}`
                        : store.name.toLowerCase().includes('target')
                        ? `https://www.target.com/s?searchTerm=${encodeURIComponent(store.items[0]?.name || store.name)}`
                        : store.name.toLowerCase().includes('whole foods') || store.name.toLowerCase().includes('amazon')
                        ? `https://www.amazon.com/s?k=${encodeURIComponent(store.items[0]?.name || store.name)}`
                        : `https://www.google.com/search?q=${encodeURIComponent(store.name + ' ' + (store.items[0]?.name || ''))}`
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      fontSize: '0.8rem',
                      color: 'var(--primary)',
                      textDecoration: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontWeight: 500
                    }}
                  >
                    🛍️ Open Items in {store.name} Cart &rarr;
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Final Total Checkout Box */}
        <div className="glass-panel" style={{ padding: 'var(--spacing-xl)', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', borderTop: '3px solid var(--primary)' }}>
          <div style={{ width: '100%', maxWidth: '300px', display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1rem', color: 'var(--text-muted)' }}>
              <span>Optimal Items Total:</span>
              <span>${optimalSplit.total.toFixed(2)}</span>
            </div>
            {fulfillmentMethod === 'delivery' && (
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1rem', color: 'var(--text-muted)' }}>
                <span>Delivery Fees:</span>
                <span>${totalDeliveryFee.toFixed(2)}</span>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.5rem', fontWeight: 700, margin: 'var(--spacing-sm) 0', borderTop: '1px solid var(--surface-border)', paddingTop: 'var(--spacing-sm)' }}>
              <span>Grand Total:</span>
              <span className="text-gradient">${finalTotal.toFixed(2)}</span>
            </div>
            <button 
              onClick={() => {
                if(onPlaceOrder) onPlaceOrder();
                setIsPlaced(true);
              }}
              style={{ width: '100%', padding: 'var(--spacing-md)', background: 'var(--gradient-brand)', borderRadius: 'var(--radius-full)', color: '#fff', fontWeight: 600, fontSize: '1.1rem', transition: 'transform 0.2s', border: 'none', boxShadow: '0 4px 15px rgba(139, 92, 246, 0.3)' }}
              onMouseOver={e => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}
            >
              {fulfillmentMethod === 'pickup' ? 'Finalize Route & Head Out' : 'Place Delivery Order'}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
