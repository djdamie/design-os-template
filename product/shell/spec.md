# Application Shell Specification

## Overview

TF Project Builder uses a **sidebar + content + collapsible chat** layout. The left sidebar provides navigation, the main content area displays the current view, and a collapsible AI chat panel slides in from the right.

The chat panel is **persistent across all project views** — users can discuss the brief, ask questions, and trigger actions from any section (Canvas, Workflow, etc.). The AI agent is context-aware of the current view.

## Layout Pattern

```
┌─────────────────────────────────────────────────────────────────────────┐
│ ┌──────────┐ ┌───────────────────────────────┐ ┌──────────────────────┐ │
│ │          │ │                               │ │                      │ │
│ │  Sidebar │ │        Content Area           │ │    Chat Panel        │ │
│ │  (240px) │ │    (Canvas, Workflow, etc.)   │ │    (collapsible)     │ │
│ │          │ │                               │ │    (400px when open) │ │
│ │          │ │                               │ │                      │ │
│ │          │ │         [Toggle] ─────────────│─│→                     │ │
│ │ [User]   │ │                               │ │                      │ │
│ └──────────┘ └───────────────────────────────┘ └──────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────┘
```

- **Sidebar:** Fixed 240px, navigation and user menu
- **Content:** Fills available space, scrolls independently
- **Chat Panel:** 400px when open, slides in from right, toggle button always visible

## Chat Panel (CopilotKit-Style)

### Behavior
- **Collapsible:** Panel slides in/out from the right edge
- **Toggle button:** Always visible on the right edge of content area
- **Persistent:** Chat history maintained across view changes within a project
- **Context-aware:** Agent knows current view/section and can reference it

### When Available
- **In project context:** Chat panel is available (toggle visible)
- **Outside project:** Chat toggle hidden (Dashboard, Integrations views)

### Features
- Chat input at bottom
- Message history scrolls
- AI can suggest actions ("Update the deadline to March 15?")
- Bidirectional sync — canvas edits update agent context
- Agent can highlight/reference specific fields in the canvas

### Chat States
- **Collapsed:** Only toggle button visible, content takes full width
- **Expanded:** 400px panel, content shrinks to accommodate
- **Loading:** Skeleton/typing indicator when AI is responding

## Navigation Structure

### Global Navigation (Always Visible)

| Item | Icon | Action |
|------|------|--------|
| Logo | — | Navigate to Projects |
| Projects | LayoutDashboard | Navigate to Project Dashboard |
| + New Project | Plus | Create new project |
| Integrations | Plug | Navigate to Integrations settings |

### Contextual Navigation (When Project Selected)

| Item | Icon | Action |
|------|------|--------|
| ← Back to Projects | ArrowLeft | Return to dashboard |
| [Project Case ID] | — | Active project indicator (non-clickable) |
| Project Canvas | FileEdit | Navigate to Canvas view (primary) |
| Workflow | GitBranch | Navigate to Workflow Tracker |

**Note:** "Brief Extraction" is no longer a separate nav item — it's the chat panel available from any project view.

## User Menu

**Location:** Bottom of sidebar

**Contents:**
- User avatar (initials fallback if no image)
- User name
- User role (e.g., "Music Supervisor")
- Logout action

**Interaction:** Click to expand dropdown with logout option

## Responsive Behavior

### Desktop (1024px+)
- Full sidebar visible (240px)
- Content area fills remaining space
- Chat panel: 400px when open, toggle always visible
- Both sidebar and chat can be open simultaneously

### Tablet (768px - 1023px)
- Sidebar collapses to icon-only mode (64px)
- Chat panel: 360px when open
- When chat is open, it overlays part of content

### Mobile (< 768px)
- Sidebar hidden, hamburger menu
- Chat panel: Full-screen overlay when open
- Swipe or X to close chat
- Content takes full width when chat closed

## Design Notes

### Colors (from design tokens)
- **Primary (sky):** Active nav items, chat send button, AI message accents
- **Secondary (lime):** Success indicators, "new project" button, completeness badges
- **Neutral (zinc):** Sidebar, borders, text, chat background

### Typography (from design tokens)
- **DM Sans:** Nav labels, user name, chat messages
- **IBM Plex Mono:** Case IDs, field names, code snippets in chat

### Chat Panel Visual Details
- Background: `white` (light) / `zinc-900` (dark)
- Border: `zinc-200` (light) / `zinc-800` (dark)
- AI messages: `zinc-100` background with `sky-500` left accent
- User messages: `sky-50` background (light) / `sky-900/20` (dark)
- Input area: Sticky at bottom with subtle top border
- Toggle button: Floating pill with `MessageSquare` icon

### Accessibility
- Chat panel can be toggled with keyboard (Cmd/Ctrl + /)
- Focus traps when chat is open on mobile
- ARIA live region for new messages
- Screen reader announces when chat opens/closes
