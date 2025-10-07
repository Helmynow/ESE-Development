# Recognition & Evaluation System - Quick Start Guide

## For Developers

### Prerequisites
- Python 3.12+
- PostgreSQL or SQLite
- Virtual environment activated

### Setup (5 minutes)

```bash
# 1. Install dependencies
cd /path/to/ESE--Development
make install-backend

# 2. Run migrations
make migrate-up

# 3. Verify setup
python -c "from app.models import Nomination, EvaluationCycle; print('✓ Setup complete')"
```

### Using the Models

#### Create a Nomination
```python
from datetime import datetime, timezone
import uuid
from app.database import session_scope
from app.models import Nomination, NominationCategory, NominationStatus

with session_scope() as session:
    nomination = Nomination(
        id=uuid.uuid4(),
        nominee_id=uuid.uuid4(),
        nominee_name="Jane Smith",
        nominee_department="Mathematics",
        category=NominationCategory.TEACHING_EXCELLENCE,
        nominator_id=uuid.uuid4(),
        nominator_name="John Doe",
        description="Outstanding teacher with exceptional student outcomes",
        nomination_period="2024-12",
        status=NominationStatus.PENDING
    )
    session.add(nomination)
```

#### Check Eligibility
```python
from app.models import EligibilityTracking

with session_scope() as session:
    tracking = session.query(EligibilityTracking).filter_by(
        employee_id=employee_id
    ).first()
    
    if tracking and tracking.rotation_lock_until:
        if datetime.now(timezone.utc) < tracking.rotation_lock_until:
            print(f"Employee locked until {tracking.rotation_lock_until}")
```

#### Create Evaluation Cycle
```python
from app.models import EvaluationCycle, EvaluationCycleStatus

with session_scope() as session:
    cycle = EvaluationCycle(
        id=uuid.uuid4(),
        cycle_name="December 2024 Evaluation",
        cycle_period="2024-12",
        start_date=datetime(2024, 12, 1, tzinfo=timezone.utc),
        end_date=datetime(2024, 12, 15, tzinfo=timezone.utc),
        status=EvaluationCycleStatus.DRAFT,
        created_by=admin_id
    )
    session.add(cycle)
    
    # Activate when ready
    cycle.activate()
```

#### Submit Evaluation Rating
```python
from app.models import EvaluationRating, EvaluatorRole

with session_scope() as session:
    rating = EvaluationRating(
        id=uuid.uuid4(),
        evaluation_id=evaluation_id,
        cycle_id=cycle_id,
        evaluator_id=evaluator_id,
        evaluator_role=EvaluatorRole.SUPERVISOR,
        evaluee_id=evaluee_id,
        weight=0.35,  # 35% for supervisor
        # Academic staff criteria
        teaching_effectiveness=8.5,
        student_engagement=9.0,
        curriculum_implementation=8.0,
        classroom_management=8.5,
        # Common criteria
        collaboration=9.0,
        innovation=8.0,
        attendance=9.5,
        professional_development=8.5,
        average_score=8.625,
        strengths="Excellent classroom management",
        improvements="Continue professional development",
        comments="Strong performer"
    )
    session.add(rating)
```

### Quick Queries

#### Get Recent EOM Winners
```python
from app.models import Award, AwardType

with session_scope() as session:
    recent_winners = session.query(Award).filter(
        Award.award_type == AwardType.EMPLOYEE_OF_MONTH
    ).order_by(Award.granted_at.desc()).limit(12).all()
```

#### Get Evaluation Results
```python
from app.models import EvaluationResult

with session_scope() as session:
    results = session.query(EvaluationResult).filter_by(
        cycle_id=cycle_id
    ).order_by(EvaluationResult.final_score.desc()).all()
```

#### Check Variance Alerts
```python
from app.models import FairnessMetric

with session_scope() as session:
    alerts = session.query(FairnessMetric).filter(
        FairnessMetric.alert_level == "critical",
        FairnessMetric.resolved == 0
    ).all()
```

### Running Tests

```bash
# Run all tests
make test-backend

# Run specific test
pytest backend/tests/test_models.py::test_metadata_contains_tables -v

# Check coverage
pytest --cov=app --cov-report=html
```

### Database Operations

```bash
# Create migration
make alembic-revision message="Add new field"

# Upgrade to latest
make migrate-up

# Rollback one version
alembic -c backend/alembic.ini downgrade -1

# Check current version
alembic -c backend/alembic.ini current
```

## For Administrators

### Monthly EOM Cycle

**Day 15**: Open nomination window
```python
# System automatically opens nominations
# Staff can submit nominations via UI
```

**Day 22**: Close nominations, open voting
```python
# System closes nominations
# Eligible voters receive ballot
```

**Day 27**: Close voting, determine winner
```python
# System counts votes
# Winner determined by simple majority
```

**Last Day**: Announce winner
```python
# Public announcement
# Award record created
# Eligibility updated
```

### Quarterly Evaluation Cycle

**Week 1**: Create and configure cycle
```python
from app.models import EvaluationCycle
# Admin creates cycle via UI
# System assigns evaluations
```

**Week 2-3**: Collect evaluations
```python
# Staff submit evaluations
# System tracks completion
# Reminders sent automatically
```

**Week 4**: Review results
```python
# System calculates weighted scores
# Admin reviews results
# Variance alerts investigated
```

## Documentation Reference

| Document | Purpose | Length |
|----------|---------|--------|
| `RECOGNITION_EVALUATION.md` | System overview and features | 13.7K chars |
| `RECOGNITION_OPERATIONS.md` | Operational procedures | 17.5K chars |
| `RECOGNITION_ROADMAP.md` | Implementation plan | 14.0K chars |
| `RECOGNITION_MIGRATION.md` | Migration from legacy | 20.0K chars |
| `IMPLEMENTATION_SUMMARY.md` | What was implemented | 11.5K chars |
| `QUICK_START_RECOGNITION.md` | This guide | You are here |

## Model Reference

### Recognition Models
- **Nomination**: EOM nominations with status tracking
- **Vote**: Anonymous voting records
- **Award**: Recognition awards (EOM, EOY, special)
- **EligibilityTracking**: Rotation locks and eligibility status
- **FairnessMetric**: Variance and bias detection

### Evaluation Models
- **EvaluationCycle**: Evaluation period management
- **Evaluation**: Evaluator-evaluee assignment
- **EvaluationRating**: Individual evaluation submission
- **EvaluationResult**: Aggregated weighted results
- **EOYCandidate**: Employee of Year tracking

## Common Patterns

### Using Enums
```python
from app.models import (
    NominationCategory,
    NominationStatus,
    EvaluatorRole,
    StaffType
)

# Set category
nomination.category = NominationCategory.TEACHING_EXCELLENCE

# Check status
if nomination.status == NominationStatus.VOTING:
    # Process vote
    pass
```

### Working with Dates
```python
from datetime import datetime, timezone

# Always use UTC
now = datetime.now(timezone.utc)

# Format for period
period = now.strftime("%Y-%m")  # "2024-12"
```

### Error Handling
```python
from sqlalchemy.exc import IntegrityError

try:
    with session_scope() as session:
        session.add(record)
        session.commit()
except IntegrityError as e:
    # Handle duplicate or constraint violation
    print(f"Database error: {e}")
```

## Support

### Technical Issues
- **Email**: mahmoud.hassan@ese.edu.eg
- **Documentation**: See `docs/` directory
- **Tests**: `backend/tests/test_models.py`

### Policy Questions
- **Email**: mariam.youssef@ese.edu.eg
- **Operations Guide**: `docs/RECOGNITION_OPERATIONS.md`

### Reporting Bugs
1. Check existing issues in GitHub
2. Create detailed bug report
3. Include error messages and steps to reproduce
4. Tag as `bug` and `recognition-evaluation`

---

**Quick Start Version**: 1.0  
**Last Updated**: February 2025  
**Maintained By**: Development Team
