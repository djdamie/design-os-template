# Project Types & Classification

## Overview
TF categorizes projects into types based on budget, which determines workflow complexity, team structure, and approval requirements.

## Classification Thresholds

| Type | Budget Range | Workflow Complexity |
|------|--------------|---------------------|
| **SYNCH_A** | ≥ €100,000 | Full service, management oversight |
| **SYNCH_B** | €25,000 - €99,999 | Standard service, team collaboration |
| **SYNCH_C** | < €25,000 | Simplified workflow |
| **PRODUCTION** | Any (custom music) | Composer/bespoke workflow |

> **Note:** The B/C threshold may change from €25k to €10k. This is TBD.

---

## SYNCH_C Projects (< €25k)

### Characteristics
- Request-first approach
- Simplified workflow
- TBC checking where needed
- Music team handles most tasks

### Workflow Steps
1. **AM: Define Briefing** (1h)
2. **AM: Create Request** (1h)
3. **MS: Shortlist Request** (1d)
4. **AM+MS: Additional Tracks needed?** (1h)
5. **MS: Add additional Tracks** (2h)
6. **MS+TBD: List Safe & Good?** (0.5h)
7. **Check TBCs** (1d)
8. **AM: Send list to client** (1d)
9. **AM+MS: Check list engagement** (3d)
10. **AM: Follow Up/Double Down** (1h)
11. **BA: Make Contract**

### Rules
- Request first: create a request for every search (proven most successful)
- Music Team shortlists requests, PM judges if additional tracks needed
- Final shortlist: music team checks list for potential question marks and TBCs

---

## SYNCH_B Projects (€25k - €100k)

### Characteristics
- Playlist/request with custom mailouts to labels/publishers
- Music team and PM collaboration
- More extensive search process
- Quality checks at multiple stages

### Workflow Steps
1. **AM + MS: Define Briefing** (1h)
2. **AM + MS: Define Strategy** (1h)
3. **MC: Send brief to pub/labels** (1h)
4. **MS+ MS/MC: Collect Tracks** (1d)
5. **MC: Upload submissions** (1h)
6. **MS: Shortlist Tracks** (2h)
7. **AM + MS: Quality Check** (1h)
8. **TBD: filter unclearables/active uses** (1h)
9. **AM + MS: Define presentation style** (1h)
10. **MGMT: Check in for feedback** (1h)
11. **AM: Send list to client** (3d)
12. **AM+MS: Check list engagement** (1h)
13. **AM: Follow Up/Double Down** (1h)
14. **AM + MS+ MGMT: Next steps** (1h)
15. **Clearance: Seek approval of chosen track(s)**
16. **MS or MGMT: Check Approval**
17. **BA: Make Contracts**

### Rules
- Playlist or Request AND custom mailout by default (unless strong reason not to)
- Music Team collects submissions and adds own ideas
- Music Team and Project/Account Management make final list (50/50 split is ideal)

---

## SYNCH_A Projects (≥ €100k)

### Characteristics
- Full service with custom mailouts to labels/publishers
- Management oversight required
- Extensive clearance negotiations
- Multiple approval stages

### Workflow
- Same as B-type workflow
- **Additional:** Management submissions only where needed
- Music Team, Account/Project Manager, and/or Senior Music Supervisor/Management make final list

### Rules
- Playlist or Request AND custom mailout by default
- Music Team collects submissions and adds own ideas
- 50/50 split between team and management is ideal

---

## PRODUCTION Projects

### Characteristics
- Custom music creation
- Composer selection and briefing
- Singer casting through member community
- Different workflow entirely

### Key Steps
1. Create mood playlists
2. Create composer reference playlists
3. Fill playlists with references
4. Shortlist
5. Quality check
6. Send to client
7. Create transfer folders
8. Composer selection
9. Production oversight
10. Final delivery

---

## Classification Logic

### Automatic Classification
```
IF budget IS NULL:
  project_type = 'UNKNOWN'
ELSE IF budget >= 100000:
  project_type = 'SYNCH_A'
ELSE IF budget >= 25000:
  project_type = 'SYNCH_B'
ELSE:
  project_type = 'SYNCH_C'
```

### Manual Override
- Production projects are flagged manually (not budget-based)
- Hybrid projects may need manual classification
- Client-specific arrangements may override

### UI Indicators

| Type | Badge Color | Icon |
|------|-------------|------|
| SYNCH_A | Purple | ⭐ |
| SYNCH_B | Blue | 🔷 |
| SYNCH_C | Green | ✓ |
| PRODUCTION | Orange | 🎵 |
| UNKNOWN | Gray | ? |

---

## Team Roles by Project Type

| Role | C-Type | B-Type | A-Type |
|------|--------|--------|--------|
| Account Manager (AM) | ✓ Primary | ✓ Primary | ✓ Primary |
| Music Supervisor (MS) | ✓ | ✓ | ✓ |
| Project Manager (PM) | Optional | ✓ | ✓ |
| Music Coordinator (MC) | - | ✓ | ✓ |
| Business Affairs (BA) | ✓ Contracts | ✓ | ✓ |
| Management (MGMT) | - | Review | ✓ Oversight |
| Senior MS | - | - | ✓ |
