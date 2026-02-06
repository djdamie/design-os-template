// Re-export types from child components
import type {
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
} from '@/components/project-canvas/types'

import type {
  ChatMessage,
  SuggestionChip,
  ProjectContext,
} from '@/components/brief-extraction/types'

// Re-export for external use
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
  ChatMessage,
  SuggestionChip,
  ProjectContext,
}

// BriefWorkspace-specific props using the imported types
export interface BriefWorkspaceProps {
  // Canvas props (from ProjectCanvas)
  project: Project
  marginCalculation: MarginCalculation
  completenessBreakdown: CompletenessBreakdown
  tabs: CanvasTab[]
  fields: AllFields
  teamMembers: TeamMemberOption[]
  integrationStatus: IntegrationStatus
  classificationReasoning: ClassificationReasoning
  hasUnsavedChanges?: boolean

  // Chat props (from BriefExtraction)
  projectContext: ProjectContext
  messages: ChatMessage[]
  suggestionChips: SuggestionChip[]
  isProcessing?: boolean

  // Canvas callbacks
  onTabChange?: (tabId: TabId) => void
  onFieldUpdate?: (fieldId: string, value: unknown) => void
  onTypeOverride?: (newType: ProjectType | null) => void
  onSave?: () => void
  onSetupIntegrations?: () => Promise<void> | void
  onSyncBrief?: () => Promise<void> | void
  /** @deprecated Use onSetupIntegrations instead */
  onCreateSlack?: () => void
  /** @deprecated Use onSetupIntegrations instead */
  onCreateNextcloud?: () => void
  onShowMissingFields?: () => void
  onShowClassificationDetails?: () => void

  // Chat callbacks
  onSendMessage?: (content: string) => void
  onChipClick?: (chipId: string, label: string) => void
  onCopyMessage?: (messageId: string) => void
}
