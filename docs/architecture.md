# Green11 Architecture Overview

This document explains how the Green11 platform is organised so new contributors can quickly understand the feature layout across the frontend and backend.

## High-Level View

- **Frontend** – Vite + React (TypeScript) single-page application located in `src/`. Tailwind and shadcn/ui power the design system. Routing is handled with React Router. The app consumes REST endpoints served by the backend.
- **Backend** – Express server (`server/`) backed by MongoDB. Provides authentication, challenge management, reward redemption, and static page content APIs. Razorpay is wired in for reward checkout flows.

```
 ┌───────────┐        HTTPS        ┌──────────────┐        MongoDB        ┌────────────┐
 │  Browser  │ ──────────────────▶ │  Express API │ ────────────────────▶ │   Atlas /  │
 │ (React)   │ ◀────────────────── │   (server)   │ ◀──────────────────── │   LocalDB  │
 └───────────┘    JSON payloads    └──────────────┘   Mongoose models     └────────────┘
        ▲
        │
        └── Razorpay sandbox (reward checkout)
```
 
## Frontend Layers (`src/`)

| Layer | Purpose | Key directories |
| ----- | ------- | ----------------|
| Layouts & Routes | Provide authenticated shell and route guards | `layouts/ProtectedLayout.tsx`, `routes/ProtectedRoute.tsx` |
| Pages | Feature screens (Dashboard, ChallengeDetails, Rewards, etc.) | `pages/` |
| UI Toolkit | Shared components built on shadcn + Tailwind | `components/ui/` |
| Feature Components | Higher-level composites (navigation, stats cards, AI helper) | `components/` |
| State & Context | Authentication state, custom hooks | `contexts/`, `hooks/` |
| Utilities | API helpers, model-specific utilities, AI endpoint resolver | `lib/` |
| Styling | Tailwind config & global CSS | `App.css`, `index.css`, `tailwind.config.ts` |

### Notable Features

- **AI Helper**: `AIInputWithLoading` submits prompts to the Gemini API. `GeminiResponse` formats the AI output into readable paragraphs/lists. Configuration uses `VITE_GEMINI_API_KEY`, with optional overrides for model/version.
- **Dashboard & Challenges**: `pages/Dashboard.tsx` lists active challenges fetched from `/dashboard`. `pages/ChallengeDetails.tsx` shows challenge info, status, and embeds the AI helper panel.
- **Rewards Marketplace**: `pages/Rewards.tsx` displays reward cards, filters categories, and kicks off Razorpay flows. Deduped category logic prevents duplicate filter buttons.
- **Auth Flow**: `pages/Auth.tsx` connects to backend auth endpoints. `AuthContext.tsx` stores the JWT and user meta for route protection.

## Backend Layers (`server/`)

| Layer | Purpose | Files |
| ----- | ------- | ----- |
| Server Bootstrap | Spins up Express, attaches middleware | `src/index.js` |
| Routing | Defines feature endpoints | `src/routes/` (auth, dashboard, page-content) |
| Data Access | Mongoose models for core domain objects | `src/models/` (user, dashboard, page-content) |
| Business Logic | Auth helpers, seeding utilities | `src/lib/auth.js`, `src/lib/seed.js` |
| Data/Seed | Mock data for local development | `src/data/` |
| Config | `.env` for secrets (Mongo URL, JWT secret, Razorpay keys, Gemini key) | `server/.env` |

### API Endpoints Summary

| Endpoint | Description |
| -------- | ----------- |
| `POST /auth/login` | Authenticate user, return JWT |
| `POST /auth/register` | Create new user |
| `GET /dashboard` | Return active challenges, stats, leaderboard data |
| `POST /dashboard/submissions` | Record challenge submissions |
| `GET /rewards` | Return reward catalog |
| `POST /rewards/redeem` | Initialize Razorpay checkout |
| `GET /page-content/:slug` | Serve marketing/content pages |

## Data Flow

1. **User logs in** via `/auth/login`. JWT is stored in `AuthContext` and appended to subsequent REST calls.
2. **Dashboard load** triggers GET `/dashboard`. Response is cached client-side in `Dashboard` page state.
3. **Challenge details** fetch challenge info. Users can ask the AI helper (`AIInputWithLoading`) which calls the Gemini REST API (model discovery handled in `lib/gemini.ts`).
4. **Reward redemption** posts to `/rewards/redeem`, which invokes Razorpay using keys from the server `.env`. Payment status updates propagate back to the UI.

## Environment & Tooling

- `npm run dev` (root) – Vite dev server.
- `npm start` (server/) – Express dev server.
- `npm run build` (root) – Production build.
- Tailwind + PostCSS for styling; ESLint for linting.
- Optional: bun lockfile exists, but npm scripts are primary.

## Future Notes

- Replace the placeholder AI helper copy with the definitive branding once naming is final.
- Run `ListModels` to validate available Gemini models as part of CI if the API schema changes.
- Consider adding automated tests for the AI helper endpoint selection logic (`lib/gemini.ts`).

This overview should provide enough orientation for incoming contributors to understand how features are structured and where to extend the system.
