// =============================================================================
// Data Types
// =============================================================================

export type MessageRole = 'user' | 'assistant' | 'system'

export type SuggestionPriority = 'critical' | 'important' | 'helpful'

export type VocalsPreference = 'instrumental' | 'vocals' | 'either' | 'specific'

export type DeadlineUrgency = 'standard' | 'rush' | 'urgent'

export interface ChatMessage {
  id: string
  role: MessageRole
  content: string
  timestamp: string
  /** Fields that were updated by this AI response */
  fieldUpdates?: string[]
  /** Whether AI is currently processing this message */
  isProcessing?: boolean
}

export interface SuggestionChip {
  id: string
  label: string
  /** The brief field this suggestion relates to */
  field: string
  priority: SuggestionPriority
}

export interface ReferenceTrack {
  artist: string
  title: string | null
  notes: string
}

export interface ProjectContext {
  caseId: string
  caseTitle: string
  completeness: number
}

// =============================================================================
// Extracted Brief Structure
// =============================================================================

export interface BusinessBrief {
  client_name: string
  agency_name: string
  budget: number
  territory: string[]
  media_types: string[]
  term_length: string
  exclusivity: boolean
  exclusivity_details?: string
}

export interface CreativeBrief {
  creative_direction: string
  mood_keywords: string[]
  genre_preferences: string[]
  reference_tracks: ReferenceTrack[]
  must_avoid: string
  vocals_preference: VocalsPreference
}

export interface TechnicalBrief {
  video_lengths: string[]
  stems_required: boolean
  sync_points?: string
}

export interface TimelineBrief {
  deadline_date: string
  air_date: string
  deadline_urgency: DeadlineUrgency
  first_presentation_date?: string
}

export interface WhoBrief {
  brief_sender_name: string
  brief_sender_email: string
  brief_sender_role: string
}

export interface AnalysisMetadata {
  missing_critical: string[]
  missing_important: string[]
  missing_helpful: string[]
}

export interface ExtractedBrief {
  completeness: number
  projectType: 'A' | 'B' | 'C' | 'D' | 'E' | 'Production' | null
  business: Partial<BusinessBrief>
  creative: Partial<CreativeBrief>
  technical: Partial<TechnicalBrief>
  timeline: Partial<TimelineBrief>
  who: Partial<WhoBrief>
  analysis: AnalysisMetadata
}

// =============================================================================
// Component Props
// =============================================================================

export interface BriefExtractionProps {
  /** Current project context */
  projectContext: ProjectContext
  /** Chat message history */
  messages: ChatMessage[]
  /** Available suggestion chips based on missing fields */
  suggestionChips: SuggestionChip[]
  /** Current extracted brief data (synced with canvas) */
  extractedBrief?: ExtractedBrief
  /** Whether AI is currently processing */
  isProcessing?: boolean
  /** Called when user sends a message */
  onSendMessage?: (content: string) => void
  /** Called when user clicks a suggestion chip */
  onChipClick?: (chipId: string, label: string) => void
  /** Called when user copies a message */
  onCopyMessage?: (messageId: string) => void
  /** Called when a field is updated in the canvas (bidirectional sync) */
  onFieldUpdate?: (field: string, value: unknown) => void
}

// =============================================================================
// Chat Input Props
// =============================================================================

export interface ChatInputProps {
  /** Placeholder text for the input */
  placeholder?: string
  /** Whether the input is disabled (e.g., while AI is processing) */
  disabled?: boolean
  /** Called when user submits a message */
  onSubmit?: (content: string) => void
}

// =============================================================================
// Message Item Props
// =============================================================================

export interface MessageItemProps {
  message: ChatMessage
  /** Called when user copies this message */
  onCopy?: () => void
}

// =============================================================================
// Suggestion Chips Props
// =============================================================================

export interface SuggestionChipsProps {
  chips: SuggestionChip[]
  /** Called when user clicks a chip */
  onChipClick?: (chipId: string, label: string) => void
}
