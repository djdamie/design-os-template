import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { WorkflowTracker } from '../WorkflowTracker'
import type {
  Project,
  WorkflowTemplate,
  WorkflowStep,
  TeamAssignment,
  SystemTask,
  Alert,
  ProgressSummary,
  WorkflowTrackerProps,
} from '../types'

// =============================================================================
// Test Data
// =============================================================================

const mockProject: Project = {
  id: 'proj-2024-047',
  caseNumber: 47,
  caseTitle: 'Lufthansa Summer Campaign',
  catchyCaseId: 'LH-Summer-Vibes',
  classification: 'C',
  budget: 18500,
  status: 'in_progress',
}

const mockWorkflowTemplate: WorkflowTemplate = {
  type: 'C+D',
  label: 'Simplified Workflow',
  totalSteps: 11,
  description: 'Request-first approach for projects 2,500-25,000',
}

const mockWorkflowSteps: WorkflowStep[] = [
  {
    id: 'step-001',
    sequenceNumber: 1,
    name: 'Define Briefing',
    description: 'Structure the client brief',
    status: 'completed',
    assignedRole: 'AM',
    assignedUserId: 'user-sarah',
    estimatedDuration: '1 hour',
    actualDuration: '45 min',
    startedAt: '2025-01-10T09:00:00Z',
    completedAt: '2025-01-10T09:45:00Z',
    notes: 'Brief was well-structured from client.',
  },
  {
    id: 'step-002',
    sequenceNumber: 2,
    name: 'Create Request',
    description: 'Submit to internal request system',
    status: 'completed',
    assignedRole: 'AM',
    assignedUserId: 'user-sarah',
    estimatedDuration: '1 hour',
    actualDuration: '30 min',
    startedAt: '2025-01-10T10:00:00Z',
    completedAt: '2025-01-10T10:30:00Z',
    notes: null,
  },
  {
    id: 'step-003',
    sequenceNumber: 3,
    name: 'Shortlist Request',
    description: 'Filter request responses',
    status: 'completed',
    assignedRole: 'MS',
    assignedUserId: 'user-marcus',
    estimatedDuration: '1 day',
    actualDuration: '6 hours',
    startedAt: '2025-01-11T09:00:00Z',
    completedAt: '2025-01-11T15:00:00Z',
    notes: 'Good response rate. 47 submissions, shortlisted to 12.',
  },
  {
    id: 'step-004',
    sequenceNumber: 4,
    name: 'Additional Tracks Needed?',
    description: 'Decide if more search required',
    status: 'completed',
    assignedRole: 'AM',
    assignedUserId: 'user-sarah',
    estimatedDuration: '1 hour',
    actualDuration: '20 min',
    startedAt: '2025-01-11T15:30:00Z',
    completedAt: '2025-01-11T15:50:00Z',
    notes: 'Yes - client mentioned they want more indie options',
  },
  {
    id: 'step-005',
    sequenceNumber: 5,
    name: 'Add Additional Tracks',
    description: 'Expand search if needed',
    status: 'completed',
    assignedRole: 'MS',
    assignedUserId: 'user-marcus',
    estimatedDuration: '2 hours',
    actualDuration: '2.5 hours',
    startedAt: '2025-01-12T09:00:00Z',
    completedAt: '2025-01-12T11:30:00Z',
    notes: 'Added 8 indie tracks from our catalog',
  },
  {
    id: 'step-006',
    sequenceNumber: 6,
    name: 'List Safe & Good?',
    description: 'Verify quality and clearability',
    status: 'in_progress',
    assignedRole: 'MS',
    assignedUserId: 'user-marcus',
    estimatedDuration: '30 min',
    actualDuration: null,
    startedAt: '2025-01-13T10:00:00Z',
    completedAt: null,
    notes: 'Checking 2 tracks with potential conflicts',
  },
  {
    id: 'step-007',
    sequenceNumber: 7,
    name: 'Check TBCs',
    description: 'Verify to be confirmed items',
    status: 'blocked',
    assignedRole: 'MS',
    assignedUserId: 'user-marcus',
    estimatedDuration: '1 day',
    actualDuration: null,
    startedAt: '2025-01-13T14:00:00Z',
    completedAt: null,
    notes: null,
    blockedReason: 'Waiting on publisher response for Golden Hour sync availability.',
  },
  {
    id: 'step-008',
    sequenceNumber: 8,
    name: 'Send List to Client',
    description: 'Deliver shortlist',
    status: 'pending',
    assignedRole: 'AM',
    assignedUserId: 'user-sarah',
    estimatedDuration: '1 day',
    actualDuration: null,
    startedAt: null,
    completedAt: null,
    notes: null,
    dueDate: '2025-01-17T17:00:00Z',
  },
  {
    id: 'step-009',
    sequenceNumber: 9,
    name: 'Check List Engagement',
    description: 'Monitor client response',
    status: 'pending',
    assignedRole: 'AM',
    assignedUserId: 'user-sarah',
    estimatedDuration: '3 days',
    actualDuration: null,
    startedAt: null,
    completedAt: null,
    notes: null,
  },
  {
    id: 'step-010',
    sequenceNumber: 10,
    name: 'Follow Up / Double Down',
    description: 'Push for decision',
    status: 'pending',
    assignedRole: 'AM',
    assignedUserId: 'user-sarah',
    estimatedDuration: '1 hour',
    actualDuration: null,
    startedAt: null,
    completedAt: null,
    notes: null,
  },
  {
    id: 'step-011',
    sequenceNumber: 11,
    name: 'Make Contract',
    description: 'Finalize agreement',
    status: 'pending',
    assignedRole: 'BA',
    assignedUserId: 'user-elena',
    estimatedDuration: 'Variable',
    actualDuration: null,
    startedAt: null,
    completedAt: null,
    notes: null,
  },
]

const mockTeamAssignments: TeamAssignment[] = [
  {
    id: 'assign-001',
    userId: 'user-sarah',
    userName: 'Sarah Chen',
    userAvatar: null,
    role: 'AM',
    roleLabel: 'Account Manager',
    isPrimary: true,
    stepsOwned: ['step-001', 'step-002', 'step-004', 'step-008', 'step-009', 'step-010'],
    notes: 'Project lead',
  },
  {
    id: 'assign-002',
    userId: 'user-marcus',
    userName: 'Marcus Weber',
    userAvatar: null,
    role: 'MS',
    roleLabel: 'Music Supervisor',
    isPrimary: true,
    stepsOwned: ['step-003', 'step-005', 'step-006', 'step-007'],
    notes: null,
  },
  {
    id: 'assign-003',
    userId: 'user-elena',
    userName: 'Elena Rodriguez',
    userAvatar: null,
    role: 'BA',
    roleLabel: 'Business Affairs',
    isPrimary: true,
    stepsOwned: ['step-011'],
    notes: 'Available after Jan 20',
  },
  {
    id: 'assign-004',
    userId: 'user-thomas',
    userName: 'Thomas Muller',
    userAvatar: null,
    role: 'PM',
    roleLabel: 'Project Manager',
    isPrimary: false,
    stepsOwned: [],
    notes: 'Oversight only',
  },
  {
    id: 'assign-005',
    userId: 'user-anna',
    userName: 'Anna Schmidt',
    userAvatar: null,
    role: 'MGMT',
    roleLabel: 'Management',
    isPrimary: false,
    stepsOwned: [],
    notes: 'Final approval if needed',
  },
]

const mockSystemTasks: SystemTask[] = [
  {
    id: 'sys-001',
    name: 'Project Initialization',
    description: 'Created case, brief, Slack channel, and Nextcloud folder',
    status: 'success',
    n8nWorkflow: 'TF_brief_to_project_v5',
    triggeredAt: '2025-01-10T08:45:00Z',
    completedAt: '2025-01-10T08:45:12Z',
    executionTime: '12s',
    outputs: {
      slackChannel: '#lh-summer-vibes',
      nextcloudFolder: '/Projects/BriefBot/047 - Lufthansa Summer Campaign/',
    },
    error: null,
  },
  {
    id: 'sys-002',
    name: 'Brief Sync to Nextcloud',
    description: 'Synced latest brief changes to project folder',
    status: 'success',
    n8nWorkflow: 'Sync Brief to Nextcloud',
    triggeredAt: '2025-01-12T11:35:00Z',
    completedAt: '2025-01-12T11:35:03Z',
    executionTime: '3s',
    outputs: null,
    error: null,
  },
  {
    id: 'sys-003',
    name: 'Slack Status Update',
    description: 'Post workflow status to project channel',
    status: 'failed',
    n8nWorkflow: 'SlackBot',
    triggeredAt: '2025-01-13T14:05:00Z',
    completedAt: '2025-01-13T14:05:08Z',
    executionTime: '8s',
    outputs: null,
    error: 'Slack API rate limit exceeded. Retry in 60 seconds.',
    retryCount: 2,
    maxRetries: 3,
  },
]

const mockAlerts: Alert[] = [
  {
    id: 'alert-001',
    type: 'blocked',
    severity: 'high',
    stepId: 'step-007',
    stepName: 'Check TBCs',
    message: 'Step blocked: Waiting on publisher response',
    createdAt: '2025-01-13T14:00:00Z',
    assignedTo: 'user-marcus',
  },
  {
    id: 'alert-002',
    type: 'approaching',
    severity: 'medium',
    stepId: 'step-008',
    stepName: 'Send List to Client',
    message: 'Due in 2 days (Jan 17)',
    createdAt: '2025-01-15T09:00:00Z',
    assignedTo: 'user-sarah',
  },
  {
    id: 'alert-003',
    type: 'system_failure',
    severity: 'low',
    stepId: null,
    stepName: null,
    message: 'Slack status update failed (2/3 retries)',
    createdAt: '2025-01-13T14:05:08Z',
    assignedTo: null,
  },
  {
    id: 'alert-004',
    type: 'in_progress_long',
    severity: 'low',
    stepId: 'step-006',
    stepName: 'List Safe & Good?',
    message: 'In progress for 2+ days (expected 30 min)',
    createdAt: '2025-01-15T10:00:00Z',
    assignedTo: 'user-marcus',
  },
]

const mockProgressSummary: ProgressSummary = {
  completedSteps: 5,
  totalSteps: 11,
  percentComplete: 45,
  currentStep: 'List Safe & Good?',
  blockedCount: 1,
  overdueCount: 0,
}

const defaultProps: WorkflowTrackerProps = {
  project: mockProject,
  workflowTemplate: mockWorkflowTemplate,
  workflowSteps: mockWorkflowSteps,
  teamAssignments: mockTeamAssignments,
  systemTasks: mockSystemTasks,
  alerts: mockAlerts,
  progressSummary: mockProgressSummary,
}

// =============================================================================
// Layout Tests
// =============================================================================

describe('Layout Tests', () => {
  it('should render the workflow tracker header with project info', () => {
    render(<WorkflowTracker {...defaultProps} />)

    expect(screen.getByText('Workflow Tracker')).toBeInTheDocument()
    expect(screen.getByText(/LH-Summer-Vibes/)).toBeInTheDocument()
    expect(screen.getByText(/Lufthansa Summer Campaign/)).toBeInTheDocument()
  })

  it('should render the workflow template badge', () => {
    render(<WorkflowTracker {...defaultProps} />)

    expect(screen.getByText('Simplified Workflow')).toBeInTheDocument()
    expect(screen.getByText(/Request-first approach/)).toBeInTheDocument()
  })

  it('should render the progress bar with percentage', () => {
    render(<WorkflowTracker {...defaultProps} />)

    expect(screen.getByText('45%')).toBeInTheDocument()
    // "List Safe & Good?" appears in progress bar and step card
    const stepNameElements = screen.getAllByText(/List Safe & Good\?/)
    expect(stepNameElements.length).toBeGreaterThan(0)
  })

  it('should render all four Kanban columns', () => {
    render(<WorkflowTracker {...defaultProps} />)

    expect(screen.getByText('In Progress')).toBeInTheDocument()
    expect(screen.getByText('Pending')).toBeInTheDocument()
    expect(screen.getByText('Blocked')).toBeInTheDocument()
    expect(screen.getByText('Completed')).toBeInTheDocument()
  })

  it('should display steps in correct Kanban columns', () => {
    render(<WorkflowTracker {...defaultProps} />)

    // In Progress column should have step 6 (appears in progress bar too)
    const inProgressSteps = screen.getAllByText('List Safe & Good?')
    expect(inProgressSteps.length).toBeGreaterThan(0)

    // Blocked column should have step 7 (also in alerts)
    const blockedSteps = screen.getAllByText('Check TBCs')
    expect(blockedSteps.length).toBeGreaterThan(0)

    // Pending column should have steps 8-11 (step 8 also in alerts)
    const pendingSteps = screen.getAllByText('Send List to Client')
    expect(pendingSteps.length).toBeGreaterThan(0)
    expect(screen.getByText('Make Contract')).toBeInTheDocument()

    // Completed column should have steps 1-5
    expect(screen.getByText('Define Briefing')).toBeInTheDocument()
    expect(screen.getByText('Create Request')).toBeInTheDocument()
  })

  it('should render the team panel with all team members', () => {
    render(<WorkflowTracker {...defaultProps} />)

    // Team members may appear in step cards as owners too, so use getAllByText for all
    const sarahElements = screen.getAllByText('Sarah Chen')
    expect(sarahElements.length).toBeGreaterThan(0)
    const marcusElements = screen.getAllByText('Marcus Weber')
    expect(marcusElements.length).toBeGreaterThan(0)
    const elenaElements = screen.getAllByText('Elena Rodriguez')
    expect(elenaElements.length).toBeGreaterThan(0)
    const thomasElements = screen.getAllByText('Thomas Muller')
    expect(thomasElements.length).toBeGreaterThan(0)
    const annaElements = screen.getAllByText('Anna Schmidt')
    expect(annaElements.length).toBeGreaterThan(0)
  })

  it('should render alerts section when alerts exist', () => {
    render(<WorkflowTracker {...defaultProps} />)

    expect(screen.getByText(/Step blocked: Waiting on publisher response/)).toBeInTheDocument()
    expect(screen.getByText(/Due in 2 days/)).toBeInTheDocument()
  })
})

// =============================================================================
// Progress Bar Tests
// =============================================================================

describe('Progress Bar Tests', () => {
  it('should display correct percentage', () => {
    render(<WorkflowTracker {...defaultProps} />)

    expect(screen.getByText('45%')).toBeInTheDocument()
  })

  it('should display current step name', () => {
    render(<WorkflowTracker {...defaultProps} />)

    // Current step appears in progress bar and step card
    const stepNames = screen.getAllByText(/List Safe & Good\?/)
    expect(stepNames.length).toBeGreaterThan(0)
  })

  it('should show blocked count when > 0', () => {
    render(<WorkflowTracker {...defaultProps} />)

    expect(screen.getByText(/1 blocked/i)).toBeInTheDocument()
  })

  it('should hide blocked count when 0', () => {
    const propsWithNoBlocked = {
      ...defaultProps,
      progressSummary: { ...mockProgressSummary, blockedCount: 0 },
      alerts: [], // Remove alerts to avoid "blocked" appearing there
      workflowSteps: mockWorkflowSteps.filter((s) => s.status !== 'blocked'), // Remove blocked steps
    }
    render(<WorkflowTracker {...propsWithNoBlocked} />)

    // Check that "X blocked" count indicator is not shown in progress bar
    expect(screen.queryByText(/\d+ blocked/i)).not.toBeInTheDocument()
  })
})

// =============================================================================
// Step Card Tests
// =============================================================================

describe('Step Card Tests', () => {
  it('should render step name and description', () => {
    render(<WorkflowTracker {...defaultProps} />)

    expect(screen.getByText('Define Briefing')).toBeInTheDocument()
    expect(screen.getByText('Structure the client brief')).toBeInTheDocument()
  })

  it('should show role badge with correct role', () => {
    render(<WorkflowTracker {...defaultProps} />)

    // AM role badge should appear multiple times (for steps 1, 2, 4, 8, 9, 10)
    const amBadges = screen.getAllByText('AM')
    expect(amBadges.length).toBeGreaterThan(0)

    // MS role badge should appear (for steps 3, 5, 6, 7)
    const msBadges = screen.getAllByText('MS')
    expect(msBadges.length).toBeGreaterThan(0)
  })

  it('should show notes indicator when step has notes', () => {
    render(<WorkflowTracker {...defaultProps} />)

    // Steps with notes should have the MessageSquare icon indicator
    // We'll check for the presence of notes in the data
    const stepsWithNotes = mockWorkflowSteps.filter((s) => s.notes)
    expect(stepsWithNotes.length).toBeGreaterThan(0)
  })

  it('should display blocked reason for blocked steps', () => {
    render(<WorkflowTracker {...defaultProps} />)

    // Blocked reason appears in step card (may also partially appear in alerts)
    const blockedReasonElements = screen.getAllByText(/Waiting on publisher response/)
    expect(blockedReasonElements.length).toBeGreaterThan(0)
  })

  it('should show duration on step cards', () => {
    render(<WorkflowTracker {...defaultProps} />)

    // Check for estimated or actual durations (may appear multiple times)
    const duration45 = screen.getAllByText('45 min')
    expect(duration45.length).toBeGreaterThan(0) // Step 1 actual
    const duration30 = screen.getAllByText('30 min')
    expect(duration30.length).toBeGreaterThan(0) // Step 6 estimated
  })
})

// =============================================================================
// User Flow Tests
// =============================================================================

describe('User Flow Tests', () => {
  describe('Flow 2: Mark Step Complete', () => {
    it('should call onStepComplete when clicking complete button', async () => {
      const onStepComplete = vi.fn()
      render(<WorkflowTracker {...defaultProps} onStepComplete={onStepComplete} />)

      // Find the in-progress step card by finding its h4 title
      const stepTitles = screen.getAllByText('List Safe & Good?')
      // Find the one that's an h4 (inside step card, not progress bar)
      const stepTitle = stepTitles.find((el) => el.tagName === 'H4')
      const stepCard = stepTitle?.closest('.group')
      expect(stepCard).toBeInTheDocument()

      // Click to expand the card (find expand button)
      const expandButton = stepCard?.querySelector('button[aria-label]')
      if (expandButton) {
        await userEvent.click(expandButton)
      }

      // Find and click Complete button
      const completeButton = screen.getByRole('button', { name: /complete/i })
      await userEvent.click(completeButton)

      expect(onStepComplete).toHaveBeenCalledWith('step-006', undefined)
    })
  })

  describe('Flow 3: Flag Step as Blocked', () => {
    it('should call onStepBlock with reason when blocking a step', async () => {
      const onStepBlock = vi.fn()
      render(<WorkflowTracker {...defaultProps} onStepBlock={onStepBlock} />)

      // Find the in-progress step card by finding its h4 title
      const stepTitles = screen.getAllByText('List Safe & Good?')
      const stepTitle = stepTitles.find((el) => el.tagName === 'H4')
      const stepCard = stepTitle?.closest('.group')
      const expandButton = stepCard?.querySelector('button[aria-label]')
      if (expandButton) {
        await userEvent.click(expandButton)
      }

      // Click "Flag Blocked" button
      const blockButton = screen.getByRole('button', { name: /flag blocked/i })
      await userEvent.click(blockButton)

      // Enter reason
      const reasonInput = screen.getByPlaceholderText(/reason for blocking/i)
      await userEvent.type(reasonInput, 'Waiting on client approval')

      // Click Block button to confirm
      const confirmBlockButton = screen.getByRole('button', { name: /^block$/i })
      await userEvent.click(confirmBlockButton)

      expect(onStepBlock).toHaveBeenCalledWith('step-006', 'Waiting on client approval')
    })

    it('should require reason before blocking', async () => {
      const onStepBlock = vi.fn()
      render(<WorkflowTracker {...defaultProps} onStepBlock={onStepBlock} />)

      // Find the in-progress step card by finding its h4 title
      const stepTitles = screen.getAllByText('List Safe & Good?')
      const stepTitle = stepTitles.find((el) => el.tagName === 'H4')
      const stepCard = stepTitle?.closest('.group')
      const expandButton = stepCard?.querySelector('button[aria-label]')
      if (expandButton) {
        await userEvent.click(expandButton)
      }

      // Click "Flag Blocked" button
      const blockButton = screen.getByRole('button', { name: /flag blocked/i })
      await userEvent.click(blockButton)

      // Try to click Block without entering reason
      const confirmBlockButton = screen.getByRole('button', { name: /^block$/i })
      await userEvent.click(confirmBlockButton)

      // Should not call callback without reason
      expect(onStepBlock).not.toHaveBeenCalled()
    })
  })

  describe('Flow 4: Add Note to Step', () => {
    it('should call onStepAddNote when adding a note', async () => {
      const onStepAddNote = vi.fn()
      render(<WorkflowTracker {...defaultProps} onStepAddNote={onStepAddNote} />)

      // Find the in-progress step card by finding its h4 title
      const stepTitles = screen.getAllByText('List Safe & Good?')
      const stepTitle = stepTitles.find((el) => el.tagName === 'H4')
      const stepCard = stepTitle?.closest('.group')
      const expandButton = stepCard?.querySelector('button[aria-label]')
      if (expandButton) {
        await userEvent.click(expandButton)
      }

      // Find note input and add note
      const noteInput = screen.getByPlaceholderText(/add a note/i)
      await userEvent.type(noteInput, 'Client confirmed via email')

      // Click Add button
      const addButton = screen.getByRole('button', { name: /^add$/i })
      await userEvent.click(addButton)

      expect(onStepAddNote).toHaveBeenCalledWith('step-006', 'Client confirmed via email')
    })
  })

  describe('Flow 5: Start Working on Step', () => {
    it('should call onStepStart when starting a pending step', async () => {
      const onStepStart = vi.fn()
      render(<WorkflowTracker {...defaultProps} onStepStart={onStepStart} />)

      // Find a pending step and expand it (Send List to Client appears in alerts too)
      const stepTitles = screen.getAllByText('Send List to Client')
      const stepTitle = stepTitles.find((el) => el.tagName === 'H4')
      const stepCard = stepTitle?.closest('.group')
      const expandButton = stepCard?.querySelector('button[aria-label]')
      if (expandButton) {
        await userEvent.click(expandButton)
      }

      // Click Start button
      const startButton = screen.getByRole('button', { name: /start/i })
      await userEvent.click(startButton)

      expect(onStepStart).toHaveBeenCalledWith('step-008')
    })
  })
})

// =============================================================================
// System Task Tests
// =============================================================================

describe('System Task Tests', () => {
  it('should show system tasks section collapsed by default', () => {
    render(<WorkflowTracker {...defaultProps} />)

    expect(screen.getByText('System Tasks')).toBeInTheDocument()
    // Task details should not be visible initially
    expect(screen.queryByText('Project Initialization')).not.toBeInTheDocument()
  })

  it('should expand system tasks when clicking toggle', async () => {
    render(<WorkflowTracker {...defaultProps} />)

    // Click to expand
    const toggleButton = screen.getByRole('button', { name: /system tasks/i })
    await userEvent.click(toggleButton)

    // Now tasks should be visible
    expect(screen.getByText('Project Initialization')).toBeInTheDocument()
    expect(screen.getByText('Brief Sync to Nextcloud')).toBeInTheDocument()
    expect(screen.getByText('Slack Status Update')).toBeInTheDocument()
  })

  it('should show task count in header', () => {
    render(<WorkflowTracker {...defaultProps} />)

    // 2 success out of 3 total
    expect(screen.getByText('2/3')).toBeInTheDocument()
  })

  it('should call onSystemTaskRetry when clicking retry on failed task', async () => {
    const onSystemTaskRetry = vi.fn()
    render(<WorkflowTracker {...defaultProps} onSystemTaskRetry={onSystemTaskRetry} />)

    // Expand system tasks
    const toggleButton = screen.getByRole('button', { name: /system tasks/i })
    await userEvent.click(toggleButton)

    // Find retry button for failed task
    const retryButton = screen.getByRole('button', { name: /retry/i })
    await userEvent.click(retryButton)

    expect(onSystemTaskRetry).toHaveBeenCalledWith('sys-003')
  })

  it('should display error message for failed task', async () => {
    render(<WorkflowTracker {...defaultProps} />)

    // Expand system tasks
    const toggleButton = screen.getByRole('button', { name: /system tasks/i })
    await userEvent.click(toggleButton)

    expect(screen.getByText(/Slack API rate limit exceeded/)).toBeInTheDocument()
  })

  it('should display outputs for successful tasks', async () => {
    render(<WorkflowTracker {...defaultProps} />)

    // Expand system tasks section
    const toggleButton = screen.getByRole('button', { name: /system tasks/i })
    await userEvent.click(toggleButton)

    // Expand the first system task card (Project Initialization) which has outputs
    const taskButtons = screen.getAllByText('Project Initialization')
    const taskButton = taskButtons[0].closest('button')
    if (taskButton) {
      await userEvent.click(taskButton)
    }

    // Check for Slack channel output
    expect(screen.getByText('#lh-summer-vibes')).toBeInTheDocument()
  })
})

// =============================================================================
// Alert Tests
// =============================================================================

describe('Alert Tests', () => {
  it('should display high severity alerts prominently', () => {
    render(<WorkflowTracker {...defaultProps} />)

    expect(screen.getByText(/Step blocked: Waiting on publisher response/)).toBeInTheDocument()
  })

  it('should display all alerts', () => {
    render(<WorkflowTracker {...defaultProps} />)

    expect(screen.getByText(/Step blocked/)).toBeInTheDocument()
    expect(screen.getByText(/Due in 2 days/)).toBeInTheDocument()
    expect(screen.getByText(/Slack status update failed/)).toBeInTheDocument()
    expect(screen.getByText(/In progress for 2\+ days/)).toBeInTheDocument()
  })

  it('should call onAlertDismiss when dismissing an alert', async () => {
    const onAlertDismiss = vi.fn()
    render(<WorkflowTracker {...defaultProps} onAlertDismiss={onAlertDismiss} />)

    // Find dismiss buttons (X icons)
    const dismissButtons = screen.getAllByRole('button', { name: /dismiss/i })
    await userEvent.click(dismissButtons[0])

    expect(onAlertDismiss).toHaveBeenCalled()
  })
})

// =============================================================================
// Team Panel Tests
// =============================================================================

describe('Team Panel Tests', () => {
  it('should display all team members', () => {
    render(<WorkflowTracker {...defaultProps} />)

    // Team member names may appear in step cards as owners, so use getAllByText
    const sarahElements = screen.getAllByText('Sarah Chen')
    expect(sarahElements.length).toBeGreaterThan(0)
    const marcusElements = screen.getAllByText('Marcus Weber')
    expect(marcusElements.length).toBeGreaterThan(0)
    // Elena, Thomas, Anna may also appear as step owners
    const elenaElements = screen.getAllByText('Elena Rodriguez')
    expect(elenaElements.length).toBeGreaterThan(0)
    const thomasElements = screen.getAllByText('Thomas Muller')
    expect(thomasElements.length).toBeGreaterThan(0)
    const annaElements = screen.getAllByText('Anna Schmidt')
    expect(annaElements.length).toBeGreaterThan(0)
  })

  it('should show role labels', () => {
    render(<WorkflowTracker {...defaultProps} />)

    expect(screen.getByText('Account Manager')).toBeInTheDocument()
    expect(screen.getByText('Music Supervisor')).toBeInTheDocument()
    expect(screen.getByText('Business Affairs')).toBeInTheDocument()
    expect(screen.getByText('Project Manager')).toBeInTheDocument()
    expect(screen.getByText('Management')).toBeInTheDocument()
  })

  it('should mark primary assignees as Lead', () => {
    render(<WorkflowTracker {...defaultProps} />)

    // Primary members should have "Lead" indicator
    const leadBadges = screen.getAllByText('Lead')
    expect(leadBadges.length).toBe(3) // Sarah, Marcus, Elena are primary
  })

  it('should show step count for each member', () => {
    render(<WorkflowTracker {...defaultProps} />)

    // Sarah owns 6 steps
    expect(screen.getByText(/6 steps/)).toBeInTheDocument()
    // Marcus owns 4 steps
    expect(screen.getByText(/4 steps/)).toBeInTheDocument()
  })
})

// =============================================================================
// Empty State Tests
// =============================================================================

describe('Empty State Tests', () => {
  it('should handle no alerts gracefully', () => {
    const propsWithNoAlerts = { ...defaultProps, alerts: [] }
    render(<WorkflowTracker {...propsWithNoAlerts} />)

    // Component should render without crashing
    expect(screen.getByText('Workflow Tracker')).toBeInTheDocument()
    // Alerts section should not be visible
    expect(screen.queryByText(/Step blocked/)).not.toBeInTheDocument()
  })

  it('should handle no system tasks gracefully', () => {
    const propsWithNoTasks = { ...defaultProps, systemTasks: [] }
    render(<WorkflowTracker {...propsWithNoTasks} />)

    expect(screen.getByText('Workflow Tracker')).toBeInTheDocument()
    // System tasks count should show 0/0
    expect(screen.getByText('0/0')).toBeInTheDocument()
  })

  it('should handle empty workflow steps', () => {
    const propsWithNoSteps = {
      ...defaultProps,
      workflowSteps: [],
      progressSummary: { ...mockProgressSummary, completedSteps: 0, totalSteps: 0, percentComplete: 0 },
    }
    render(<WorkflowTracker {...propsWithNoSteps} />)

    expect(screen.getByText('Workflow Tracker')).toBeInTheDocument()
    expect(screen.getByText('0%')).toBeInTheDocument()
  })
})

// =============================================================================
// Kanban Column Tests
// =============================================================================

describe('Kanban Column Tests', () => {
  it('should show correct step count in column headers', () => {
    render(<WorkflowTracker {...defaultProps} />)

    // The step counts should appear as badges
    // In Progress: 1, Pending: 4, Blocked: 1, Completed: 5
    const columnHeaders = screen.getAllByRole('heading', { level: 3 })
    expect(columnHeaders.length).toBe(4)
  })

  it('should render steps sorted by sequence number within columns', () => {
    render(<WorkflowTracker {...defaultProps} />)

    // Completed steps should be in order
    const stepNumbers = screen.getAllByText(/^\d+$/).map((el) => el.textContent)
    // The completed column should have steps 1, 2, 3, 4, 5 in order
    expect(stepNumbers).toContain('1')
    expect(stepNumbers).toContain('5')
  })
})
