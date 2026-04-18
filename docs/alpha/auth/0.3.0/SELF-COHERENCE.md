# Self-Coherence — auth 0.3.0

## Issue
#6 — User authentication: registration and JWT login

## Version / Mode
0.3.0 / MCA

## Active Skills
- Tier 1: CDD.md, alpha/SKILL.md
- Tier 2: coding, testing, design-principles, architecture-evolution, ship, writing, documenting, process-economics
- Tier 3: eng/typescript, eng/architecture-evolution

## AC-by-AC Check

**AC1: `POST /auth/register` — accepts `{ email, password }`, creates User with bcrypt hash, returns `{ id, email, role }`, 409 on duplicate**
- Evidence: `auth.service.ts` `register()` calls `bcrypt.hash(dto.password, 12)`, creates entity, returns `{ id, email, role }`. Throws `ConflictException` (HTTP 409) if `findOne` returns a non-null user.
- Test: `auth.service.spec.ts` — "stores hashed password, not plaintext", "returns id, email, role on success", "throws ConflictException when email already registered" ✓

**AC2: `POST /auth/login` — verifies credentials, returns signed JWT `{ sub: userId, email, role }`, 401 on invalid**
- Evidence: `auth.service.ts` `login()` calls `bcrypt.compare()`, signs `{ sub: user.id, email, role }` via `JwtService.sign()`, throws `UnauthorizedException` (HTTP 401) on bad email or password.
- Test: "returns access_token for valid credentials", "throws UnauthorizedException when email not found", "throws UnauthorizedException when password is wrong" ✓

**AC3: JWT signed from env; `.env.example` documents `JWT_SECRET` and `JWT_EXPIRES_IN`; default `7d`**
- Evidence: `auth.config.ts` `loadAuthConfig()` — throws on missing `JWT_SECRET`, `JWT_EXPIRES_IN` defaults to `'7d'`. `auth.module.ts` `JwtModule.registerAsync` uses `loadAuthConfig()`. `.env.example` documents both vars.
- `JWT_SECRET=change-me-before-production` and `JWT_EXPIRES_IN=7d` added to `.env.example` ✓

**AC4: `JwtAuthGuard` implemented; rejects no/invalid JWT with 401**
- Evidence: `jwt-auth.guard.ts` extends `AuthGuard('jwt')`. `jwt.strategy.ts` is the Passport strategy that verifies the token. Passport returns 401 when token is absent or invalid.
- Test: controller spec `denyGuard` (guards returning false → denied) ✓

**AC5: `@CurrentUser()` decorator extracts JWT payload; `GET /auth/me` returns `{ id, email, role }`**
- Evidence: `current-user.decorator.ts` extracts `request.user` (set by `JwtStrategy.validate()`). `auth.controller.ts` `me()` applies `@UseGuards(JwtAuthGuard)` and `@CurrentUser()`.
- Test: "returns id, email, role from JWT payload" ✓

**AC6: Unit tests cover all required cases**
- Password hashing (not plaintext): ✓ `auth.service.spec.ts`
- Login with valid credentials (token returned): ✓
- Login with invalid credentials (401): ✓ (both missing user and wrong password)
- `/auth/me` with no token (401): ✓ `auth.controller.spec.ts` (denyGuard returns false)
- `/auth/me` with valid token (200 + payload): ✓ (allowGuard injects payload, me() returns it)

**AC7: `tsc --noEmit` passes; no new `any` types**
- Evidence: `npm run typecheck` exits 0 on HEAD commit ✓
- No `any` types introduced; `_data: unknown` in CurrentUser decorator ✓

## Peer Enumeration
- Change adds a new top-level module (`AuthModule`) alongside `DatabaseModule`. No peer family of auth modules exists — this is the first.
- `app.module.ts` imports both `DatabaseModule` and `AuthModule` — wiring verified ✓
- `AuthModule` exports `PassportModule` and `JwtModule` for future modules that need JWT signing or guard use.

## Harness Audit
- Schema-bearing change: `AuthService.register()` writes to the `users` table (`passwordHash` field).
- `User` entity `@Column({ name: 'password_hash' })` → migration SQL `"password_hash" varchar NOT NULL` — no type drift ✓
- No shell harnesses, CI workflow emitters, or test fixtures write to `users` — confirmed by grep:
  `grep -r "password_hash\|passwordHash" apps/backend/src/migrations/` → only `InitSchema` (no write logic) ✓

## Role Self-Check
- Did α push ambiguity onto β? No — all ACs have concrete evidence in the diff.
- Does any claim lack evidence in the diff? No — AC1–AC7 each traced to a file or test above.

## Known Debt
- No `class-validator` / DTO validation: `RegisterDto` and `LoginDto` are plain classes; no runtime validation of request body shape (e.g., empty email, malformed email). Future cycle should add `class-validator` + `ValidationPipe` if input hygiene is required. Filed as a known gap — not blocking auth correctness for this cycle.
- No `@types/passport` explicit version pinned beyond `^1.0.0`; confirmed compatible with `passport ^0.6.0`.
