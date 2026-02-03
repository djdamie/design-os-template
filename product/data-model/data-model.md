# Data Model

## Entities

### Project

The top-level container for a music licensing project/case.

**What it represents:** A single client engagement that may involve searching for music, licensing tracks, or creating custom compositions. Each project has a unique case number and goes through a defined workflow.

**Key aspects:**
- Has a case number (auto-incremented)
- Has a case title (descriptive name)
- Has a "catchy case ID" for easy reference (e.g., "BMW-Summer-Drive")
- Classified into type: A, B, C, D, E, or Production
- Has a budget and calculated payout/margin
- Has a status (draft, active, in_progress, completed, cancelled)
- Has a brief completeness score (0-100%)
- Connected to external systems (Slack channel, Nextcloud folder, Google Doc)

---

### Brief

The structured data extracted from a client's request. **This is the most complex entity with 6 distinct sections.**

**What it represents:** All the information needed to execute a music project, organized into categories. Briefs are extracted from raw text (emails, PDFs) and refined through conversation.

#### Raw Input
- `raw_brief_text` - Original unstructured text from client
- `brief_source` - Where the brief came from (email, chat, manual, phone, meeting)

#### Section 1: BUSINESS BRIEF
Core commercial and contractual information.

| Field | Type | Description |
|-------|------|-------------|
| `client_name` | String | End client/brand owner (e.g., "BMW") |
| `agency_name` | String | Agency handling the project (e.g., "Jung von Matt") |
| `brand_name` | String | Specific brand/sub-brand if different |
| `brief_sender_name` | String | Person who sent the brief |
| `brief_sender_email` | String | Email of brief sender |
| `brief_sender_role` | String | Role/title of brief sender |
| `territory` | Array | Geographic regions (e.g., ["Germany", "Austria", "Switzerland"]) |
| `media_types` | Array | Usage channels (e.g., ["TV", "Online", "Social", "Cinema"]) |
| `term_length` | String | License duration ("1 year", "perpetuity", "6 months") |
| `exclusivity` | Boolean | Whether exclusive use is required |
| `exclusivity_details` | Text | Specifics of exclusivity if applicable |

#### Section 2: CREATIVE BRIEF
Artistic direction and music requirements.

| Field | Type | Description |
|-------|------|-------------|
| `creative_direction` | Text | Overall creative vision and mood |
| `mood_keywords` | Array | Descriptive mood terms (e.g., ["upbeat", "energetic", "youthful"]) |
| `genre_preferences` | Array | Musical genres (e.g., ["indie pop", "electronic", "acoustic"]) |
| `reference_tracks` | Array of Objects | Reference songs with spotify_id, title, artist, notes |
| `lyrics_requirements` | Text | Lyric content guidelines ("Must have positive message") |
| `must_avoid` | Text | Content to exclude ("No heavy metal, no profanity") |
| `vocals_preference` | Enum | instrumental / vocals / either / specific |
| `vocals_details` | Text | Specifics if vocals_preference is "specific" |

#### Section 3: TECHNICAL BRIEF
Format, delivery, and technical specifications.

| Field | Type | Description |
|-------|------|-------------|
| `video_lengths` | Array | Required cut lengths (e.g., ["15s", "30s", "60s"]) |
| `deliverable_formats` | Array | File formats needed (e.g., ["WAV", "MP3", "stems"]) |
| `stems_required` | Boolean | Whether separated audio stems are needed |
| `stems_details` | Text | Specifics about stem requirements |
| `sync_points` | Text | Key timing requirements ("Music hits at 0:15 for logo reveal") |

#### Section 4: CONTEXTUAL BRIEF
Background information and strategic context.

| Field | Type | Description |
|-------|------|-------------|
| `campaign_context` | Text | Campaign background ("Summer campaign for new product line") |
| `target_audience` | Text | Who the campaign targets ("18-35 urban millennials") |
| `brand_values` | Array | Brand attributes (e.g., ["innovation", "sustainability", "premium"]) |
| `competitor_info` | Text | Competitor music usage ("Competitor X used track Y") |
| `previous_music` | Text | Client's past music choices ("Last campaign used indie folk") |

#### Section 5: TIMELINE & DELIVERABLES
Key dates and milestones.

| Field | Type | Description |
|-------|------|-------------|
| `deadline_date` | Date | Final deadline for delivery |
| `deadline_urgency` | Enum | standard (2+ weeks) / rush (1 week) / urgent (<1 week) |
| `first_presentation_date` | Date | When first options are presented to client |
| `air_date` | Date | When campaign goes live |
| `deliverables_summary` | Text | Summary of what needs to be delivered |

#### Section 6: ANALYSIS METADATA
AI-generated analysis and completeness tracking.

| Field | Type | Description |
|-------|------|-------------|
| `completeness_score` | Integer | 0-100 score of brief completeness |
| `missing_critical` | Array | Fields that block progress (e.g., ["budget", "territory"]) |
| `missing_important` | Array | Fields that help but don't block (e.g., ["reference_tracks"]) |
| `missing_helpful` | Array | Nice-to-have fields (e.g., ["competitor_info"]) |
| `ai_suggestions` | Array of Objects | Clarification suggestions with type, field, suggestion, priority |
| `ai_enhancements` | Object | Interpretations of vague terms (e.g., "upbeat" -> {bpm_range: "120-140"}) |

#### Version Tracking
- `version` - Version number (increments on major changes)
- `previous_version_id` - Reference to previous version for history

---

### Activity

The audit log of all changes to a project or brief.

**What it represents:** A timestamped record of what changed, who changed it (user or AI), and what the old/new values were. Used for tracking history and debugging.

**Key aspects:**
- Belongs to a Project (and optionally a Brief)
- Has an activity type (brief_created, brief_analyzed, field_updated, classification_changed, status_changed, agent_suggestion, user_comment, external_sync)
- Has an actor type (user, agent, system, webhook)
- Records the field changed and old/new values
- Includes a human-readable message

---

### TeamAssignment

The assignment of team members to project roles.

**What it represents:** Who is responsible for what on a given project. Different project types require different roles.

**Key aspects:**
- Belongs to a Project
- Has a role type: AM (Account Manager), MS (Music Supervisor), PM (Project Manager), BA (Business Affairs), MC (Music Coordinator), MGMT (Management), Composer
- References a team member/user
- May have notes about the assignment

---

### WorkflowStep

A milestone in the project workflow.

**What it represents:** One step in the project process, with its status and timing. The steps vary by project type (A+B have more steps than E).

**Key aspects:**
- Belongs to a Project
- Has a step name and description
- Has a status (pending, in_progress, completed, skipped)
- Has an assigned role/person
- Has estimated and actual duration
- Has a sequence number for ordering

---

## Relationships

- **Project** has one **Brief**
- **Project** has many **Activity** records
- **Project** has many **TeamAssignment** records
- **Project** has many **WorkflowStep** records
- **Brief** has many **Activity** records (for brief-specific changes)
- **TeamAssignment** references team members (users)
- **WorkflowStep** may be assigned to a **TeamAssignment**

---

## UI Tab Mapping

The Brief sections map to UI tabs in the Canvas:

| UI Tab | Brief Sections Included |
|--------|------------------------|
| **WHAT** | Business Brief + Budget fields from Project |
| **WHO** | TeamAssignment entity (loaded separately) |
| **WITH WHAT** | Technical Brief + Creative Brief (deliverables) |
| **WHEN** | Timeline & Deliverables |
| **Creative** | Creative Brief (mood, genre, references) |
| **Context** | Contextual Brief |
| **Analysis** | Analysis Metadata |

---

## Project Classification (5-Tier Model)

The project type is determined by budget:

| Type | Budget Range | Workflow | Margin |
|------|--------------|----------|--------|
| A | > 100,000 EUR | Full (A+B-TYPE) | 20-25% |
| B | 25,000 - 100,000 EUR | Full (A+B-TYPE) | 25% |
| C | 10,000 - 25,000 EUR | Simplified (C+D-TYPE) | 50% |
| D | 2,500 - 10,000 EUR | Simplified (C+D-TYPE) | 50% |
| E | <= 2,500 EUR | Blanket only (E-TYPE) | 100% |
| Production | Any (custom music) | Production workflow | Variable |

---

## Completeness Scoring

Brief completeness is calculated by weighting fields:

**Critical fields (10 points each, max 50):**
- client_name, territory, deadline_date, media_types, creative_direction

**Important fields (5 points each, max 30):**
- brand_name, mood_keywords, genre_preferences, reference_tracks, video_lengths, term_length

**Helpful fields (2 points each, max 20):**
- campaign_context, target_audience, brand_values, competitor_info, previous_music, agency_name, brief_sender_name, lyrics_requirements, must_avoid, sync_points
