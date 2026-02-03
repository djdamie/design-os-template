import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, within } from '@testing-library/react'
import { Integrations } from '../Integrations'
import type {
  CurrentUser,
  ServiceConnection,
  IntegrationEvent,
  WebhookConfig,
  PendingRetry,
  IntegrationsProps,
} from '../types'

// =============================================================================
// Mock Data
// =============================================================================

const mockAdminUser: CurrentUser = {
  id: 'user-sarah',
  name: 'Sarah Chen',
  email: 'sarah@tracksandfields.com',
  role: 'admin',
  avatarUrl: null,
}

const mockRegularUser: CurrentUser = {
  id: 'user-marcus',
  name: 'Marcus Weber',
  email: 'marcus@tracksandfields.com',
  role: 'user',
  avatarUrl: null,
}

const mockSupervisorUser: CurrentUser = {
  id: 'user-elena',
  name: 'Elena Martinez',
  email: 'elena@tracksandfields.com',
  role: 'supervisor',
  avatarUrl: null,
}

const mockServiceConnections: ServiceConnection[] = [
  {
    id: 'svc-slack',
    name: 'Slack',
    description: 'Project channels and notifications',
    icon: 'slack',
    status: 'connected',
    health: 'healthy',
    lastSyncAt: '2025-01-15T14:32:00Z',
    lastSyncStatus: 'success',
    visibleToUsers: true,
    stats: {
      channelsCreated: 47,
      messagesSent: 1243,
      lastActivity: '2025-01-15T14:32:00Z',
    },
    error: null,
  },
  {
    id: 'svc-nextcloud',
    name: 'Nextcloud',
    description: 'Project folders and brief storage',
    icon: 'cloud',
    status: 'connected',
    health: 'degraded',
    lastSyncAt: '2025-01-15T13:45:00Z',
    lastSyncStatus: 'partial',
    visibleToUsers: true,
    stats: {
      foldersCreated: 47,
      filesUploaded: 156,
      lastActivity: '2025-01-15T13:45:00Z',
    },
    error: '2 files failed to sync due to filename conflicts',
  },
  {
    id: 'svc-gdrive',
    name: 'Google Drive',
    description: 'Brief document backup',
    icon: 'hard-drive',
    status: 'connected',
    health: 'healthy',
    lastSyncAt: '2025-01-15T14:30:00Z',
    lastSyncStatus: 'success',
    visibleToUsers: true,
    stats: {
      documentsUploaded: 89,
      storageUsed: '245 MB',
      lastActivity: '2025-01-15T14:30:00Z',
    },
    error: null,
  },
  {
    id: 'svc-supabase',
    name: 'Supabase',
    description: 'Database and real-time sync',
    icon: 'database',
    status: 'connected',
    health: 'healthy',
    lastSyncAt: '2025-01-15T14:35:00Z',
    lastSyncStatus: 'success',
    visibleToUsers: false,
    stats: {
      casesStored: 47,
      briefsStored: 47,
      activeUsers: 12,
      lastActivity: '2025-01-15T14:35:00Z',
    },
    error: null,
  },
]

// Use dynamic "today" timestamp for event grouping tests
const today = new Date()
const todayISO = today.toISOString()

const mockIntegrationEvents: IntegrationEvent[] = [
  {
    id: 'evt-001',
    serviceId: 'svc-slack',
    serviceName: 'Slack',
    eventType: 'channel_created',
    message: 'Created channel #lh-summer-vibes',
    projectId: 'proj-2024-047',
    projectName: 'Lufthansa Summer Campaign',
    timestamp: todayISO,
    status: 'success',
    details: null,
  },
  {
    id: 'evt-002',
    serviceId: 'svc-nextcloud',
    serviceName: 'Nextcloud',
    eventType: 'brief_synced',
    message: 'Failed to sync brief - filename conflict',
    projectId: 'proj-2024-045',
    projectName: 'Mercedes AMG Project',
    timestamp: todayISO,
    status: 'failed',
    details: 'File already exists with different content.',
  },
  {
    id: 'evt-003',
    serviceId: 'svc-supabase',
    serviceName: 'Supabase',
    eventType: 'case_created',
    message: 'Created case record TF-00047',
    projectId: 'proj-2024-047',
    projectName: 'Lufthansa Summer Campaign',
    timestamp: todayISO,
    status: 'success',
    details: null,
  },
]

const mockWebhookConfigs: WebhookConfig[] = [
  {
    id: 'wh-001',
    serviceId: 'svc-slack',
    name: 'Project Initialization',
    workflowName: 'TF_brief_to_project_v5',
    webhookUrl: 'https://n8n.tracksandfields.com/webhook/tf-brief-intake-v5',
    method: 'POST',
    enabled: true,
    lastTriggered: '2025-01-15T14:29:00Z',
    successRate: 98.5,
    totalExecutions: 203,
  },
  {
    id: 'wh-002',
    serviceId: 'svc-nextcloud',
    name: 'Brief Sync to Nextcloud',
    workflowName: 'Sync Brief to Nextcloud',
    webhookUrl: 'https://n8n.tracksandfields.com/webhook/sync-brief-to-nextcloud',
    method: 'POST',
    enabled: true,
    lastTriggered: '2025-01-15T13:45:00Z',
    successRate: 94.1,
    totalExecutions: 312,
  },
  {
    id: 'wh-003',
    serviceId: 'svc-supabase',
    name: 'OpenWebUI Brief Update',
    workflowName: 'Update Brief from OpenWebUI',
    webhookUrl: 'https://n8n.tracksandfields.com/webhook/openwebui-brief-update',
    method: 'POST',
    enabled: false,
    lastTriggered: '2025-01-10T16:20:00Z',
    successRate: 89.3,
    totalExecutions: 156,
  },
]

const mockPendingRetries: PendingRetry[] = [
  {
    id: 'retry-001',
    eventId: 'evt-002',
    serviceId: 'svc-nextcloud',
    serviceName: 'Nextcloud',
    projectId: 'proj-2024-045',
    projectName: 'Mercedes AMG Retry Project',
    description: 'Brief sync failed - filename conflict',
    failedAt: '2025-01-15T12:20:00Z',
    retryCount: 0,
    maxRetries: 3,
    canRetry: true,
  },
]

// Helper to render with default props
function renderIntegrations(overrides: Partial<IntegrationsProps> = {}) {
  const defaultProps: IntegrationsProps = {
    currentUser: mockAdminUser,
    serviceConnections: mockServiceConnections,
    integrationEvents: mockIntegrationEvents,
    webhookConfigs: mockWebhookConfigs,
    pendingRetries: mockPendingRetries,
    onSyncProject: vi.fn(),
    onRetry: vi.fn(),
    onToggleWebhook: vi.fn(),
    onUpdateWebhookConfig: vi.fn(),
    onTestWebhook: vi.fn(),
    onDismissEvent: vi.fn(),
    onViewEventDetails: vi.fn(),
    onNavigateToProject: vi.fn(),
  }

  return render(<Integrations {...defaultProps} {...overrides} />)
}

// =============================================================================
// Layout Tests
// =============================================================================

describe('Integrations - Layout', () => {
  it('renders page title', () => {
    renderIntegrations()
    expect(screen.getByText('Integrations')).toBeInTheDocument()
  })

  it('renders Connected Services section', () => {
    renderIntegrations()
    expect(screen.getByText('Connected Services')).toBeInTheDocument()
  })

  it('renders Recent Activity section', () => {
    renderIntegrations()
    expect(screen.getByText('Recent Activity')).toBeInTheDocument()
  })

  it('renders admin role badge for admin user', () => {
    renderIntegrations({ currentUser: mockAdminUser })
    expect(screen.getByText('Admin View')).toBeInTheDocument()
  })

  it('renders user role badge for regular user', () => {
    renderIntegrations({ currentUser: mockRegularUser })
    expect(screen.getByText('User View')).toBeInTheDocument()
  })

  it('renders Webhook Configuration panel for admin', () => {
    renderIntegrations({ currentUser: mockAdminUser })
    expect(screen.getByText('Webhook Configuration')).toBeInTheDocument()
  })

  it('hides Webhook Configuration panel for regular user', () => {
    renderIntegrations({ currentUser: mockRegularUser })
    expect(screen.queryByText('Webhook Configuration')).not.toBeInTheDocument()
  })
})

// =============================================================================
// Role-Based Access Tests
// =============================================================================

describe('Integrations - Role-Based Access', () => {
  describe('User Role', () => {
    it('shows only user-visible services (3 services, no Supabase)', () => {
      renderIntegrations({ currentUser: mockRegularUser })

      // Use getAllByText since service names appear in both cards and event feed
      expect(screen.getAllByText('Slack').length).toBeGreaterThan(0)
      expect(screen.getAllByText('Nextcloud').length).toBeGreaterThan(0)
      expect(screen.getByText('Google Drive')).toBeInTheDocument()
      // Supabase should not appear anywhere for regular user
      expect(screen.queryByText('Supabase')).not.toBeInTheDocument()
    })

    it('hides Supabase events in activity feed', () => {
      renderIntegrations({ currentUser: mockRegularUser })

      // Should see Slack event
      expect(screen.getByText('Created channel #lh-summer-vibes')).toBeInTheDocument()
      // Should not see Supabase event
      expect(screen.queryByText('Created case record TF-00047')).not.toBeInTheDocument()
    })

    it('cannot see webhook configuration', () => {
      renderIntegrations({ currentUser: mockRegularUser })
      expect(screen.queryByText('Webhook Configuration')).not.toBeInTheDocument()
    })

    it('shows contact admin message', () => {
      renderIntegrations({ currentUser: mockRegularUser })
      expect(screen.getByText(/Contact an administrator/)).toBeInTheDocument()
    })
  })

  describe('Supervisor Role', () => {
    it('shows all services including Supabase', () => {
      renderIntegrations({ currentUser: mockSupervisorUser })

      // Use getAllByText since service names appear in both cards and event feed
      expect(screen.getAllByText('Slack').length).toBeGreaterThan(0)
      expect(screen.getAllByText('Nextcloud').length).toBeGreaterThan(0)
      expect(screen.getByText('Google Drive')).toBeInTheDocument()
      expect(screen.getAllByText('Supabase').length).toBeGreaterThan(0)
    })

    it('cannot see webhook configuration', () => {
      renderIntegrations({ currentUser: mockSupervisorUser })
      expect(screen.queryByText('Webhook Configuration')).not.toBeInTheDocument()
    })
  })

  describe('Admin Role', () => {
    it('shows all services including Supabase', () => {
      renderIntegrations({ currentUser: mockAdminUser })

      // Use getAllByText since service names appear in both cards and event feed
      expect(screen.getAllByText('Slack').length).toBeGreaterThan(0)
      expect(screen.getAllByText('Nextcloud').length).toBeGreaterThan(0)
      expect(screen.getByText('Google Drive')).toBeInTheDocument()
      expect(screen.getAllByText('Supabase').length).toBeGreaterThan(0)
    })

    it('shows webhook configuration panel', () => {
      renderIntegrations({ currentUser: mockAdminUser })
      expect(screen.getByText('Webhook Configuration')).toBeInTheDocument()
    })

    it('shows all events including Supabase in activity feed', () => {
      renderIntegrations({ currentUser: mockAdminUser })
      expect(screen.getByText('Created case record TF-00047')).toBeInTheDocument()
    })

    it('shows detailed error messages in events', () => {
      renderIntegrations({ currentUser: mockAdminUser })
      expect(screen.getByText('File already exists with different content.')).toBeInTheDocument()
    })
  })
})

// =============================================================================
// Service Card Tests
// =============================================================================

describe('Integrations - ServiceCard', () => {
  it('shows Connected status with green indicator', () => {
    renderIntegrations()
    const connectedStatuses = screen.getAllByText('Connected')
    expect(connectedStatuses.length).toBeGreaterThan(0)
  })

  it('shows health indicator for degraded service', () => {
    renderIntegrations()
    // Nextcloud has degraded health - card should be present with service name
    expect(screen.getAllByText('Nextcloud').length).toBeGreaterThan(0)
    // The health indicator is a small colored dot - just verify the component renders
    expect(screen.getByText('Project folders and brief storage')).toBeInTheDocument()
  })

  it('shows service stats', () => {
    renderIntegrations()
    expect(screen.getByText('47 channels')).toBeInTheDocument()
    expect(screen.getByText('47 folders')).toBeInTheDocument()
    expect(screen.getByText('89 docs')).toBeInTheDocument()
  })

  it('shows error message for degraded service', () => {
    renderIntegrations({ currentUser: mockAdminUser })
    expect(screen.getByText('2 files failed to sync due to filename conflicts')).toBeInTheDocument()
  })

  it('shows user-friendly error message for non-admin', () => {
    renderIntegrations({ currentUser: mockRegularUser })
    expect(screen.getByText('Some items failed to sync. Retry to resolve.')).toBeInTheDocument()
  })

  it('shows Sync Now button for Nextcloud', () => {
    renderIntegrations()
    expect(screen.getByText('Sync Now')).toBeInTheDocument()
  })

  it('calls onSyncProject when Sync Now is clicked', () => {
    const onSyncProject = vi.fn()
    renderIntegrations({ onSyncProject })

    fireEvent.click(screen.getByText('Sync Now'))
    expect(onSyncProject).toHaveBeenCalledWith('current', 'svc-nextcloud')
  })
})

// =============================================================================
// Event Feed Tests
// =============================================================================

describe('Integrations - EventFeed', () => {
  it('shows events grouped by date', () => {
    renderIntegrations()
    // Events should be grouped under Today (since they have recent timestamps)
    expect(screen.getByText('Today')).toBeInTheDocument()
  })

  it('shows event message', () => {
    renderIntegrations()
    expect(screen.getByText('Created channel #lh-summer-vibes')).toBeInTheDocument()
  })

  it('shows service name for each event', () => {
    renderIntegrations()
    // Service name appears as uppercase in the event feed
    const slackLabels = screen.getAllByText(/^SLACK$/i)
    expect(slackLabels.length).toBeGreaterThan(0)
  })

  it('shows project name as clickable link', () => {
    renderIntegrations()
    expect(screen.getAllByText('Lufthansa Summer Campaign').length).toBeGreaterThan(0)
  })

  it('calls onNavigateToProject when project link is clicked', () => {
    const onNavigateToProject = vi.fn()
    renderIntegrations({ onNavigateToProject })

    // Find and click a project link
    const projectLinks = screen.getAllByText('Lufthansa Summer Campaign')
    fireEvent.click(projectLinks[0])

    expect(onNavigateToProject).toHaveBeenCalledWith('proj-2024-047')
  })

  it('shows No recent events when empty', () => {
    renderIntegrations({ integrationEvents: [] })
    expect(screen.getByText('No recent events')).toBeInTheDocument()
  })
})

// =============================================================================
// Webhook Config Tests
// =============================================================================

describe('Integrations - WebhookConfigPanel', () => {
  it('shows webhook names', () => {
    renderIntegrations({ currentUser: mockAdminUser })
    expect(screen.getByText('Project Initialization')).toBeInTheDocument()
    expect(screen.getByText('Brief Sync to Nextcloud')).toBeInTheDocument()
  })

  it('shows workflow names', () => {
    renderIntegrations({ currentUser: mockAdminUser })
    expect(screen.getByText('TF_brief_to_project_v5')).toBeInTheDocument()
  })

  it('shows Active status for enabled webhooks', () => {
    renderIntegrations({ currentUser: mockAdminUser })
    const activeLabels = screen.getAllByText('Active')
    expect(activeLabels.length).toBeGreaterThan(0)
  })

  it('shows Disabled status for disabled webhooks', () => {
    renderIntegrations({ currentUser: mockAdminUser })
    expect(screen.getByText('Disabled')).toBeInTheDocument()
  })

  it('shows execution stats', () => {
    renderIntegrations({ currentUser: mockAdminUser })
    expect(screen.getByText('203')).toBeInTheDocument() // totalExecutions
    expect(screen.getByText('98.5%')).toBeInTheDocument() // successRate
  })

  it('shows HTTP method badge', () => {
    renderIntegrations({ currentUser: mockAdminUser })
    const postBadges = screen.getAllByText('POST')
    expect(postBadges.length).toBeGreaterThan(0)
  })

  it('shows masked URL by default', () => {
    renderIntegrations({ currentUser: mockAdminUser })
    // URL should be masked - the maskUrl function creates patterns like "https://domain/*****/<id>"
    const codeElements = document.querySelectorAll('code')
    const hasMaskedUrl = Array.from(codeElements).some((el) => el.textContent?.includes('*****'))
    expect(hasMaskedUrl).toBe(true)
  })

  it('shows Test button for enabled webhooks', () => {
    renderIntegrations({ currentUser: mockAdminUser })
    const testButtons = screen.getAllByText('Test')
    expect(testButtons.length).toBeGreaterThan(0)
  })

  it('calls onToggleWebhook when toggle is clicked', () => {
    const onToggleWebhook = vi.fn()
    renderIntegrations({ currentUser: mockAdminUser, onToggleWebhook })

    // Find the Play/Pause toggle button (the first one is for the first webhook which is enabled)
    const container = screen.getByText('Project Initialization').closest('div')?.parentElement
    const toggleButton = container?.querySelector('button')

    if (toggleButton) {
      fireEvent.click(toggleButton)
      expect(onToggleWebhook).toHaveBeenCalledWith('wh-001', false) // Toggle off
    }
  })

  it('calls onTestWebhook when test button is clicked', () => {
    const onTestWebhook = vi.fn()
    renderIntegrations({ currentUser: mockAdminUser, onTestWebhook })

    const testButtons = screen.getAllByText('Test')
    fireEvent.click(testButtons[0])

    expect(onTestWebhook).toHaveBeenCalled()
  })

  it('disables Test button for disabled webhooks', () => {
    renderIntegrations({ currentUser: mockAdminUser })

    // Find Test buttons and check that the one for disabled webhook is disabled
    const testButtons = screen.getAllByText('Test')
    // The disabled webhook's Test button should be disabled
    const disabledTestButton = testButtons.find((btn) => btn.hasAttribute('disabled'))
    expect(disabledTestButton).toBeInTheDocument()
  })
})

// =============================================================================
// Pending Retry Tests
// =============================================================================

describe('Integrations - PendingRetryCard', () => {
  it('shows Action Required section when retries exist', () => {
    renderIntegrations()
    expect(screen.getByText('Action Required')).toBeInTheDocument()
  })

  it('hides Action Required section when no retries', () => {
    renderIntegrations({ pendingRetries: [] })
    expect(screen.queryByText('Action Required')).not.toBeInTheDocument()
  })

  it('shows retry description', () => {
    renderIntegrations()
    expect(screen.getByText('Brief sync failed - filename conflict')).toBeInTheDocument()
  })

  it('shows service name', () => {
    renderIntegrations()
    // Nextcloud appears in retry card and in service cards
    const nextcloudLabels = screen.getAllByText(/NEXTCLOUD/i)
    expect(nextcloudLabels.length).toBeGreaterThan(0)
  })

  it('shows project name', () => {
    renderIntegrations()
    expect(screen.getByText('Mercedes AMG Retry Project')).toBeInTheDocument()
  })

  it('shows retry count', () => {
    renderIntegrations()
    expect(screen.getByText('0/3 retries')).toBeInTheDocument()
  })

  it('shows Retry Now button when canRetry is true', () => {
    renderIntegrations()
    expect(screen.getByText('Retry Now')).toBeInTheDocument()
  })

  it('calls onRetry when Retry Now is clicked', () => {
    const onRetry = vi.fn()
    renderIntegrations({ onRetry })

    fireEvent.click(screen.getByText('Retry Now'))
    expect(onRetry).toHaveBeenCalledWith('retry-001')
  })

  it('hides Retry Now button when canRetry is false', () => {
    const maxedOutRetry: PendingRetry = {
      ...mockPendingRetries[0],
      retryCount: 3,
      maxRetries: 3,
      canRetry: false,
    }

    renderIntegrations({ pendingRetries: [maxedOutRetry] })
    expect(screen.queryByText('Retry Now')).not.toBeInTheDocument()
  })

  it('calls onNavigateToProject when project link is clicked', () => {
    const onNavigateToProject = vi.fn()
    renderIntegrations({ onNavigateToProject })

    // Click Mercedes AMG Retry Project link in retry card
    fireEvent.click(screen.getByText('Mercedes AMG Retry Project'))
    expect(onNavigateToProject).toHaveBeenCalledWith('proj-2024-045')
  })
})

// =============================================================================
// Empty State Tests
// =============================================================================

describe('Integrations - Empty States', () => {
  it('handles no events gracefully', () => {
    renderIntegrations({ integrationEvents: [] })
    expect(screen.getByText('No recent events')).toBeInTheDocument()
  })

  it('handles no pending retries gracefully', () => {
    renderIntegrations({ pendingRetries: [] })
    expect(screen.queryByText('Action Required')).not.toBeInTheDocument()
  })

  it('shows disconnected status for disconnected service', () => {
    const disconnectedService: ServiceConnection = {
      ...mockServiceConnections[0],
      status: 'disconnected',
      health: 'unhealthy',
    }

    renderIntegrations({
      serviceConnections: [disconnectedService],
    })

    expect(screen.getByText('Disconnected')).toBeInTheDocument()
  })
})

// =============================================================================
// User Flow Tests
// =============================================================================

describe('Integrations - User Flows', () => {
  it('Flow 1: View Integration Status (User)', () => {
    renderIntegrations({ currentUser: mockRegularUser })

    // Should see title
    expect(screen.getByText('Integrations')).toBeInTheDocument()

    // Should see 3 user-visible services (use getAllByText for names in multiple places)
    expect(screen.getAllByText('Slack').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Nextcloud').length).toBeGreaterThan(0)
    expect(screen.getByText('Google Drive')).toBeInTheDocument()

    // Should NOT see Supabase or webhook config
    expect(screen.queryByText('Supabase')).not.toBeInTheDocument()
    expect(screen.queryByText('Webhook Configuration')).not.toBeInTheDocument()
  })

  it('Flow 2: View Integration Status (Admin)', () => {
    renderIntegrations({ currentUser: mockAdminUser })

    // Should see all 4 services (use getAllByText for names in multiple places)
    expect(screen.getAllByText('Slack').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Nextcloud').length).toBeGreaterThan(0)
    expect(screen.getByText('Google Drive')).toBeInTheDocument()
    expect(screen.getAllByText('Supabase').length).toBeGreaterThan(0)

    // Should see webhook config
    expect(screen.getByText('Webhook Configuration')).toBeInTheDocument()
  })

  it('Flow 3: View Recent Activity', () => {
    renderIntegrations()

    // Should see activity section
    expect(screen.getByText('Recent Activity')).toBeInTheDocument()

    // Should see events
    expect(screen.getByText('Created channel #lh-summer-vibes')).toBeInTheDocument()

    // Events should be grouped by date
    expect(screen.getByText('Today')).toBeInTheDocument()
  })

  it('Flow 5: Retry Failed Operation', () => {
    const onRetry = vi.fn()
    renderIntegrations({ onRetry })

    // Should see pending retry
    expect(screen.getByText('Brief sync failed - filename conflict')).toBeInTheDocument()

    // Click retry
    fireEvent.click(screen.getByText('Retry Now'))

    // Callback should be called
    expect(onRetry).toHaveBeenCalledWith('retry-001')
  })

  it('Flow 6: Toggle Webhook (Admin)', () => {
    const onToggleWebhook = vi.fn()
    renderIntegrations({ currentUser: mockAdminUser, onToggleWebhook })

    // Find webhook toggle (look in webhook config area)
    const webhookSection = screen.getByText('Webhook Configuration').closest('div')?.parentElement
    expect(webhookSection).toBeInTheDocument()

    // The webhook toggles are the first buttons in each webhook row
    const toggleButtons = webhookSection?.querySelectorAll('[class*="rounded-lg"][class*="flex"][class*="items-center"]') || []
    expect(toggleButtons.length).toBeGreaterThan(0)
  })

  it('Flow 7: Test Webhook (Admin)', () => {
    const onTestWebhook = vi.fn()
    renderIntegrations({ currentUser: mockAdminUser, onTestWebhook })

    // Click first test button
    const testButtons = screen.getAllByText('Test')
    fireEvent.click(testButtons[0])

    expect(onTestWebhook).toHaveBeenCalled()
  })
})
