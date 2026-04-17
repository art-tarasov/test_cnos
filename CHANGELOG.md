# Changelog

## Release Coherence Ledger

| Version | C_Σ | α | β | γ | Level | Coherence note |
|---------|-----|---|---|---|-------|----------------|
| 0.1.0 | A- | A- | A | A- | L6 | First application skeleton: NestJS backend + React/Vite frontend exist and are locally runnable. Monorepo workspace wiring established. PR template surface was corrected (F1: instance content in template file). |

---

## 0.1.0 — 2026-04-17

### Added

- **NestJS backend scaffold** (#2): `apps/backend` bootstraps a NestJS application. `npm run start:dev` starts the server on port 3000. Includes `GET /health` returning `{"status":"ok"}` with a passing unit test.
- **React + Vite frontend scaffold** (#2): `apps/frontend` bootstraps a React application. `npm run dev` starts the Vite dev server. Strict TypeScript, null-safe root mount.
- **Root monorepo workspace** (#2): Root `package.json` with npm workspaces `apps/*`. Each app owns its own dependencies. Root owns workspace wiring only.
- **Root README** (#2): Documents layout, prerequisites (Node 20+, npm 9+), and how to run each app locally.
- **CDD process surface** (#2): `.github/PULL_REQUEST_TEMPLATE.md` (generic blank CDD template), snapshot at `docs/alpha/monorepo-foundation/0.1.0/`.
