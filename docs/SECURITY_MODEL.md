# Security Model

## Principles
- **Least Privilege**: RBAC permissions scoped per route and background job.
- **Defense in Depth**: Network segmentation, WAF, rate limits, and input validation across layers.
- **Privacy by Design**: Minimize collection of minors' data, redact PII from logs, encrypt data at rest and in transit.

## Authentication & Authorization
- FastAPI dependencies enforce JWT access tokens with refresh flow; optional TOTP-based 2FA for privileged roles.
- Passwords hashed with Argon2id, per-user salts, and pepper stored in secrets manager.
- Session invalidation on password change or guardian revocation.
- RBAC matrix maintained in `core` with audit of grants/revocations; emergency keywords escalate automatically.

## Data Protection
- PostgreSQL with row-level security for student-facing views.
- AES-256 encryption for sensitive columns (medical notes, guardian contacts) via SQLAlchemy type decorators.
- S3-compatible storage with server-side encryption for reports.
- Daily key rotation and envelope encryption managed by infra context.

## Input Validation & Sanitization
- Pydantic DTOs enforce strict types and pattern checks (e.g., banned phrases, quiet hours windows).
- Server-side validation for CSV uploads; rejects invalid timezone or grade weights.
- HTML templates sanitized; no untrusted rich text without escaping.

## Logging & Audit
- Structured logs exclude PII; include correlation IDs and request IDs.
- Every state change writes to `core.audit.logged` with actor, entity, diff, and timestamp.
- Security events (failed logins, permission denials) forwarded to SIEM for alerting.

## Incident Response
- Playbooks define alert thresholds, on-call rotation, and communication protocols.
- Feature flags allow rapid disablement of risky modules.
- Rollback plan (see `docs/ROLLBACK_PLAN.md`) for database and application changes.

## Compliance
- Aligns with FERPA and COPPA guidance; guardian consent captured for data processing.
- Data residency: primary region Africa/Cairo with backup in EMEA.
- Regular penetration testing and dependency scanning integrated into CI/CD.
