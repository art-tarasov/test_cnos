# Release 0.5.0

## Outcome

Coherence delta: C_Σ `A-` (`α A-`, `β A`, `γ A-`) · **Level:** `L6`

The participant-facing layer is now operational. A quiz that was previously only accessible to its author can now be taken by any authenticated user: they fetch a sanitised view (no answer keys), submit all answers in one request, and receive a scored result. DTO validation debt carried since 0.3.0 is retired — all eight existing request DTOs now enforce structure at the framework level.

## Why it matters

The project existed in a state where quiz authoring was complete but unusable from the participant side. This cycle closes the first consumer of published quizzes and establishes the answer-scoring contract (all-or-nothing per question, exact set match for choice types, case-insensitive for short text). Answer key non-leakage is enforced structurally — by both TypeScript interface exclusion and relation-loading exclusion — making accidental disclosure hard to introduce.

## Added

- **`GET /quizzes/:id/participate`** (#10): sanitised quiz view — questions ordered by position, options for choice types, no answer keys. 404/403 guards.
- **`POST /quizzes/:id/attempts`** (#10): single-request submission with coverage validation, per-type scoring, persistence, and scored result. 400 on coverage or duplicate errors; 403 on draft quiz.
- **`GET /quizzes/:id/attempts/:attemptId`** (#10): retrieve stored attempt result. 403 ownership guard.
- **`QuizAttempt` + `AttemptAnswer` entities and migration** (#10): both tables with FK constraints and ON DELETE CASCADE. Migration reversible.
- **DTO validation** (#10): `class-validator ^0.15.1` + `class-transformer ^0.5.1`; `ValidationPipe({ whitelist: true, forbidNonWhitelisted: true })` global; all 8 existing DTOs wrapped.
- **17 new unit tests** (#10): 80/80 total.

## Validation

- 80/80 tests pass (`npm test` in `apps/backend`).
- `tsc --noEmit` exits 0 — no type errors, no `any` introduced.
- Answer-key leakage invariant verified by test: `Object.keys(resultQ1)` does not contain `answers` or `expectedAnswers`.

## Known Issues

None.
