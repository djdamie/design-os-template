'use client'

import { Play, Clock, AlertTriangle, CheckCircle2 } from 'lucide-react'
import { StepCard } from './StepCard'
import type { KanbanColumnProps, WorkflowStepStatus } from './types'

const columnStyles: Record<WorkflowStepStatus, { icon: React.ReactNode; textColor: string; bgColor: string }> = {
  in_progress: {
    icon: <Play className="w-4 h-4" />,
    textColor: 'text-sky-600 dark:text-sky-400',
    bgColor: 'bg-sky-500',
  },
  pending: {
    icon: <Clock className="w-4 h-4" />,
    textColor: 'text-zinc-600 dark:text-zinc-400',
    bgColor: 'bg-zinc-400',
  },
  blocked: {
    icon: <AlertTriangle className="w-4 h-4" />,
    textColor: 'text-amber-600 dark:text-amber-400',
    bgColor: 'bg-amber-500',
  },
  completed: {
    icon: <CheckCircle2 className="w-4 h-4" />,
    textColor: 'text-lime-600 dark:text-lime-400',
    bgColor: 'bg-lime-500',
  },
  skipped: {
    icon: <Clock className="w-4 h-4" />,
    textColor: 'text-zinc-500 dark:text-zinc-500',
    bgColor: 'bg-zinc-300',
  },
}

const columnLabels: Record<WorkflowStepStatus, string> = {
  in_progress: 'In Progress',
  pending: 'Pending',
  blocked: 'Blocked',
  completed: 'Completed',
  skipped: 'Skipped',
}

export function KanbanColumn({
  status,
  steps,
  teamAssignments,
  onStepComplete,
  onStepBlock,
  onStepAddNote,
  onStepStart,
}: KanbanColumnProps) {
  const style = columnStyles[status]
  const label = columnLabels[status]

  // Find owner name for a step
  const getOwnerName = (assignedUserId: string) => {
    const assignment = teamAssignments.find((a) => a.userId === assignedUserId)
    return assignment?.userName
  }

  // Sort steps by sequence number
  const sortedSteps = [...steps].sort((a, b) => a.sequenceNumber - b.sequenceNumber)

  return (
    <div className="w-72 flex-shrink-0 flex flex-col bg-zinc-100 dark:bg-zinc-900 rounded-xl">
      {/* Column header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-zinc-200 dark:border-zinc-800">
        <h3 className={`flex items-center gap-2 text-sm font-semibold ${style.textColor}`}>
          {style.icon}
          {label}
        </h3>
        <span className={`w-5 h-5 flex items-center justify-center text-xs font-medium text-white rounded-full ${style.bgColor}`}>
          {steps.length}
        </span>
      </div>

      {/* Column body */}
      <div className="flex-1 overflow-y-auto p-2 space-y-2 min-h-[200px]">
        {sortedSteps.length > 0 ? (
          sortedSteps.map((step) => (
            <StepCard
              key={step.id}
              step={step}
              ownerName={getOwnerName(step.assignedUserId)}
              onComplete={(notes) => onStepComplete?.(step.id, notes)}
              onBlock={(reason) => onStepBlock?.(step.id, reason)}
              onAddNote={(note) => onStepAddNote?.(step.id, note)}
              onStart={() => onStepStart?.(step.id)}
            />
          ))
        ) : (
          <div className="flex items-center justify-center h-20 text-sm text-zinc-400 dark:text-zinc-500">
            No steps
          </div>
        )}
      </div>
    </div>
  )
}
