# Communications Governance

## Channels & Templates
- Supported channels: email, SMS, mobile push. Each template defines locale variants (EN/AR) and accessibility requirements (WCAG 2.1 AA).
- Templates stored with required footer, opt-out language, and quiet hour policy references.
- Approval workflow: draft → legal/compliance review → principal approval → publish.

## Content Controls
- Banned phrases list maintained by compliance; validation runs at template publish and dispatch time.
- Emergency keywords immediately escalate to human operator and bypass quiet hours.
- Personalization placeholders limited to non-sensitive fields (student first name, homeroom, event date).

## Quiet Hours & Rate Limits
- Default quiet hours 21:00–07:00 Africa/Cairo unless emergency.
- Guardians can opt into alternate windows via preferences stored in core context.
- Dispatch rate limited per channel to prevent spam and ensure provider compliance.

## Audit & Reporting
- Every dispatch logs: template_id, channel, actor_id, audience_segment_id, correlation_id, delivery stats.
- Reports available to district admins and principals, with CSV/PDF exports via reporting context.
- Opt-out actions and consent changes recorded as domain events (`comms.preference_updated`).

## Incident Handling
- Failed deliveries trigger retries with exponential backoff; after 3 failures, escalate to support agent queue.
- Provider outages require toggling feature flag to pause dispatch while notifying stakeholders.
- Post-incident review documents root cause, impacted audiences, and remediation steps.

## Compliance Alignment
- SMS content complies with local telecom regulations; opt-out keyword `STOP` respected instantly.
- Email includes unsubscribe link and school contact information.
- COPPA/FERPA considerations limit student communications to academic context and guardian-approved content.
