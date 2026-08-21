# PriceIQ Codebase Provenance & Git Development Log

## Overview
This document serves as an objective, uncurated record of the software development lifecycle, repository history, and commit provenance for the PriceIQ application repository.

## Development Disclosure
- **Primary Developer / Project Lead**: Peter Tobi Sunmola (`petertobi@Sunmolas-MacBook-Pro.local`)
- **Development Tooling**: Development execution was accelerated using AI-assisted pair-programming tools under the direct architectural specification, logic definition, and step-by-step supervision of Peter Tobi Sunmola.
- **Repository Range**: July 27, 2026 – Present
- **Total Commit Count**: 42+ commits

---

## Uncurated Commit Log

| Commit Hash | Author & Identity | Date | Commit Message |
|---|---|---|---|
| `471b71a` | Sunmola Peter Tobi `<petertobi@Sunmolas-MacBook-Pro.local>` | 2026-07-31 | Remove redundant 'Build a Basket' button and remove API reset endpoint |
| `e050ff6` | Sunmola Peter Tobi `<petertobi@Sunmolas-MacBook-Pro.local>` | 2026-07-30 | fix: Update social preview card with user exact PriceIQ logo mark with arrow stem |
| `411da13` | Sunmola Peter Tobi `<petertobi@Sunmolas-MacBook-Pro.local>` | 2026-07-30 | fix: Replace social preview card with official PriceIQ app squircle P logo mark |
| `22653ab` | Sunmola Peter Tobi `<petertobi@Sunmolas-MacBook-Pro.local>` | 2026-07-30 | feat: Add Open Graph and Twitter Card social share preview logo and metadata |
| `860b9f6` | Sunmola Peter Tobi `<petertobi@Sunmolas-MacBook-Pro.local>` | 2026-07-30 | feat: Add deduplicated unique user count to Platform All-User Savings Banner |
| `aec3f47` | Sunmola Peter Tobi `<petertobi@Sunmolas-MacBook-Pro.local>` | 2026-07-30 | feat: Add platform-wide cumulative all-user savings banner to Analytics section |
| `4b9972c` | Sunmola Peter Tobi `<petertobi@Sunmolas-MacBook-Pro.local>` | 2026-07-30 | chore: Remove reset buttons from UI |
| `e835b5e` | Sunmola Peter Tobi `<petertobi@Sunmolas-MacBook-Pro.local>` | 2026-07-30 | fix: Replace falsy \|\| fallbacks with nullish coalescing so zero values display 0 cleanly |
| `f6f8b89` | Sunmola Peter Tobi `<petertobi@Sunmolas-MacBook-Pro.local>` | 2026-07-30 | fix: Replace falsy \|\| fallbacks with nullish coalescing to render true 0 on empty records |
| `acf12ad` | Sunmola Peter Tobi `<petertobi@Sunmolas-MacBook-Pro.local>` | 2026-07-30 | fix: Use un-protected routes for reset-data and analytics to bypass Vercel SSO protection |
| `5120eaf` | Sunmola Peter Tobi `<petertobi@Sunmolas-MacBook-Pro.local>` | 2026-07-30 | feat: Zero out initial analytics data and populate dynamically from live entries |
| `e1abbf1` | Sunmola Peter Tobi `<petertobi@Sunmolas-MacBook-Pro.local>` | 2026-07-30 | fix: Make Reset Tracker button explicitly visible on Cumulative Savings card |
| `ba00ac7` | Sunmola Peter Tobi `<petertobi@Sunmolas-MacBook-Pro.local>` | 2026-07-30 | feat: Make Cumulative Savings Tracker 100% dynamic starting at zsh.00 and accumulating per checkout |
| `7565d7e` | Sunmola Peter Tobi `<petertobi@Sunmolas-MacBook-Pro.local>` | 2026-07-30 | feat: Make Cumulative Savings Tracker 100% dynamic starting at zsh.00 and accumulating per checkout |
| `21e6893` | Sunmola Peter Tobi `<petertobi@Sunmolas-MacBook-Pro.local>` | 2026-07-29 | fix: Persist trip constraints (stores, distance, retailers) and sync with optimization engine |
| `01ce798` | Sunmola Peter Tobi `<petertobi@Sunmolas-MacBook-Pro.local>` | 2026-07-29 | feat: Add ChatGPT AI upgrades, relative savings, collapsible store drawers, and strict 2-store balanced plan logic |
| `0e3d5fd` | Sunmola Peter Tobi `<petertobi@Sunmolas-MacBook-Pro.local>` | 2026-07-28 | fix: Re-add GET /api/admin/analytics route and provide rich benchmark defaults to fix Analytics Unavailable screen |
| `a44d058` | Sunmola Peter Tobi `<petertobi@Sunmolas-MacBook-Pro.local>` | 2026-07-28 | fix: Fix syntax error unclosed brace in api/db.js and restore clean ES Module exports for Vercel serverless runtime |
| `9510377` | Sunmola Peter Tobi `<petertobi@Sunmolas-MacBook-Pro.local>` | 2026-07-28 | fix: Convert serverless backend (api/db.js and api/index.js) to CommonJS module.exports, fixing Vercel SyntaxError: Unexpected token 'export' invocation crash |
| `3ed9b65` | Sunmola Peter Tobi `<petertobi@Sunmolas-MacBook-Pro.local>` | 2026-07-28 | fix: Make searchSerpApi fail-safe with try/catch fallback to mock data, preventing 500 error when SerpApi key/location error occurs |
| `6ae919f` | Sunmola Peter Tobi `<petertobi@Sunmolas-MacBook-Pro.local>` | 2026-07-28 | fix: Resolve 500 error on /api/optimize with defensive baseline store defaults and safe unit parsing |
| `caf18d8` | Sunmola Peter Tobi `<petertobi@Sunmolas-MacBook-Pro.local>` | 2026-07-28 | fix: Remove unused type import in OptimizationEngine.tsx for clean build |
| `be8287a` | Sunmola Peter Tobi `<petertobi@Sunmolas-MacBook-Pro.local>` | 2026-07-28 | feat: Implement Pilot Test Survey & Research Subsystem (8-step survey wizard, invitation card, admin research dashboard with CSV export, and research mode banner) |
| `1266381` | Sunmola Peter Tobi `<petertobi@Sunmolas-MacBook-Pro.local>` | 2026-07-28 | feat: Add interactive Multi-Retailer Selection toggle panel on BasketBuilder and Trip Preferences modal |
| `39f4f7e` | Sunmola Peter Tobi `<petertobi@Sunmolas-MacBook-Pro.local>` | 2026-07-27 | fix: Replace hardcoded name with dynamic user name or Sample Weekly Essentials |
| `095acf8` | Sunmola Peter Tobi `<petertobi@Sunmolas-MacBook-Pro.local>` | 2026-07-27 | style: Integrate downward arrow cutout into PriceIQ logo stem symbolizing price drops |
| `74a346d` | Sunmola Peter Tobi `<petertobi@Sunmolas-MacBook-Pro.local>` | 2026-07-27 | style: Refine brand color palette (Deep Emerald #059669, Amber AI Insights, Teal Analytics), brighten secondary text contrast, and upgrade PriceIQ logo to modern fintech P mark |
| `5528f7f` | Sunmola Peter Tobi `<petertobi@Sunmolas-MacBook-Pro.local>` | 2026-07-27 | fix: Move all React useState hooks to top of OptimizationEngine to fix blank screen render error |
| `017e750` | Sunmola Peter Tobi `<petertobi@Sunmolas-MacBook-Pro.local>` | 2026-07-27 | fix: Resolve TypeScript singleStyle and skipAdvice types in OptimizationEngine |
| `3c200ed` | Sunmola Peter Tobi `<petertobi@Sunmolas-MacBook-Pro.local>` | 2026-07-27 | feat: Implement PriceIQ Competitive Moat features (STOCK_UP signals, Skip Store rationale, Trip Preferences modal, and refined slogan) |
| `8f28a80` | Sunmola Peter Tobi `<petertobi@Sunmolas-MacBook-Pro.local>` | 2026-07-27 | feat: Add interactive Receipt Scanner modal and functioning Repeat Last Basket quick action |
| `43f8313` | Sunmola Peter Tobi `<petertobi@Sunmolas-MacBook-Pro.local>` | 2026-07-27 | fix: Format all travel extra miles display to 1 decimal place |
| `b0bbbe2` | Sunmola Peter Tobi `<petertobi@Sunmolas-MacBook-Pro.local>` | 2026-07-27 | fix: Resolve JSX syntax in OptimizationEngine and prepare production build |
| `b339389` | Sunmola Peter Tobi `<petertobi@Sunmolas-MacBook-Pro.local>` | 2026-07-27 | feat: Implement 3 Shopping Modes, Actionable Forecasting (WAIT/BUY NOW), Location Bar, Hero Redesign, and Personal Savings ROI Dashboard |
| `7389945` | Sunmola Peter Tobi `<petertobi@Sunmolas-MacBook-Pro.local>` | 2026-07-27 | feat: Add 3D tactile button system and playful light-to-deep gradient on PriceIQ logo |
| `7ced7cc` | Sunmola Peter Tobi `<petertobi@Sunmolas-MacBook-Pro.local>` | 2026-07-27 | style: Match dark teal-navy background and squircle icon enclosure badge from brand mockup |
| `a35faf9` | Sunmola Peter Tobi `<petertobi@Sunmolas-MacBook-Pro.local>` | 2026-07-27 | feat: Integrate official PriceIQ green P-tag logo, favicon, slogan, and emerald brand color palette |
| `1a3a6c8` | Sunmola Peter Tobi `<petertobi@Sunmolas-MacBook-Pro.local>` | 2026-07-27 | refactor: Rename app branding to PriceIQ |
| `5b49bb4` | Sunmola Peter Tobi `<petertobi@Sunmolas-MacBook-Pro.local>` | 2026-07-27 | feat: Support STORAGE_ and UPSTASH_REDIS_ environment variable prefixes for Vercel Upstash KV integration |
| `55831de` | Sunmola Peter Tobi `<petertobi@Sunmolas-MacBook-Pro.local>` | 2026-07-27 | fix: Safeguard AdminDashboard tab rendering against empty array/object fallback types |
| `7c7b236` | Sunmola Peter Tobi `<petertobi@Sunmolas-MacBook-Pro.local>` | 2026-07-27 | feat: Add travel overhead friction math, unit price normalization, and 1-click cart exports |
| `6c643c4` | Sunmola Peter Tobi `<petertobi@Sunmolas-MacBook-Pro.local>` | 2026-07-27 | feat: Add analytics dashboard, savings metrics tracking, and evaluation benchmark suite |
