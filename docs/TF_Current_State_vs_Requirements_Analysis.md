# Tracks & Fields: Current System Analysis & Client Requirements

**Document Version:** 1.0  
**Date:** January 13, 2026  
**Purpose:** Comprehensive specification for rebuilding TF workflow automation from clean slate

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Client's Desired Process](#2-clients-desired-process-the-way-we-work)
3. [Current Implementation Analysis](#3-current-implementation-analysis)
4. [Gap Analysis](#4-gap-analysis-current-vs-desired)
5. [Data Schema Requirements](#5-data-schema-requirements)
6. [Workflow Inventory](#6-workflow-inventory)
7. [Integration Points](#7-integration-points)
8. [Recommendations for Rebuild](#8-recommendations-for-rebuild)

---

## 1. Executive Summary

### What Exists Today

A functioning MVP brief extraction and case management system consisting of:

- **OpenWebUI Brief Analyzer Agent** - LLM-powered brief extraction with two-phase workflow
- **5 Active n8n Workflows** - Handling brief submission, updates, Slack integration, and file sync
- **PostgreSQL Database** - Custom schema for cases, briefs, users, and activity tracking
- **Multi-Channel Updates** - Updates possible from OpenWebUI chat, Slack bot, with bi-directional sync

### What the Client Wants

A comprehensive music supervision workflow system that follows the standardized process outlined in "The Way We Work" document:

- **Standardized Brief Structure** - WHAT/WHO/WITH WHAT/WHEN/WHAT ELSE framework
- **Project Type Classification** - A through E types based on budget tiers
- **Quality Check Workflow** - Strategy → Creative → Feedback loop with check-ins
- **Team Assignment** - Clear role definitions and responsibilities
- **Real-time Collaboration** - Brief as living document in shared Google Doc format

### Key Insight

The current implementation focuses heavily on **brief extraction and storage**, but the client's vision extends to the **full project lifecycle** including:
- Strategy development
- Creative execution
- Quality check-ins  
- Team collaboration
- File/asset management

---

## 2. Client's Desired Process ("The Way We Work")

### 2.1 Core Philosophy

> "BRIEF = THE CREATIVE SPARK, NOT JUST A CHECKLIST"

The brief should:
- Live in a shared Google Doc with real-time updates
- Include strategy, challenges, and team input
- Support the workflow: **BRIEF → STRATEGY → CREATIVE → FEEDBACK**

### 2.2 Project Type Classification (Budget Tiers)

| Type | Budget Range | Service Level |
|------|-------------|---------------|
| **A** | > €100,000 | Full service with custom mailouts, management oversight |
| **B** | €25k - €100k | Playlist/request with custom mailouts, team collaboration |
| **C** | €10k - €25k | Request-first, simplified workflow |
| **D** | €2,500 - €10k | Blanket deals, safe picks, limited extras |
| **E** | ≤ €2,500 | Blanket deal only, safe picks, no extras |

### 2.3 Margin Structure

| Budget Range | TF Margin | Notes |
|--------------|-----------|-------|
| €0 - €1,500 | 100% | Library Blanket Deals |
| €1,500 - €30,000 | 50% | Standard projects |
| €30,000 - €100,000 | 25% | Mid-tier |
| €100,000 - €250,000 | 20% | High-value |
| > €500,000 | 10% | Premium accounts |

**Custom Arrangements:**
- Client-specific percentages (e.g., 15%)
- Flat fees (e.g., €10,000)
- Hourly rates with estimates

### 2.4 Standardized Brief Structure

#### WHAT - Project Overview & Scope

| Field | Description |
|-------|-------------|
| Brief Summary | Short description of creative need, tone, story, emotion, music role |
| Creative Considerations | Strategies, challenges, hurdles (deadline, tone, budget, etc.) |
| References / Mood / Keywords | Reference tracks, genres, tone words, "avoid" notes |
| Client | Client/advertiser name |
| Agency | Agency name (if applicable) |
| Project Title / Campaign Name | Campaign identifier |
| Scripts / Deliverables | Number of scripts, lengths (30", 15", 10", 6"), tag-ons, cutdowns, teasers, BTS |
| Buyouts / Usage | Duration, territories, media types |
| Payout & Budget | Total budget or per-track fee |
| Project Type | Track/Mood Search Only, Track Search & Licensing, Bespoke Composition |

#### WHO - Team & Responsibilities

| Role | Description |
|------|-------------|
| Project Lead | Overall project ownership |
| Account / Client Contact | Client relationship manager |
| Creative Search/Work & Direction | Music search lead |
| Music Supervisor/Consultant | Creative oversight |
| Licensing / Legal | Rights clearance |
| Composers (if bespoke) | Music creation |
| Support / Backup | Research, assistants |
| External Partners | Agency producers, consultants |
| Feedback Loop | Internal sign-off chain |
| Vacation/Sick Leave Support | Backup coverage |

#### WITH WHAT - Tools, Sources & Deliverables

| Element | Options |
|---------|---------|
| Music Source / Workflow | Internal search, Submission via request, Label/Publisher briefing, Blanket License, Bespoke composition |
| Submission Rules | Guidelines for submissions |
| Deliverables | Playlist link, shortlist file, comparison notes, demo |
| Quality & Compliance | Pre-clearance, metadata, naming conventions |
| Budget for External | External search, freelance artists |

#### WHEN - Timeline & Check-ins

| Milestone | Description |
|-----------|-------------|
| Kick-off / Briefing Date | Project start |
| First internal check | Initial review |
| Second check/presentation draft | Draft review |
| Final internal approval | Internal sign-off |
| Delivery to agency/client | External delivery |
| Revision window | Client feedback period |
| Final approval | Client sign-off |
| Delivery to production | Handoff to post |
| Post-Timing | Sound-mix, adaptations, reshoots |

#### WHAT ELSE

- Notes / Comments - Additional context
- Attachments - Creative deck, agency brief, scripts, mood board, playlists

### 2.5 Strategy & Quality Check Process

**Strategy Phase:**
- Creative challenge rating (* to ***)
- Resources needed
- Brand/target group/adaptation angle
- Presentation format
- Team brainstorm or quick input collection

**Quality Check Phase:**
- Shortlist(s) done by music team
- Overall confidence in result
- Strategy goal met?
- Budget fit or uncertainties?
- Lyrics / artist legal check
- Presentation format
- Blind spots (target group, brand relevance)
- Win-win add-ons (artist collab opportunities)

---

## 3. Current Implementation Analysis

### 3.1 OpenWebUI Brief Analyzer Prompt

**Current Capabilities:**
- Two-phase workflow (Analyze → Confirm → Submit)
- Structured JSON extraction
- Brief status checking after submission
- Field updates from chat session
- Slack channel notifications

**Current Schema Extracted:**

```
extraction_status: complete | partial
brief_quality: excellent | good | fair | poor
confidence_score: 0.0-1.0

business_brief:
  - client, agency, brand, media[], territory[], budget, term, lengths[]

creative_brief:
  - mood, keywords[], genres[], reference_tracks[], descriptions
  - enhanced_interpretation: search_keywords[], mood_descriptors[], genre_suggestions[], reference_analysis

contextual_brief:
  - brand, brand_category, brand_attributes[], audience_preferences, story

technical_brief:
  - lengths[], musical_attributes (bpm, key, time_signature), stem_requirements, format_specs

deliverables:
  - submission_deadline, ppm_date, shoot_date, air_date

competitive_brief:
  - stakeholders[], competitor_activity, pitch_situation

missing_information[]
extraction_notes
```

### 3.2 Workflow Inventory

#### TF_brief_to_project_v5 (Primary Workflow)

**Trigger:** POST webhook `/webhook/tf-brief-intake-v5`

**Flow:**
1. Webhook receives pre-analyzed brief from OpenWebUI
2. Extract & validate brief analysis JSON
3. Authenticate user (upsert to tf_users)
4. Create case with catchy_case_id generator
5. Save enhanced brief to database
6. Render brief as Markdown
7. Create Slack channel (named after case ID)
8. Get Slack users & find matching user
9. Invite user to channel
10. Post welcome message
11. Create Nextcloud folder
12. Share folder publicly
13. Upload brief to Nextcloud
14. Share brief file
15. Upload brief to Google Drive
16. Merge all async operations
17. Post brief analysis to Slack
18. Store Slack channel ID in database
19. Log activity
20. Build & return response

**Key Features:**
- Generates "catchy case ID" (TF-00147-client-keywords format)
- Dual storage: Nextcloud + Google Drive
- Activity logging
- Slack channel per case

#### Update Brief from OpenWebUI

**Trigger:** POST webhook `/webhook/update-brief-openwebui`

**Flow:**
1. Parse & validate request (session_id + updates)
2. Find brief by session ID
3. LLM validates field mappings (Groq: llama-4-scout)
4. Build updated analysis JSON
5. Update database (preserves and merges changes)
6. Log activity
7. Trigger Nextcloud sync
8. Format Slack notification
9. Post to Slack channel
10. Return response

**Key Features:**
- AI-assisted field validation
- Automatic Slack notification
- Version incrementing
- Nextcloud sync trigger

#### SlackBot (AI-Powered Updates)

**Trigger:** POST webhook `/webhook/slack-bot-mention`

**Flow:**
1. Parse Slack app_mention event
2. Handle URL verification challenge
3. Get channel info from Slack API
4. Extract case ID from channel name pattern (tf-{number}-*)
5. Find case in database
6. Get/create conversation state
7. Prepare AI context with current brief info
8. Build AI prompt with comprehensive field definitions
9. AI Intent Parser (Groq agent) extracts update intent
10. Parse AI response (handles multiple JSON blocks)
11. Route based on intent type:
    - **direct_update / multi_field_update**: Apply changes
    - **needs_clarification**: Ask follow-up question
    - **confirmation_needed**: Post confirmation message
12. Build update query
13. Update brief in database
14. Log activity
15. Trigger Nextcloud sync
16. Post success/confirmation message
17. Respond to webhook

**Supported Fields:**
- Business: client, brand, agency, budget, term, territory[], media[], cutdowns[], lengths[], extras
- Creative: keywords[], mood, genres[], instruments[]
- Dates: deadline/submission_deadline, ppm_date, shoot_date, air_date, offline_date, online_date
- Notes: note (append)

#### SlackBot - Get Brief Info

**Trigger:** POST webhook `/webhook/slack-bot-get-brief`

**Flow:**
1. Parse Slack event
2. Get channel info
3. Extract case ID from channel name
4. Query database for brief + update history
5. Format comprehensive brief message with:
   - Basic info (client, brand, budget, version)
   - Brief description/recap
   - Creative details (territory, media, keywords)
   - All deadlines
   - Recent updates history
   - Extraction notes
6. Post to Slack
7. Respond to webhook

#### Sync Brief to Nextcloud

**Trigger:** 
- POST webhook `/webhook/sync-brief-to-nextcloud`
- Called by other workflows

**Flow:**
1. Parse input (case_id or session_id)
2. Fetch case & brief data
3. Render full brief as Markdown (6 sections)
4. Update current brief file in Nextcloud
5. Create versioned brief file (v1, v2, etc.)
6. Share both files publicly
7. Post success notification to Slack
8. Log activity

### 3.3 Database Schema (Inferred from Workflows)

**tf_cases:**
- id (UUID, PK)
- case_number (generated)
- catchy_case_id (e.g., "TF-00147-client-keywords")
- case_title
- case_owner_id (FK → tf_users)
- created_by_id (FK → tf_users)
- session_id
- status (e.g., 'brief_received')
- slack_channel_id
- slack_channel_name
- created_at, updated_at

**tf_briefs:**
- id (UUID, PK)
- case_id (FK → tf_cases)
- session_id
- raw_brief, analysis (JSONB)
- version
- Extracted fields: client, agency, brand, media[], territory[], budget_raw/min/max, term
- Creative fields: keywords[], genres[], mood, mood_descriptors[], reference_tracks[], instruments[]
- Dates: submission_deadline, ppm_date, shoot_date, air_date, offline_date, online_date
- Quality metrics: extraction_status, brief_quality, completion_rate, critical_fields_complete, production_ready
- HITL: hitl_status, missing_information[]
- Other: cutdowns[], lengths[], extras, user_email
- created_at, updated_at

**tf_users:**
- id (UUID, PK)
- email (unique)
- name
- openwebui_user_id
- role (user, admin, supervisor, coordinator, viewer)
- last_login

**tf_case_activity:**
- id (UUID, PK)
- case_id (FK)
- activity_type
- activity_description
- user_id (FK)
- source (openwebui, slack, nextcloud_sync, etc.)
- changes (JSONB)
- created_at

**tf_bot_conversations:**
- id (UUID, PK)
- slack_user_id
- slack_channel_id
- thread_ts
- case_id (FK)
- state (active, awaiting_confirmation)
- context (JSONB)
- created_at, updated_at

---

## 4. Gap Analysis: Current vs Desired

### 4.1 Brief Structure Gaps

| Client Wants | Current Has | Gap |
|--------------|-------------|-----|
| Brief Summary narrative | descriptions field | ✅ Partial coverage |
| Creative Considerations/Challenges | missing_information | ❌ No challenge rating system |
| Project Title / Campaign Name | case_title | ✅ Covered |
| Number of scripts | Not extracted | ❌ Missing |
| Tag-ons / Cutdowns / Teasers / BTS | cutdowns[] only | ⚠️ Partial |
| Language adaptations | Not extracted | ❌ Missing |
| Buyout Duration vs Term distinction | term field | ⚠️ Needs clarification |
| Project Type (Search/Licensing/Bespoke) | Not extracted | ❌ Missing |

### 4.2 Team/Responsibility Gaps

| Client Wants | Current Has | Gap |
|--------------|-------------|-----|
| Project Lead assignment | case_owner_id | ⚠️ Single owner only |
| Account / Client Contact | Not tracked | ❌ Missing |
| Creative Search lead | Not tracked | ❌ Missing |
| Music Supervisor | Not tracked | ❌ Missing |
| Licensing / Legal | Not tracked | ❌ Missing |
| Composers list | Not tracked | ❌ Missing |
| Support / Backup | Not tracked | ❌ Missing |
| External Partners | Not tracked | ❌ Missing |
| Feedback Loop chain | Not tracked | ❌ Missing |
| Vacation coverage | Not tracked | ❌ Missing |

### 4.3 Workflow Gaps

| Client Wants | Current Has | Gap |
|--------------|-------------|-----|
| Music Source workflow selection | Not implemented | ❌ Missing |
| Submission rules | Not implemented | ❌ Missing |
| Quality & Compliance tracking | basic quality score | ⚠️ Minimal |
| External budget tracking | Not tracked | ❌ Missing |
| Kick-off date | Not extracted | ❌ Missing |
| Internal milestones | Not tracked | ❌ Missing |
| External deadlines | submission/ppm/shoot/air dates | ✅ Covered |
| Revision window | Not tracked | ❌ Missing |
| Post-timing schedule | Not tracked | ❌ Missing |

### 4.4 Strategy & Check-in Gaps

| Client Wants | Current Has | Gap |
|--------------|-------------|-----|
| Challenge rating (* to ***) | Not implemented | ❌ Missing |
| Resources needed assessment | Not implemented | ❌ Missing |
| Brand/target analysis | brand_attributes, audience | ⚠️ Partial |
| Presentation format selection | Not implemented | ❌ Missing |
| Team brainstorm capture | extraction_notes | ⚠️ Informal |
| Shortlist confidence tracking | Not implemented | ❌ Missing |
| Strategy goal assessment | Not implemented | ❌ Missing |
| Lyrics/legal check status | Not implemented | ❌ Missing |
| Blind spot identification | Not implemented | ❌ Missing |
| Win-win opportunities | Not implemented | ❌ Missing |

### 4.5 Classification & Pricing Gaps

| Client Wants | Current Has | Gap |
|--------------|-------------|-----|
| Project type (A-E) classification | Not implemented | ❌ Missing |
| Automatic margin calculation | Not implemented | ❌ Missing |
| Budget-to-payout conversion | Not implemented | ❌ Missing |
| Custom client arrangements | Not implemented | ❌ Missing |

---

## 5. Data Schema Requirements

### 5.1 Proposed Schema Additions

#### tf_briefs (Enhanced Fields)

```sql
-- Add missing fields
ALTER TABLE tf_briefs ADD COLUMN IF NOT EXISTS
  brief_summary TEXT,
  creative_challenges TEXT,
  challenge_rating INTEGER CHECK (challenge_rating BETWEEN 1 AND 3),  -- * to ***
  num_scripts INTEGER,
  script_lengths TEXT[],
  tagons_cutdowns TEXT[],
  teasers TEXT[],
  bts_requirements TEXT,
  language_adaptations TEXT[],
  buyout_duration TEXT,  -- "6 months", "1 year", "perpetual"
  buyout_territories TEXT[],
  buyout_media TEXT[],
  project_type TEXT CHECK (project_type IN ('search_only', 'search_licensing', 'bespoke')),
  -- Music source workflow
  music_source_workflow TEXT CHECK (music_source_workflow IN ('internal', 'request', 'label_briefing', 'blanket', 'bespoke')),
  submission_rules TEXT,
  quality_compliance_notes TEXT,
  external_budget DECIMAL(12,2),
  -- Milestones
  kickoff_date TIMESTAMP,
  first_internal_check TIMESTAMP,
  second_check_draft TIMESTAMP,
  final_internal_approval TIMESTAMP,
  delivery_to_client TIMESTAMP,
  revision_window_end TIMESTAMP,
  final_client_approval TIMESTAMP,
  delivery_to_production TIMESTAMP,
  post_timing_notes TEXT,
  -- Strategy tracking
  resources_needed TEXT,
  presentation_format TEXT,
  team_brainstorm_notes TEXT,
  shortlist_confidence INTEGER CHECK (shortlist_confidence BETWEEN 0 AND 100),
  strategy_goal_met BOOLEAN,
  lyrics_legal_status TEXT,
  blind_spots TEXT,
  win_win_opportunities TEXT;
```

#### tf_project_team (New Table)

```sql
CREATE TABLE tf_project_team (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID REFERENCES tf_cases(id),
  role TEXT NOT NULL,  -- 'project_lead', 'account_contact', 'creative_lead', etc.
  user_id UUID REFERENCES tf_users(id),
  external_name TEXT,  -- For non-TF team members
  external_email TEXT,
  is_backup BOOLEAN DEFAULT FALSE,
  assigned_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(case_id, role, user_id)
);
```

#### tf_project_classification (New Table)

```sql
CREATE TABLE tf_project_classification (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID REFERENCES tf_cases(id) UNIQUE,
  project_tier TEXT CHECK (project_tier IN ('A', 'B', 'C', 'D', 'E')),
  budget_amount DECIMAL(12,2),
  calculated_margin_percent DECIMAL(5,2),
  calculated_payout DECIMAL(12,2),
  custom_arrangement BOOLEAN DEFAULT FALSE,
  custom_arrangement_type TEXT,  -- 'percentage', 'flat_fee', 'hourly'
  custom_arrangement_value TEXT,
  service_level TEXT,
  classified_at TIMESTAMP DEFAULT NOW(),
  classified_by UUID REFERENCES tf_users(id)
);
```

#### tf_quality_checks (New Table)

```sql
CREATE TABLE tf_quality_checks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID REFERENCES tf_cases(id),
  check_type TEXT,  -- 'first_internal', 'second_draft', 'final_internal', 'client_delivery'
  shortlist_complete BOOLEAN,
  overall_confidence INTEGER CHECK (overall_confidence BETWEEN 0 AND 100),
  strategy_goal_met BOOLEAN,
  budget_fit BOOLEAN,
  budget_notes TEXT,
  lyrics_checked BOOLEAN,
  artist_legal_checked BOOLEAN,
  blind_spots TEXT,
  win_win_addons TEXT,
  checked_by UUID REFERENCES tf_users(id),
  checked_at TIMESTAMP DEFAULT NOW(),
  notes TEXT
);
```

---

## 6. Workflow Inventory

### 6.1 Active Workflows Summary

| Workflow | ID | Status | Trigger | Purpose |
|----------|-----|--------|---------|---------|
| TF_brief_to_project_v5 | rXuPgSxcLjmsbpIe | ✅ Active | POST webhook | Primary brief submission |
| Update Brief from OpenWebUI | 6c4UWPOhua0t3DdE | ✅ Active | POST webhook | Update existing brief from chat |
| SlackBot | rg3gklwz5xhghUsA | ✅ Active | POST webhook | AI-powered updates via Slack |
| SlackBot - Get Brief Info | 9SfAEtstGa2JZr7L | ✅ Active | POST webhook | Display brief info in Slack |
| Sync Brief to Nextcloud | xpnOcoHAwqtpm6d7 | ✅ Active | POST webhook / sub-workflow | Sync brief to file storage |

### 6.2 Webhook Endpoints

| Endpoint | Workflow | Method |
|----------|----------|--------|
| `/webhook/tf-brief-intake-v5` | TF_brief_to_project_v5 | POST |
| `/webhook/update-brief-openwebui` | Update Brief from OpenWebUI | POST |
| `/webhook/slack-bot-mention` | SlackBot | POST |
| `/webhook/slack-bot-get-brief` | SlackBot - Get Brief Info | POST |
| `/webhook/sync-brief-to-nextcloud` | Sync Brief to Nextcloud | POST |

### 6.3 External Dependencies

| Service | Purpose | Auth Method |
|---------|---------|-------------|
| PostgreSQL | Primary database | Connection string |
| Slack | Team communication, channel creation | OAuth2 |
| Google Drive | Brief document storage | OAuth2 |
| Nextcloud | File storage, version control | OAuth2 |
| Groq | LLM for intent parsing | API key |

---

## 7. Integration Points

### 7.1 OpenWebUI Tools

The Brief Analyzer in OpenWebUI requires these tools:

1. **submit_brief_tool_v5** - Calls `/webhook/tf-brief-intake-v5`
2. **get_brief_status** - Queries database for brief status
3. **update_brief** - Calls `/webhook/update-brief-openwebui`

### 7.2 Slack Integration

**Bot Permissions Required:**
- `app_mentions:read` - Receive @mentions
- `channels:read` - Get channel info
- `channels:manage` - Create channels
- `chat:write` - Post messages
- `users:read` - List users for matching

**Channel Naming Convention:**
- Pattern: `tf-{number}-{client}-{keywords}`
- Example: `tf-00147-bmw-energetic-driving`

### 7.3 File Storage Structure

**Nextcloud:**
```
/01 - Team share/Projects/BriefBot/
  └── {case_number} - {case_title}/
      ├── {catchy_case_id} - Brief.md           (current version)
      └── {catchy_case_id} - Brief - v{n}.md    (version history)
```

**Google Drive:**
```
/Brief_Extractions/
  └── {case_title}.gdoc                         (Google Doc format)
```

---

## 8. Recommendations for Rebuild

### 8.1 Architecture Approach

**Recommendation: Hybrid Architecture**

1. **Keep n8n for Orchestration**
   - Visual workflow design works well for integration flows
   - Easy modification by non-developers
   - Good for webhook handling and multi-step async operations

2. **Enhance OpenWebUI Agent**
   - Expand brief schema to match client requirements
   - Add project classification logic
   - Implement team assignment prompts

3. **Add Strategy/Check-in Workflows**
   - Create new workflows for quality check stages
   - Implement milestone tracking
   - Add progress status updates

### 8.2 Priority Implementation Order

**Phase 1: Brief Enhancement (Weeks 1-2)**
- [ ] Update OpenWebUI prompt with full client schema
- [ ] Add missing database fields
- [ ] Update Markdown rendering for new fields
- [ ] Test extraction accuracy

**Phase 2: Classification System (Week 3)**
- [ ] Implement project type classification (A-E)
- [ ] Add budget-to-payout calculation
- [ ] Handle custom client arrangements
- [ ] Auto-suggest service level

**Phase 3: Team Management (Week 4)**
- [ ] Create team assignment table
- [ ] Add role assignment UI/prompts
- [ ] Implement backup coverage tracking

**Phase 4: Workflow Stages (Weeks 5-6)**
- [ ] Add quality check workflows
- [ ] Implement milestone tracking
- [ ] Create strategy capture system
- [ ] Build progress dashboard data

**Phase 5: Advanced Features (Weeks 7-8)**
- [ ] Music source workflow selection
- [ ] Submission rules engine
- [ ] Win-win opportunity tracking
- [ ] Full reporting system

### 8.3 Specific Changes Needed

#### OpenWebUI Prompt Updates

Add to extraction schema:
```json
{
  "project_overview": {
    "brief_summary": "string",
    "creative_challenges": "string",
    "challenge_rating": 1-3,
    "project_type": "search_only|search_licensing|bespoke"
  },
  "scripts_deliverables": {
    "num_scripts": "integer",
    "lengths": ["30s", "15s", "10s", "6s"],
    "tagons_cutdowns": ["string"],
    "teasers": true|false,
    "bts": true|false,
    "language_adaptations": ["string"]
  },
  "buyout_terms": {
    "duration": "string",
    "territories": ["string"],
    "media": ["string"]
  },
  "music_workflow": {
    "source": "internal|request|label|blanket|bespoke",
    "submission_rules": "string"
  },
  "timeline": {
    "kickoff_date": "date",
    "internal_milestones": {
      "first_check": "date",
      "second_draft": "date",
      "final_approval": "date"
    },
    "external_deadlines": {
      "client_delivery": "date",
      "revision_window_end": "date",
      "final_approval": "date",
      "production_delivery": "date"
    },
    "post_timing": "string"
  }
}
```

#### n8n Workflow Modifications

1. **TF_brief_to_project_v5**
   - Add project classification calculation
   - Store tier and margin in database
   - Include tier in Slack notification

2. **SlackBot**
   - Add commands for:
     - `@bot classify` - Show/set project classification
     - `@bot team` - Show/assign team members
     - `@bot milestone {name}` - Update milestone status
     - `@bot check` - Run quality check workflow

3. **New Workflow: Quality Check**
   - Triggered when milestone reached
   - Prompts for check-in data
   - Records results
   - Updates brief status

### 8.4 Testing Requirements

1. **Brief Extraction Tests**
   - Use sample briefs from `/mnt/project/` (ALDI, Mercedes, HeyCar, etc.)
   - Validate all new fields extracted correctly
   - Measure confidence scores

2. **Classification Tests**
   - Verify correct tier assignment for edge cases
   - Test custom arrangement handling
   - Validate margin calculations

3. **Integration Tests**
   - End-to-end flow from brief to Slack channel
   - Update propagation across all systems
   - File sync verification

---

## Appendix A: Sample Brief Extractions

The project contains sample briefs for testing:
- `240814_AS_ALDISTORIES_MUSIKBRIEF__us_c.pdf`
- `Briefing_MercedesBenz_4MATIC__CONFIDENTIAL.pdf`
- `HeyCar.pdf`
- `Christmas_Music_Briefing_Voucher_antoni.pdf`
- And more...

## Appendix B: Related Documentation

Available in project files:
- `TF_Existing_Work_Summary___Recommendations.md`
- `Hierarchical_Supervisor_Architecture.md`
- `Building_an_AI-Ready_Knowledge_Base_for_Music_Licensing.md`
- Various TF Wiki PDFs covering clearance, rights, PROs, etc.

---

**Document Status:** Ready for Review  
**Next Steps:** Review with stakeholder, prioritize phase implementation
