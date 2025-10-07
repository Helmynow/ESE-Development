# ESE Automation Platform

A monorepo scaffold for the Enrollment, Attendance, and Student Experience (ESE) platform. The repository now includes a FastAPI/SQLAlchemy backend foundation with Alembic migrations alongside the existing Vite/React frontend shell.

## Acceptance Criteria
- ✅ Alembic is initialised with migrations for `audit_log` and `enrollment_application` tables.
- ✅ CI executes linting, type checks, tests (with coverage ≥80%), Alembic migrations, optional k6 smoke tests, and security scans.
- ✅ Coverage and lint artefacts are uploaded to pull requests for visibility.

## Getting Started

### Prerequisites
- Python 3.12+
- Node.js 20+
- npm 10+

### Installation
```bash
make install-backend
make install-frontend
```

This installs backend dependencies (including dev tooling) and frontend packages.

### Quality Gates
Run all quality checks locally before opening a PR:
```bash
make quality
```

This command runs Ruff, Black, MyPy, and pytest with coverage thresholds enforced.

### Database Migrations
- Upgrade to the latest schema:
  ```bash
  make migrate-up
  ```
- Roll back to base (destroys schema):
  ```bash
  make migrate-down
  ```
- Generate a new revision after updating models:
  ```bash
  make alembic-revision message="describe change"
  ```

### Sample API Requests
`backend/http/enrollment.http` contains ready-to-run HTTP snippets for enrollment submission and approval flows.

### Running Tests
```bash
make test-backend
```

Frontend tests are currently placeholders; add them under `src/` and update the npm scripts when available.

## Continuous Integration
The GitHub Actions workflow `.github/workflows/ci.yml` performs the following:
1. Installs frontend and backend dependencies.
2. Runs Ruff, Black, MyPy, ESLint, and pytest with coverage (≥80%).
3. Applies Alembic migrations against an ephemeral SQLite database.
4. Executes Bandit and pip-audit for backend security scanning.
5. Optionally triggers a k6 smoke test when `k6/smoke.js` is present.
6. Publishes lint and coverage artefacts to the PR and blocks merges on failures.

## Project Structure
```
backend/
  app/
    database.py
    models/
      audit.py
      enrollment.py
  alembic/
    env.py
    versions/
      202502180001_initial_audit_enrollment.py
  tests/
    test_models.py
  http/
    enrollment.http
frontend/
  (existing Vite React app under src/)
```

## Rollback
- To revert database schema changes locally: `make migrate-down`.
- To revert code changes, use `git revert` or reset to a prior commit.

## Security Posture
- Backend models capture audit metadata for every state change.
- CI enforces security scans (Bandit, pip-audit) and fails the pipeline on critical issues.
- Coverage artefacts highlight gaps to maintain defensive coding standards.
