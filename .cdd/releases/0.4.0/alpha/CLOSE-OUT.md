---
role: alpha
cycle: 0.4.0
issue: 8
pr: 9
date: 2026-04-18
---

# α Close-Out — Cycle 0.4.0

## F1 — Test count in PR body (mechanical)

**What happened:** PR body stated "56 passed (28 new)". The 28 came from the service spec count, which I had in mind as the primary test artifact. The controller spec added 10 more tests (not 9 as I estimated while writing); I did not verify the actual count before writing the evidence line.

**Root cause:** I wrote the PR body evidence before confirming the final test total. The service spec had 28 tests — I knew this figure and used it. I did not re-run the suite and check the total new-test count at the time of writing the PR body. When I added the controller spec, I updated neither the PR body nor the SELF-COHERENCE.md evidence row.

**Pattern match:** This is the same class as β's observation — a diligence gap, not a skill coverage gap. The fix was mechanical (run `npm test`, read the total, update the line). No new gate needed at this cycle; if this recurs in 0.5.0 a concrete check step is warranted.

## F2 — published → published bypasses status guard (judgment)

**What happened:** The guard I wrote was `if (quiz.status === PUBLISHED && newStatus !== PUBLISHED)`. This explicitly blocks downgrade but silently passes `published → published` as a no-op DB write. AC3 says "Valid status transitions: `draft → published`" — one valid transition, which implies `published` is terminal, not merely non-downgradeable.

**Root cause:** I framed the guard around "what should I prevent" (downgrade) rather than "what is the only allowed transition." The distinction:
- Prevent-specific-bad: `if (published && newStatus !== published) → throw` — misses same-state
- Enforce-only-good: `if (published) → throw` — correct; terminal state, no further transitions

The former framing is natural when reading "Returns 400 for invalid status value" and focusing on the enum check. The latter framing is correct when reading "Valid status transitions: `draft → published`" as an exhaustive list. I applied the weaker framing.

**Observation not in the assessment:** The AC has two validation sentences that pull in slightly different directions — "Returns 400 for invalid status value" (focuses on enum) and "Valid status transitions: `draft → published`" (focuses on allowed paths). A reader who addresses only the first may implement the weaker guard. For future issues, stating "published is a terminal state" explicitly in the invariants section would prevent the ambiguity. Worth noting to γ for issue authoring.

## No additional findings

Implementation was correct on first pass across the substantive concerns: ownership at service layer exhaustive, cascade verified via migration FK, 403-not-404 invariant met, TypeScript strict compliance, no `any`. Both findings were in the evidence/guard layer, not the domain logic. Cycle closed cleanly in one fix commit.
