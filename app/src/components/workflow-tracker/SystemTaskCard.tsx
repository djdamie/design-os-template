'use client'

import { useState } from 'react'
import {
  CheckCircle2,
  XCircle,
  Loader2,
  Clock,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Hash,
  Folder,
} from 'lucide-react'
import type { SystemTaskCardProps, SystemTaskStatus } from './types'

const statusStyles: Record<SystemTaskStatus, { icon: React.ReactNode; bg: string; text: string; label: string }> = {
  queued: {
    icon: <Clock className="w-3 h-3" />,
    bg: 'bg-zinc-100 dark:bg-zinc-800',
    text: 'text-zinc-600 dark:text-zinc-400',
    label: 'Queued',
  },
  running: {
    icon: <Loader2 className="w-3 h-3 animate-spin" />,
    bg: 'bg-sky-100 dark:bg-sky-900/40',
    text: 'text-sky-700 dark:text-sky-300',
    label: 'Running',
  },
  success: {
    icon: <CheckCircle2 className="w-3 h-3" />,
    bg: 'bg-lime-100 dark:bg-lime-900/40',
    text: 'text-lime-700 dark:text-lime-300',
    label: 'Success',
  },
  failed: {
    icon: <XCircle className="w-3 h-3" />,
    bg: 'bg-red-100 dark:bg-red-900/40',
    text: 'text-red-700 dark:text-red-300',
    label: 'Failed',
  },
  retrying: {
    icon: <RefreshCw className="w-3 h-3 animate-spin" />,
    bg: 'bg-amber-100 dark:bg-amber-900/40',
    text: 'text-amber-700 dark:text-amber-300',
    label: 'Retrying',
  },
  skipped: {
    icon: <Clock className="w-3 h-3" />,
    bg: 'bg-zinc-100 dark:bg-zinc-800',
    text: 'text-zinc-500 dark:text-zinc-500',
    label: 'Skipped',
  },
}

export function SystemTaskCard({ task, onRetry }: SystemTaskCardProps) {
  // Auto-expand failed tasks
  const [isExpanded, setIsExpanded] = useState(task.status === 'failed')

  const style = statusStyles[task.status]
  const hasOutputs = task.outputs && Object.keys(task.outputs).length > 0
  const canRetry = task.status === 'failed' && (!task.maxRetries || (task.retryCount || 0) < task.maxRetries)

  return (
    <div className="rounded-lg border border-zinc-200 dark:border-zinc-700 overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center gap-2 px-3 py-2 bg-white dark:bg-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-700/50 transition-colors"
      >
        {/* Generative UI indicator */}
        <div className="w-5 h-5 rounded bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center flex-shrink-0">
          <span className="text-[8px] text-white font-bold">AI</span>
        </div>

        {/* Task name */}
        <span className="flex-1 text-left text-xs font-medium text-zinc-900 dark:text-zinc-100 truncate">
          {task.name}
        </span>

        {/* Status badge */}
        <span className={`flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-semibold rounded ${style.bg} ${style.text}`}>
          {style.icon}
          {style.label}
        </span>

        {/* Expand icon */}
        <span className="text-zinc-400">
          {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        </span>
      </button>

      {/* Expanded content */}
      {isExpanded && (
        <div className="px-3 py-2 border-t border-zinc-100 dark:border-zinc-700/50 bg-zinc-50 dark:bg-zinc-800/50 space-y-2">
          {/* Description */}
          <p className="text-xs text-zinc-600 dark:text-zinc-400">{task.description}</p>

          {/* Workflow name */}
          <div className="text-xs text-zinc-500 dark:text-zinc-500">
            Workflow: <span className="font-mono">{task.n8nWorkflow}</span>
          </div>

          {/* Timestamps */}
          <div className="flex gap-4 text-xs text-zinc-500 dark:text-zinc-400">
            {task.triggeredAt && (
              <span>Started: {new Date(task.triggeredAt).toLocaleTimeString()}</span>
            )}
            {task.executionTime && <span>Duration: {task.executionTime}</span>}
          </div>

          {/* Outputs */}
          {hasOutputs && (
            <div className="space-y-1">
              <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Outputs:</span>
              <div className="flex flex-wrap gap-2">
                {task.outputs?.slackChannel && (
                  <span className="flex items-center gap-1 px-2 py-1 text-xs bg-white dark:bg-zinc-800 rounded border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300">
                    <Hash className="w-3 h-3" />
                    {task.outputs.slackChannel}
                  </span>
                )}
                {task.outputs?.nextcloudFolder && (
                  <span className="flex items-center gap-1 px-2 py-1 text-xs bg-white dark:bg-zinc-800 rounded border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 max-w-[200px] truncate">
                    <Folder className="w-3 h-3 flex-shrink-0" />
                    <span className="truncate">{task.outputs.nextcloudFolder}</span>
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Error message */}
          {task.error && (
            <div className="p-2 bg-red-50 dark:bg-red-950/30 rounded border border-red-200 dark:border-red-800 text-xs text-red-700 dark:text-red-300">
              {task.error}
              {task.retryCount !== undefined && task.maxRetries && (
                <span className="ml-2 text-red-500 dark:text-red-400">
                  ({task.retryCount}/{task.maxRetries} retries)
                </span>
              )}
            </div>
          )}

          {/* Retry button */}
          {canRetry && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                onRetry?.()
              }}
              className="flex items-center gap-1 px-2 py-1 text-xs font-medium bg-sky-100 dark:bg-sky-900/40 text-sky-700 dark:text-sky-300 rounded hover:bg-sky-200 dark:hover:bg-sky-900/60"
            >
              <RefreshCw className="w-3 h-3" />
              Retry
            </button>
          )}
        </div>
      )}
    </div>
  )
}
