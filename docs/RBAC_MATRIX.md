# RBAC Matrix

Permissions are expressed as `<context>:<action>` and enforced via the core RBAC service. All access is least-privilege and audited.

| Role | Key Responsibilities | Allowed Permissions |
| --- | --- | --- |
| `super_admin` | Platform operations, incident response | `*` (all permissions), including `infra:feature_flags:*`, `core:users:*`, `core:roles:*`, `reporting:exports:*` |
| `district_admin` | District-wide configuration and oversight | `core:users:manage`, `core:roles:assign`, `enrollment:approve`, `attendance:override`, `grading:override`, `comms:dispatch`, `calendar:manage`, `reporting:view_all`, `infra:jobs:trigger` |
| `principal` | School-level management | `enrollment:review`, `enrollment:approve`, `attendance:view_school`, `attendance:adjust`, `grading:view_school`, `grading:publish`, `comms:dispatch_school`, `reporting:view_school`, `calendar:manage_school` |
| `teacher` | Classroom instruction | `attendance:mark`, `attendance:view_class`, `grading:record`, `grading:view_class`, `comms:send_class`, `calendar:view_school`, `reporting:view_class` |
| `counselor` | Student support and escalation | `attendance:view_students`, `attendance:note`, `enrollment:view`, `grading:view_students`, `comms:send_support`, `reporting:view_students` |
| `guardian` | Access to ward information | `enrollment:submit`, `attendance:view_child`, `grading:view_child`, `comms:manage_preferences`, `reporting:view_child`, `calendar:view_public` |
| `student` | Personal academic insights | `attendance:view_self`, `grading:view_self`, `comms:manage_preferences`, `reporting:view_self`, `calendar:view_public` |
| `support_agent` | Helpdesk with scoped access | `core:users:view`, `enrollment:view`, `attendance:view_school`, `grading:view_school`, `comms:view`, `reporting:view_school`, `infra:jobs:view` |

## Enforcement Patterns
- Routes declare required permissions using dependency injection and raise `HTTP 403` on violation.
- Background jobs and event handlers resolve actor context (service accounts) and assert permissions.
- Permission grants are additive; revocation is immediate and logged via `core.audit` events.
- Emergency keyword detections escalate to `super_admin` and `district_admin` regardless of guard rails.
