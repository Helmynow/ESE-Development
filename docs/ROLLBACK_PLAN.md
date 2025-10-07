# Rollback & Deployment Safety

## Deployment Guardrails
- **Feature Flags**: All risky features behind flags stored in infra config; default off until post-deploy validation passes. Flags support gradual rollout by role or cohort.
- **Progressive Delivery**: Deploy to staging → canary (10% traffic) → full production with automated health checks and error budget monitoring.
- **Pre-Deploy Checklist**: Ensure Alembic migrations reviewed, seed scripts updated, and rollback scripts prepared.

## Alembic Strategy
- **Forward Migrations**: Use additive, idempotent changes. Avoid destructive operations in same revision as new code. Include data backfill scripts guarded by feature flag toggles.
- **Downgrade Scripts**: Required for every revision, tested in staging. Provide `safe_downgrade()` helpers for reversible transformations.
- **Zero-Downtime Patterns**: Deploy columns nullable, backfill asynchronously, switch application logic, then enforce constraints.

## Rollback Playbook
1. **Detect Issue**: Monitoring alerts or support tickets indicate regression.
2. **Stabilize**: Toggle relevant feature flags off. If DB migration caused issue, pause traffic and initiate rollback.
3. **Communicate**: Notify stakeholders via comms channel; log incident start time (Africa/Cairo).
4. **Rollback Application**: Re-deploy previous container image (`deploy --version <last_good>`). Ensure background workers also rolled back.
5. **Rollback Database**: Run `alembic downgrade <prev_revision>` using prepared downgrade scripts. Validate schema state.
6. **Verify**: Run smoke tests (`make smoke`) and health checks.
7. **Post-Mortem**: Document root cause, time to detect/resolve, preventive actions.

## Data Safety
- Backups taken hourly with 7-day retention. Point-in-time recovery tested quarterly.
- For irreversible data changes, require explicit approval and out-of-hours window with guardians notified if impacts exist.

## Tooling
- Make targets: `make deploy`, `make rollback VERSION=<tag>`, `make migrate`, `make downgrade REVISION=<id>`.
- Incident log stored in reporting context and linked to audit trail.
