# Lean n8n Workflow Specifications

This document defines the specifications for the two new lean n8n workflows that handle external integrations only. The app owns all Supabase database operations.

## Architecture Overview

```
App (TF Project Builder)             n8n (External Integrations Only)
========================             ================================
1. Analyze brief (LangGraph)
2. Create case in Supabase
3. Create brief in Supabase
4. Call n8n webhook ──────────────>  5. Fetch case+brief from Supabase
                                     6. Create Slack channel
                                     7. Create Nextcloud folder
                                     8. Upload to Google Drive
                                     9. Update case with integration URLs
                                     10. Return success + links
<────────────────────────────────────
11. Update UI with integration status
```

---

## Workflow 1: TF Project Setup

**Webhook Endpoint:** `POST /webhook/tf-project-setup`

**Purpose:** After app creates case in Supabase, set up all external integrations (Slack, Nextcloud, Google Drive) in one call.

### Input Payload

```json
{
  "case_id": "uuid-of-the-case",
  "user_email": "user@tracksandfields.com"
}
```

### Expected Response

```json
{
  "success": true,
  "slack_channel_id": "C0123456789",
  "slack_channel_name": "#tf-0042-bmw-electric",
  "nextcloud_folder_url": "https://cloud.tracksandfields.com/f/12345",
  "google_drive_brief_url": "https://docs.google.com/document/d/..."
}
```

### Workflow Nodes (10 total)

```
┌─────────────────────────────────────────────────────────────────────────┐
│  1. [Webhook Trigger]                                                   │
│     Path: /webhook/tf-project-setup                                     │
│     Method: POST                                                        │
│     Authentication: Header Auth (X-N8N-API-KEY)                         │
└─────────────────────────────────────────────────────────────────────────┘
                                   │
                                   ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  2. [Supabase: Fetch Case + Brief]                                      │
│     Operation: Select                                                   │
│     Table: tf_cases                                                     │
│     Filter: id = {{$json.case_id}}                                      │
│     Join: tf_briefs (case_id)                                           │
│     Returns: case_number, catchy_case_id, project_title, brief data     │
└─────────────────────────────────────────────────────────────────────────┘
                                   │
                                   ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  3. [Code: Generate Channel Name]                                       │
│     Input: case_number, catchy_case_id, project_title                   │
│     Output: channel_name (e.g., "tf-0042-bmw-electric")                 │
│     Logic:                                                              │
│       - Format: tf-{case_number}-{slugified_title}                      │
│       - Max 80 chars, lowercase, hyphens only                           │
└─────────────────────────────────────────────────────────────────────────┘
                                   │
                                   ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  4. [Parallel Split]                                                    │
│     Branch 1: Slack integration                                         │
│     Branch 2: Nextcloud integration                                     │
│     Branch 3: Google Drive integration                                  │
└─────────────────────────────────────────────────────────────────────────┘
           │                       │                       │
           ▼                       ▼                       ▼
┌──────────────────┐   ┌──────────────────┐   ┌──────────────────┐
│ 5a. [Slack:      │   │ 5b. [Nextcloud:  │   │ 5c. [Google      │
│     Create       │   │     Create       │   │     Drive:       │
│     Channel]     │   │     Folder]      │   │     Create Doc]  │
│                  │   │                  │   │                  │
│ Name: from #3    │   │ Path:            │   │ Title: Brief -   │
│ Private: false   │   │ /Projects/{year}/│   │   {case_id}      │
│                  │   │ TF-{case_number} │   │ Content: Brief   │
│                  │   │ -{project_title} │   │   as markdown    │
└──────────────────┘   └──────────────────┘   └──────────────────┘
           │                       │                       │
           ▼                       │                       │
┌──────────────────┐               │                       │
│ 6a. [Slack:      │               │                       │
│     Invite User] │               │                       │
│                  │               │                       │
│ User: from email │               │                       │
│ Channel: from 5a │               │                       │
└──────────────────┘               │                       │
           │                       │                       │
           ▼                       │                       │
┌──────────────────┐               │                       │
│ 7a. [Slack: Post │               │                       │
│     Welcome Msg] │               │                       │
│                  │               │                       │
│ "New project     │               │                       │
│ created: ..."    │               │                       │
└──────────────────┘               │                       │
           │                       │                       │
           └───────────────────────┼───────────────────────┘
                                   │
                                   ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  8. [Merge Results]                                                     │
│     Combines: slack_channel_id, nextcloud_folder_url, drive_url         │
└─────────────────────────────────────────────────────────────────────────┘
                                   │
                                   ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  9. [Supabase: Update Case]                                             │
│     Table: tf_cases                                                     │
│     Filter: id = {{$json.case_id}}                                      │
│     Set:                                                                │
│       slack_channel = channel_name                                      │
│       slack_channel_id = channel_id (NEW FIELD)                         │
│       nextcloud_folder = folder_url                                     │
│       google_drive_url = drive_url (NEW FIELD)                          │
└─────────────────────────────────────────────────────────────────────────┘
                                   │
                                   ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  10. [Respond to Webhook]                                               │
│      Status: 200                                                        │
│      Body: { success: true, slack_channel_id, slack_channel_name,       │
│              nextcloud_folder_url, google_drive_brief_url }             │
└─────────────────────────────────────────────────────────────────────────┘
```

### Error Handling

- If Slack channel creation fails: Continue with other integrations, return partial success
- If Nextcloud folder creation fails: Continue with other integrations, return partial success
- If all fail: Return `{ success: false, error: "..." }`

---

## Workflow 2: TF Brief Sync

**Webhook Endpoint:** `POST /webhook/tf-brief-sync`

**Purpose:** After app updates brief in Supabase, sync to Nextcloud and notify Slack.

### Input Payload

```json
{
  "case_id": "uuid-of-the-case",
  "change_summary": "Updated budget to 75k, added deadline",
  "changed_by": "user@tracksandfields.com"
}
```

### Expected Response

```json
{
  "success": true,
  "version": 3,
  "nextcloud_current_url": "https://cloud.tracksandfields.com/...",
  "nextcloud_versioned_url": "https://cloud.tracksandfields.com/..."
}
```

### Workflow Nodes (6 total)

```
┌─────────────────────────────────────────────────────────────────────────┐
│  1. [Webhook Trigger]                                                   │
│     Path: /webhook/tf-brief-sync                                        │
│     Method: POST                                                        │
│     Authentication: Header Auth (X-N8N-API-KEY)                         │
└─────────────────────────────────────────────────────────────────────────┘
                                   │
                                   ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  2. [Execute Sub-Workflow: Sync Brief to Nextcloud]                     │
│     Workflow: xpnOcoHAwqtpm6d7 (existing)                               │
│     Input: { case_id }                                                  │
│     Returns: nextcloud URLs, version number                             │
└─────────────────────────────────────────────────────────────────────────┘
                                   │
                                   ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  3. [Supabase: Fetch Case for Slack Channel]                            │
│     Table: tf_cases                                                     │
│     Filter: id = {{$json.case_id}}                                      │
│     Select: slack_channel, slack_channel_id, project_title              │
└─────────────────────────────────────────────────────────────────────────┘
                                   │
                                   ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  4. [Code: Build Slack Message]                                         │
│     Input: change_summary, changed_by, project_title, nextcloud_url     │
│     Output: Slack Block Kit message                                     │
│                                                                         │
│     Message template:                                                   │
│     ┌─────────────────────────────────────────────────┐                 │
│     │ :memo: Brief Updated                            │                 │
│     │ *{project_title}* was updated by {changed_by}   │                 │
│     │                                                 │                 │
│     │ Changes: {change_summary}                       │                 │
│     │                                                 │                 │
│     │ [View in Nextcloud] [View in App]               │                 │
│     └─────────────────────────────────────────────────┘                 │
└─────────────────────────────────────────────────────────────────────────┘
                                   │
                                   ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  5. [Slack: Post Message to Channel]                                    │
│     Channel: slack_channel_id from step 3                               │
│     Message: Block Kit from step 4                                      │
└─────────────────────────────────────────────────────────────────────────┘
                                   │
                                   ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  6. [Respond to Webhook]                                                │
│     Status: 200                                                         │
│     Body: { success: true, version, nextcloud_current_url,              │
│             nextcloud_versioned_url }                                   │
└─────────────────────────────────────────────────────────────────────────┘
```

### Error Handling

- If Nextcloud sync fails: Return error, don't post to Slack
- If Slack post fails: Return success (sync completed), log warning

---

## Database Schema Updates

These new fields need to be added to `tf_cases` table:

```sql
ALTER TABLE tf_cases ADD COLUMN IF NOT EXISTS slack_channel_id TEXT;
ALTER TABLE tf_cases ADD COLUMN IF NOT EXISTS google_drive_url TEXT;
```

---

## Existing Workflows to Keep

| Workflow | ID | Purpose | Status |
|----------|----|---------| -------|
| Sync Brief to Nextcloud | xpnOcoHAwqtpm6d7 | Reusable sub-workflow | KEEP |
| SlackBot | rg3gklwz5xhghUsA | Slack → DB updates | KEEP |
| SlackBot - Get Brief Info | 9SfAEtstGa2JZr7L | Slack read commands | KEEP |

## Workflows to Archive

| Workflow | ID | Reason |
|----------|----| -------|
| TF_brief_to_project_v5 | rXuPgSxcLjmsbpIe | Duplicates app's DB operations |
| Update Brief from OpenWebUI | 6c4UWPOhua0t3DdE | OpenWebUI-specific |

---

## Testing Checklist

### TF Project Setup
- [ ] Webhook accepts case_id and user_email
- [ ] Fetches case + brief from Supabase correctly
- [ ] Creates Slack channel with correct name format
- [ ] Invites user to Slack channel
- [ ] Posts welcome message to channel
- [ ] Creates Nextcloud folder in correct path
- [ ] Creates Google Drive document with brief content
- [ ] Updates tf_cases with all integration URLs
- [ ] Returns correct response format

### TF Brief Sync
- [ ] Webhook accepts case_id, change_summary, changed_by
- [ ] Calls existing Nextcloud sync sub-workflow
- [ ] Posts formatted message to Slack channel
- [ ] Returns correct version number and URLs

---

## Rollout Plan

1. **Phase 1:** Create workflows in n8n (manual)
2. **Phase 2:** Test with curl/Postman
3. **Phase 3:** Connect to frontend (already wired)
4. **Phase 4:** Archive old v5 workflow
