import React, { useState } from 'react';

export interface UserProfile {
  name: string;
  email: string;
}

interface Props {
  onClose: () => void;
  onAuth: (user: UserProfile) => void;
}

// Simple hash for localStorage passwords (NOT production-grade crypto)
function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return hash.toString(36);
}

export const AuthModal: React.FC<Props> = ({ onClose, onAuth }) => {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password.trim()) {
      setError('Please fill in all fields.');
      return;
    }

    const storageKey = `l4m_user_${email.toLowerCase().trim()}`;

    if (mode === 'signup') {
      if (!name.trim()) {
        setError('Please enter your name.');
        return;
      }
      if (localStorage.getItem(storageKey)) {
        setError('An account with this email already exists. Try signing in.');
        return;
      }
      const profile = { name: name.trim(), email: email.toLowerCase().trim(), passwordHash: simpleHash(password) };
      localStorage.setItem(storageKey, JSON.stringify(profile));
      localStorage.setItem('l4m_session', JSON.stringify({ name: profile.name, email: profile.email }));
      onAuth({ name: profile.name, email: profile.email });
    } else {
      const stored = localStorage.getItem(storageKey);
      if (!stored) {
        setError('No account found. Please sign up first.');
        return;
      }
      const profile = JSON.parse(stored);
      if (profile.passwordHash !== simpleHash(password)) {
        setError('Incorrect password.');
        return;
      }
      localStorage.setItem('l4m_session', JSON.stringify({ name: profile.name, email: profile.email }));
      onAuth({ name: profile.name, email: profile.email });
    }
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: 'var(--spacing-sm) var(--spacing-md)',
    borderRadius: 'var(--radius-sm)',
    border: '1px solid var(--surface-border)',
    background: 'rgba(0,0,0,0.3)',
    color: 'var(--text-main)',
    outline: 'none',
    fontSize: '0.95rem',
    fontFamily: 'inherit',
  };

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
          width: '100%', maxWidth: '420px',
          padding: 'var(--spacing-xl)',
          position: 'relative',
          background: 'rgba(15, 15, 20, 0.95)',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.5)'
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          style={{ position: 'absolute', top: '12px', right: '16px', color: 'var(--text-muted)', fontSize: '1.5rem', background: 'none', border: 'none', cursor: 'pointer' }}
        >&times;</button>

        {/* Title */}
        <h2 style={{ fontSize: '1.5rem', marginBottom: 'var(--spacing-xs)', textAlign: 'center' }}>
          {mode === 'signin' ? 'Welcome Back' : 'Create Account'}
        </h2>
        <p style={{ color: 'var(--text-muted)', textAlign: 'center', fontSize: '0.9rem', marginBottom: 'var(--spacing-lg)' }}>
          {mode === 'signin' ? 'Sign in to load your saved baskets' : 'Sign up to save your baskets'}
        </p>

        {/* Tab Toggle */}
        <div style={{
          display: 'flex', gap: '4px', marginBottom: 'var(--spacing-lg)',
          background: 'rgba(0,0,0,0.3)', borderRadius: 'var(--radius-full)', padding: '3px',
        }}>
          <button
            onClick={() => { setMode('signin'); setError(''); }}
            style={{
              flex: 1, padding: 'var(--spacing-xs) 0', borderRadius: 'var(--radius-full)',
              fontWeight: 500, fontSize: '0.9rem', transition: 'all 0.2s', border: 'none', cursor: 'pointer',
              background: mode === 'signin' ? 'var(--primary)' : 'transparent',
              color: mode === 'signin' ? 'white' : 'var(--text-muted)',
            }}
          >Sign In</button>
          <button
            onClick={() => { setMode('signup'); setError(''); }}
            style={{
              flex: 1, padding: 'var(--spacing-xs) 0', borderRadius: 'var(--radius-full)',
              fontWeight: 500, fontSize: '0.9rem', transition: 'all 0.2s', border: 'none', cursor: 'pointer',
              background: mode === 'signup' ? 'var(--primary)' : 'transparent',
              color: mode === 'signup' ? 'white' : 'var(--text-muted)',
            }}
          >Sign Up</button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
          {mode === 'signup' && (
            <div>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px', display: 'block' }}>Name</label>
              <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Your name" style={inputStyle} />
            </div>
          )}
          <div>
            <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px', display: 'block' }}>Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" style={inputStyle} />
          </div>
          <div>
            <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px', display: 'block' }}>Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" style={inputStyle} />
          </div>

          {error && (
            <div style={{ color: 'var(--accent)', fontSize: '0.85rem', textAlign: 'center', padding: '4px 0' }}>{error}</div>
          )}

          <button
            type="submit"
            style={{
              width: '100%', padding: 'var(--spacing-md)',
              background: 'var(--gradient-brand)', borderRadius: 'var(--radius-full)',
              color: '#fff', fontWeight: 600, fontSize: '1rem',
              boxShadow: '0 4px 15px rgba(139, 92, 246, 0.3)',
              transition: 'transform 0.2s', border: 'none', cursor: 'pointer',
              marginTop: 'var(--spacing-xs)',
            }}
            onMouseOver={e => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}
          >
            {mode === 'signin' ? 'Sign In' : 'Create Account'}
          </button>
        </form>
      </div>
    </div>
  );
};
