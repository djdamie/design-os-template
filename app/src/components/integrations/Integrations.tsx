'use client'

import { Link2, ArrowLeft, Shield, User } from 'lucide-react'
import { ServiceCard } from './ServiceCard'
import { EventFeed } from './EventFeed'
import { WebhookConfigPanel } from './WebhookConfigPanel'
import { PendingRetryCard } from './PendingRetryCard'
import type { IntegrationsProps } from './types'

export function Integrations({
  currentUser,
  serviceConnections,
  integrationEvents,
  webhookConfigs,
  pendingRetries,
  onSyncProject,
  onRetry,
  onToggleWebhook,
  onUpdateWebhookConfig,
  onTestWebhook,
  onDismissEvent,
  onViewEventDetails,
  onNavigateToProject,
}: IntegrationsProps) {
  const isAdmin = currentUser.role === 'admin'
  const isSupervisor = currentUser.role === 'supervisor'

  // Filter services based on user role
  const visibleServices = serviceConnections.filter(
    (service) => isAdmin || isSupervisor || service.visibleToUsers
  )

  // Filter events for non-admins (hide Supabase events)
  const visibleEvents = integrationEvents.filter(
    (event) => isAdmin || isSupervisor || event.serviceName !== 'Supabase'
  )

  return (
    <div className="min-h-screen bg-zinc-100 dark:bg-zinc-950">
      {/* Header */}
      <header className="bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => window.history.back()}
                className="p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 dark:text-zinc-400 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-sky-500 to-sky-600 flex items-center justify-center">
                  <Link2 className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                    Integrations
                  </h1>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">
                    Connected services and sync status
                  </p>
                </div>
              </div>
            </div>

            {/* User role badge */}
            <div className="flex items-center gap-2">
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full ${
                  isAdmin
                    ? 'bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-300'
                    : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
                }`}
              >
                {isAdmin ? <Shield className="w-3 h-3" /> : <User className="w-3 h-3" />}
                {isAdmin ? 'Admin View' : 'User View'}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        {/* Pending retries (if any) */}
        {pendingRetries.length > 0 && (
          <section>
            <h2 className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-3">
              Action Required
            </h2>
            <div className="space-y-2">
              {pendingRetries.map((retry) => (
                <PendingRetryCard
                  key={retry.id}
                  retry={retry}
                  onRetry={() => onRetry?.(retry.id)}
                  onNavigateToProject={() =>
                    retry.projectId && onNavigateToProject?.(retry.projectId)
                  }
                />
              ))}
            </div>
          </section>
        )}

        {/* Services grid */}
        <section>
          <h2 className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-3">
            Connected Services
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {visibleServices.map((service) => (
              <ServiceCard
                key={service.id}
                service={service}
                isAdmin={isAdmin}
                onSync={() => onSyncProject?.('current', service.id)}
              />
            ))}
          </div>
        </section>

        {/* Two-column layout for activity and config */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Activity feed */}
          <section>
            <EventFeed
              events={visibleEvents}
              isAdmin={isAdmin || isSupervisor}
              onViewDetails={onViewEventDetails}
              onDismiss={onDismissEvent}
              onNavigateToProject={onNavigateToProject}
            />
          </section>

          {/* Admin-only: Webhook configuration */}
          {isAdmin && (
            <section>
              <WebhookConfigPanel
                webhooks={webhookConfigs}
                onToggle={onToggleWebhook}
                onTest={onTestWebhook}
                onUpdate={onUpdateWebhookConfig}
              />
            </section>
          )}
        </div>

        {/* Footer note for non-admins */}
        {!isAdmin && (
          <div className="text-center py-4">
            <p className="text-xs text-zinc-400 dark:text-zinc-500">
              Contact an administrator for webhook configuration or additional access.
            </p>
          </div>
        )}
      </main>
    </div>
  )
}
