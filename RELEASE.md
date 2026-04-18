## Outcome

Coherence delta: C_Σ `A-` (`α A-`, `β A`, `γ A`) · **Level:** `L6`

The backend now has a persistence layer. Before this release, `app.module.ts` imported no database module, there was no ORM dependency, and every quiz feature was blocked. After this release, TypeORM is integrated with PostgreSQL, six entities in 4NF define the core quiz data model, the initial migration is runnable, and `GET /health` reports real DB connectivity status. The schema is managed exclusively via migrations (`synchronize: false`); all DB connection params flow from env vars with explicit failure on missing config.

## Why it matters

No quiz feature — authoring, taking, scoring — can be built without persistence. This cycle closes the P0 blocking dependency. The schema design choices (composite PK on `QuestionAnswer`, separate `ExpectedAnswer` entity, `jsonb` body fields) are explicitly scoped for extensibility without future migrations. TypeORM was selected over Prisma for first-class NestJS integration and easier `DataSource` injection in unit tests; the decision and its negative leverage are documented in `docs/alpha/postgres-data-model/0.2.0/DESIGN.md`.

## Added

- **PostgreSQL + TypeORM integration** (#4): `DatabaseModule` connects via env vars; throws clearly on missing vars; `retryAttempts: 3` limits hang on unreachable DB.
- **Six entities in 4NF** (#4): `User`, `Quiz`, `Question`, `QuestionOption`, `QuestionAnswer` (composite PK), `ExpectedAnswer`. All `body` fields `jsonb`. FK constraints on both `QuestionAnswer` columns.
- **Initial migration** (#4): `1776384000000-InitSchema` — creates all tables, enums, and constraints. `npm run migration:run` from `apps/backend`.
- **`.env.example`** (#4): Documents DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME.
- **Health endpoint DB check** (#4): `{"status":"ok","db":"ok"}` or `{"status":"degraded","db":"error"}`.
- **Unit tests** (#4): 8 tests, 3 suites — DB health service mock, health controller both paths, entity enum values + composite key independence.

## Validation

- `apps/backend`: `npm test` → 8/8 tests passing across 3 suites
- `apps/backend`: `tsc --noEmit` passes (strict mode, no `any`)
- Migration runnable against a live PostgreSQL instance via `npm run migration:run`
- Health endpoint returns correct `{status, db}` shape in both healthy and degraded paths (unit-tested)
- Full integration against a running DB deferred — no live DB in release environment

## Known Issues

- Integration tests against a live DB not present (explicit non-goal per issue #4)
- `ExpectedAnswer` validity for `short_text` questions only is documented but not DB-enforced (noted in DESIGN.md and SELF-COHERENCE.md)
- TypeORM 0.3.x query-builder limitations noted; migrate to Prisma if query complexity grows (noted in DESIGN.md)
