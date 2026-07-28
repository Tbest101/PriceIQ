import fs from 'fs';
import path from 'path';

// Vercel KV environment variables (Upstash REST format)
const useKV = !!(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN);

// Serverless function environments only allow writing to /tmp
const localDbPath = process.env.VERCEL 
  ? '/tmp/local_analytics.json'
  : path.join(process.cwd(), 'local_analytics.json');

// Helper to query Vercel KV / Upstash Redis REST API
async function kvFetch(commandArray) {
  const url = process.env.KV_REST_API_URL;
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.KV_REST_API_TOKEN}`,
      'Content-Type': 'application/json',
      Accept: 'application/json'
    },
    body: JSON.stringify(commandArray)
  });
  if (!response.ok) {
    throw new Error(`KV REST Error: ${response.status} ${response.statusText}`);
  }
  return await response.json();
}

// Local in-memory state for development fallback
let memoryDb = {
  visits: 0,
  uniqueUsers: {}, // sessionId -> timestamp
  optimizations: 0,
  searches: {}, // query -> count
  events: [], // Array of { type, sessionId, query/itemCount, timestamp }
  optimizationMetrics: [] // Array of optimization records for deep analytics
};

// Load local database if it exists (and we're not using KV)
if (!useKV && fs.existsSync(localDbPath)) {
  try {
    const data = fs.readFileSync(localDbPath, 'utf8');
    memoryDb = { optimizationMetrics: [], ...JSON.parse(data) };
  } catch (err) {
    console.error('⚠️ Failed to parse local DB, starting fresh:', err.message);
  }
}

function saveLocalDb() {
  if (useKV) return;
  try {
    fs.writeFileSync(localDbPath, JSON.stringify(memoryDb, null, 2), 'utf8');
  } catch (err) {
    console.error('⚠️ Failed to save local DB:', err.message);
  }
}

export async function logVisit(sessionId, ip) {
  const timestamp = new Date().toISOString();
  const uid = sessionId || ip || 'unknown_session';
  
  if (useKV) {
    try {
      await kvFetch(['INCR', 'stats:total_visits']);
      await kvFetch(['SADD', 'stats:unique_users', uid]);
      const event = JSON.stringify({ type: 'visit', sessionId: uid, ip, timestamp });
      await kvFetch(['LPUSH', 'stats:events', event]);
      await kvFetch(['LTRIM', 'stats:events', 0, 99]);
    } catch (err) {
      console.error('❌ KV logVisit error:', err.message);
    }
  } else {
    memoryDb.visits += 1;
    memoryDb.uniqueUsers[uid] = timestamp;
    memoryDb.events.unshift({ type: 'visit', sessionId: uid, ip, timestamp });
    if (memoryDb.events.length > 100) memoryDb.events.pop();
    saveLocalDb();
  }
}

export async function logSearch(sessionId, query) {
  if (!query || query.trim() === '') return;
  const timestamp = new Date().toISOString();
  const uid = sessionId || 'unknown_session';
  const q = query.toLowerCase().trim();

  if (useKV) {
    try {
      await kvFetch(['HINCRBY', 'stats:searches', q, 1]);
      const event = JSON.stringify({ type: 'search', sessionId: uid, query: q, timestamp });
      await kvFetch(['LPUSH', 'stats:events', event]);
      await kvFetch(['LTRIM', 'stats:events', 0, 99]);
    } catch (err) {
      console.error('❌ KV logSearch error:', err.message);
    }
  } else {
    memoryDb.searches[q] = (memoryDb.searches[q] || 0) + 1;
    memoryDb.events.unshift({ type: 'search', sessionId: uid, query: q, timestamp });
    if (memoryDb.events.length > 100) memoryDb.events.pop();
    saveLocalDb();
  }
}

export async function logOptimize(sessionId, itemCount) {
  const timestamp = new Date().toISOString();
  const uid = sessionId || 'unknown_session';

  if (useKV) {
    try {
      await kvFetch(['INCR', 'stats:total_optimizations']);
      const event = JSON.stringify({ type: 'optimize', sessionId: uid, itemCount, timestamp });
      await kvFetch(['LPUSH', 'stats:events', event]);
      await kvFetch(['LTRIM', 'stats:events', 0, 99]);
    } catch (err) {
      console.error('❌ KV logOptimize error:', err.message);
    }
  } else {
    memoryDb.optimizations += 1;
    memoryDb.events.unshift({ type: 'optimize', sessionId: uid, itemCount, timestamp });
    if (memoryDb.events.length > 100) memoryDb.events.pop();
    saveLocalDb();
  }
}

export async function logOptimizationMetric(metricPayload) {
  const entry = {
    id: `opt_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
    timestamp: new Date().toISOString(),
    ...metricPayload,
  };

  if (useKV) {
    try {
      await kvFetch(['LPUSH', 'stats:optimization_metrics', JSON.stringify(entry)]);
      await kvFetch(['LTRIM', 'stats:optimization_metrics', 0, 499]); // Store up to 500 recent metrics
    } catch (err) {
      console.error('❌ KV logOptimizationMetric error:', err.message);
    }
  } else {
    if (!memoryDb.optimizationMetrics) memoryDb.optimizationMetrics = [];
    memoryDb.optimizationMetrics.unshift(entry);
    if (memoryDb.optimizationMetrics.length > 500) memoryDb.optimizationMetrics.pop();
    saveLocalDb();
  }
  return entry;
}

export async function getAnalyticsSummary() {
  let records = [];

  if (useKV) {
    try {
      const res = await kvFetch(['LRANGE', 'stats:optimization_metrics', 0, 499]);
      const rawRecords = res?.result || [];
      records = rawRecords.map(r => {
        try { return JSON.parse(r); } catch { return null; }
      }).filter(Boolean);
    } catch (err) {
      console.error('❌ KV getAnalyticsSummary error:', err.message);
    }
  } else {
    records = memoryDb.optimizationMetrics || [];
  }

  if (records.length === 0) {
    return {
      totalBaskets: 0,
      averageSavingsAmount: 0,
      medianSavingsAmount: 0,
      averageSavingsPercent: 0,
      medianSavingsPercent: 0,
      rangeSavingsAmount: { min: 0, max: 0 },
      rangeSavingsPercent: { min: 0, max: 0 },
      improvedCount: 0,
      improvedPercentage: 0,
      notWorthwhileCount: 0,
      notWorthwhilePercentage: 0,
      geographicDifferences: {},
      categoryDifferences: {},
      badResults: [],
      records: []
    };
  }

  const totalBaskets = records.length;
  const savingsAmounts = records.map(r => Number(r.savingsAmount) || 0).sort((a, b) => a - b);
  const savingsPercents = records.map(r => Number(r.savingsPercent) || 0).sort((a, b) => a - b);

  // Helper function for average
  const sumAmount = savingsAmounts.reduce((acc, v) => acc + v, 0);
  const averageSavingsAmount = Math.round((sumAmount / totalBaskets) * 100) / 100;

  const sumPercent = savingsPercents.reduce((acc, v) => acc + v, 0);
  const averageSavingsPercent = Math.round((sumPercent / totalBaskets) * 10) / 10;

  // Helper function for median
  const getMedian = (arr) => {
    if (arr.length === 0) return 0;
    const mid = Math.floor(arr.length / 2);
    return arr.length % 2 !== 0 ? arr[mid] : (arr[mid - 1] + arr[mid]) / 2;
  };

  const medianSavingsAmount = Math.round(getMedian(savingsAmounts) * 100) / 100;
  const medianSavingsPercent = Math.round(getMedian(savingsPercents) * 10) / 10;

  // Range
  const rangeSavingsAmount = {
    min: savingsAmounts[0],
    max: savingsAmounts[savingsAmounts.length - 1]
  };
  const rangeSavingsPercent = {
    min: savingsPercents[0],
    max: savingsPercents[savingsPercents.length - 1]
  };

  // Improved vs Not Worthwhile
  // Improved: isWorthwhile is true AND savingsAmount > 0
  const improvedCount = records.filter(r => r.isWorthwhile && r.savingsAmount > 0).length;
  const improvedPercentage = Math.round((improvedCount / totalBaskets) * 100);

  const notWorthwhileCount = records.filter(r => !r.isWorthwhile || r.savingsAmount <= 0).length;
  const notWorthwhilePercentage = Math.round((notWorthwhileCount / totalBaskets) * 100);

  // Geographic Differences
  const geoMap = {};
  for (const r of records) {
    const loc = r.location || 'Unknown Location';
    if (!geoMap[loc]) {
      geoMap[loc] = { location: loc, count: 0, totalSavings: 0, savingsList: [], improvedCount: 0 };
    }
    geoMap[loc].count += 1;
    geoMap[loc].totalSavings += (r.savingsAmount || 0);
    geoMap[loc].savingsList.push(r.savingsAmount || 0);
    if (r.isWorthwhile && r.savingsAmount > 0) geoMap[loc].improvedCount += 1;
  }

  const geographicDifferences = Object.values(geoMap).map(g => ({
    location: g.location,
    basketCount: g.count,
    averageSavings: Math.round((g.totalSavings / g.count) * 100) / 100,
    medianSavings: Math.round(getMedian(g.savingsList.sort((a, b) => a - b)) * 100) / 100,
    improvedRate: Math.round((g.improvedCount / g.count) * 100)
  }));

  // Category Differences
  const catMap = {};
  for (const r of records) {
    const categories = r.categories || ['General'];
    for (const cat of categories) {
      if (!catMap[cat]) {
        catMap[cat] = { category: cat, count: 0, totalSavings: 0, savingsList: [] };
      }
      catMap[cat].count += 1;
      catMap[cat].totalSavings += (r.savingsAmount || 0);
      catMap[cat].savingsList.push(r.savingsAmount || 0);
    }
  }

  const categoryDifferences = Object.values(catMap).map(c => ({
    category: c.category,
    basketCount: c.count,
    averageSavings: Math.round((c.totalSavings / c.count) * 100) / 100,
    medianSavings: Math.round(getMedian(c.savingsList.sort((a, b) => a - b)) * 100) / 100
  }));

  // Bad Results (Baskets where savings were $0, negative, minimal under $1.50, or multi-store was not worthwhile)
  const badResults = records.filter(r => 
    !r.isWorthwhile || 
    r.savingsAmount <= 1.50 || 
    r.resultType === 'ZERO_SAVINGS' || 
    r.resultType === 'NOT_WORTHWHILE_MINIMAL' ||
    r.resultType === 'SINGLE_STORE_OPTIMAL'
  ).map(r => ({
    id: r.id,
    timestamp: r.timestamp,
    location: r.location,
    baselineStore: r.baselineStore,
    itemCount: r.itemCount,
    baselineTotal: r.baselineTotal,
    optimalTotal: r.optimalTotal,
    savingsAmount: r.savingsAmount,
    savingsPercent: r.savingsPercent,
    storesCount: r.storesCount,
    resultType: r.resultType,
    reason: r.resultType === 'ZERO_SAVINGS' ? 'Identical price across retailers' :
            r.resultType === 'SINGLE_STORE_OPTIMAL' ? 'Single store was already lowest overall' :
            r.savingsAmount <= 1.50 ? `Minimal savings ($${r.savingsAmount}) relative to ${r.storesCount} stores` :
            'Multi-store drive overhead exceeded savings benefit'
  }));

  return {
    totalBaskets,
    averageSavingsAmount,
    medianSavingsAmount,
    averageSavingsPercent,
    medianSavingsPercent,
    rangeSavingsAmount,
    rangeSavingsPercent,
    improvedCount,
    improvedPercentage,
    notWorthwhileCount,
    notWorthwhilePercentage,
    geographicDifferences,
    categoryDifferences,
    badResults,
    records
  };
}

export async function getStats() {
  if (useKV) {
    try {
      const visitsRes = await kvFetch(['GET', 'stats:total_visits']);
      const uniqueRes = await kvFetch(['SCARD', 'stats:unique_users']);
      const optRes = await kvFetch(['GET', 'stats:total_optimizations']);
      const searchesRes = await kvFetch(['HGETALL', 'stats:searches']);
      const eventsRes = await kvFetch(['LRANGE', 'stats:events', 0, 99]);

      const visits = parseInt(visitsRes?.result || 0, 10);
      const uniqueUsersCount = parseInt(uniqueRes?.result || 0, 10);
      const optimizations = parseInt(optRes?.result || 0, 10);

      const searches = {};
      const rawSearches = searchesRes?.result || [];
      if (Array.isArray(rawSearches)) {
        for (let i = 0; i < rawSearches.length; i += 2) {
          searches[rawSearches[i]] = parseInt(rawSearches[i + 1], 10) || 0;
        }
      } else if (typeof rawSearches === 'object') {
        for (const [k, v] of Object.entries(rawSearches)) {
          searches[k] = parseInt(v, 10) || 0;
        }
      }

      const events = (eventsRes?.result || []).map(evtStr => {
        try {
          return JSON.parse(evtStr);
        } catch {
          return { type: 'unknown', raw: evtStr, timestamp: new Date().toISOString() };
        }
      });

      return {
        visits,
        uniqueUsers: uniqueUsersCount,
        optimizations,
        searches,
        events,
        isProductionKV: true
      };
    } catch (err) {
      console.error('❌ KV getStats error:', err.message);
      return { error: true, details: err.message };
    }
  } else {
    return {
      visits: memoryDb.visits,
      uniqueUsers: Object.keys(memoryDb.uniqueUsers).length,
      optimizations: memoryDb.optimizations,
      searches: memoryDb.searches,
      events: memoryDb.events,
      isProductionKV: false
    };
  }
}

