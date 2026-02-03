# Product Vision: TF Project Builder

## Overview
A purpose-built application for Tracks & Fields that enables music supervisors to transform unstructured client briefs into actionable project data through conversational AI.

## Problem Statement
Music supervisors at TF spend significant time manually:
- Parsing unstructured email briefs
- Extracting key project parameters
- Classifying projects by budget tier
- Calculating payout margins
- Setting up project infrastructure (Slack, folders)
- Tracking missing information

Current tools (OpenWebUI + n8n) work but lack:
- Unified interface for analysis and editing
- Real-time visual feedback
- Direct field manipulation
- Seamless conversation-to-data flow

## Solution
A side-by-side interface combining:

**Left Panel: Project Canvas**
- Live-updating structured project data
- Editable fields organized by category
- Visual completeness indicators
- Classification badges and margin calculations

**Right Panel: AI Chat**
- Conversational brief analysis
- Contextual suggestions
- Clarification prompts
- History and activity log

## Target Users
- Music Supervisors (primary)
- Account Managers (secondary)
- Project Managers (viewer)

## Key User Stories

### As a Music Supervisor
- I want to paste a client brief and see it automatically structured
- I want to chat with AI to clarify ambiguous requirements
- I want to directly edit any extracted field
- I want to see what information is missing

### As an Account Manager
- I want to see project classification at a glance
- I want to know the margin/payout split immediately
- I want to track brief completeness over time

## Core Features (MVP)

### 1. Brief Extraction
- Paste raw brief text into chat
- AI extracts structured data across 6 categories
- Results populate canvas in real-time

### 2. Bidirectional Sync
- Chat updates → Canvas reflects changes
- Canvas edits → AI acknowledges and adjusts context
- No manual save required

### 3. Project Classification
- Automatic A/B/C typing based on budget
- Visual badges indicating project tier
- Workflow recommendations per type

### 4. Margin Calculation
- Input budget → Output payout
- Display margin percentage
- Tier-based calculation logic

### 5. Completeness Tracking
- Score from 0-100%
- Critical vs important missing fields
- Suggestions for what to ask client

## Non-Goals (v1)
- Full clearance workflow
- Music search integration
- Client-facing portal
- Mobile app

## Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Extraction accuracy | 95%+ | Manual review of 50 briefs |
| Time to structured data | <5 min | Average session length |
| Classification accuracy | 100% | Budget → Type validation |
| User adoption | 90% | % of new projects using tool |

## Technical Constraints
- Must self-host on TF servers (no cloud vendor lock-in)
- Must use Apache 2.0 licensed LLM
- Must integrate with existing Supabase database
- Must preserve Slack/Nextcloud workflows via n8n

## Timeline
- Weeks 1-2: Foundation (layout, components)
- Weeks 3-4: Agent integration (LangGraph, CopilotKit)
- Weeks 5-6: Full brief system (all categories)
- Weeks 7-8: Production deployment

## Open Questions
1. Should classification threshold be €25k or €10k for B/C split?
2. Custom client arrangements - how to handle flat fees?
3. Multi-user editing - needed for v1?
