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
- Docker (for the dev database; see Dev database below)

## Dev database

Start the PostgreSQL 16 service:

```bash
docker compose up -d db
```

Stop it:

```bash
docker compose stop db
```

Copy the example env file for the backend before running migrations or the server:

```bash
cp apps/backend/.env.example apps/backend/.env
```

The defaults in `.env.example` match the Docker service credentials — no edits required for local development.

## Install

From the repo root:

```bash
npm install
```

This installs dependencies for all workspaces (backend and frontend) via npm workspaces.

## Running Locally

### Backend

Start the dev database and copy the env file first (see [Dev database](#dev-database) above).

Run database migrations:

```bash
cd apps/backend
npm run migration:run
```

Start the server:

```bash
npm run start:dev
```

The server starts on `http://localhost:3000` by default.
Override the port: `PORT=4000 npm run start:dev`

Health check:

```bash
curl http://localhost:3000/health
# {"status":"ok","db":"ok"}   ← when DB is reachable
# {"status":"degraded","db":"error"}  ← when DB is unreachable
```

### Frontend

```bash
cd apps/frontend
npm run dev
```

Vite starts a dev server. Open the URL shown in the terminal (default `http://localhost:5173`).

## TypeScript Verification

```bash
cd apps/backend && npx tsc --noEmit
cd apps/frontend && npx tsc --noEmit
```

## Tests

```bash
cd apps/backend && npm test
```
