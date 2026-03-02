# Dashboard UX Progress and Future Todos

## Completed So Far

- Set these sections to load collapsed by default:
  - Credit Score Estimator
  - Credit Card Debt Analysis
  - Income Planning
  - Payment Tracker
  - Financial Quest Journey
  - Financial Personality Traits
- Added expand/collapse behavior for Financial Quest Journey with chevron state.
- Updated Financial Personality Traits chevron to reflect open/closed state.
- Added cash total trend indicator (up/down arrow with +/- amount).
- Fixed cash change tracking to compare against last saved state instead of last render.
- Added per-cash-account +/- indicator versus last saved balance.
- Synced cash baseline only after successful save operations for better accuracy.
- Updated save flow to return success/failure so baseline updates are reliable.
- Verified no linter errors in edited files.

## Pending (Future Todos)

- Add "since last save" label next to cash delta values for clearer context.
- Add optional timestamp for last successful save in the dashboard header.
- Add a user setting for default section open/closed preferences.
- Add a "Collapse all / Expand all" dashboard control.
- Add tests for cash baseline and delta logic (total + per-account).
- QA pass on mobile and desktop for all collapsible sections and chevron states.
