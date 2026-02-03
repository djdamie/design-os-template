'use client'

import { useState } from 'react'
import { Workflow, ChevronDown, ChevronUp } from 'lucide-react'
import { ProgressBar } from './ProgressBar'
import { KanbanColumn } from './KanbanColumn'
import { TeamPanel } from './TeamPanel'
import { AlertBanner } from './AlertBanner'
import { SystemTaskCard } from './SystemTaskCard'
import type {
  WorkflowTrackerProps,
  DisplayableColumnStatus,
  KanbanColumns,
} from './types'

export function WorkflowTracker({
  project,
  workflowTemplate,
  workflowSteps,
  teamAssignments,
  systemTasks,
  alerts,
  progressSummary,
  onStepComplete,
  onStepBlock,
  onStepAddNote,
  onStepStart,
  onSystemTaskRetry,
  onAlertDismiss,
}: WorkflowTrackerProps) {
  const [showSystemTasks, setShowSystemTasks] = useState(false)

  // Organize steps into Kanban columns
  const kanbanColumns: KanbanColumns = {
    pending: workflowSteps.filter((s) => s.status === 'pending'),
    in_progress: workflowSteps.filter((s) => s.status === 'in_progress'),
    completed: workflowSteps.filter((s) => s.status === 'completed'),
    blocked: workflowSteps.filter((s) => s.status === 'blocked'),
  }

  // Column order for display
  const columnOrder: DisplayableColumnStatus[] = ['in_progress', 'pending', 'blocked', 'completed']

  const successCount = systemTasks.filter((t) => t.status === 'success').length

  return (
    <div className="h-full flex flex-col bg-zinc-50 dark:bg-zinc-950">
      {/* Header */}
      <div className="flex-shrink-0 px-6 py-4 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-sky-500 to-sky-600 flex items-center justify-center">
              <Workflow className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                Workflow Tracker
              </h1>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                {project.catchyCaseId} · {project.caseTitle}
              </p>
            </div>
          </div>

          {/* Workflow type badge */}
          <div className="text-right">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 text-sm font-medium bg-sky-100 dark:bg-sky-900/40 text-sky-700 dark:text-sky-300 rounded-full">
              <span className="w-2 h-2 rounded-full bg-sky-500" />
              {workflowTemplate.label}
            </span>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
              {workflowTemplate.description}
            </p>
          </div>
        </div>

        {/* Progress bar */}
        <ProgressBar progress={progressSummary} template={workflowTemplate} />
      </div>

      {/* Alerts section */}
      {alerts.length > 0 && (
        <div className="flex-shrink-0 px-6 py-3 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800">
          <AlertBanner alerts={alerts} onDismiss={onAlertDismiss} />
        </div>
      )}

      {/* Main content: Kanban + Sidebar */}
      <div className="flex-1 flex overflow-hidden">
        {/* Kanban Board */}
        <div className="flex-1 overflow-x-auto">
          <div className="p-4 min-w-max">
            <div className="flex gap-4">
              {columnOrder.map((status) => (
                <KanbanColumn
                  key={status}
                  status={status}
                  steps={kanbanColumns[status]}
                  teamAssignments={teamAssignments}
                  onStepComplete={onStepComplete}
                  onStepBlock={onStepBlock}
                  onStepAddNote={onStepAddNote}
                  onStepStart={onStepStart}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Right Sidebar: Team + System Tasks */}
        <div className="w-72 flex-shrink-0 border-l border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-y-auto">
          <div className="p-4 space-y-4">
            {/* Team Panel */}
            <TeamPanel assignments={teamAssignments} />

            {/* System Tasks (Collapsible) */}
            <div className="rounded-xl border border-zinc-200 dark:border-zinc-700 overflow-hidden">
              <button
                onClick={() => setShowSystemTasks(!showSystemTasks)}
                className="w-full flex items-center justify-between px-4 py-3 bg-zinc-50 dark:bg-zinc-800/50 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                aria-label="System Tasks"
              >
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
                    <span className="text-[10px] text-white font-bold">AI</span>
                  </div>
                  <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                    System Tasks
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-zinc-500 dark:text-zinc-400">
                    {successCount}/{systemTasks.length}
                  </span>
                  {showSystemTasks ? (
                    <ChevronUp className="w-4 h-4 text-zinc-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-zinc-400" />
                  )}
                </div>
              </button>

              {showSystemTasks && (
                <div className="p-3 space-y-2 bg-white dark:bg-zinc-900">
                  {systemTasks.length > 0 ? (
                    systemTasks.map((task) => (
                      <SystemTaskCard
                        key={task.id}
                        task={task}
                        onRetry={() => onSystemTaskRetry?.(task.id)}
                      />
                    ))
                  ) : (
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 text-center py-2">
                      No system tasks
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
