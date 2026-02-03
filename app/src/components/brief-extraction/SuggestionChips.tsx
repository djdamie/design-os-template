'use client'

import { Sparkles } from 'lucide-react'
import type { SuggestionChip, SuggestionChipsProps } from './types'

const priorityStyles = {
  critical: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800',
  important: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800',
  helpful: 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700',
}

export function SuggestionChips({ chips, onChipClick }: SuggestionChipsProps) {
  if (chips.length === 0) return null

  return (
    <div className="py-3">
      <div className="flex items-center gap-2 mb-2">
        <Sparkles className="h-3.5 w-3.5 text-sky-500" />
        <span className="text-xs text-zinc-500 dark:text-zinc-400 font-['DM_Sans']">
          Suggested questions
        </span>
      </div>
      <div className="flex flex-wrap gap-2">
        {chips.map((chip) => (
          <button
            key={chip.id}
            onClick={() => onChipClick?.(chip.id, chip.label)}
            className={`
              inline-flex items-center rounded-full px-3 py-1.5 text-xs font-medium
              border transition-all duration-150
              hover:scale-[1.02] active:scale-[0.98]
              font-['DM_Sans']
              ${priorityStyles[chip.priority]}
            `}
          >
            {chip.label}
          </button>
        ))}
      </div>
    </div>
  )
}
