'use client'

import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Integrations } from '@/components/integrations'
import type {
  CurrentUser,
  ServiceConnection,
  IntegrationEvent,
  WebhookConfig,
  PendingRetry,
} from '@/components/integrations/types'

export default function IntegrationsPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null)
  const [serviceConnections, setServiceConnections] = useState<ServiceConnection[]>([])
  const [integrationEvents, setIntegrationEvents] = useState<IntegrationEvent[]>([])
  const [webhookConfigs, setWebhookConfigs] = useState<WebhookConfig[]>([])
  const [pendingRetries, setPendingRetries] = useState<PendingRetry[]>([])

  const loadIntegrations = useCallback(async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/integrations')
      if (!response.ok) {
        throw new Error('Failed to load integrations')
      }

      const data = await response.json()
      setCurrentUser(data.currentUser as CurrentUser)
      setServiceConnections(data.serviceConnections as ServiceConnection[])
      setIntegrationEvents(data.integrationEvents as IntegrationEvent[])
      setWebhookConfigs(data.webhookConfigs as WebhookConfig[])
      setPendingRetries(data.pendingRetries as PendingRetry[])
    } catch (error) {
      console.error('Failed to load integrations:', error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadIntegrations()
  }, [loadIntegrations])

  const postIntegrationAction = useCallback(async (payload: Record<string, unknown>) => {
    const response = await fetch('/api/integrations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    if (!response.ok) {
      const error = await response.json().catch(() => ({}))
      throw new Error((error as { error?: string }).error || 'Integration action failed')
    }
    return response.json()
  }, [])

  const handleSyncProject = useCallback(async (projectId: string, serviceId: string) => {
    try {
      await postIntegrationAction({
        action: 'sync_service',
        projectId,
        serviceId,
      })
      await loadIntegrations()
    } catch (error) {
      console.error('Sync failed:', error)
    }
  }, [loadIntegrations, postIntegrationAction])

  const handleRetry = useCallback(async (retryId: string) => {
    const retry = pendingRetries.find((item) => item.id === retryId)
    if (!retry) return
    try {
      await postIntegrationAction({
        action: 'retry_event',
        eventId: retry.eventId,
      })
      await loadIntegrations()
    } catch (error) {
      console.error('Retry failed:', error)
    }
  }, [loadIntegrations, pendingRetries, postIntegrationAction])

  const handleToggleWebhook = useCallback(async (webhookId: string, enabled: boolean) => {
    try {
      await postIntegrationAction({
        action: 'toggle_webhook',
        webhookId,
        enabled,
      })
      await loadIntegrations()
    } catch (error) {
      console.error('Toggle webhook failed:', error)
    }
  }, [loadIntegrations, postIntegrationAction])

  const handleUpdateWebhookConfig = useCallback(
    async (webhookId: string, config: Partial<WebhookConfig>) => {
      try {
        await postIntegrationAction({
          action: 'update_webhook',
          webhookId,
          config,
        })
        await loadIntegrations()
      } catch (error) {
        console.error('Update webhook failed:', error)
      }
    },
    [loadIntegrations, postIntegrationAction]
  )

  const handleTestWebhook = useCallback(async (webhookId: string) => {
    const webhook = webhookConfigs.find((item) => item.id === webhookId)
    if (!webhook) return
    try {
      await postIntegrationAction({
        action: 'test_webhook',
        webhookId,
        serviceId: webhook.serviceId,
      })
      await loadIntegrations()
    } catch (error) {
      console.error('Test webhook failed:', error)
    }
  }, [loadIntegrations, postIntegrationAction, webhookConfigs])

  const handleDismissEvent = useCallback(async (eventId: string) => {
    setIntegrationEvents((prev) => prev.filter((event) => event.id !== eventId))
    try {
      await postIntegrationAction({
        action: 'dismiss_event',
        eventId,
      })
    } catch (error) {
      console.error('Dismiss event failed:', error)
    }
  }, [postIntegrationAction])

  const handleViewEventDetails = useCallback((eventId: string) => {
    const event = integrationEvents.find((item) => item.id === eventId)
    if (event) {
      console.log('Integration event:', event)
    }
  }, [integrationEvents])

  const handleNavigateToProject = useCallback((projectId: string) => {
    router.push(`/projects/${projectId}`)
  }, [router])

  if (isLoading || !currentUser) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-stone-950">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-fuchsia-500 mx-auto mb-4" />
          <p className="text-stone-400">Loading integrations...</p>
        </div>
      </div>
    )
  }

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
