# CoachAI Platform — Architecture & Technical Specification
**Version:** 1.0
**Date:** March 2026
**Status:** Draft for Review
**Classification:** Confidential

---

## Executive Summary

CoachAI is an AI-powered business coaching platform delivered as a native desktop application (macOS, Windows) and iOS mobile app. The platform combines a structured coaching curriculum with a persistent, context-aware AI coach that users can engage with at any time through text or voice to develop real business skills in leadership, management, communication, goal-setting, and personal career development.

Subscription-based, multi-tenant, deployed entirely on AWS. Designed for 99.9% availability, sub-second voice response latency, and linear scale from hundreds to hundreds of thousands of users without architectural change.

Coaching model: users complete skill modules, practice through weekly AI-led refreshers for four weeks, and are formally evaluated at end of each cycle. All coaching is interactive and interruptible.

---

## 1. System Context & Scope

### Primary Users

- **Learner** — Individual being coached. Engages curriculum, free-form AI conversations, evaluations, goals, audio content.
- **Manager/Team Lead** — Aggregated team progress view. No access to individual session content.
- **Organization Admin** — Manages seats, teams, program enrollment, org analytics, SSO (enterprise).
- **Platform Admin (Internal)** — Operations, content management, tenant provisioning, support.

### Out of Scope (v1.0)

- Human coaching marketplace / human-AI hybrid sessions
- LMS integration with external content libraries
- Performance management system integration
- Real-time manager observation of learner sessions
- Video coaching

### Key Assumptions

- Initial LLM: Anthropic Claude (provider-agnostic by design)
- Payments in USD (multi-currency in v2)
- SOC 2 Type II target within 12 months of launch
- GDPR and CCPA compliance required at launch

---

## 2. Business Requirements

### Subscription Tiers

| Tier | Target | Seats | Key Differentiators |
|------|--------|-------|---------------------|
| Starter | Individual | 1 | Full AI coach, core curriculum, voice |
| Team | Small teams | 2-25 | Team cohorts, manager progress view |
| Business | SMB | 26-250 | Admin dashboard, advanced analytics, API access |
| Enterprise | 250+ | Unlimited | SSO, data residency, SLA, dedicated support, custom curriculum |

### Revenue

- Stripe for all billing, invoicing, payment processing
- Monthly and annual billing (annual at discount)
- Self-serve seat management (Starter through Business)
- Enterprise net-30 invoicing
- Dunning management with grace period, retry, suspension

### Compliance

- GDPR at launch
- CCPA at launch
- SOC 2 Type II within 12 months
- Data residency (US or EU) for Enterprise

---

## 3. Functional Requirements

### Coaching Curriculum Engine

- Library of skill modules by domain: Leadership, Management, Communication, Strategy, Career Development, Emotional Intelligence
- Each module: learning objective, coaching scaffold (20-30 min), competency rubric, 4 weekly micro-refresher templates, formal evaluation scenario
- Curriculum graph with prerequisite/co-requisite relationships
- Custom curriculum modules at Enterprise tier
- Content versioning; users complete version they enrolled in

### AI Conversation Engine

- Persistent context payload per user: role, industry, goals, program state, evaluation history, conversation summary
- Free-form topic changes via intent detection with session state bookmarking
- Adaptive coaching style (direct/Socratic/supportive) based on user preference
- Behavioral pattern detection (topic avoidance, commitment follow-through)
- Auto-generated session summaries (>5 min or >10 exchanges)
- Scenario injection for high-pressure business situations
- Proactive coaching prompts based on calendar events (45-min window default)

### Four-Week Cadence

- On skill completion: auto-schedule 4 weekly micro-refreshers + formal evaluation at week 4+1
- Timezone-aware, respects quiet hours
- Missed refreshers trigger grace period, not automatic failure
- Pause/resume support (vacation mode)

### Evaluation Engine

- Structured AI-driven roleplay scenarios (AI plays direct report, peer, executive)
- Scoring across multiple competency dimensions (0-100 per dimension) with qualitative feedback
- Indefinite evaluation history with longitudinal progress view
- Re-evaluation available after 72-hour cooldown
- Anonymized aggregate scores visible to admins; individual scores require learner opt-in for manager access

### Voice & Audio

- Full duplex voice conversation, ≤800ms p95 latency
- VAD end-of-utterance detection within 500ms
- User interruption: AI halts TTS immediately, processes as new turn
- Audio talk library (8-15 min each), variable speed (0.75x-2x), chapter markers
- Offline audio download (iOS)
- Post-talk debrief session
- Full CarPlay experience: playback, voice conversation, hands-free navigation
- AirPods/Bluetooth continuity on desktop

### Goal Management

- Goals: statement, success criteria, target date, skill linkage
- AI actively references goals in sessions, measures progress, suggests connected skills
- Check-in prompts if no check-in in 7 days (configurable)
- Post-event reflections linked to skills and goals

---

## 4. Non-Functional Requirements

### Performance

| Metric | Target |
|--------|--------|
| Voice latency (p95) | ≤ 800ms (client, first audio byte) |
| Text AI response first token (p95) | ≤ 1,200ms |
| API response non-AI (p95) | ≤ 200ms |
| Page/screen load (p95) | ≤ 2,000ms |
| Audio stream start | ≤ 1,000ms |
| Evaluation scoring | ≤ 5,000ms |

### Availability

| Tier | SLA | RTO | RPO |
|------|-----|-----|-----|
| SMB | 99.9% | ≤ 4 hours | ≤ 15 min |
| Enterprise | 99.95% | ≤ 1 hour | ≤ 5 min |

### Security

- TLS 1.3 in transit; AES-256 at rest
- Zero Trust network model
- Secrets via AWS Secrets Manager (no secrets in code)
- OWASP Top 10 addressed at application layer
- Semi-annual penetration testing
- Vulnerability scanning in CI/CD

---

## 5. System Architecture Overview

Six logical layers:

1. **Client Layer** — iOS app, macOS/Windows desktop. HTTPS/WSS to API Gateway.
2. **API Gateway Layer** — Amazon API Gateway. Rate limiting, auth validation, routing.
3. **Application Services Layer** — Stateless microservices on EKS: Auth, User, Coaching Engine, Curriculum, Evaluation, Scheduling, Goals, Notifications, Billing, Analytics, Admin, Content.
4. **AI Orchestration Layer** — Dedicated AI Service: context assembly, prompt management, model routing. Voice Service: real-time audio pipeline.
5. **Data Layer** — Aurora PostgreSQL (relational), DynamoDB (conversations), ElastiCache Redis (sessions/cache), S3 (audio/media), OpenSearch (search/analytics).
6. **Platform Layer** — AWS managed services: Cognito, CloudFront, Route 53, SQS/SNS/EventBridge, Secrets Manager, KMS, CloudWatch/X-Ray, WAF/Shield.

### Key Architectural Decisions

- **Multi-tenancy:** Shared infrastructure, logical isolation via tenant_id partitioning + Aurora RLS. Enterprise option: dedicated schema.
- **AI provider abstraction:** Single AI Orchestration Service. Switching LLM providers requires no client changes.
- **Voice-first pipeline:** Separate low-latency voice service path to meet 800ms SLA.
- **Event-driven scheduling:** EventBridge + SQS, not cron/polling.
- **Defensive data architecture:** PII vault with field-level encryption. Downstream services use pseudonymous IDs only.

---

## 6. AWS Infrastructure

### Region Strategy

- **Primary:** us-east-1 (N. Virginia)
- **Secondary:** us-west-2 (Oregon) — warm standby DR
- **EU:** eu-west-1 (Ireland) — Enterprise EU data residency

### Network

```
VPC: 10.0.0.0/16
├── Public Subnets (3 AZs)       — ALB, NAT Gateways
├── Private App Subnets (3 AZs)  — EKS workers, Lambda
├── Private Data Subnets (3 AZs) — Aurora, ElastiCache, OpenSearch
└── Management Subnet            — Bastion (SSM), monitoring
```

VPC Endpoints for all AWS services. No internet traffic from private subnets. PrivateLink for third-party integrations (Stripe, ElevenLabs).

### EKS Node Groups

| Group | Instance | Purpose | Scaling |
|-------|----------|---------|---------|
| general | m6i.xlarge | Standard services | 3-30 |
| ai-intensive | c6i.4xlarge | AI Orchestration, Evaluation | 2-20 |
| voice | c6i.2xlarge | Voice Service | 3-15 |
| monitoring | m6i.large | Observability | 2 fixed |

Cluster Autoscaler + Karpenter. Pod Disruption Budgets. HPA on CPU + custom metrics. Fargate for batch jobs.

### Database Layer

- **Aurora PostgreSQL** — Primary store. Multi-AZ, Global Database, 15 read replicas, RDS Proxy, 35-day PITR.
- **DynamoDB** — Conversations, session state. On-demand, Global Tables (us-east-1 + us-west-2), DAX, single-table design with tenant_id prefix.
- **ElastiCache Redis** — Sessions, AI context cache (15-min TTL), rate limiting, feature flags. 3-node cluster, Multi-AZ.
- **OpenSearch** — Search, analytics aggregations. 3-node, Multi-AZ, UltraWarm for historical data.
- **S3** — Audio content, user media (24hr retention), exports (30d), backups. All buckets: versioning, SSE-KMS, public access blocked, Object Lock on audit/backup.

### SQS Queues

coaching-events, evaluation-jobs, notification-dispatch, billing-events (FIFO), cadence-triggers, analytics-ingest

All queues have DLQ with CloudWatch alarms.

---

## 7. Multi-Tenancy

### Isolation Enforcement

1. ORM interceptor appends `AND tenant_id = :current_tenant_id` to every query
2. API Gateway authorizer resolves tenant_id from JWT, injects as trusted request context
3. Aurora RLS as second layer of defense
4. DynamoDB: `PK = TENANT#{tenant_id}#USER#{user_id}`

### Tenant Provisioning

Automated, completes within 60 seconds:
Stripe webhook → `SubscriptionCreated` event → Lambda creates tenant record → admin user + invitation → default curriculum assigned → analytics partition initialized

### Resource Limits

| Resource | Starter | Team | Business | Enterprise |
|----------|---------|------|----------|------------|
| Concurrent AI sessions | 1 | 10 | 100 | Configurable |
| Concurrent voice sessions | 1 | 5 | 50 | Configurable |
| API requests/min | — | — | 500 | Custom |

---

## 8. Security Architecture

### Principles

- **Zero Trust** — Every service-to-service call authenticated. No implicit network trust.
- **Least Privilege** — IAM IRSA per service. Deny-by-default. SCPs prevent public S3, CloudTrail disable, GuardDuty deletion.
- **Defense in Depth** — Controls at network, application, data, operational layers.
- **Privacy by Design** — PII minimized, isolated in vault, pseudonymous IDs downstream.

### Encryption

- External: TLS 1.3. Internal: mTLS via Istio.
- At rest: AES-256, KMS CMKs per data classification tier, annual auto-rotation.
- PII vault: field-level envelope encryption (data key per user, encrypted with tenant CMK).

### Application Security

- Input validation at API Gateway + service layer. Parameterized queries.
- Output encoding, CSP headers, OWASP Top 10 checklist per release.
- Distroless container images, ECR scanning, no root containers, SBOM per release.

### Audit Logging

Immutable: DynamoDB append-only table + S3 Object Lock COMPLIANCE mode, 7-year retention.
Covers: auth events, authorization decisions, PII vault access, admin actions, subscription changes, tenant provisioning.

---

## 9. Authentication & Authorization

### Authentication

- Amazon Cognito User Pools
- Access tokens: 1hr JWT. Refresh tokens: 30 days, rotated on use.
- TOTP MFA: available all users, required for admins. No SMS MFA.
- Password: 12-char minimum, HaveIBeenPwned breach detection.

### Enterprise SSO

SAML 2.0 + OIDC via Cognito. JIT provisioning. Supported: Okta, Azure AD/Entra ID, Google Workspace, PingFederate.

### RBAC

| Role | Permissions |
|------|------------|
| Learner | Own data only |
| Manager | Aggregate team; per-learner with consent |
| Org Admin | Users, teams, billing; no session content |
| Content Admin | Curriculum; no tenant data |
| Platform Admin | Tenant support; all actions logged; MFA + PAM |

---

## 10. Data Architecture

### Data Classification

| Class | Examples | Controls |
|-------|---------|----------|
| PII | Name, email, phone | PII vault, encrypted, access logged |
| Sensitive | Transcripts, evaluation scores, goals | Encrypted, tenant-isolated |
| Internal | Usage metrics, billing | Encrypted, role-restricted |
| Public | Curriculum metadata | Standard |

### Core Entities

Tenant > User > Enrollment > Session > Conversation (DynamoDB)
Tenant > User > Evaluation
Tenant > User > Goal > CheckIn
Tenant > Subscription (Stripe)
Program > SkillSequence > Skill > Rubric / EvaluationScenario / RefresherTemplates / ContentTalks

### Data Retention

| Data Type | Retention |
|-----------|-----------|
| Conversation history | Subscription + 90 days |
| Evaluation records | Indefinite (user-deletable) |
| Session metadata | 3 years |
| Audit logs | 7 years |
| Voice recordings (raw) | 24 hours auto-delete |
| TTS cache | 7 days |

---

## 11. AI & Coaching Engine

### Context Assembly Pipeline (per LLM call)

1. User Profile (role, industry, coaching style pref)
2. Program State (current skill, cadence position, recent eval scores)
3. Goal Context (active goals, last check-in, open commitments)
4. Conversation History (rolling session summaries + last K messages)
5. Skill Scaffold (competency model, key questions, scenario templates)
6. Session Intent (curriculum / free-form / refresher / evaluation / crisis / debrief)
7. Behavioral Observations (pattern flags)

Context cached in Redis: `ctx:{user_id}:{session_id}`, 15-min TTL.

### Model Routing

| Task | Model |
|------|-------|
| Active coaching conversation | claude-opus-4-5 |
| Formal evaluation scoring | claude-opus-4-5 |
| Session summary generation | claude-sonnet-4-5 |
| Intent detection | claude-haiku-4-5 |
| Refresher sessions | claude-sonnet-4-5 |
| Voice conversation | claude-sonnet-4-5 |

### Evaluation Scoring Pipeline

Session complete → SQS job → Lambda → AI scoring (structured JSON rubric) → validation pass (flags outliers for human QA) → Aurora write → user notification. 2-5% routed to human QA queue for calibration.

### RAG Knowledge Base

Embeddings: Amazon Bedrock Titan. Vector store: pgvector on Aurora. Top-5 chunks by cosine similarity. Sources: coaching frameworks, research, audio talk content, user's own session summaries.

---

## 12. Voice & Audio Architecture

### Pipeline

```
Client → WebRTC (DTLS-SRTP) → Voice Service (EKS c6i.2xlarge)
  → AWS Transcribe Streaming (STT, partial transcripts to UI)
  → Server-side Silero VAD (end-of-utterance detection)
  → AI Orchestration Service (WebSocket, streaming response)
  → ElevenLabs Streaming API (TTS)
  → Audio chunks streamed back to client
```

### Latency Budget

STT ~100ms + context assembly ~20ms + LLM TTFT ~300ms + TTS first chunk ~200ms + overhead ~100ms = **~720ms target (≤800ms SLA)**

### TTS

- Primary: ElevenLabs custom voice (warm, clear, gently authoritative)
- Fallback: Amazon Polly Neural
- TTS caching: common phrases pre-rendered in S3/CloudFront

### Voice Modes

- Standard coaching: standard pace, moderate stability
- Evaluation mode: slightly slower, clearer enunciation
- Crisis/support: warmer tone, slower pace
- CarPlay: shorter AI responses, minimal-distraction UI

### Interruption Handling

1. Client sends `INTERRUPT` WebSocket signal
2. Voice Service halts TTS stream immediately
3. Partial utterance logged
4. New STT stream begins
5. AI Orchestration adapts response (acknowledges interruption, doesn't repeat)

### CarPlay

CPTemplateApplicationScene. Now Playing, List, Voice templates. Siri: "Hey Siri, open my coaching session." Siri Shortcuts for common actions.

---

## 13. API Architecture

### Design Principles

- REST for CRUD; WebSocket for real-time
- Error format: `{ error: { code, message, details, request_id } }`
- URL versioning: /v1/, /v2/ (no breaking changes within version)
- Idempotency keys on mutating operations
- Cursor-based pagination (not offset)
- OpenAPI 3.1 as source of truth (see docs/api/openapi.yaml)

### Rate Limits

| Tier | Requests/min | WebSocket connections | Concurrent AI sessions |
|------|-------------|----------------------|----------------------|
| Starter | 60 | 1 | 1 |
| Team | 300 | 10 | 10 |
| Business | 2,000 | 100 | 100 |
| Enterprise | Custom | Custom | Custom |

Burst: 2x sustained for up to 30 seconds.

### WebSocket Message Types (key)

Client → Server: SESSION_START, USER_MESSAGE, AUDIO_CHUNK, VAD_SPEECH_START, VAD_SPEECH_END, INTERRUPT, SESSION_END, PING

Server → Client: AI_MESSAGE_START, AI_TOKEN, AI_MESSAGE_END, AUDIO_CHUNK, TRANSCRIPT, INTENT_DETECTED, SESSION_SUMMARY, CADENCE_UPDATE, ERROR, PONG

---

## 14. Mobile Architecture (iOS)

- Pattern: MVVM + Coordinator, clean architecture layers
- Min iOS: 16
- Key frameworks: SwiftUI, Combine, AVFoundation, SFSpeechRecognizer, CarPlay, BackgroundTasks, CoreData, CryptoKit, AuthenticationServices
- Offline: Core Data local DB, Background URLSession for downloads, NWPathMonitor for sync
- Audio session: single AVAudioSession handles route changes, interruptions, background audio
- Security: Keychain, NSFileProtectionComplete, cert pinning, Face ID/Touch ID

---

## 15. Desktop Architecture

- Framework: Electron (Node.js + React/TypeScript). macOS + Windows single codebase.
- Future consideration: Tauri migration post-stabilization
- Process model: Main (window mgmt, system tray, IPC, audio, OS creds, auto-update) + Renderer (React UI, WebSocket) + Audio Worker (dedicated thread)
- Calendar integration: EventKit native addon (macOS), Microsoft Graph API (Windows). Calendar data processed locally, not stored server-side.
- Security: OS native credential store (keytar), contextIsolation: true, nodeIntegration: false, allowedNavigation whitelist

---

## 16. Subscription & Billing

### Stripe Integration

One Stripe Customer per tenant. Products/Prices per tier × billing period. Per-seat quantity billing. Proration on changes.

### Dunning Sequence

- Day 0: Payment fails → Stripe Smart Retries
- Day 3: Retry + admin email
- Day 7: Retry + in-app warning banner
- Day 14: Account suspended (read-only, data export available)
- Day 30: Deletion scheduled, 7-day final window

### Enterprise Invoicing

Net-30, ACH/wire, PO number support, multi-year contracts.

---

## 17. Notification System

### Channels

APNs (iOS), FCM/native (desktop), Amazon SES (email), WebSocket (in-app), Slack Webhooks, Teams Webhooks (Business+)

### Smart Throttling

- 3 engagement notifications/day max per user
- Quiet hours respected (default: 10pm-8am local)
- No notifications within 30 min of active session
- Fatigue detection: if 5 consecutive notifications of a type unengaged, frequency halved

---

## 18. Analytics & Reporting

### Pipeline

```
App Services → SQS → Kinesis Firehose → S3 (raw)
  → AWS Glue ETL (nightly)
  → Redshift
  → QuickSight (admin dashboards) / OpenSearch (in-app) / Redshift Serverless (Enterprise BI)
```

All events pseudonymized before leaving application services. PII resolved at query time.

### Individual Analytics

Skills progress, evaluation score history (longitudinal), goal completion rate, commitment follow-through, session frequency/duration, recommended next skills.

### Admin Analytics

Enrollment/completion rates, org-wide skill proficiency heatmap, team comparisons (anonymized), engagement metrics, churn risk signals, ROI narrative.

---

## 19. Scalability & Performance

- HPA + Karpenter for stateless service scaling
- Aurora: up to 15 read replicas, RDS Proxy for read-write splitting
- DynamoDB: on-demand + DAX for hot reads
- CloudFront: audio content edge-cached at 450+ locations

### Load Test Targets

| Scenario | Target |
|----------|--------|
| Concurrent voice sessions | 10,000 |
| Concurrent text sessions | 50,000 |
| API RPS (steady) | 50,000 |
| API RPS (burst) | 150,000 |
| Audio concurrent streams | 100,000 |
| Evaluation jobs/hour | 20,000 |

---

## 20. Disaster Recovery

| Tier | RTO | RPO |
|------|-----|-----|
| SMB | ≤ 4 hours | ≤ 15 min |
| Enterprise | ≤ 1 hour | ≤ 5 min |

- Aurora Global Database secondary in us-west-2 (<1s replication lag)
- DynamoDB Global Tables (active-active)
- Route 53 health check failover: checks every 10s, fails after 3 consecutive, DNS TTL 60s
- DR drills quarterly; results documented

---

## 21. Monitoring & Observability

### Three Pillars

**Metrics:** CloudWatch with custom namespaces per domain. Key metrics per service: request rate, error rate, latency (p50/p95/p99), active sessions, LLM call stats, queue depths, cache hit rates, business metrics.

**Logging:** Structured JSON. Mandatory fields: timestamp, level, service, tenant_id, user_id (pseudonymous), request_id, trace_id. 90d CloudWatch → 365d OpenSearch → 7yr S3 Glacier (audit).

**Tracing:** AWS X-Ray. 5% sampling + 100% errors + 100% high-latency requests.

### Alerting

PagerDuty. P1 (5 min): platform unavailable, data breach. P2 (15 min): voice SLA breach, >5% error rate. P3 (1 hr): service degraded. P4 (next day): non-critical anomaly.

---

## 22. CI/CD & Engineering Practices

### Repository (Nx Monorepo)

- apps/api-gateway, apps/ios, apps/desktop
- services/* (Node.js/TypeScript microservices)
- packages/shared, packages/ai-sdk
- infra/* (AWS CDK)
- content/* (curriculum, prompts)

### Pipeline

PR: lint → typecheck → unit tests → integration tests → security scan → container build → staging deploy

Merge to main: all PR checks → E2E (Playwright) → performance regression (k6) → OWASP ZAP → blue/green production deploy → smoke tests → auto-rollback on failure

### Deployment

Blue/green via CodeDeploy: 0% → 10% → 50% → 100% over 30 minutes with auto-rollback threshold.

DB migrations: backward-compatible, run as Kubernetes Jobs pre-deploy.

Feature flags: LaunchDarkly / AWS AppConfig. All new features behind flags.

### Test Coverage Targets

| Level | Framework | Target |
|-------|-----------|--------|
| Unit | Jest / XCTest | 80% line coverage |
| Integration | Jest + testcontainers | Key integrations |
| Contract | Pact | All service boundaries |
| E2E | Playwright | Critical user journeys |
| Performance | k6 | Key endpoints |
| Security | OWASP ZAP + CodeQL | Full surface |

---

## 23. Compliance & Privacy

### GDPR

All data subject rights implemented (access, erasure, portability, rectification, restriction, object). Automated, 72-hour response for access/portability. DPAs with all sub-processors (AWS, Anthropic, Stripe, ElevenLabs). SCCs for cross-border transfers.

### SOC 2 Type II

All five Trust Services Criteria addressed by design. Evidence collection automated via AWS Config + CloudTrail + Security Hub. Target: certified within 12 months of launch.

### AI-Specific Privacy

- No training on customer data without explicit opt-in (contractually enforced with Anthropic)
- Users always clearly informed they're interacting with AI
- Human review available for any automated evaluation
- Evaluation scores always accompanied by explanatory feedback

---

## 24. Deployment Roadmap

### Phase 1 — SMB MVP (Months 1-4)
Core infrastructure, Starter + Team tiers, text AI coaching, 10 foundational skills, 4-week cadence, evaluation engine, iOS app (text), macOS desktop, Stripe billing, basic admin.

Exit: 100 paying customers, NPS > 40, p95 < 500ms, zero P1 in final 30 days.

### Phase 2 — SMB Full Feature (Months 5-9)
Voice + audio pipeline, CarPlay, audio library (20+ talks), Business tier, advanced analytics, goal management, real-world feedback loop, Windows desktop, calendar integration, Slack/Teams, team cohorts, SOC 2 audit commenced.

Exit: 1,000 paying customers, voice success > 98%, evaluation completion > 60%.

### Phase 3 — Enterprise (Months 10-16)
Enterprise tier, SSO (SAML/OIDC), EU data residency, custom curriculum, dedicated schema, enterprise BI, SLA guarantees, SOC 2 Type II certified.

Exit: 10 enterprise customers, SOC 2 certified, 99.95% availability over trailing 90 days.

---

## Appendix A — Subscription Tier Comparison

| Feature | Starter | Team | Business | Enterprise |
|---------|---------|------|----------|------------|
| Seats | 1 | 2-25 | 26-250 | Unlimited |
| AI Coaching (text + voice) | ✓ | ✓ | ✓ | ✓ |
| Audio Talk Library | ✓ | ✓ | ✓ | ✓ |
| CarPlay + Offline Audio | ✓ | ✓ | ✓ | ✓ |
| 4-Week Cadence + Evaluations | ✓ | ✓ | ✓ | ✓ |
| Goal Tracking | ✓ | ✓ | ✓ | ✓ |
| Team Cohorts | — | ✓ | ✓ | ✓ |
| Manager Progress View | — | ✓ | ✓ | ✓ |
| Admin Dashboard | — | Basic | Advanced | Custom |
| Org Analytics + Team Skill Gap | — | — | ✓ | ✓ |
| Calendar Integration | — | — | ✓ | ✓ |
| Slack / Teams Notifications | — | — | ✓ | ✓ |
| Pulse Surveys (360) | — | — | ✓ | ✓ |
| API Access | — | — | ✓ | ✓ |
| Custom Curriculum | — | — | — | ✓ |
| SSO (SAML / OIDC) | — | — | — | ✓ |
| Data Residency | — | — | — | ✓ |
| Dedicated DB Schema | — | — | — | ✓ |
| SLA Guarantee | — | — | 99.9% | 99.95% |
| Support | Email | Email | Priority | Dedicated CSM |
| Billing | Monthly/Annual | Monthly/Annual | Monthly/Annual | Invoice/Card |

---

## Appendix B — AWS Services Reference

| Service | Purpose | Tier |
|---------|---------|------|
| Amazon EKS | Container orchestration | Core |
| AWS Lambda | Event-driven compute | Core |
| Aurora PostgreSQL | Primary relational database | Core |
| DynamoDB | Conversation storage, session state | Core |
| ElastiCache Redis | Caching, sessions, rate limiting | Core |
| OpenSearch | Search, analytics | Core |
| S3 | Audio, media, backups | Core |
| CloudFront | CDN | Core |
| API Gateway | REST + WebSocket | Core |
| Cognito | Auth, SSO | Core |
| SQS / SNS / EventBridge | Messaging, events | Core |
| Secrets Manager / KMS | Secrets, encryption | Core |
| Route 53 | DNS, failover | Core |
| WAF + Shield Advanced | Security | Core |
| CloudWatch + X-Ray | Observability | Core |
| Kinesis Firehose + Redshift + Glue | Analytics pipeline | Analytics |
| QuickSight | Admin dashboards | Analytics |
| Macie + GuardDuty + Security Hub | Security posture | Security |
| Config + CloudTrail + Inspector | Compliance + audit | Security |
| IAM Access Analyzer + Firewall Manager | IAM + WAF mgmt | Security |
| RDS Proxy + DAX | Performance | Performance |
| CodePipeline + ECR + CDK | DevOps | DevOps |

---

*CoachAI Platform Architecture & Technical Specification v1.0*
*Confidential — For internal and authorized partner use only*
