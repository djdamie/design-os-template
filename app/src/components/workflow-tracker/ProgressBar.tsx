'use client'

import { AlertCircle } from 'lucide-react'
import type { ProgressBarProps } from './types'

export function ProgressBar({ progress, template }: ProgressBarProps) {
  const { completedSteps, totalSteps, percentComplete, currentStep, blockedCount } = progress

  return (
    <div className="space-y-2">
      {/* Progress info row */}
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-zinc-900 dark:text-zinc-100">
            {percentComplete}%
          </span>
          <span className="text-zinc-500 dark:text-zinc-400">
            ({completedSteps}/{totalSteps} steps)
          </span>
          {blockedCount > 0 && (
            <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
              <AlertCircle className="w-3.5 h-3.5" />
              {blockedCount} blocked
            </span>
          )}
        </div>
        <span className="text-zinc-500 dark:text-zinc-400">
          Current: <span className="text-zinc-700 dark:text-zinc-300">{currentStep}</span>
        </span>
      </div>

      {/* Progress bar */}
      <div className="relative h-2 bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden">
        <div
          className="absolute inset-y-0 left-0 bg-gradient-to-r from-sky-500 to-sky-400 rounded-full transition-all duration-500"
          style={{ width: `${percentComplete}%` }}
        >
          {/* Shimmer effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
        </div>
      </div>
    </div>
  )
}
