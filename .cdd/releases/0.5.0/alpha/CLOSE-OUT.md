---
role: alpha
cycle: 0.5.0
issue: 10
pr: 11
date: 2026-04-18
---

# α Close-Out — Cycle 0.5.0

## F1 — Vite cache files committed in bootstrap (mechanical)

**What happened:** `apps/frontend/.vite/deps/` (8 files) appeared in the branch diff. These are Vite's pre-bundled dependency cache — generated at dev-server startup, not source files.

**Root cause:** The bootstrap commit used `git add -A`, which staged every untracked file in the working tree. The `.vite/` directory was untracked but present (the dev server had been run at some point), so it was swept in. I did not review `git status` before committing to verify the staged set matched the intended scope.

**Pattern:** "Stage broadly, verify never." The bootstrap commit had one job: create the version-directory stubs. The correct staging was `git add .cdd/releases/0.5.0/`. Using `git add -A` without a pre-commit scope check is the mechanical error.

**Fix applied:** `git rm --cached -r apps/frontend/.vite/`; `.vite/` added to `.gitignore`. Committed in the RC fix pass.

---

## F2 — Stale agent definition content committed (mechanical)

**What happened:** `.claude/agents/alpha.md`, `beta.md`, and `gamma.md` contained per-cycle state from prior cycles — old PR numbers, issue numbers, RC status messages, duplicate lines — and were committed to the branch.

**Root cause:** Same `git add -A` sweep as F1. These files existed in `.claude/agents/` with accumulated stale content from prior sessions. They were untracked on main and got committed wholesale.

Two separable sub-causes:

1. **Staging cause** — same as F1: broad staging without scope review.
2. **Content cause** — the agent definition files were being mutated with per-cycle runtime state rather than staying stable as role templates. Agent definitions should contain only the stable dispatch format; cycle-specific state (PR number, current RC status, issue number) belongs in the invocation prompt, not the file on disk.

**Fix applied:** Content reset to stable role prompts (frontmatter + base dispatch format only). `.claude/settings.local.json` also removed from tracking and added to `.gitignore` — same sweep root cause.

**Collateral finding during fix:** `git rm --cached -r cnos/` over-deleted 4 skill stubs that were already tracked on `main` (`cnos/src/packages/cnos.cdd/skills/cdd/{alpha,beta,gamma,issue}/SKILL.md`). Required a recovery commit (`git checkout main -- <files>`). Root cause: I ran the removal at the `cnos/` root without first verifying which cnos files were already on main. Correct procedure: check `git ls-tree -r --name-only main | grep "^cnos/"` before bulk-removing a directory from tracking.

---

## Pattern match across both findings

Both F1 and F2 trace to the same root: **bootstrap commit used `git add -A` without reviewing the staged set.** The bootstrap commit has one intended scope (the version-directory stubs); anything beyond that scope is noise. The discipline gap is not knowing the rule but not applying it mechanically.

**MCA for future bootstrap commits:** Stage explicitly by path (`git add .cdd/releases/<version>/`) rather than using `git add -A`. Review `git status` before committing — verify staged set matches intended scope. If `git add -A` is used for a later implementation commit, the scope is wider and the review burden is higher; still required.

This is distinct from F1 in cycle 0.4.0 (writing evidence before verifying the count). That finding was in the evidence layer at review time. These findings are in the staging layer at commit time. Different phase, same underlying gap: mechanical verification step skipped.

---

## No additional findings

Implementation was correct on first pass: all 7 ACs met, 80 tests pass, `tsc --noEmit` clean, schema audit complete, no answer-key leakage, no `any`. Both RC findings were in the commit hygiene layer, not the domain logic or test coverage layer.
