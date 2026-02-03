// =============================================================================
// Data Types
// =============================================================================

export type UserRole = 'user' | 'admin' | 'supervisor' | 'coordinator' | 'viewer'

export type ServiceStatus = 'connected' | 'disconnected' | 'error'

export type ServiceHealth = 'healthy' | 'degraded' | 'unhealthy'

export type SyncStatus = 'success' | 'partial' | 'failed'

export type EventType =
  | 'channel_created'
  | 'folder_created'
  | 'document_uploaded'
  | 'brief_synced'
  | 'message_posted'
  | 'webhook_executed'
  | 'webhook_failed'
  | 'webhook_retried'
  | 'case_created'
  | 'user_invited'

export type EventStatus = 'success' | 'failed' | 'pending'

export type ServiceIcon = 'slack' | 'cloud' | 'hard-drive' | 'database'

export interface CurrentUser {
  id: string
  name: string
  email: string
  role: UserRole
  avatarUrl: string | null
}

export interface ServiceStats {
  channelsCreated?: number
  messagesSent?: number
  foldersCreated?: number
  filesUploaded?: number
  documentsUploaded?: number
  storageUsed?: string
  casesStored?: number
  briefsStored?: number
  activeUsers?: number
  lastActivity: string
}

export interface ServiceConnection {
  id: string
  name: string
  description: string
  icon: ServiceIcon
  status: ServiceStatus
  health: ServiceHealth
  lastSyncAt: string
  lastSyncStatus: SyncStatus
  visibleToUsers: boolean
  stats: ServiceStats
  error: string | null
}

export interface IntegrationEvent {
  id: string
  serviceId: string
  serviceName: string
  eventType: EventType
  message: string
  projectId: string | null
  projectName: string | null
  timestamp: string
  status: EventStatus
  details: string | null
}

export interface WebhookConfig {
  id: string
  serviceId: string
  name: string
  workflowName: string
  webhookUrl: string
  method: 'GET' | 'POST' | 'PUT' | 'DELETE'
  enabled: boolean
  lastTriggered: string
  successRate: number
  totalExecutions: number
}

export interface PendingRetry {
  id: string
  eventId: string
  serviceId: string
  serviceName: string
  projectId: string | null
  projectName: string | null
  description: string
  failedAt: string
  retryCount: number
  maxRetries: number
  canRetry: boolean
}

// =============================================================================
// Component Props
// =============================================================================

export interface IntegrationsProps {
  /** The current user viewing the page (determines admin vs user view) */
  currentUser: CurrentUser

  /** All service connections (filtered by role in component) */
  serviceConnections: ServiceConnection[]

  /** Recent integration events across all projects */
  integrationEvents: IntegrationEvent[]

  /** Admin-only: Webhook configurations */
  webhookConfigs: WebhookConfig[]

  /** Failed operations that can be retried */
  pendingRetries: PendingRetry[]

  /** Called when user triggers a manual sync for a project */
  onSyncProject?: (projectId: string, serviceId: string) => void

  /** Called when user retries a failed operation */
  onRetry?: (retryId: string) => void

  /** Called when admin toggles a webhook enabled/disabled */
  onToggleWebhook?: (webhookId: string, enabled: boolean) => void

  /** Called when admin updates webhook configuration */
  onUpdateWebhookConfig?: (webhookId: string, config: Partial<WebhookConfig>) => void

  /** Called when admin tests a webhook connection */
  onTestWebhook?: (webhookId: string) => void

  /** Called when user dismisses an event from the feed */
  onDismissEvent?: (eventId: string) => void

  /** Called when user wants to view event details */
  onViewEventDetails?: (eventId: string) => void

  /** Called when user navigates to a linked project */
  onNavigateToProject?: (projectId: string) => void
}

// =============================================================================
// Child Component Props
// =============================================================================

export interface ServiceCardProps {
  service: ServiceConnection
  isAdmin?: boolean
  onSync?: () => void
}

export interface EventFeedProps {
  events: IntegrationEvent[]
  isAdmin?: boolean
  onViewDetails?: (eventId: string) => void
  onDismiss?: (eventId: string) => void
  onNavigateToProject?: (projectId: string) => void
}

export interface WebhookConfigPanelProps {
  webhooks: WebhookConfig[]
  onToggle?: (webhookId: string, enabled: boolean) => void
  onTest?: (webhookId: string) => void
  onUpdate?: (webhookId: string, config: Partial<WebhookConfig>) => void
}

export interface PendingRetryCardProps {
  retry: PendingRetry
  onRetry?: () => void
  onNavigateToProject?: () => void
}
