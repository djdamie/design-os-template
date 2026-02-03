# Brief Workspace Specification

## Overview
The combined split-pane workspace that brings together the Project Canvas and Brief Extraction chat in a side-by-side layout. This is the primary working view where users process briefs with AI assistance while seeing extracted data populate in real-time.

## User Flows
- View the Project Canvas (left, 65%) alongside the AI Chat (right, 35%)
- Paste a brief into the chat and watch fields auto-populate on the canvas
- Edit canvas fields directly while chatting with the AI
- Collapse/expand the chat panel to focus on canvas editing
- All canvas and chat functionality remains available

## UI Requirements
- Split-pane layout: Canvas left (65%), Chat right (35%)
- Collapsible chat panel with toggle button
- Responsive: stacked on mobile, side-by-side on desktop
- Bidirectional state sync between panels (in production with CopilotKit)

## Configuration
- shell: true
