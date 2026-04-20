# SELF-COHERENCE

Issue: #15
Version: 0.7.0
Mode: MCA
Active Skills: Tier 1 (CDD.md, alpha/SKILL.md), Tier 2 (coding, design-principles, ship, testing, documenting, process-economics, writing)

## Terms

Added `docker-compose.yml` at the monorepo root with a `db` service (postgres:16-alpine), named volume (`myquiz_pgdata`), and `pg_isready` health-check. Updated `apps/backend/.env.example` with a clarifying comment on `DB_HOST`. Added a "Dev database" section to root `README.md`.

## Pointer

Developers required a local PostgreSQL installation to work on myquiz. No containerized option existed, creating per-machine setup friction and version drift.

## Exit

- `docker compose up -d db` starts a ready-to-use PostgreSQL 16 instance for local development.
- Credentials match `apps/backend/.env.example` exactly (myquiz/myquiz/myquiz) — no drift possible.
- Data persists across `docker compose down` / `up` via the named volume.
- `pg_isready` health-check allows dependent tooling to wait for readiness.
- README guides developers to start/stop the service and copy `.env.example` → `.env`.

## Acceptance Criteria Check

- [x] AC1: `docker-compose.yml` exists at repo root. `db` service uses `postgres:16-alpine`, exposes port 5432, credentials match `.env.example` (myquiz/myquiz/myquiz).
- [x] AC2: Named volume `myquiz_pgdata` declared in compose file.
- [x] AC3: Health-check declared using `pg_isready -U myquiz -d myquiz`.
- [x] AC4: `apps/backend/.env.example` updated with comment clarifying `DB_HOST=localhost` refers to Docker-exposed port.
- [x] AC5: Root `README.md` has "Dev database" section with `docker compose up -d db` (start) and `docker compose stop db` (stop), plus `.env.example` → `.env` note.
- [x] AC6: `docker-compose.yml` is NOT in `.gitignore`. Verified: `grep docker-compose .gitignore` → no match.
- [x] AC7: `tsc --noEmit` passes for backend. Verified: `cd apps/backend && npx tsc --noEmit` → exit 0, no output.

## Triadic Self-Check

- α: 4/4 — artifact integrity: all ACs met, no overclaim, no sibling drift
- β: 4/4 — surface agreement: compose credentials match .env.example exactly; README reflects actual commands
- γ: 4/4 — cycle economics: no Tier 3 skills required per issue; minimal scope, maximal DX value
- Weakest axis: none — all surfaces agree
- Action: none

## Known Debt

None. No production Docker setup, no override files, no additional services — per issue non-goals.
