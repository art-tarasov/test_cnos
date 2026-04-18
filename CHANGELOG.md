# Changelog

## Release Coherence Ledger

| Version | C_Σ | α | β | γ | Level | Coherence note |
|---------|-----|---|---|---|-------|----------------|
| 0.5.0 | A- | A- | A | A- | L6 (cycle: L6) | Participation layer added: GET /quizzes/:id/participate, POST /quizzes/:id/attempts (scored), GET /quizzes/:id/attempts/:attemptId. DTO validation (class-validator + ValidationPipe) backfilled across all 8 existing request DTOs. Two C mechanical findings at review (F1: .vite/ cache committed; F2: stale per-cycle state in .claude/agents/ definitions). Both fixed in RC; .gitignore patched. 80/80 tests pass. |
| 0.4.0 | A- | A- | A | A | L6 (cycle: L6) | Quiz authoring CRUD added: 10 endpoints (quizzes + questions + options + answer key), ownership at service layer, cascade delete via DB FK. Two findings at review (F1 C mechanical: PR body test count undercounted controller spec; F2 C judgment: published→published not blocked — AC3 terminal state not enforced). Both fixed in RC; published now terminal, 57/57 tests pass. |
| 0.3.0 | A- | A- | A | A- | L6 (cycle: L6) | Auth layer added: JWT registration + login, JwtAuthGuard and @CurrentUser() for future controllers. Two findings at review (F1 C mechanical: Tier classification cross-surface conflict in SELF-COHERENCE.md; F2 B judgment: dead test setup). Both fixed in RC. γ dispatch had transposed PR/issue numbers. |
| 0.2.0 | A- | A- | A | A | L6 (cycle: L6) | Persistence layer established: TypeORM + PostgreSQL, six entities in 4NF, initial migration, health endpoint extended. Four mechanical findings (3B, 1A) reached review — FK type annotation drift, bootstrap ordering, CLI env var consistency, README omission. |
| 0.1.0 | A- | A- | A | A- | L6 | First application skeleton: NestJS backend + React/Vite frontend exist and are locally runnable. Monorepo workspace wiring established. PR template surface was corrected (F1: instance content in template file). |

---

## 0.5.0 — 2026-04-18

### Added

- **`GET /quizzes/:id/participate`** (#10): returns a published quiz with questions (ordered by position) and options for choice types. No answer key leakage — `QuestionAnswer.optionId` and `ExpectedAnswer.body` are never loaded or serialised. Returns 404 if quiz not found; 403 if quiz is draft. Auth required.
- **`POST /quizzes/:id/attempts`** (#10): accepts a single-request submission `{ answers: [{ questionId, optionIds?, textAnswer? }] }`. Validates full question coverage and no duplicate `questionId` (400 on violation). Scores: choice types (`single_choice`, `multiple_choice`, `true_false`) use exact `optionId` set match; `short_text` uses case-insensitive `textAnswer` compare. Persists `QuizAttempt` + `AttemptAnswer`; returns `{ attemptId, score, maxScore, answers: [{ questionId, correct, pointsAwarded }] }`. Auth required.
- **`GET /quizzes/:id/attempts/:attemptId`** (#10): returns stored attempt result for the owning participant. 404 if not found; 403 if requester is not the participant who made the attempt. Auth required.
- **`QuizAttempt` entity** (#10): `id uuid`, `quizId uuid`, `participantId uuid`, `score int`, `maxScore int`, `submittedAt timestamp`. FK → `quizzes` with ON DELETE CASCADE.
- **`AttemptAnswer` entity** (#10): `id uuid`, `attemptId uuid`, `questionId uuid`, `optionIds jsonb nullable`, `textAnswer varchar nullable`, `correct boolean`, `pointsAwarded int`. FK → `quiz_attempts` with ON DELETE CASCADE.
- **Migration `1776470400000-AddAttemptTables`** (#10): creates both tables with PK/FK constraints. Reversible (`down()` present).
- **DTO validation** (#10): `class-validator ^0.15.1` + `class-transformer ^0.5.1` added. `ValidationPipe({ whitelist: true, forbidNonWhitelisted: true })` configured globally in `main.ts`. All 8 existing request DTOs wrapped: `RegisterDto`, `LoginDto`, `CreateQuizDto`, `UpdateQuizDto`, `CreateQuestionDto`, `UpdateQuestionDto`, `CreateOptionDto`, `SetAnswerKeyDto`.
- **Unit tests** (#10): 17 new tests (13 service + 4 controller); 80/80 total.

---

## 0.4.0 — 2026-04-18

### Added

- **`POST /quizzes`** (#8): creates quiz with `status=draft`, `authorId` from JWT. Returns 400 for missing/blank title.
- **`GET /quizzes/:id`** (#8): returns quiz for owner. 404 if not found, 403 if not author.
- **`PATCH /quizzes/:id`** (#8): updates title/description/status. `draft → published` valid; published is terminal (any further status change throws 400). 403 for non-author.
- **`DELETE /quizzes/:id`** (#8): cascades to questions/options/answers/expected-answers via DB FK `ON DELETE CASCADE`. Returns 204. 403 for non-author.
- **`POST /quizzes/:quizId/questions`** (#8): validates type enum and required fields (body.text, position, points). 403 for non-author.
- **`GET /quizzes/:quizId/questions`** (#8): returns questions ordered by position (ASC). Author only.
- **`PATCH /quizzes/:quizId/questions/:id`** (#8): updates body/position/points. `requireOwnedQuestion` scopes findOne to `{ id, quizId }` — no cross-quiz access.
- **`DELETE /quizzes/:quizId/questions/:id`** (#8): cascades to options/answers. Returns 204.
- **`POST /quizzes/:quizId/questions/:id/options`** (#8): only valid for `SINGLE_CHOICE`, `MULTIPLE_CHOICE`, `TRUE_FALSE`. Throws 400 for `SHORT_TEXT`.
- **`POST /quizzes/:quizId/questions/:id/answer-key`** (#8): sets correct answer by type — `optionIds` for choice types, `expectedAnswer.text` for short-text. Throws 400 on type mismatch.
- **Ownership at service layer** (#8): `requireOwnedQuiz` / `requireOwnedQuestion` are the single enforcement points. Controllers contain no ownership logic. Non-owners receive 403, not 404.
- **Unit tests** (#8): 39 new tests (29 service + 10 controller); 57/57 total.

---

## 0.3.0 — 2026-04-18

### Added

- **`POST /auth/register`** (#6): accepts `{ email, password }`, creates `User` with bcrypt hash (12 rounds), returns `{ id, email, role }`. Returns 409 on duplicate email.
- **`POST /auth/login`** (#6): verifies credentials, returns signed JWT `{ sub: userId, email, role }`. Returns 401 on invalid credentials (message identical for missing user and wrong password — no user enumeration).
- **`JwtAuthGuard`** (#6): `extends AuthGuard('jwt')`. Apply with `@UseGuards(JwtAuthGuard)` to require a valid JWT. Returns 401 on absent or invalid token.
- **`@CurrentUser()` decorator** (#6): extracts `JwtPayload` from the authenticated request. Available for future controllers.
- **`GET /auth/me`** (#6): protected endpoint; returns `{ id, email, role }` from the JWT payload.
- **Auth config** (#6): `auth.config.ts` reads `JWT_SECRET` (required, throws on missing) and `JWT_EXPIRES_IN` (optional, defaults `7d`). `.env.example` updated with both vars.
- **Unit tests** (#6): 10 new tests (18/18 total) — service: register/hash/login/invalid; controller: register/login pass-through, me with valid token, guard deny behavior.

---

## 0.2.0 — 2026-04-18

### Added

- **PostgreSQL + TypeORM integration** (#4): `DatabaseModule` connects via env vars (DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME); startup throws clearly on missing vars; `retryAttempts: 3` bounds hang on DB-unreachable.
- **Six entities in 4NF** (#4): `User`, `Quiz`, `Question`, `QuestionOption`, `QuestionAnswer` (composite PK), `ExpectedAnswer`. All `body` fields `jsonb`. FK constraints on both `QuestionAnswer` columns. camelCase TypeScript / snake_case DB columns.
- **Initial migration** (#4): `1776384000000-InitSchema` — creates all tables, enums, PK/FK/unique constraints. Runnable via `npm run migration:run` from `apps/backend`.
- **`.env.example`** (#4): Documents all required DB env vars with local defaults.
- **Health endpoint DB check** (#4): `GET /health` now returns `{"status":"ok","db":"ok"}` when healthy or `{"status":"degraded","db":"error"}` when DB unreachable.
- **Unit tests** (#4): 8 tests across 3 suites — DB health mock (both paths), entity enum values, `QuestionAnswer` composite key field independence.

---

## 0.1.0 — 2026-04-17

### Added

- **NestJS backend scaffold** (#2): `apps/backend` bootstraps a NestJS application. `npm run start:dev` starts the server on port 3000. Includes `GET /health` returning `{"status":"ok"}` with a passing unit test.
- **React + Vite frontend scaffold** (#2): `apps/frontend` bootstraps a React application. `npm run dev` starts the Vite dev server. Strict TypeScript, null-safe root mount.
- **Root monorepo workspace** (#2): Root `package.json` with npm workspaces `apps/*`. Each app owns its own dependencies. Root owns workspace wiring only.
- **Root README** (#2): Documents layout, prerequisites (Node 20+, npm 9+), and how to run each app locally.
- **CDD process surface** (#2): `.github/PULL_REQUEST_TEMPLATE.md` (generic blank CDD template), snapshot at `docs/alpha/monorepo-foundation/0.1.0/`.
