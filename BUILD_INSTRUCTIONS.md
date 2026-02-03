# TF Project Builder — Incremental Build Instructions

## Overview

Use the **incremental approach** from Design OS to build this project section-by-section. Each milestone has detailed instructions and pre-built components.

---

## Step 1: Initial Setup (Foundation)

Copy and paste this prompt to start:

```
I need you to help me implement a React application incrementally, one section at a time.

Before we begin, here's our context:
1. **Authentication**: Supabase Auth
2. **Database**: Supabase PostgreSQL
3. **Tech Stack**: Next.js 14 App Router, TypeScript, Tailwind, shadcn/ui
4. **AI Integration**: CopilotKit (useCoAgent for bidirectional sync)
5. **External Integrations**: n8n webhooks (Slack, Nextcloud, Google Drive)

I'm providing:
- `product-plan/product-overview.md` — Product context
- `product-plan/instructions/incremental/01-foundation.md` — First milestone

Let's start with the foundation (design system, data model, routing, shell).
```

**Files to provide:**
- `product-plan/product-overview.md`
- `product-plan/instructions/incremental/01-foundation.md`
- `product-plan/design-system/` (all files)
- `product-plan/data-model/types.ts`
- `product-plan/shell/components/` (all files)

---

## Step 2: Project Dashboard

After foundation is complete, use this prompt:

```
Now let's implement the Project Dashboard section.

I'm providing:
- `product-plan/instructions/incremental/02-project-dashboard.md` — Implementation instructions
- `product-plan/sections/project-dashboard/README.md` — Section overview
- `product-plan/sections/project-dashboard/types.ts` — TypeScript interfaces
- `product-plan/sections/project-dashboard/sample-data.json` — Mock data
- `product-plan/sections/project-dashboard/components/` — Reference components
- `product-plan/sections/project-dashboard/tests.md` — Test specifications

Please:
1. Review the test specifications first (TDD approach)
2. Implement the section following the instructions
3. Adapt the reference components to our codebase conventions
4. Write tests based on the test specifications
5. Verify the section integrates with the shell and navigation
```

---

## Step 3: Brief Extraction

```
Now let's implement the Brief Extraction section.

I'm providing:
- `product-plan/instructions/incremental/03-brief-extraction.md` — Implementation instructions
- `product-plan/sections/brief-extraction/README.md` — Section overview
- `product-plan/sections/brief-extraction/types.ts` — TypeScript interfaces
- `product-plan/sections/brief-extraction/sample-data.json` — Mock data
- `product-plan/sections/brief-extraction/components/` — Reference components
- `product-plan/sections/brief-extraction/tests.md` — Test specifications

Please:
1. Review the test specifications first (TDD approach)
2. Implement the section following the instructions
3. Adapt the reference components to our codebase conventions
4. Write tests based on the test specifications
5. Verify the section integrates with the shell and navigation
```

---

## Step 4: Project Canvas

```
Now let's implement the Project Canvas section.

I'm providing:
- `product-plan/instructions/incremental/04-project-canvas.md` — Implementation instructions
- `product-plan/sections/project-canvas/README.md` — Section overview
- `product-plan/sections/project-canvas/types.ts` — TypeScript interfaces
- `product-plan/sections/project-canvas/sample-data.json` — Mock data
- `product-plan/sections/project-canvas/components/` — Reference components
- `product-plan/sections/project-canvas/tests.md` — Test specifications

Please:
1. Review the test specifications first (TDD approach)
2. Implement the section following the instructions
3. Adapt the reference components to our codebase conventions
4. Write tests based on the test specifications
5. Verify the section integrates with the shell and navigation
```

---

## Step 5: Brief Workspace

```
Now let's implement the Brief Workspace section.

I'm providing:
- `product-plan/instructions/incremental/05-brief-workspace.md` — Implementation instructions
- `product-plan/sections/brief-workspace/README.md` — Section overview
- `product-plan/sections/brief-workspace/types.ts` — TypeScript interfaces
- `product-plan/sections/brief-workspace/sample-data.json` — Mock data
- `product-plan/sections/brief-workspace/components/` — Reference components
- `product-plan/sections/brief-workspace/tests.md` — Test specifications

Please:
1. Review the test specifications first (TDD approach)
2. Implement the section following the instructions
3. Adapt the reference components to our codebase conventions
4. Write tests based on the test specifications
5. Verify the section integrates with the shell and navigation
```

---

## Step 6: Workflow Tracker

```
Now let's implement the Workflow Tracker section.

I'm providing:
- `product-plan/instructions/incremental/06-workflow-tracker.md` — Implementation instructions
- `product-plan/sections/workflow-tracker/README.md` — Section overview
- `product-plan/sections/workflow-tracker/types.ts` — TypeScript interfaces
- `product-plan/sections/workflow-tracker/sample-data.json` — Mock data
- `product-plan/sections/workflow-tracker/components/` — Reference components
- `product-plan/sections/workflow-tracker/tests.md` — Test specifications

Additional context for n8n integration:
- `reference/09-workflow-tracker-section.md` — Workflow steps and n8n automation details
- `reference/n8n-workflows/` — Existing n8n workflow JSON files

Please:
1. Review the test specifications first (TDD approach)
2. Implement the section following the instructions
3. Adapt the reference components to our codebase conventions
4. Write tests based on the test specifications
5. Verify the section integrates with the shell and navigation
```

---

## Step 7: Integrations

```
Now let's implement the Integrations section.

I'm providing:
- `product-plan/instructions/incremental/07-integrations.md` — Implementation instructions
- `product-plan/sections/integrations/README.md` — Section overview
- `product-plan/sections/integrations/types.ts` — TypeScript interfaces
- `product-plan/sections/integrations/sample-data.json` — Mock data
- `product-plan/sections/integrations/components/` — Reference components
- `product-plan/sections/integrations/tests.md` — Test specifications

Please:
1. Review the test specifications first (TDD approach)
2. Implement the section following the instructions
3. Adapt the reference components to our codebase conventions
4. Write tests based on the test specifications
5. Verify the section integrates with the shell and navigation
```

---

## Key Rules (from Design OS)

1. **DO NOT redesign** the provided components — use them as-is
2. **DO** wire up callback props to routing and API calls
3. **DO** replace sample data with real data from Supabase
4. **DO** implement error handling and loading states
5. **DO** implement empty states (first-time users)
6. **DO** use TDD — read `tests.md` first, write failing tests, then implement

---

## File Structure Reference

```
product-plan/
├── instructions/
│   └── incremental/
│       ├── 01-foundation.md        ← Start here
│       ├── 02-project-dashboard.md
│       ├── 03-brief-extraction.md
│       ├── 04-project-canvas.md
│       ├── 05-brief-workspace.md
│       ├── 06-workflow-tracker.md
│       └── 07-integrations.md
├── design-system/                   ← Design tokens
├── data-model/
│   └── types.ts                     ← Core TypeScript types
├── shell/
│   └── components/                  ← AppShell, MainNav, UserMenu, ChatPanel
└── sections/
    ├── project-dashboard/
    │   ├── README.md
    │   ├── types.ts
    │   ├── sample-data.json
    │   ├── tests.md
    │   └── components/
    ├── brief-extraction/
    │   └── ...
    ├── project-canvas/
    │   └── ...
    ├── brief-workspace/
    │   └── ...
    ├── workflow-tracker/
    │   └── ...
    └── integrations/
        └── ...
```

---

## Additional Reference Files

For business logic and n8n integration:

| Need | Location |
|------|----------|
| Brief field definitions | `reference/brief-template.md` |
| Business rules (classification, margins) | `reference/business-rules.md` |
| Data model details | `reference/03-data-model-input.md` |
| Workflow steps & n8n details | `reference/09-workflow-tracker-section.md` |
| n8n workflow JSON files | `reference/n8n-workflows/` |
| AI brief analyzer prompt | `reference/n8n-workflows/Current Brief Analyzer prompt.md` |

---

## Checklist

- [ ] **Milestone 1:** Foundation (tokens, types, routing, shell)
- [ ] **Milestone 2:** Project Dashboard (list, filters, create)
- [ ] **Milestone 3:** Brief Extraction (AI chat, field updates)
- [ ] **Milestone 4:** Project Canvas (tabs, editable fields)
- [ ] **Milestone 5:** Brief Workspace (split-pane, bidirectional sync)
- [ ] **Milestone 6:** Workflow Tracker (kanban, step actions)
- [ ] **Milestone 7:** Integrations (service status, webhooks)
