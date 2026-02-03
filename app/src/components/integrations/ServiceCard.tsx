'use client'

import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Cloud,
  HardDrive,
  Database,
  MessageSquare,
} from 'lucide-react'
import type { ServiceCardProps, ServiceHealth, ServiceStatus } from './types'

const iconMap = {
  slack: MessageSquare,
  cloud: Cloud,
  'hard-drive': HardDrive,
  database: Database,
}

const statusConfig: Record<ServiceStatus, { icon: React.ReactNode; label: string; color: string }> = {
  connected: {
    icon: <CheckCircle2 className="w-4 h-4" />,
    label: 'Connected',
    color: 'text-lime-600 dark:text-lime-400',
  },
  disconnected: {
    icon: <XCircle className="w-4 h-4" />,
    label: 'Disconnected',
    color: 'text-zinc-400 dark:text-zinc-500',
  },
  error: {
    icon: <AlertTriangle className="w-4 h-4" />,
    label: 'Error',
    color: 'text-red-600 dark:text-red-400',
  },
}

const healthConfig: Record<ServiceHealth, { bg: string; pulse: boolean }> = {
  healthy: { bg: 'bg-lime-500', pulse: false },
  degraded: { bg: 'bg-amber-500', pulse: true },
  unhealthy: { bg: 'bg-red-500', pulse: true },
}

export function ServiceCard({ service, isAdmin = false, onSync }: ServiceCardProps) {
  const IconComponent = iconMap[service.icon]
  const status = statusConfig[service.status]
  const health = healthConfig[service.health]

  const formatTime = (isoString: string) => {
    const date = new Date(isoString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`
    return date.toLocaleDateString()
  }

  // Build stats display based on available fields
  const statsDisplay = []
  if (service.stats.channelsCreated) statsDisplay.push(`${service.stats.channelsCreated} channels`)
  if (service.stats.foldersCreated) statsDisplay.push(`${service.stats.foldersCreated} folders`)
  if (service.stats.documentsUploaded) statsDisplay.push(`${service.stats.documentsUploaded} docs`)
  if (service.stats.casesStored) statsDisplay.push(`${service.stats.casesStored} cases`)
  if (service.stats.storageUsed) statsDisplay.push(service.stats.storageUsed)

  return (
    <div className="bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 overflow-hidden hover:border-zinc-300 dark:hover:border-zinc-600 transition-colors">
      {/* Header */}
      <div className="px-4 py-3 border-b border-zinc-100 dark:border-zinc-700/50 flex items-center gap-3">
        {/* Service icon */}
        <div className="w-10 h-10 rounded-lg bg-zinc-100 dark:bg-zinc-700 flex items-center justify-center">
          <IconComponent className="w-5 h-5 text-zinc-600 dark:text-zinc-300" />
        </div>

        {/* Service name and description */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              {service.name}
            </h3>
            {/* Health indicator dot */}
            <span
              className={`w-2 h-2 rounded-full ${health.bg} ${health.pulse ? 'animate-pulse' : ''}`}
            />
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate">
            {service.description}
          </p>
        </div>

        {/* Status badge */}
        <div className={`flex items-center gap-1.5 ${status.color}`}>
          {status.icon}
          <span className="text-xs font-medium">{status.label}</span>
        </div>
      </div>

      {/* Body */}
      <div className="px-4 py-3 space-y-3">
        {/* Last sync */}
        <div className="flex items-center justify-between text-xs">
          <span className="text-zinc-500 dark:text-zinc-400">Last sync</span>
          <span className="text-zinc-700 dark:text-zinc-300 font-medium">
            {formatTime(service.lastSyncAt)}
          </span>
        </div>

        {/* Stats */}
        {statsDisplay.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {statsDisplay.map((stat, idx) => (
              <span
                key={idx}
                className="px-2 py-0.5 text-[10px] font-medium bg-zinc-100 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-400 rounded"
              >
                {stat}
              </span>
            ))}
          </div>
        )}

        {/* Error message (user-friendly) */}
        {service.error && (
          <div className="p-2 bg-amber-50 dark:bg-amber-950/30 rounded-lg border border-amber-200 dark:border-amber-800">
            <p className="text-xs text-amber-700 dark:text-amber-300">
              {isAdmin ? service.error : 'Some items failed to sync. Retry to resolve.'}
            </p>
          </div>
        )}
      </div>

      {/* Footer with action */}
      {service.name === 'Nextcloud' && (
        <div className="px-4 py-2 border-t border-zinc-100 dark:border-zinc-700/50 bg-zinc-50 dark:bg-zinc-800/50">
          <button
            onClick={onSync}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-sky-700 dark:text-sky-300 hover:bg-sky-100 dark:hover:bg-sky-900/30 rounded transition-colors"
          >
            <RefreshCw className="w-3 h-3" />
            Sync Now
          </button>
        </div>
      )}
    </div>
  )
}
