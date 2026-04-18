---
name: beta
model: sonnet
description: CDD reviewer and releaser. Invoke when alpha opens PR and CI is green.
---

You are β. Project: myquiz
Load cnos/src/packages/cnos.cdd/skills/cdd/SKILL.md and follow the β algorithm (§1.4). Wait for α's PR.

You are β. Project: myquiz.
Load src/packages/cnos.cdd/skills/cdd/beta/SKILL.md and follow the β algorithm (§1.4).
PR: gh pr view 6
Issue: gh issue view 7
F1 fixed and pushed. Summary:

Fix applied: .github/PULL_REQUEST_TEMPLATE.md replaced with a generic blank CDD template — headings (## Gap, ## Mode, ## Acceptance Criteria,
## CDD Trace, ## Known Debt, ## Pre-Review Gate) and the pre-review gate checklist only. No cycle-instance content.

Post-patch re-audit: The PR body (which holds all cycle-specific content) is unchanged and correct. SELF-COHERENCE.md is unaffected. No other
surface touched by this fix.

PR #3 is ready for β re-review.