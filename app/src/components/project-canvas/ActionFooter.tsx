'use client'

import { Save, Rocket, RefreshCw, Check, Loader2 } from 'lucide-react'
import type { ActionFooterProps } from './types'

export function ActionFooter({
  hasUnsavedChanges,
  integrationStatus,
  isLoading,
  onSave,
  onSetupIntegrations,
  onSyncBrief,
}: ActionFooterProps) {
  const allSetUp = integrationStatus.allSetUp ||
    (integrationStatus.slack.connected && integrationStatus.nextcloud.connected)

  // Format last sync time
  const formatLastSync = (timestamp: string | null) => {
    if (!timestamp) return null
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)

    if (diffMins < 1) return 'just now'
    if (diffMins < 60) return `${diffMins}m ago`
    const diffHours = Math.floor(diffMins / 60)
    if (diffHours < 24) return `${diffHours}h ago`
    return date.toLocaleDateString()
  }

  const lastSynced = integrationStatus.nextcloud.lastSyncedAt

  return (
    <div className="border-t border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 px-4 py-3">
      <div className="flex items-center justify-between">
        {/* Left: Integration buttons */}
        <div className="flex items-center gap-2">
          {!allSetUp ? (
            // Show "Setup Project" button when integrations are not set up
            <button
              onClick={onSetupIntegrations}
              disabled={isLoading}
              aria-label="Setup Project Integrations"
              className={`
                inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all
                font-['DM_Sans']
                ${
                  isLoading
                    ? 'bg-fuchsia-400 text-white cursor-wait'
                    : 'bg-fuchsia-500 text-white hover:bg-fuchsia-600 active:bg-fuchsia-700'
                }
              `}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Setting up...</span>
                </>
              ) : (
                <>
                  <Rocket className="h-4 w-4" />
                  <span>Setup Project</span>
                </>
              )}
            </button>
          ) : (
            // Show status badges and sync button when integrations are set up
            <>
              {/* Status badge: All Connected */}
              <div className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium bg-lime-100 dark:bg-lime-900/30 text-lime-700 dark:text-lime-400 font-['DM_Sans']">
                <Check className="h-4 w-4" />
                <span>Integrations Ready</span>
              </div>

              {/* Sync to Nextcloud button */}
              <button
                onClick={onSyncBrief}
                disabled={isLoading}
                aria-label="Sync Brief to Nextcloud"
                className={`
                  inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all
                  font-['DM_Sans']
                  ${
                    isLoading
                      ? 'bg-zinc-200 dark:bg-zinc-700 text-zinc-400 dark:text-zinc-500 cursor-wait'
                      : 'bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600'
                  }
                `}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Syncing...</span>
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4" />
                    <span>Sync to Nextcloud</span>
                  </>
                )}
              </button>

              {/* Last synced timestamp */}
              {lastSynced && (
                <span className="text-xs text-zinc-500 dark:text-zinc-400 font-['DM_Sans']">
                  Synced {formatLastSync(lastSynced)}
                </span>
              )}
            </>
          )}
        </div>

        {/* Right: Save button */}
        <div className="flex items-center gap-3">
          {hasUnsavedChanges && (
            <span className="text-xs text-amber-600 dark:text-amber-400 font-['DM_Sans']">
              Unsaved changes
            </span>
          )}
          <button
            onClick={onSave}
            disabled={!hasUnsavedChanges || isLoading}
            aria-label="Save Changes"
            className={`
              inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all
              font-['DM_Sans']
              ${
                hasUnsavedChanges && !isLoading
                  ? 'bg-sky-500 text-white hover:bg-sky-600 active:bg-sky-700'
                  : 'bg-zinc-200 dark:bg-zinc-700 text-zinc-400 dark:text-zinc-500 cursor-not-allowed'
              }
            `}
          >
            <Save className="h-4 w-4" />
            <span>Save Changes</span>
          </button>
        </div>
      </div>
    </div>
  )
}
