# Changelog

## Release Coherence Ledger

| Version | C_Σ | α | β | γ | Level | Coherence note |
|---------|-----|---|---|---|-------|----------------|
| 0.3.0 | A- | A- | A | A- | L6 (cycle: L6) | Auth layer added: JWT registration + login, JwtAuthGuard and @CurrentUser() for future controllers. Two findings at review (F1 C mechanical: Tier classification cross-surface conflict in SELF-COHERENCE.md; F2 B judgment: dead test setup). Both fixed in RC. γ dispatch had transposed PR/issue numbers. |
| 0.2.0 | A- | A- | A | A | L6 (cycle: L6) | Persistence layer established: TypeORM + PostgreSQL, six entities in 4NF, initial migration, health endpoint extended. Four mechanical findings (3B, 1A) reached review — FK type annotation drift, bootstrap ordering, CLI env var consistency, README omission. |
| 0.1.0 | A- | A- | A | A- | L6 | First application skeleton: NestJS backend + React/Vite frontend exist and are locally runnable. Monorepo workspace wiring established. PR template surface was corrected (F1: instance content in template file). |

---

## 0.3.0 — 2026-04-18

### Added

- **`POST /auth/register`** (#6): accepts `{ email, password }`, creates `User` with bcrypt hash (12 rounds), returns `{ id, email, role }`. Returns 409 on duplicate email.
- **`POST /auth/login`** (#6): verifies credentials, returns signed JWT `{ sub: userId, email, role }`. Returns 401 on invalid credentials (message identical for missing user and wrong password — no user enumeration).
- **`JwtAuthGuard`** (#6): `extends AuthGuard('jwt')`. Apply with `@UseGuards(JwtAuthGuard)` to require a valid JWT. Returns 401 on absent or invalid token.
- **`@CurrentUser()` decorator** (#6): extracts `JwtPayload` from the authenticated request. Available for future controllers.
- **`GET /auth/me`** (#6): protected endpoint; returns `{ id, email, role }` from the JWT payload.
- **Auth config** (#6): `auth.config.ts` reads `JWT_SECRET` (required, throws on missing) and `JWT_EXPIRES_IN` (optional, defaults `7d`). `.env.example` updated with both vars.
- **Unit tests** (#6): 10 new tests (18/18 total) — service: register/hash/login/invalid; controller: register/login pass-through, me with valid token, guard deny behavior.

---

## 0.2.0 — 2026-04-18

### Added

- **PostgreSQL + TypeORM integration** (#4): `DatabaseModule` connects via env vars (DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME); startup throws clearly on missing vars; `retryAttempts: 3` bounds hang on DB-unreachable.
- **Six entities in 4NF** (#4): `User`, `Quiz`, `Question`, `QuestionOption`, `QuestionAnswer` (composite PK), `ExpectedAnswer`. All `body` fields `jsonb`. FK constraints on both `QuestionAnswer` columns. camelCase TypeScript / snake_case DB columns.
- **Initial migration** (#4): `1776384000000-InitSchema` — creates all tables, enums, PK/FK/unique constraints. Runnable via `npm run migration:run` from `apps/backend`.
- **`.env.example`** (#4): Documents all required DB env vars with local defaults.
- **Health endpoint DB check** (#4): `GET /health` now returns `{"status":"ok","db":"ok"}` when healthy or `{"status":"degraded","db":"error"}` when DB unreachable.
- **Unit tests** (#4): 8 tests across 3 suites — DB health mock (both paths), entity enum values, `QuestionAnswer` composite key field independence.

---

## 0.1.0 — 2026-04-17

### Added

- **NestJS backend scaffold** (#2): `apps/backend` bootstraps a NestJS application. `npm run start:dev` starts the server on port 3000. Includes `GET /health` returning `{"status":"ok"}` with a passing unit test.
- **React + Vite frontend scaffold** (#2): `apps/frontend` bootstraps a React application. `npm run dev` starts the Vite dev server. Strict TypeScript, null-safe root mount.
- **Root monorepo workspace** (#2): Root `package.json` with npm workspaces `apps/*`. Each app owns its own dependencies. Root owns workspace wiring only.
- **Root README** (#2): Documents layout, prerequisites (Node 20+, npm 9+), and how to run each app locally.
- **CDD process surface** (#2): `.github/PULL_REQUEST_TEMPLATE.md` (generic blank CDD template), snapshot at `docs/alpha/monorepo-foundation/0.1.0/`.
