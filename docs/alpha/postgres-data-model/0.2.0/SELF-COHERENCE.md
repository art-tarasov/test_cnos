# Self-Coherence: postgres-data-model 0.2.0

**Issue:** #4 — Integrate PostgreSQL and define core quiz data model  
**Branch:** alpha/4-postgres-data-model  
**Version/Mode:** 0.2.0 / MCA

## Active Skills

- Tier 1: CDD.md, alpha/SKILL.md
- Tier 2: coding, testing, design-principles, architecture-evolution, documenting, writing, ship, process-economics
- Tier 3: typescript, architecture-evolution

## AC Verification

| AC | Claim | Evidence |
|----|-------|----------|
| AC1 | DB connection via env vars; `.env.example` documents all required vars; no hard-coded params | `apps/backend/.env.example` lists DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME; `database.config.ts` reads from `process.env` only; throws on missing vars |
| AC2 | TypeORM integrated; startup fails clearly on missing vars or DB unreachable | `DatabaseModule` calls `loadDatabaseConfig()` in `useFactory` — throws `Error` with message listing missing vars; `retryAttempts: 3` limits silent hang to ≤9s |
| AC3 | All six entities defined with correct schema | Six entity files in `src/entities/`; `body` fields are `{ type: 'jsonb' }`; FK `@Column` decorators carry `type: 'uuid'` (consistent with `@PrimaryColumn` in `QuestionAnswer`); `QuestionAnswer` uses `@PrimaryColumn` × 2 with `@JoinColumn` FK constraints on both |
| AC4 | Migration runnable via `npm run migration:run` | `src/migrations/1776384000000-InitSchema.ts` implements `MigrationInterface`; `data-source.ts` exports `AppDataSource`; `package.json` `migration:run` script uses `typeorm-ts-node-commonjs` |
| AC5 | `GET /health` returns `{status,db}` | `HealthController` calls `DatabaseHealthService.isHealthy()`; returns `{status:'ok',db:'ok'}` or `{status:'degraded',db:'error'}` |
| AC6 | Unit tests: DB health mock + entity enum validation | `database-health.service.spec.ts` mocks DataSource; `entities.spec.ts` asserts enum string values and QuestionAnswer field independence; `health.controller.spec.ts` tests both paths |
| AC7 | `tsc --noEmit` passes; no `any` | Verified locally; body fields typed as `Record<string, unknown>`; caught errors not bound to a variable |

## Role Self-Check

- Did α push ambiguity onto β? No — each AC maps to a concrete file and line.
- Peer enumeration: The health controller is the only HTTP handler using DB state this cycle. No siblings.
- Schema/shape audit: The migration SQL was verified by reading each `CREATE TABLE` against the entity definitions. Column names (snake_case in SQL, camelCase in TypeScript) confirmed consistent.
- Harness audit: No shell harnesses or CI fixtures emit DB schema shapes.
- Post-patch re-audit: Re-read against HEAD after all files written and tests passed.

## Architecture decisions

See `DESIGN.md`. TypeORM chosen over Prisma. Work shape is additive MCA — no existing boundary changed.

## Known Debt

- Integration tests against a live DB are a stretch goal (AC6) — not present; stated explicitly per issue non-goals
- `ExpectedAnswer` validity for `short_text` only is documented but not DB-enforced (stated in issue invariants)
- TypeORM 0.3.x query-builder limitations could require migration to Prisma if query complexity grows — noted in DESIGN.md
- npm audit vulnerabilities inherited from prior cycle toolchain — not in scope
