// scripts/evaluate-savings.js
// Evaluation & Benchmark tool for Less4More
// Run with: node scripts/evaluate-savings.js

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { logOptimizationMetric, getAnalyticsSummary } from '../api/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ─── Benchmark Test Matrix ──────────────────────────────────────────
const TEST_SUITE = [
  {
    name: 'Weekly Produce & Dairy Staples',
    location: 'Austin, Texas',
    plannedStore: 'Walmart',
    items: [
      { name: 'Organic Bananas', quantity: 2 },
      { name: 'Whole Milk 1 Gal', quantity: 1 },
      { name: 'Sourdough Bread', quantity: 1 },
      { name: 'Cage-Free Eggs', quantity: 2 }
    ]
  },
  {
    name: 'Coffee & Breakfast Basket',
    location: 'New York, NY',
    plannedStore: 'Target',
    items: [
      { name: 'Medium Roast Coffee', quantity: 2 },
      { name: 'Whole Milk 1 Gal', quantity: 1 },
      { name: 'Organic Bananas', quantity: 1 }
    ]
  },
  {
    name: 'Single Retailer Uniform Basket (Mock Identical Pricing)',
    location: 'Chicago, IL',
    plannedStore: 'Whole Foods',
    items: [
      { name: 'Organic Bananas', quantity: 1 }
    ]
  },
  {
    name: 'High-Value Organic Basket',
    location: 'Seattle, WA',
    plannedStore: 'Whole Foods',
    items: [
      { name: 'Organic Fair Trade Bananas', quantity: 3 },
      { name: 'Organic Free-Range Eggs', quantity: 2 },
      { name: 'Organic Sourdough Bread', quantity: 2 },
      { name: 'Organic Morning Blend Coffee', quantity: 2 }
    ]
  },
  {
    name: 'Minimal Margin Basket (Low Savings)',
    location: 'Denver, CO',
    plannedStore: 'Walmart',
    items: [
      { name: 'Great Value Large Eggs', quantity: 1 }
    ]
  },
  {
    name: 'Bulk Household & Pantry',
    location: 'Dallas, TX',
    plannedStore: 'Target',
    items: [
      { name: 'Folgers Classic Roast', quantity: 3 },
      { name: 'Sara Lee Artesano Bread', quantity: 4 },
      { name: 'Good & Gather Cage-Free Eggs', quantity: 3 }
    ]
  },
  {
    name: 'Budget Staples Basket',
    location: 'Austin, Texas',
    plannedStore: 'Walmart',
    items: [
      { name: 'Great Value Whole Milk', quantity: 2 },
      { name: 'Great Value Large Eggs', quantity: 2 },
      { name: 'Sara Lee Artesano Bread', quantity: 2 }
    ]
  },
  {
    name: 'Suburban Standard Basket',
    location: 'Atlanta, GA',
    plannedStore: 'Kroger',
    items: [
      { name: 'Organic Bananas', quantity: 2 },
      { name: 'Medium Roast Coffee', quantity: 1 },
      { name: 'Cage-Free Eggs', quantity: 1 }
    ]
  }
];

// Helper to simulate optimization calculation locally without needing live API port running
function runLocalOptimization(items, plannedStore) {
  // Mock price lookup table matching api/index.js mock data
  const catalog = {
    'banana': [
      { source: 'Walmart', price: 1.48 },
      { source: 'Target', price: 1.59 },
      { source: 'Whole Foods', price: 2.29 }
    ],
    'milk': [
      { source: 'Walmart', price: 3.23 },
      { source: 'Target', price: 3.59 },
      { source: 'Whole Foods', price: 5.49 }
    ],
    'bread': [
      { source: 'Walmart', price: 3.64 },
      { source: 'Target', price: 4.29 },
      { source: 'Whole Foods', price: 4.99 }
    ],
    'eggs': [
      { source: 'Walmart', price: 3.12 },
      { source: 'Target', price: 4.29 },
      { source: 'Whole Foods', price: 5.99 }
    ],
    'coffee': [
      { source: 'Walmart', price: 8.98 },
      { source: 'Target', price: 9.99 },
      { source: 'Whole Foods', price: 11.99 }
    ]
  };

  function getPrices(name) {
    const q = name.toLowerCase();
    for (const key of Object.keys(catalog)) {
      if (q.includes(key)) return catalog[key];
    }
    return [
      { source: 'Walmart', price: 2.99 },
      { source: 'Target', price: 3.49 },
      { source: 'Whole Foods', price: 4.99 }
    ];
  }

  let optimalTotal = 0;
  const optimalStores = new Set();
  const storeTotals = {};

  for (const item of items) {
    const prices = getPrices(item.name);
    const cheapest = prices.reduce((min, p) => p.price < min.price ? p : min, prices[0]);
    optimalTotal += cheapest.price * item.quantity;
    optimalStores.add(cheapest.source);

    for (const p of prices) {
      storeTotals[p.source] = (storeTotals[p.source] || 0) + (p.price * item.quantity);
    }
  }

  // Baseline store total (fallback to cheapest single store if plannedStore not in catalog)
  const baselineTotal = storeTotals[plannedStore] || Math.min(...Object.values(storeTotals));
  const savingsAmount = Math.round((baselineTotal - optimalTotal) * 100) / 100;
  const savingsPercent = baselineTotal > 0 ? Math.round((savingsAmount / baselineTotal) * 100) : 0;
  const storesCount = optimalStores.size;

  let resultType = 'IMPROVED';
  let isWorthwhile = true;

  if (savingsAmount <= 0) {
    resultType = 'ZERO_SAVINGS';
    isWorthwhile = false;
  } else if (storesCount <= 1) {
    resultType = 'SINGLE_STORE_OPTIMAL';
    isWorthwhile = false;
  } else if (savingsAmount < 1.50) {
    resultType = 'NOT_WORTHWHILE_MINIMAL';
    isWorthwhile = false;
  }

  const inferCategory = (name) => {
    const n = name.toLowerCase();
    if (n.includes('banana') || n.includes('produce')) return 'Produce';
    if (n.includes('milk') || n.includes('dairy')) return 'Dairy';
    if (n.includes('bread') || n.includes('bakery')) return 'Bakery';
    if (n.includes('egg') || n.includes('meat')) return 'Meat & Eggs';
    if (n.includes('coffee') || n.includes('beverage')) return 'Beverages';
    return 'Pantry';
  };

  const categories = Array.from(new Set(items.map(i => inferCategory(i.name))));

  return {
    baselineTotal: Math.round(baselineTotal * 100) / 100,
    optimalTotal: Math.round(optimalTotal * 100) / 100,
    savingsAmount,
    savingsPercent,
    storesCount,
    isWorthwhile,
    resultType,
    categories
  };
}

async function runEvaluation() {
  console.log('\n======================================================');
  console.log('📊 PRICEIQ BENCHMARK & SAVINGS EVALUATION SUITE');
  console.log('======================================================\n');

  console.log(`Running benchmark evaluation across ${TEST_SUITE.length} sample baskets...\n`);

  for (const testCase of TEST_SUITE) {
    const res = runLocalOptimization(testCase.items, testCase.plannedStore);

    await logOptimizationMetric({
      location: testCase.location,
      itemCount: testCase.items.length,
      baselineStore: testCase.plannedStore,
      baselineTotal: res.baselineTotal,
      optimalTotal: res.optimalTotal,
      savingsAmount: res.savingsAmount,
      savingsPercent: res.savingsPercent,
      storesCount: res.storesCount,
      isWorthwhile: res.isWorthwhile,
      resultType: res.resultType,
      categories: res.categories
    });

    const statusSymbol = res.isWorthwhile ? '✅' : '⚠️';
    console.log(`${statusSymbol} [${testCase.name}] (${testCase.location})`);
    console.log(`   Baseline (${testCase.plannedStore}): $${res.baselineTotal} ➔ Optimal (${res.storesCount} stores): $${res.optimalTotal}`);
    console.log(`   Savings: $${res.savingsAmount} (${res.savingsPercent}%) | Worthwhile: ${res.isWorthwhile ? 'YES' : 'NO'} | Result: ${res.resultType}\n`);
  }

  // Generate aggregate statistical report
  const stats = await getAnalyticsSummary();

  console.log('======================================================');
  console.log('📈 AGGREGATE EVALUATION REPORT');
  console.log('======================================================');
  console.log(`Total Baskets Evaluated: ${stats.totalBaskets}`);
  console.log(`Average Potential Savings: $${stats.averageSavingsAmount} (${stats.averageSavingsPercent}%)`);
  console.log(`Median Potential Savings:  $${stats.medianSavingsAmount} (${stats.medianSavingsPercent}%)`);
  console.log(`Savings Range ($):         Min $${stats.rangeSavingsAmount.min} ➔ Max $${stats.rangeSavingsAmount.max}`);
  console.log(`Savings Range (%):         Min ${stats.rangeSavingsPercent.min}% ➔ Max ${stats.rangeSavingsPercent.max}%`);
  console.log(`Baskets Improved:          ${stats.improvedCount} (${stats.improvedPercentage}%)`);
  console.log(`Multi-Store Not Worthwhile: ${stats.notWorthwhileCount} (${stats.notWorthwhilePercentage}%)\n`);

  console.log('📍 GEOGRAPHIC DIFFERENCES:');
  console.table(stats.geographicDifferences);

  console.log('\n🏷️ CATEGORY DIFFERENCES:');
  console.table(stats.categoryDifferences);

  console.log('\n🚨 BAD / DISAPPOINTING RESULTS REPORT:');
  if (stats.badResults.length === 0) {
    console.log('   None detected!');
  } else {
    stats.badResults.forEach((b, i) => {
      console.log(`   ${i + 1}. [${b.resultType}] ${b.location} - Saved $${b.savingsAmount} (${b.savingsPercent}%) | Reason: ${b.reason}`);
    });
  }
  console.log('\n======================================================\n');

  // Save reports to file
  const reportPathMd = path.join(process.cwd(), 'analytics_report.md');
  const reportPathJson = path.join(process.cwd(), 'analytics_report.json');

  fs.writeFileSync(reportPathJson, JSON.stringify(stats, null, 2), 'utf8');

  const markdownContent = `# Less4More Analytics & Benchmark Evaluation Report

Generated: ${new Date().toISOString()}

## Key Metrics Summary
- **Total Baskets Analyzed**: ${stats.totalBaskets}
- **Average Potential Savings**: $${stats.averageSavingsAmount} (${stats.averageSavingsPercent}%)
- **Median Potential Savings**: $${stats.medianSavingsAmount} (${stats.medianSavingsPercent}%)
- **Savings Range**: $${stats.rangeSavingsAmount.min} to $${stats.rangeSavingsAmount.max} (${stats.rangeSavingsPercent.min}% to ${stats.rangeSavingsPercent.max}%)
- **Baskets Improved**: ${stats.improvedCount} (${stats.improvedPercentage}%)
- **Multi-Store Not Worthwhile**: ${stats.notWorthwhileCount} (${stats.notWorthwhilePercentage}%)

## Geographic Differences
| Location | Baskets | Avg Savings ($) | Median Savings ($) | Improved Rate (%) |
| :--- | :--- | :--- | :--- | :--- |
${stats.geographicDifferences.map(g => `| ${g.location} | ${g.basketCount} | $${g.averageSavings} | $${g.medianSavings} | ${g.improvedRate}% |`).join('\n')}

## Category Differences
| Category | Baskets | Avg Savings ($) | Median Savings ($) |
| :--- | :--- | :--- | :--- |
${stats.categoryDifferences.map(c => `| ${c.category} | ${c.basketCount} | $${c.averageSavings} | $${c.medianSavings} |`).join('\n')}

## Bad Results & Disappointing Baskets Log
| ID | Location | Result Type | Savings | Stores | Issue / Reason |
| :--- | :--- | :--- | :--- | :--- | :--- |
${stats.badResults.map(b => `| ${b.id} | ${b.location} | \`${b.resultType}\` | $${b.savingsAmount} (${b.savingsPercent}%) | ${b.storesCount} | ${b.reason} |`).join('\n')}
`;

  fs.writeFileSync(reportPathMd, markdownContent, 'utf8');
  console.log(`✨ Markdown report saved to: ${reportPathMd}`);
  console.log(`✨ JSON data report saved to: ${reportPathJson}\n`);
}

runEvaluation().catch(err => {
  console.error('❌ Evaluation script failed:', err);
});
