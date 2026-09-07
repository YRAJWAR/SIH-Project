-- ──────────────────────────────────────────────────────────────
-- SDG Nexus — PostgreSQL Database Setup
-- Raw SQL migration for production / manual deployment
-- ──────────────────────────────────────────────────────────────

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── ENUMs ───────────────────────────────────────────────────

CREATE TYPE "UserRole" AS ENUM ('NGO', 'CORPORATE', 'GOVERNMENT', 'DONOR', 'ADMIN');
CREATE TYPE "OrgType" AS ENUM ('NGO', 'CORPORATE', 'GOVERNMENT');
CREATE TYPE "VerificationStatus" AS ENUM ('PENDING', 'VERIFIED', 'REJECTED', 'SUSPENDED');
CREATE TYPE "ProjectStatus" AS ENUM ('DRAFT', 'ACTIVE', 'COMPLETED', 'SUSPENDED');

-- ─── 1. Users ────────────────────────────────────────────────

CREATE TABLE users (
    id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    full_name     VARCHAR(150)  NOT NULL,
    email         VARCHAR(255)  NOT NULL UNIQUE,
    password_hash VARCHAR(255)  NOT NULL,
    role          "UserRole"    NOT NULL DEFAULT 'DONOR',
    created_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_role ON users (role);

-- ─── 2. Organizations ────────────────────────────────────────

CREATE TABLE organizations (
    id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name                  VARCHAR(255)           NOT NULL,
    type                  "OrgType"              NOT NULL,
    registration_number   VARCHAR(100)           UNIQUE,
    country               VARCHAR(100)           NOT NULL DEFAULT 'India',
    state                 VARCHAR(100)           NOT NULL,
    district              VARCHAR(100),
    verification_status   "VerificationStatus"   NOT NULL DEFAULT 'PENDING',
    created_at            TIMESTAMPTZ            NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_organizations_type   ON organizations (type);
CREATE INDEX idx_organizations_state  ON organizations (state);
CREATE INDEX idx_organizations_status ON organizations (verification_status);

-- ─── 3. Projects ─────────────────────────────────────────────

CREATE TABLE projects (
    id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id       UUID           NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    title                 VARCHAR(300)   NOT NULL,
    description           TEXT           NOT NULL,
    budget_allocated      DECIMAL(15,2)  NOT NULL,
    budget_utilized       DECIMAL(15,2)  NOT NULL DEFAULT 0,
    beneficiaries_count   INTEGER        NOT NULL DEFAULT 0,
    outcome_metric_value  DECIMAL(5,2),                      -- 0–100 improvement %
    latitude              DECIMAL(10,7),
    longitude             DECIMAL(10,7),
    status                "ProjectStatus" NOT NULL DEFAULT 'DRAFT',
    created_at            TIMESTAMPTZ    NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_projects_org_id     ON projects (organization_id);
CREATE INDEX idx_projects_status     ON projects (status);
CREATE INDEX idx_projects_created_at ON projects (created_at DESC);

-- ─── 4. SDGs (Static 1–17) ──────────────────────────────────

CREATE TABLE sdgs (
    id   INTEGER PRIMARY KEY,   -- 1 through 17
    name VARCHAR(100) NOT NULL
);

-- Seed the 17 UN SDGs
INSERT INTO sdgs (id, name) VALUES
  (1,  'No Poverty'),
  (2,  'Zero Hunger'),
  (3,  'Good Health and Well-Being'),
  (4,  'Quality Education'),
  (5,  'Gender Equality'),
  (6,  'Clean Water and Sanitation'),
  (7,  'Affordable and Clean Energy'),
  (8,  'Decent Work and Economic Growth'),
  (9,  'Industry, Innovation and Infrastructure'),
  (10, 'Reduced Inequalities'),
  (11, 'Sustainable Cities and Communities'),
  (12, 'Responsible Consumption and Production'),
  (13, 'Climate Action'),
  (14, 'Life Below Water'),
  (15, 'Life on Land'),
  (16, 'Peace, Justice and Strong Institutions'),
  (17, 'Partnerships for the Goals');

-- ─── 5. ProjectSDGs (Many-to-Many) ──────────────────────────

CREATE TABLE project_sdgs (
    id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id            UUID         NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    sdg_id                INTEGER      NOT NULL REFERENCES sdgs(id)     ON DELETE CASCADE,
    ai_confidence_score   DECIMAL(4,3) NOT NULL DEFAULT 1.000,          -- 0.000 – 1.000
    UNIQUE (project_id, sdg_id)
);

CREATE INDEX idx_project_sdgs_project ON project_sdgs (project_id);
CREATE INDEX idx_project_sdgs_sdg     ON project_sdgs (sdg_id);

-- ─── 6. ProjectActivities ────────────────────────────────────

CREATE TABLE project_activities (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id      UUID         NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    activity_title  VARCHAR(300) NOT NULL,
    description     TEXT         NOT NULL,
    latitude        DECIMAL(10,7),
    longitude       DECIMAL(10,7),
    proof_url       VARCHAR(500),
    hash_value      VARCHAR(64)  NOT NULL,   -- SHA-256 hex string
    created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_activities_project    ON project_activities (project_id);
CREATE INDEX idx_activities_created_at ON project_activities (created_at DESC);

-- ─── 7. ImpactScores ─────────────────────────────────────────

CREATE TABLE impact_scores (
    id                     UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id        UUID         NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    scale_score            DECIMAL(5,2) NOT NULL,   -- 0–100
    outcome_score          DECIMAL(5,2) NOT NULL,
    efficiency_score       DECIMAL(5,2) NOT NULL,
    geographic_need_score  DECIMAL(5,2) NOT NULL,
    transparency_score     DECIMAL(5,2) NOT NULL,
    final_score            DECIMAL(7,2) NOT NULL,   -- weighted composite
    calculated_at          TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_impact_org_id         ON impact_scores (organization_id);
CREATE INDEX idx_impact_final_score    ON impact_scores (final_score DESC);     -- leaderboard
CREATE INDEX idx_impact_calculated_at  ON impact_scores (calculated_at DESC);

-- ─── 8. Donations ────────────────────────────────────────────

CREATE TABLE donations (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id  UUID          NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    donor_id    UUID          NOT NULL REFERENCES users(id)    ON DELETE CASCADE,
    amount      DECIMAL(15,2) NOT NULL,
    created_at  TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_donations_project    ON donations (project_id);
CREATE INDEX idx_donations_donor      ON donations (donor_id);
CREATE INDEX idx_donations_created_at ON donations (created_at DESC);

-- ─── 9. CSRAllocations ──────────────────────────────────────

CREATE TABLE csr_allocations (
    id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    corporate_org_id UUID          NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    project_id       UUID          NOT NULL REFERENCES projects(id)      ON DELETE CASCADE,
    amount_committed DECIMAL(15,2) NOT NULL,
    amount_disbursed DECIMAL(15,2) NOT NULL DEFAULT 0,
    financial_year   VARCHAR(9)    NOT NULL,   -- e.g. '2024-2025'
    created_at       TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_csr_corporate ON csr_allocations (corporate_org_id);
CREATE INDEX idx_csr_project   ON csr_allocations (project_id);
CREATE INDEX idx_csr_fy        ON csr_allocations (financial_year);
