# Database Seeding Workflow

## Objectives
- Provide reproducible baseline data for development, testing, and demos without exposing real student information.
- Align fixtures with test factories and ensure idempotent execution.

## Seed Data Layers
1. **Core**: Roles, permissions, super admin account, feature flags default state.
2. **Enrollment**: Sample schools, grades, homeroom assignments, pending and approved applications.
3. **Attendance**: Daily rosters, attendance codes, configurable late thresholds.
4. **Grading**: Grade items per course with weights, sample grade records covering edge cases (zero weight, proportional scaling).
5. **Comms**: Template catalog (EN/AR), quiet hour configurations, banned phrases list.
6. **Calendar**: Academic calendar entries, reminders.
7. **Reporting**: Template references for PDF generation, stored storage URIs (mock).

## Workflow
- Seed scripts located under `seeds/<context>_seed.py` using SQLAlchemy sessions and Pydantic DTOs.
- Master command `make seed` orchestrates context seeds in dependency order; each script checks for existing records to ensure idempotency.
- Environment-specific overrides via `.env.seeding` to customize admin emails or school names.
- After seeding, run `pytest tests/smoke/test_seed_health.py` to validate RBAC, enrollment flow, and comms templates.

## Refreshing Data
- Use `make reseed` to drop and recreate seed data in local dev.
- Production seeds limited to feature toggles and reference data; require approval from district admin and change management ticket.

## Data Quality Checks
- Validate timezone fields (Africa/Cairo) and ensure unique `student_code` values.
- Ensure guardians have consent records before enabling communications.
- Run `scripts/validate_seed.py` to confirm relational integrity and event projections.
