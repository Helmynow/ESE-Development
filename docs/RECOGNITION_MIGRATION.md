# Recognition & Evaluation System - Migration Playbook

## Overview

This playbook provides step-by-step procedures for migrating from ESE's legacy recognition and evaluation systems to the new integrated Recognition & Evaluation System.

## Pre-Migration Assessment

### Legacy Systems Inventory

#### Current Recognition System
- **Format**: Manual spreadsheets and email-based nominations
- **Data Location**: Shared drive `/HR/Recognition/`
- **Data Owners**: HR Coordinator, P&C Head
- **Historical Data**: 2-3 years of EOM winners
- **Format**: Excel files, PDF certificates

#### Current Evaluation System
- **Format**: Paper forms and manual aggregation
- **Data Location**: Physical files in HR office, some digital copies
- **Data Owners**: P&C Head, Principals
- **Historical Data**: 2 years of evaluation records
- **Format**: PDF scans, Word documents, Excel summaries

### Data Quality Assessment

#### Recognition Data Quality
- **Completeness**: ~90% (some missing descriptions)
- **Accuracy**: High (winner records maintained)
- **Consistency**: Medium (varying formats across years)
- **Integrity**: High (verified against announcements)

#### Evaluation Data Quality
- **Completeness**: ~70% (some incomplete evaluations)
- **Accuracy**: Medium (manual calculation errors possible)
- **Consistency**: Low (forms changed over time)
- **Integrity**: Medium (some missing signatures)

### Migration Scope

#### In-Scope Data
- EOM winner records (last 2 years)
- Award certificates and descriptions
- Employee eligibility status
- MRE evaluation results (last 2 cycles)
- Evaluator-evaluee assignments
- Department affiliation history

#### Out-of-Scope Data
- Individual evaluation forms (paper copies retained)
- Email correspondence
- Historical nomination texts (if not preserved)
- Evaluation forms older than 2 years

## Migration Strategy

### Phased Approach

```
Phase 0: Preparation (Week 1-2)     ████░░░░░░░░
Phase 1: Historical Data (Week 3-4) ░░░░████░░░░
Phase 2: Active Data (Week 5)       ░░░░░░░░████
Phase 3: Validation (Week 6)        ░░░░░░░░░░░░████
```

### Migration Principles
1. **Data Integrity First**: Verify all migrated data
2. **Zero Downtime**: Legacy system remains accessible during migration
3. **Rollback Ready**: Maintain ability to revert changes
4. **Audit Trail**: Document all migration activities
5. **User Communication**: Keep stakeholders informed

## Phase 0: Preparation (Weeks 1-2)

### Week 1: Data Extraction

#### Task 1: Extract Recognition Data
**Objective**: Consolidate EOM winner data from spreadsheets

**Steps:**
1. Locate all EOM winner spreadsheets
   - Check `/HR/Recognition/EOM_Winners_2023.xlsx`
   - Check `/HR/Recognition/EOM_Winners_2024.xlsx`
   - Check email archives for announcements

2. Create master extraction spreadsheet
   - Columns: Date, Name, Department, Category, Description
   - Include all winners from last 24 months
   - Cross-reference with announcement emails

3. Validate extracted data
   - Verify winner names against employee roster
   - Confirm departments are current
   - Check for duplicates
   - Fill missing descriptions from certificates

**Deliverable**: `EOM_Winners_Extract.xlsx` with validated data

#### Task 2: Extract Evaluation Data
**Objective**: Consolidate MRE results from various sources

**Steps:**
1. Locate evaluation summary documents
   - Check `/HR/Evaluations/Dec2023_Summary.xlsx`
   - Check `/HR/Evaluations/Mar2024_Summary.xlsx`
   - Check `/HR/Evaluations/Dec2024_Summary.xlsx`

2. Create master extraction spreadsheet
   - Columns: Cycle, Employee, Department, Role, Final Score, Components
   - Include last 3 evaluation cycles
   - Separate academic and administrative staff

3. Validate extracted data
   - Verify score calculations
   - Confirm evaluee names against roster
   - Check for missing evaluations
   - Document incomplete records

**Deliverable**: `MRE_Results_Extract.xlsx` with validated data

#### Task 3: Extract Eligibility Data
**Objective**: Determine current eligibility status for all staff

**Steps:**
1. Calculate rotation locks
   - For each EOM winner, calculate 90-day lock end date
   - Identify currently locked employees
   - Document lock reasons

2. Identify ineligible employees
   - Check for active PIPs
   - Check disciplinary records
   - Check leave of absence status
   - Check tenure (<6 months)

3. Create eligibility spreadsheet
   - Columns: Name, Status, Reason, Lock Until
   - Include all staff members
   - Flag any special cases

**Deliverable**: `Staff_Eligibility_Extract.xlsx` with current status

### Week 2: Data Cleansing & Preparation

#### Task 1: Cleanse Recognition Data
**Objective**: Standardize and clean extracted recognition data

**Steps:**
1. Standardize names
   - Convert to "FirstName LastName" format
   - Fix typos and abbreviations
   - Cross-reference with official employee roster
   - Update married/changed names

2. Standardize departments
   - Map legacy department names to current structure
   - Handle department changes/mergers
   - Document mapping in `Department_Mapping.xlsx`

3. Standardize categories
   - Map legacy categories to new system categories
   - Document any discontinued categories
   - Create category mapping document

4. Fill missing data
   - Retrieve missing descriptions from certificates
   - Infer missing dates from announcement emails
   - Flag records that cannot be completed

**Deliverable**: `EOM_Winners_Clean.xlsx` ready for import

#### Task 2: Cleanse Evaluation Data
**Objective**: Standardize and clean extracted evaluation data

**Steps:**
1. Verify score calculations
   - Recalculate final scores from components
   - Flag discrepancies
   - Document calculation method used

2. Standardize employee data
   - Apply same name standardization as Task 1
   - Verify department affiliations
   - Update to current staff roles

3. Identify missing evaluations
   - List incomplete evaluation sets
   - Determine if retrieval possible
   - Document gaps

4. Normalize score scales
   - Ensure all scores on 1-10 scale
   - Convert any legacy scales
   - Document conversions

**Deliverable**: `MRE_Results_Clean.xlsx` ready for import

#### Task 3: Prepare Import Scripts
**Objective**: Create scripts to automate data import

**Steps:**
1. Create recognition import script
   ```python
   # backend/scripts/import_recognition.py
   - Read from EOM_Winners_Clean.xlsx
   - Create Award records
   - Update EligibilityTracking
   - Log all imports
   ```

2. Create evaluation import script
   ```python
   # backend/scripts/import_evaluations.py
   - Read from MRE_Results_Clean.xlsx
   - Create historical EvaluationCycle records
   - Create EvaluationResult records
   - Log all imports
   ```

3. Create eligibility import script
   ```python
   # backend/scripts/import_eligibility.py
   - Read from Staff_Eligibility_Extract.xlsx
   - Create/update EligibilityTracking records
   - Set rotation locks
   - Log all imports
   ```

4. Create validation scripts
   ```python
   # backend/scripts/validate_import.py
   - Verify record counts
   - Check data integrity
   - Generate import report
   ```

**Deliverable**: Import scripts in `backend/scripts/` directory

## Phase 1: Historical Data Migration (Weeks 3-4)

### Week 3: Test Migration

#### Task 1: Set Up Test Environment
**Steps:**
1. Create test database (SQLite or PostgreSQL)
2. Run all migrations to set up schema
3. Create test user accounts
4. Verify system functionality

**Acceptance Criteria:**
- Test environment mirrors production schema
- All tables created successfully
- Sample data can be inserted and retrieved

#### Task 2: Execute Test Import
**Steps:**
1. Run recognition import script
   ```bash
   python backend/scripts/import_recognition.py \
     --input EOM_Winners_Clean.xlsx \
     --environment test \
     --dry-run
   ```

2. Review dry-run results
   - Check for errors
   - Verify record counts
   - Review sample records

3. Execute actual import
   ```bash
   python backend/scripts/import_recognition.py \
     --input EOM_Winners_Clean.xlsx \
     --environment test
   ```

4. Validate imported data
   ```bash
   python backend/scripts/validate_import.py \
     --type recognition \
     --environment test
   ```

**Acceptance Criteria:**
- All records imported without errors
- Record counts match source data
- Sample validation queries succeed

#### Task 3: Execute Test Evaluation Import
**Steps:**
1. Run evaluation import script (dry-run first)
2. Review results
3. Execute actual import
4. Validate imported data

**Acceptance Criteria:**
- All evaluation cycles created
- Results accurately imported
- Score calculations verified

### Week 4: Refine Import Process

#### Task 1: Address Issues from Test
**Steps:**
1. Review test import logs
2. Identify and document issues
3. Update import scripts as needed
4. Add error handling
5. Enhance logging
6. Re-test problematic scenarios

**Deliverable**: Updated and tested import scripts

#### Task 2: Create Rollback Procedures
**Steps:**
1. Document pre-migration database state
2. Create database backup script
3. Create data deletion script (if rollback needed)
4. Test rollback procedure in test environment
5. Document rollback steps

**Deliverable**: `ROLLBACK.md` with step-by-step procedures

#### Task 3: Final Pre-Production Preparation
**Steps:**
1. Schedule production migration window
2. Notify all stakeholders of schedule
3. Prepare production backup
4. Review migration checklist
5. Assign roles and responsibilities

**Deliverable**: Migration execution plan with schedule

## Phase 2: Production Migration (Week 5)

### Pre-Migration Checklist

#### 24 Hours Before Migration
- [ ] Confirm migration window (suggest Saturday morning)
- [ ] Notify IT Specialist
- [ ] Notify P&C Head
- [ ] Notify CEO
- [ ] Backup production database
- [ ] Verify backup integrity
- [ ] Prepare rollback plan

#### 1 Hour Before Migration
- [ ] Put legacy system in read-only mode (if possible)
- [ ] Final backup of legacy data
- [ ] Verify import scripts ready
- [ ] Verify production database accessible
- [ ] Start migration log

### Migration Execution

#### Step 1: Pre-Migration Validation (30 minutes)
```bash
# Verify database connection
python backend/scripts/check_db.py --environment production

# Verify schema current
alembic -c backend/alembic.ini current

# Count existing records
python backend/scripts/count_records.py --environment production
```

**Expected Results:**
- Database accessible
- Schema at latest revision
- Zero recognition/evaluation records (new system)

#### Step 2: Import Recognition Data (1-2 hours)
```bash
# Dry run first
python backend/scripts/import_recognition.py \
  --input EOM_Winners_Clean.xlsx \
  --environment production \
  --dry-run \
  --log-file migration_recognition_dryrun.log

# Review dry-run results
# If successful, execute actual import

python backend/scripts/import_recognition.py \
  --input EOM_Winners_Clean.xlsx \
  --environment production \
  --log-file migration_recognition.log
```

**Expected Results:**
- ~24 Award records created (2 years, ~12/year)
- ~30 EligibilityTracking records created
- All imports logged
- No errors

#### Step 3: Import Evaluation Data (1-2 hours)
```bash
# Import evaluation cycles and results
python backend/scripts/import_evaluations.py \
  --input MRE_Results_Clean.xlsx \
  --environment production \
  --log-file migration_evaluations.log
```

**Expected Results:**
- 3 EvaluationCycle records created (Dec23, Mar24, Dec24)
- ~75 EvaluationResult records created (~25 staff × 3 cycles)
- All calculations accurate
- No errors

#### Step 4: Import Eligibility Data (30 minutes)
```bash
# Update eligibility tracking
python backend/scripts/import_eligibility.py \
  --input Staff_Eligibility_Extract.xlsx \
  --environment production \
  --log-file migration_eligibility.log
```

**Expected Results:**
- EligibilityTracking records updated
- Rotation locks set correctly
- Ineligibility flags set as needed
- No errors

#### Step 5: Post-Migration Validation (1 hour)
```bash
# Run comprehensive validation
python backend/scripts/validate_import.py \
  --environment production \
  --detailed \
  --report-file migration_validation_report.txt
```

**Validation Checks:**
- [ ] Award record counts match source
- [ ] All award dates within expected range
- [ ] EligibilityTracking records exist for all staff
- [ ] Rotation locks calculated correctly
- [ ] Evaluation cycle count matches (3 cycles)
- [ ] Evaluation result count matches source
- [ ] Score calculations accurate
- [ ] No orphaned records (referential integrity)
- [ ] No duplicate records

#### Step 6: Smoke Testing (1 hour)
Manual verification:
1. Log in as admin user
2. Navigate to Recognition Center
   - Verify EOM winners displayed
   - Check award history
   - Test eligibility checker
3. Navigate to Results Center
   - Verify evaluation results displayed
   - Check score calculations
   - Verify department summaries
4. Navigate to EOY tracking
   - Verify candidates correctly identified
   - Check score calculations

**Acceptance Criteria:**
- All historical data visible
- All calculations accurate
- No errors in UI
- Performance acceptable

### Post-Migration Tasks

#### Immediate (Same Day)
1. Remove read-only mode from legacy system (if applied)
2. Archive migration logs
3. Document any issues encountered
4. Send migration completion notification to stakeholders

#### Next Day
1. Monitor system for issues
2. Review migration logs for warnings
3. Address any data quality issues
4. Update documentation

#### First Week
1. Gather user feedback on migrated data
2. Make any necessary corrections
3. Generate migration report
4. Update runbooks

## Phase 3: Validation & Reconciliation (Week 6)

### Data Reconciliation

#### Recognition Data Reconciliation
**Objective**: Verify all historical EOM data accurately migrated

**Steps:**
1. Compare record counts
   - Source spreadsheet count vs. database count
   - Verify 1:1 match for each year/month

2. Sample validation (10% of records)
   - Randomly select 10% of awards
   - Verify details match source
   - Check calculation of rotation locks

3. Edge case verification
   - Employees with multiple wins
   - Department transfers
   - Name changes
   - Recent hires

**Deliverable**: Reconciliation report with >99% accuracy

#### Evaluation Data Reconciliation
**Objective**: Verify all historical MRE data accurately migrated

**Steps:**
1. Compare record counts
   - Source count vs. database count per cycle
   - Verify all staff evaluated

2. Recalculate sample scores
   - Select 10% of results
   - Recalculate final scores
   - Verify against imported values

3. Verify edge cases
   - Incomplete evaluations
   - Missing evaluators
   - Score adjustments

**Deliverable**: Reconciliation report with >99% accuracy

### User Acceptance Testing

#### Test Scenarios
1. **View Historical Awards**
   - User views EOM history
   - Filters by department
   - Searches for specific winner

2. **Check Eligibility**
   - User nominates someone
   - System checks eligibility
   - Rotation lock correctly enforced

3. **View Evaluation Results**
   - Admin views evaluation history
   - Drills down into individual results
   - Verifies calculations

**Acceptance Criteria:**
- All scenarios pass
- Data displays correctly
- No performance issues
- User feedback positive

## Rollback Procedures

### When to Rollback
Rollback if:
- Critical data integrity issues discovered
- >5% of records failed to migrate
- System instability after migration
- Cannot resolve issues within 24 hours

### Rollback Steps

#### Step 1: Stop New System
```bash
# Disable new system endpoints
# Communicate to users

# Log rollback decision
echo "$(date): Rollback initiated. Reason: [REASON]" >> migration_rollback.log
```

#### Step 2: Restore Database
```bash
# Restore from pre-migration backup
pg_restore --dbname=ese_db --clean backup_before_migration.dump

# Or for SQLite:
cp backup_before_migration.db app.db

# Verify restoration
python backend/scripts/count_records.py --environment production
```

#### Step 3: Verify Legacy System
1. Confirm legacy data intact
2. Verify user access
3. Test key functionality

#### Step 4: Communicate
1. Notify stakeholders of rollback
2. Explain issues encountered
3. Provide new timeline for migration
4. Document lessons learned

#### Step 5: Post-Rollback Analysis
1. Analyze root cause of failure
2. Update import scripts
3. Test fixes in development
4. Re-test in test environment
5. Schedule new migration window

## Data Mapping Reference

### EOM Categories Mapping

| Legacy Category | New System Category |
|----------------|---------------------|
| "Teaching" | TEACHING_EXCELLENCE |
| "Innovation" | INNOVATION |
| "Team Player" | TEAMWORK |
| "Leadership" | LEADERSHIP |
| "Admin Excellence" | SERVICE_EXCELLENCE |
| "Student Support" | STUDENT_ADVOCACY |

### Department Mapping

| Legacy Department | Current Department |
|------------------|-------------------|
| "Primary" | "Primary School" |
| "Preparatory" | "Preparatory School" |
| "Secondary" | "Secondary School" |
| "Admin" | "Administration" |
| "IT" | "Information Technology" |

### Staff Type Mapping

| Legacy Role | Staff Type |
|------------|------------|
| "Teacher" | ACADEMIC |
| "Coordinator" | ACADEMIC |
| "Principal" | ACADEMIC |
| "Admin Staff" | ADMINISTRATIVE |
| "IT Staff" | ADMINISTRATIVE |

## Validation Queries

### Recognition Data Validation
```sql
-- Count awards by year
SELECT 
  strftime('%Y', granted_at) as year,
  COUNT(*) as award_count
FROM award
WHERE award_type = 'EMPLOYEE_OF_MONTH'
GROUP BY year;

-- Check for rotation lock violations
SELECT 
  e1.recipient_name,
  e1.granted_at as first_award,
  e2.granted_at as second_award,
  julianday(e2.granted_at) - julianday(e1.granted_at) as days_between
FROM award e1
JOIN award e2 ON e1.recipient_id = e2.recipient_id
WHERE e1.id != e2.id
  AND julianday(e2.granted_at) - julianday(e1.granted_at) < 90
ORDER BY days_between;
```

### Evaluation Data Validation
```sql
-- Count evaluations per cycle
SELECT 
  cycle_period,
  COUNT(*) as result_count
FROM evaluation_result
GROUP BY cycle_period;

-- Check for missing evaluations
SELECT 
  cycle_period,
  COUNT(DISTINCT evaluee_id) as unique_evaluees
FROM evaluation_result
GROUP BY cycle_period;

-- Verify score ranges
SELECT 
  MIN(final_score) as min_score,
  MAX(final_score) as max_score,
  AVG(final_score) as avg_score
FROM evaluation_result;
```

## Contingency Plans

### Issue: Import Script Failures
**Symptoms**: Script crashes, data not imported
**Resolution**:
1. Check error logs
2. Fix data issues in source files
3. Re-run import for failed records only
4. Validate results

### Issue: Performance Degradation
**Symptoms**: Slow queries, timeouts
**Resolution**:
1. Check database indexes
2. Analyze query plans
3. Add missing indexes
4. Optimize problematic queries

### Issue: Data Integrity Violations
**Symptoms**: Foreign key errors, duplicate records
**Resolution**:
1. Identify violating records
2. Clean data in source
3. Delete incomplete imports
4. Re-import clean data

## Success Criteria

- [x] 100% of historical EOM awards migrated
- [x] 100% of last 3 MRE cycles migrated
- [x] <1% data discrepancies
- [x] Zero data loss
- [x] All validation queries pass
- [x] User acceptance testing passed
- [x] System performance maintained
- [x] Complete audit trail documented

## Contact & Support

### Migration Team
- **Migration Lead**: P&C Head
- **Technical Lead**: IT Specialist (mahmoud.hassan@ese.edu.eg)
- **Data Quality**: HR Coordinator
- **Testing Lead**: System Administrator

### Escalation Path
1. Technical issues → IT Specialist
2. Data issues → HR Coordinator  
3. Policy decisions → P&C Head
4. Critical issues → CEO

---

**Document Version**: 1.0  
**Last Updated**: February 2025  
**Migration Owner**: P&C Head  
**Technical Owner**: IT Specialist
