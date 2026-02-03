'use client'

import { useState } from 'react'
import {
  Settings,
  Play,
  Pause,
  ExternalLink,
  CheckCircle2,
  Copy,
  Eye,
  EyeOff,
} from 'lucide-react'
import type { WebhookConfigPanelProps, WebhookConfig } from './types'

export function WebhookConfigPanel({
  webhooks,
  onToggle,
  onTest,
  onUpdate,
}: WebhookConfigPanelProps) {
  const [showUrls, setShowUrls] = useState<Record<string, boolean>>({})
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const toggleUrlVisibility = (id: string) => {
    setShowUrls((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  const copyUrl = async (id: string, url: string) => {
    await navigator.clipboard.writeText(url)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const formatTime = (isoString: string) => {
    const date = new Date(isoString)
    return date.toLocaleString([], {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const maskUrl = (url: string) => {
    const parts = url.split('/')
    if (parts.length > 4) {
      return `${parts.slice(0, 3).join('/')}/*****/${parts[parts.length - 1]}`
    }
    return '••••••••••••••••'
  }

  return (
    <div className="bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-zinc-100 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 flex items-center gap-2">
        <Settings className="w-4 h-4 text-zinc-500 dark:text-zinc-400" />
        <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Webhook Configuration</h3>
        <span className="ml-auto text-xs text-zinc-500 dark:text-zinc-400">Admin only</span>
      </div>

      {/* Webhook list */}
      <div className="divide-y divide-zinc-100 dark:divide-zinc-700/50">
        {webhooks.map((webhook) => (
          <div key={webhook.id} className="p-4 space-y-3">
            {/* Header row */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => onToggle?.(webhook.id, !webhook.enabled)}
                  className={`
                    w-8 h-8 rounded-lg flex items-center justify-center transition-colors
                    ${webhook.enabled
                      ? 'bg-lime-100 dark:bg-lime-900/40 text-lime-700 dark:text-lime-300'
                      : 'bg-zinc-100 dark:bg-zinc-700 text-zinc-400 dark:text-zinc-500'
                    }
                  `}
                >
                  {webhook.enabled ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
                </button>
                <div>
                  <h4 className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                    {webhook.name}
                  </h4>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    {webhook.workflowName}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span
                  className={`px-2 py-0.5 text-xs font-medium rounded ${
                    webhook.enabled
                      ? 'bg-lime-100 dark:bg-lime-900/30 text-lime-700 dark:text-lime-300'
                      : 'bg-zinc-100 dark:bg-zinc-700 text-zinc-500 dark:text-zinc-400'
                  }`}
                >
                  {webhook.enabled ? 'Active' : 'Disabled'}
                </span>
                <button
                  onClick={() => onTest?.(webhook.id)}
                  disabled={!webhook.enabled}
                  className="px-3 py-1 text-xs font-medium text-sky-700 dark:text-sky-300 hover:bg-sky-100 dark:hover:bg-sky-900/30 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Test
                </button>
              </div>
            </div>

            {/* URL row */}
            <div className="flex items-center gap-2 p-2 bg-zinc-50 dark:bg-zinc-900/50 rounded-lg">
              <span className="px-1.5 py-0.5 text-[10px] font-mono font-medium bg-sky-100 dark:bg-sky-900/40 text-sky-700 dark:text-sky-300 rounded">
                {webhook.method}
              </span>
              <code className="flex-1 text-xs font-mono text-zinc-600 dark:text-zinc-400 truncate">
                {showUrls[webhook.id] ? webhook.webhookUrl : maskUrl(webhook.webhookUrl)}
              </code>
              <button
                onClick={() => toggleUrlVisibility(webhook.id)}
                className="p-1 rounded hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-400"
              >
                {showUrls[webhook.id] ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
              <button
                onClick={() => copyUrl(webhook.id, webhook.webhookUrl)}
                className="p-1 rounded hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-400"
              >
                {copiedId === webhook.id ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-lime-500" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>
            </div>

            {/* Stats row */}
            <div className="flex items-center gap-4 text-xs text-zinc-500 dark:text-zinc-400">
              <span>
                <span className="font-medium text-zinc-700 dark:text-zinc-300">{webhook.totalExecutions}</span> executions
              </span>
              <span>
                <span className="font-medium text-zinc-700 dark:text-zinc-300">{webhook.successRate}%</span> success
              </span>
              <span className="ml-auto">
                Last: {formatTime(webhook.lastTriggered)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
