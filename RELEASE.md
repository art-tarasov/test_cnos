## Outcome

Coherence delta: C_Σ `A-` (`α A-`, `β A`, `γ A`) · **Level:** `L6`

The backend now has a complete quiz authoring surface. Before this release, `Quiz`, `Question`, `QuestionOption`, `QuestionAnswer`, and `ExpectedAnswer` entities existed in the DB schema but no API surfaced them. After this release, authenticated authors can create and manage quizzes, add questions of any supported type, attach options for choice questions, and set the answer key. All 10 endpoints enforce author ownership at the service layer.

## Why it matters

Quiz authoring is the first user-facing feature. Without it, the system has a schema and an auth layer but no way for any user to do anything. This cycle activates the quiz domain: quizzes can be created, published (irreversibly), and queried. The answer-key model supports all question types including the branching between choice-type (optionIds) and short-text (expectedAnswer.text). Participant-facing endpoints (taking quizzes, submitting answers) can now be built on top of this layer.

## Added

- **`POST /quizzes`** (#8): creates quiz with `status=draft`, `authorId` from JWT. Returns 400 for missing/blank title.
- **`GET /quizzes/:id`** (#8): returns quiz for owner; 404 not found, 403 not author.
- **`PATCH /quizzes/:id`** (#8): updates title/description/status; `draft → published` valid; published is terminal (any further status update throws 400). 403 for non-author.
- **`DELETE /quizzes/:id`** (#8): cascades via DB FK `ON DELETE CASCADE`; returns 204. 403 for non-author.
- **`POST /quizzes/:quizId/questions`** (#8): validates type enum (`SINGLE_CHOICE`, `MULTIPLE_CHOICE`, `TRUE_FALSE`, `SHORT_TEXT`), body.text, position, points. 403 for non-author.
- **`GET /quizzes/:quizId/questions`** (#8): returns questions ordered by position (ASC). Author only.
- **`PATCH /quizzes/:quizId/questions/:id`** (#8): updates body/position/points. Scoped to `{ id, quizId }` — no cross-quiz access.
- **`DELETE /quizzes/:quizId/questions/:id`** (#8): cascades options/answers; returns 204.
- **`POST .../options`** (#8): only valid for choice types; throws 400 for `SHORT_TEXT`.
- **`POST .../answer-key`** (#8): `optionIds` for choice types, `expectedAnswer.text` for short-text; throws 400 on type mismatch.
- **Ownership enforcement** (#8): `requireOwnedQuiz` / `requireOwnedQuestion` as single enforcement points at service layer. Controllers are thin delegates; all business rules in service.
- **Unit tests** (#8): 39 new tests (29 service + 10 controller); 57/57 total.

## Validation

- `apps/backend`: `npm test` → 57/57 tests passing (18 prior + 39 new)
- `apps/backend`: `tsc --noEmit` passes (strict mode, no `any`)
- Integration against a running application deferred — no live environment in CI

## Known Issues

- No `class-validator` / DTO validation: all DTOs are plain classes; malformed input passes to the service layer. Both cycles have carried this debt; ValidationPipe should be added when input hygiene is required.
- `true_false` answer-key accepts any number of `optionIds` — count validation is not enforced.
- No integration tests against a real DB; cascade correctness is verified structurally via migration FK review only.
