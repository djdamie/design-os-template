# Brief Extraction Specification

## Overview
The AI-powered chat interface where users paste raw client briefs and the system extracts structured data in real-time. The chat panel and Project Canvas work together with bidirectional sync — extracted data updates the canvas immediately, and canvas edits sync back to the AI's context.

## User Flows
- Paste raw brief text (email, notes) into the chat input
- AI processes the brief and extracts structured data into WHAT/WHO/WITH WHAT/WHEN/OTHER categories
- Extracted fields update the Project Canvas in real-time with visual highlights
- AI identifies missing fields and generates clarification questions
- Click suggestion chips to ask about missing information
- Continue conversation to refine extracted data
- Edit fields directly in the Canvas — changes sync back to AI context
- View update indicators showing which fields changed ("[Updated: budget, territory]")

## UI Requirements
- Chat panel with scrollable message history
- User messages right-aligned with accent background
- AI messages left-aligned with neutral background, showing field update badges
- Suggestion chips between messages and input (missing field questions)
- Multiline input area with auto-expand (up to 4 lines)
- Send button and Enter key to send
- Processing indicator when AI is analyzing
- Paste detection for long text with progress indicator
- Field update badges in AI messages (e.g., "[Updated: budget, territory]")
- Canvas field highlighting when updated (brief pulse/glow effect)
- Copy button on hover for messages
- Markdown support in AI messages for formatted extraction results

## Configuration
- shell: true
