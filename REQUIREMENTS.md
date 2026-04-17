# Quiz Application - Requirements (Draft)

Initial discovery document for issue #1. Consolidates a first pass at
functional and non-functional requirements and lists the open questions
we need the customer to answer before scope can be locked.

Everything below is provisional. Items marked "TBC" (to be confirmed)
depend on customer answers in the "Open Questions" section.

---

## 1. Functional Requirements

### 1.1 Accounts and Access
- User registration and login (email + password at minimum).
- Password reset via email.
- Roles: admin, quiz author, participant. Additional roles TBC.
- SSO / social login (Google, Microsoft, SAML, OIDC) - TBC.
- Guest / anonymous participation via invite link or code - TBC.
- Multi-tenancy (separate organizations / workspaces) - TBC.

### 1.2 Quiz Authoring
- Create, edit, duplicate, archive, and delete quizzes.
- Supported question types (MVP subset TBC):
  - Single choice
  - Multiple choice
  - True / false
  - Short text answer
  - Numeric answer
  - Ordering
  - Matching
  - Fill-in-the-blank
  - Free-text / essay (manual grading)
- Rich text and media (image, audio, video) in questions and answers.
- Per-question points, time limits, and difficulty tags.
- Question bank for reuse across quizzes; tagging and categorization.
- Randomization of question order and answer order.
- Question pools (pick N random from pool M).
- Versioning of quizzes; draft vs published states.
- Import / export (CSV, QTI, GIFT, Moodle XML) - TBC.

### 1.3 Quiz Delivery
- Public, unlisted, and invite-only quizzes.
- Join by link or short code.
- Scheduled availability windows (start / end date).
- Attempt limits (single, N attempts, unlimited).
- Time limits at quiz and question level.
- Resume after disconnect / browser refresh.
- Self-paced mode.
- Live / real-time mode (Kahoot-style, synchronized questions,
  leaderboard) - TBC.
- Anti-cheating controls: shuffle, copy-paste restriction, tab-switch
  detection, browser lockdown, proctoring integration - TBC.

### 1.4 Scoring, Feedback, and Results
- Automatic grading for objective question types.
- Manual grading UI for free-text / essay.
- Partial credit and weighted scoring.
- Per-question and per-quiz feedback (immediate, after submission,
  after review window).
- Pass / fail thresholds.
- Certificates of completion (PDF, optional Open Badges) - TBC.
- Retake policies and score aggregation (best, latest, average).

### 1.5 Participation Experience
- Responsive web UI (desktop, tablet, mobile).
- Progress indicator, navigation between questions (where allowed).
- Accessibility conformance - level TBC (WCAG 2.1 AA assumed).
- Localization of UI and quiz content; RTL support - languages TBC.
- Native mobile apps (iOS / Android) - TBC.

### 1.6 Analytics and Reporting
- Per-quiz aggregate statistics (completion rate, average score,
  time spent).
- Per-question statistics (difficulty, discrimination, distractor
  analysis).
- Per-user history and transcripts.
- Leaderboards (per quiz, per tenant) - TBC.
- Exports (CSV, XLSX, PDF).
- Dashboards for admins and quiz authors.

### 1.7 Notifications
- Email on invite, reminder, completion, grade available.
- In-app notifications.
- Webhooks to external systems.
- SMS / push - TBC.

### 1.8 Administration
- User management (invite, deactivate, role change).
- Tenant / organization management - TBC.
- Content moderation and audit log.
- Configurable policies (password, session, data retention).

### 1.9 Integrations and Extensibility
- REST (and/or GraphQL) public API.
- Webhooks for quiz lifecycle events.
- LMS integration: LTI 1.3, SCORM, xAPI - TBC.
- SSO providers: Google Workspace, Microsoft Entra ID, Okta, generic
  SAML / OIDC - TBC.
- Payment provider (if monetized) - TBC.

---

## 2. Non-Functional Requirements

### 2.1 Performance
- Target p95 latency for question load: < 300 ms.
- Target p95 latency for answer submission: < 500 ms.
- Live-mode tick latency: < 1 s end-to-end.
- Concrete numbers TBC based on expected scale.

### 2.2 Scalability
- Target concurrent users and peak load TBC.
- Horizontal scalability for stateless services.
- Stateful components (live-mode sessions) must scale to the peak
  number of simultaneous participants stated by the customer.

### 2.3 Availability and Reliability
- Target uptime SLA: 99.9% (TBC).
- RTO / RPO: TBC.
- Graceful degradation when analytics or email providers are down.
- Automated backups; tested restore procedure.

### 2.4 Security
- TLS 1.2+ for all traffic.
- Encryption at rest for databases and backups.
- Secrets management (no secrets in source).
- OWASP Top 10 mitigations; regular dependency scanning.
- Rate limiting and bot protection on public endpoints.
- Audit logging of admin and grading actions.
- Penetration test before GA - TBC.

### 2.5 Privacy and Compliance
- GDPR (data subject rights, DPA, records of processing).
- FERPA / COPPA if audience includes education or minors - TBC.
- HIPAA / SOC 2 / ISO 27001 - TBC.
- Data residency constraints (EU-only hosting, etc.) - TBC.
- Configurable data retention and deletion.

### 2.6 Observability
- Structured application logs with correlation IDs.
- Metrics (RED / USE) exposed to a monitoring system.
- Distributed tracing across services.
- Alerting on SLO burn, error rate, and queue depth.

### 2.7 Maintainability and Delivery
- CI/CD with automated tests on every PR.
- Unit, integration, and end-to-end test suites; coverage target TBC.
- Infrastructure as code.
- Documented runbooks for on-call scenarios.

### 2.8 Accessibility and Usability
- WCAG 2.1 AA (assumed; confirm with customer).
- Keyboard-only navigation.
- Screen-reader compatibility.
- Color-contrast compliance.

### 2.9 Supported Platforms
- Evergreen browsers: latest two versions of Chrome, Firefox, Safari,
  Edge.
- Mobile web: iOS Safari and Android Chrome (latest two versions).
- Native mobile apps - TBC.
- Offline mode - TBC.

### 2.10 Deployment and Operations
- Cloud target (AWS / Azure / GCP) - TBC.
- Single-region vs multi-region - TBC.
- On-prem or private-cloud option - TBC.
- Disaster-recovery strategy aligned with RTO / RPO.

### 2.11 Cost and Licensing
- Budget envelope for infrastructure and third-party services - TBC.
- Licensing constraints on dependencies (copyleft avoidance?) - TBC.

---

## 3. Open Questions for the Customer

Answers here drive the TBC items above and gate MVP scope.

### Audience and Use Case
1. Primary audience: K-12 education, higher education, corporate
   training, certification / exams, marketing / lead-gen, trivia /
   entertainment, or a mix?
2. Are quiz participants minors? (Drives COPPA / FERPA scope.)
3. Who are the competitors or reference products we should match or
   differentiate from?

### Scope and Modes
4. Live real-time multiplayer mode (Kahoot-style) required, self-paced
   only, or both?
5. Which question types are must-have for MVP vs nice-to-have later?
6. Is free-text / essay grading in scope for MVP? Any AI-assisted
   grading expected?
7. Are certificates or badges required at launch?

### Users and Tenancy
8. Who authors quizzes: a small internal team, or any registered user?
9. Do you need multi-tenancy (multiple independent organizations on
   one deployment)?
10. Role model beyond admin / author / participant (e.g., instructor,
    proctor, reviewer)?

### Scale and Performance
11. Expected number of registered users in year 1?
12. Expected peak concurrent participants, especially in live mode?
13. Are there seasonal spikes (exam windows, marketing campaigns)?

### Integrations
14. LMS integration required? Which standard - LTI 1.3, SCORM, xAPI?
15. SSO required? Which identity providers?
16. Email, SMS, push - which channels and which providers are
    preferred?
17. Any existing question banks or user data to import?

### Compliance, Privacy, Hosting
18. Data-residency requirements (EU-only, US-only, specific country)?
19. Compliance targets: GDPR, FERPA, COPPA, HIPAA, SOC 2, ISO 27001?
20. On-prem or private-cloud deployment needed, or SaaS only?
21. Required retention periods for user data and quiz results?

### Anti-Cheating and Integrity
22. How strict must anti-cheating be: shuffling only, tab-detection,
    browser lockdown, live proctoring, AI-based?
23. Is identity verification of participants required?

### Accessibility and Localization
24. Required accessibility level (WCAG 2.1 A, AA, AAA)?
25. Which UI languages are required at launch? RTL languages?
26. Must quiz content itself be authorable in multiple languages?

### Platforms
27. Native mobile apps required, or is responsive web sufficient?
28. Offline participation required?
29. Browser / OS support matrix beyond the defaults above?

### Commercials and Timeline
30. Monetization model: free, subscription, per-quiz, white-label,
    internal-only?
31. Billing provider preferences, if applicable?
32. Target MVP launch date and budget envelope?
33. Success metrics / KPIs for the first release?

### Operations
34. Who will operate the service post-launch (us, customer, shared)?
35. Required SLA and support hours?
36. Preferred cloud provider or existing infrastructure to integrate
    with?

---

## 4. Proposed Next Steps

1. Review this draft with the customer and capture answers to the
   Open Questions section.
2. Produce a revised, locked requirements document.
3. Define an MVP scope slice from the locked requirements.
4. Produce a high-level architecture proposal and estimate.
