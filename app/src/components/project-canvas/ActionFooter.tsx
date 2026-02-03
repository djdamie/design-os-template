'use client'

import { Save, MessageSquare, FolderOpen, Check } from 'lucide-react'
import type { ActionFooterProps } from './types'

export function ActionFooter({
  hasUnsavedChanges,
  integrationStatus,
  onSave,
  onCreateSlack,
  onCreateNextcloud,
}: ActionFooterProps) {
  return (
    <div className="border-t border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 px-4 py-3">
      <div className="flex items-center justify-between">
        {/* Left: Integration buttons */}
        <div className="flex items-center gap-2">
          {/* Slack button */}
          <button
            onClick={onCreateSlack}
            disabled={integrationStatus.slack.connected}
            aria-label={integrationStatus.slack.connected ? 'Slack Connected' : 'Create Slack Channel'}
            className={`
              inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all
              font-['DM_Sans']
              ${
                integrationStatus.slack.connected
                  ? 'bg-lime-100 dark:bg-lime-900/30 text-lime-700 dark:text-lime-400 cursor-default'
                  : 'bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600'
              }
            `}
          >
            {integrationStatus.slack.connected ? (
              <>
                <Check className="h-4 w-4" />
                <span>Slack Connected</span>
              </>
            ) : (
              <>
                <MessageSquare className="h-4 w-4" />
                <span>Create Slack Channel</span>
              </>
            )}
          </button>

          {/* Nextcloud button */}
          <button
            onClick={onCreateNextcloud}
            disabled={integrationStatus.nextcloud.connected}
            aria-label={integrationStatus.nextcloud.connected ? 'Nextcloud Connected' : 'Create Nextcloud Folder'}
            className={`
              inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all
              font-['DM_Sans']
              ${
                integrationStatus.nextcloud.connected
                  ? 'bg-lime-100 dark:bg-lime-900/30 text-lime-700 dark:text-lime-400 cursor-default'
                  : 'bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600'
              }
            `}
          >
            {integrationStatus.nextcloud.connected ? (
              <>
                <Check className="h-4 w-4" />
                <span>Nextcloud Connected</span>
              </>
            ) : (
              <>
                <FolderOpen className="h-4 w-4" />
                <span>Create Nextcloud Folder</span>
              </>
            )}
          </button>
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
            disabled={!hasUnsavedChanges}
            aria-label="Save Changes"
            className={`
              inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all
              font-['DM_Sans']
              ${
                hasUnsavedChanges
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
