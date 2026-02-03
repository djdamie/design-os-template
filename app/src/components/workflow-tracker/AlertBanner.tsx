'use client'

import { AlertTriangle, Clock, AlertCircle, XCircle, X } from 'lucide-react'
import type { AlertBannerProps, AlertType, AlertSeverity } from './types'

const alertStyles: Record<AlertType, { icon: React.ReactNode; bg: string; text: string; border: string }> = {
  blocked: {
    icon: <AlertTriangle className="w-4 h-4" />,
    bg: 'bg-amber-50 dark:bg-amber-950/30',
    text: 'text-amber-800 dark:text-amber-200',
    border: 'border-amber-200 dark:border-amber-800',
  },
  overdue: {
    icon: <XCircle className="w-4 h-4" />,
    bg: 'bg-red-50 dark:bg-red-950/30',
    text: 'text-red-800 dark:text-red-200',
    border: 'border-red-200 dark:border-red-800',
  },
  approaching: {
    icon: <Clock className="w-4 h-4" />,
    bg: 'bg-sky-50 dark:bg-sky-950/30',
    text: 'text-sky-800 dark:text-sky-200',
    border: 'border-sky-200 dark:border-sky-800',
  },
  system_failure: {
    icon: <AlertCircle className="w-4 h-4" />,
    bg: 'bg-zinc-50 dark:bg-zinc-800/50',
    text: 'text-zinc-700 dark:text-zinc-300',
    border: 'border-zinc-200 dark:border-zinc-700',
  },
  in_progress_long: {
    icon: <Clock className="w-4 h-4" />,
    bg: 'bg-violet-50 dark:bg-violet-950/30',
    text: 'text-violet-800 dark:text-violet-200',
    border: 'border-violet-200 dark:border-violet-800',
  },
}

const severityOrder: Record<AlertSeverity, number> = {
  high: 0,
  medium: 1,
  low: 2,
}

export function AlertBanner({ alerts, onDismiss }: AlertBannerProps) {
  if (alerts.length === 0) return null

  // Sort by severity (high first)
  const sortedAlerts = [...alerts].sort(
    (a, b) => severityOrder[a.severity] - severityOrder[b.severity]
  )

  // High severity alerts get expanded view
  const highAlerts = sortedAlerts.filter((a) => a.severity === 'high')
  const otherAlerts = sortedAlerts.filter((a) => a.severity !== 'high')

  return (
    <div className="space-y-2">
      {/* High severity alerts - expanded */}
      {highAlerts.map((alert) => {
        const style = alertStyles[alert.type]
        return (
          <div
            key={alert.id}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg border ${style.bg} ${style.border}`}
          >
            <span className={style.text}>{style.icon}</span>
            <span className={`flex-1 text-sm font-medium ${style.text}`}>
              {alert.message}
            </span>
            <button
              onClick={() => onDismiss?.(alert.id)}
              className={`p-1 rounded hover:bg-black/5 dark:hover:bg-white/10 ${style.text}`}
              aria-label="Dismiss alert"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )
      })}

      {/* Other alerts - compact pills */}
      {otherAlerts.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {otherAlerts.map((alert) => {
            const style = alertStyles[alert.type]
            return (
              <div
                key={alert.id}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full border ${style.bg} ${style.border}`}
              >
                <span className={`text-xs ${style.text}`}>{style.icon}</span>
                <span className={`text-xs font-medium ${style.text}`}>
                  {alert.message}
                </span>
                <button
                  onClick={() => onDismiss?.(alert.id)}
                  className={`p-0.5 rounded-full hover:bg-black/5 dark:hover:bg-white/10 ${style.text}`}
                  aria-label="Dismiss alert"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
