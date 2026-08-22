import React, { useState, useEffect } from 'react';

interface AnalyticsSummary {
  totalBaskets: number;
  uniqueUserCount?: number;
  totalPlatformSavings?: number;
  thisMonthPlatformSavings?: number;
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

interface ResearchData {
  totalResponses?: number;
  recommendationAcceptanceRate?: number;
  avgSavingsAmount?: number;
  avgSavingsPercent?: number;
  avgBasketTotal?: number;
  avgMinSavingsNeeded?: number;
  mostValuedFeature?: string;
  mostCommonConcern?: string;
  avgRating?: number;
  responses?: unknown[];
}

interface Props {
  onBack: () => void;
}

interface PostHogStats {
  configured: boolean;
  pageviews: number | null;
  uniqueVisitors: number | null;
  period?: string;
  error?: string;
}

export const AdminDashboard: React.FC<Props> = ({ onBack }) => {
  const [data, setData] = useState<AnalyticsSummary | null>(null);
  const [researchData, setResearchData] = useState<ResearchData | null>(null);
  const [posthogStats, setPosthogStats] = useState<PostHogStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [runningBenchmark, setRunningBenchmark] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'personal' | 'overview' | 'research' | 'bad_results' | 'geo' | 'categories' | 'visitors'>('research');

  const personalHistory: Array<{ savingsAmount: number; timestamp: number }> = (() => {
    try {
      const saved = localStorage.getItem('priceiq_savings_history');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  })();

  const personalTotalSavings = personalHistory.reduce((sum, r) => sum + (r.savingsAmount || 0), 0);
  const personalCount = personalHistory.length;
  const personalThisWeek = personalHistory
    .filter(r => (Date.now() - r.timestamp) <= 7 * 24 * 60 * 60 * 1000)
    .reduce((sum, r) => sum + (r.savingsAmount || 0), 0);
  const personalThisMonth = personalHistory
    .filter(r => {
      const d = new Date(r.timestamp);
      const now = new Date();
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    })
    .reduce((sum, r) => sum + (r.savingsAmount || 0), 0);

  const fetchAnalytics = async () => {
    setLoading(true);
    setError(null);
    try {
      const [res1, res2, res3] = await Promise.all([
        fetch('/api/analytics-summary'),
        fetch('/api/research-summary'),
        fetch('/api/posthog-stats')
      ]);
      if (res1.ok) setData(await res1.json());
      if (res2.ok) setResearchData(await res2.json());
      if (res3.ok) setPosthogStats(await res3.json());
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to load analytics data.';
      setError(msg);
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
    } catch (err: unknown) {
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
          <h1 style={{ fontSize: '2rem', fontWeight: 700 }}>Analytics &amp; Evaluation Dashboard</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            Collecting benchmark savings, median distributions, geographic/category splits &amp; bad results telemetry.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 'var(--spacing-sm)', flexWrap: 'wrap' }}>
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
          onClick={() => setActiveTab('research')}
          style={{
            padding: '8px 16px',
            borderRadius: 'var(--radius-sm)',
            fontWeight: 700,
            background: activeTab === 'research' ? 'rgba(14, 165, 233, 0.2)' : 'transparent',
            color: activeTab === 'research' ? 'var(--secondary)' : 'var(--text-muted)',
            border: 'none',
            cursor: 'pointer'
          }}
        >
          🔬 Consumer Research &amp; Pilot Study
        </button>
        <button
          onClick={() => setActiveTab('personal')}
          style={{
            padding: '8px 16px',
            borderRadius: 'var(--radius-sm)',
            fontWeight: 700,
            background: activeTab === 'personal' ? 'rgba(16, 185, 129, 0.2)' : 'transparent',
            color: activeTab === 'personal' ? 'var(--primary)' : 'var(--text-muted)',
            border: 'none',
            cursor: 'pointer'
          }}
        >
          💰 Personal Savings &amp; ROI
        </button>
        <button
          onClick={() => setActiveTab('overview')}
          style={{
            padding: '8px 16px',
            borderRadius: 'var(--radius-sm)',
            fontWeight: 600,
            background: activeTab === 'overview' ? 'rgba(16, 185, 129, 0.2)' : 'transparent',
            color: activeTab === 'overview' ? 'var(--primary)' : 'var(--text-muted)',
            border: 'none',
            cursor: 'pointer'
          }}
        >
          📈 Global Benchmark Engine
        </button>
        <button
          onClick={() => setActiveTab('visitors')}
          style={{
            padding: '8px 16px',
            borderRadius: 'var(--radius-sm)',
            fontWeight: 600,
            background: activeTab === 'visitors' ? 'rgba(168, 85, 247, 0.2)' : 'transparent',
            color: activeTab === 'visitors' ? '#a855f7' : 'var(--text-muted)',
            border: 'none',
            cursor: 'pointer'
          }}
        >
          👁️ Visitor Insights
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
          🚨 Telemetry Log ({data.badResults.length})
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

      {/* Tab: Visitor Insights (PostHog) */}
      {activeTab === 'visitors' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-lg)' }}>
          <div className="glass-panel" style={{ padding: 'var(--spacing-lg)', borderRadius: 'var(--radius-md)', background: 'linear-gradient(135deg, rgba(168,85,247,0.08) 0%, rgba(14,165,233,0.05) 100%)', border: '1px solid rgba(168,85,247,0.25)' }}>
            <h3 style={{ fontSize: '1.25rem', margin: '0 0 4px' }}>Visitor Insights · Powered by PostHog</h3>
            <p style={{ margin: 0, fontSize: '0.88rem', color: 'var(--text-muted)' }}>
              {posthogStats?.period || 'Last 30 days'} · Real-time behavioral tracking
            </p>
          </div>

          {!posthogStats?.configured ? (
            <div className="glass-panel" style={{ padding: 'var(--spacing-xl)', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
              <div style={{ fontSize: '3rem', marginBottom: 'var(--spacing-md)' }}>🔧</div>
              <h3 style={{ marginBottom: 'var(--spacing-sm)' }}>PostHog Not Fully Connected</h3>
              <p style={{ color: 'var(--text-muted)', maxWidth: '500px', margin: '0 auto var(--spacing-md)' }}>
                To see visitor data here, add two more environment variables to your Vercel project:
              </p>
              <div style={{ background: 'rgba(0,0,0,0.3)', borderRadius: 'var(--radius-sm)', padding: 'var(--spacing-md)', textAlign: 'left', maxWidth: '450px', margin: '0 auto', fontFamily: 'monospace', fontSize: '0.85rem' }}>
                <div style={{ color: '#a855f7' }}>POSTHOG_PERSONAL_API_KEY</div>
                <div style={{ color: 'var(--text-muted)', marginBottom: '8px' }}>→ From PostHog: Settings → Personal API Keys</div>
                <div style={{ color: '#a855f7' }}>POSTHOG_PROJECT_ID</div>
                <div style={{ color: 'var(--text-muted)' }}>→ From PostHog: Project Settings → Project ID (a number)</div>
              </div>
            </div>
          ) : posthogStats?.error ? (
            <div className="glass-panel" style={{ padding: 'var(--spacing-lg)', borderRadius: 'var(--radius-md)', textAlign: 'center', color: 'var(--text-muted)' }}>
              ⚠️ Could not load PostHog data: {posthogStats.error}
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 'var(--spacing-md)' }}>
              <div className="glass-panel" style={{ padding: 'var(--spacing-lg)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(168,85,247,0.2)' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Total Page Views</span>
                <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#a855f7', marginTop: '4px' }}>
                  {posthogStats?.pageviews?.toLocaleString() ?? '—'}
                </div>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Last 30 days</span>
              </div>
              <div className="glass-panel" style={{ padding: 'var(--spacing-lg)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(168,85,247,0.2)' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Unique Visitors</span>
                <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#a855f7', marginTop: '4px' }}>
                  {posthogStats?.uniqueVisitors?.toLocaleString() ?? '—'}
                </div>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Daily Active Users (30d total)</span>
              </div>
              <div className="glass-panel" style={{ padding: 'var(--spacing-lg)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(168,85,247,0.2)' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Session Replays</span>
                <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#a855f7', marginTop: '8px' }}>View on PostHog</div>
                <a href="https://us.posthog.com" target="_blank" rel="noopener noreferrer"
                  style={{ fontSize: '0.78rem', color: '#a855f7', textDecoration: 'underline' }}>Open PostHog Dashboard →</a>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab: Consumer Research Dashboard */}
      {activeTab === 'research' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-lg)' }}>
          
          {/* Header Card with CSV Download */}
          <div className="glass-panel" style={{ padding: 'var(--spacing-lg)', borderRadius: 'var(--radius-md)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--spacing-md)', background: 'linear-gradient(135deg, rgba(14, 165, 233, 0.08) 0%, rgba(5, 150, 105, 0.05) 100%)', border: '1px solid rgba(14, 165, 233, 0.25)' }}>
            <div>
              <h3 style={{ fontSize: '1.25rem', margin: 0, color: 'var(--text-main)' }}>PriceIQ Consumer Decision Research Dataset</h3>
              <p style={{ margin: 0, fontSize: '0.88rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                Empirical trial evaluation of consumer recommendation acceptance, travel elasticity, and savings thresholds.
              </p>
            </div>

            <a 
              href="/api/admin/research/export-csv"
              download="priceiq_research_dataset.csv"
              className="btn-3d"
              style={{ padding: '10px 20px', fontSize: '0.9rem', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
              📥 Export Dataset (CSV for SPSS / R / Excel)
            </a>
          </div>

          {/* Research Summary Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 'var(--spacing-md)' }}>
            <div className="glass-panel" style={{ padding: 'var(--spacing-lg)', borderRadius: 'var(--radius-md)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', minHeight: '2.5rem', display: 'flex', alignItems: 'flex-start' }}>Total Participants / Responses</span>
                <div style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--text-main)', margin: '4px 0 8px' }}>
                  {researchData?.totalResponses ?? 0}
                </div>
              </div>
              <span style={{ fontSize: '0.78rem', color: (researchData?.totalResponses ?? 0) > 0 ? 'var(--primary)' : 'var(--text-muted)', fontWeight: 600 }}>
                {(researchData?.totalResponses ?? 0) > 0 ? 'Active Pilot Study' : 'No Responses Yet'}
              </span>
            </div>

            <div className="glass-panel" style={{ padding: 'var(--spacing-lg)', borderRadius: 'var(--radius-md)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', minHeight: '2.5rem', display: 'flex', alignItems: 'flex-start' }}>Recommendation Acceptance Rate</span>
                <div style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--text-main)', margin: '4px 0 8px' }}>
                  {researchData?.recommendationAcceptanceRate ?? 0}%
                </div>
              </div>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Users Likely or Very Likely to use</span>
            </div>

            <div className="glass-panel" style={{ padding: 'var(--spacing-lg)', borderRadius: 'var(--radius-md)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', minHeight: '2.5rem', display: 'flex', alignItems: 'flex-start' }}>Average Savings</span>
                <div style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--primary)', margin: '4px 0 8px' }}>
                  ${(researchData?.avgSavingsAmount ?? 0).toFixed(2)} <span style={{ fontSize: '1rem', color: 'var(--text-muted)', fontWeight: 600 }}>({(researchData?.avgSavingsPercent ?? 0).toFixed(1)}%)</span>
                </div>
              </div>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Avg Basket: ${(researchData?.avgBasketTotal ?? 0).toFixed(2)}</span>
            </div>

            <div className="glass-panel" style={{ padding: 'var(--spacing-lg)', borderRadius: 'var(--radius-md)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', minHeight: '2.5rem', display: 'flex', alignItems: 'flex-start' }}>Min Savings Needed per Extra Store</span>
                <div style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--text-main)', margin: '4px 0 8px' }}>
                  ${(researchData?.avgMinSavingsNeeded ?? 0).toFixed(2)}
                </div>
              </div>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Threshold before multi-store trip</span>
            </div>
          </div>

          {/* Qualitative Insight Badges */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'var(--spacing-md)' }}>
            <div className="glass-panel" style={{ padding: 'var(--spacing-lg)', borderRadius: 'var(--radius-md)' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Most Valued Benefit</span>
              <h4 style={{ fontSize: '1.3rem', color: 'var(--primary)', margin: '6px 0 0 0' }}>
                {researchData?.mostValuedFeature || 'None yet'}
              </h4>
            </div>

            <div className="glass-panel" style={{ padding: 'var(--spacing-lg)', borderRadius: 'var(--radius-md)' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Primary Discouraging Concern</span>
              <h4 style={{ fontSize: '1.3rem', color: '#fbbf24', margin: '6px 0 0 0' }}>
                {researchData?.mostCommonConcern || 'None yet'}
              </h4>
            </div>

            <div className="glass-panel" style={{ padding: 'var(--spacing-lg)', borderRadius: 'var(--radius-md)' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Average Recommendation Clarity</span>
              <h4 style={{ fontSize: '1.3rem', color: '#38bdf8', margin: '6px 0 0 0' }}>
                ⭐ {researchData?.avgRating ? researchData.avgRating.toFixed(1) : '0.0'} / 5.0 Rating
              </h4>
            </div>
          </div>

        </div>
      )}

      {/* Tab: Personal Savings & ROI Dashboard */}
      {activeTab === 'personal' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-lg)' }}>
          
          {/* Top Savings Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 'var(--spacing-md)' }}>
            <div className="glass-panel" style={{ padding: 'var(--spacing-lg)', borderRadius: 'var(--radius-md)' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>This Week's Savings</span>
              <div style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--primary)', marginTop: '4px' }}>${personalThisWeek.toFixed(2)}</div>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                {personalHistory.filter(r => (Date.now() - r.timestamp) <= 7 * 24 * 60 * 60 * 1000).length} basket run(s)
              </span>
            </div>
            
            <div className="glass-panel" style={{ padding: 'var(--spacing-lg)', borderRadius: 'var(--radius-md)' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>This Month's Savings</span>
              <div style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--primary)', marginTop: '4px' }}>${personalThisMonth.toFixed(2)}</div>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                {personalHistory.filter(r => { const d = new Date(r.timestamp); const now = new Date(); return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear(); }).length} baskets optimized
              </span>
            </div>

            <div className="glass-panel" style={{ padding: 'var(--spacing-lg)', borderRadius: 'var(--radius-md)' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Total Savings Since Joining</span>
              <div style={{ fontSize: '2.2rem', fontWeight: 800, color: '#38bdf8', marginTop: '4px' }}>${personalTotalSavings.toFixed(2)}</div>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{personalCount} baskets optimized</span>
            </div>
          </div>

          {/* Community Rank & ROI proof */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 'var(--spacing-md)' }}>
            <div className="glass-panel" style={{ padding: 'var(--spacing-xl)', borderRadius: 'var(--radius-md)', background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, rgba(14, 165, 233, 0.05) 100%)', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '8px' }}>🏆</div>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '6px', color: 'var(--text-main)' }}>Shopper Household Performance</h3>
              <p style={{ color: 'var(--primary)', fontWeight: 700, fontSize: '1.05rem', margin: 0 }}>
                {personalCount === 0 
                  ? 'Complete your first basket optimization to establish your household savings benchmark!'
                  : `You've saved $${personalTotalSavings.toFixed(2)} across ${personalCount} trip(s)!`}
              </p>
            </div>

            <div className="glass-panel" style={{ padding: 'var(--spacing-xl)', borderRadius: 'var(--radius-md)', background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.08) 0%, rgba(59, 130, 246, 0.05) 100%)', border: '1px solid rgba(139, 92, 246, 0.3)' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '8px' }}>💳</div>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '6px', color: 'var(--text-main)' }}>PriceIQ Household Net ROI</h3>
              <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                PriceIQ Service Cost: <strong style={{ color: 'var(--text-main)' }}>Free / Premium $0.00</strong><br/>
                Net Household Savings: <strong style={{ color: 'var(--primary)', fontSize: '1.1rem' }}>+${personalThisMonth.toFixed(2)} this month</strong>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* OVERVIEW TAB */}
      {activeTab === 'overview' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-lg)' }}>
          {/* Cumulative Platform-Wide All-User Savings Banner */}
          <div className="glass-panel animate-fade-in" style={{ width: '100%', padding: '20px 24px', borderRadius: 'var(--radius-md)', background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(14, 165, 233, 0.1) 100%)', border: '1px solid rgba(16, 185, 129, 0.35)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.82rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--primary)', fontWeight: 700 }}>
                🌐 Platform-Wide Cumulative Community Impact (All Users)
              </span>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                {data.totalBaskets === 0 ? '0 Baskets Evaluated' : `Live aggregate across ${data.uniqueUserCount ?? 0} unique user(s) & ${data.totalBaskets} shopping trips`}
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center', flexWrap: 'wrap', gap: '16px', width: '100%' }}>
              <div style={{ textAlign: 'center' }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Unique Active Users</span>
                <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--secondary)' }}>{data.uniqueUserCount ?? 0}</div>
              </div>
              <div style={{ width: '1px', height: '32px', background: 'rgba(255,255,255,0.1)' }}></div>
              <div style={{ textAlign: 'center' }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>This Month All-User Saved</span>
                <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--success)' }}>${(data.thisMonthPlatformSavings ?? 0).toFixed(2)}</div>
              </div>
              <div style={{ width: '1px', height: '32px', background: 'rgba(255,255,255,0.1)' }}></div>
              <div style={{ textAlign: 'center' }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total All-User Savings</span>
                <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--primary)' }}>${(data.totalPlatformSavings ?? 0).toFixed(2)}</div>
              </div>
              <div style={{ width: '1px', height: '32px', background: 'rgba(255,255,255,0.1)' }}></div>
              <div style={{ textAlign: 'center' }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Avg Savings Per Trip</span>
                <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#38bdf8' }}>${(data.averageSavingsAmount ?? 0).toFixed(2)}</div>
              </div>
              <div style={{ width: '1px', height: '32px', background: 'rgba(255,255,255,0.1)' }}></div>
              <div style={{ textAlign: 'center' }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Projected Annual Community</span>
                <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#fbbf24' }}>${Math.round((data.averageSavingsAmount ?? 0) * 52 * (data.totalBaskets || 1)).toLocaleString()}/yr</div>
              </div>
            </div>
          </div>

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
      {activeTab === 'geo' && (() => {
        const geoList = Array.isArray(data?.geographicDifferences) ? data.geographicDifferences : [];
        return (
          <div className="glass-panel" style={{ padding: 'var(--spacing-xl)' }}>
            <h3 style={{ fontSize: '1.25rem', marginBottom: 'var(--spacing-md)' }}>📍 Geographic Differences</h3>
            {geoList.length === 0 ? (
              <div style={{ color: 'var(--text-muted)', padding: 'var(--spacing-md)', textAlign: 'center' }}>
                No geographic differences logged yet. Run a benchmark test to generate geographic metrics!
              </div>
            ) : (
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
                    {geoList.map((g, i) => (
                      <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        <td style={{ padding: '12px 8px', fontWeight: 600 }}>{g.location || 'Unknown'}</td>
                        <td style={{ padding: '12px 8px' }}>{g.basketCount || 0}</td>
                        <td style={{ padding: '12px 8px', color: 'var(--success)', fontWeight: 600 }}>${(Number(g.averageSavings) || 0).toFixed(2)}</td>
                        <td style={{ padding: '12px 8px', color: 'var(--primary)', fontWeight: 600 }}>${(Number(g.medianSavings) || 0).toFixed(2)}</td>
                        <td style={{ padding: '12px 8px' }}>{g.improvedRate || 0}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        );
      })()}

      {/* CATEGORY TAB */}
      {activeTab === 'categories' && (() => {
        const catList = Array.isArray(data?.categoryDifferences) ? data.categoryDifferences : [];
        return (
          <div className="glass-panel" style={{ padding: 'var(--spacing-xl)' }}>
            <h3 style={{ fontSize: '1.25rem', marginBottom: 'var(--spacing-md)' }}>🏷️ Grocery Category Differences</h3>
            {catList.length === 0 ? (
              <div style={{ color: 'var(--text-muted)', padding: 'var(--spacing-md)', textAlign: 'center' }}>
                No category differences logged yet. Run a benchmark test to generate category metrics!
              </div>
            ) : (
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
                    {catList.map((c, i) => (
                      <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        <td style={{ padding: '12px 8px', fontWeight: 600 }}>{c.category || 'General'}</td>
                        <td style={{ padding: '12px 8px' }}>{c.basketCount || 0}</td>
                        <td style={{ padding: '12px 8px', color: 'var(--success)', fontWeight: 600 }}>${(Number(c.averageSavings) || 0).toFixed(2)}</td>
                        <td style={{ padding: '12px 8px', color: 'var(--primary)', fontWeight: 600 }}>${(Number(c.medianSavings) || 0).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        );
      })()}
    </div>
  );
};
