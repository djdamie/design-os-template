# TF Project Builder

## Description

A conversational AI tool for music supervisors that transforms unstructured client briefs into actionable project data through seamless human-agent collaboration. The side-by-side interface provides real-time visibility into extracted data while giving users direct control to refine, correct, and complete project information.

## Problems & Solutions

### Problem 1: Unstructured briefs require tedious manual parsing
AI extracts structured data from raw text in real-time, organizing it into clear categories (WHAT/WHO/WITH WHAT/WHEN/WHAT ELSE).

### Problem 2: No unified interface for analysis AND editing
Side-by-side layout lets users watch extraction happen while immediately editing any field.

### Problem 3: No visibility into what's extracted or missing
Live completeness scoring and visual indicators show exactly what's captured and what still needs attention.

### Problem 4: Can't intervene without re-prompting the AI
Bidirectional sync means canvas edits automatically update the agent's context.

### Problem 5: Manual infrastructure setup
One-click triggers create Slack channels and Nextcloud folders when the project is ready.

## Key Features

- Brief Extraction (5 categories: WHAT, WHO, WITH WHAT, WHEN, WHAT ELSE)
- Project Classification (A/B/C/D/E tiers based on budget)
- Margin Calculation (tiered payout structure)
- Completeness Tracking (0-100% scoring with field prioritization)
- Bidirectional Sync (canvas ↔ chat)
- Integration Triggers (Slack, Nextcloud via n8n)
