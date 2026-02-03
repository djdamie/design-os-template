# Project Canvas Specification

## Overview
The side-by-side editable view that displays structured project data extracted from client briefs. Appears alongside the Brief Extraction chat panel with real-time bidirectional sync—AI extractions update the Canvas immediately, and user edits sync back to the AI's context. Features tabbed organization (WHAT/WHO/WITH WHAT/WHEN/OTHER), inline editing for all fields, completeness scoring, project classification badges, and margin calculations.

## User Flows
- View project data organized by category tabs (WHAT, WHO, WITH WHAT, WHEN, OTHER)
- See field status indicators (empty critical/important/helpful, AI-filled, user-edited)
- Click any field to edit inline with appropriate input type (text, textarea, select, multi-select, date, currency)
- Watch fields pulse/glow briefly when updated by AI extraction
- View project classification badge (A/B/C/D/E/Production) with ability to override
- See margin calculation (budget, margin %, payout) auto-updated based on budget
- Track brief completeness via progress bar (0-100% with color gradient)
- Click completeness bar to see breakdown of missing fields
- Save changes via footer button
- Trigger integrations (Create Slack Channel, Create Nextcloud Folder) from footer

## UI Requirements
- Horizontal tab navigation with badge indicators for sections with missing critical fields
- Scrollable content area within each tab with field groups and headers
- Field status indicators: red border for critical missing, amber for important, gray for helpful
- AI-suggested fields shown in italic with "AI suggested" label
- Brief pulse/glow effect when fields are updated (by AI or user)
- Classification badge with color coding and click-to-expand for reasoning
- Manual override option for project type classification
- Margin display showing budget, margin %, payout, and tier
- Progress bar with red→yellow→green gradient based on completeness
- Action footer with Save Changes, Create Slack Channel, Create Nextcloud Folder buttons

## Configuration
- shell: true
