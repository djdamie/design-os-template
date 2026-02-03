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
// Child Component Props
// =============================================================================

export interface ProgressBarProps {
  progress: ProgressSummary
  template: WorkflowTemplate
}

export interface KanbanColumnProps {
  status: WorkflowStepStatus
  steps: WorkflowStep[]
  teamAssignments: TeamAssignment[]
  onStepComplete?: (stepId: string, notes?: string) => void
  onStepBlock?: (stepId: string, reason: string) => void
  onStepAddNote?: (stepId: string, note: string) => void
  onStepStart?: (stepId: string) => void
}

export interface StepCardProps {
  step: WorkflowStep
  ownerName?: string
  onComplete?: (notes?: string) => void
  onBlock?: (reason: string) => void
  onAddNote?: (note: string) => void
  onStart?: () => void
}

export interface TeamPanelProps {
  assignments: TeamAssignment[]
}

export interface AlertBannerProps {
  alerts: Alert[]
  onDismiss?: (alertId: string) => void
}

export interface SystemTaskCardProps {
  task: SystemTask
  onRetry?: () => void
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

// Displayable column statuses (excludes 'skipped' which isn't shown in Kanban)
export type DisplayableColumnStatus = keyof KanbanColumns

// =============================================================================
// Role Color Configuration
// =============================================================================

export interface RoleColorConfig {
  bg: string
  text: string
}

export const roleColors: Record<TeamRole, RoleColorConfig> = {
  AM: { bg: 'bg-sky-100 dark:bg-sky-900/40', text: 'text-sky-700 dark:text-sky-300' },
  MS: { bg: 'bg-lime-100 dark:bg-lime-900/40', text: 'text-lime-700 dark:text-lime-300' },
  PM: { bg: 'bg-violet-100 dark:bg-violet-900/40', text: 'text-violet-700 dark:text-violet-300' },
  MC: { bg: 'bg-amber-100 dark:bg-amber-900/40', text: 'text-amber-700 dark:text-amber-300' },
  BA: { bg: 'bg-rose-100 dark:bg-rose-900/40', text: 'text-rose-700 dark:text-rose-300' },
  MGMT: { bg: 'bg-zinc-200 dark:bg-zinc-700', text: 'text-zinc-700 dark:text-zinc-300' },
  Producer: { bg: 'bg-indigo-100 dark:bg-indigo-900/40', text: 'text-indigo-700 dark:text-indigo-300' },
  Composer: { bg: 'bg-pink-100 dark:bg-pink-900/40', text: 'text-pink-700 dark:text-pink-300' },
}

// =============================================================================
// Column Configuration
// =============================================================================

export interface ColumnConfig {
  id: WorkflowStepStatus
  label: string
  icon: string
  bgColor: string
  textColor: string
}

export const columnConfig: Record<WorkflowStepStatus, ColumnConfig> = {
  in_progress: {
    id: 'in_progress',
    label: 'In Progress',
    icon: 'play',
    bgColor: 'bg-sky-500',
    textColor: 'text-sky-600 dark:text-sky-400',
  },
  pending: {
    id: 'pending',
    label: 'Pending',
    icon: 'clock',
    bgColor: 'bg-zinc-400',
    textColor: 'text-zinc-600 dark:text-zinc-400',
  },
  blocked: {
    id: 'blocked',
    label: 'Blocked',
    icon: 'alert-triangle',
    bgColor: 'bg-amber-500',
    textColor: 'text-amber-600 dark:text-amber-400',
  },
  completed: {
    id: 'completed',
    label: 'Completed',
    icon: 'check-circle',
    bgColor: 'bg-lime-500',
    textColor: 'text-lime-600 dark:text-lime-400',
  },
  skipped: {
    id: 'skipped',
    label: 'Skipped',
    icon: 'skip-forward',
    bgColor: 'bg-zinc-300',
    textColor: 'text-zinc-500 dark:text-zinc-500',
  },
}
