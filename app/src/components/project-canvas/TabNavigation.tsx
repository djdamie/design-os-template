'use client'

import type { TabNavigationProps } from './types'

export function TabNavigation({ tabs, activeTab, onTabChange }: TabNavigationProps) {
  return (
    <div className="border-b border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50">
      <nav className="flex px-2" role="tablist" aria-label="Canvas tabs">
        {tabs.map((tab) => {
          const isActive = tab.id === activeTab
          const hasMissing = tab.missingCritical > 0 || tab.missingImportant > 0

          return (
            <button
              key={tab.id}
              role="tab"
              aria-selected={isActive}
              aria-controls={`panel-${tab.id}`}
              onClick={() => onTabChange?.(tab.id)}
              className={`
                relative px-4 py-3 text-sm font-medium transition-all duration-150
                font-['DM_Sans']
                ${
                  isActive
                    ? 'text-sky-600 dark:text-sky-400'
                    : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300'
                }
              `}
            >
              <span className="flex items-center gap-2">
                {tab.label}
                {hasMissing && (
                  <span
                    className={`
                      flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-semibold
                      ${
                        tab.missingCritical > 0
                          ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                          : 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400'
                      }
                    `}
                  >
                    {tab.missingCritical + tab.missingImportant}
                  </span>
                )}
              </span>

              {/* Active indicator */}
              {isActive && (
                <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-sky-500 rounded-full" />
              )}
            </button>
          )
        })}
      </nav>
    </div>
  )
}
