# Modular Monolith Architecture

## Overview
The platform is implemented as a modular monolith that groups features into bounded contexts while sharing a single deployable FastAPI application. Each context exposes isolated routers, services, repositories, and schemas, and communicates with other contexts via domain events published on Redis. This approach keeps the deployment surface small, reduces cross-service latency, and still enforces clear seams for future extraction into microservices.

## Bounded Contexts
- **core**: authentication, RBAC, user lifecycle, audit logging, notification of emergency keywords.
- **enrollment**: application intake, review workflow, provisioning of student profiles and enrollments.
- **attendance**: classroom attendance capture, bulk uploads, threshold management, absence escalation.
- **grading**: grade book, weighting logic, publication of grade updates.
- **comms**: omnichannel communication hub with templates, quiet hours, and opt-out enforcement.
- **calendar**: academic calendar management, reminders, ICS feed generation.
- **reporting**: PDF term reports, attendance summaries, analytics exports.
- **infra**: cross-cutting tooling such as observability, background job scheduling, feature flagging, and secrets handling.

## Layered Structure
Every context follows the same layered structure:
1. **API layer (`app/<context>/api.py`)** — FastAPI routers with dependency-injected services and explicit RBAC guards.
2. **Service layer (`app/<context>/service.py`)** — Business workflows, idempotent handlers, coordination of repositories and events.
3. **Repository layer (`app/<context>/repo.py`)** — SQLAlchemy 2.0 data access using async sessions, returning domain DTOs.
4. **Schema layer (`app/<context>/schemas.py`)** — Pydantic v2 DTOs for create/update/read payloads, reused for OpenAPI.
5. **Model layer (`app/<context>/models.py`)** — Declarative ORM models with Alembic migrations.
6. **Tasks/Jobs (`app/<context>/tasks.py`)** — APScheduler jobs and background workers (Celery/RQ) for long-running tasks.

## Cross-Cutting Concerns
- **Dependency Injection**: FastAPI `Depends` wiring with context-specific provider modules.
- **Configuration**: `runtime.config.json` and environment variables injected via Pydantic `BaseSettings` models under `app/config`.
- **Event Bus**: Redis streams keyed as `<context>.<event>` to decouple contexts.
- **Observability**: Structured logging with correlation IDs, tracing hooks, and metrics instrumentation registered in `infra`.
- **Security**: Central RBAC service in `core` validating permissions per route and asynchronous audit logging.

## Data Flow Example — Enrollment Provisioning
1. Guardian submits application via `enrollment` API (validated DTO).
2. `EnrollmentService` persists application, emits `enrollment.submitted` event.
3. Staff reviews and approves; `enrollment.approved` triggers provisioning job.
4. Provisioning job orchestrates `core` (user creation), `attendance` (homeroom roster), `grading` (default courses), and `comms` (guardian notification).
5. All state transitions are recorded in audit logs with actor, entity, and diff payload.

## Deployment
- Single FastAPI Uvicorn container with optional Celery/RQ worker processes.
- Alembic migrations executed before application boot.
- Feature flags toggled via `infra` config store for safe rollout.
- Horizontal scaling via container replicas; Redis/PostgreSQL provisioned as managed services.
