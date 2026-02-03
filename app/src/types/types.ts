// =============================================================================
// Core Enums & Union Types
// =============================================================================

export type ProjectType = 'A' | 'B' | 'C' | 'D' | 'E' | 'Production'

export type ProjectStatus = 'draft' | 'active' | 'in_progress' | 'completed' | 'cancelled'

export type FieldStatus = 'empty' | 'ai-filled' | 'user-edited'

export type FieldPriority = 'critical' | 'important' | 'helpful'

export type TeamRole = 'AM' | 'MS' | 'PM' | 'MC' | 'BA' | 'MGMT' | 'Producer' | 'Composer'

export type WorkflowStepStatus = 'pending' | 'in_progress' | 'completed' | 'skipped' | 'blocked'

export type ActivityType =
  | 'brief_created'
  | 'brief_analyzed'
  | 'field_updated'
  | 'classification_changed'
  | 'status_changed'
  | 'agent_suggestion'
  | 'user_comment'
  | 'external_sync'

export type ActorType = 'user' | 'agent' | 'system' | 'webhook'

export type VocalsPreference = 'instrumental' | 'vocals' | 'either' | 'specific'

export type DeadlineUrgency = 'standard' | 'rush' | 'urgent'

// =============================================================================
// Project Entity
// =============================================================================

export interface Project {
  id: string
  caseNumber: number
  caseId: string // Catchy ID like "BMW-Summer-Drive"
  caseTitle: string
  projectType: ProjectType | null
  projectTypeOverride: ProjectType | null
  status: ProjectStatus
  completeness: number // 0-100
  budget: number | null
  budgetCurrency: 'EUR' | 'USD' | 'GBP' | 'CHF'
  marginPercentage: number | null
  payoutAmount: number | null
  deadline: string | null // ISO date
  slackChannelUrl: string | null
  nextcloudFolderUrl: string | null
  createdAt: string // ISO timestamp
  updatedAt: string // ISO timestamp
}

// =============================================================================
// Brief Entity (6 Sections)
// =============================================================================

export interface BusinessBrief {
  client_name: string
  agency_name: string
  brand_name: string
  brief_sender_name: string
  brief_sender_email: string
  brief_sender_role: string
  territory: string[]
  media_types: string[]
  term_length: string
  exclusivity: boolean
  exclusivity_details: string
}

export interface CreativeBrief {
  creative_direction: string
  mood_keywords: string[]
  genre_preferences: string[]
  reference_tracks: ReferenceTrack[]
  lyrics_requirements: string
  must_avoid: string
  vocals_preference: VocalsPreference
  vocals_details: string
}

export interface TechnicalBrief {
  video_lengths: string[]
  deliverable_formats: string[]
  stems_required: boolean
  stems_details: string
  sync_points: string
}

export interface ContextualBrief {
  campaign_context: string
  target_audience: string
  brand_values: string[]
  competitor_info: string
  previous_music: string
}

export interface TimelineBrief {
  deadline_date: string
  deadline_urgency: DeadlineUrgency
  first_presentation_date: string
  air_date: string
  deliverables_summary: string
}

export interface AnalysisMetadata {
  completeness_score: number
  missing_critical: string[]
  missing_important: string[]
  missing_helpful: string[]
  ai_suggestions: AISuggestion[]
}

export interface Brief {
  id: string
  projectId: string
  raw_brief_text: string
  brief_source: 'email' | 'chat' | 'manual' | 'phone' | 'meeting'
  business: Partial<BusinessBrief>
  creative: Partial<CreativeBrief>
  technical: Partial<TechnicalBrief>
  contextual: Partial<ContextualBrief>
  timeline: Partial<TimelineBrief>
  analysis: AnalysisMetadata
  version: number
  previous_version_id: string | null
  createdAt: string
  updatedAt: string
}

// =============================================================================
// Supporting Types
// =============================================================================

export interface ReferenceTrack {
  artist: string
  title: string | null
  notes: string
  spotify_id?: string
}

export interface AISuggestion {
  type: 'clarification' | 'recommendation' | 'warning'
  field: string
  suggestion: string
  priority: FieldPriority
}

// =============================================================================
// Team & Assignment
// =============================================================================

export interface TeamMember {
  id: string
  name: string
  email: string
  role: string
  avatar: string | null
}

export interface TeamAssignment {
  id: string
  projectId: string
  userId: string
  userName: string
  userAvatar: string | null
  role: TeamRole
  roleLabel: string
  isPrimary: boolean
  stepsOwned: string[]
  notes: string | null
  assignedAt: string
}

// =============================================================================
// Workflow
// =============================================================================

export interface WorkflowStep {
  id: string
  projectId: string
  sequenceNumber: number
  name: string
  description: string
  status: WorkflowStepStatus
  assignedRole: TeamRole
  assignedUserId: string | null
  estimatedDuration: string
  actualDuration: string | null
  startedAt: string | null
  completedAt: string | null
  notes: string | null
  blockedReason: string | null
  dueDate: string | null
}

export interface WorkflowTemplate {
  type: 'A+B' | 'C+D' | 'E' | 'Production'
  label: string
  totalSteps: number
  description: string
  steps: Omit<WorkflowStep, 'id' | 'projectId'>[]
}

// =============================================================================
// Activity Log
// =============================================================================

export interface Activity {
  id: string
  projectId: string
  briefId: string | null
  activityType: ActivityType
  actorType: ActorType
  actorId: string | null
  actorName: string | null
  field: string | null
  oldValue: unknown
  newValue: unknown
  message: string
  createdAt: string
}

// =============================================================================
// Margin Calculation
// =============================================================================

export interface MarginCalculation {
  budget: number
  budgetCurrency: 'EUR' | 'USD' | 'GBP' | 'CHF'
  marginPercentage: number
  payoutAmount: number
  marginAmount: number
  tier: ProjectType
  tierDescription: string
}

export function calculateMargin(budget: number): MarginCalculation {
  let tier: ProjectType
  let marginPercentage: number
  let tierDescription: string

  if (budget > 100000) {
    tier = 'A'
    marginPercentage = 22 // 20-25% average
    tierDescription = 'Full workflow with management oversight'
  } else if (budget >= 25000) {
    tier = 'B'
    marginPercentage = 25
    tierDescription = 'Full workflow'
  } else if (budget >= 10000) {
    tier = 'C'
    marginPercentage = 50
    tierDescription = 'Simplified workflow'
  } else if (budget >= 2500) {
    tier = 'D'
    marginPercentage = 50
    tierDescription = 'Simplified workflow'
  } else {
    tier = 'E'
    marginPercentage = 100
    tierDescription = 'Blanket license only'
  }

  const marginAmount = budget * (marginPercentage / 100)
  const payoutAmount = budget - marginAmount

  return {
    budget,
    budgetCurrency: 'EUR',
    marginPercentage,
    payoutAmount,
    marginAmount,
    tier,
    tierDescription,
  }
}

// =============================================================================
// Completeness Scoring
// =============================================================================

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

export interface MissingField {
  field: string
  priority: FieldPriority
  tab: 'WHAT' | 'WHO' | 'WITH_WHAT' | 'WHEN' | 'OTHER'
}

export const CRITICAL_FIELDS = [
  'client_name',
  'territory',
  'deadline_date',
  'media_types',
  'creative_direction',
]

export const IMPORTANT_FIELDS = [
  'brand_name',
  'mood_keywords',
  'genre_preferences',
  'reference_tracks',
  'video_lengths',
  'term_length',
]

export const HELPFUL_FIELDS = [
  'campaign_context',
  'target_audience',
  'brand_values',
  'competitor_info',
  'previous_music',
  'agency_name',
  'brief_sender_name',
  'lyrics_requirements',
  'must_avoid',
  'sync_points',
]
