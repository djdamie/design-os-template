# CLAUDE.md - TF Project Builder

## Project Context

This is the TF Project Builder - a conversational AI tool for music supervisors that transforms unstructured client briefs into actionable project data. Built with Next.js, CopilotKit, and Supabase.

## Architecture

**Frontend:** Next.js 14 App Router + CopilotKit + shadcn/ui
**Backend:** FastAPI + LangGraph agent
**Database:** Supabase PostgreSQL
**Integrations:** n8n webhooks → Slack, Nextcloud, Google Drive

## Key Design Documents

Read these before making changes:

| Document | Location | Purpose |
|----------|----------|---------|
| Build Instructions | `BUILD_INSTRUCTIONS.md` | Step-by-step build guide |
| Product Overview | `product/product-overview.md` | Vision, problems, features |
| Data Model | `product/data-model/data-model.md` | Entity definitions |
| Shell Spec | `product/shell/spec.md` | Layout structure |
| Section Specs | `product/sections/*/spec.md` | UI section requirements |
| Brief Template | `reference/brief-template.md` | All brief fields |
| Business Rules | `reference/business-rules.md` | Classification, margins, workflows |
| Workflow Details | `reference/09-workflow-tracker-section.md` | Workflow steps, n8n integration |
| n8n Workflows | `reference/n8n-workflows/` | Existing automation JSON files |
| Design OS Agents | `agents.md` | Design OS agent directives |

## Core Concepts

### Brief Structure (5 Categories - UI Tabs)
1. **WHAT** - Client, budget, project scope, creative direction
2. **WHO** - Team assignments (AM, MS, PM, BA, etc.)
3. **WITH WHAT** - Music sources, deliverables, formats
4. **WHEN** - Timeline, milestones, deadlines
5. **WHAT ELSE** - Notes, attachments, context

### Brief Data Model (6 Sections - Database)
1. Business Brief - client, agency, brand, territory, media, budget
2. Creative Brief - mood, keywords, genres, references, vocals
3. Technical Brief - lengths, formats, stems, sync points
4. Contextual Brief - campaign, audience, brand values
5. Timeline & Deliverables - dates, urgency
6. Analysis Metadata - completeness, missing fields, AI suggestions

### Project Classification (5 Tiers)
| Type | Budget | Margin | Workflow |
|------|--------|--------|----------|
| A | >100K | 20-25% | Full (17 steps) |
| B | 25K-100K | 25% | Full (17 steps) |
| C | 10K-25K | 50% | Simplified (11 steps) |
| D | 2.5K-10K | 50% | Simplified (11 steps) |
| E | ≤2.5K | 100% | Blanket only (3 steps) |
| Production | Any | Variable | Custom (11 steps) |

## CopilotKit Integration

The app uses CopilotKit's `useCoAgent` for bidirectional state sync between the chat and canvas:

```typescript
const { state, setState } = useCoAgent({
  name: "brief_analyzer",
  initialState: { /* brief fields */ }
});
```

Canvas edits update agent state. Agent extractions update canvas. Both stay in sync.

## n8n Webhook Integration

When a brief is ready, POST to n8n webhook:
- Endpoint: `/webhook/tf-brief-intake-v5`
- Creates: Case record, Brief record, Slack channel, Nextcloud folder
- Returns: case_number, catchy_case_id, slack_channel

See `reference/09-workflow-tracker-section.md` for full payload structure.

## Commands

```bash
# Development
cd app && npm run dev

# Backend (if using FastAPI)
cd backend && uvicorn main:app --reload

# Database types
npx supabase gen types typescript --project-id YOUR_ID > src/types/database.ts
```

## File Naming Conventions

- Components: PascalCase (`BriefCanvas.tsx`)
- Hooks: camelCase with `use-` prefix (`use-brief.ts`)
- Utils: camelCase (`calculateMargin.ts`)
- Types: PascalCase (`Brief.ts`)

## Important Notes

1. **Always read the spec** before building a section - they're in `product/sections/*/spec.md`
2. **Brief fields** are documented in `reference/brief-template.md` and `reference/03-data-model-input.md`
3. **Workflow steps** vary by project type - see `reference/09-workflow-tracker-section.md`
4. **n8n automation** handles Slack/Nextcloud/Drive - the UI just triggers webhooks and displays status
5. **Design tokens** (colors, spacing) are in the shadcn config - use TF brand fuchsia as accent

## Build Sequence

Follow `BUILD_INSTRUCTIONS.md` for the full sequence. Summary:

1. **Sprint 1:** Project scaffolding, Supabase, shell layout
2. **Sprint 2:** Brief Extraction (MVP priority - Canvas + Chat)
3. **Sprint 3:** Project Dashboard + Canvas page
4. **Sprint 4:** Workflow Tracker
