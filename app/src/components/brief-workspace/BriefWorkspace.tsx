'use client'

import { useState } from 'react'
import { PanelLeftClose, PanelRightClose } from 'lucide-react'
import { ProjectCanvas } from '@/components/project-canvas'
import { BriefExtraction } from '@/components/brief-extraction'
import type { BriefWorkspaceProps } from './types'
import type { AllFields, TabId, ProjectType } from '@/components/project-canvas/types'

export function BriefWorkspace({
  // Canvas props
  project,
  marginCalculation,
  completenessBreakdown,
  tabs,
  fields,
  teamMembers,
  integrationStatus,
  classificationReasoning,
  hasUnsavedChanges = false,
  // Chat props
  projectContext,
  messages,
  suggestionChips,
  isProcessing = false,
  // Canvas callbacks
  onTabChange,
  onFieldUpdate,
  onTypeOverride,
  onSave,
  onCreateSlack,
  onCreateNextcloud,
  onShowMissingFields,
  onShowClassificationDetails,
  // Chat callbacks
  onSendMessage,
  onChipClick,
  onCopyMessage,
}: BriefWorkspaceProps) {
  const [isChatCollapsed, setIsChatCollapsed] = useState(false)

  return (
    <div className="h-full flex bg-zinc-100 dark:bg-zinc-950 relative">
      {/* LEFT: Project Canvas (65%) */}
      <div
        className={`
          flex-1 min-w-0 transition-all duration-300
          ${isChatCollapsed ? 'flex-[1]' : 'flex-[0.65] lg:flex-[0.65]'}
        `}
      >
        <div className="h-full bg-white dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800 shadow-sm">
          <ProjectCanvas
            project={project}
            marginCalculation={marginCalculation}
            completenessBreakdown={completenessBreakdown}
            tabs={tabs}
            fields={fields as AllFields}
            teamMembers={teamMembers}
            integrationStatus={integrationStatus}
            classificationReasoning={classificationReasoning}
            hasUnsavedChanges={hasUnsavedChanges}
            onTabChange={onTabChange as ((tabId: TabId) => void) | undefined}
            onFieldUpdate={onFieldUpdate}
            onTypeOverride={onTypeOverride as ((newType: ProjectType | null) => void) | undefined}
            onSave={onSave}
            onCreateSlack={onCreateSlack}
            onCreateNextcloud={onCreateNextcloud}
            onShowMissingFields={onShowMissingFields}
            onShowClassificationDetails={onShowClassificationDetails}
          />
        </div>
      </div>

      {/* Collapse/Expand button - desktop only */}
      <button
        onClick={() => setIsChatCollapsed(!isChatCollapsed)}
        className={`
          hidden lg:flex absolute top-1/2 -translate-y-1/2 z-10
          items-center justify-center w-6 h-12
          bg-zinc-200 dark:bg-zinc-700 hover:bg-zinc-300 dark:hover:bg-zinc-600
          rounded-l-lg transition-all duration-300
        `}
        style={{ right: isChatCollapsed ? 0 : 'calc(35% - 12px)' }}
        title={isChatCollapsed ? 'Show chat panel' : 'Hide chat panel'}
      >
        {isChatCollapsed ? (
          <PanelLeftClose className="h-4 w-4 text-zinc-600 dark:text-zinc-400" />
        ) : (
          <PanelRightClose className="h-4 w-4 text-zinc-600 dark:text-zinc-400" />
        )}
      </button>

      {/* RIGHT: AI Chat Panel (35%) */}
      <div
        className={`
          transition-all duration-300 overflow-hidden
          ${isChatCollapsed ? 'w-0 opacity-0' : 'flex-[0.35] lg:flex-[0.35] opacity-100'}
        `}
      >
        <div className="h-full bg-white dark:bg-zinc-900">
          <BriefExtraction
            projectContext={projectContext}
            messages={messages}
            suggestionChips={suggestionChips}
            isProcessing={isProcessing}
            onSendMessage={onSendMessage}
            onChipClick={onChipClick}
            onCopyMessage={onCopyMessage}
          />
        </div>
      </div>
    </div>
  )
}
