'use client'

import { useCallback } from 'react'
import { Integrations } from '@/components/integrations'
import sampleData from '@/data/integrations-sample.json'
import type {
  CurrentUser,
  ServiceConnection,
  IntegrationEvent,
  WebhookConfig,
  PendingRetry,
} from '@/components/integrations/types'

export default function IntegrationsPage() {
  // Type-cast sample data (JSON doesn't preserve literal types)
  const currentUser = sampleData.currentUser as CurrentUser
  const serviceConnections = sampleData.serviceConnections as ServiceConnection[]
  const integrationEvents = sampleData.integrationEvents as IntegrationEvent[]
  const webhookConfigs = sampleData.webhookConfigs as WebhookConfig[]
  const pendingRetries = sampleData.pendingRetries as PendingRetry[]

  // Callbacks (stubs for now - will connect to backend later)
  const handleSyncProject = useCallback((projectId: string, serviceId: string) => {
    console.log('Sync project:', projectId, serviceId)
  }, [])

  const handleRetry = useCallback((retryId: string) => {
    console.log('Retry:', retryId)
  }, [])

  const handleToggleWebhook = useCallback((webhookId: string, enabled: boolean) => {
    console.log('Toggle webhook:', webhookId, enabled)
  }, [])

  const handleUpdateWebhookConfig = useCallback(
    (webhookId: string, config: Partial<WebhookConfig>) => {
      console.log('Update webhook config:', webhookId, config)
    },
    []
  )

  const handleTestWebhook = useCallback((webhookId: string) => {
    console.log('Test webhook:', webhookId)
  }, [])

  const handleDismissEvent = useCallback((eventId: string) => {
    console.log('Dismiss event:', eventId)
  }, [])

  const handleViewEventDetails = useCallback((eventId: string) => {
    console.log('View event details:', eventId)
  }, [])

  const handleNavigateToProject = useCallback((projectId: string) => {
    console.log('Navigate to project:', projectId)
  }, [])

  return (
    <Integrations
      currentUser={currentUser}
      serviceConnections={serviceConnections}
      integrationEvents={integrationEvents}
      webhookConfigs={webhookConfigs}
      pendingRetries={pendingRetries}
      onSyncProject={handleSyncProject}
      onRetry={handleRetry}
      onToggleWebhook={handleToggleWebhook}
      onUpdateWebhookConfig={handleUpdateWebhookConfig}
      onTestWebhook={handleTestWebhook}
      onDismissEvent={handleDismissEvent}
      onViewEventDetails={handleViewEventDetails}
      onNavigateToProject={handleNavigateToProject}
    />
  )
}
