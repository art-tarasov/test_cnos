# MyQuiz

A monorepo with a NestJS backend API and a React + Vite frontend.

## Repository Layout

```
apps/
  backend/    NestJS application (API server)
  frontend/   React + Vite application (UI)
cnos/         Development tooling (CDD lifecycle)
docs/         Cycle snapshots and process artifacts
```

## Prerequisites

- Node.js 20+
- npm 9+ (workspace support required)

## Install

From the repo root:

```bash
npm install
```

This installs dependencies for both apps via npm workspaces.

## Running Locally

### Backend

```bash
cd apps/backend
npm run start:dev
```

The server starts on `http://localhost:3000` by default.
Override the port: `PORT=4000 npm run start:dev`

Health check:

```bash
curl http://localhost:3000/health
# {"status":"ok"}
```

### Frontend

```bash
cd apps/frontend
npm run dev
```

Vite starts a dev server. Open the URL shown in the terminal (default `http://localhost:5173`).

## TypeScript Verification

Both apps use `strict: true`. Verify with:

```bash
cd apps/backend && npx tsc --noEmit
cd apps/frontend && npx tsc --noEmit
```
