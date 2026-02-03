# Workflow Tracker Section Input for Design OS

Use this content when running `/shape-section` for the Workflow Tracker section.

---

## Section Overview

**Section Name:** Workflow Tracker

**Purpose:** Track project progress through defined workflow steps, manage team assignments, and monitor timeline milestones. Different project types have different workflows with varying complexity.

**Key User Stories:**
- As a Project Manager, I want to see the current status of all workflow steps so I know what's done and what's pending
- As an Account Manager, I want to see who is assigned to each step so I know who to follow up with
- As a Music Supervisor, I want to mark steps as complete as I finish them
- As Management, I want to see projects that are blocked or behind schedule
- As any team member, I want to see upcoming deadlines and milestones

---

## Workflow Types by Project Classification

### A+B-TYPE Workflow (Full - 17 Steps)

For projects > 25,000 EUR. Full service with custom mailouts to labels/publishers.

| # | Step Name | Default Owner | Est. Duration | Description |
|---|-----------|---------------|---------------|-------------|
| 1 | Define Briefing | AM + MS | 1 hour | Review and structure the client brief |
| 2 | Define Strategy | AM + MS | 1 hour | Determine search approach and sources |
| 3 | Send Brief to Pub/Labels | MC | 1 hour | External mailout to publishers and labels |
| 4 | Collect Tracks | MS + MC | 1 day | Gather submissions from all sources |
| 5 | Upload Submissions | MC | 1 hour | Add all tracks to project workspace |
| 6 | Shortlist Tracks | MS | 2 hours | Filter to best candidates |
| 7 | Quality Check | AM + MS | 1 hour | Verify tracks match brief |
| 8 | Filter Unclearables | TBD | 1 hour | Remove tracks with rights issues or active conflicts |
| 9 | Define Presentation Style | AM + MS | 1 hour | Determine how to present to client |
| 10 | Management Check-in | MGMT | 1 hour | Management review and feedback |
| 11 | Send List to Client | AM | 3 days | Deliver shortlist presentation |
| 12 | Check List Engagement | AM + MS | 1 hour | Monitor client interaction with list |
| 13 | Follow Up / Double Down | AM | 1 hour | Push favorites, address questions |
| 14 | Determine Next Steps | AM + MS + MGMT | 1 hour | Decision on direction |
| 15 | Seek Clearance Approval | Clearance | Variable | Get rights holder approval |
| 16 | Check Approval Status | MS or MGMT | Variable | Verify clearance received |
| 17 | Make Contracts | BA | Variable | Draft and finalize agreements |

**A+B Rules:**
- Playlist or Request AND custom mailout by default
- Music Team collects submissions and adds own ideas
- 50/50 split between team and management submissions is ideal
- A-type requires Management submissions where needed

---

### C+D-TYPE Workflow (Simplified - 11 Steps)

For projects 2,500 - 25,000 EUR. Request-first approach with TBC checking.

| # | Step Name | Default Owner | Est. Duration | Description |
|---|-----------|---------------|---------------|-------------|
| 1 | Define Briefing | AM | 1 hour | Structure the client brief |
| 2 | Create Request | AM | 1 hour | Submit to internal request system |
| 3 | Shortlist Request | MS | 1 day | Filter request responses |
| 4 | Additional Tracks Needed? | AM + MS | 1 hour | Decide if more search required |
| 5 | Add Additional Tracks | MS | 2 hours | Expand search if needed |
| 6 | List Safe & Good? | MS + TBD | 30 min | Verify quality and clearability |
| 7 | Check TBCs | - | 1 day | Verify "to be confirmed" items |
| 8 | Send List to Client | AM | 1 day | Deliver shortlist |
| 9 | Check List Engagement | AM + MS | 3 days | Monitor client response |
| 10 | Follow Up / Double Down | AM | 1 hour | Push for decision |
| 11 | Make Contract | BA | Variable | Finalize agreement |

**C+D Rules:**
- Request first (proven most successful approach)
- Music Team shortlists, PM judges if additional tracks needed
- Final shortlist: music team checks for TBCs and question marks

---

### E-TYPE Workflow (Minimal - 3 Steps)

For projects <= 2,500 EUR. Only safe picks from blanket/library catalog.

| # | Step Name | Default Owner | Est. Duration | Description |
|---|-----------|---------------|---------------|-------------|
| 1 | Select from Blanket | MS | 1 hour | Pick pre-cleared tracks from library |
| 2 | Send to Client | AM | 30 min | Deliver options |
| 3 | Confirm Usage | BA | 30 min | Log usage for reporting |

**E-TYPE Rules:**
- Use blanket/library deals only
- No custom searches or negotiations
- Only pre-cleared tracks
- Minimal team involvement

---

### Production Workflow (Custom Music - 11 Steps)

For bespoke composition at any budget. Producer-led workflow.

| # | Step Name | Default Owner | Est. Duration | Description |
|---|-----------|---------------|---------------|-------------|
| 1 | Define Briefing | AM | 1 hour | Capture composition requirements |
| 2 | Select Mood Tracks + Composer | Producer | 1 hour | Choose references and composer |
| 3 | Scout Singers | Producer + MS | 1 hour | Find vocal talent if needed |
| 4 | Brief Composer | Producer | 1 hour | Communicate creative direction |
| 5 | Internal Check | Producer + AM | 1-2 days | Review initial demos |
| 6 | Internal Feedback | Producer | 0.5-1 day | Incorporate team notes |
| 7 | Send to Client | AM | Variable | Present demo(s) to client |
| 8 | Brief Client Feedback | Producer | 0.5-1 day | Incorporate client notes |
| 9 | Finalization + Cutdowns | Producer | 1 hour | Create final versions |
| 10 | Collect Assets | Producer | Variable | Gather all deliverables |
| 11 | Make Contracts | BA | Variable | Finalize agreements |

---

## Automated Steps (n8n Integration)

These steps are triggered automatically via n8n webhooks but should be tracked in the workflow UI so users can see their status and troubleshoot if needed.

### Project Initialization Sequence (TF_brief_to_project_v5)

This is the actual flow from the existing n8n workflow. Triggered when a pre-analyzed brief is submitted:

| # | Step Name | n8n Node | Description |
|---|-----------|----------|-------------|
| A1 | Webhook Received | `Webhook: Pre-Analyzed Brief Intake` | POST to `/tf-brief-intake-v5` with briefAnalysis payload |
| A2 | Brief Validated | `Extract & Validate Pre-Analyzed Brief` | Validate payload, extract fields, generate catchy title/slug |
| A3 | User Authenticated | `Authenticate User` | Upsert user in tf_users, get user ID |
| A4 | Case Created | `Create Case` | Insert into tf_cases with catchy_case_id (e.g., "TF-BMW-Energetic") |
| A5 | Brief Saved | `Save Enhanced Brief` | Insert all brief fields into tf_briefs (business, creative, technical, contextual) |
| A6 | Activity Logged | `Log Activity` | Insert creation event into tf_case_activity |
| A7 | Brief Rendered | `Render Brief Markdown` | Generate formatted markdown document |
| A8 | Slack Channel Created | `Slack: Create Channel` | Create channel named after catchy_case_id |
| A9 | Slack Channel ID Stored | `Store Slack Channel ID` | Update tf_cases with slack_channel_id |
| A10 | Slack User Matched | `Get many users` + `Code` | Match DB user to Slack user by first name |
| A11 | User Invited to Channel | `Invite a user to a channel` | Add project owner to Slack channel |
| A12 | Welcome Message Posted | `Slack: Post Welcome` | Post "Welcome to {project}" message |
| A13 | Google Drive Upload | `Google Drive: Upload Brief` | Upload brief to Brief_Extractions folder |
| A14 | Nextcloud Folder Created | `Create a folder` | Create `/Projects/BriefBot/{case_number} - {title}/` |
| A15 | Nextcloud Folder Shared | `Share a folder` | Create public share link (permissions: 31) |
| A16 | Brief Uploaded to Nextcloud | `Nextcloud: Upload Brief` | Upload markdown to project folder |
| A17 | Brief Share Link Created | `Share brief to Slack` | Create public share link for brief file |
| A18 | All Operations Merged | `Merge: Wait for Drive & Channel` | Wait for parallel operations to complete |
| A19 | Brief Analysis Posted | `Slack: Post Brief Analysis` | Post detailed summary with Drive & Nextcloud links |
| A20 | Webhook Response | `Respond to Webhook` | Return success with case_number, catchy_case_id, slack_channel |

### Parallel Execution Groups

The v5 workflow runs some steps in parallel for efficiency:

**Group 1 (after Create Case):**
- Save Enhanced Brief → Build Response → Respond to Webhook
- Render Brief Markdown → Google Drive + Nextcloud paths
- Log Activity
- Slack: Create Channel → User invite path

**Group 2 (after Render Brief Markdown):**
- Google Drive: Upload Brief
- Create Nextcloud folder → Share folder → Upload brief → Share to Slack

**Final Merge:**
- Waits for: Slack channel, Drive upload, Nextcloud brief share, Nextcloud folder share
- Then posts: Slack: Post Brief Analysis

### Ongoing Sync Steps (To Be Built)

These workflows need to be created for the new UI:

| Step Name | Trigger | Purpose | Status |
|-----------|---------|---------|--------|
| Brief Update Sync | On brief edit in UI | Sync changes to Nextcloud, notify Slack | To build |
| Status Change Notification | On project status change | Post update to project Slack channel | To build |
| Milestone Reminder | Approaching deadline | Send reminder to assigned team member | To build |
| Step Completion Notification | On workflow step complete | Post to Slack, update activity log | To build |
| Blocked Step Alert | On step marked blocked | Alert project lead via Slack DM | To build |
| Daily Digest | Scheduled (9am) | Summary of pending items per user | To build |

### Completion Sequence (To Be Built)

| # | Step Name | Trigger | Purpose | Status |
|---|-----------|---------|---------|--------|
| C1 | Final Documents Saved | On project status = completed | Archive all documents | To build |
| C2 | Slack Channel Archived | After docs saved | Archive (not delete) channel | To build |
| C3 | Completion Summary | After archive | Post to #completed-projects | To build |
| C4 | Analytics Updated | After summary | Update dashboards | To build |

### Existing n8n Workflows

Located at: `reference/n8n-workflows/`

| n8n Workflow | File | Purpose | Trigger |
|--------------|------|---------|---------|
| `TF_brief_to_project_v5` | `TF_brief_to_project_v5.json` | Full project initialization (case, brief, Slack, Nextcloud, Drive) | Webhook POST to `/tf-brief-intake-v5` |
| `SlackBot` | `SlackBot (1).json` | AI-powered conversational updates in Slack | Slack events/mentions |
| `SlackBot - Get Brief Info` | `SlackBot - Get Brief Info.json` | Retrieve brief details via Slack commands | Slack slash command |
| `Sync Brief to Nextcloud` | `Sync Brief to Nextcloud.json` | Sync brief changes to Nextcloud folder | On brief update |
| `Update Brief from OpenWebUI` | `Update Brief from OpenWebUI.json` | Bi-directional sync between OpenWebUI and database | OpenWebUI webhook |

### AI Prompt Reference

The brief analyzer prompt is documented in: `reference/n8n-workflows/Current Brief Analyzer prompt.md`

### Webhook Payload Structure (v5)

The UI should send this payload to trigger project creation:

```json
{
  "briefAnalysis": {
    "business_brief": {
      "client": "BMW",
      "agency": "Jung von Matt",
      "brand": "BMW i",
      "media": ["TV", "Online", "Social"],
      "term": "1 year",
      "territory": ["Germany", "Austria", "Switzerland"],
      "budget": "175000",
      "lengths": ["30s", "60s"],
      "cutdowns": ["15s", "6s"],
      "extras": ""
    },
    "creative_brief": {
      "mood": "Energetic, Premium",
      "keywords": ["energetic", "premium", "innovative"],
      "genres": ["electronic", "indie"],
      "instruments": ["synths", "drums"],
      "reference_tracks": ["Track 1", "Track 2"],
      "descriptions": "...",
      "lyrics_requirements": "Instrumental preferred",
      "enhanced_interpretation": {
        "search_keywords": [...],
        "mood_descriptors": [...],
        "genre_suggestions": [...],
        "reference_analysis": "..."
      }
    },
    "contextual_brief": {
      "brand": "BMW i",
      "brand_category": "Automotive",
      "brand_attributes": ["innovation", "sustainability"],
      "audience_preferences": "25-45 urban professionals",
      "story": "..."
    },
    "technical_brief": {
      "lengths": ["30s", "60s"],
      "musical_attributes": { "bpm": "120-130", "key": "minor" },
      "stem_requirements": "Full stems needed",
      "format_specs": "WAV 48kHz"
    },
    "deliverables": {
      "submission_deadline": "2025-02-01",
      "ppm_date": "2025-02-15",
      "shoot_date": null,
      "offline_date": "2025-03-01",
      "online_date": "2025-03-15",
      "air_date": "2025-04-01"
    },
    "missing_information": [],
    "brief_quality": "complete",
    "confidence_score": 0.92,
    "extraction_status": "complete"
  },
  "user": {
    "email": "user@tracksandfields.com",
    "name": "Project Owner",
    "id": "uuid",
    "role": "user"
  },
  "projectId": "session_123",
  "chatId": "chat_456",
  "messageId": "msg_789",
  "version": 1,
  "timestamp": "2025-01-15T12:00:00Z"
}
```

### Database Tables Updated

The v5 workflow writes to these tables:

| Table | Operation | Fields |
|-------|-----------|--------|
| `tf_users` | UPSERT | email, name, openwebui_user_id, role, last_login |
| `tf_cases` | INSERT | case_number, case_title, catchy_case_id, case_owner_id, session_id, status, slack_channel_id |
| `tf_briefs` | INSERT | All brief fields (business, creative, technical, contextual, deliverables, analysis) |
| `tf_case_activity` | INSERT | case_id, activity_type, activity_description, user_id, source, changes |

### Automation Step Status

Automated steps have additional statuses:

| Status | Description | Visual |
|--------|-------------|--------|
| `queued` | Waiting in n8n queue | Gray clock |
| `running` | Currently executing | Blue spinner |
| `success` | Completed successfully | Green check |
| `failed` | Error occurred | Red X |
| `retrying` | Failed, attempting retry | Yellow refresh |
| `skipped` | Not applicable | Gray dash |

### Error Handling

When automated steps fail:

1. **Retry Logic:** n8n retries 3 times with exponential backoff
2. **Alert:** After 3 failures, alert posted to #n8n-errors Slack channel
3. **Manual Override:** User can trigger retry from workflow UI
4. **Fallback:** Some steps have manual fallback instructions

### UI Display for Automated Steps

- Show in a separate "System Tasks" section or collapsed group
- Include timestamp of last run
- Show execution time
- Link to n8n execution log for debugging
- Allow manual retry button for failed steps

---

## Team Roles Reference

| Role | Abbreviation | Primary Responsibility |
|------|--------------|------------------------|
| Account Manager | AM | Client communication, project lead, presentation |
| Music Supervisor | MS | Creative direction, music search, shortlisting |
| Project Manager | PM | Timeline coordination, resource management |
| Music Coordinator | MC | Admin support, submissions, external outreach |
| Business Affairs | BA | Contracts, clearance, invoicing |
| Management | MGMT | Oversight, approval, strategic input |
| Producer | - | Custom music creation, composer management |
| Composer | - | Bespoke composition |
| Clearance | - | Rights verification, approval tracking |

### Role Involvement by Project Type

| Role | E | D | C | B | A | Production |
|------|---|---|---|---|---|------------|
| AM | - | Primary | Primary | Primary | Primary | Support |
| MS | - | Yes | Yes | Yes | Yes | Support |
| PM | - | Optional | Optional | Yes | Yes | - |
| MC | - | - | - | Yes | Yes | - |
| BA | Contracts | Contracts | Contracts | Yes | Yes | Contracts |
| MGMT | - | - | - | Review | Oversight | - |
| Producer | - | - | - | - | - | Primary |

---

## Timeline & Milestones

### Key Date Types

| Date Type | Description | Criticality |
|-----------|-------------|-------------|
| Kick-off Date | When project officially starts | Critical |
| First Internal Check | Initial team review | Important |
| Second Check / Draft | Pre-presentation review | Important |
| Final Internal Approval | Sign-off before client delivery | Important |
| Delivery to Client | First presentation to client | Critical |
| Revision Window | Time for client feedback | Important |
| Client Final Approval | Client sign-off on selection | Important |
| Delivery to Post | Handoff to sound mix/post | Helpful |
| Air Date | When campaign goes live | Critical |

### Urgency Levels

| Level | Definition | First Response | First Presentation |
|-------|------------|----------------|---------------------|
| Standard | 2+ weeks until deadline | 24 hours | 5 business days |
| Rush | 1 week until deadline | 4 hours | 2-3 business days |
| Urgent | < 1 week until deadline | 1 hour | 24-48 hours |

---

## Step Status Model

Each workflow step has a status:

| Status | Description | Visual |
|--------|-------------|--------|
| `pending` | Not yet started | Gray/empty circle |
| `in_progress` | Currently being worked on | Yellow/blue pulsing |
| `completed` | Successfully finished | Green checkmark |
| `skipped` | Not applicable for this project | Gray strikethrough |
| `blocked` | Cannot proceed - waiting on something | Red warning |

---

## UI Components Needed

### 1. Workflow Progress Bar
- Visual representation of overall progress (% complete)
- Shows current step highlighted
- Different colors for different statuses

### 2. Step List View
- Expandable/collapsible list of all steps
- Each step shows: name, owner, status, estimated vs actual duration
- Ability to mark steps complete or skip
- Notes/comments per step

### 3. Timeline View
- Gantt-style or vertical timeline
- Key milestones marked
- Current date indicator
- Overdue items highlighted

### 4. Team Assignment Panel
- List of team members assigned to project
- Their role(s) on this project
- Which steps they own
- Availability/vacation notes

### 5. Quick Actions
- Mark step complete
- Reassign step to different person
- Add note to step
- Flag step as blocked
- Skip step (with reason)

### 6. Alerts & Notifications
- Steps overdue
- Steps approaching deadline
- Steps blocked
- Waiting on external response

---

## Data Model Reference

### WorkflowStep Entity

| Field | Type | Description |
|-------|------|-------------|
| `id` | UUID | Unique identifier |
| `project_id` | UUID | Parent project |
| `step_name` | String | Name of the step |
| `step_description` | Text | What this step involves |
| `sequence_number` | Integer | Order in workflow |
| `status` | Enum | pending, in_progress, completed, skipped, blocked |
| `assigned_role` | String | Default role (AM, MS, etc.) |
| `assigned_user_id` | UUID | Specific person assigned |
| `estimated_duration` | Interval | How long it should take |
| `actual_duration` | Interval | How long it actually took |
| `started_at` | Timestamp | When work began |
| `completed_at` | Timestamp | When marked complete |
| `notes` | Text | Comments or context |
| `blocked_reason` | Text | Why step is blocked (if applicable) |

### TeamAssignment Entity

| Field | Type | Description |
|-------|------|-------------|
| `id` | UUID | Unique identifier |
| `project_id` | UUID | Parent project |
| `user_id` | UUID | Team member |
| `role` | Enum | AM, MS, PM, MC, BA, MGMT, Producer, Composer |
| `is_primary` | Boolean | Primary owner of this role |
| `notes` | Text | Assignment notes |
| `assigned_at` | Timestamp | When assigned |

---

## Workflow Initialization Logic

When a project is created, auto-generate workflow steps based on type:

```
function initializeWorkflow(projectType: string): WorkflowStep[] {
  switch(projectType) {
    case 'A':
    case 'B':
      return createABWorkflowSteps();  // 17 steps
    case 'C':
    case 'D':
      return createCDWorkflowSteps();  // 11 steps
    case 'E':
      return createEWorkflowSteps();   // 3 steps
    case 'PRODUCTION':
      return createProductionWorkflowSteps();  // 11 steps
    default:
      return [];  // Unknown - no steps until classified
  }
}
```

---

## Quality Checkpoints

Built-in quality gates in the workflow:

### Before Sending to Client (Step 7-11 depending on type)

- [ ] List complete? All positions filled
- [ ] Rights verified? TBC items resolved
- [ ] Quality check? Tracks match brief
- [ ] Presentation style? Appropriate format
- [ ] Management review? (B/A types only)

### After Client Receives (Engagement Check)

- [ ] Monitor engagement (3 days standard)
- [ ] Follow up if no response
- [ ] Double down on favorites
- [ ] Prepare alternatives if needed

---

## Sample User Flows

### Flow 1: Mark Step Complete
1. User clicks on current step
2. Step expands to show details
3. User clicks "Mark Complete" button
4. Optional: Add completion notes
5. Step status changes to completed
6. Next step becomes current
7. Activity log updated

### Flow 2: Reassign Step
1. User clicks on step owner
2. Team member dropdown appears
3. User selects new owner
4. Confirmation dialog
5. Assignment updated
6. Notification sent to new owner
7. Activity log updated

### Flow 3: Flag Step as Blocked
1. User clicks status indicator
2. Selects "Blocked" from dropdown
3. Required: Enter blocked reason
4. Step highlighted in red
5. Alert created for project lead
6. Activity log updated

---

## Integration Points

### With Brief Data
- Workflow type determined by project classification (budget)
- Timeline milestones populated from WHEN section
- Team assignments populated from WHO section

### With Activity Log
- Every status change logged
- Every reassignment logged
- Notes and comments tracked

### With External Systems
- Slack notifications on step completion
- Slack alerts on blocked steps
- Calendar integration for milestones

---

## Expected Design OS Output

After running `/shape-section` for Workflow Tracker, expect:
- User stories defined
- Component requirements documented
- Data requirements specified
- Sample interactions outlined
- Ready for `/design-screen` command
