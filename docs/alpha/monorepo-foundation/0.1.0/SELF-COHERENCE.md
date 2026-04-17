# Self-Coherence: monorepo-foundation 0.1.0

**Issue:** #2 — Scaffold NestJS + React monorepo foundation
**Branch:** alpha/2-monorepo-foundation
**Version/Mode:** 0.1.0 / MCA

## Active Skills

- Tier 1: CDD.md, alpha/SKILL.md
- Tier 2: coding, testing, design-principles, architecture-evolution, documenting, writing, ship, process-economics
- Tier 3: typescript, ux-cli, architecture-evolution

## AC Verification

| AC | Claim | Evidence |
|----|-------|----------|
| AC1 | `apps/backend` and `apps/frontend` exist; root `package.json` has `workspaces: ["apps/*"]` | `cat package.json` shows workspaces; `ls apps/` shows backend + frontend |
| AC2 | `npm run start:dev` in `apps/backend` starts NestJS on port 3000 | `apps/backend/package.json` start:dev = `nest start --watch`; `src/main.ts` listens on `process.env.PORT ?? 3000` |
| AC3 | `GET /health` returns `{"status":"ok"}` HTTP 200 | `npm test` in `apps/backend` → 1 test PASS: `HealthController returns { status: "ok" }` |
| AC4 | `npm run dev` in `apps/frontend` starts Vite dev server at `/` | `apps/frontend/package.json` dev = `vite`; `index.html` root div; `src/main.tsx` mounts App at `#root` |
| AC5 | Root README documents layout, prerequisites, how to run | `README.md` has: Repository Layout section, Prerequisites (Node 20+, npm 9+), Install + Backend + Frontend run instructions |
| AC6 | Both apps compile with no TypeScript errors | `tsc --noEmit` exits 0 in both `apps/backend` and `apps/frontend` (verified locally) |

## Role Self-Check

- Did α push ambiguity onto β? No. Each AC maps to concrete evidence in the diff.
- Peer enumeration: N/A — no family of sibling surfaces. This is a greenfield scaffold; no peers exist yet.
- Schema/shape audit: N/A — no schema-bearing parser, contract, or manifest changed. `package.json` workspaces is additive (new field in new file).
- Harness audit: N/A — no shell harnesses, CI fixtures, or template writers for any of these contracts.
- Post-patch re-audit: This section was re-read against HEAD after all files were written and tests passed.

## Architecture Decisions (per architecture-evolution skill)

The issue names one structural constraint: monorepo root owns workspace wiring only; app-specific deps live in each `apps/` package. This was applied directly:

- Root `package.json`: `name`, `private`, `workspaces` only — no deps.
- Each app `package.json` owns its own deps and devDeps.

No architecture assumption was challenged in this cycle. This is a first-cycle scaffold, not a boundary move.

## Known Debt

- No e2e tests — explicitly out of scope (issue non-goals)
- No CI configuration — explicitly out of scope
- No Docker/deployment — explicitly out of scope
- No inter-app API contracts beyond health endpoint — explicitly out of scope
- npm audit shows vulnerabilities in transitive deps (from NestJS + Jest toolchain) — expected for a new project, not in scope for this cycle
