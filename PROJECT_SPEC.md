# SDG Nexus - Comprehensive Project Specification

## 1. Project Vision & Overview
**SDG Nexus** is an enterprise-grade "Operating System for SDG Partnerships & Impact Intelligence". It serves as a centralized multi-stakeholder collaboration platform built to align India's Non-Governmental Organizations (NGOs), Corporate Social Responsibility (CSR) arms, Government oversight bodies, and individual Donors around the 17 UN Sustainable Development Goals (SDGs).

The platform digitizes and standardizes impact tracking, ensures transparent fund utilization through a blockchain-inspired activity ledger, intelligently matches corporates with NGOs via an AI-driven Smart Matching Engine, and provides real-time progress mapping via advanced geospatial visualization.

## 2. Technical Architecture & Tech Stack

### 2.1 Technology Stack
- **Frontend & Backend Framework**: Next.js 16.1.6 (App Router + Turbopack)
- **Programming Language**: TypeScript 5.9
- **Database**: PostgreSQL (managed via Prisma ORM 7.4)
- **Styling**: Tailwind CSS 4.2
- **Geospatial & Visualization**: Leaflet, React-Leaflet, Recharts 3.7
- **Authentication**: Custom JWT implementation (jsonwebtoken) + bcryptjs
- **Reporting**: PDF generation via jsPDF & jspdf-autotable
- **AI Integration**: OpenAI GPT API (with a local keyword fallback)
- **Data Integrity**: SHA-256 Hashing via crypto-js

### 2.2 System Architecture (Layered Model)
The application adheres to a strict layered enterprise architecture:
1. **Presentation Layer (Frontend)**: Role-specific Next.js React components mapped to NGO, Corporate, Government, and Donor dashboards.
2. **API Layer (Route Handlers)**: `src/app/api/` handles HTTP incoming requests and structures the standardized JSON responses.
3. **Middleware Layer**: Enforces JWT Authentication, Role Guards (RBAC), Rate Limiting, and generic Error Handling.
4. **Service Layer**: Houses core business logic (`src/services/`):
   - `impactScoringService.ts`
   - `sdgClassifierService.ts`
   - `riskDetectionService.ts`
   - `smartMatchingService.ts`
5. **Repository Layer**: Transaction-safe data access wrapping Prisma client operations.
6. **Data Layer**: PostgreSQL database containing 27 normalized tables.

---

## 3. Core Intelligence Engines & Business Logic

### 3.1 Multi-Variable Impact Scoring Engine
Calculates an organization's raw impact based on 5 weighted variables (Max Score: 1000):
- **Scale (30%)**: Beneficiary count normalized against a 20,000 sector median.
- **Outcome (25%)**: Percentage improvement in target metrics, scaled by activity volume.
- **Efficiency (20%)**: Cost per beneficiary compared to a ₹500 standard median.
- **Geographic Need (15%)**: Assessed via regional poverty indexes.
- **Transparency (10%)**: Ratio of verified activities, proofs uploaded, and geo-tagged updates.

### 3.2 AI-Powered SDG Classification Engine
Analyzes project descriptions to auto-tag aligned UN SDGs (1-17).
- **Primary Engine**: OpenAI GPT API prompting for contextual classification.
- **Fallback Engine**: Local keyword-frequency matching algorithm.
- Generates an `ai_confidence_score` stored alongside the SDG tag.

### 3.3 Smart Corporate-NGO Matching Engine
Recommends the top 5 aligned NGOs for Corporates to satisfy CSR requirements.
- **Formula**: `Match Score = (SDG Overlap × 40%) + (Geographic Proximity × 30%) + (NGO Impact Score × 30%)`

### 3.4 Automated Risk Detection Engine
Scans records iteratively (Background Job) to flag operational anomalies:
- **`high_funding_low_beneficiaries`** (HIGH Severity): Funds exceed thresholds while reach remains minimal.
- **`efficiency_decline`** (MEDIUM Severity): Cost per beneficiary worsens over 3 consecutive cycles.
- **`missing_proofs`** (MEDIUM Severity): No verified activity proofs uploaded for > 30 days.

### 3.5 Heatmap & Funding Gap Intelligence
Geospatial engine mapping data across states/districts with 7 composite modes:
- Default Composite (Weighted score density)
- Funding Volume
- Beneficiary Count
- NGO Density
- Efficiency (Cost per beneficiary)
- Risk Level (Underfunding)
- SDG Focus Concentration

---

## 4. Role-Based Functionality & Dashboards

### 4.1 NGO Dashboard
- **Project Creation**: Launch projects with AI classification.
- **Activity Logging**: Submit geo-tagged proofs, hashed via SHA-256 for the immutable ledger.
- **Impact Analytics**: View raw and normalized 5-component scores, risk flags, and transparency metrics.
- **Volunteer Management**: Create and manage volunteer opportunities.

### 4.2 Corporate (CSR) Dashboard
- **Compliance Tracking**: Monitor statutory 2% net profit CSR spend (committed vs. disbursed).
- **Smart Matching**: Discover NGOs mathematically aligned with corporate strategy.
- **Portfolio Analytics**: Aggregate impact (beneficiaries, cost per beneficiary) across all funded projects.

### 4.3 Government Dashboard
- **National Oversight**: Macro-level SDG progress, funding gap analysis, and underfunded regional alerts.
- **Audit & Compliance**: Track NGO verification statuses and issue `GovernmentAuditFlag` alerts for non-compliance.
- **Policy Insights**: Auto-generated strategic insights based on geographic intelligence.

### 4.4 Donor Dashboard
- **Impact Tracking**: Track individual donations to specific projects.
- **ROI Analytics**: Measure "Impact per Rupee" based on the project's efficiency scores.
- **Impact Certificates**: Auto-generated certificates representing quantified beneficiaries helped per SDG.

---

## 5. Database Schema & Data Models (27 Entities)

The system uses a highly relational PostgreSQL schema.

### Core Entities
1. **`User`**: Authentication credentials, roles (NGO, CORP, GOV, DONOR, ADMIN).
2. **`Organization`**: NGO/Corporate entities containing verification statuses and regional metadata.
3. **`Project`**: The central entity linking Organizations to Budgets, Locations, and Beneficiaries.
4. **`SDG`**: Static lookup table for the 17 UN SDGs.
5. **`ProjectSDG`**: Join table linking Projects to SDGs with `ai_confidence_score`.

### Tracking & Validation
6. **`ProjectActivity`**: The immutable ledger for project updates containing `proof_url`, geo-coordinates, and `hash_value`.
7. **`ProjectOutcomeMetrics`**: Tracks baseline, current, and target metrics for projects.
8. **`Donation`**: Transactional records for Donors funding Projects.
9. **`CSRAllocation`**: Financial commitments and disbursements from Corporates to Projects.

### Scoring & Analytics
10. **`ImpactScore`**: Latest calculated 5-variable score for an organization.
11. **`ImpactScoreHistory`**: Archival table for tracking score fluctuations over time.
12. **`TransparencyMetrics`**: Quantitative representation of an NGO's reporting frequency and proof quality.
13. **`GeoImpactSummary`**: Aggregated state/district level metrics (funding, beneficiaries) by SDG.
14. **`OrganizationFinancialSummary`**: Cash-flow summary (received vs utilized).
15. **`CorporateImpactPortfolio`**: Macro-level CSR metrics per corporation.
16. **`CorporateSDGDistribution`**: Breakdown of corporate funds across specific SDGs.

### Risk & Intelligence
17. **`RiskFlag`**: Auto-generated anomalies tied to Organizations.
18. **`GovernmentAuditFlag`**: Manual or system-generated compliance warnings.
19. **`GovernmentAlerts`**: Macro-level alerts for underfunded regions or systemic issues.
20. **`GovernmentInsights`**: Actionable intelligence generated for policymakers.
21. **`OrganizationInsights` & `CorporateStrategyInsights`**: Actionable recommendations for NGOs and Corporates.

### Donor Specifics
22. **`DonorImpactSummary`**: Aggregate tracking for individual donors.
23. **`DonorSDGPortfolio`**: Distribution of a donor's funds across SDGs.
24. **`DonorImpactCertificates`**: Generated proofs of impact for donors.
25. **`DonorGoals`**: Personal giving targets set by users.

### Volunteering
26. **`VolunteerOpportunity`**: Openings created by NGOs.
27. **`VolunteerApplication`**: User submissions to opportunities.

### Security
28. **`AuditLog`**: Complete, immutable tracking of every system action (Actor, Action, Entity, IP, Before/After states).

---

## 6. Security, Compliance & System Reliability

### 6.1 Authentication & Authorization (RBAC)
- **JWT**: Stateless tokens issued on login, validated via middleware.
- **RBAC**: Strict role enforcement. For instance, only `CORPORATE` accounts can access `/api/corporate/*`.
- **IDOR Protection**: Repository layers automatically append `WHERE user_id = current_user` for sensitive queries.

### 6.2 Data Integrity
- **Blockchain-Style Hashing**: Activities are hashed using SHA-256 at creation. Modifying the database directly will break the hash chain, immediately invalidating the activity in the UI.
- **Input Validation**: Zod-style schemas validate all incoming payloads to prevent SQL Injection and ensure data types.
- **Audit Trails**: All POST/PUT/DELETE operations generate an `AuditLog` entry detailing the precise state mutation.

### 6.3 API Standards
- **Standardized Responses**: All endpoints return `{ success, data, pagination, timestamp }`.
- **Rate Limiting**: 100 requests / 15 mins for standard endpoints; 10 requests / 15 mins for auth endpoints.

---
*Generated by SDG Nexus Architecture Team - Document Revision 1.0*
