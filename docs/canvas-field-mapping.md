# Canvas Field Mapping Documentation

This document explains which fields in the Project Canvas are populated from brief extraction vs. which remain empty for manual entry.

## Fields Populated from Brief Extraction

These fields are automatically filled when the AI agent extracts information from a client brief:

### WHAT Tab
| Field | Source |
|-------|--------|
| `client_name` | Extracted from brief |
| `agency_name` | Extracted from brief |
| `brand_name` | Extracted from brief |
| `brief_sender_name` | Extracted from brief |
| `brief_sender_email` | Extracted from brief |
| `brief_sender_role` | Extracted from brief |
| `project_title` | Extracted from brief |
| `video_lengths` | Extracted from brief |
| `territory` | Extracted from brief |
| `media_types` | Extracted from brief |
| `term_length` | Extracted from brief |
| `exclusivity` | Extracted from brief |
| `exclusivity_details` | Extracted from brief |
| `budget_amount` | Extracted from brief |
| `creative_direction` | Extracted from brief |
| `mood_keywords` | Extracted from brief |
| `genre_preferences` | Extracted from brief |
| `reference_tracks` | Extracted from brief |
| `must_avoid` | Extracted from brief |
| `vocals_preference` | Extracted from brief |

### WITH_WHAT Tab
| Field | Source |
|-------|--------|
| `stems_required` | Extracted from brief |
| `sync_points` | Extracted from brief |

### WHEN Tab
| Field | Source |
|-------|--------|
| `kickoff_date` | Extracted from brief |
| `first_presentation_date` | Extracted from brief |
| `deadline_date` | Extracted from brief |
| `air_date` | Extracted from brief |
| `deadline_urgency` | Extracted from brief |

### OTHER Tab
| Field | Source |
|-------|--------|
| `campaign_context` | Extracted from brief |
| `target_audience` | Extracted from brief |
| `brand_values` | Extracted from brief |
| `extraction_notes` | AI agent observations about ambiguous data |

---

## Fields That Remain Empty (Manual Entry Required)

These fields are intentionally left empty because they represent internal TF decisions, assignments, or information not typically found in client briefs.

### WHO Tab - Team Assignments (Internal)

| Field | Why Empty |
|-------|-----------|
| `account_manager` | TF internal assignment - not in client briefs |
| `music_supervisor` | TF internal assignment |
| `project_manager` | TF internal assignment |
| `music_coordinator` | TF internal assignment |
| `business_affairs` | TF internal assignment |
| `management` | TF internal assignment (Type A/B only) |
| `composers` | Assigned internally for Production projects |
| `external_partners` | Added during workflow, not in briefs |

**Reason:** Briefs come from clients/agencies. They don't tell TF who to assign internally.

---

### WITH_WHAT Tab - Workflow Decisions (Internal)

| Field | Why Empty |
|-------|-----------|
| `source_type` | TF decides how to source music (internal/labels/blanket/bespoke) |
| `submission_rules` | Internal rules TF sets for submissions |
| `deliverable_formats` | What format TF delivers (playlist/shortlist/deck) - internal |
| `file_formats` | Audio formats (WAV/MP3/stems) - often decided later |
| `stems_details` | Specific stem requirements - clarified during project |
| `pre_clearance` | Internal process flag |

**Reason:** These are workflow decisions TF makes, not info from the brief.

---

### WHEN Tab - Internal Scheduling

| Field | Why Empty |
|-------|-----------|
| `client_presentation_date` | Scheduled by TF, not in briefs |
| `timing_notes` | Internal notes about timing |

**Reason:** Briefs give deadlines (air date, submission deadline), but internal milestones are scheduled by TF.

---

### WHAT Tab - Edge Cases

| Field | Why Empty |
|-------|-----------|
| `language_adaptations` | Rarely specified in briefs - could add to extraction if needed |
| `budget_currency` | Hardcoded to 'EUR' - could extract from brief (€, $, £) |

**Potential improvement:** These two could be added to extraction if briefs commonly include them.

---

### OTHER Tab - Research & Links

| Field | Why Empty |
|-------|-----------|
| `previous_music` | Historical research TF does on client |
| `competitor_info` | Research TF does on competitors |
| `approval_risks` | Internal risk assessment |
| `creative_deck_link` | Link to external system (Google Drive, etc.) |
| `agency_brief_link` | Link to original brief file |
| `reference_playlist_link` | Spotify/Apple Music link (could be extracted if URL in brief) |

**Reason:** These are either research TF does, or links to external systems that get added during workflow.

---

## Summary

The remaining empty fields fall into 3 categories:

1. **Internal assignments** (WHO tab) - TF decides who works on it
2. **Workflow decisions** (WITH_WHAT tab) - TF decides how to work
3. **Research/links** (OTHER tab) - Added during project, not from brief

## Future Enhancements

Fields that could potentially be added to extraction:
- `language_adaptations` - if briefs commonly specify language versions
- `budget_currency` - detect €, $, £ symbols in budget text
- `reference_playlist_link` - if Spotify/Apple Music URLs are included in briefs
