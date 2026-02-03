import { AlertTriangle, RefreshCw, ChevronRight } from 'lucide-react'
import type { PendingRetryCardProps } from './types'

export function PendingRetryCard({ retry, onRetry, onNavigateToProject }: PendingRetryCardProps) {
  const formatTime = (isoString: string) => {
    const date = new Date(isoString)
    return date.toLocaleString([], {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div className="bg-amber-50 dark:bg-amber-950/30 rounded-lg border border-amber-200 dark:border-amber-800 p-3">
      <div className="flex items-start gap-3">
        <span className="flex-shrink-0 p-1.5 bg-amber-100 dark:bg-amber-900/50 rounded text-amber-600 dark:text-amber-400">
          <AlertTriangle className="w-4 h-4" />
        </span>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-medium text-amber-600 dark:text-amber-400 uppercase">
              {retry.serviceName}
            </span>
            <span className="text-amber-400 dark:text-amber-600">·</span>
            <span className="text-xs text-amber-600/70 dark:text-amber-400/70">
              Failed {formatTime(retry.failedAt)}
            </span>
          </div>

          <p className="text-sm font-medium text-amber-800 dark:text-amber-200 mt-0.5">
            {retry.description}
          </p>

          {retry.projectName && (
            <button
              onClick={onNavigateToProject}
              className="inline-flex items-center gap-1 mt-1 text-xs text-amber-700 dark:text-amber-300 hover:underline"
            >
              {retry.projectName}
              <ChevronRight className="w-3 h-3" />
            </button>
          )}

          <div className="flex items-center gap-3 mt-2">
            <span className="text-xs text-amber-600/70 dark:text-amber-400/70">
              {retry.retryCount}/{retry.maxRetries} retries
            </span>

            {retry.canRetry && (
              <button
                onClick={onRetry}
                className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-amber-200 dark:bg-amber-800 text-amber-800 dark:text-amber-200 rounded hover:bg-amber-300 dark:hover:bg-amber-700 transition-colors"
              >
                <RefreshCw className="w-3 h-3" />
                Retry Now
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
