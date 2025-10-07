# Observability Standards

## Logging
- Structured JSON logs using `loguru` or standard logging with extra fields.
- Mandatory fields: `timestamp`, `level`, `context`, `correlation_id`, `request_id`, `actor_id` (if available), `event_name`.
- One error log per failure path; stack traces captured for severity ≥ ERROR.
- PII scrubbed via middleware; only hashed identifiers stored.

## Metrics
- Prometheus metrics exposed at `/metrics` with:
  - Request latency histograms per route (target P95 < 300 ms).
  - Job duration and queue depth gauges for background tasks.
  - Event bus throughput counters per `<context>.<event>`.
- Alert thresholds defined for latency spikes, Redis lag, and failed jobs.

## Tracing
- OpenTelemetry instrumentation on FastAPI, SQLAlchemy, Redis, and Celery/RQ.
- Traces propagate `traceparent` header and correlate with domain events.
- Sampling rate default 20%, with tail-based sampling for errors.

## Dashboards
- Grafana dashboards per context showing key metrics, error budgets, and recent deployments.
- Kibana dashboards for log search with saved filters on correlation IDs.

## Incident Workflow
1. Alert triggers via Prometheus or SIEM.
2. On-call uses dashboards to identify scope and correlation IDs.
3. Rollback or feature flag toggles applied if mitigation required.
4. Post-incident review logged in reporting context with action items.

## Observability in Development
- Local development uses console JSON logs and Jaeger all-in-one container.
- Tests assert presence of correlation IDs and absence of PII in logs.
- Make targets `make observe-up` and `make observe-down` manage local stack.
