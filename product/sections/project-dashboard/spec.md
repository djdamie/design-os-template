# Project Dashboard Specification

## Overview
The entry point where users view all their projects with detailed status information, create new projects, and navigate to individual project views. Supports both card grid and table/list views with comprehensive search, filtering, and sorting.

## User Flows
- View all projects in card grid or table/list view (toggleable)
- Search projects by text (case ID, title, client)
- Filter projects by status (Active/Completed/On Hold), project type (A/B/C/D/E), and date range
- Sort projects by date, name, completeness %, or status
- Click "Create New Project" to open a modal with two paths:
  - Quick setup: Fill basic fields (case ID, title, client) manually
  - Start with AI: Go to Brief Extraction to paste a brief
- Click any project to open its Project Canvas
- Empty state for new users with friendly illustration and "Create First Project" CTA

## UI Requirements
- Toggle between card grid and table/list layouts
- Project cards/rows show: Case ID, title, status, completeness %, project type (A/B/C/D/E), client, deadline, team lead
- Search bar with filter dropdowns (status, type, date range)
- Sort dropdown with multiple options
- "Create New Project" button in header or prominent position
- Create modal with option to fill fields or "Start with AI Brief"
- Friendly empty state with illustration for zero projects

## Configuration
- shell: true
