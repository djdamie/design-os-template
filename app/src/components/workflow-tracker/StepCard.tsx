'use client'

import { useState } from 'react'
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  Play,
  MessageSquare,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'
import type { StepCardProps } from './types'
import { roleColors } from './types'

export function StepCard({
  step,
  ownerName,
  onComplete,
  onBlock,
  onAddNote,
  onStart,
}: StepCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [noteText, setNoteText] = useState('')
  const [blockReason, setBlockReason] = useState('')
  const [showBlockInput, setShowBlockInput] = useState(false)

  const roleStyle = roleColors[step.assignedRole] || roleColors.MGMT

  const handleComplete = () => {
    onComplete?.(noteText || undefined)
    setNoteText('')
  }

  const handleBlock = () => {
    if (blockReason.trim()) {
      onBlock?.(blockReason)
      setBlockReason('')
      setShowBlockInput(false)
    }
  }

  const handleAddNote = () => {
    if (noteText.trim()) {
      onAddNote?.(noteText)
      setNoteText('')
    }
  }

  return (
    <div
      className={`
        group rounded-lg border transition-all duration-200
        ${step.status === 'completed'
          ? 'bg-zinc-50 dark:bg-zinc-800/30 border-zinc-200 dark:border-zinc-700 opacity-75'
          : step.status === 'blocked'
            ? 'bg-amber-50 dark:bg-amber-950/20 border-amber-300 dark:border-amber-700'
            : step.status === 'in_progress'
              ? 'bg-sky-50 dark:bg-sky-950/20 border-sky-300 dark:border-sky-700 ring-2 ring-sky-200 dark:ring-sky-800'
              : 'bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600'
        }
      `}
    >
      {/* Main card content */}
      <div className="p-3">
        {/* Top row: sequence + name + expand */}
        <div className="flex items-start gap-2">
          <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full bg-zinc-200 dark:bg-zinc-700 text-xs font-mono font-medium text-zinc-600 dark:text-zinc-400">
            {step.sequenceNumber}
          </span>
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-medium text-zinc-900 dark:text-zinc-100 leading-tight">
              {step.name}
            </h4>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 line-clamp-1">
              {step.description}
            </p>
          </div>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex-shrink-0 p-1 rounded hover:bg-zinc-100 dark:hover:bg-zinc-700 text-zinc-400"
            aria-label={isExpanded ? 'Collapse' : 'Expand'}
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>

        {/* Meta row: role badge + duration + notes indicator */}
        <div className="flex items-center gap-2 mt-2">
          <span className={`px-1.5 py-0.5 text-[10px] font-semibold rounded ${roleStyle.bg} ${roleStyle.text}`}>
            {step.assignedRole}
          </span>
          {ownerName && (
            <span className="text-xs text-zinc-500 dark:text-zinc-400 truncate">
              {ownerName}
            </span>
          )}
          <span className="flex items-center gap-1 text-xs text-zinc-400 dark:text-zinc-500 ml-auto">
            <Clock className="w-3 h-3" />
            {step.actualDuration || step.estimatedDuration}
          </span>
          {step.notes && (
            <span className="text-zinc-400">
              <MessageSquare className="w-3 h-3" />
            </span>
          )}
        </div>

        {/* Blocked reason (always visible if blocked) */}
        {step.status === 'blocked' && step.blockedReason && (
          <div className="mt-2 p-2 bg-amber-100 dark:bg-amber-900/30 rounded text-xs text-amber-800 dark:text-amber-200">
            <span className="font-medium">Blocked:</span> {step.blockedReason}
          </div>
        )}
      </div>

      {/* Expanded section */}
      {isExpanded && (
        <div className="px-3 pb-3 border-t border-zinc-100 dark:border-zinc-700/50 pt-3 space-y-3">
          {/* Notes display */}
          {step.notes && (
            <div className="text-xs text-zinc-600 dark:text-zinc-300 bg-zinc-50 dark:bg-zinc-800 rounded p-2">
              <span className="font-medium text-zinc-500 dark:text-zinc-400">Notes:</span> {step.notes}
            </div>
          )}

          {/* Timestamps */}
          <div className="flex gap-4 text-xs text-zinc-500 dark:text-zinc-400">
            {step.startedAt && (
              <span>Started: {new Date(step.startedAt).toLocaleDateString()}</span>
            )}
            {step.completedAt && (
              <span>Completed: {new Date(step.completedAt).toLocaleDateString()}</span>
            )}
            {step.dueDate && !step.completedAt && (
              <span className="text-amber-600 dark:text-amber-400">
                Due: {new Date(step.dueDate).toLocaleDateString()}
              </span>
            )}
          </div>

          {/* Actions */}
          {step.status !== 'completed' && (
            <div className="space-y-2">
              {/* Note input */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  placeholder="Add a note..."
                  className="flex-1 text-xs px-2 py-1.5 rounded border border-zinc-200 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400"
                />
                <button
                  onClick={handleAddNote}
                  disabled={!noteText.trim()}
                  className="px-2 py-1 text-xs font-medium text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded disabled:opacity-50"
                >
                  Add
                </button>
              </div>

              {/* Action buttons */}
              <div className="flex gap-2">
                {step.status === 'pending' && (
                  <button
                    onClick={() => onStart?.()}
                    className="flex items-center gap-1 px-2 py-1 text-xs font-medium bg-sky-100 dark:bg-sky-900/40 text-sky-700 dark:text-sky-300 rounded hover:bg-sky-200 dark:hover:bg-sky-900/60"
                  >
                    <Play className="w-3 h-3" />
                    Start
                  </button>
                )}

                {step.status === 'in_progress' && (
                  <button
                    onClick={handleComplete}
                    className="flex items-center gap-1 px-2 py-1 text-xs font-medium bg-lime-100 dark:bg-lime-900/40 text-lime-700 dark:text-lime-300 rounded hover:bg-lime-200 dark:hover:bg-lime-900/60"
                  >
                    <CheckCircle2 className="w-3 h-3" />
                    Complete
                  </button>
                )}

                {step.status !== 'blocked' && (
                  <>
                    {showBlockInput ? (
                      <div className="flex gap-1 flex-1">
                        <input
                          type="text"
                          value={blockReason}
                          onChange={(e) => setBlockReason(e.target.value)}
                          placeholder="Reason for blocking..."
                          className="flex-1 text-xs px-2 py-1 rounded border border-amber-300 dark:border-amber-600 bg-white dark:bg-zinc-800"
                          autoFocus
                        />
                        <button
                          onClick={handleBlock}
                          className="px-2 py-1 text-xs font-medium bg-amber-500 text-white rounded hover:bg-amber-600"
                        >
                          Block
                        </button>
                        <button
                          onClick={() => setShowBlockInput(false)}
                          className="px-2 py-1 text-xs text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setShowBlockInput(true)}
                        className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded"
                      >
                        <AlertTriangle className="w-3 h-3" />
                        Flag Blocked
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
