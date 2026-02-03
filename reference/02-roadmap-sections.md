# Product Roadmap Sections for Design OS

Use this content when running `/product-roadmap` in Design OS.

---

## Sections to Define

When Design OS asks you to break your product into sections, use these 5 sections:

### Section 1: Brief Extraction

**Title:** Brief Extraction

**Description:** The AI-powered chat interface where users paste raw client briefs and the system extracts structured data in real-time. This is the core intelligence of the application - it parses unstructured text into the WHAT/WHO/WITH WHAT/WHEN categories.

**Key Capabilities:**
- Accept raw brief text (email content, PDF text, meeting notes)
- Extract data into 5 brief categories using LLM
- Display extraction progress in real-time
- Generate clarification questions for missing info
- Suggest enhancements for vague terms (e.g., "upbeat" -> specific BPM range)

**Priority:** 1 (MVP - must demo this)

---

### Section 2: Project Canvas

**Title:** Project Canvas

**Description:** The side-by-side editable view that displays structured project data. Users can directly edit any field, see completeness scores, and view project classification. This is where extracted data becomes actionable.

**Key Capabilities:**
- Tabbed interface for WHAT/WHO/WITH WHAT/WHEN/WHAT ELSE sections
- Inline editable fields with validation
- Completeness progress bar (0-100%)
- Missing field indicators (critical, important, helpful)
- Project classification badge (A/B/C/D/E/Production)
- Margin/payout calculation display

**Priority:** 1 (MVP - must demo this)

---

### Section 3: Classification Engine

**Title:** Classification Engine

**Description:** The business logic layer that automatically classifies projects by budget tier and calculates margins. This ensures consistent application of TF's pricing and workflow rules.

**Key Capabilities:**
- Auto-classify based on budget thresholds (A/B/C/D/E)
- Handle Production projects separately (not budget-based)
- Calculate payout using 6-tier margin structure
- Determine workflow type (A+B Full, C+D Simplified, E Blanket)
- Flag edge cases for manual review

**Priority:** 2 (Needed for accuracy)

---

### Section 4: Workflow Tracker

**Title:** Workflow Tracker

**Description:** Track project milestones, team assignments, and workflow status. Different project types have different workflow steps, and this section manages the progression through those steps.

**Key Capabilities:**
- Display workflow steps based on project type
- Team role assignments (AM, MS, PM, BA, MC, MGMT)
- Milestone tracking with time estimates
- Status updates (todo, in progress, review, done)
- Quality check gates (clearance, lyrics, legal)

**Priority:** 3 (Foundation for full workflow)

---

### Section 5: Integrations

**Title:** Integrations

**Description:** Connect the app to existing TF infrastructure via n8n webhooks. This includes creating Slack channels, Nextcloud folders, and syncing data with the existing Supabase database.

**Key Capabilities:**
- Trigger n8n webhook for Slack channel creation
- Trigger n8n webhook for Nextcloud folder setup
- Supabase realtime sync for multi-user updates
- Activity logging for audit trail
- Google Doc integration for shared briefs

**Priority:** 4 (Polish for production)

---

## Expected Design OS Output

After running `/product-roadmap`, Design OS should create `product/product-roadmap.md` with these 5 sections listed with titles and descriptions.
