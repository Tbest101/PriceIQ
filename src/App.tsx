import { useState, useEffect } from 'react';
import './index.css';
import { BasketBuilder } from './components/BasketBuilder';
import { OptimizationEngine } from './components/OptimizationEngine';
import { RouteConfirmation } from './components/RouteConfirmation';
import { AuthModal } from './components/AuthModal';
import { HowItWorksModal } from './components/HowItWorksModal';
import { AdminDashboard } from './components/AdminDashboard';
import { PriceIQLogo } from './components/PriceIQLogo';
import { ReceiptScannerModal } from './components/ReceiptScannerModal';
import type { UserProfile } from './components/AuthModal';
import type { BasketItem } from './types';

const DEFAULT_REPEAT_BASKET: BasketItem[] = [
  { product: { id: 'p1', name: 'Whole Milk 1 Gallon', category: 'Dairy', defaultPrice: 3.49, barcode: '011110416001' }, quantity: 2 },
  { product: { id: 'p2', name: 'Large Grade A Brown Eggs 12ct', category: 'Dairy & Eggs', defaultPrice: 3.89, barcode: '011110416002' }, quantity: 1 },
  { product: { id: 'p3', name: 'Honey Nut Cheerios Cereal 15.4oz', category: 'Pantry', defaultPrice: 4.69, barcode: '011110416003' }, quantity: 1 },
  { product: { id: 'p4', name: 'Organic Bananas 3lb', category: 'Produce', defaultPrice: 2.19, barcode: '011110416004' }, quantity: 1 },
  { product: { id: 'p5', name: 'Artisan Sourdough Bread 24oz', category: 'Bakery', defaultPrice: 4.29, barcode: '011110416005' }, quantity: 1 },
  { product: { id: 'p6', name: 'Avocado Bag 4ct', category: 'Produce', defaultPrice: 3.99, barcode: '011110416006' }, quantity: 1 },
  { product: { id: 'p7', name: 'Tide Liquid Laundry Detergent 92oz', category: 'Household', defaultPrice: 12.99, barcode: '011110416007' }, quantity: 1 }
];

function App() {
  const [view, setView] = useState<'home' | 'basket' | 'optimization' | 'checkout' | 'admin'>('home');
  const [basket, setBasket] = useState<BasketItem[]>([]);
  const [location, setLocation] = useState<string>('');
  const [plannedStore, setPlannedStore] = useState<string>('Walmart');
  const [checkoutData, setCheckoutData] = useState<any>(null);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [showAuth, setShowAuth] = useState(false);
  const [showHowItWorks, setShowHowItWorks] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);

  // Restore session on mount
  useEffect(() => {
    const session = localStorage.getItem('priceiq_session');
    if (session) {
      try {
        setUser(JSON.parse(session));
      } catch { /* ignore corrupt data */ }
    }
  }, []);

  const handleOptimize = (items: BasketItem[], loc: string, store: string) => {
    setBasket(items);
    setLocation(loc);
    setPlannedStore(store);
    localStorage.setItem('priceiq_last_basket', JSON.stringify(items));
    setView('optimization');
  };

  const handleReceiptScanned = (scannedItems: BasketItem[]) => {
    setBasket(scannedItems);
    localStorage.setItem('priceiq_last_basket', JSON.stringify(scannedItems));
    setView('basket');
  };

  const handleRepeatLastBasket = () => {
    const saved = localStorage.getItem('priceiq_last_basket');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setBasket(parsed);
          setView('basket');
          return;
        }
      } catch { /* fallback */ }
    }
    setBasket(DEFAULT_REPEAT_BASKET);
    localStorage.setItem('priceiq_last_basket', JSON.stringify(DEFAULT_REPEAT_BASKET));
    setView('basket');
  };

  const handleAuth = (profile: UserProfile) => {
    setUser(profile);
    setShowAuth(false);
  };

  const handleSignOut = () => {
    localStorage.removeItem('priceiq_session');
    setUser(null);
    setBasket([]);
  };

  return (
    <div className="app-container animate-fade-in" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <header className="app-header" onClick={() => setView('home')} style={{ cursor: 'pointer' }}>
        <PriceIQLogo size={32} showTagline={false} showText={true} />
        <nav className="app-nav">
          <button className="nav-text" onClick={(e) => { e.stopPropagation(); setView('home'); }} style={{ color: view === 'home' ? 'var(--primary)' : 'var(--text-main)', fontWeight: 500 }}>Home</button>
          <button className="nav-text" onClick={(e) => { e.stopPropagation(); setView('basket'); }} style={{ color: view === 'basket' ? 'var(--primary)' : 'var(--text-muted)', transition: 'color var(--transition-fast)' }}>Baskets</button>
          <button className="nav-text" onClick={(e) => { e.stopPropagation(); setView('admin'); }} style={{ color: view === 'admin' ? 'var(--primary)' : 'var(--text-muted)', transition: 'color var(--transition-fast)' }}>Analytics</button>
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--gradient-brand)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem', fontWeight: 600, color: 'white' }}>
                {user.name.charAt(0).toUpperCase()}
              </div>
              <span style={{ fontWeight: 500, fontSize: '0.9rem', color: 'var(--text-main)' }}>{user.name.split(' ')[0]}</span>
              <button
                onClick={(e) => { e.stopPropagation(); handleSignOut(); }}
                style={{ color: 'var(--text-muted)', fontSize: '0.8rem', transition: 'color 0.2s', marginLeft: '4px' }}
                onMouseOver={e => e.currentTarget.style.color = 'var(--accent)'}
                onMouseOut={e => e.currentTarget.style.color = 'var(--text-muted)'}
              >Sign Out</button>
            </div>
          ) : (
            <button
              className="glass-panel"
              onClick={(e) => { e.stopPropagation(); setShowAuth(true); }}
              style={{ padding: 'var(--spacing-xs) var(--spacing-lg)', borderRadius: 'var(--radius-full)' }}
            >Sign In</button>
          )}
        </nav>
      </header>

      <main style={{ flex: 1, padding: 'var(--spacing-3xl) 0', display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
        
        {view === 'home' && (
          <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 'var(--spacing-xl)', width: '100%', maxWidth: '900px' }}>
            
            {/* Shopping Location Badge */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.12)', padding: '6px 16px', borderRadius: 'var(--radius-full)', fontSize: '0.88rem', color: 'var(--text-main)' }}>
              <span>📍 Shopping near: <strong style={{ color: 'var(--primary)' }}>78753 (Austin, TX)</strong></span>
              <span style={{ color: 'var(--text-muted)' }}>• Stores within 5 miles</span>
              <button 
                onClick={(e) => { e.stopPropagation(); setView('basket'); }}
                style={{ color: 'var(--primary)', fontWeight: 600, fontSize: '0.8rem', marginLeft: '4px', cursor: 'pointer' }}>✎ Change</button>
            </div>

            <div style={{ maxWidth: '800px', display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)', padding: '0 var(--spacing-sm)' }}>
              <h2 className="hero-heading" style={{ fontSize: '2.8rem', fontWeight: 800 }}>
                The Intelligent <br/>
                <span className="text-gradient">Shopping Optimizer.</span>
              </h2>
              <p className="hero-subtitle" style={{ fontSize: '1.15rem' }}>
                Know where to buy, when to buy, and when the extra trip isn't worth it.
              </p>
            </div>
            
            <div className="hero-cta-group" style={{ gap: '16px', flexWrap: 'wrap', justifyContent: 'center' }}>
              <button 
                className="btn-3d"
                onClick={(e) => { e.stopPropagation(); setView('basket'); }}
                style={{ padding: '16px 32px', fontSize: '1.15rem' }}>
                🚀 Build My Basket
              </button>
              <button 
                className="btn-3d-secondary" 
                onClick={(e) => { e.stopPropagation(); setShowHowItWorks(true); }}
                style={{ padding: '16px 28px', fontSize: '1.15rem' }}>
                💡 How PriceIQ Works
              </button>
            </div>

            {/* Quick Actions Bar */}
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center', marginTop: 'var(--spacing-md)' }}>
              <div 
                className="glass-panel" 
                onClick={() => setView('basket')}
                style={{ padding: '12px 20px', borderRadius: 'var(--radius-md)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', transition: 'all 0.2s' }}
                onMouseOver={e=>e.currentTarget.style.borderColor='var(--primary)'}
                onMouseOut={e=>e.currentTarget.style.borderColor='var(--surface-border)'}
              >
                <span style={{ fontSize: '1.2rem' }}>＋</span>
                <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>Build a Basket</span>
              </div>
              <div 
                className="glass-panel" 
                onClick={() => setShowReceiptModal(true)}
                style={{ padding: '12px 20px', borderRadius: 'var(--radius-md)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', transition: 'all 0.2s' }}
                onMouseOver={e=>e.currentTarget.style.borderColor='var(--primary)'}
                onMouseOut={e=>e.currentTarget.style.borderColor='var(--surface-border)'}
              >
                <span style={{ fontSize: '1.2rem' }}>📷</span>
                <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>Scan Receipt</span>
              </div>
              <div 
                className="glass-panel" 
                onClick={handleRepeatLastBasket}
                style={{ padding: '12px 20px', borderRadius: 'var(--radius-md)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', transition: 'all 0.2s' }}
                onMouseOver={e=>e.currentTarget.style.borderColor='var(--primary)'}
                onMouseOut={e=>e.currentTarget.style.borderColor='var(--surface-border)'}
              >
                <span style={{ fontSize: '1.2rem' }}>↻</span>
                <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>Repeat Last Basket</span>
              </div>
            </div>

            {/* Saved Basket Preview Card */}
            <div className="glass-panel" style={{ width: '100%', maxWidth: '650px', padding: 'var(--spacing-lg)', textAlign: 'left', background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, rgba(14, 165, 233, 0.05) 100%)', border: '1px solid rgba(16, 185, 129, 0.25)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--primary)', fontWeight: 700 }}>🛒 Saved Weekly Basket</span>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Austin, TX • 17 items</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <h3 style={{ fontSize: '1.2rem', margin: 0, color: 'var(--text-main)' }}>
                    {user ? `${user.name.split(' ')[0]}'s Weekly Groceries` : 'Sample Weekly Essentials'}
                  </h3>
                  <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-muted)' }}>Estimated Baseline: $83.46 • Potential Savings: <strong style={{ color: 'var(--primary)' }}>~$14.20</strong></p>
                </div>
                <button 
                  className="btn-3d"
                  onClick={handleRepeatLastBasket}
                  style={{ padding: '8px 20px', fontSize: '0.9rem' }}>
                  Optimize &amp; Save →
                </button>
              </div>
            </div>

            <div className="features-grid">
              <div className="glass-panel" style={{ padding: 'var(--spacing-xl)' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(59, 130, 246, 0.1)', color: 'var(--secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', marginBottom: 'var(--spacing-md)' }}>🛒</div>
                <h3 style={{ fontSize: '1.25rem', marginBottom: 'var(--spacing-sm)' }}>Smart Scanning</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>Easily input items via barcode scan or manual entry to build your basket fast.</p>
              </div>
              <div className="glass-panel" style={{ padding: 'var(--spacing-xl)' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(139, 92, 246, 0.1)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', marginBottom: 'var(--spacing-md)' }}>✨</div>
                <h3 style={{ fontSize: '1.25rem', marginBottom: 'var(--spacing-sm)' }}>Intelligent Substitutions</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>We automatically suggest alternative brands or sizes to reduce your total cost.</p>
              </div>
              <div className="glass-panel" style={{ padding: 'var(--spacing-xl)' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', marginBottom: 'var(--spacing-md)' }}>📊</div>
                <h3 style={{ fontSize: '1.25rem', marginBottom: 'var(--spacing-sm)' }}>Optimized Routing</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>Compare the cost of a single retailer versus an optimized split across multiple stores.</p>
              </div>
            </div>
          </div>
        )}

        {view === 'basket' && (
          <BasketBuilder onOptimize={handleOptimize} user={user} />
        )}

        {view === 'optimization' && (
          <OptimizationEngine 
            basket={basket} 
            location={location} 
            plannedStore={plannedStore} 
            onBack={() => setView('basket')} 
            onConfirm={(optimalSplit) => {
              setCheckoutData(optimalSplit);
              setView('checkout');
            }}
          />
        )}

        {view === 'checkout' && checkoutData && (
          <RouteConfirmation optimalSplit={checkoutData} onBack={() => setView('optimization')} />
        )}

        {view === 'admin' && (
          <AdminDashboard onBack={() => setView('home')} />
        )}

      </main>

      {showAuth && (
        <AuthModal onClose={() => setShowAuth(false)} onAuth={handleAuth} />
      )}
      {showHowItWorks && (
        <HowItWorksModal onClose={() => setShowHowItWorks(false)} />
      )}
      <ReceiptScannerModal
        isOpen={showReceiptModal}
        onClose={() => setShowReceiptModal(false)}
        onReceiptScanned={handleReceiptScanned}
      />
    </div>
  );
}

export default App;
