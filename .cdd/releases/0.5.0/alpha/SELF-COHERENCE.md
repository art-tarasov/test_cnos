---
role: alpha
cycle: 0.5.0
issue: 10
date: 2026-04-18
---

# Self-Coherence — Cycle 0.5.0

## Issue

#10 — Quiz taking: participant flow, answer submission, and DTO validation

## Version / mode

MCA — new feature closing two known gaps: participant flow (first consumer of published quizzes) and DTO validation debt carried from 0.3.0.

## Active skills

**Tier 1:** CDD.md, alpha/SKILL.md

**Tier 2:** coding, design-principles, ship, testing, documenting, process-economics, rca, follow-up, writing, skill

**Tier 3:** eng/typescript, eng/architecture-evolution

## AC-by-AC check

### AC1 — DTO validation

**Claim:** `class-validator` and `class-transformer` added; `ValidationPipe` configured globally with `whitelist: true`, `forbidNonWhitelisted: true`; all existing request bodies wrapped in class-validator DTOs; existing tests pass; validation errors return 400.

**Evidence:**
- `apps/backend/package.json` — `class-validator: ^0.15.1`, `class-transformer: ^0.5.1` in dependencies
- `apps/backend/src/main.ts` — `app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))`
- `apps/backend/src/auth/dto/register.dto.ts` — `@IsEmail`, `@IsString`, `@MinLength(1)`
- `apps/backend/src/auth/dto/login.dto.ts` — `@IsEmail`, `@IsString`, `@MinLength(1)`
- `apps/backend/src/quiz/dto/create-quiz.dto.ts` — `@IsString`, `@IsNotEmpty`, `@IsOptional`
- `apps/backend/src/quiz/dto/update-quiz.dto.ts` — `@IsOptional`, `@IsIn(QuizStatus values)`
- `apps/backend/src/quiz/dto/create-question.dto.ts` — `@IsIn(QuestionType values)`, `@ValidateNested body`, `@IsInt position/points`
- `apps/backend/src/quiz/dto/update-question.dto.ts` — optional variants with `@IsOptional`
- `apps/backend/src/quiz/dto/create-option.dto.ts` — `@ValidateNested body`, `@IsInt position`
- `apps/backend/src/quiz/dto/set-answer-key.dto.ts` — `@IsArray @IsUUID optionIds`, `@ValidateNested expectedAnswer`
- All 9 test suites pass (80 tests total) — grep confirms: `Tests: 80 passed`

**Status: MET**

### AC2 — GET /quizzes/:id/participate

**Claim:** Returns published quiz with questions (ordered by position) and options for choice types; no answer key leakage; 404 if not found, 403 if draft.

**Evidence:**
- `participation.controller.ts:14` — `@Get(':id/participate')` bound to `getParticipateView`
- `participation.service.ts` — `getParticipateView`: loads quiz, throws `NotFoundException` if null, throws `ForbiddenException` if `DRAFT`; maps questions sorted by position; options mapped without `answers`/`expectedAnswers` fields
- AC6 invariant: response interface `ParticipateQuestion` has no `answers` or `expectedAnswers` fields — the shape is defined at lines 21-29 of participation.service.ts
- Test evidence: `participation.service.spec.ts` — "returns published quiz with questions and options, no answer keys" (checks `Object.keys(resultQ1)` does not contain 'answers' or 'expectedAnswers'), "throws NotFoundException", "throws ForbiddenException for draft", "orders questions by position" — all 4 pass

**Status: MET**

### AC3 — POST /quizzes/:id/attempts

**Claim:** Accepts single-request submission; validates every question has exactly one answer entry; scores; returns `{ attemptId, score, maxScore, answers: [{ questionId, correct, pointsAwarded }] }`.

**Evidence:**
- `participation.controller.ts:19-28` — `@Post(':id/attempts')` with `@Body() dto: SubmitAttemptDto`
- `participation/dto/submit-attempt.dto.ts` — `SubmitAttemptDto` with `@ValidateNested({ each: true }) answers`, `AnswerEntryDto` with `@IsUUID questionId`, optional `optionIds`/`textAnswer`
- `participation.service.ts` — `submitAttempt`: loads quiz/questions, calls `validateAnswerCoverage` (checks duplicate questionIds and missing coverage), scores each question via `scoreAnswer`, persists `QuizAttempt` + `AttemptAnswer` entities, returns `AttemptResult`
- Scoring logic in `scoreAnswer`: choice types compare sorted optionId sets (exact match → full points); short_text does case-insensitive `.toLowerCase()` comparison
- Test evidence: 8 tests in `submitAttempt` describe block — correct/incorrect single-choice, correct/incorrect short-text (case-insensitive), correct/incorrect multi-choice, missing-answer throws 400, duplicate-questionId throws 400, draft quiz throws 403, non-existent quiz throws 404 — all pass

**Status: MET**

### AC4 — GET /quizzes/:id/attempts/:attemptId

**Claim:** Returns stored attempt result; 403 if requester did not make the attempt.

**Evidence:**
- `participation.controller.ts:30-37` — `@Get(':id/attempts/:attemptId')` with `@CurrentUser() user`
- `participation.service.ts` — `getAttempt`: loads attempt by `{ id: attemptId, quizId }`, throws `NotFoundException` if null, throws `ForbiddenException` if `attempt.participantId !== requesterId`, returns `AttemptResult`
- Test evidence: "returns an attempt for the owning participant", "throws NotFoundException", "throws ForbiddenException when requester is not owner" — all pass

**Status: MET**

### AC5 — Persistence (QuizAttempt, AttemptAnswer, migration)

**Claim:** `QuizAttempt` (id, quizId, participantId, score, maxScore, submittedAt) and `AttemptAnswer` (id, attemptId, questionId, optionIds jsonb, textAnswer nullable, correct bool, pointsAwarded int) entities exist; migration covers both tables.

**Evidence:**
- `apps/backend/src/entities/quiz-attempt.entity.ts` — all 6 columns present; `@PrimaryGeneratedColumn('uuid')` id; `@Column uuid` quizId, participantId; `@Column int` score, maxScore; `@CreateDateColumn` submittedAt
- `apps/backend/src/entities/attempt-answer.entity.ts` — all 7 columns; `optionIds` typed `string[] | null` with `type: 'jsonb', nullable: true`; `textAnswer` `varchar nullable`; `correct` `boolean`; `pointsAwarded` `int`
- `apps/backend/src/migrations/1776470400000-AddAttemptTables.ts` — creates `quiz_attempts` and `attempt_answers` tables with FK constraints and ON DELETE CASCADE
- `data-source.ts` — both entities and migration registered
- `database.module.ts` — both entities included in `forRootAsync` entities array

**Schema audit (pre-review gate §2.6):**

| Entity decorator | Migration SQL column | Match? |
|---|---|---|
| `QuizAttempt.id` `@PrimaryGeneratedColumn('uuid')` | `"id" uuid NOT NULL DEFAULT uuid_generate_v4()` | ✅ |
| `QuizAttempt.quizId` `@Column({ type: 'uuid' })` | `"quiz_id" uuid NOT NULL` | ✅ |
| `QuizAttempt.participantId` `@Column({ type: 'uuid' })` | `"participant_id" uuid NOT NULL` | ✅ |
| `QuizAttempt.score` `@Column({ type: 'int' })` | `"score" integer NOT NULL` | ✅ |
| `QuizAttempt.maxScore` `@Column({ type: 'int' })` | `"max_score" integer NOT NULL` | ✅ |
| `QuizAttempt.submittedAt` `@CreateDateColumn` | `"submitted_at" TIMESTAMP NOT NULL DEFAULT now()` | ✅ |
| `AttemptAnswer.id` `@PrimaryGeneratedColumn('uuid')` | `"id" uuid NOT NULL DEFAULT uuid_generate_v4()` | ✅ |
| `AttemptAnswer.attemptId` `@Column({ type: 'uuid' })` | `"attempt_id" uuid NOT NULL` | ✅ |
| `AttemptAnswer.questionId` `@Column({ type: 'uuid' })` | `"question_id" uuid NOT NULL` | ✅ |
| `AttemptAnswer.optionIds` `@Column({ type: 'jsonb', nullable: true })` | `"option_ids" jsonb` | ✅ |
| `AttemptAnswer.textAnswer` `@Column({ type: 'varchar', nullable: true })` | `"text_answer" varchar` | ✅ |
| `AttemptAnswer.correct` `@Column({ type: 'boolean' })` | `"correct" boolean NOT NULL` | ✅ |
| `AttemptAnswer.pointsAwarded` `@Column({ type: 'int' })` | `"points_awarded" integer NOT NULL` | ✅ |

All 13 columns consistent.

**Status: MET**

### AC6 — No answer key leakage

**Claim:** `QuestionAnswer.optionId` values and `ExpectedAnswer.body` never appear in participate or attempt result responses.

**Evidence:**
- `ParticipateQuestion` interface (participation.service.ts:21-29) has only: `id, type, body, position, points, options` — no `answers`, no `expectedAnswers`
- `getParticipateView` maps questions via explicit property picks; `answers` and `expectedAnswers` relations are not loaded (no `relations` option in the `questionRepo.find` call for participate view — but to be safe, even if loaded, the mapping function only picks explicit fields)
- Actually: the service loads `relations: ['options']` for the participate view. `answers` and `expectedAnswers` are not in the relations array, so they are never fetched
- `AttemptResult` interface has `{ attemptId, score, maxScore, answers: AnswerResult[] }` where `AnswerResult = { questionId, correct, pointsAwarded }` — no optionId, no expectedAnswer body
- Test: "no answer key fields" check in service spec passes

**Status: MET (structurally enforced via interface + explicit relation loading)**

### AC7 — tsc --noEmit passes, no new `any`

**Evidence:**
- `npm run typecheck` exits 0 — zero TS errors
- Grep for `any` in new files: participation service uses `never` casts in test fixtures only; no `any` in production code

**Status: MET**

## Role self-check

Did α push ambiguity onto β? No:
- Every AC maps to concrete evidence
- Schema audit complete for both new entities
- Peer enumeration: no existing peer surfaces write to `quiz_attempts` or `attempt_answers` (new tables); no consumer drift possible
- Harness audit: `data-source.ts` and `database.module.ts` updated to include new entities/migration — two writers of the entity set, both updated

## Known debt

**Note on `@nestjs/class-validator`:** The issue specifies `@nestjs/class-validator` in AC1. This package is the deprecated predecessor of the current `class-validator` package (split and unmaintained since 2020). The modern NestJS documentation, including official NestJS docs, recommends `class-validator` directly. This implementation uses `class-validator ^0.15.1` + `class-transformer ^0.5.1` per current NestJS convention. If γ intended a specific older package, β should flag this as a scope question.

**No other known debt.**
