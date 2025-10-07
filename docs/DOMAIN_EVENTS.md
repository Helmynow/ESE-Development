# Domain Events Catalog

All domain events are published on Redis streams with the key pattern `<context>.<event>` and JSON payloads. Events must be idempotent, immutable, and include correlation metadata (`event_id`, `causation_id`, `correlation_id`, `occurred_at`, `actor_id`). Consumers acknowledge only after durable side-effects complete.

| Event | Emitted By | Purpose | Payload Schema |
| --- | --- | --- | --- |
| `enrollment.submitted` | Enrollment API | Guardian submits application | `{ "event_id": str, "application_id": UUID, "student_temp_id": UUID, "guardian_id": UUID, "submitted_at": datetime, "correlation_id": str }` |
| `enrollment.approved` | Enrollment backoffice | Staff approves application | `{ "event_id": str, "application_id": UUID, "student_temp_id": UUID, "approved_by": UUID, "approved_at": datetime, "notes": str | None, "correlation_id": str }` |
| `enrollment.provisioned` | Enrollment provisioning worker | Student profile and enrollments created | `{ "event_id": str, "student_id": UUID, "student_code": str, "homeroom_id": UUID, "course_ids": list[UUID], "provisioned_at": datetime, "correlation_id": str }` |
| `attendance.marked` | Attendance API | Attendance recorded for class session | `{ "event_id": str, "class_session_id": UUID, "student_id": UUID, "status": Literal["present","absent","late"], "marked_by": UUID, "marked_at": datetime, "correlation_id": str }` |
| `attendance.threshold_breached` | Attendance job | Escalate chronic absence | `{ "event_id": str, "student_id": UUID, "days_absent": int, "threshold": int, "first_absent_at": datetime, "last_absent_at": datetime, "correlation_id": str }` |
| `grading.updated` | Grading service | Grade record created or changed | `{ "event_id": str, "grade_item_id": UUID, "student_id": UUID, "score": Decimal, "weight": Decimal, "recorded_at": datetime, "recorded_by": UUID, "correlation_id": str }` |
| `comms.dispatched` | Comms service | Communication sent to audience | `{ "event_id": str, "template_id": UUID, "channel": Literal["email","sms","push"], "audience_segment_id": UUID, "dispatch_id": UUID, "sent_at": datetime, "correlation_id": str }` |
| `calendar.reminder_sent` | Calendar scheduler | Reminder delivered | `{ "event_id": str, "calendar_event_id": UUID, "reminder_offset_minutes": int, "channel": str, "sent_at": datetime, "correlation_id": str }` |
| `reporting.report_generated` | Reporting worker | PDF report ready | `{ "event_id": str, "report_id": UUID, "report_type": Literal["term","attendance"], "student_id": UUID | None, "generated_at": datetime, "storage_uri": str, "correlation_id": str }` |
| `core.audit.logged` | Core audit service | Audit record persisted | `{ "event_id": str, "audit_id": UUID, "actor_id": UUID, "entity_type": str, "entity_id": UUID, "action": str, "diff": dict, "created_at": datetime, "correlation_id": str }` |

## Event Envelope
All payloads are wrapped in an envelope that adds retry metadata:
```json
{
  "event": <payload>,
  "metadata": {
    "schema_version": "v1",
    "replay": false,
    "attempt": 1
  }
}
```

## Contract Governance
- Schemas are versioned; breaking changes require a new `schema_version`.
- Producers own backwards compatibility guarantees and publish OpenAPI/JSON Schema under `docs/events` (future).
- Consumers must handle duplicate deliveries and ensure idempotent writes.
