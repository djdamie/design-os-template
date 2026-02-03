// =============================================================================
// Enums & Union Types
// =============================================================================

export type ProjectType = 'A' | 'B' | 'C' | 'D' | 'E' | 'Production'

export type ProjectStatus = 'draft' | 'active' | 'in_progress' | 'completed' | 'cancelled'

export type FieldStatus = 'empty' | 'ai-filled' | 'user-edited'

export type FieldPriority = 'critical' | 'important' | 'helpful'

export type FieldType =
  | 'text'
  | 'textarea'
  | 'email'
  | 'url'
  | 'select'
  | 'multi-select'
  | 'tags'
  | 'boolean'
  | 'date'
  | 'currency'
  | 'team-select'
  | 'multi-team-select'
  | 'reference-list'

export type TabId = 'WHAT' | 'WHO' | 'WITH_WHAT' | 'WHEN' | 'OTHER'

export type VocalsPreference = 'instrumental' | 'vocals' | 'either' | 'specific'

export type DeadlineUrgency = 'standard' | 'rush' | 'urgent'

export type SourceType =
  | 'Internal only'
  | 'Request + playlist'
  | 'Label/publisher briefing'
  | 'Blanket license'
  | 'Bespoke composition'

// =============================================================================
// Data Types
// =============================================================================

export interface Project {
  id: string
  caseNumber: number
  caseId: string
  caseTitle: string
  projectType: ProjectType
  projectTypeOverride: ProjectType | null
  status: ProjectStatus
  completeness: number
  hasUnsavedChanges: boolean
  createdAt: string
  updatedAt: string
}

export interface MarginCalculation {
  budget: number
  budgetCurrency: 'EUR' | 'USD' | 'GBP' | 'CHF'
  marginPercentage: number
  payoutAmount: number
  marginAmount: number
  tier: ProjectType
  tierDescription: string
}

export interface MissingField {
  field: string
  priority: FieldPriority
  tab: TabId
}

export interface CompletenessBreakdown {
  score: number
  criticalComplete: number
  criticalTotal: number
  importantComplete: number
  importantTotal: number
  helpfulComplete: number
  helpfulTotal: number
  missingFields: MissingField[]
}

export interface CanvasTab {
  id: TabId
  label: string
  description: string
  missingCritical: number
  missingImportant: number
}

export interface FieldDependency {
  field: string
  value: unknown
}

export interface ReferenceTrack {
  artist: string
  title: string | null
  notes: string
}

export interface TeamMember {
  id: string
  name: string
  avatar: string | null
}

export interface TeamMemberOption {
  id: string
  name: string
  role: string
  avatar: string | null
}

export interface CanvasField {
  id: string
  label: string
  value: unknown
  type: FieldType
  status: FieldStatus
  priority: FieldPriority
  placeholder?: string
  options?: string[]
  showFor?: ProjectType[]
  dependsOn?: FieldDependency
}

export interface FieldGroup {
  label: string
  fields: CanvasField[]
}

export interface TabFields {
  [groupKey: string]: FieldGroup
}

export interface AllFields {
  WHAT: TabFields
  WHO: TabFields
  WITH_WHAT: TabFields
  WHEN: TabFields
  OTHER: TabFields
}

export interface SlackIntegration {
  connected: boolean
  channelName: string | null
  channelUrl: string | null
  connectedAt: string | null
}

export interface NextcloudIntegration {
  connected: boolean
  folderPath: string | null
  folderUrl: string | null
  connectedAt: string | null
}

export interface IntegrationStatus {
  slack: SlackIntegration
  nextcloud: NextcloudIntegration
}

export interface ClassificationReasoning {
  currentType: ProjectType
  calculatedType: ProjectType
  isOverridden: boolean
  reasoning: string
}

// =============================================================================
// Component Props
// =============================================================================

export interface ProjectCanvasProps {
  /** Current project metadata */
  project: Project
  /** Budget breakdown and margin calculation */
  marginCalculation: MarginCalculation
  /** Completeness score with breakdown */
  completenessBreakdown: CompletenessBreakdown
  /** Tab definitions with missing field counts */
  tabs: CanvasTab[]
  /** All fields organized by tab and group */
  fields: AllFields
  /** Available team members for dropdowns */
  teamMembers: TeamMemberOption[]
  /** External integration status */
  integrationStatus: IntegrationStatus
  /** Classification reasoning and override status */
  classificationReasoning: ClassificationReasoning
  /** Currently active tab */
  activeTab?: TabId
  /** Whether there are unsaved changes */
  hasUnsavedChanges?: boolean
  /** Called when user switches tabs */
  onTabChange?: (tabId: TabId) => void
  /** Called when user updates a field value */
  onFieldUpdate?: (fieldId: string, value: unknown) => void
  /** Called when user overrides project classification */
  onTypeOverride?: (newType: ProjectType | null) => void
  /** Called when user saves changes */
  onSave?: () => void
  /** Called when user clicks Create Slack Channel */
  onCreateSlack?: () => void
  /** Called when user clicks Create Nextcloud Folder */
  onCreateNextcloud?: () => void
  /** Called when user clicks completeness bar to see breakdown */
  onShowMissingFields?: () => void
  /** Called when user clicks classification badge for details */
  onShowClassificationDetails?: () => void
}

// =============================================================================
// Sub-Component Props
// =============================================================================

export interface TabNavigationProps {
  tabs: CanvasTab[]
  activeTab: TabId
  onTabChange?: (tabId: TabId) => void
}

export interface FieldGroupProps {
  group: FieldGroup
  projectType: ProjectType
  teamMembers?: TeamMemberOption[]
  onFieldUpdate?: (fieldId: string, value: unknown) => void
}

export interface EditableFieldProps {
  field: CanvasField
  teamMembers?: TeamMemberOption[]
  onUpdate?: (value: unknown) => void
}

export interface ClassificationBadgeProps {
  projectType: ProjectType
  isOverridden: boolean
  onClick?: () => void
}

export interface MarginDisplayProps {
  calculation: MarginCalculation
}

export interface CompletenessBarProps {
  breakdown: CompletenessBreakdown
  onClick?: () => void
}

export interface ActionFooterProps {
  hasUnsavedChanges: boolean
  integrationStatus: IntegrationStatus
  onSave?: () => void
  onCreateSlack?: () => void
  onCreateNextcloud?: () => void
}

export interface MissingFieldsModalProps {
  breakdown: CompletenessBreakdown
  isOpen: boolean
  onClose: () => void
  onNavigateToField?: (fieldId: string, tab: TabId) => void
}

export interface ClassificationModalProps {
  reasoning: ClassificationReasoning
  marginCalculation: MarginCalculation
  isOpen: boolean
  onClose: () => void
  onOverride?: (newType: ProjectType | null) => void
}
