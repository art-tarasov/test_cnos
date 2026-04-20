# Release 0.7.0

## Outcome

Coherence delta: C_Σ A (`α A`, `β A`, `γ A`) · **Level:** L6

**Docker Compose dev database:** Eliminated per-machine PostgreSQL installation friction. All developers now use a standardized PostgreSQL 16 service exposed via Docker Compose. Credentials match `.env.example` exactly — no drift possible. Data persists across `docker compose down` / `up` cycles via named volume. Health-check allows dependent tooling to wait for database readiness.

## Why it matters

Manual PostgreSQL installation on developer machines creates:
- **Onboarding friction:** Non-trivial setup, especially on Windows
- **Version drift:** Developers run different PostgreSQL versions locally vs. what the project assumes
- **Silent bugs:** Schema or migration compatibility issues only discovered in CI or production

Docker Compose eliminates all three by providing a reproducible, container-based dev database that every developer gets identical.

## Added

- **`docker-compose.yml`** (#15): PostgreSQL 16 service at monorepo root. Environment variables: `POSTGRES_USER=myquiz`, `POSTGRES_PASSWORD=myquiz`, `POSTGRES_DB=myquiz`. Port 5432 host-mapped. Named volume `myquiz_pgdata` provides persistence. Health-check via `pg_isready`.
- **README "Dev database" section** (#15): Clear start/stop commands and `.env.example` → `.env` copy guidance. No edits required; defaults match Docker service credentials.

## Changed

- **Backend setup documentation** (#15): Replaced "PostgreSQL 13+ (manual installation)" with "Docker (for the dev database)". Dependency list now references `Docker Compose` instead of a PostgreSQL version constraint.

## Fixed

- **Developer onboarding** (#15): Removed manual PostgreSQL setup step. `docker compose up -d db` is now the single command to get a working database.

## Validation

- **Credentials match:** `.env.example` (DB_USER=myquiz, DB_PASSWORD=myquiz, DB_NAME=myquiz) matches `docker-compose.yml` environment exactly.
- **TypeScript clean:** `tsc --noEmit` passes for backend (verification gate per AC7).
- **Data persistence:** Named volume `myquiz_pgdata` declared; survives compose down/up cycles.
- **Health-check operational:** `pg_isready -U myquiz -d myquiz` runs on service startup, allows dependent tooling to wait for readiness.

## Known Issues

None found during release.
