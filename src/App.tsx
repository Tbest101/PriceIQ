import { useState, useEffect } from 'react';
import './index.css';
import { BasketBuilder } from './components/BasketBuilder';
import { OptimizationEngine } from './components/OptimizationEngine';
import { RouteConfirmation } from './components/RouteConfirmation';
import { AuthModal } from './components/AuthModal';
import { HowItWorksModal } from './components/HowItWorksModal';
import { AdminDashboard } from './components/AdminDashboard';
import type { UserProfile } from './components/AuthModal';
import type { BasketItem } from './types';

function App() {
  const [view, setView] = useState<'home' | 'basket' | 'optimization' | 'checkout' | 'admin'>('home');
  const [basket, setBasket] = useState<BasketItem[]>([]);
  const [location, setLocation] = useState<string>('');
  const [plannedStore, setPlannedStore] = useState<string>('Walmart');
  const [checkoutData, setCheckoutData] = useState<any>(null);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [showAuth, setShowAuth] = useState(false);
  const [showHowItWorks, setShowHowItWorks] = useState(false);

  // Restore session on mount
  useEffect(() => {
    const session = localStorage.getItem('l4m_session');
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
    setView('optimization');
  };

  const handleAuth = (profile: UserProfile) => {
    setUser(profile);
    setShowAuth(false);
  };

  const handleSignOut = () => {
    localStorage.removeItem('l4m_session');
    setUser(null);
    setBasket([]);
  };

  return (
    <div className="app-container animate-fade-in" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <header className="app-header" onClick={() => setView('home')}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 700, letterSpacing: '-0.02em', cursor: 'pointer' }}>
          Less<span className="text-gradient">4</span>More
        </h1>
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
          <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 'var(--spacing-xl)' }}>
            <div className="animate-float" style={{ padding: 'var(--spacing-xs) var(--spacing-md)', background: 'rgba(139, 92, 246, 0.1)', border: '1px solid rgba(139, 92, 246, 0.2)', borderRadius: 'var(--radius-full)', color: 'var(--primary)', fontWeight: 500, fontSize: '0.9rem', marginBottom: 'calc(var(--spacing-md) * -1)' }}>
              ✨ The intelligent shopping platform
            </div>
            
            <div style={{ maxWidth: '800px', display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)', padding: '0 var(--spacing-sm)' }}>
              <h2 className="hero-heading">
                Optimize your entire basket, <br/>
                <span className="text-gradient">maximize your savings.</span>
              </h2>
              <p className="hero-subtitle">
                Don't just compare single items. Input your complete shopping list and discover the most cost-effective combination of retailers for your groceries and household goods.
              </p>
            </div>
            
            <div className="hero-cta-group">
              <button 
                onClick={(e) => { e.stopPropagation(); setView('basket'); }}
                style={{ background: 'var(--gradient-brand)', color: '#fff', padding: 'var(--spacing-md) var(--spacing-xl)', borderRadius: 'var(--radius-full)', fontWeight: 600, fontSize: '1.1rem', boxShadow: '0 4px 20px 0 rgba(139, 92, 246, 0.4)', transition: 'all var(--transition-bounce)' }} onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 6px 25px 0 rgba(139, 92, 246, 0.6)'; }} onMouseOut={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 20px 0 rgba(139, 92, 246, 0.4)'; }}>
                Start Building Basket
              </button>
              <button 
                className="glass-panel" 
                onClick={(e) => { e.stopPropagation(); setShowHowItWorks(true); }}
                style={{ padding: 'var(--spacing-md) var(--spacing-xl)', borderRadius: 'var(--radius-full)', fontWeight: 500, fontSize: '1.1rem', cursor: 'pointer' }}>
                How it Works
              </button>
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
    </div>
  );
}

export default App;
