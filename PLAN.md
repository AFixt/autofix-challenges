# autofix-challenges — Backlog plan

As of 2026-11-28. Tier 6. Tracker: GitHub AFixt/autofix-challenges (default main; PRs go to develop).
Sources read: 1 open issue, 0 open PRs, memory `backlog/github/AFixt__autofix-challenges.md`, package.json,
local origin/develop@7b1d94a (2026-11-22), origin/main@2aa63f2 v0.0.1 (2026-11-22).
Not checked: whether `eslint-plugin-react-hooks` and `eslint-plugin-react-refresh` support ESLint 10. No fetch was run.

## Goal

ESLint and @eslint/js move to 10 (#10) with an unchanged, green `npm run check`.

## Definition of Done

- [ ] #10 closed: `eslint` ^10 and `@eslint/js` ^10 on develop, via a merged PR.
- [ ] `npm run check` passes on develop (eslint `--max-warnings 0`, knip, vite build).
- [ ] The 30-route smoke shows no DOM diff between base and head.
- [ ] `npm audit` reports no new advisory.
Nothing outside this list is required for Done.

## Current state

- Measured (issue): eslint 9.39.5 -> 10.15.0 and @eslint/js 9.39.5 -> 10.0.1 are the only outdated packages.
- No tests and no workflows. The gate is `npm run check` (memory).
- Memory: Karl's main checkout holds 3 unpushed local commits and a modified CLAUDE.md. Not session work. Do not touch.
- Local branches `chore/env-ignore-and-pr-review-note`, `chore/local-main-commits`, `security/pre-push-secret-gate`: not checked.

## Finish first: existing work

No open PRs. WIP rule: at most 1 open PR.

## Work items (in order)

Milestone 1 — ESLint 10

- #10 Upgrade ESLint to 10. Done when: both packages at ^10; plugins resolve without peer errors.
  Verify: `npm run check`, then `vite preview` on base and head plus headless Chrome `--dump-dom`
  on every route in App.jsx, diffed (memory method). Size: M. Depends on: plugin support (check first).

## Close or defer (not in this plan)

None.

## Decisions needed from Karl

None. If a plugin does not support ESLint 10, the item stops and the issue records the blocker.

## Guardrails against drift

- New issues filed after 2026-11-28 do not enter this plan unless they block a Done line.
- No refactors, upgrades or "while I'm here" changes beyond the listed items.
- Each PR maps to one listed item and says "Closes #N" or "Part of #N".
- Change this plan only by editing it with a dated Change log line stating why.
- Stop condition: when every Done line is checked, stop and report.
- Do not fix new lint findings by disabling rules. Fix the code or stop and ask.
- Work in a worktree; never in Karl's main checkout.

## Risks

- Hypothesis: a React plugin lacks ESLint 10 support. Mitigation: check `npm view <plugin> peerDependencies` before any change.
- Hypothesis: ESLint 10 flags new issues. Mitigation: keep the fix minimal; if large, stop and report.

## Change log

- 2026-11-28: Created from the backlog (1 issue, 0 PRs, no Jira).
