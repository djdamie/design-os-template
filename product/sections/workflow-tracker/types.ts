// =============================================================================
// Data Types
// =============================================================================

export type WorkflowStepStatus = 'pending' | 'in_progress' | 'completed' | 'skipped' | 'blocked'

export type TeamRole = 'AM' | 'MS' | 'PM' | 'MC' | 'BA' | 'MGMT' | 'Producer' | 'Composer'

export type SystemTaskStatus = 'queued' | 'running' | 'success' | 'failed' | 'retrying' | 'skipped'

export type AlertType = 'overdue' | 'approaching' | 'blocked' | 'system_failure' | 'in_progress_long'

export type AlertSeverity = 'high' | 'medium' | 'low'

export type WorkflowTemplateType = 'A+B' | 'C+D' | 'E' | 'Production'

export type ProjectClassification = 'A' | 'B' | 'C' | 'D' | 'E' | 'Production'

export interface WorkflowStep {
  id: string
  sequenceNumber: number
  name: string
  description: string
  status: WorkflowStepStatus
  assignedRole: TeamRole
  assignedUserId: string
  estimatedDuration: string
  actualDuration: string | null
  startedAt: string | null
  completedAt: string | null
  notes: string | null
  blockedReason?: string
  dueDate?: string
}

export interface TeamAssignment {
  id: string
  userId: string
  userName: string
  userAvatar: string | null
  role: TeamRole
  roleLabel: string
  isPrimary: boolean
  stepsOwned: string[]
  notes: string | null
}

export interface SystemTaskOutputs {
  slackChannel?: string
  nextcloudFolder?: string
  [key: string]: string | undefined
}

export interface SystemTask {
  id: string
  name: string
  description: string
  status: SystemTaskStatus
  n8nWorkflow: string
  triggeredAt: string
  completedAt: string | null
  executionTime: string | null
  outputs: SystemTaskOutputs | null
  error: string | null
  retryCount?: number
  maxRetries?: number
}

export interface Alert {
  id: string
  type: AlertType
  severity: AlertSeverity
  stepId: string | null
  stepName: string | null
  message: string
  createdAt: string
  assignedTo: string | null
}

export interface WorkflowTemplate {
  type: WorkflowTemplateType
  label: string
  totalSteps: number
  description: string
}

export interface Project {
  id: string
  caseNumber: number
  caseTitle: string
  catchyCaseId: string
  classification: ProjectClassification
  budget: number
  status: 'draft' | 'active' | 'in_progress' | 'completed' | 'cancelled'
}

export interface ProgressSummary {
  completedSteps: number
  totalSteps: number
  percentComplete: number
  currentStep: string
  blockedCount: number
  overdueCount: number
}

// =============================================================================
// Component Props
// =============================================================================

export interface WorkflowTrackerProps {
  /** The project this workflow belongs to */
  project: Project

  /** The active workflow template (A+B, C+D, E, or Production) */
  workflowTemplate: WorkflowTemplate

  /** All workflow steps for this project */
  workflowSteps: WorkflowStep[]

  /** Team members assigned to this project */
  teamAssignments: TeamAssignment[]

  /** Automated system tasks from n8n */
  systemTasks: SystemTask[]

  /** Active alerts requiring attention */
  alerts: Alert[]

  /** Summary of workflow progress */
  progressSummary: ProgressSummary

  /** Called when user marks a step as complete */
  onStepComplete?: (stepId: string, notes?: string) => void

  /** Called when user flags a step as blocked */
  onStepBlock?: (stepId: string, reason: string) => void

  /** Called when user adds a note to a step */
  onStepAddNote?: (stepId: string, note: string) => void

  /** Called when user starts working on a step */
  onStepStart?: (stepId: string) => void

  /** Called when user retries a failed system task */
  onSystemTaskRetry?: (taskId: string) => void

  /** Called when user dismisses an alert */
  onAlertDismiss?: (alertId: string) => void
}

// =============================================================================
// Kanban Column Helpers
// =============================================================================

export interface KanbanColumn {
  id: WorkflowStepStatus
  label: string
  steps: WorkflowStep[]
}

export type KanbanColumns = {
  pending: WorkflowStep[]
  in_progress: WorkflowStep[]
  completed: WorkflowStep[]
  blocked: WorkflowStep[]
}
