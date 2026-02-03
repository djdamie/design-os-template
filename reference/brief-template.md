# TF Brief Template Reference

Complete structure for client briefs organized by WHAT/WHO/WITH WHAT/WHEN/WHAT ELSE.

---

## Brief Structure Overview

Every brief should capture information across these 5 sections:

| Section | Purpose |
|---------|---------|
| **WHAT** | Project overview & scope - what needs to be done |
| **WHO** | Team & responsibilities - who is involved |
| **WITH WHAT** | Tools, sources & deliverables - how it will be done |
| **WHEN** | Timeline & check-ins - when things happen |
| **WHAT ELSE** | Notes & attachments - additional context |

---

## WHAT - Project Overview & Scope

### Client Information

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| Client | text | Critical | End client name (e.g., "BMW") |
| Agency | text | Important | Agency handling the project |
| Project Title | text | Critical | Campaign/project name |

### Scripts / Deliverables

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| Number of scripts | number | Important | How many different spots |
| Lengths | multi-select | Important | 6s, 10s, 15s, 30s, 60s, custom |
| Tag-ons / Cutdowns | boolean + text | Helpful | Additional edits needed |
| Language adaptations | multi-select | Helpful | Which languages/versions |

### Buyouts / Usage

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| Duration | select | Critical | Term length (6 months, 1 year, etc.) |
| Territories | multi-select | Critical | Where it will air (DACH, Europe, Global, etc.) |
| Media | multi-select | Critical | TV, Online, Social, Cinema, POS, CTV/ATV |
| Exclusivity | boolean + text | Important | Category exclusivity requirements |

### Budget

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| Payout & Budget | currency | Critical | Total project budget |
| Currency | select | Auto | EUR, USD, GBP |
| Project Type | auto | Auto | Calculated from budget (A/B/C/D/E) |
| Margin | auto | Auto | Calculated from budget tier |
| Payout | auto | Auto | Budget minus margin |

### Project Type

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| Project Type | select | Important | Track/Mood Search Only, Track Search & Licensing, Bespoke Composition |

### Brief Summary

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| Brief Summary | textarea | Critical | What the team needs to do and why. Tone, story, emotion. Role of music. Client requests. |

### Creative Considerations

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| Creative Challenges | textarea | Important | Hurdles: tight deadline, complex tone, competing references, client taste, buyout constraints |
| Challenge Rating | select | Helpful | * to *** difficulty level |

### References / Mood / Keywords

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| Mood Keywords | tags | Important | Tone words (upbeat, melancholic, epic, etc.) |
| Genre Preferences | tags | Important | Genres to explore |
| Reference Tracks | list | Important | Spotify links with notes |
| Must Avoid | textarea | Helpful | What NOT to include |
| Vocals Preference | select | Helpful | Instrumental, vocals, either, specific |

---

## WHO - Team & Responsibilities

### Internal Team

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| Project Lead | select | Critical | Primary responsible person |
| Account / Client Contact | select | Critical | Client-facing person |
| Creative Search / Direction | select | Important | Music search lead |
| Music Supervisor | select | Important | Creative oversight |
| Licensing / Legal | select | Important | Clearance handling |
| Composers | select | Conditional | For bespoke projects |
| Support / Backup | select | Helpful | Researchers, assistants |

### External

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| External Partners | text | Helpful | Agency producers, consultants, post-house |

### Process

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| Feedback Loop | multi-select | Important | Who signs off internally before external delivery |
| Vacation / Sick Leave Support | text | Helpful | Backup contacts |

---

## WITH WHAT - Tools, Sources & Deliverables

### Music Source / Workflow

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| Source Type | select | Important | Internal only, Request at T&F, Label/Publisher briefing, Blanket license, Bespoke composition |

### Submission Rules

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| Submission Rules | select | Important | Internal only, Submission via request, Label/Publisher briefing, Bespoke internal/external |

### Deliverables

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| Deliverable Format | multi-select | Important | Playlist link, shortlist file, comparison notes, demo |
| File Formats | multi-select | Helpful | WAV, MP3, stems |
| Stems Required | boolean + text | Helpful | What stems needed |

### Quality & Compliance

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| Pre-cleared Required | boolean | Important | Must tracks be pre-cleared? |
| Metadata Complete | boolean | Helpful | Full metadata needed? |
| Naming Conventions | text | Helpful | File naming rules |

### Budget Notes

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| Additional Budget | textarea | Helpful | External search costs, freelance artists, etc. |

---

## WHEN - Timeline & Check-ins

### Key Dates

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| Kick-off / Briefing Date | date | Critical | When project starts |

### Internal Milestones

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| First Internal Check | datetime | Important | Initial review |
| Second Check / Presentation Draft | datetime | Important | Draft review |
| Final Internal Approval | datetime | Important | Internal sign-off |

### External Deadlines

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| Delivery to Agency/Client | datetime | Critical | First presentation |
| Revision Window | datetime | Important | Time for feedback |
| Final Approval | datetime | Important | Client sign-off |
| Delivery to Post-Production | datetime | Helpful | Handoff to mix |

### Post-Timing

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| Post-Timing Notes | textarea | Helpful | Sound-mix schedule, adaptations, reshoot dates |

### Urgency

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| Urgency Level | select | Important | Standard (2+ weeks), Rush (1 week), Urgent (<1 week) |

---

## WHAT ELSE - Notes & Attachments

### Notes

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| Notes / Comments | textarea | Helpful | Additional info not covered above |
| Client History | textarea | Helpful | Previous work with this client |
| Approval Risks | textarea | Helpful | Known issues or concerns |
| Composer Suggestions | textarea | Helpful | Ideas for bespoke |
| Tone Watchouts | textarea | Helpful | Sensitivities to avoid |

### Attachments

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| Creative Deck | url | Helpful | Link to creative deck |
| Agency Brief | url | Helpful | Original agency brief |
| Scripts | url | Helpful | Script documents |
| Mood Board | url | Helpful | Visual references |
| Reference Playlists | url | Helpful | Spotify playlist links |
| Video Reference | url | Helpful | Rough cuts or animatics |

---

## Field Priority Summary

### Critical (Must Have - Blocks Project)

1. Client name
2. Territory
3. Media types
4. Deadline / Kick-off date
5. Budget (for classification)
6. Brief summary / Creative direction

### Important (Should Have - Ensures Quality)

1. Agency name
2. Brand name
3. Video lengths
4. Term length
5. Mood keywords
6. Reference tracks
7. Project lead
8. Account manager

### Helpful (Nice to Have - Enhances Output)

1. Campaign context
2. Target audience
3. Brand values
4. Competitor info
5. Previous music
6. Must avoid
7. Sync points
8. Composer suggestions

---

## Quality Check Questions

When reviewing a brief, the AI should verify:

### Check-in & Quality Check

- [ ] Shortlist(s) done by the music team?
- [ ] Overall confidence in the result?
- [ ] Strategy goal met?
- [ ] Budget fit or any uncertainties?
- [ ] Lyrics / artist legal check needed?
- [ ] Presentation format appropriate?
- [ ] Any blind spots (target group, brand relevance)?
- [ ] Any win-win add-ons (artist collab)?
