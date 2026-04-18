---
bundle: auth
version: 0.3.0
issue: "6"
branch: alpha/0.3.0-issue-6-auth
status: in-progress
---

# Snapshot: auth 0.3.0

Closes issue #6: User authentication — registration and JWT login.

## Deliverables

| Artifact | Path | Status |
|----------|------|--------|
| Auth config (env var loader) | `apps/backend/src/config/auth.config.ts` | stub |
| DTOs (register, login) | `apps/backend/src/auth/dto/` | stub |
| JWT strategy | `apps/backend/src/auth/jwt.strategy.ts` | stub |
| JwtAuthGuard | `apps/backend/src/auth/jwt-auth.guard.ts` | stub |
| @CurrentUser() decorator | `apps/backend/src/auth/current-user.decorator.ts` | stub |
| AuthService | `apps/backend/src/auth/auth.service.ts` | stub |
| AuthController | `apps/backend/src/auth/auth.controller.ts` | stub |
| AuthModule | `apps/backend/src/auth/auth.module.ts` | stub |
| Unit tests | `apps/backend/src/auth/*.spec.ts` | stub |
| .env.example (JWT vars) | `apps/backend/.env.example` | stub |
| SELF-COHERENCE.md | `docs/alpha/auth/0.3.0/SELF-COHERENCE.md` | stub |
