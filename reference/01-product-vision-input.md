# Product Vision Input for Design OS

Use this content when running `/product-vision` in Design OS.

---

## Raw Input to Share with Design OS

**Product Name:** TF Project Builder

**What I'm Building:**

I'm building an application for Tracks & Fields (TF), a music licensing and supervision company. The app helps music supervisors transform unstructured client briefs into actionable project data through a conversational AI interface.

**The Problem:**

Music supervisors currently spend significant time manually:
- Parsing unstructured email briefs from clients
- Extracting key project parameters (client, budget, territory, media types, creative direction)
- Classifying projects by budget tier (A/B/C/D/E)
- Calculating payout margins based on budget
- Setting up project infrastructure (Slack channels, Nextcloud folders)
- Tracking missing information and following up with clients

The current tools (OpenWebUI + n8n webhooks + Slack) work but lack:
- A unified interface for analysis AND editing
- Real-time visual feedback as data is extracted
- Direct field manipulation without re-prompting the AI
- Seamless conversation-to-structured-data flow

**The Solution:**

A side-by-side interface with:

**Left Panel - Project Canvas:**
- Live-updating structured project data organized by category (WHAT/WHO/WITH WHAT/WHEN)
- Editable fields that the user can modify directly
- Visual completeness indicators showing what's missing
- Classification badges (A/B/C/D/E) and margin calculations
- Tab navigation between brief sections

**Right Panel - AI Chat:**
- Conversational interface powered by CopilotKit
- User pastes raw brief text, AI extracts structured data
- Real-time updates flow to the Canvas as extraction happens
- Agent suggests clarification questions for missing info
- Bidirectional sync - Canvas edits update agent context

**Target Users:**
- Music Supervisors (primary) - do the brief analysis and creative work
- Account Managers (secondary) - manage client relationships and communication
- Project Managers (viewer) - track project progress

**Key Features:**

1. **Brief Extraction** - Paste raw brief text, AI extracts data into 5 categories (WHAT, WHO, WITH WHAT, WHEN, WHAT ELSE)

2. **Project Classification** - Automatically classify projects by budget tier:
   - A: >100K EUR (Full workflow)
   - B: 25K-100K EUR (Full workflow)
   - C: 10K-25K EUR (Simplified workflow)
   - D: 2500-10K EUR (Simplified workflow)
   - E: <=2500 EUR (Blanket deal only)
   - Production: Custom music (separate workflow)

3. **Margin Calculation** - Convert budget to payout using tiered margin structure:
   - 0-1,500 EUR: 100% margin (library deals)
   - 1,500-30,000 EUR: 50% margin
   - 30,000-100,000 EUR: 25% margin
   - 100,000-250,000 EUR: 20% margin
   - 250,000-500,000 EUR: 15% margin
   - 500,000+ EUR: 10% margin

4. **Completeness Tracking** - Score briefs 0-100% based on:
   - Critical fields (must have): client, territory, deadline, media types, budget
   - Important fields (should have): creative direction, references, brand
   - Helpful fields (nice to have): competitor info, previous music

5. **Bidirectional Sync** - Chat updates Canvas, Canvas edits update Chat context

6. **Integration Triggers** - When ready, trigger n8n workflows to create Slack channels and Nextcloud folders

**What Makes This Different:**

Current flow: Brief email -> OpenWebUI chat -> webhook -> Slack notification -> manual review
New flow: Brief email -> TF Project Builder -> structured data + AI suggestions -> one-click infrastructure setup

The new approach is more interactive, visual, and cohesive. Users see data being structured in real-time and can intervene immediately rather than waiting for webhook results.

---

## Expected Design OS Output

After running `/product-vision`, Design OS should create `product/product-overview.md` with:
- Product name
- 1-3 sentence description
- Problems & Solutions (up to 5)
- Key Features list
