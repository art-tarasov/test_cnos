---
bundle: auth
version: 0.3.0
issue: "6"
branch: alpha/0.3.0-issue-6-auth
status: complete-pending-review
---

# Snapshot: auth 0.3.0

Closes issue #6: User authentication — registration and JWT login.

## Deliverables

| Artifact | Path | Status |
|----------|------|--------|
| Auth config (env var loader) | `apps/backend/src/config/auth.config.ts` | ✓ |
| DTOs (register, login) | `apps/backend/src/auth/dto/` | ✓ |
| JWT strategy | `apps/backend/src/auth/jwt.strategy.ts` | ✓ |
| JwtAuthGuard | `apps/backend/src/auth/jwt-auth.guard.ts` | ✓ |
| @CurrentUser() decorator | `apps/backend/src/auth/current-user.decorator.ts` | ✓ |
| AuthService | `apps/backend/src/auth/auth.service.ts` | ✓ |
| AuthController | `apps/backend/src/auth/auth.controller.ts` | ✓ |
| AuthModule | `apps/backend/src/auth/auth.module.ts` | ✓ |
| Unit tests | `apps/backend/src/auth/*.spec.ts` | ✓ |
| .env.example (JWT vars) | `apps/backend/.env.example` | ✓ |
| SELF-COHERENCE.md | `docs/alpha/auth/0.3.0/SELF-COHERENCE.md` | ✓ |
