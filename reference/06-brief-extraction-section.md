# Brief Extraction Section for Design OS

Use this content when running `/shape-section` for the Brief Extraction section.

---

## Section Overview

**Section Name:** Brief Extraction

**Purpose:** The AI-powered chat interface where users paste raw client briefs and the system extracts structured data in real-time. This is the core intelligence of the application.

---

## User Stories

### As a Music Supervisor
- I want to paste a raw email brief and see it automatically structured
- I want the AI to identify what information is missing
- I want to ask clarifying questions and have the extraction update
- I want to see suggestions for vague terms (e.g., "upbeat" -> BPM range)

### As an Account Manager
- I want to quickly see what information is complete vs missing
- I want the AI to generate questions I should ask the client
- I want to copy extracted data for use in emails

---

## Component Requirements

### Chat Panel Container
- Full-height panel (minus header)
- Scrollable message area
- Fixed input area at bottom
- Suggestion chips between messages and input

### Message List
- User messages right-aligned with accent background
- Agent messages left-aligned with neutral background
- System messages centered
- Timestamps on each message
- Extraction highlights showing which fields were updated

### Message Item
- Avatar (user or AI)
- Message content (supports markdown)
- Timestamp (relative format)
- Copy button on hover
- Field update indicators (e.g., "[Updated: budget, territory]")

### Suggestion Chips
- Horizontal scrollable list
- Click to send as message
- Generated based on missing fields and context
- Examples:
  - "What's the total budget for this project?"
  - "Which territories will this air in?"
  - "Can you share any reference tracks?"

### Chat Input
- Multiline text area
- Auto-expand up to 4 lines
- Send button (or Enter key)
- Paste detection for long text
- Loading indicator when AI is processing
- Attachment button (future: PDF upload)

### Processing Indicator
- Show when AI is analyzing
- Streaming text display
- Field-by-field update notifications

---

## Data Requirements

### Input Data
- Raw brief text (string, can be very long)
- Conversation history (array of messages)
- Current brief state (for context)

### Output Data
- Extracted fields by category (WHAT, WHO, WITH WHAT, WHEN, OTHER)
- Confidence scores per field
- Missing field suggestions
- Clarification questions
- Term enhancements (vague -> specific)

### State to Track
- Is AI processing?
- Current extraction progress
- Pending suggestions
- Unsaved extracted data

---

## Sample Interaction Flow

1. **User pastes brief:**
   ```
   Hi team, BMW wants music for their new X3 campaign. Budget around 50k,
   for DACH region, TV and online. Need something upbeat and modern,
   similar to what we did for Audi last year. Deadline is end of March.
   ```

2. **AI responds with extraction:**
   ```
   I've extracted the following from the brief:

   **WHAT - Project Overview:**
   - Client: BMW
   - Campaign: X3 (new model)
   - Budget: ~50,000 EUR [Type B]
   - Territory: DACH (Germany, Austria, Switzerland)
   - Media: TV, Online
   - Creative Direction: Upbeat, modern

   **WHEN - Timeline:**
   - Deadline: End of March

   **Missing Information:**
   - Video lengths (30s? 15s? 6s?)
   - Term length (6 months? 1 year?)
   - Agency name
   - Specific reference tracks

   Would you like me to suggest questions to ask the client?
   ```

3. **User clicks suggestion or types:**
   ```
   What about video lengths?
   ```

4. **AI provides follow-up:**
   ```
   Based on typical BMW campaigns, they usually need:
   - 30s hero spot
   - 15s cutdowns
   - 6s bumpers

   I'll add these as likely lengths. The brief completeness is now 72%.
   Should I suggest reference tracks based on "upbeat and modern"?
   ```

---

## Edge Cases

1. **Very long brief (2000+ words):** Show progress indicator, extract in chunks
2. **Ambiguous information:** Flag with confidence score, suggest clarification
3. **Conflicting information:** Highlight conflict, ask user to resolve
4. **No budget mentioned:** Flag as critical missing field
5. **Multiple projects in one email:** Detect and ask user to confirm

---

## Integration Points

- **CopilotKit:** Uses `useCoAgent` hook for AI communication
- **Canvas:** Extracted data flows to Project Canvas in real-time
- **Supabase:** Conversation history persisted
- **Activity Log:** Each extraction logged as activity

---

## Expected Design OS Output

After running `/shape-section` for Brief Extraction:
- `product/sections/brief-extraction/spec.md` - Section specification

After running `/sample-data`:
- `product/sections/brief-extraction/data.json` - Sample conversations
- `product/sections/brief-extraction/types.ts` - TypeScript interfaces

After running `/design-screen`:
- `src/sections/brief-extraction/components/` - React components
