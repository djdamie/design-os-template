# Project Canvas Section for Design OS

Use this content when running `/shape-section` for the Project Canvas section.

---

## Section Overview

**Section Name:** Project Canvas

**Purpose:** The side-by-side editable view that displays structured project data. Users can directly edit any field, see completeness scores, and view project classification.

---

## User Stories

### As a Music Supervisor
- I want to see all project data organized by category
- I want to edit any field directly without re-prompting the AI
- I want to see what information is missing at a glance
- I want the AI to acknowledge my edits and adjust its context

### As an Account Manager
- I want to see project classification (A/B/C/D/E) immediately
- I want to know the margin/payout split for this budget
- I want to track brief completeness over time

### As a Project Manager
- I want to see who is assigned to what role
- I want to track workflow status and milestones
- I want to see the project timeline

---

## Component Requirements

### Tab Navigation
- Horizontal tabs at top of canvas
- Tabs: WHAT, WHO, WITH WHAT, WHEN, OTHER
- Active tab highlighted with accent color
- Badge indicator if section has missing critical fields
- Smooth transition between tabs

### Section Content Area
- Scrollable within tab
- Field groups with headers
- Consistent spacing and alignment

### Field Group
- Group header (e.g., "Client Information")
- List of related fields
- Collapse/expand capability (optional)

### Editable Field
- Label (field name)
- Value display
- Edit mode on click/focus
- Field types:
  - Text input (single line)
  - Textarea (multi-line)
  - Select/dropdown
  - Multi-select (tags)
  - Date picker
  - Currency input
- Validation feedback
- AI-suggested indicator

### Field Status Indicators
- Empty (critical): Red border, "Required" label
- Empty (important): Yellow/amber indicator
- Empty (helpful): Subtle gray indicator
- AI-filled: Italic with "AI suggested" label
- User-edited: Normal display
- Changed since last save: Blue dot indicator

### Classification Badge
- Project type letter (A/B/C/D/E/Production)
- Color-coded background
- Tooltip with classification reasoning
- Click to see margin calculation

### Margin Display
- Budget amount
- Margin percentage
- Payout amount
- Tier indicator

### Completeness Progress
- Progress bar (0-100%)
- Color gradient: red -> yellow -> green
- Percentage text
- Click to see missing fields breakdown

### Action Footer
- "Save Changes" button (if unsaved)
- "Create Slack Channel" button
- "Create Nextcloud Folder" button
- Status of external integrations

---

## Tab Contents

### WHAT Tab (Project Overview & Scope)

**Client Information:**
- Client name (text)
- Agency name (text)
- Brand name (text)
- Brief sender name (text)
- Brief sender email (email)

**Project Details:**
- Project title (text)
- Number of scripts (number)
- Video lengths (multi-select: 6s, 10s, 15s, 30s, 60s, custom)
- Tag-ons/cutdowns needed (boolean + text)
- Language adaptations (multi-select)

**Rights & Usage:**
- Territory (multi-select: countries/regions)
- Media types (multi-select: TV, Online, Social, Cinema, POS, CTV/ATV)
- Term length (select: 3 months, 6 months, 1 year, 2 years, perpetuity)
- Exclusivity (boolean + text)

**Budget:**
- Budget amount (currency)
- Budget currency (select: EUR, USD, GBP)
- [Auto-calculated: Payout, Margin %, Project Type]

**Creative:**
- Brief summary (textarea)
- Creative challenges (textarea)
- Mood keywords (tags)
- Genre preferences (tags)
- Reference tracks (list with Spotify links)
- Must avoid (textarea)
- Vocals preference (select: instrumental, vocals, either)

### WHO Tab (Team & Responsibilities)

**Project Team:**
- Project Lead (select from team)
- Account Manager (select from team)
- Music Supervisor (select from team)
- Music Coordinator (select from team)
- Business Affairs (select from team)
- Management oversight (select from team, A/B types only)

**External:**
- Composers (multi-select, if Production)
- External partners (text)

**Workflow:**
- Feedback loop (multi-select: who approves internally)
- Backup coverage (text)

### WITH WHAT Tab (Tools, Sources & Deliverables)

**Music Source:**
- Source type (select: Internal only, Request + playlist, Label/publisher briefing, Blanket license, Bespoke composition)
- Submission rules (textarea)

**Deliverables:**
- Deliverable format (multi-select: playlist link, shortlist file, comparison notes, demo)
- File formats needed (multi-select: WAV, MP3, stems)
- Stems required (boolean + textarea)

**Quality:**
- Pre-clearance required (boolean)
- Metadata complete (boolean)
- Naming conventions (text)
- Additional budget notes (textarea)

### WHEN Tab (Timeline & Check-ins)

**Key Dates:**
- Kick-off date (date)
- First internal check (date)
- Second check/presentation draft (date)
- Final internal approval (date)
- Delivery to client (date)
- Revision window end (date)
- Final client approval (date)
- Air date (date)

**Urgency:**
- Deadline urgency (select: standard, rush, urgent)
- Post-timing notes (textarea)

### OTHER Tab (Notes & Attachments)

**Additional:**
- Notes/comments (textarea)
- Client history (textarea)
- Approval risks (textarea)

**Attachments:**
- Creative deck link (url)
- Agency brief link (url)
- Scripts link (url)
- Mood board link (url)
- Reference playlist link (url)

---

## Data Requirements

### Input Data
- Project object with all brief fields
- Classification data
- Margin calculations
- Team member list (for dropdowns)
- Activity history

### Output Data
- Updated field values
- Change events (for activity log)
- Validation errors

### State to Track
- Active tab
- Fields in edit mode
- Unsaved changes
- Validation errors

---

## Expected Design OS Output

After running `/shape-section` for Project Canvas:
- `product/sections/project-canvas/spec.md` - Section specification

After running `/sample-data`:
- `product/sections/project-canvas/data.json` - Sample project data
- `product/sections/project-canvas/types.ts` - TypeScript interfaces

After running `/design-screen`:
- `src/sections/project-canvas/components/` - React components
