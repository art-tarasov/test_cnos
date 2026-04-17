## Gap

No application exists. The repo contains only cnos tooling. Every quiz feature is blocked until both apps boot and are locally runnable.

## Mode

MCA — straightforward scaffold; answer is in the standard NestJS + React + Vite patterns. No design invention required.

**Tier 3 skills:** typescript, ux-cli, architecture-evolution

## Acceptance Criteria

- AC1: Monorepo structure with `apps/backend` (NestJS) and `apps/frontend` (React + Vite); root `package.json` workspaces.
- AC2: `npm run start:dev` from `apps/backend` starts NestJS on port 3000.
- AC3: `GET /health` → `{"status":"ok"}` HTTP 200.
- AC4: `npm run dev` from `apps/frontend` starts Vite dev server at `/`.
- AC5: Root README — layout, prerequisites, how to run.
- AC6: `tsc --noEmit` passes for both apps.

## CDD Trace

| Step | Artifact | Skills loaded | Decision |
|------|----------|---------------|----------|
| 0 Observe | — | — | Repo has no application code (`git ls-files` shows only `.claude/` and `cnos/`) |
| 1 Select | — | — | Issue #2 selected: P0, blocks all application development |
| 2 Branch | `alpha/2-monorepo-foundation` | — | Branch created from main; no existing branch or PR for issue 2 |
| 3 Bootstrap | `docs/alpha/monorepo-foundation/0.1.0/README.md` + `SELF-COHERENCE.md` stubs | — | Version directory created as first diff |
| 4 Gap | This PR body | — | No application exists; every quiz feature is blocked |
| 5 Mode | This PR body | cdd, typescript, ux-cli, architecture-evolution | MCA; Tier 3: typescript + ux-cli + architecture-evolution; work shape: tool/CLI + cross-module scaffold |
| 6 Artifacts | `apps/backend/`, `apps/frontend/`, `package.json`, `README.md`, tests | typescript, coding, testing, documenting | Tests written first; code; docs; SELF-COHERENCE.md |
| 7 Self-coherence | `docs/alpha/monorepo-foundation/0.1.0/SELF-COHERENCE.md` | — | All ACs mapped to evidence; no ambiguity pushed to β |

## Self-Coherence

See `docs/alpha/monorepo-foundation/0.1.0/SELF-COHERENCE.md`.

## Known Debt

- No e2e tests, CI, Docker, deployment (all explicit non-goals in issue #2)
- npm audit vulnerabilities in transitive deps from NestJS + Jest toolchain — not in scope

## Pre-Review Gate

- [x] Branch rebased onto current main
- [x] PR body carries CDD Trace through step 7
- [x] Tests present: `apps/backend/src/health/health.controller.spec.ts` (1 passing)
- [x] Every AC has evidence (see SELF-COHERENCE.md)
- [x] Known debt explicit
- [x] Schema/shape audit: N/A (no schema-bearing contract changed)
- [x] Peer enumeration: N/A (no peer family — greenfield scaffold)
- [x] Harness audit: N/A (no shell/CI harnesses for these contracts)
- [x] Post-patch re-audit: completed after all files written
- [ ] CI green: no CI configured (explicit non-goal); `tsc --noEmit` + `npm test` verified locally
