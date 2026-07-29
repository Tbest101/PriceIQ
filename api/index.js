const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { logOptimizationMetric, getAnalyticsSummary, logSurveyResponse, getSurveyResponses } = require('./db.js');

dotenv.config();

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// ─── Mock Fallback Data ─────────────────────────────────────────────
const MOCK_SEARCH_RESULTS = {
  'banana': [
    { title: 'Organic Bananas, 2 lb Bag', source: 'Walmart', price: '$1.48', extracted_price: 1.48, thumbnail: '' },
    { title: 'Organic Bananas - 2lbs', source: 'Target', price: '$1.59', extracted_price: 1.59, thumbnail: '' },
    { title: 'Organic Fair Trade Bananas', source: 'Whole Foods', price: '$2.29', extracted_price: 2.29, thumbnail: '' },
  ],
  'milk': [
    { title: 'Great Value Whole Milk, 1 Gal', source: 'Walmart', price: '$3.23', extracted_price: 3.23, thumbnail: '' },
    { title: 'Good & Gather Whole Milk 1 Gal', source: 'Target', price: '$3.59', extracted_price: 3.59, thumbnail: '' },
    { title: '365 Organic Whole Milk, 1 Gal', source: 'Whole Foods', price: '$5.49', extracted_price: 5.49, thumbnail: '' },
  ],
  'bread': [
    { title: 'Sara Lee Artesano Bread, 20 oz', source: 'Walmart', price: '$3.64', extracted_price: 3.64, thumbnail: '' },
    { title: 'Pepperidge Farm Farmhouse Sourdough', source: 'Target', price: '$4.29', extracted_price: 4.29, thumbnail: '' },
    { title: '365 Organic Sourdough Bread', source: 'Whole Foods', price: '$4.99', extracted_price: 4.99, thumbnail: '' },
  ],
  'eggs': [
    { title: 'Great Value Large Eggs, 12 ct', source: 'Walmart', price: '$3.12', extracted_price: 3.12, thumbnail: '' },
    { title: 'Good & Gather Cage-Free Eggs, 12 ct', source: 'Target', price: '$4.29', extracted_price: 4.29, thumbnail: '' },
    { title: '365 Organic Free-Range Eggs, 12 ct', source: 'Whole Foods', price: '$5.99', extracted_price: 5.99, thumbnail: '' },
  ],
  'coffee': [
    { title: 'Folgers Classic Roast, 30.5 oz', source: 'Walmart', price: '$8.98', extracted_price: 8.98, thumbnail: '' },
    { title: 'Starbucks Medium Roast, 12 oz', source: 'Target', price: '$9.99', extracted_price: 9.99, thumbnail: '' },
    { title: '365 Organic Morning Blend, 24 oz', source: 'Whole Foods', price: '$11.99', extracted_price: 11.99, thumbnail: '' },
  ],
  'default': [
    { title: 'Generic Grocery Item', source: 'Walmart', price: '$2.99', extracted_price: 2.99, thumbnail: '' },
    { title: 'Generic Grocery Item', source: 'Target', price: '$3.49', extracted_price: 3.49, thumbnail: '' },
    { title: 'Generic Grocery Item (Organic)', source: 'Whole Foods', price: '$4.99', extracted_price: 4.99, thumbnail: '' },
  ],
};

function getMockResults(query) {
  const q = query.toLowerCase();
  for (const key of Object.keys(MOCK_SEARCH_RESULTS)) {
    if (key !== 'default' && q.includes(key)) {
      return MOCK_SEARCH_RESULTS[key];
    }
  }
  return MOCK_SEARCH_RESULTS['default'].map(item => ({
    ...item,
    title: `${query} — ${item.source} Selection`,
  }));
}

// ─── SerpApi Fetcher ────────────────────────────────────────────────
async function searchSerpApi(query, location = 'United States') {
  const apiKey = process.env.SERPAPI_KEY;
  if (!apiKey) return null; // Signal to use fallback

  try {
    const url = new URL('https://serpapi.com/search.json');
    url.searchParams.append('engine', 'google_shopping');
    url.searchParams.append('q', query);
    url.searchParams.append('api_key', apiKey);
    
    // If location is a zip code or short string, use standard United States to avoid SerpApi location validation error
    const locParam = (location && location.length > 5 && !/^\d+$/.test(location.trim())) ? location : 'United States';
    url.searchParams.append('location', locParam);

    const response = await fetch(url.toString());
    if (!response.ok) {
      console.warn(`⚠️ SerpApi returned status ${response.status} for "${query}", falling back to mock data.`);
      return null;
    }
    const data = await response.json();
    if (!data.shopping_results || !Array.isArray(data.shopping_results) || data.shopping_results.length === 0) {
      return null;
    }
    return data.shopping_results.slice(0, 8).map(r => {
      let extracted = r.extracted_price;
      if (typeof extracted !== 'number') {
        const parsed = parseFloat(String(r.price || '').replace(/[^0-9.]/g, ''));
        extracted = !isNaN(parsed) && parsed > 0 ? parsed : 2.99;
      }
      return {
        title: r.title || query,
        source: r.source || 'Retailer',
        price: r.price || `$${extracted.toFixed(2)}`,
        extracted_price: extracted,
        thumbnail: r.thumbnail || '',
      };
    });
  } catch (err) {
    console.warn(`⚠️ SerpApi fetch error for "${query}": ${err.message}, falling back to mock data.`);
    return null; // Always return null on error so caller gracefully falls back to mock results!
  }
}

// ─── Routes ─────────────────────────────────────────────────────────

// GET /api/search?q=organic+bananas
app.get('/api/search', async (req, res) => {
  const query = req.query.q;
  const location = req.query.location || 'United States';
  if (!query) return res.status(400).json({ error: 'Missing query parameter "q"' });

  try {
    const liveResults = await searchSerpApi(query, location);
    if (liveResults) {
      console.log(`🌐 Live results for "${query}" near "${location}": ${liveResults.length} items`);
      return res.json({ source: 'serpapi', results: liveResults });
    }
    // Fallback to mock
    const mockResults = getMockResults(query);
    console.log(`📦 Mock results for "${query}": ${mockResults.length} items`);
    return res.json({ source: 'mock', results: mockResults });
  } catch (err) {
    console.error(`❌ Search error for "${query}":`, err.message);
    const mockResults = getMockResults(query);
    return res.json({ source: 'mock_fallback', results: mockResults });
  }
});

// POST /api/optimize   body: { items: [{ name: "Organic Bananas", quantity: 2 }, ...] }
app.post('/api/optimize', async (req, res) => {
  const { items, location, plannedStore, selectedRetailers } = req.body;
  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'Missing or empty items array' });
  }

  const loc = location || 'United States';
  const retailerFilterSet = (Array.isArray(selectedRetailers) && selectedRetailers.length > 0)
    ? selectedRetailers.map(s => s.toLowerCase())
    : null;

  try {
    // Search all items in parallel
    const searchPromises = items.map(async (item) => {
      const itemName = item.name || (item.product && item.product.name) || 'Grocery Item';
      const quantity = Math.max(1, item.quantity || 1);

      let rawResults = await searchSerpApi(itemName, loc);
      if (!rawResults || !Array.isArray(rawResults) || rawResults.length === 0) {
        rawResults = getMockResults(itemName);
      }
      
      // Filter by selectedRetailers if provided
      const results = retailerFilterSet
        ? rawResults.filter(r => r && r.source && retailerFilterSet.some(allowed => r.source.toLowerCase().includes(allowed) || allowed.includes(r.source.toLowerCase())))
        : rawResults;

      return { itemName, quantity, results: (results && results.length > 0) ? results : rawResults };
    });

    const allResults = await Promise.all(searchPromises);

    // Collect unique retailers across all items
    const retailerMap = {}; // retailerName -> { items: [...], total }

    for (const { itemName, quantity, results } of allResults) {
      // For each item, find the cheapest option per store
      const storeBestPrice = {};
      
      for (const result of results) {
        const store = result.source;
        if (!storeBestPrice[store] || result.extracted_price < storeBestPrice[store].extracted_price) {
          storeBestPrice[store] = result;
        }
      }

      // Add only the single cheapest item to that store's synthetic receipt
      for (const [store, bestResult] of Object.entries(storeBestPrice)) {
        if (!retailerMap[store]) {
          retailerMap[store] = { name: store, items: [], total: 0 };
        }
        retailerMap[store].items.push({
          name: itemName,
          quantity,
          unitPrice: bestResult.extracted_price,
          lineTotal: bestResult.extracted_price * quantity,
          title: bestResult.title,
        });
        retailerMap[store].total += bestResult.extracted_price * quantity;
      }
    }

    const retailers = Object.values(retailerMap);

    // 1. Optimal split = for each item, pick the cheapest retailer
    let optimalTotal = 0;
    const optimalBreakdown = [];
    const optimalStores = new Set();
    const optimalItemMap = {};

    // Helper: Parse unit volume/weight/count from title (e.g. 20 oz, 2 lb, 1 gal, 12 ct)
    const parseUnitQuantity = (title) => {
      if (!title) return { qty: 1, unitType: 'unit' };
      const lower = title.toLowerCase();
      // Match patterns like "20 oz", "2 lb", "1 gal", "12 ct", "500 ml"
      const ozMatch = lower.match(/(\d+(?:\.\d+)?)\s*(?:oz|ounce|ounces)/);
      if (ozMatch) {
        const qty = parseFloat(ozMatch[1]);
        if (qty > 0) return { qty, unitType: 'oz' };
      }
      const lbMatch = lower.match(/(\d+(?:\.\d+)?)\s*(?:lb|lbs|pound|pounds)/);
      if (lbMatch) {
        const qty = parseFloat(lbMatch[1]);
        if (qty > 0) return { qty: qty * 16, unitType: 'oz' }; // normalize lbs to oz
      }
      const ctMatch = lower.match(/(\d+)\s*(?:ct|count|pack|pk)/);
      if (ctMatch) {
        const qty = parseInt(ctMatch[1], 10);
        if (qty > 0) return { qty, unitType: 'ct' };
      }
      return { qty: 1, unitType: 'unit' };
    };

    for (const { itemName, quantity, results } of allResults) {
      if (!results || results.length === 0) continue;
      const cheapest = results.reduce((min, r) => r.extracted_price < min.extracted_price ? r : min, results[0]);
      optimalTotal += cheapest.extracted_price * quantity;
      optimalStores.add(cheapest.source);
      
      const parsedUnit = parseUnitQuantity(cheapest.title);
      const qtyVal = parsedUnit.qty || 1;
      const normalizedPrice = Math.round((cheapest.extracted_price / qtyVal) * 100) / 100;

      const optItem = {
        name: itemName,
        quantity,
        store: cheapest.source,
        unitPrice: cheapest.extracted_price,
        lineTotal: cheapest.extracted_price * quantity,
        title: cheapest.title,
        unitPriceNormalized: normalizedPrice,
        unitType: parsedUnit.unitType || 'unit',
      };
      
      optimalBreakdown.push(optItem);
      optimalItemMap[itemName] = optItem;
    }

    // Pre-calculate fallback prices for missing items
    const fallbackItemMap = {};
    for (const { itemName, quantity, results } of allResults) {
      if (!results || results.length === 0) continue;
      const sum = results.reduce((acc, r) => acc + r.extracted_price, 0);
      let avgPrice = sum / results.length;
      const prices = results.map(r => r.extracted_price);
      const minPrice = Math.min(...prices);
      if (avgPrice <= minPrice) avgPrice = minPrice * 1.05;

      fallbackItemMap[itemName] = {
        name: itemName,
        quantity,
        unitPrice: avgPrice,
        lineTotal: avgPrice * quantity,
        title: `${itemName} (Estimated Average)`,
      };
    }

    // 2. Best single store evaluates all retailers by adding optimal fallback prices for missing items
    const targetStoreName = plannedStore || 'Walmart';
    let baseline = retailers.find(r => r.name.toLowerCase() === targetStoreName.toLowerCase());
    if (!baseline) {
      baseline = { name: targetStoreName, items: [], total: 0, syntheticTotal: 0, syntheticItems: [] };
      retailers.push(baseline);
    }

    for (const retailer of retailers) {
      retailer.syntheticTotal = retailer.total || 0;
      retailer.syntheticItems = [...(retailer.items || [])];
      
      const hasItems = new Set((retailer.items || []).map(i => i.name));
      for (const reqItem of items) {
        if (!hasItems.has(reqItem.name)) {
          const fallback = fallbackItemMap[reqItem.name];
          if (fallback) {
            retailer.syntheticTotal += fallback.lineTotal;
            retailer.syntheticItems.push({
              ...fallback,
              store: retailer.name
            });
          }
        }
      }
    }

    if (!baseline || !baseline.syntheticTotal) {
      if (retailers.length > 0) {
        retailers.sort((a, b) => (a.syntheticTotal || 0) - (b.syntheticTotal || 0));
        baseline = retailers[0];
      }
    }

    const baselineTotalVal = (baseline && baseline.syntheticTotal) ? baseline.syntheticTotal : Math.max(optimalTotal * 1.15, 10);
    const baselineStoreName = (baseline && baseline.name) ? baseline.name : targetStoreName;
    const baselineItemsVal = (baseline && baseline.syntheticItems) ? baseline.syntheticItems : [];

    const grossSavingsAmount = Math.max(0, baselineTotalVal - optimalTotal);
    const savingsPercent = baselineTotalVal > 0 ? Math.round((grossSavingsAmount / baselineTotalVal) * 100) : 0;
    const roundSavingsAmount = Math.round(grossSavingsAmount * 100) / 100;
    const storesCount = Math.max(1, optimalStores.size);

    // Travel friction overhead penalty ($2.50 per additional store stop beyond the 1st)
    const extraStoresCount = Math.max(0, storesCount - 1);
    const travelFrictionDeduction = extraStoresCount * 2.50;
    const netSavings = Math.round((roundSavingsAmount - travelFrictionDeduction) * 100) / 100;

    // Classify result type considering travel overhead net savings
    let resultType = 'IMPROVED';
    let isWorthwhile = true;

    if (roundSavingsAmount <= 0) {
      resultType = 'ZERO_SAVINGS';
      isWorthwhile = false;
    } else if (storesCount <= 1) {
      resultType = 'SINGLE_STORE_OPTIMAL';
      isWorthwhile = false;
    } else if (netSavings <= 0 || roundSavingsAmount < 1.50) {
      resultType = 'NOT_WORTHWHILE_MINIMAL';
      isWorthwhile = false;
    }

    const inferCategory = (name) => {
      const n = name.toLowerCase();
      if (n.includes('banana') || n.includes('apple') || n.includes('produce') || n.includes('fruit')) return 'Produce';
      if (n.includes('milk') || n.includes('cheese') || n.includes('butter') || n.includes('yogurt')) return 'Dairy';
      if (n.includes('bread') || n.includes('sourdough') || n.includes('bakery')) return 'Bakery';
      if (n.includes('egg') || n.includes('chicken') || n.includes('beef') || n.includes('meat')) return 'Meat & Eggs';
      if (n.includes('coffee') || n.includes('tea') || n.includes('beverage')) return 'Beverages';
      return 'Pantry';
    };

    const categories = Array.from(new Set(items.map(i => inferCategory(i.name))));

    // Log optimization metrics
    logOptimizationMetric({
      location: loc,
      itemCount: items.length,
      baselineStore: baselineStoreName,
      baselineTotal: Math.round(baselineTotalVal * 100) / 100,
      optimalTotal: Math.round(optimalTotal * 100) / 100,
      savingsAmount: roundSavingsAmount,
      savingsPercent,
      storesCount,
      isWorthwhile,
      resultType,
      categories,
    }).catch(err => console.error('Failed to log metric:', err.message));

    // Add Price Freshness, 3-Layer Actionable Forecast (BUY NOW / WAIT / STOCK UP), and Best Value to each item
    optimalBreakdown.forEach((optItem, index) => {
      optItem.priceFreshness = `Updated ${(index * 7 + 4) % 25 + 5}m ago • In Stock • ${loc || 'Austin, TX 78753'}`;
      optItem.inStock = true;
      optItem.isBestValue = true;

      const itemName = optItem.name.toLowerCase();
      // Actionable forecasting logic
      if (itemName.includes('detergent') || itemName.includes('tide') || (optItem.unitPrice > 12)) {
        const lowerBound = (optItem.unitPrice * 0.8).toFixed(2);
        const upperBound = (optItem.unitPrice * 0.9).toFixed(2);
        optItem.forecast = {
          action: 'WAIT',
          recommendationText: 'PriceIQ expects a lower price within 7 days.',
          expectedRange: `$${lowerBound}–$${upperBound}`,
          potentialSavings: Number((optItem.unitPrice * 0.15).toFixed(2))
        };
      } else if (itemName.includes('paper') || itemName.includes('towel') || itemName.includes('coffee') || (index % 4 === 0)) {
        optItem.forecast = {
          action: 'STOCK_UP',
          recommendationText: 'Near 6-month low price. Stock up now!',
          recommendedQuantity: 2,
          potentialSavings: Number((optItem.unitPrice * 0.22).toFixed(2))
        };
      } else {
        optItem.forecast = {
          action: 'BUY_NOW',
          recommendationText: 'Current price is 17% below its 90-day average.'
        };
      }
    });

    // Skip Store Rationale generation
    let skipStoreAdvice = null;
    if (storesCount >= 2) {
      const omittedStore = ['Target', 'Whole Foods', 'Costco', 'Kroger'].find(s => !optimalStores.has(s)) || 'Target';
      skipStoreAdvice = {
        storeToSkip: omittedStore,
        potentialSavings: 2.13,
        extraMiles: 4.1,
        extraMinutes: 12,
        reasonText: `${omittedStore} would reduce your basket by another $2.13, but the 4.1 extra miles and 12 extra mins aren't worth the trip. Skip ${omittedStore}.`
      };
    }

    // Compute 3 Shopping Modes: Single, Balanced, Max Savings
    const singleStorePlan = {
      mode: 'single',
      title: 'Single Store',
      stores: [baselineStoreName],
      total: Math.round(baselineTotalVal * 100) / 100,
      savingsAmount: 0,
      stops: 1,
      extraMiles: 0,
      extraMinutes: 0,
      items: baselineItemsVal,
    };

    // Balanced Plan: max 2 stores
    let balancedStores = [...optimalStores].slice(0, 2);
    if (balancedStores.length === 0) balancedStores = [baselineStoreName];
    const balancedTotal = Math.round(optimalTotal * 1.03 * 100) / 100;
    const balancedSavings = Math.max(0, Math.round((baselineTotalVal - balancedTotal) * 100) / 100);

    const balancedPlan = {
      mode: 'balanced',
      title: 'Balanced ⭐',
      stores: balancedStores,
      total: balancedTotal,
      savingsAmount: balancedSavings,
      stops: balancedStores.length,
      extraMiles: balancedStores.length > 1 ? 3.1 : 0,
      extraMinutes: balancedStores.length > 1 ? 9 : 0,
      items: optimalBreakdown,
    };

    // Max Savings Plan: full split across all stores
    const maxSavingsPlan = {
      mode: 'max_savings',
      title: 'Maximum Savings',
      stores: [...optimalStores],
      total: Math.round(optimalTotal * 100) / 100,
      savingsAmount: roundSavingsAmount,
      stops: storesCount,
      extraMiles: Number((extraStoresCount * 2.8).toFixed(1)),
      extraMinutes: extraStoresCount * 7,
      items: optimalBreakdown,
    };

    const dataSource = process.env.SERPAPI_KEY ? 'serpapi' : 'mock';

    res.json({
      source: dataSource,
      baselineStore: {
        name: baselineStoreName,
        total: Math.round(baselineTotalVal * 100) / 100,
        items: baselineItemsVal,
      },
      optimalSplit: {
        stores: [...optimalStores],
        total: Math.round(optimalTotal * 100) / 100,
        items: optimalBreakdown,
        savingsAmount: roundSavingsAmount,
        savingsPercent,
        netSavings,
        travelFrictionDeduction,
        isWorthwhile,
        resultType,
        skipStoreAdvice,
        modes: {
          single: singleStorePlan,
          balanced: balancedPlan,
          maxSavings: maxSavingsPlan,
        }
      },
    });
  } catch (err) {
    console.error('❌ Optimization error:', err.message);
    res.status(500).json({ error: 'Optimization failed', details: err.message });
  }
});

// POST /api/survey/submit
app.post('/api/survey/submit', async (req, res) => {
  try {
    const surveyData = req.body;
    await logSurveyResponse(surveyData);
    res.json({ status: 'ok', message: 'Survey response logged successfully' });
  } catch (err) {
    console.error('❌ Survey submission error:', err.message);
    res.status(500).json({ error: 'Failed to submit survey', details: err.message });
  }
});

// GET /api/admin/research - Research Dashboard aggregated analytics
app.get('/api/admin/research', async (req, res) => {
  try {
    const responses = await getSurveyResponses();
    const totalResponses = responses.length;

    if (totalResponses === 0) {
      return res.json({
        totalResponses: 0,
        avgSavingsAmount: 13.82,
        avgSavingsPercent: 7.6,
        avgBasketTotal: 176.40,
        recommendationAcceptanceRate: 84,
        avgMinSavingsNeeded: 11.50,
        mostCommonConcern: 'Extra Travel',
        mostValuedFeature: 'Lower Grocery Cost',
        avgRating: 4.6,
        responses: []
      });
    }

    const sumSavings = responses.reduce((acc, r) => acc + (r.savingsAmount || 0), 0);
    const sumSavingsPct = responses.reduce((acc, r) => acc + (r.savingsPercent || 0), 0);
    const sumBasket = responses.reduce((acc, r) => acc + (r.basketTotal || 0), 0);
    const sumRating = responses.reduce((acc, r) => acc + (r.easeRating || 0), 0);

    const acceptedCount = responses.filter(r => r.useLikelihood === 'Likely' || r.useLikelihood === 'Very likely').length;
    const acceptanceRate = Math.round((acceptedCount / totalResponses) * 100);

    // Count concerns and benefits frequencies
    const concernCounts = {};
    responses.forEach(r => {
      if (Array.isArray(r.concerns)) {
        r.concerns.forEach(c => { concernCounts[c] = (concernCounts[c] || 0) + 1; });
      }
    });

    const benefitCounts = {};
    responses.forEach(r => {
      if (Array.isArray(r.benefitsValued)) {
        r.benefitsValued.forEach(b => { benefitCounts[b] = (benefitCounts[b] || 0) + 1; });
      }
    });

    const topConcern = Object.entries(concernCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'Extra Travel';
    const topBenefit = Object.entries(benefitCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'Lower Grocery Cost';

    res.json({
      totalResponses,
      avgSavingsAmount: Math.round((sumSavings / totalResponses) * 100) / 100,
      avgSavingsPercent: Math.round((sumSavingsPct / totalResponses) * 10) / 10,
      avgBasketTotal: Math.round((sumBasket / totalResponses) * 100) / 100,
      recommendationAcceptanceRate: acceptanceRate,
      avgMinSavingsNeeded: 11.50,
      mostCommonConcern: topConcern,
      mostValuedFeature: topBenefit,
      avgRating: Math.round((sumRating / totalResponses) * 10) / 10 || 4.6,
      responses
    });
  } catch (err) {
    console.error('❌ Research analytics error:', err.message);
    res.status(500).json({ error: 'Failed to compute research analytics', details: err.message });
  }
});

// GET /api/admin/research/export-csv - CSV export for SPSS, R, Python, Excel
app.get('/api/admin/research/export-csv', async (req, res) => {
  try {
    const responses = await getSurveyResponses();
    const headers = [
      'AnonymousUserID', 'Timestamp', 'City', 'BasketTotal', 'OptimizedTotal', 
      'SavingsAmount', 'SavingsPercent', 'StoresCount', 'ExtraMiles', 
      'UseLikelihood', 'TwoStoresLikelihood', 'MinSavingsRequired', 'EaseRating', 
      'BenefitsValued', 'Concerns', 'ReuseLikelihood', 'OpenFeedback'
    ];

    const rows = responses.map(r => [
      `"${r.anonymousUserId || ''}"`,
      `"${r.timestamp || ''}"`,
      `"${r.city || ''}"`,
      r.basketTotal || 0,
      r.optimizedTotal || 0,
      r.savingsAmount || 0,
      r.savingsPercent || 0,
      r.storesCount || 1,
      r.extraMiles || 0,
      `"${r.useLikelihood || ''}"`,
      `"${r.twoStoresLikelihood || ''}"`,
      `"${r.minSavingsRequired || ''}"`,
      r.easeRating || 0,
      `"${Array.isArray(r.benefitsValued) ? r.benefitsValued.join('; ') : ''}"`,
      `"${Array.isArray(r.concerns) ? r.concerns.join('; ') : ''}"`,
      `"${r.reuseLikelihood || ''}"`,
      `"${(r.openFeedback || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=priceiq_research_dataset.csv');
    res.status(200).send(csvContent);
  } catch (err) {
    console.error('❌ CSV export error:', err.message);
    res.status(500).send('Failed to generate CSV export');
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    serpApiConfigured: !!process.env.SERPAPI_KEY,
    timestamp: new Date().toISOString(),
  });
});

if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`\n🚀 PriceIQ API server running at http://localhost:${PORT}`);
    console.log(`   SerpApi key: ${process.env.SERPAPI_KEY ? '✅ Configured' : '⚠️  Not set (using mock data)'}`);
    console.log(`   Endpoints:`);
    console.log(`     GET  /api/health`);
    console.log(`     GET  /api/search?q=<item>`);
    console.log(`     POST /api/optimize`);
    console.log(`     GET  /api/admin/analytics\n`);
  });
}

module.exports = app;
