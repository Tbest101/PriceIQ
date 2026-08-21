# PriceIQ System Architecture & Technical Specification

## Overview
PriceIQ is an open, web-based grocery basket price optimization and consumer analytics platform. The application evaluates consumer grocery lists against local retail pricing data to determine optimal purchasing strategies, factoring in price differentials, baseline store comparisons, and multi-store travel friction penalties.

## Development Note & Attribution
*Initial implementation accelerated using AI-assisted development tools; architecture, data flow, and optimization logic specified and directed by Sunmola Peter Tobi.*

---

## Technical Stack

### Frontend Application Layer
- **Framework & Runtime**: React 19 (TypeScript 5.x), bundled with Vite 8.
- **State Management & UI**: Client-side state managed via React hooks; custom responsive glass-panel UI system with zero heavy third-party UI framework overhead.
- **Client Telemetry & Behavior**: Integration with `posthog-js` SDK for client-side event tracking and session replay.

### Backend API Layer
- **Server Framework**: Express 4.x running on Node.js (ES modules).
- **API Architecture**: RESTful JSON API endpoints handling price search, multi-store optimization calculations, survey telemetry, and analytics aggregation.
- **CORS & Middleware**: Configured via Express middleware for cross-origin client request handling.

### Data Persistence & Caching
- **Database**: Dual-tier storage model utilizing Vercel KV (Upstash Redis REST API) for production persistence and a local JSON fallback (`local_analytics.json`) for offline development.
- **Key Schemas**:
  - `stats:optimization_metrics` (List): Historical telemetry records for optimization evaluations.
  - `stats:unique_users` (Set): Deduplicated user session identifiers.
  - `stats:surveys` (List): Anonymized consumer decision survey responses.

---

## End-to-End Data Flow

```
[ Client Browser ]
       │
       │ (1) POST /api/optimize { items, location, plannedStore, selectedRetailers, sessionId }
       ▼
[ Express API Server ] ──► (2) Price Lookup (SerpApi Google Shopping Search / Fallback Dataset)
       │
       │ (3) Multi-Store Basket Optimization Engine
       │     - Evaluates single-store baseline vs. multi-store combinations
       │     - Applies travel friction penalty ($2.50 per additional store stop)
       │     - Classifies result (IMPROVED vs. ZERO_SAVINGS vs. SINGLE_STORE_OPTIMAL)
       │
       ├──► (4) Persists Telemetry to Vercel KV Redis (`stats:optimization_metrics`)
       │
       ▼ (5) Returns JSON Response
[ Client Browser Render ]
```

---

## Data Anonymization & Privacy
- **No PII**: The system does not collect or store Personally Identifiable Information (names, emails, home addresses, or full IP addresses).
- **Session Identifiers**: User sessions are tracked via client-side randomly generated anonymous tokens (`sess_[random_string]`) stored in local browser storage.
- **GDPR Compliance**: Survey responses and telemetry records are strictly decoupled from identity and tagged with randomized anonymous hashes (`anon_[random_string]`).
