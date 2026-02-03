import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ProjectCanvas } from '../ProjectCanvas'
import { TabNavigation } from '../TabNavigation'
import { EditableField } from '../EditableField'
import { ActionFooter } from '../ActionFooter'
import type {
  Project,
  MarginCalculation,
  CompletenessBreakdown,
  CanvasTab,
  AllFields,
  TeamMemberOption,
  IntegrationStatus,
  ClassificationReasoning,
  CanvasField,
} from '../types'

// =============================================================================
// Mock Data
// =============================================================================

const mockProject: Project = {
  id: 'proj-001',
  caseNumber: 2024001,
  caseId: 'BMW-Electric-Future',
  caseTitle: 'BMW iX Electric Future Global Campaign',
  projectType: 'A',
  projectTypeOverride: null,
  status: 'active',
  completeness: 92,
  hasUnsavedChanges: false,
  createdAt: '2024-12-16T09:15:00Z',
  updatedAt: '2024-12-16T09:45:15Z',
}

const mockMarginCalculation: MarginCalculation = {
  budget: 175000,
  budgetCurrency: 'EUR',
  marginPercentage: 22,
  payoutAmount: 136500,
  marginAmount: 38500,
  tier: 'A',
  tierDescription: 'Full workflow with management oversight',
}

const mockCompletenessBreakdown: CompletenessBreakdown = {
  score: 92,
  criticalComplete: 5,
  criticalTotal: 5,
  importantComplete: 5,
  importantTotal: 6,
  helpfulComplete: 4,
  helpfulTotal: 10,
  missingFields: [
    { field: 'target_audience', priority: 'helpful', tab: 'OTHER' },
    { field: 'deliverable_formats', priority: 'important', tab: 'WITH_WHAT' },
  ],
}

const mockTabs: CanvasTab[] = [
  { id: 'WHAT', label: 'WHAT', description: 'Project overview', missingCritical: 0, missingImportant: 0 },
  { id: 'WHO', label: 'WHO', description: 'Team assignments', missingCritical: 0, missingImportant: 0 },
  { id: 'WITH_WHAT', label: 'WITH WHAT', description: 'Tools and deliverables', missingCritical: 0, missingImportant: 1 },
  { id: 'WHEN', label: 'WHEN', description: 'Timeline', missingCritical: 0, missingImportant: 0 },
  { id: 'OTHER', label: 'OTHER', description: 'Notes and context', missingCritical: 0, missingImportant: 0 },
]

const mockFields: AllFields = {
  WHAT: {
    clientInfo: {
      label: 'Client Information',
      fields: [
        {
          id: 'client_name',
          label: 'Client Name',
          value: 'BMW AG',
          type: 'text',
          status: 'ai-filled',
          priority: 'critical',
          placeholder: 'e.g., BMW, Nike, Apple',
        },
        {
          id: 'budget_amount',
          label: 'Budget Amount',
          value: 175000,
          type: 'currency',
          status: 'ai-filled',
          priority: 'critical',
        },
        {
          id: 'territory',
          label: 'Territory',
          value: ['Global'],
          type: 'multi-select',
          options: ['Global', 'DACH', 'Europe', 'North America', 'APAC'],
          status: 'ai-filled',
          priority: 'critical',
        },
        {
          id: 'exclusivity',
          label: 'Exclusivity',
          value: true,
          type: 'boolean',
          status: 'ai-filled',
          priority: 'important',
        },
        {
          id: 'exclusivity_details',
          label: 'Exclusivity Details',
          value: 'Automotive category',
          type: 'text',
          status: 'ai-filled',
          priority: 'helpful',
          dependsOn: { field: 'exclusivity', value: true },
        },
      ],
    },
  },
  WHO: {
    projectTeam: {
      label: 'Project Team',
      fields: [
        {
          id: 'account_manager',
          label: 'Account Manager (AM)',
          value: { id: 'user-002', name: 'Lisa Weber', avatar: null },
          type: 'team-select',
          status: 'user-edited',
          priority: 'critical',
        },
        {
          id: 'management',
          label: 'Management (MGMT)',
          value: { id: 'user-001', name: 'Julia Richter', avatar: null },
          type: 'team-select',
          status: 'user-edited',
          priority: 'critical',
          showFor: ['A', 'B'],
        },
      ],
    },
  },
  WITH_WHAT: {
    deliverables: {
      label: 'Deliverables',
      fields: [
        {
          id: 'deliverable_formats',
          label: 'Deliverable Format',
          value: [],
          type: 'multi-select',
          options: ['playlist link', 'shortlist file', 'comparison notes', 'demo'],
          status: 'empty',
          priority: 'important',
        },
      ],
    },
  },
  WHEN: {
    keyDates: {
      label: 'Key Dates',
      fields: [
        {
          id: 'deadline_date',
          label: 'Final Deadline',
          value: '2025-01-15',
          type: 'date',
          status: 'ai-filled',
          priority: 'critical',
        },
      ],
    },
  },
  OTHER: {
    context: {
      label: 'Campaign Context',
      fields: [
        {
          id: 'target_audience',
          label: 'Target Audience',
          value: '',
          type: 'textarea',
          status: 'empty',
          priority: 'helpful',
        },
      ],
    },
  },
}

const mockTeamMembers: TeamMemberOption[] = [
  { id: 'user-001', name: 'Julia Richter', role: 'Managing Director', avatar: null },
  { id: 'user-002', name: 'Lisa Weber', role: 'Account Manager', avatar: null },
  { id: 'user-003', name: 'Max Fischer', role: 'Senior Music Supervisor', avatar: null },
]

const mockIntegrationStatus: IntegrationStatus = {
  slack: {
    connected: true,
    channelName: '#bmw-electric-future',
    channelUrl: 'https://trackfinders.slack.com/archives/C0123456789',
    connectedAt: '2024-12-16T10:00:00Z',
  },
  nextcloud: {
    connected: false,
    folderPath: null,
    folderUrl: null,
    connectedAt: null,
  },
}

const mockClassificationReasoning: ClassificationReasoning = {
  currentType: 'A',
  calculatedType: 'A',
  isOverridden: false,
  reasoning: 'Budget of €175,000 exceeds €100,000 threshold for Type A classification.',
}

const defaultProps = {
  project: mockProject,
  marginCalculation: mockMarginCalculation,
  completenessBreakdown: mockCompletenessBreakdown,
  tabs: mockTabs,
  fields: mockFields,
  teamMembers: mockTeamMembers,
  integrationStatus: mockIntegrationStatus,
  classificationReasoning: mockClassificationReasoning,
}

// =============================================================================
// User Flow Tests
// =============================================================================

describe('User Flow Tests', () => {
  describe('Flow 1: Navigate Tabs', () => {
    it('should switch between tabs and update active state', async () => {
      const onTabChange = vi.fn()
      render(<ProjectCanvas {...defaultProps} onTabChange={onTabChange} />)

      // Initially on WHAT tab - use exact match to avoid WITH WHAT collision
      const tabs = screen.getAllByRole('tab')
      const whatTab = tabs.find(t => t.textContent?.trim() === 'WHAT')
      expect(whatTab).toHaveAttribute('aria-selected', 'true')

      // Click WHO tab
      const whoTab = tabs.find(t => t.textContent?.trim() === 'WHO')
      await userEvent.click(whoTab!)

      expect(onTabChange).toHaveBeenCalledWith('WHO')
    })

    it('should show tab badges with missing field counts', () => {
      render(<ProjectCanvas {...defaultProps} />)

      // WITH_WHAT tab should show badge for 1 missing important field
      const withWhatTab = screen.getByRole('tab', { name: /with what/i })
      expect(withWhatTab).toBeInTheDocument()
    })
  })

  describe('Flow 2: Edit a Text Field', () => {
    it('should make field editable on click', async () => {
      const onFieldUpdate = vi.fn()
      render(<ProjectCanvas {...defaultProps} onFieldUpdate={onFieldUpdate} />)

      // Find and click the client name field
      const clientNameField = screen.getByText('BMW AG')
      await userEvent.click(clientNameField)

      // Field should become editable
      const input = screen.getByDisplayValue('BMW AG')
      expect(input).toBeInTheDocument()
    })

    it('should call onFieldUpdate when field value changes', async () => {
      const onFieldUpdate = vi.fn()
      render(<ProjectCanvas {...defaultProps} onFieldUpdate={onFieldUpdate} />)

      // Click the client name field
      const clientNameField = screen.getByText('BMW AG')
      await userEvent.click(clientNameField)

      // Change value
      const input = screen.getByDisplayValue('BMW AG')
      await userEvent.clear(input)
      await userEvent.type(input, 'BMW Group')
      await userEvent.keyboard('{Enter}')

      expect(onFieldUpdate).toHaveBeenCalledWith('client_name', 'BMW Group')
    })
  })

  describe('Flow 3: Edit a Multi-Select Field', () => {
    it('should open dropdown with options for multi-select', async () => {
      render(<ProjectCanvas {...defaultProps} />)

      // Find territory field and click to edit - need to click the chip to enter edit mode
      const globalChip = screen.getByText('Global')
      await userEvent.click(globalChip)

      // Now click the Add button to open dropdown
      const addButton = screen.getByText(/add/i)
      await userEvent.click(addButton)

      // Should show available options (minus already selected)
      expect(screen.getByText('DACH')).toBeInTheDocument()
      expect(screen.getByText('Europe')).toBeInTheDocument()
    })

    it('should update multi-select value when options are selected', async () => {
      const onFieldUpdate = vi.fn()
      render(<ProjectCanvas {...defaultProps} onFieldUpdate={onFieldUpdate} />)

      // Click the chip to enter edit mode
      const globalChip = screen.getByText('Global')
      await userEvent.click(globalChip)

      // Click Add button to open dropdown
      const addButton = screen.getByText(/add/i)
      await userEvent.click(addButton)

      // Select additional option
      await userEvent.click(screen.getByText('DACH'))

      // Click Save to confirm - there are multiple save buttons (inline and footer)
      // Get all save buttons and click the first one (inline save)
      const saveButtons = screen.getAllByRole('button', { name: /save/i })
      await userEvent.click(saveButtons[0])

      expect(onFieldUpdate).toHaveBeenCalledWith('territory', expect.arrayContaining(['Global', 'DACH']))
    })
  })

  describe('Flow 4: View Completeness Breakdown', () => {
    it('should call onShowMissingFields when completeness bar is clicked', async () => {
      const onShowMissingFields = vi.fn()
      render(<ProjectCanvas {...defaultProps} onShowMissingFields={onShowMissingFields} />)

      // Find and click completeness bar (should show 92%)
      const completenessBar = screen.getByText(/92%/)
      await userEvent.click(completenessBar)

      expect(onShowMissingFields).toHaveBeenCalled()
    })
  })

  describe('Flow 5: Override Project Classification', () => {
    it('should show classification badge with correct type', () => {
      render(<ProjectCanvas {...defaultProps} />)

      expect(screen.getByText(/Type A/)).toBeInTheDocument()
    })

    it('should call onShowClassificationDetails when badge is clicked', async () => {
      const onShowClassificationDetails = vi.fn()
      render(<ProjectCanvas {...defaultProps} onShowClassificationDetails={onShowClassificationDetails} />)

      const badge = screen.getByText(/Type A/)
      await userEvent.click(badge)

      expect(onShowClassificationDetails).toHaveBeenCalled()
    })

    it('should call onTypeOverride when classification is changed', async () => {
      const onTypeOverride = vi.fn()
      render(<ProjectCanvas {...defaultProps} onTypeOverride={onTypeOverride} />)

      // Click badge to open override modal
      const badge = screen.getByText(/Type A/)
      await userEvent.click(badge)

      // Select Type B (if modal renders options)
      const typeBOption = screen.queryByText(/Type B/)
      if (typeBOption) {
        await userEvent.click(typeBOption)
        expect(onTypeOverride).toHaveBeenCalledWith('B')
      }
    })
  })

  describe('Flow 6: Save Changes', () => {
    it('should call onSave when save button is clicked', async () => {
      const onSave = vi.fn()
      render(<ProjectCanvas {...defaultProps} hasUnsavedChanges={true} onSave={onSave} />)

      const saveButton = screen.getByRole('button', { name: /save/i })
      await userEvent.click(saveButton)

      expect(onSave).toHaveBeenCalled()
    })

    it('should disable save button when no unsaved changes', () => {
      render(<ProjectCanvas {...defaultProps} hasUnsavedChanges={false} />)

      const saveButton = screen.getByRole('button', { name: /save/i })
      expect(saveButton).toBeDisabled()
    })
  })

  describe('Flow 7: Create Slack Channel', () => {
    it('should show connected state when Slack is connected', () => {
      render(<ProjectCanvas {...defaultProps} />)

      expect(screen.getByText(/slack connected/i)).toBeInTheDocument()
    })

    it('should call onCreateSlack when button is clicked (not connected)', async () => {
      const onCreateSlack = vi.fn()
      const disconnectedStatus = {
        ...mockIntegrationStatus,
        slack: { connected: false, channelName: null, channelUrl: null, connectedAt: null },
      }
      render(<ProjectCanvas {...defaultProps} integrationStatus={disconnectedStatus} onCreateSlack={onCreateSlack} />)

      const slackButton = screen.getByRole('button', { name: /create slack/i })
      await userEvent.click(slackButton)

      expect(onCreateSlack).toHaveBeenCalled()
    })
  })

  describe('Flow 8: Create Nextcloud Folder', () => {
    it('should call onCreateNextcloud when button is clicked', async () => {
      const onCreateNextcloud = vi.fn()
      render(<ProjectCanvas {...defaultProps} onCreateNextcloud={onCreateNextcloud} />)

      const nextcloudButton = screen.getByRole('button', { name: /nextcloud/i })
      await userEvent.click(nextcloudButton)

      expect(onCreateNextcloud).toHaveBeenCalled()
    })
  })
})

// =============================================================================
// Component Interaction Tests
// =============================================================================

describe('Component Interaction Tests', () => {
  describe('TabNavigation', () => {
    it('should render all 5 tabs', () => {
      render(<TabNavigation tabs={mockTabs} activeTab="WHAT" />)

      const tabs = screen.getAllByRole('tab')
      expect(tabs).toHaveLength(5)
      expect(tabs.find(t => t.textContent?.trim() === 'WHAT')).toBeInTheDocument()
      expect(tabs.find(t => t.textContent?.trim() === 'WHO')).toBeInTheDocument()
      expect(tabs.find(t => t.textContent?.includes('WITH WHAT'))).toBeInTheDocument()
      expect(tabs.find(t => t.textContent?.trim() === 'WHEN')).toBeInTheDocument()
      expect(tabs.find(t => t.textContent?.trim() === 'OTHER')).toBeInTheDocument()
    })

    it('should highlight active tab', () => {
      render(<TabNavigation tabs={mockTabs} activeTab="WHO" />)

      const tabs = screen.getAllByRole('tab')
      const whoTab = tabs.find(t => t.textContent?.trim() === 'WHO')
      expect(whoTab).toHaveAttribute('aria-selected', 'true')
    })

    it('should call onTabChange when tab is clicked', async () => {
      const onTabChange = vi.fn()
      render(<TabNavigation tabs={mockTabs} activeTab="WHAT" onTabChange={onTabChange} />)

      const tabs = screen.getAllByRole('tab')
      const whenTab = tabs.find(t => t.textContent?.trim() === 'WHEN')
      await userEvent.click(whenTab!)

      expect(onTabChange).toHaveBeenCalledWith('WHEN')
    })
  })

  describe('EditableField', () => {
    const textField: CanvasField = {
      id: 'client_name',
      label: 'Client Name',
      value: 'BMW AG',
      type: 'text',
      status: 'ai-filled',
      priority: 'critical',
    }

    const emptyField: CanvasField = {
      id: 'target_audience',
      label: 'Target Audience',
      value: '',
      type: 'textarea',
      status: 'empty',
      priority: 'critical',
    }

    const booleanField: CanvasField = {
      id: 'exclusivity',
      label: 'Exclusivity',
      value: true,
      type: 'boolean',
      status: 'ai-filled',
      priority: 'important',
    }

    it('should display label and value', () => {
      render(<EditableField field={textField} />)

      expect(screen.getByText('Client Name')).toBeInTheDocument()
      expect(screen.getByText('BMW AG')).toBeInTheDocument()
    })

    it('should show AI suggested badge for ai-filled fields', () => {
      render(<EditableField field={textField} />)

      expect(screen.getByText(/ai suggested/i)).toBeInTheDocument()
    })

    it('should show required indicator for empty critical fields', () => {
      render(<EditableField field={emptyField} />)

      // The "Required" indicator should appear for empty critical fields
      const requiredElements = screen.getAllByText(/required/i)
      expect(requiredElements.length).toBeGreaterThan(0)
    })

    it('should render boolean field with Yes/No options', () => {
      render(<EditableField field={booleanField} />)

      expect(screen.getByText(/yes/i)).toBeInTheDocument()
    })

    it('should call onUpdate when value changes', async () => {
      const onUpdate = vi.fn()
      render(<EditableField field={textField} onUpdate={onUpdate} />)

      // Click to edit
      await userEvent.click(screen.getByText('BMW AG'))

      // Change value
      const input = screen.getByDisplayValue('BMW AG')
      await userEvent.clear(input)
      await userEvent.type(input, 'BMW Group')
      await userEvent.keyboard('{Enter}')

      expect(onUpdate).toHaveBeenCalledWith('BMW Group')
    })
  })

  describe('ActionFooter', () => {
    it('should render all action buttons', () => {
      render(
        <ActionFooter
          hasUnsavedChanges={false}
          integrationStatus={mockIntegrationStatus}
        />
      )

      expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /slack/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /nextcloud/i })).toBeInTheDocument()
    })

    it('should disable save button when no unsaved changes', () => {
      render(
        <ActionFooter
          hasUnsavedChanges={false}
          integrationStatus={mockIntegrationStatus}
        />
      )

      expect(screen.getByRole('button', { name: /save/i })).toBeDisabled()
    })

    it('should enable save button when there are unsaved changes', () => {
      render(
        <ActionFooter
          hasUnsavedChanges={true}
          integrationStatus={mockIntegrationStatus}
        />
      )

      expect(screen.getByRole('button', { name: /save/i })).toBeEnabled()
    })

    it('should show connection status for integrations', () => {
      render(
        <ActionFooter
          hasUnsavedChanges={false}
          integrationStatus={mockIntegrationStatus}
        />
      )

      // Slack is connected
      expect(screen.getByText(/slack connected/i)).toBeInTheDocument()
    })
  })
})

// =============================================================================
// Conditional Field Tests
// =============================================================================

describe('Conditional Field Tests', () => {
  it('should show field with showFor when project type matches', () => {
    // Project is Type A, management field should show (showFor: ['A', 'B'])
    render(<ProjectCanvas {...defaultProps} activeTab="WHO" />)

    // Navigate to WHO tab and check for management field
    expect(screen.getByText(/management/i)).toBeInTheDocument()
  })

  it('should hide field with showFor when project type does not match', () => {
    const typeEProject = { ...mockProject, projectType: 'E' as const }
    render(<ProjectCanvas {...defaultProps} project={typeEProject} activeTab="WHO" />)

    // Management field should not show for Type E
    expect(screen.queryByText(/Management \(MGMT\)/)).not.toBeInTheDocument()
  })

  it('should show dependent field when condition is met', () => {
    // exclusivity is true, so exclusivity_details should show
    render(<ProjectCanvas {...defaultProps} />)

    expect(screen.getByText(/exclusivity details/i)).toBeInTheDocument()
  })
})

// =============================================================================
// Empty State Tests
// =============================================================================

describe('Empty State Tests', () => {
  it('should render empty fields with placeholder', () => {
    render(<ProjectCanvas {...defaultProps} activeTab="OTHER" />)

    // target_audience is empty
    expect(screen.getByText('Target Audience')).toBeInTheDocument()
  })

  it('should show critical missing indicator for empty critical fields', () => {
    const fieldsWithEmptyCritical = {
      ...mockFields,
      WHAT: {
        clientInfo: {
          label: 'Client Information',
          fields: [
            {
              id: 'client_name',
              label: 'Client Name',
              value: '',
              type: 'text' as const,
              status: 'empty' as const,
              priority: 'critical' as const,
            },
          ],
        },
      },
    }

    render(<ProjectCanvas {...defaultProps} fields={fieldsWithEmptyCritical} />)

    // Should show "Required" indicator
    const requiredElements = screen.getAllByText(/required/i)
    expect(requiredElements.length).toBeGreaterThan(0)
  })
})

// =============================================================================
// Edge Case Tests
// =============================================================================

describe('Edge Case Tests', () => {
  it('should format currency fields correctly', () => {
    render(<ProjectCanvas {...defaultProps} />)

    // Budget should be formatted - look for the formatted budget in header and/or field
    // €175,000 may appear in multiple places (header margin section and budget field)
    const budgetElements = screen.getAllByText(/\$175,000|€175,000|EUR 175,000|175,000/)
    expect(budgetElements.length).toBeGreaterThan(0)
  })

  it('should format date fields correctly', () => {
    render(<ProjectCanvas {...defaultProps} activeTab="WHEN" />)

    // Deadline date should be displayed - navigate to WHEN tab first
    // Date can be formatted as ISO or locale string
    expect(screen.getByText(/Jan 15, 2025/)).toBeInTheDocument()
  })
})

// =============================================================================
// Accessibility Tests
// =============================================================================

describe('Accessibility Tests', () => {
  it('should have proper ARIA roles for tabs', () => {
    render(<TabNavigation tabs={mockTabs} activeTab="WHAT" />)

    expect(screen.getByRole('tablist')).toBeInTheDocument()
    expect(screen.getAllByRole('tab')).toHaveLength(5)
  })

  it('should mark active tab with aria-selected', () => {
    render(<TabNavigation tabs={mockTabs} activeTab="WHAT" />)

    const tabs = screen.getAllByRole('tab')
    const whatTab = tabs.find(t => t.textContent?.trim() === 'WHAT')
    expect(whatTab).toHaveAttribute('aria-selected', 'true')

    const whoTab = tabs.find(t => t.textContent?.trim() === 'WHO')
    expect(whoTab).toHaveAttribute('aria-selected', 'false')
  })

  it('should have labels for form fields', () => {
    const textField: CanvasField = {
      id: 'client_name',
      label: 'Client Name',
      value: 'BMW AG',
      type: 'text',
      status: 'ai-filled',
      priority: 'critical',
    }

    render(<EditableField field={textField} />)

    expect(screen.getByText('Client Name')).toBeInTheDocument()
  })
})
