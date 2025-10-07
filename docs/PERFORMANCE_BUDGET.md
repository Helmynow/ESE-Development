# Performance Budget

## Service-Level Objectives
- API latency P95 ≤ 300 ms, P99 ≤ 500 ms.
- Background job completion ≤ 2 minutes for enrollment provisioning and reporting generation.
- Redis event processing lag ≤ 5 seconds.
- Error rate ≤ 1% per 5-minute window.

## Resource Targets
- Application container memory ≤ 512 MB; CPU ≤ 1 vCPU per replica under nominal load.
- Database connections ≤ 75% of pool capacity (max 40 concurrent connections).
- Redis memory utilization ≤ 70% to avoid eviction.

## Frontend Performance
- Largest Contentful Paint ≤ 2.5s on 3G Fast baseline.
- Total blocking time ≤ 200 ms.
- Bundle size budget ≤ 250 KB per route (after gzip) via code splitting and tree shaking.

## Monitoring & Enforcement
- CI includes Lighthouse runs for key Next.js pages.
- Prometheus alerts for latency violations, queue depth, and resource saturation.
- Feature flags gate high-cost features; new endpoints must include performance test plan before merge.

## Optimization Playbook
- Prefer async SQLAlchemy with prepared statements and pagination.
- Cache read-heavy data via Redis with explicit TTL and cache busting on updates.
- Use background jobs for long-running work (PDF generation, bulk notifications).
- Profile using `py-spy` or `scalene` pre-deployment for hotspots.
