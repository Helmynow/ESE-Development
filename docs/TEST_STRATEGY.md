# Test Strategy

## Goals
- Maintain ≥80% line coverage with focus on critical workflows.
- Validate core user journeys: enrollment → attendance → grading → reporting → comms notifications.
- Catch regressions before production via automated CI gates (ruff, black, mypy, pytest, build).

## Test Pyramid
1. **Unit Tests** (`pytest tests/unit`) — Services, validators, repositories mocked via fixtures. Property-based tests for grading weighting invariants.
2. **Integration Tests** (`pytest tests/integration`) — FastAPI test client with httpx, exercising routers, RBAC enforcement, and database interactions against transactional PostgreSQL schema.
3. **Contract Tests** (`pytest tests/contracts`) — Event schema validation (pydantic models) and OpenAPI snapshots.
4. **End-to-End Tests** (`pytest tests/e2e`) — Enrollment to notification flow using seeded data, verifying audit logs and event emissions.
5. **Performance Smoke** (`pytest -m performance`) — Load-focused tests ensuring P95 < 300 ms and memory < 256 MB per request under nominal load.

## Tooling & Automation
- **Coverage**: `pytest --cov=app --cov-report=xml` published to CI; enforce threshold via `coverage xml` check.
- **Linting**: `ruff`, `black`, and `mypy` run pre-commit and in CI.
- **Fixtures**: Shared factories under `tests/factories` align with seeding strategy.
- **Test Data**: Deterministic seeds for reproducibility; anonymized fixtures avoid PII.

## Acceptance Criteria Mapping
- Enrollment provisioning test asserts student_code assignment, course enrollment creation, audit trail, guardian notification event.
- Attendance bulk upload test ensures CSV parser handles timezone Africa/Cairo, enforces late thresholds, and triggers absence alerts.
- Grading property tests ensure zero-weight items do not affect final grade and proportional scaling maintains ranking order.
- Reporting tests verify PDF generation using HTML templates and compare hash of generated files.
- Communications tests confirm quiet hours, opt-out, banned phrases, and required footer enforcement.

## CI Integration
- GitHub Actions workflow executes lint → type-check → test → build.
- Failures block merge; flaky tests quarantined with action item to stabilize within sprint.
- k6 smoke tests use the `grafana/setup-k6-action@v1` action; update workflow references if the action publishes a new stable tag.
- k6 smoke tests use the `grafana/setup-k6@v0` action; update workflow references if the action publishes a new stable tag.

## Observability in Tests
- Structured logs captured via caplog to confirm correlation IDs and single error log per failure path.
