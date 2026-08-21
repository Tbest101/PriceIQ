# PriceIQ — Grocery Basket Optimization Platform

PriceIQ is a web-based grocery basket optimization and consumer analytics platform. The application evaluates consumer grocery lists against local retail pricing data to calculate optimal purchasing strategies, factoring in baseline store comparisons, multi-store price differentials, and travel friction penalties.

## Development Note & Attribution
*Initial implementation accelerated using AI-assisted development tools; architecture, data flow, and optimization logic specified and directed by Peter Tobi Sunmola.*

---

## Key Features
- **Multi-Store Basket Optimization Engine**: Calculates optimal single-store and multi-store purchasing strategies considering distance and travel friction overhead.
- **Actionable Price Forecasting**: Provides rule-based price movement signals (`BUY NOW`, `WAIT`, `STOCK UP`).
- **Consumer Decision Telemetry & Survey Subsystem**: Built-in pilot research module and anonymized dataset exporter (`/api/admin/research/export-csv`).
- **Admin & Evaluation Dashboard**: Real-time evaluation of aggregate platform savings, category/geographic splits, and PostHog behavioral telemetry.

---

## Technical Stack
- **Frontend**: React 19, TypeScript 5, Vite 8, PostHog JS SDK
- **Backend API**: Node.js, Express 4 REST server
- **Database / Storage**: Vercel KV (Upstash Redis API) with local fallback storage

---

## Documentation Links
- **[ARCHITECTURE.md](ARCHITECTURE.md)**: Full technical specification, component architecture, and end-to-end data flow.
- **[PROVENANCE.md](PROVENANCE.md)**: Objective, uncurated Git development log and commit provenance.
- **[BENCHMARK_TEST_REPORT.md](BENCHMARK_TEST_REPORT.md)**: Algorithmic quality assurance & synthetic test basket evaluation report.

---

## Development Setup

```bash
# 1. Install dependencies
npm install

# 2. Run local development server (API server + Vite dev server concurrently)
npm run dev:full

# 3. Production build
npm run build
```
