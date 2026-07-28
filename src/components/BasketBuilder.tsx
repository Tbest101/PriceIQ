import React, { useState, useEffect, useRef } from 'react';
import type { BasketItem, Product } from '../types';

const DEFAULT_PRODUCTS: Product[] = [
  { id: '1', name: 'Organic Bananas', category: 'Produce', defaultPrice: 1.48, barcode: '123' },
  { id: '2', name: 'Whole Milk 1 Gal', category: 'Dairy', defaultPrice: 3.23, barcode: '124' },
  { id: '3', name: 'Sourdough Bread', category: 'Bakery', defaultPrice: 3.64, barcode: '125' },
  { id: '4', name: 'Free-Range Eggs (12)', category: 'Dairy', defaultPrice: 3.12, barcode: '126' },
  { id: '5', name: 'Ground Coffee (250g)', category: 'Pantry', defaultPrice: 8.98, barcode: '128' },
  { id: '6', name: 'Essential Everyday T-Shirt', category: 'Apparel', defaultPrice: 14.99, barcode: '129' },
];

interface SearchResult {
  title: string;
  source: string;
  price: string;
  extracted_price: number;
  thumbnail: string;
}

const ProductThumbnail = ({ product, size = 32 }: { product: Product, size?: number }) => {
  if (product.image) {
    return <img src={product.image} alt={product.name} style={{ width: size, height: size, objectFit: 'contain', borderRadius: '4px', background: 'white', flexShrink: 0 }} />;
  }
  return (
    <div style={{ width: size, height: size, borderRadius: '4px', background: 'var(--surface-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: size * 0.5, color: 'var(--text-muted)', flexShrink: 0, fontWeight: 600 }}>
      {product.name.charAt(0).toUpperCase()}
    </div>
  );
};

const isClothing = (name: string) => {
  const keywords = ['shirt', 'pant', 'shoe', 'dress', 'wear', 'cloth', 'apparel', 'hoodie', 'sock', 'jean', 'jacket', 'sneaker', 'hat', 'cap', 'sweater', 'boot'];
  return keywords.some(k => name.toLowerCase().includes(k));
};

interface Props {
  onOptimize: (items: BasketItem[], location: string, plannedStore: string) => void;
  user?: any;
}

export const BasketBuilder: React.FC<Props> = ({ onOptimize }) => {
  const [basket, setBasket] = useState<BasketItem[]>([]);
  const [search, setSearch] = useState('');
  const [location, setLocation] = useState('');
  const [plannedStore, setPlannedStore] = useState('Walmart');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [dataSource, setDataSource] = useState<string>('');
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Debounced live search
  useEffect(() => {
    if (search.trim().length < 2) {
      setSearchResults([]);
      return;
    }

    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(async () => {
      setSearching(true);
      try {
        const url = `/api/search?q=${encodeURIComponent(search)}${location.trim() ? `&location=${encodeURIComponent(location.trim())}` : ''}`;
        const response = await fetch(url);
        const data = await response.json();
        setSearchResults(data.results || []);
        setDataSource(data.source || 'unknown');
      } catch {
        setSearchResults([]);
      } finally {
        setSearching(false);
      }
    }, 400);

    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, [search]);

  const handleAddDefault = (product: Product) => {
    const defaultSize = isClothing(product.name) ? 'M' : undefined;
    setBasket(prev => {
      const existing = prev.find(item => item.product.id === product.id && item.size === defaultSize);
      if (existing) {
        return prev.map(item => (item.product.id === product.id && item.size === defaultSize) ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { product, quantity: 1, size: defaultSize }];
    });
  };

  const handleAddFromSearch = (result: SearchResult) => {
    const product: Product = {
      id: `search_${result.title}_${result.source}`,
      name: result.title,
      category: result.source,
      defaultPrice: result.extracted_price,
      barcode: '',
      image: result.thumbnail,
    };
    const defaultSize = isClothing(product.name) ? 'M' : undefined;
    setBasket(prev => {
      const existing = prev.find(item => item.product.id === product.id && item.size === defaultSize);
      if (existing) {
        return prev.map(item => (item.product.id === product.id && item.size === defaultSize) ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { product, quantity: 1, size: defaultSize }];
    });
    setSearch('');
    setSearchResults([]);
  };

  const handleRemove = (productId: string, size?: string) => {
    setBasket(prev => prev.filter(item => !(item.product.id === productId && item.size === size)));
  };

  const handleUpdateQuantity = (productId: string, size: string | undefined, newQty: number) => {
    if (newQty <= 0) {
      handleRemove(productId, size);
      return;
    }
    setBasket(prev => prev.map(item => (item.product.id === productId && item.size === size) ? { ...item, quantity: newQty } : item));
  };

  const handleUpdateSize = (productId: string, oldSize: string | undefined, newSize: string) => {
    setBasket(prev => {
      const existingNewSize = prev.find(i => i.product.id === productId && i.size === newSize);
      if (existingNewSize) {
        const oldItem = prev.find(i => i.product.id === productId && i.size === oldSize);
        if (!oldItem) return prev;
        return prev.map(i => {
          if (i.product.id === productId && i.size === newSize) return { ...i, quantity: i.quantity + oldItem.quantity };
          return i;
        }).filter(i => !(i.product.id === productId && i.size === oldSize));
      } else {
        return prev.map(item => (item.product.id === productId && item.size === oldSize) ? { ...item, size: newSize } : item);
      }
    });
  };

  const showSearchResults = search.trim().length >= 2;

  return (
    <div className="basket-layout animate-fade-in">
      
      {/* Search & Add Panel */}
      <div className="glass-panel basket-search-panel" style={{ padding: 'var(--spacing-lg)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-md)', flexWrap: 'wrap', gap: 'var(--spacing-sm)' }}>
          <h2 style={{ fontSize: '1.5rem', margin: 0 }}>1. Add Items to Basket</h2>
          {dataSource && (
            <span style={{ fontSize: '0.75rem', padding: '2px 10px', borderRadius: 'var(--radius-full)', background: dataSource === 'serpapi' ? 'rgba(16,185,129,0.15)' : 'rgba(139,92,246,0.15)', color: dataSource === 'serpapi' ? 'var(--success)' : 'var(--primary)' }}>
              {dataSource === 'serpapi' ? '🌐 Live Prices' : '📦 Demo Data'}
            </span>
          )}
        </div>
        <div style={{ display: 'flex', gap: 'var(--spacing-sm)', marginBottom: 'var(--spacing-sm)' }}>
          <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(0,0,0,0.2)', borderRadius: 'var(--radius-full)', padding: '0 var(--spacing-sm)', border: '1px solid var(--surface-border)', flex: 1 }}>
            <span style={{ color: 'var(--text-muted)', paddingLeft: '8px' }}>📍</span>
            <input 
              type="text" 
              placeholder="Zip Code or City (e.g. 78701)" 
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              style={{ flex: 1, padding: 'var(--spacing-sm)', background: 'transparent', color: 'var(--text-main)', outline: 'none', border: 'none', fontSize: '0.9rem', width: '100%' }}
            />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(0,0,0,0.2)', borderRadius: 'var(--radius-full)', padding: '0 var(--spacing-sm)', border: '1px solid var(--surface-border)', flex: 1 }}>
            <span style={{ color: 'var(--text-muted)', paddingLeft: '8px' }}>🏢</span>
            <select 
              value={plannedStore}
              onChange={(e) => setPlannedStore(e.target.value)}
              style={{ flex: 1, padding: 'var(--spacing-sm)', background: 'transparent', color: 'var(--text-main)', outline: 'none', border: 'none', fontSize: '0.9rem', width: '100%', cursor: 'pointer', appearance: 'none' }}
            >
              <option value="" disabled style={{ color: 'var(--text-muted)' }}>Planned Store...</option>
              <option value="Walmart" style={{ background: 'var(--surface-color)' }}>Walmart</option>
              <option value="Target" style={{ background: 'var(--surface-color)' }}>Target</option>
              <option value="Whole Foods" style={{ background: 'var(--surface-color)' }}>Whole Foods</option>
              <option value="Amazon" style={{ background: 'var(--surface-color)' }}>Amazon</option>
              <option value="Kroger" style={{ background: 'var(--surface-color)' }}>Kroger</option>
              <option value="Costco" style={{ background: 'var(--surface-color)' }}>Costco</option>
            </select>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 'var(--spacing-sm)', marginBottom: 'var(--spacing-lg)' }}>
          <input 
            type="text" 
            placeholder="Search real products (e.g. milk, eggs, bread)..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ flex: 1, padding: 'var(--spacing-sm) var(--spacing-md)', borderRadius: 'var(--radius-full)', border: '1px solid var(--surface-border)', background: 'rgba(0,0,0,0.2)', color: 'var(--text-main)', outline: 'none', fontSize: '1rem', fontFamily: 'inherit', minWidth: 0 }}
          />
          {searching && (
            <div style={{ display: 'flex', alignItems: 'center', color: 'var(--text-muted)', fontSize: '0.85rem', whiteSpace: 'nowrap' }}>Searching...</div>
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)', maxHeight: '400px', overflowY: 'auto', paddingRight: 'var(--spacing-sm)' }}>
          {/* Show live search results when searching */}
          {showSearchResults && searchResults.length > 0 && (
            <>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>Search Results</div>
              {searchResults.map((result, idx) => (
                <div key={`search-${idx}`} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 'var(--spacing-sm) var(--spacing-md)', background: 'var(--surface-color)', borderRadius: 'var(--radius-md)', border: '1px solid transparent', transition: 'all 0.2s' }} onMouseOver={e => e.currentTarget.style.borderColor = 'var(--surface-border)'} onMouseOut={e => e.currentTarget.style.borderColor = 'transparent'}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)', flex: 1, minWidth: 0 }}>
                    {result.thumbnail ? (
                      <img src={result.thumbnail} alt={result.title} style={{ width: 40, height: 40, objectFit: 'contain', borderRadius: '4px', background: 'white', flexShrink: 0 }} />
                    ) : (
                      <div style={{ width: 40, height: 40, borderRadius: '4px', background: 'var(--surface-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', color: 'var(--text-muted)', flexShrink: 0, fontWeight: 600 }}>
                        {result.title.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 500, color: 'var(--text-main)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{result.title}</div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                        <span style={{ color: 'var(--success)', fontWeight: 600 }}>{result.price}</span>
                        <span>&bull;</span>
                        <span>{result.source}</span>
                      </div>
                    </div>
                  </div>
                  <button 
                    onClick={() => handleAddFromSearch(result)}
                    style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', transition: 'transform var(--transition-fast)', border: 'none', flexShrink: 0, marginLeft: '8px' }}
                    onMouseOver={e => e.currentTarget.style.transform = 'scale(1.1)'}
                    onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
                  >+</button>
                </div>
              ))}
            </>
          )}
          {showSearchResults && searchResults.length === 0 && !searching && (
            <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: 'var(--spacing-lg)' }}>No results found. Try a different search term.</div>
          )}

          {/* Show default quick-add products when NOT searching */}
          {!showSearchResults && (
            <>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>Quick Add</div>
              {DEFAULT_PRODUCTS.map(product => (
                <div key={product.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 'var(--spacing-sm) var(--spacing-md)', background: 'var(--surface-color)', borderRadius: 'var(--radius-md)', border: '1px solid transparent', transition: 'all 0.2s' }} onMouseOver={e => e.currentTarget.style.borderColor = 'var(--surface-border)'} onMouseOut={e => e.currentTarget.style.borderColor = 'transparent'}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)', flex: 1, minWidth: 0 }}>
                    <ProductThumbnail product={product} size={40} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 500, color: 'var(--text-main)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{product.name}</div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Est. ${product.defaultPrice.toFixed(2)} &bull; {product.category}</div>
                    </div>
                  </div>
                  <button 
                    onClick={() => handleAddDefault(product)}
                    style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', transition: 'transform var(--transition-fast)', border: 'none' }}
                    onMouseOver={e => e.currentTarget.style.transform = 'scale(1.1)'}
                    onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
                  >+</button>
                </div>
              ))}
            </>
          )}
        </div>
      </div>

      {/* Current Basket Panel */}
      <div className="glass-panel basket-sidebar" style={{ padding: 'var(--spacing-lg)', display: 'flex', flexDirection: 'column' }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: 'var(--spacing-md)' }}>Your Basket</h2>
        
        {basket.length === 0 ? (
          <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: 'var(--spacing-xl) 0' }}>
            <div style={{ fontSize: '3rem', marginBottom: 'var(--spacing-sm)', opacity: 0.5 }}>🛒</div>
            Your basket is empty
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)', flex: 1, minHeight: '200px' }}>
            <div style={{ maxHeight: '300px', overflowY: 'auto', paddingRight: '10px' }}>
              {basket.map((item, idx) => (
                <div key={`${item.product.id}-${item.size}-${idx}`} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 'var(--spacing-md) 0', borderBottom: '1px solid var(--surface-border)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)', minWidth: 0, flex: 1 }}>
                    <ProductThumbnail product={item.product} size={40} />
                    <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                      <div style={{ fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '0.95rem' }}>{item.product.name}</div>
                      {isClothing(item.product.name) && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '6px' }}>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Size:</span>
                          <select 
                            value={item.size || 'M'} 
                            onChange={(e) => handleUpdateSize(item.product.id, item.size, e.target.value)}
                            style={{ fontSize: '0.8rem', padding: '2px 6px', borderRadius: '4px', background: 'var(--surface-color)', color: 'var(--text-main)', border: '1px solid var(--surface-border)', outline: 'none', cursor: 'pointer' }}
                          >
                            <option value="S">S</option>
                            <option value="M">M</option>
                            <option value="L">L</option>
                            <option value="XL">XL</option>
                            <option value="XXL">XXL</option>
                          </select>
                        </div>
                      )}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(0,0,0,0.2)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--surface-border)' }}>
                      <button onClick={() => handleUpdateQuantity(item.product.id, item.size, item.quantity - 1)} style={{ padding: '4px 10px', background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', transition: 'color 0.2s' }} onMouseOver={e=>e.currentTarget.style.color='var(--text-main)'} onMouseOut={e=>e.currentTarget.style.color='var(--text-muted)'}>-</button>
                      <span style={{ padding: '0', fontSize: '0.9rem', fontWeight: 600, minWidth: '24px', textAlign: 'center' }}>{item.quantity}</span>
                      <button onClick={() => handleUpdateQuantity(item.product.id, item.size, item.quantity + 1)} style={{ padding: '4px 10px', background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', transition: 'color 0.2s' }} onMouseOver={e=>e.currentTarget.style.color='var(--text-main)'} onMouseOut={e=>e.currentTarget.style.color='var(--text-muted)'}>+</button>
                    </div>
                    <button onClick={() => handleRemove(item.product.id, item.size)} style={{ color: 'var(--accent)', fontSize: '1.4rem', padding: '0 4px', opacity: 0.6, transition: 'all var(--transition-fast)', flexShrink: 0, background: 'none', border: 'none', cursor: 'pointer' }} onMouseOver={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.transform = 'scale(1.1)'; }} onMouseOut={e => { e.currentTarget.style.opacity = '0.6'; e.currentTarget.style.transform = 'scale(1)'; }}>&times;</button>
                  </div>
                </div>
              ))}
            </div>
            
            <div style={{ marginTop: 'auto', paddingTop: 'var(--spacing-lg)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--spacing-lg)', color: 'var(--text-muted)' }}>
                <span>Total Items:</span>
                <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{basket.reduce((acc, curr) => acc + curr.quantity, 0)}</span>
              </div>
              <button 
                onClick={() => {
                  if (!plannedStore) {
                    alert('Please select your planned store first');
                    return;
                  }
                  onOptimize(basket, location, plannedStore)
                }}
                style={{ width: '100%', padding: 'var(--spacing-md)', background: 'var(--gradient-brand)', borderRadius: 'var(--radius-full)', color: '#fff', fontWeight: 600, fontSize: '1.1rem', boxShadow: '0 4px 15px rgba(139, 92, 246, 0.3)', transition: 'transform 0.2s', border: 'none' }}
                onMouseOver={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}
              >
                Optimize &amp; Compare
              </button>
            </div>
          </div>
        )}
      </div>

    </div>
  );
};
