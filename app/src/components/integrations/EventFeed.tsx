'use client'

import {
  CheckCircle2,
  XCircle,
  Clock,
  MessageSquare,
  FolderPlus,
  FileUp,
  RefreshCw,
  Database,
  UserPlus,
  ChevronRight,
  X,
} from 'lucide-react'
import type { EventFeedProps, EventType, EventStatus } from './types'

const eventTypeConfig: Record<EventType, { icon: React.ReactNode; label: string }> = {
  channel_created: { icon: <MessageSquare className="w-3.5 h-3.5" />, label: 'Channel created' },
  folder_created: { icon: <FolderPlus className="w-3.5 h-3.5" />, label: 'Folder created' },
  document_uploaded: { icon: <FileUp className="w-3.5 h-3.5" />, label: 'Document uploaded' },
  brief_synced: { icon: <RefreshCw className="w-3.5 h-3.5" />, label: 'Brief synced' },
  message_posted: { icon: <MessageSquare className="w-3.5 h-3.5" />, label: 'Message posted' },
  webhook_executed: { icon: <RefreshCw className="w-3.5 h-3.5" />, label: 'Webhook executed' },
  webhook_failed: { icon: <XCircle className="w-3.5 h-3.5" />, label: 'Webhook failed' },
  webhook_retried: { icon: <RefreshCw className="w-3.5 h-3.5" />, label: 'Webhook retried' },
  case_created: { icon: <Database className="w-3.5 h-3.5" />, label: 'Case created' },
  user_invited: { icon: <UserPlus className="w-3.5 h-3.5" />, label: 'User invited' },
}

const statusConfig: Record<EventStatus, { icon: React.ReactNode; color: string }> = {
  success: { icon: <CheckCircle2 className="w-4 h-4" />, color: 'text-lime-600 dark:text-lime-400' },
  failed: { icon: <XCircle className="w-4 h-4" />, color: 'text-red-600 dark:text-red-400' },
  pending: { icon: <Clock className="w-4 h-4" />, color: 'text-amber-600 dark:text-amber-400' },
}

export function EventFeed({
  events,
  isAdmin = false,
  onViewDetails,
  onDismiss,
  onNavigateToProject,
}: EventFeedProps) {
  const formatTime = (isoString: string) => {
    const date = new Date(isoString)
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  const formatDate = (isoString: string) => {
    const date = new Date(isoString)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    if (date.toDateString() === today.toDateString()) return 'Today'
    if (date.toDateString() === yesterday.toDateString()) return 'Yesterday'
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' })
  }

  // Group events by date
  const groupedEvents = events.reduce(
    (groups, event) => {
      const dateKey = formatDate(event.timestamp)
      if (!groups[dateKey]) groups[dateKey] = []
      groups[dateKey].push(event)
      return groups
    },
    {} as Record<string, typeof events>
  )

  return (
    <div className="bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-zinc-100 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50">
        <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Recent Activity</h3>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">Integration events across all projects</p>
      </div>

      {/* Event list */}
      <div className="max-h-[400px] overflow-y-auto divide-y divide-zinc-100 dark:divide-zinc-700/50">
        {Object.entries(groupedEvents).map(([dateLabel, dateEvents]) => (
          <div key={dateLabel}>
            {/* Date header */}
            <div className="px-4 py-2 bg-zinc-50 dark:bg-zinc-800/30 sticky top-0">
              <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">{dateLabel}</span>
            </div>

            {/* Events for this date */}
            {dateEvents.map((event) => {
              const typeConfig = eventTypeConfig[event.eventType]
              const status = statusConfig[event.status]

              return (
                <div
                  key={event.id}
                  className="group px-4 py-3 hover:bg-zinc-50 dark:hover:bg-zinc-700/30 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    {/* Status icon */}
                    <span className={`flex-shrink-0 mt-0.5 ${status.color}`}>{status.icon}</span>

                    {/* Event content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-medium text-zinc-400 dark:text-zinc-500 uppercase">
                          {event.serviceName}
                        </span>
                        <span className="text-zinc-300 dark:text-zinc-600">·</span>
                        <span className="text-xs text-zinc-500 dark:text-zinc-400">
                          {formatTime(event.timestamp)}
                        </span>
                      </div>
                      <p className="text-sm text-zinc-700 dark:text-zinc-200 mt-0.5">
                        {event.message}
                      </p>

                      {/* Project link */}
                      {event.projectName && (
                        <button
                          onClick={() => event.projectId && onNavigateToProject?.(event.projectId)}
                          className="inline-flex items-center gap-1 mt-1 text-xs text-sky-600 dark:text-sky-400 hover:underline"
                        >
                          {event.projectName}
                          <ChevronRight className="w-3 h-3" />
                        </button>
                      )}

                      {/* Error details (admin only) */}
                      {event.details && isAdmin && (
                        <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-700/50 px-2 py-1 rounded">
                          {event.details}
                        </p>
                      )}

                      {/* User-friendly error (non-admin) */}
                      {event.status === 'failed' && !isAdmin && !event.details && (
                        <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                          Operation failed. Contact admin if this persists.
                        </p>
                      )}
                    </div>

                    {/* Dismiss button */}
                    <button
                      onClick={() => onDismiss?.(event.id)}
                      className="flex-shrink-0 p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-zinc-200 dark:hover:bg-zinc-600 transition-opacity"
                    >
                      <X className="w-3 h-3 text-zinc-400" />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        ))}

        {events.length === 0 && (
          <div className="px-4 py-8 text-center">
            <p className="text-sm text-zinc-500 dark:text-zinc-400">No recent events</p>
          </div>
        )}
      </div>
    </div>
  )
}
