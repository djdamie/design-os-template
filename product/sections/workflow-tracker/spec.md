# Workflow Tracker Specification

## Overview
A comprehensive workflow management tab within the Brief Workspace that displays project progress through defined workflow steps, organized in Kanban-style columns by status. The workflow type and steps are determined by project classification (A/B/C/D/E/Production), and system tasks from n8n automations are displayed as generative UI components.

## User Flows
- View overall project progress via progress bar showing % complete and current step
- See all workflow steps organized in Kanban columns (Pending, In Progress, Completed, Blocked)
- Mark a step as complete with optional completion notes
- Flag a step as blocked with required reason
- Add notes/comments to any step
- View team assignments showing who owns which steps
- See alerts for overdue steps, approaching deadlines, and blocked items
- View automated system tasks (n8n) as generative UI cards with status, timestamps, and retry capability

## UI Requirements
- Progress bar at top showing overall workflow completion percentage
- Kanban board with 4 columns: Pending, In Progress, Completed, Blocked
- Step cards showing: name, owner (role badge), estimated duration, notes indicator
- Team assignment panel showing members, their roles, and assigned steps
- Alerts section highlighting overdue/approaching/blocked items
- Generative UI cards for system tasks (CopilotKit style) showing automation status
- Workflow type indicator showing which template is active (A+B, C+D, E, Production)
- Core actions: mark complete, flag blocked, add notes (reassignment deferred)

## Configuration
- shell: true
