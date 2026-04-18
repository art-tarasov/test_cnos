# Self-Coherence — quiz-authoring 0.4.0

**Issue:** #8 — Quiz authoring CRUD — quizzes and questions
**Version:** 0.4.0
**Mode:** MCA

## Active Skills

**Tier 1:** CDD.md, alpha/SKILL.md
**Tier 2:** coding, design-principles, ship, testing, documenting, process-economics, rca, follow-up, writing, skill
**Tier 3:** typescript, architecture-evolution

## AC-by-AC Check

| AC | Claim | Evidence |
|----|-------|----------|
| AC1 | `POST /quizzes` creates quiz with `status=draft`, `authorId=currentUser.id`, returns 400 for missing title | `quiz.service.ts:createQuiz` — sets `status: QuizStatus.DRAFT`, `authorId: userId`; throws `BadRequestException` on empty title. Tests: "creates quiz with draft status and authorId", "throws 400 when title is missing" |
| AC2 | `GET /quizzes/:id` returns quiz, 404 if not found, 403 if not author | `quiz.service.ts:requireOwnedQuiz` — `NotFoundException` when `findOne` returns null, `ForbiddenException` when `authorId !== userId`. Tests: "returns quiz for owner", "throws 404 when quiz not found", "throws 403 (not 404) when requester is not the author" |
| AC3 | `PATCH /quizzes/:id` updates title/description/status, valid transition draft→published, 400 for invalid status, 403 if not author | `quiz.service.ts:updateQuiz` — validates against `VALID_STATUSES` set; `published` is terminal: any `status` attempt when quiz is already published throws 400. Tests: "allows draft→published transition", "throws 400 for invalid status value", "throws 400 for published→draft (terminal state)", "throws 400 for published→published (terminal state)", "throws 403 when requester is not the author" |
| AC4 | `DELETE /quizzes/:id` cascades, 204, 403 if not author | `quiz.service.ts:deleteQuiz` — `requireOwnedQuiz` then `quizzes.delete({id})`. DB FK `ON DELETE CASCADE` handles cascade: questions→options→answers→expected_answers. Migration confirmed. Test: "deletes quiz for owner", "throws 403 when requester is not the author" |
| AC5 | `POST /quizzes/:quizId/questions` validates type enum, required fields, 403 if not author | `quiz.service.ts:createQuestion` — validates type against `VALID_QUESTION_TYPES` set, checks `body.text`, `position`, `points`. Tests: "throws 400 for missing type", "throws 400 for invalid type enum value", "throws 400 for missing body.text", "throws 403 when requester is not the author" |
| AC6 | `GET /quizzes/:quizId/questions` returns questions ordered by position, author only | `quiz.service.ts:listQuestions` — `questions.find({ where: { quizId }, order: { position: 'ASC' } })`. Test: "returns questions ordered by position for owner", verifies `order: { position: 'ASC' }` argument |
| AC7 | `PATCH /quizzes/:quizId/questions/:questionId` updates body/position/points, 404 if not found within quiz | `quiz.service.ts:updateQuestion` via `requireOwnedQuestion` which passes `{ id: questionId, quizId }` to `findOne` — guarantees question belongs to quiz. Test: "updates question fields", "throws 404 when question not found within quiz" |
| AC8 | `DELETE /quizzes/:quizId/questions/:questionId` cascades, 204 | `quiz.service.ts:deleteQuestion` — `questions.delete({id})`. DB FK cascades to options/answers/expected_answers. Test: "deletes question for owner" |
| AC9 | `POST .../options` only valid for choice types, 400 for short_text | `quiz.service.ts:createOption` — `if (question.type === QuestionType.SHORT_TEXT) throw BadRequestException`. Test: "creates option for choice question", "throws 400 for short_text question type" |
| AC10 | `POST .../answer-key` sets correct store by type, 400 for type mismatch | `quiz.service.ts:setAnswerKey` — branches on `QuestionType.SHORT_TEXT` vs `CHOICE_TYPES`, rejects cross-type body fields. Tests: "sets answer key with optionIds for choice question", "sets expected answer for short_text question", "throws 400 for type mismatch: optionIds on short_text", "throws 400 for type mismatch: expectedAnswer on choice question" |
| AC11 | Author ownership enforced at service layer — 403 not 404 | `requireOwnedQuiz` in `quiz.service.ts` is the single enforcement point for all write/read operations. Controllers contain no ownership logic. All service tests use `OTHER_ID` to verify `ForbiddenException` from the service directly (not via controller). |
| AC12 | `tsc --noEmit` passes, no new `any` types | `npm run typecheck` output: clean. No `any` introduced; `unknown` used where needed; `as unknown as T` limited to test fixtures only. |

## Role Self-Check

- Did α push ambiguity onto β? No. All ACs are proven by test evidence in this document.
- Are all claims backed by evidence in the diff? Yes — each AC row cites the exact file+method+test.
- Is cascade delete structurally guaranteed? Yes — DB FK `ON DELETE CASCADE` confirmed in migration (not just asserted in code).
- Is there any ownership enforcement at controller layer only? No — `requireOwnedQuiz` is called inside every service method that touches quiz state or data.

## Peer Enumeration

The issue touches one family of surfaces: quiz domain endpoints. No pre-existing sibling commands/controllers existed before this branch. No peer drift applies.

## Harness Audit

No schema-bearing contract changes — no new migrations, no new entities. The 5 existing entity files are imported but not modified. No CI harnesses or shell fixtures write entity shapes.

## Schema / Entity Audit

`QuestionAnswer` entity uses `@PrimaryColumn({ type: 'uuid' })` on both `questionId` and `optionId` — matches migration SQL `uuid NOT NULL`. No decorator inconsistency. Other entities' `@PrimaryGeneratedColumn('uuid')` + explicit `type: 'uuid'` on FK columns match migration column types throughout.

## Known Debt

- No input validation library (class-validator / ValidationPipe) — manual validation only, per issue non-goals. Field validation is basic: present/non-empty check, enum membership check.
- `true_false` question type: answer-key uses `optionIds` (same as single_choice/multiple_choice). No count validation (e.g. exactly 1 for true_false). Not in scope per issue ACs.
- No integration tests against a real database — unit tests mock all repositories. Contract between DB cascade and service-layer delete is validated structurally (migration FK review) not dynamically.
