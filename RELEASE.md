## Outcome

Coherence delta: C_Σ `A-` (`α A-`, `β A`, `γ A-`) · **Level:** `L6`

The backend now has a working authentication layer. Before this release, `User.passwordHash` was never written, there was no JWT infrastructure, and every endpoint requiring an authenticated identity was blocked. After this release, `POST /auth/register` and `POST /auth/login` are functional, JWT is issued on login, `JwtAuthGuard` and `@CurrentUser()` are available for future controllers, and auth config is sourced strictly from env vars with explicit failure on missing `JWT_SECRET`.

## Why it matters

Auth is the prerequisite for all quiz features. No "create quiz," "submit answer," or "view results" endpoint can be built securely without knowing who the caller is. This cycle closes the dependency that blocked all feature work. The implementation uses standard NestJS/Passport patterns with no new architectural abstractions — the auth module slots into the existing NestJS module graph with minimal coupling.

## Added

- **`POST /auth/register`** (#6): accepts `{ email, password }`, creates `User` with bcrypt hash (12 rounds), returns `{ id, email, role }`. Returns 409 on duplicate email.
- **`POST /auth/login`** (#6): verifies credentials against stored hash, returns signed JWT `{ sub: userId, email, role }`. Returns 401 on invalid credentials. Error message identical for missing user and wrong password (no user enumeration).
- **`JwtAuthGuard`** (#6): `extends AuthGuard('jwt')`. Apply with `@UseGuards(JwtAuthGuard)` on any route to require a valid JWT. Returns 401 on absent or invalid token.
- **`@CurrentUser()` decorator** (#6): extracts `JwtPayload` (`{ sub, email, role }`) from the authenticated request. For use in future controllers.
- **`GET /auth/me`** (#6): smoke-test for the full auth flow — protected by `JwtAuthGuard`, returns `{ id, email, role }` from the JWT payload.
- **Auth config** (#6): `auth.config.ts` reads `JWT_SECRET` (required, throws on missing) and `JWT_EXPIRES_IN` (optional, defaults to `7d`). `.env.example` documents both vars.
- **Unit tests** (#6): 10 new tests (18/18 total) — service (register/hash/login/invalid), controller (register/login pass-through, me with valid token, guard deny behavior).

## Validation

- `apps/backend`: `npm test` → 18/18 tests passing (8 prior + 10 new)
- `apps/backend`: `tsc --noEmit` passes (strict mode, no `any`)
- Full integration against a running application (JWT issuance and validation end-to-end) deferred — no live environment in CI

## Known Issues

- No `class-validator` / DTO validation: `RegisterDto` and `LoginDto` accept any body shape. Malformed input passes to the service layer. Future cycle should add `ValidationPipe` when input hygiene is required (explicit known debt — not blocking auth correctness).
