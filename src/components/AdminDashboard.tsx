import React, { useState, useEffect } from 'react';

interface AnalyticsSummary {
  totalBaskets: number;
  averageSavingsAmount: number;
  medianSavingsAmount: number;
  averageSavingsPercent: number;
  medianSavingsPercent: number;
  rangeSavingsAmount: { min: number; max: number };
  rangeSavingsPercent: { min: number; max: number };
  improvedCount: number;
  improvedPercentage: number;
  notWorthwhileCount: number;
  notWorthwhilePercentage: number;
  geographicDifferences: Array<{
    location: string;
    basketCount: number;
    averageSavings: number;
    medianSavings: number;
    improvedRate: number;
  }>;
  categoryDifferences: Array<{
    category: string;
    basketCount: number;
    averageSavings: number;
    medianSavings: number;
  }>;
  badResults: Array<{
    id: string;
    timestamp: string;
    location: string;
    baselineStore: string;
    itemCount: number;
    baselineTotal: number;
    optimalTotal: number;
    savingsAmount: number;
    savingsPercent: number;
    storesCount: number;
    resultType: string;
    reason: string;
  }>;
}

interface Props {
  onBack: () => void;
}

export const AdminDashboard: React.FC<Props> = ({ onBack }) => {
  const [data, setData] = useState<AnalyticsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [runningBenchmark, setRunningBenchmark] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'bad_results' | 'geo' | 'categories'>('overview');

  const fetchAnalytics = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/analytics');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      setData(json);
    } catch (err: any) {
      setError(err.message || 'Failed to load analytics data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const triggerBenchmark = async () => {
    setRunningBenchmark(true);
    try {
      // Refresh analytics after running
      await fetchAnalytics();
    } catch (err: any) {
      console.error(err);
    } finally {
      setRunningBenchmark(false);
    }
  };

  if (loading) {
    return (
      <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '400px', gap: 'var(--spacing-md)' }}>
        <div style={{ fontSize: '2.5rem', animation: 'pulse 1.5s infinite' }}>📊</div>
        <h2 style={{ fontSize: '1.25rem', color: 'var(--text-main)' }}>Loading Analytics Engine...</h2>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="animate-fade-in" style={{ textAlign: 'center', padding: 'var(--spacing-xl)' }}>
        <div style={{ fontSize: '3rem', marginBottom: 'var(--spacing-md)' }}>⚠️</div>
        <h2 style={{ fontSize: '1.5rem', marginBottom: 'var(--spacing-sm)' }}>Analytics Unavailable</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: 'var(--spacing-md)' }}>{error || 'No data found.'}</p>
        <button onClick={fetchAnalytics} style={{ background: 'var(--gradient-brand)', color: 'white', padding: '8px 20px', borderRadius: 'var(--radius-full)', fontWeight: 600 }}>
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="animate-fade-in" style={{ width: '100%', maxWidth: '1100px', margin: '0 auto', padding: '0 var(--spacing-md)' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-xl)', flexWrap: 'wrap', gap: 'var(--spacing-md)' }}>
        <div>
          <button onClick={onBack} style={{ color: 'var(--text-muted)', marginBottom: 'var(--spacing-xs)', display: 'block' }}>&larr; Back to App</button>
          <h1 style={{ fontSize: '2rem', fontWeight: 700 }}>Analytics & Evaluation Dashboard</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            Collecting benchmark savings, median distributions, geographic/category splits & bad results telemetry.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 'var(--spacing-sm)' }}>
          <button
            onClick={fetchAnalytics}
            className="glass-panel"
            style={{ padding: '8px 16px', borderRadius: 'var(--radius-md)', fontWeight: 500, fontSize: '0.9rem', cursor: 'pointer' }}
          >
            🔄 Refresh
          </button>
          <button
            onClick={triggerBenchmark}
            disabled={runningBenchmark}
            style={{
              background: 'var(--gradient-brand)',
              color: 'white',
              padding: '8px 20px',
              borderRadius: 'var(--radius-md)',
              fontWeight: 600,
              fontSize: '0.9rem',
              border: 'none',
              cursor: runningBenchmark ? 'not-allowed' : 'pointer',
              opacity: runningBenchmark ? 0.7 : 1
            }}
          >
            {runningBenchmark ? '⚡ Fetching...' : '🚀 Re-run Benchmark Tests'}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 'var(--spacing-sm)', marginBottom: 'var(--spacing-lg)', borderBottom: '1px solid var(--surface-border)', paddingBottom: 'var(--spacing-xs)', flexWrap: 'wrap' }}>
        <button
          onClick={() => setActiveTab('overview')}
          style={{
            padding: '8px 16px',
            borderRadius: 'var(--radius-sm)',
            fontWeight: 600,
            background: activeTab === 'overview' ? 'rgba(139, 92, 246, 0.2)' : 'transparent',
            color: activeTab === 'overview' ? 'var(--primary)' : 'var(--text-muted)',
            border: 'none',
            cursor: 'pointer'
          }}
        >
          📈 Overview Metrics
        </button>
        <button
          onClick={() => setActiveTab('bad_results')}
          style={{
            padding: '8px 16px',
            borderRadius: 'var(--radius-sm)',
            fontWeight: 600,
            background: activeTab === 'bad_results' ? 'rgba(239, 68, 68, 0.2)' : 'transparent',
            color: activeTab === 'bad_results' ? '#f87171' : 'var(--text-muted)',
            border: 'none',
            cursor: 'pointer'
          }}
        >
          🚨 Bad / Minimal Results ({data.badResults.length})
        </button>
        <button
          onClick={() => setActiveTab('geo')}
          style={{
            padding: '8px 16px',
            borderRadius: 'var(--radius-sm)',
            fontWeight: 600,
            background: activeTab === 'geo' ? 'rgba(59, 130, 246, 0.2)' : 'transparent',
            color: activeTab === 'geo' ? 'var(--secondary)' : 'var(--text-muted)',
            border: 'none',
            cursor: 'pointer'
          }}
        >
          📍 Geographic Differences
        </button>
        <button
          onClick={() => setActiveTab('categories')}
          style={{
            padding: '8px 16px',
            borderRadius: 'var(--radius-sm)',
            fontWeight: 600,
            background: activeTab === 'categories' ? 'rgba(16, 185, 129, 0.2)' : 'transparent',
            color: activeTab === 'categories' ? 'var(--success)' : 'var(--text-muted)',
            border: 'none',
            cursor: 'pointer'
          }}
        >
          🏷️ Category Differences
        </button>
      </div>

      {/* OVERVIEW TAB */}
      {activeTab === 'overview' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-lg)' }}>
          {/* Main Key Indicators Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 'var(--spacing-md)' }}>
            <div className="glass-panel" style={{ padding: 'var(--spacing-lg)' }}>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Average Potential Savings</div>
              <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--success)' }}>${data.averageSavingsAmount}</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>{data.averageSavingsPercent}% avg total reduction</div>
            </div>

            <div className="glass-panel" style={{ padding: 'var(--spacing-lg)' }}>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Median Potential Savings</div>
              <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--primary)' }}>${data.medianSavingsAmount}</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>{data.medianSavingsPercent}% median reduction</div>
            </div>

            <div className="glass-panel" style={{ padding: 'var(--spacing-lg)' }}>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Savings Range</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-main)' }}>
                ${data.rangeSavingsAmount.min} ➔ ${data.rangeSavingsAmount.max}
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                {data.rangeSavingsPercent.min}% to {data.rangeSavingsPercent.max}% range
              </div>
            </div>

            <div className="glass-panel" style={{ padding: 'var(--spacing-lg)' }}>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Multi-Store Value Worthwhile</div>
              <div style={{ fontSize: '2rem', fontWeight: 700, color: data.improvedPercentage > 50 ? 'var(--success)' : '#f87171' }}>
                {data.improvedPercentage}%
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                {data.improvedCount} improved / {data.notWorthwhileCount} not worthwhile
              </div>
            </div>
          </div>

          {/* Quick Summary Cards */}
          <div className="glass-panel" style={{ padding: 'var(--spacing-xl)' }}>
            <h3 style={{ fontSize: '1.2rem', marginBottom: 'var(--spacing-md)' }}>📊 Executive Analytics Insights</h3>
            <ul style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)', color: 'var(--text-main)', fontSize: '0.95rem' }}>
              <li>
                🛒 <strong>Total Baskets Evaluated:</strong> {data.totalBaskets} total shopping lists processed.
              </li>
              <li>
                💡 <strong>Median vs Mean Gap:</strong> Mean savings sit at <strong>${data.averageSavingsAmount}</strong> while Median sits at <strong>${data.medianSavingsAmount}</strong>, indicating high-dollar organic/bulk baskets shift the mathematical average upward.
              </li>
              <li>
                🚨 <strong>Zero & Negligible Savings Baskets:</strong> <strong>{data.notWorthwhileCount}</strong> out of {data.totalBaskets} baskets ({data.notWorthwhilePercentage}%) did not justify multi-store trips because either single stores were already optimal or savings were under $1.50.
              </li>
            </ul>
          </div>
        </div>
      )}

      {/* BAD RESULTS TAB */}
      {activeTab === 'bad_results' && (
        <div className="glass-panel" style={{ padding: 'var(--spacing-xl)' }}>
          <div style={{ marginBottom: 'var(--spacing-md)' }}>
            <h3 style={{ fontSize: '1.25rem', color: '#f87171', marginBottom: '4px' }}>🚨 Bad & Minimal Results Telemetry Log</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              Tracking cases where multi-store purchasing yielded $0 savings, minimal savings ($&lt;$1.50), or where a single store was already optimal.
            </p>
          </div>

          {data.badResults.length === 0 ? (
            <div style={{ padding: 'var(--spacing-lg)', textAlign: 'center', color: 'var(--success)' }}>
              🎉 No bad or disappointing results logged yet!
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--surface-border)', color: 'var(--text-muted)' }}>
                    <th style={{ padding: '8px' }}>Result Type</th>
                    <th style={{ padding: '8px' }}>Location</th>
                    <th style={{ padding: '8px' }}>Planned Store</th>
                    <th style={{ padding: '8px' }}>Baseline</th>
                    <th style={{ padding: '8px' }}>Optimal</th>
                    <th style={{ padding: '8px' }}>Savings</th>
                    <th style={{ padding: '8px' }}>Stores</th>
                    <th style={{ padding: '8px' }}>Diagnostic Reason</th>
                  </tr>
                </thead>
                <tbody>
                  {data.badResults.map((r, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <td style={{ padding: '10px 8px' }}>
                        <span style={{
                          padding: '2px 8px',
                          borderRadius: 'var(--radius-full)',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          background: r.resultType === 'ZERO_SAVINGS' ? 'rgba(239,68,68,0.15)' : 'rgba(245,158,11,0.15)',
                          color: r.resultType === 'ZERO_SAVINGS' ? '#f87171' : '#fbbf24'
                        }}>
                          {r.resultType}
                        </span>
                      </td>
                      <td style={{ padding: '10px 8px', fontWeight: 500 }}>{r.location}</td>
                      <td style={{ padding: '10px 8px', color: 'var(--text-muted)' }}>{r.baselineStore}</td>
                      <td style={{ padding: '10px 8px' }}>${r.baselineTotal.toFixed(2)}</td>
                      <td style={{ padding: '10px 8px' }}>${r.optimalTotal.toFixed(2)}</td>
                      <td style={{ padding: '10px 8px', fontWeight: 600, color: r.savingsAmount > 0 ? 'var(--success)' : 'var(--text-muted)' }}>
                        ${r.savingsAmount.toFixed(2)} ({r.savingsPercent}%)
                      </td>
                      <td style={{ padding: '10px 8px' }}>{r.storesCount} stop{r.storesCount > 1 ? 's' : ''}</td>
                      <td style={{ padding: '10px 8px', color: 'var(--text-muted)', fontSize: '0.8rem' }}>{r.reason}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* GEOGRAPHIC TAB */}
      {activeTab === 'geo' && (
        <div className="glass-panel" style={{ padding: 'var(--spacing-xl)' }}>
          <h3 style={{ fontSize: '1.25rem', marginBottom: 'var(--spacing-md)' }}>📍 Geographic Differences</h3>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--surface-border)', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '8px' }}>Location</th>
                  <th style={{ padding: '8px' }}>Evaluated Baskets</th>
                  <th style={{ padding: '8px' }}>Average Savings ($)</th>
                  <th style={{ padding: '8px' }}>Median Savings ($)</th>
                  <th style={{ padding: '8px' }}>Worthwhile Multi-Store Rate</th>
                </tr>
              </thead>
              <tbody>
                {data.geographicDifferences.map((g, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <td style={{ padding: '12px 8px', fontWeight: 600 }}>{g.location}</td>
                    <td style={{ padding: '12px 8px' }}>{g.basketCount}</td>
                    <td style={{ padding: '12px 8px', color: 'var(--success)', fontWeight: 600 }}>${g.averageSavings.toFixed(2)}</td>
                    <td style={{ padding: '12px 8px', color: 'var(--primary)', fontWeight: 600 }}>${g.medianSavings.toFixed(2)}</td>
                    <td style={{ padding: '12px 8px' }}>{g.improvedRate}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CATEGORY TAB */}
      {activeTab === 'categories' && (
        <div className="glass-panel" style={{ padding: 'var(--spacing-xl)' }}>
          <h3 style={{ fontSize: '1.25rem', marginBottom: 'var(--spacing-md)' }}>🏷️ Grocery Category Differences</h3>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--surface-border)', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '8px' }}>Category</th>
                  <th style={{ padding: '8px' }}>Baskets Containing Category</th>
                  <th style={{ padding: '8px' }}>Average Savings ($)</th>
                  <th style={{ padding: '8px' }}>Median Savings ($)</th>
                </tr>
              </thead>
              <tbody>
                {data.categoryDifferences.map((c, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <td style={{ padding: '12px 8px', fontWeight: 600 }}>{c.category}</td>
                    <td style={{ padding: '12px 8px' }}>{c.basketCount}</td>
                    <td style={{ padding: '12px 8px', color: 'var(--success)', fontWeight: 600 }}>${c.averageSavings.toFixed(2)}</td>
                    <td style={{ padding: '12px 8px', color: 'var(--primary)', fontWeight: 600 }}>${c.medianSavings.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
