# Integrations Specification

## Overview
A standalone settings page for viewing integration status and managing external service connections. Users see a simplified dashboard with connection health for Slack, Nextcloud, and Google Drive, plus sync status and manual actions (sync to Nextcloud, retry webhooks). Admins see all services including Supabase, plus configuration options, webhook URLs, API credentials, and detailed execution logs.

## User Flows
- View connection status for user-visible services (Slack, Nextcloud, Google Drive) with health indicators
- See recent sync activity and integration events across projects
- Manually trigger a brief sync to Nextcloud for a specific project
- Retry a failed webhook or sync operation
- (Admin) View Supabase connection status and database sync health
- (Admin) View detailed execution logs with timestamps and payloads
- (Admin) Configure webhook URLs and API credentials for each service
- (Admin) Enable/disable specific integrations
- (Admin) View n8n workflow status and execution history

## UI Requirements
- Service cards showing connection status (connected, disconnected, error) with last sync timestamp
- User view: Slack, Nextcloud, Google Drive only
- Admin view: All services including Supabase
- Recent activity feed showing integration events (project created, brief synced, channel created)
- Role-based views: simplified for users (status + actions), detailed for admins (+ config + logs)
- Manual action buttons: "Sync Now", "Retry" (disabled state when not applicable)
- Admin configuration panel with form inputs for webhook URLs and credentials (masked)
- Error states with user-friendly messages (not exposing internal workflow details to non-admins)

## Configuration
- shell: false
