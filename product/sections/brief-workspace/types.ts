// Brief Workspace is a composite view that combines Project Canvas and Brief Extraction
// It re-exports and combines types from both sections

export type {
  Project,
  MarginCalculation,
  CompletenessBreakdown,
  CanvasTab,
  AllFields,
  TeamMemberOption,
  IntegrationStatus,
  ClassificationReasoning,
  TabId,
  ProjectType,
} from '@/../product/sections/project-canvas/types'

export type {
  ChatMessage,
  SuggestionChip,
  ProjectContext,
} from '@/../product/sections/brief-extraction/types'

// Combined workspace props interface
export interface BriefWorkspaceProps {
  // Canvas props (from project-canvas)
  project: import('@/../product/sections/project-canvas/types').Project
  marginCalculation: import('@/../product/sections/project-canvas/types').MarginCalculation
  completenessBreakdown: import('@/../product/sections/project-canvas/types').CompletenessBreakdown
  tabs: import('@/../product/sections/project-canvas/types').CanvasTab[]
  fields: import('@/../product/sections/project-canvas/types').AllFields
  teamMembers: import('@/../product/sections/project-canvas/types').TeamMemberOption[]
  integrationStatus: import('@/../product/sections/project-canvas/types').IntegrationStatus
  classificationReasoning: import('@/../product/sections/project-canvas/types').ClassificationReasoning

  // Chat props (from brief-extraction)
  projectContext: import('@/../product/sections/brief-extraction/types').ProjectContext
  messages: import('@/../product/sections/brief-extraction/types').ChatMessage[]
  suggestionChips: import('@/../product/sections/brief-extraction/types').SuggestionChip[]
  isProcessing?: boolean

  // Canvas callbacks
  onTabChange?: (tabId: import('@/../product/sections/project-canvas/types').TabId) => void
  onFieldUpdate?: (fieldId: string, value: unknown) => void
  onTypeOverride?: (newType: import('@/../product/sections/project-canvas/types').ProjectType | null) => void
  onSave?: () => void
  onCreateSlack?: () => void
  onCreateNextcloud?: () => void
  onShowMissingFields?: () => void

  // Chat callbacks
  onSendMessage?: (content: string) => void
  onChipClick?: (chipId: string, label: string) => void
  onCopyMessage?: (messageId: string) => void
}
