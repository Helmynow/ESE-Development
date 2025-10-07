from backend.app.core.audit import AuditLogger


def test_audit_logger_records_entries() -> None:
    logger = AuditLogger()
    logger.record(
        actor_id="staff-1",
        entity="student-1",
        action="enrollment.submitted",
        before=None,
        after={"status": "submitted"},
    )

    entries = logger.entries

    assert len(entries) == 1
    entry = entries[0]
    assert entry.actor_id == "staff-1"
    assert entry.entity == "student-1"
    assert entry.action == "enrollment.submitted"
    assert entry.after == {"status": "submitted"}


def test_audit_logger_clear() -> None:
    logger = AuditLogger()
    logger.record(
        actor_id="staff-2",
        entity="student-2",
        action="enrollment.approved",
        before=None,
        after={"status": "approved"},
    )
    logger.clear()

    assert list(logger.entries) == []
