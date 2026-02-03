# Shell Layout Input for Design OS

Use this content when running `/design-shell` in Design OS.

---

## Application Shell Overview

The app uses a split-pane layout optimized for the brief extraction and editing workflow.

### Layout Structure

```
+----------------------------------------------------------+
|  HEADER                                                   |
|  [Logo] [Project Selector v] [Activity]     [User Menu]  |
+----------------------------------------------------------+
|                    |                                      |
|   PROJECT CANVAS   |            CHAT PANEL               |
|     (Left Side)    |           (Right Side)              |
|                    |                                      |
|   [WHAT] [WHO]     |   +------------------------------+  |
|   [WITH WHAT]      |   | Message 1                    |  |
|   [WHEN] [OTHER]   |   | Message 2                    |  |
|                    |   | ...                          |  |
|   +--------------+ |   +------------------------------+  |
|   | Field 1      | |                                      |
|   | Field 2      | |   [Suggestion chips]                |
|   | ...          | |                                      |
|   +--------------+ |   +------------------------------+  |
|                    |   | Type a message...        [>] |  |
|   [Completeness]   |   +------------------------------+  |
|   [Actions]        |                                      |
+----------------------------------------------------------+
```

---

## Header

**Height:** 64px (fixed)

**Contents (left to right):**
1. **Logo** - TF logo or "TF Project Builder" text
2. **Project Selector** - Dropdown to switch between projects
3. **Activity Indicator** - Show sync status, recent activity
4. **User Menu** - Profile, settings, logout

**Behavior:**
- Fixed at top, always visible
- Project selector shows current project name
- Activity indicator pulses when AI is processing

---

## Split Pane

**Division:** Resizable, default 50/50 split

**Left Side - Project Canvas:**
- Minimum width: 400px
- Contains all brief data organized by tabs
- Scrollable independently

**Right Side - Chat Panel:**
- Minimum width: 350px
- Contains conversation with AI
- Scrollable independently

**Resizer:**
- Draggable divider between panels
- Double-click to reset to 50/50

---

## Project Canvas (Left Panel)

### Tab Navigation

**Tabs (horizontal, at top of canvas):**
1. WHAT - Project overview & scope
2. WHO - Team & responsibilities
3. WITH WHAT - Tools, sources & deliverables
4. WHEN - Timeline & check-ins
5. OTHER - Notes & attachments

**Tab Behavior:**
- Active tab highlighted with accent color
- Badge on tab if section has missing critical fields
- Smooth transition between tabs

### Content Area

**Field Groups:**
- Grouped by logical category within each tab
- Each field is inline-editable
- Hover shows edit icon
- Focus shows full editor

**Field States:**
- Filled: Normal display
- Empty (critical): Red border/highlight
- Empty (important): Yellow border
- Empty (helpful): Gray/subtle indicator
- AI-suggested: Italic with "suggested" label

### Footer

**Completeness Bar:**
- Progress bar showing 0-100%
- Color changes: red (<30%), yellow (30-70%), green (>70%)
- Text: "Brief completeness: X%"

**Classification Badge:**
- Shows project type (A/B/C/D/E/Production)
- Click to see classification reasoning

**Action Buttons:**
- "Save Changes" (if unsaved edits)
- "Create Infrastructure" (triggers Slack + Nextcloud)

---

## Chat Panel (Right Panel)

### Message Area

**Height:** Flexible, takes remaining space

**Message Types:**
1. **User messages** - Right-aligned, accent background
2. **Agent messages** - Left-aligned, neutral background
3. **System messages** - Centered, subtle styling

**Message Features:**
- Timestamps (relative: "2 min ago")
- Copy button on hover
- Extraction highlights (show what fields were updated)

### Suggestion Chips

**Location:** Between messages and input

**Content:**
- Quick action suggestions from AI
- Example: "Ask about budget", "Clarify territory", "Add reference tracks"

**Behavior:**
- Click to send as message
- Regenerate button to get new suggestions

### Input Area

**Height:** 56px minimum, expands with content

**Contents:**
- Multiline text input
- Send button
- Attachment button (for pasting files)

**Behavior:**
- Enter to send (Shift+Enter for newline)
- Paste detection for long brief text
- Loading state while AI processes

---

## Responsive Behavior

**Desktop (>1200px):**
- Full split-pane layout
- Both panels visible

**Tablet (768px-1200px):**
- Collapsible panels
- Toggle button to switch between Canvas and Chat
- Or stacked layout (Canvas top, Chat bottom)

**Mobile (<768px):**
- Single panel view
- Bottom navigation to switch panels
- Optimized for vertical scrolling

---

## Expected Design OS Output

After running `/design-shell`, Design OS should create:
- `product/shell/spec.md` - Shell specification
- `src/shell/components/` - Shell React components (AppShell, MainNav, UserMenu)
