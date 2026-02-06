'use client'

import { useState } from 'react'
import { CanvasHeader } from './CanvasHeader'
import { TabNavigation } from './TabNavigation'
import { FieldGroup } from './FieldGroup'
import { ActionFooter } from './ActionFooter'
import type { ProjectCanvasProps, TabId, TabFields, FieldGroup as FieldGroupType } from './types'

export function ProjectCanvas({
  project,
  marginCalculation,
  completenessBreakdown,
  tabs,
  fields,
  teamMembers,
  integrationStatus,
  classificationReasoning,
  activeTab: initialActiveTab = 'WHAT',
  hasUnsavedChanges = false,
  onTabChange,
  onFieldUpdate,
  onTypeOverride,
  onSave,
  onSetupIntegrations,
  onSyncBrief,
  // Deprecated props - kept for backwards compatibility
  onCreateSlack,
  onCreateNextcloud,
  onShowMissingFields,
  onShowClassificationDetails,
}: ProjectCanvasProps & { isIntegrationLoading?: boolean }) {
  const [activeTab, setActiveTab] = useState<TabId>(initialActiveTab)
  const [isIntegrationLoading, setIsIntegrationLoading] = useState(false)

  const handleTabChange = (tabId: TabId) => {
    setActiveTab(tabId)
    onTabChange?.(tabId)
  }

  // Get fields for active tab
  const activeTabFields: TabFields = fields[activeTab]
  const effectiveProjectType = project.projectTypeOverride || project.projectType

  return (
    <div className="flex flex-col h-full bg-white dark:bg-zinc-900">
      {/* Header with project info, classification, margin, completeness */}
      <CanvasHeader
        project={project}
        marginCalculation={marginCalculation}
        completenessBreakdown={completenessBreakdown}
        classificationReasoning={classificationReasoning}
        onShowMissingFields={onShowMissingFields}
        onShowClassificationDetails={onShowClassificationDetails}
        onTypeOverride={onTypeOverride}
      />

      {/* Tab navigation */}
      <TabNavigation
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={handleTabChange}
      />

      {/* Scrollable content area */}
      <div
        className="flex-1 overflow-y-auto px-4 py-4"
        role="tabpanel"
        id={`panel-${activeTab}`}
        aria-labelledby={`tab-${activeTab}`}
      >
        {Object.entries(activeTabFields).map(([groupKey, group]) => (
          <FieldGroup
            key={groupKey}
            group={group as FieldGroupType}
            projectType={effectiveProjectType}
            teamMembers={teamMembers}
            onFieldUpdate={onFieldUpdate}
          />
        ))}
      </div>

      {/* Action footer */}
      <ActionFooter
        hasUnsavedChanges={hasUnsavedChanges}
        integrationStatus={integrationStatus}
        isLoading={isIntegrationLoading}
        onSave={onSave}
        onSetupIntegrations={onSetupIntegrations ? async () => {
          setIsIntegrationLoading(true)
          try {
            await onSetupIntegrations()
          } finally {
            setIsIntegrationLoading(false)
          }
        } : undefined}
        onSyncBrief={onSyncBrief ? async () => {
          setIsIntegrationLoading(true)
          try {
            await onSyncBrief()
          } finally {
            setIsIntegrationLoading(false)
          }
        } : undefined}
      />
    </div>
  )
}
