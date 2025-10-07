"""Initial audit and enrollment tables.

Revision ID: 202502180001
Revises: 
Create Date: 2025-02-18 00:01:00.000000
"""

from __future__ import annotations

import sqlalchemy as sa
from alembic import op

revision = "202502180001"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "audit_log",
        sa.Column("id", sa.dialects.postgresql.UUID(as_uuid=True), primary_key=True, nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column("actor_id", sa.dialects.postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("actor_role", sa.String(length=64), nullable=False),
        sa.Column("entity_type", sa.String(length=128), nullable=False),
        sa.Column("entity_id", sa.dialects.postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("action", sa.String(length=64), nullable=False),
        sa.Column("summary", sa.String(length=512), nullable=False),
        sa.Column("before", sa.JSON(), nullable=True),
        sa.Column("after", sa.JSON(), nullable=True),
        sa.Column("correlation_id", sa.String(length=128), nullable=True),
        sa.Column("ip_address", sa.String(length=64), nullable=True),
    )

    op.create_table(
        "enrollment_application",
        sa.Column("id", sa.dialects.postgresql.UUID(as_uuid=True), primary_key=True, nullable=False),
        sa.Column("guardian_email", sa.String(length=255), nullable=False),
        sa.Column("guardian_phone", sa.String(length=32), nullable=False),
        sa.Column("student_first_name", sa.String(length=128), nullable=False),
        sa.Column("student_last_name", sa.String(length=128), nullable=False),
        sa.Column(
            "status",
            sa.Enum(
                "submitted",
                "in_review",
                "approved",
                "rejected",
                "provisioned",
                name="enrollmentstatus",
            ),
            nullable=False,
            server_default="submitted",
        ),
        sa.Column("submitted_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column("reviewed_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("approved_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("provisioned_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("checklist", sa.JSON(), nullable=True),
        sa.Column("metadata", sa.JSON(), nullable=True),
        sa.Column("notes", sa.String(length=1024), nullable=True),
        sa.Column("correlation_id", sa.String(length=128), nullable=True),
        sa.Column("assigned_student_code", sa.String(length=64), nullable=True),
        sa.UniqueConstraint("assigned_student_code", name="uq_enrollment_application_student_code"),
    )


def downgrade() -> None:
    op.drop_table("enrollment_application")
    op.drop_table("audit_log")
    bind = op.get_bind()
    if bind.dialect.name == "postgresql":
        op.execute("DROP TYPE IF EXISTS enrollmentstatus")
