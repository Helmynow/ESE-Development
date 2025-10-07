# Performance & Accessibility Test Hooks

## k6 Smoke Tests
- Placeholder for future k6 scripts targeting critical enrollment APIs.
- Expected to live under `frontend/tests/performance/k6/` once frontend integration begins.
- Scripts should target `/enrollment/submit` and `/enrollment/provision` endpoints with P95 < 300 ms.
- TODO: Wire into CI via `make perf-smoke` when frontend harness exists.

## Accessibility Hooks
- Reserve `frontend/tests/accessibility/` for Playwright + axe-core scans.
- Focus on enrollment intake and guardian notification flows with WCAG 2.1 AA coverage.
- TODO: Add CI job `make accessibility-scan` once frontend forms are available.
