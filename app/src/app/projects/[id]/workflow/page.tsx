'use client'

import { use, useCallback } from 'react'
import { WorkflowTracker } from '@/components/workflow-tracker'
import sampleData from '@/data/workflow-tracker-sample.json'
import type {
  Project,
  WorkflowTemplate,
  WorkflowStep,
  TeamAssignment,
  SystemTask,
  Alert,
  ProgressSummary,
} from '@/components/workflow-tracker/types'

export default function WorkflowTrackerPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)

  // Type-cast sample data (JSON doesn't preserve literal types)
  const project = sampleData.project as Project
  const workflowTemplate = sampleData.workflowTemplate as WorkflowTemplate
  const workflowSteps = sampleData.workflowSteps as WorkflowStep[]
  const teamAssignments = sampleData.teamAssignments as TeamAssignment[]
  const systemTasks = sampleData.systemTasks as SystemTask[]
  const alerts = sampleData.alerts as Alert[]
  const progressSummary = sampleData.progressSummary as ProgressSummary

  // Callbacks (stubs for now - will connect to backend later)
  const handleStepComplete = useCallback((stepId: string, notes?: string) => {
    console.log('Complete step:', stepId, notes)
  }, [])

  const handleStepBlock = useCallback((stepId: string, reason: string) => {
    console.log('Block step:', stepId, reason)
  }, [])

  const handleStepAddNote = useCallback((stepId: string, note: string) => {
    console.log('Add note to step:', stepId, note)
  }, [])

  const handleStepStart = useCallback((stepId: string) => {
    console.log('Start step:', stepId)
  }, [])

  const handleSystemTaskRetry = useCallback((taskId: string) => {
    console.log('Retry system task:', taskId)
  }, [])

  const handleAlertDismiss = useCallback((alertId: string) => {
    console.log('Dismiss alert:', alertId)
  }, [])

  return (
    <WorkflowTracker
      project={project}
      workflowTemplate={workflowTemplate}
      workflowSteps={workflowSteps}
      teamAssignments={teamAssignments}
      systemTasks={systemTasks}
      alerts={alerts}
      progressSummary={progressSummary}
      onStepComplete={handleStepComplete}
      onStepBlock={handleStepBlock}
      onStepAddNote={handleStepAddNote}
      onStepStart={handleStepStart}
      onSystemTaskRetry={handleSystemTaskRetry}
      onAlertDismiss={handleAlertDismiss}
    />
  )
}
