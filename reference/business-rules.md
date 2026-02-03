# TF Business Rules Reference

Complete reference for project classification, margins, and workflows.

---

## Project Classification (5-Tier Model)

Projects are classified based on total budget. The type determines workflow complexity and team involvement.

### Tier Definitions

| Type | Budget Range | Workflow | Team Involvement |
|------|--------------|----------|------------------|
| **A** | > 100,000 EUR | Full (A+B-TYPE) | Full team + Management oversight |
| **B** | 25,000 - 100,000 EUR | Full (A+B-TYPE) | Full team collaboration |
| **C** | 10,000 - 25,000 EUR | Simplified (C+D-TYPE) | Music team + PM |
| **D** | 2,500 - 10,000 EUR | Simplified (C+D-TYPE) | Music team + PM |
| **E** | <= 2,500 EUR | Blanket only (E-TYPE) | Minimal - safe picks only |
| **Production** | Any (custom music) | Production workflow | Producer-led |

### Classification Logic

```
function classifyProject(budget: number, isProduction: boolean): ProjectType {
  if (isProduction) return 'PRODUCTION';
  if (budget === null || budget === undefined) return 'UNKNOWN';
  if (budget > 100000) return 'A';
  if (budget >= 25000) return 'B';
  if (budget >= 10000) return 'C';
  if (budget >= 2500) return 'D';
  return 'E';
}
```

---

## Margin Structure

TF uses a tiered margin structure based on budget. The margin is TF's fee; the payout goes to rights holders.

### Margin Tiers

| Budget Range | TF Margin | Payout to Rights Holders |
|--------------|-----------|--------------------------|
| 0 - 1,500 EUR | 100% | 0 EUR (Library/Blanket deals) |
| 1,500 - 30,000 EUR | 50% | 50% of budget |
| 30,000 - 100,000 EUR | 25% | 75% of budget |
| 100,000 - 250,000 EUR | 20% | 80% of budget |
| 250,000 - 500,000 EUR | 15% | 85% of budget |
| > 500,000 EUR | 10% | 90% of budget |

### Calculation Examples

| Budget | Tier | TF Margin | Payout |
|--------|------|-----------|--------|
| 1,200 EUR | Library | 100% (1,200 EUR) | 0 EUR |
| 15,000 EUR | Tier 1 | 50% (7,500 EUR) | 7,500 EUR |
| 75,000 EUR | Tier 2 | 25% (18,750 EUR) | 56,250 EUR |
| 150,000 EUR | Tier 3 | 20% (30,000 EUR) | 120,000 EUR |
| 400,000 EUR | Tier 4 | 15% (60,000 EUR) | 340,000 EUR |
| 750,000 EUR | Tier 5 | 10% (75,000 EUR) | 675,000 EUR |

### Margin Calculation Function

```typescript
function calculatePayout(budget: number): { payout: number; marginPct: number; tier: string } {
  if (budget <= 1500) {
    return { payout: 0, marginPct: 100, tier: 'LIBRARY' };
  } else if (budget <= 30000) {
    return { payout: budget * 0.50, marginPct: 50, tier: 'TIER_1' };
  } else if (budget <= 100000) {
    return { payout: budget * 0.75, marginPct: 25, tier: 'TIER_2' };
  } else if (budget <= 250000) {
    return { payout: budget * 0.80, marginPct: 20, tier: 'TIER_3' };
  } else if (budget <= 500000) {
    return { payout: budget * 0.85, marginPct: 15, tier: 'TIER_4' };
  } else {
    return { payout: budget * 0.90, marginPct: 10, tier: 'TIER_5' };
  }
}
```

### Edge Cases

- **Budget on boundary:** Use the higher tier (e.g., exactly 30,000 EUR -> 25% margin)
- **Budget unknown:** Cannot calculate margin, flag as critical missing
- **Custom arrangements:** Some clients have flat fees or volume discounts
- **Multi-track projects:** May need budget split discussion

---

## Workflow Types

### A+B-TYPE (Full Workflow)

For projects > 25,000 EUR. Full service with custom mailouts to labels/publishers.

**Steps:**
1. AM + MS: Define Briefing (1h)
2. AM + MS: Define Strategy (1h)
3. MC: Send brief to pub/labels (1h)
4. MS + MS/MC: Collect Tracks (1d)
5. MC: Upload submissions (1h)
6. MS: Shortlist Tracks (2h)
7. AM + MS: Quality Check (1h)
8. TBD: Filter unclearables/active uses (1h)
9. AM + MS: Define presentation style (1h)
10. MGMT: Check in for feedback (1h)
11. AM: Send list to client (3d)
12. AM + MS: Check list engagement (1h)
13. AM: Follow Up/Double Down (1h)
14. AM + MS + MGMT: Next steps (1h)
15. Clearance: Seek approval of chosen track(s)
16. MS or MGMT: Check Approval
17. BA: Make Contracts

**Rules:**
- Playlist or Request AND custom mailout by default
- Music Team collects submissions and adds own ideas
- 50/50 split between team and management is ideal
- A-type requires Management submissions where needed

### C+D-TYPE (Simplified Workflow)

For projects 2,500 - 25,000 EUR. Request-first approach with TBC checking.

**Steps:**
1. AM: Define Briefing (1h)
2. AM: Create Request (1h)
3. MS: Shortlist Request (1d)
4. AM + MS: Additional Tracks needed? (1h)
5. MS: Add additional Tracks (2h)
6. MS + TBD: List Safe & Good? (0.5h)
7. Check TBCs (1d)
8. AM: Send list to client (1d)
9. AM + MS: Check list engagement (3d)
10. AM: Follow Up/Double Down (1h)
11. BA: Make Contract

**Rules:**
- Request first (proven most successful)
- Music Team shortlists, PM judges if additional tracks needed
- Final shortlist: music team checks for TBCs and question marks

### E-TYPE (Blanket Deal)

For projects <= 2,500 EUR. Only safe picks, no extras.

**Rules:**
- Use blanket/library deals only
- No custom searches or negotiations
- Only pre-cleared tracks
- Minimal team involvement

### Production Workflow

For custom music creation at any budget.

**Steps:**
1. AM: Define Briefing (1h)
2. Producer: Select mood tracks + composer (1h)
3. Producer + MS: Scout singers (1h)
4. Producer: Brief composer (1h)
5. Producer + AM: Internal check (1-2d)
6. Producer: Internal feedback (0.5-1d)
7. AM: Send to client
8. Producer: Brief client feedback (0.5-1d)
9. Producer: Finalization + Cut downs (1h)
10. Producer: Collect assets
11. BA: Make contracts

---

## Brief Completeness Scoring

Briefs are scored 0-100% based on field completeness.

### Critical Fields (50 points total, 10 each)

Must have to proceed:
- Client name
- Territory
- Deadline date
- Media types
- Creative direction

### Important Fields (30 points total, 5 each)

Help ensure good results:
- Brand name
- Mood keywords
- Genre preferences
- Reference tracks
- Video lengths
- Term length

### Helpful Fields (20 points total, 2 each)

Enhance output quality:
- Campaign context
- Target audience
- Brand values
- Competitor info
- Previous music used
- Agency name
- Brief sender name
- Lyrics requirements
- Must avoid
- Sync points

### Scoring Thresholds

- **0-30%:** Cannot start work - request more info
- **30-60%:** Can start with assumptions - flag uncertainties
- **60-80%:** Good working brief - proceed with clarifications
- **80-100%:** Excellent brief - full confidence

---

## Team Roles

| Role | Abbrev | Responsibility |
|------|--------|----------------|
| Account Manager | AM | Client communication, project lead |
| Music Supervisor | MS | Creative direction, music search |
| Project Manager | PM | Timeline coordination |
| Music Coordinator | MC | Admin support, submissions |
| Business Affairs | BA | Contracts, clearance, invoicing |
| Management | MGMT | Oversight, approval (A/B types) |
| Producer | - | Custom music creation |
| Composer | - | Bespoke composition |

### Role Requirements by Type

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

## Quality Check Points

### Before Sending to Client

1. List complete? All positions filled
2. Rights verified? TBC items flagged
3. Quality check? Tracks match brief
4. Presentation style? Appropriate format
5. Management review? (B/A types)

### After Client Receives

1. Monitor engagement (3 days)
2. Follow up if no response
3. Double down on favorites
4. Prepare alternatives if needed

---

## Response Timing

| Urgency | First Response | First Presentation |
|---------|----------------|---------------------|
| Standard | 24h | 5 business days |
| Rush | 4h | 2-3 business days |
| Urgent | 1h | 24-48 hours |
