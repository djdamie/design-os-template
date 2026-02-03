# TF Current State vs Requirements Analysis

## Document Purpose
Gap analysis comparing what's currently built vs. what TF needs for the complete workflow system.

---

## 1. Executive Summary

### What You've Built (Working Well)
Your 5 n8n workflows form a solid MVP for brief extraction and case management:

| Workflow | Status | Function |
|----------|--------|----------|
| TF_brief_to_project_v5 | ✅ Working | Creates cases, Slack channels, Nextcloud folders, Google Docs |
| SlackBot | ✅ Working | AI-powered updates with Groq (llama-4-scout), multi-field support |
| SlackBot - Get Brief Info | ✅ Working | Displays comprehensive brief with update history |
| Update Brief from OpenWebUI | ✅ Working | Bi-directional sync with AI validation |
| Sync Brief to Nextcloud | ✅ Working | Versioned file management |

### The Gap
**Your system focuses on:** Brief extraction → Storage → Notification

**TF's vision extends to:** Brief → Strategy → Creative Execution → Quality Checks → Delivery

---

## 2. Feature Comparison Matrix

### 2.1 Brief Extraction

| Feature | Current State | Required State | Gap |
|---------|---------------|----------------|-----|
| Business info extraction | ✅ Complete | ✅ Complete | None |
| Creative brief parsing | ✅ Complete | ✅ Complete | None |
| Technical requirements | ✅ Complete | ✅ Complete | None |
| Contextual information | ⚠️ Partial | ✅ Complete | Add competitor analysis |
| Deliverables & deadlines | ✅ Complete | ✅ Complete | None |
| Completeness scoring | ✅ Complete | ✅ Complete | None |

### 2.2 Project Classification

| Feature | Current State | Required State | Gap |
|---------|---------------|----------------|-----|
| Budget-based classification | ❌ Missing | A/B/C/Production types | **Critical** |
| Margin calculation | ❌ Missing | 6-tier margin structure | **Critical** |
| Workflow routing | ❌ Missing | Type-specific workflows | **Critical** |
| Management oversight flags | ❌ Missing | A-type requires approval | Medium |

### 2.3 Team Assignment

| Feature | Current State | Required State | Gap |
|---------|---------------|----------------|-----|
| Project owner | ✅ Single owner | ✅ Single owner | None |
| Role assignment | ❌ Missing | 10+ role types | **Critical** |
| Workload balancing | ❌ Missing | Availability tracking | Low |
| Escalation paths | ❌ Missing | Management routing | Medium |

### 2.4 Workflow Management

| Feature | Current State | Required State | Gap |
|---------|---------------|----------------|-----|
| Music source selection | ❌ Missing | Internal/Request/Blanket/Bespoke | **Critical** |
| Milestone tracking | ❌ Missing | Internal checkpoints | Medium |
| Quality checks | ❌ Missing | Shortlist confidence, lyrics/legal | High |
| Strategy capture | ❌ Missing | Challenge rating, blind spots | Medium |

### 2.5 Search & Discovery

| Feature | Current State | Required State | Gap |
|---------|---------------|----------------|-----|
| Chartmetric integration | ✅ MCP ready | Artist research | None |
| Spotify API | ✅ In TF Scout | Track lookup | None |
| AIMS similarity | ❌ Missing | Reference matching | High |
| TF Platform search | ❌ Missing | Internal catalog | High |
| Lyrics search | ⚠️ Partial | Lyrical sentiment | Medium |

### 2.6 Client Communication

| Feature | Current State | Required State | Gap |
|---------|---------------|----------------|-----|
| Slack notifications | ✅ Working | Project updates | None |
| Brief display | ✅ Working | Formatted view | None |
| Update history | ✅ Working | Activity log | None |
| Client-facing updates | ❌ Missing | Account manager comms | Medium |

---

## 3. Critical Missing Pieces

### 3.1 Project Classification Logic

**Current:** No classification system
**Required:** Automatic A/B/C/Production typing based on budget

```
SYNCH_A: Budget >= €100,000
  - Full service with custom mailouts
  - Management oversight required
  - Extensive clearance negotiations

SYNCH_B: Budget >= €25,000 (or €10k TBD)
  - Playlist/request with custom mailouts
  - Music team and PM collaboration

SYNCH_C: Budget < €25,000
  - Request-first approach
  - Simplified workflow
  - TBC checking where needed

PRODUCTION:
  - Custom music creation
  - Composer selection
  - Singer casting
```

### 3.2 Margin Structure

**Current:** No margin calculations
**Required:** Budget-to-payout conversion

| Budget Range | Margin | Payout |
|--------------|--------|--------|
| $0-1,500 | 100% | $0 (Library/Blanket) |
| $1,500-30,000 | 50% | 50% of budget |
| $30,000-100,000 | 25% | 75% of budget |
| $100,000-250,000 | 20% | 80% of budget |
| $250,000-500,000 | 15% | 85% of budget |
| Above $500,000 | 10% | 90% of budget |

### 3.3 Team Roles (Missing)

The system needs to track these role assignments:

| Role | Abbreviation | Responsibility |
|------|--------------|----------------|
| Account Manager | AM | Client communication |
| Music Supervisor | MS | Creative direction |
| Project Manager | PM | Timeline coordination |
| Business Affairs | BA | Contracts, clearance |
| Management | MGMT | Oversight, approval |
| Music Coordinator | MC | Admin support |

### 3.4 Workflow-Specific Milestones

**C-Type Workflow:**
1. AM: Define Briefing (1h)
2. AM: Create Request (1h)
3. MS: Shortlist Request (1d)
4. AM+MS: Additional Tracks needed? (1h)
5. MS: Add additional Tracks (2h)
6. MS+TBD: List Safe & Good? (0.5h)
7. Check TBCs (1d)
8. AM: Send list to client (1d)
9. AM+MS: Check list engagement (3d)
10. AM: Follow Up/Double Down (1h)
11. BA: Make Contract

**B-Type Workflow:** (Adds more complexity)
**A-Type Workflow:** (Adds management oversight)

---

## 4. Recommended Build Path

### Phase 1: Foundation Enhancement (Weeks 1-2)
**Goal:** Expand data model without breaking existing workflows

- [ ] Add classification fields to database
- [ ] Implement margin calculation function
- [ ] Add project type to brief extraction
- [ ] Keep n8n workflows running

### Phase 2: Custom Application MVP (Weeks 3-4)
**Goal:** Side-by-side chat + canvas interface

- [ ] Next.js frontend with split pane
- [ ] FastAPI backend with LangGraph
- [ ] Basic brief extraction in new UI
- [ ] Supabase connection

### Phase 3: Full Brief System (Weeks 5-6)
**Goal:** Match current Brief Analyzer capabilities

- [ ] All 6 brief categories
- [ ] Completeness scoring
- [ ] Missing field detection
- [ ] Suggestion generation

### Phase 4: Classification & Strategy (Weeks 7-8)
**Goal:** Add business logic layer

- [ ] Automatic A/B/C classification
- [ ] Margin calculations
- [ ] Workflow routing recommendations
- [ ] Team assignment suggestions

### Future Phases
- Phase 5: Search integration (Chartmetric, AIMS, TF Platform)
- Phase 6: Clearance workflow
- Phase 7: Quality checks and milestones
- Phase 8: Advanced analytics

---

## 5. What to Preserve

### Keep These Components
1. **Supabase PostgreSQL** - Existing tables, extend don't replace
2. **n8n Workflows** - Slack and Nextcloud integrations work well
3. **Brief Schema** - Your 6-category structure is solid
4. **Chartmetric MCP** - Production-ready research tool

### Retire These Components
1. **OpenWebUI** - Replace with custom chat interface
2. **Current webhook-based brief submission** - Build direct API

### Evolve These Components
1. **Brief Analyzer Prompt** - Migrate to LangGraph state machine
2. **SlackBot** - Keep but add project type awareness

---

## 6. Risk Assessment

| Risk | Impact | Mitigation |
|------|--------|------------|
| Breaking existing workflows | High | Parallel development, gradual migration |
| LLM inconsistency | Medium | Structured output validation, fallbacks |
| Self-hosting complexity | Medium | Docker containerization, clear docs |
| Scope creep | High | Strict phase boundaries, MVP focus |

---

## 7. Success Criteria

### Phase 1-2 Success (MVP)
- [ ] Can analyze a brief in chat interface
- [ ] Can see/edit results in canvas view
- [ ] Classification displays correctly
- [ ] Margin calculates accurately

### Phase 3-4 Success (Feature Parity)
- [ ] Matches current Brief Analyzer accuracy
- [ ] All field types editable
- [ ] Suggestions generate appropriately
- [ ] Integrates with existing Slack/Nextcloud

### Long-term Success
- [ ] 70% reduction in manual processing time
- [ ] 95%+ brief extraction accuracy
- [ ] 100% project classification accuracy
- [ ] Team adoption > 90%
