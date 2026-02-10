'use client'

import { use, useState, useCallback, useEffect, useRef } from 'react'
import { useCoAgent } from '@copilotkit/react-core'
import { ProjectCanvas } from '@/components/project-canvas'
import { useCanvasData, updateFieldValue, calculateCompleteness, ExtractedBrief } from '@/hooks/use-canvas-data'
import { useBriefSync } from '@/hooks/use-brief-sync'
import { useAuth } from '@/components/providers/AuthProvider'
import type { TabId, AllFields, ProjectType, CanvasField, IntegrationStatus } from '@/components/project-canvas/types'
import type { TFProjectWithBrief, TFBrief } from '@/lib/supabase/types'

function transformSupabaseToBrief(data: TFProjectWithBrief): ExtractedBrief | null {
  const brief = Array.isArray(data.tf_briefs) ? data.tf_briefs[0] : data.tf_briefs
  if (!brief) return null

  return {
    client_name: brief.client || undefined,
    agency_name: brief.agency || undefined,
    brand_name: brief.brand || undefined,
    project_title: brief.project_title || data.project_title || undefined,
    brief_sender_name: brief.brief_sender_name || undefined,
    brief_sender_email: brief.brief_sender_email || undefined,
    brief_sender_role: brief.brief_sender_role || undefined,
    territory: brief.territory || undefined,
    media_types: brief.media || undefined,
    term_length: brief.term || undefined,
    exclusivity: brief.exclusivity ?? undefined,
    exclusivity_details: brief.exclusivity_details || undefined,
    budget_amount: brief.budget_min || undefined,
    creative_direction: brief.creative_direction || brief.mood || undefined,
    mood_keywords: brief.keywords || undefined,
    genre_preferences: brief.genres || undefined,
    reference_tracks: brief.reference_tracks as ExtractedBrief['reference_tracks'] || undefined,
    vocals_preference: brief.vocals_preference as ExtractedBrief['vocals_preference'] || undefined,
    must_avoid: brief.must_avoid || undefined,
    video_lengths: brief.lengths || undefined,
    stems_required: brief.stems_required ?? undefined,
    sync_points: brief.sync_points || undefined,
    source_type: brief.source_type || undefined,
    deliverable_formats: brief.deliverable_formats || undefined,
    file_formats: brief.file_formats || undefined,
    language_adaptations: brief.language_adaptations || undefined,
    deadline_date: brief.submission_deadline || undefined,
    first_presentation_date: brief.first_presentation_date || undefined,
    client_presentation_date: brief.client_presentation_date || undefined,
    air_date: brief.air_date || undefined,
    deadline_urgency: brief.deadline_urgency as ExtractedBrief['deadline_urgency'] || undefined,
  }
}

// Helper to extract field value from canvas fields structure
function getFieldValue(fields: AllFields, tab: string, group: string, fieldId: string): unknown {
  const tabFields = fields[tab as keyof AllFields]
  if (!tabFields) return undefined
  const groupFields = tabFields[group as keyof typeof tabFields]
  if (!groupFields?.fields) return undefined
  const field = groupFields.fields.find((f: CanvasField) => f.id === fieldId)
  return field?.value
}

// Transform canvas fields to API format
function transformFieldsToApiFormat(fields: AllFields): Record<string, unknown> {
  return {
    // Business
    client: getFieldValue(fields, 'WHAT', 'clientInfo', 'client_name'),
    agency: getFieldValue(fields, 'WHAT', 'clientInfo', 'agency_name'),
    brand: getFieldValue(fields, 'WHAT', 'clientInfo', 'brand_name'),
    brief_sender_name: getFieldValue(fields, 'WHAT', 'clientInfo', 'brief_sender_name'),
    brief_sender_email: getFieldValue(fields, 'WHAT', 'clientInfo', 'brief_sender_email'),
    brief_sender_role: getFieldValue(fields, 'WHAT', 'clientInfo', 'brief_sender_role'),
    project_title: getFieldValue(fields, 'WHAT', 'projectDetails', 'project_title'),
    lengths: getFieldValue(fields, 'WHAT', 'projectDetails', 'video_lengths'),
    language_adaptations: getFieldValue(fields, 'WHAT', 'projectDetails', 'language_adaptations'),
    // Rights
    territory: getFieldValue(fields, 'WHAT', 'rightsUsage', 'territory'),
    media: getFieldValue(fields, 'WHAT', 'rightsUsage', 'media_types'),
    term: getFieldValue(fields, 'WHAT', 'rightsUsage', 'term_length'),
    exclusivity: getFieldValue(fields, 'WHAT', 'rightsUsage', 'exclusivity'),
    exclusivity_details: getFieldValue(fields, 'WHAT', 'rightsUsage', 'exclusivity_details'),
    // Budget
    budget_raw: String(getFieldValue(fields, 'WHAT', 'budget', 'budget_amount') || ''),
    budget_min: getFieldValue(fields, 'WHAT', 'budget', 'budget_amount'),
    budget_max: getFieldValue(fields, 'WHAT', 'budget', 'budget_amount'),
    // Creative
    mood: getFieldValue(fields, 'WHAT', 'creative', 'creative_direction'),
    keywords: getFieldValue(fields, 'WHAT', 'creative', 'mood_keywords'),
    genres: getFieldValue(fields, 'WHAT', 'creative', 'genre_preferences'),
    reference_tracks: getFieldValue(fields, 'WHAT', 'creative', 'reference_tracks'),
    vocals_preference: getFieldValue(fields, 'WHAT', 'creative', 'vocals_preference'),
    must_avoid: getFieldValue(fields, 'WHAT', 'creative', 'must_avoid'),
    // WITH_WHAT
    source_type: getFieldValue(fields, 'WITH_WHAT', 'musicSource', 'source_type'),
    deliverable_formats: getFieldValue(fields, 'WITH_WHAT', 'deliverables', 'deliverable_formats'),
    file_formats: getFieldValue(fields, 'WITH_WHAT', 'deliverables', 'file_formats'),
    stems_required: getFieldValue(fields, 'WITH_WHAT', 'deliverables', 'stems_required'),
    sync_points: getFieldValue(fields, 'WITH_WHAT', 'technical', 'sync_points'),
    // Timeline
    kickoff_date: getFieldValue(fields, 'WHEN', 'keyDates', 'kickoff_date'),
    submission_deadline: getFieldValue(fields, 'WHEN', 'keyDates', 'deadline_date'),
    first_presentation_date: getFieldValue(fields, 'WHEN', 'keyDates', 'first_presentation_date'),
    client_presentation_date: getFieldValue(fields, 'WHEN', 'keyDates', 'client_presentation_date'),
    air_date: getFieldValue(fields, 'WHEN', 'keyDates', 'air_date'),
    deadline_urgency: getFieldValue(fields, 'WHEN', 'urgency', 'deadline_urgency'),
    // Context
    campaign_context: getFieldValue(fields, 'OTHER', 'context', 'campaign_context'),
    target_audience: getFieldValue(fields, 'OTHER', 'context', 'target_audience'),
    brand_values: getFieldValue(fields, 'OTHER', 'context', 'brand_values'),
    // Notes
    extraction_notes: getFieldValue(fields, 'OTHER', 'notes', 'extraction_notes'),
  }
}

// LangGraph agent state type
interface BriefAnalyzerState {
  messages: Array<{
    id: string
    type: 'human' | 'ai' | 'system' | 'tool'
    content: string
  }>
  extracted_brief: ExtractedBrief | null
  completeness: number
  project_type: string | null
  suggestion_chips: Array<{ id: string; label: string }>
  field_updates: string[]
  current_project_id: string | null
}

const EMPTY_AGENT_STATE: BriefAnalyzerState = {
  messages: [],
  extracted_brief: null,
  completeness: 0,
  project_type: null,
  suggestion_chips: [],
  field_updates: [],
  current_project_id: null,
}

export default function ProjectCanvasPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const { tfUser } = useAuth()

  // Local state for unsaved changes and field overrides
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [localFields, setLocalFields] = useState<AllFields | null>(null)
  const [projectTypeOverride, setProjectTypeOverride] = useState<ProjectType | null>(null)
  const modifiedFieldIds = useRef<Set<string>>(new Set())

  // CopilotKit state for bidirectional sync with brief_analyzer agent
  const { state, setState } = useCoAgent<BriefAnalyzerState>({
    name: 'brief_analyzer',
    initialState: {
      ...EMPTY_AGENT_STATE,
      current_project_id: id,
    },
  })

  // Store setState in a ref to avoid infinite loops in useEffect.
  // The setState from useCoAgent may not be stable across renders.
  const setStateRef = useRef(setState)
  useEffect(() => {
    setStateRef.current = setState
  }, [setState])

  const [fetchedProjectData, setFetchedProjectData] = useState<TFProjectWithBrief | null>(null)
  const [fetchedBrief, setFetchedBrief] = useState<ExtractedBrief | null>(null)
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(null)

  // Subscribe to realtime brief updates (e.g., from Slack)
  const briefSyncState = useBriefSync({
    caseId: id,
    enabled: true,
    onBriefUpdate: useCallback((updatedBrief: TFBrief, source: string) => {
      console.log(`Brief updated from ${source}:`, updatedBrief)
      // Use functional update to avoid dependency cycle
      setFetchedProjectData(prev => {
        if (!prev) return prev
        const updated = { ...prev, tf_briefs: updatedBrief }
        // Update fetchedBrief in the same callback to avoid stale closure
        setFetchedBrief(transformSupabaseToBrief(updated))
        return updated
      })
    }, []), // Empty deps - uses functional state update
  })

  // Keep current project id in agent state without forcing redundant updates.
  useEffect(() => {
    const setStateFn = setStateRef.current
    if (!setStateFn) return
    setStateFn((prev) => {
      const previous = prev || EMPTY_AGENT_STATE
      if (previous.current_project_id === id) {
        return previous
      }
      if (previous.current_project_id && previous.current_project_id !== id) {
        return {
          ...EMPTY_AGENT_STATE,
          current_project_id: id,
        }
      }
      return {
        ...previous,
        current_project_id: id,
      }
    })
  }, [id])

  useEffect(() => {
    const setStateFn = setStateRef.current
    if (!setStateFn || !fetchedProjectData) return

    const fetchedCompleteness = fetchedProjectData.tf_briefs
      ? (Array.isArray(fetchedProjectData.tf_briefs)
          ? fetchedProjectData.tf_briefs[0]?.completion_rate
          : fetchedProjectData.tf_briefs.completion_rate) || 0
      : 0
    const fetchedBriefData = transformSupabaseToBrief(fetchedProjectData)

    setStateFn((prev) => {
      const previous = prev || EMPTY_AGENT_STATE
      const isSameProject = previous.current_project_id === id
      const hasExistingBrief =
        isSameProject &&
        !!previous.extracted_brief &&
        Object.keys(previous.extracted_brief).length > 0
      const nextExtractedBrief = hasExistingBrief ? previous.extracted_brief : fetchedBriefData
      const nextCompleteness =
        isSameProject && previous.completeness > 0 ? previous.completeness : fetchedCompleteness
      const nextProjectType =
        isSameProject && previous.project_type
          ? previous.project_type
          : fetchedProjectData.project_type || null
      const needsUpdate =
        previous.current_project_id !== id ||
        previous.extracted_brief !== nextExtractedBrief ||
        previous.completeness !== nextCompleteness ||
        previous.project_type !== nextProjectType

      if (!needsUpdate) {
        return previous
      }

      return {
        ...previous,
        extracted_brief: nextExtractedBrief,
        completeness: nextCompleteness,
        project_type: nextProjectType,
        current_project_id: id,
      }
    })
  }, [id, fetchedProjectData])

  useEffect(() => {
    async function fetchProjectMetadata() {
      try {
        const response = await fetch(`/api/projects/${id}`)
        if (response.ok) {
          const data: TFProjectWithBrief = await response.json()
          setFetchedProjectData(data)
          setFetchedBrief(transformSupabaseToBrief(data))
        }
      } catch (err) {
        console.error('Error fetching project metadata:', err)
      }
    }
    fetchProjectMetadata()
  }, [id])

  // Get canvas data from hook (transforms agent state or uses sample data)
  // Pass project metadata so caseTitle and caseNumber are set correctly
  const hasCurrentProjectState = state?.current_project_id === id
  const canvasData = useCanvasData(
    id, 
    hasCurrentProjectState ? state?.extracted_brief || fetchedBrief : fetchedBrief,
    fetchedProjectData ? {
      project_title: fetchedProjectData.project_title,
      case_number: fetchedProjectData.case_number,
      catchy_case_id: fetchedProjectData.catchy_case_id,
      slack_channel: fetchedProjectData.slack_channel,
      nextcloud_folder: fetchedProjectData.nextcloud_folder,
    } : null
  )

  // Use local fields if modified, otherwise use computed fields
  const effectiveFields = localFields || canvasData.fields

  // Handle field updates - sync back to agent state
  const handleFieldUpdate = useCallback(
    (fieldId: string, value: unknown) => {
      // Update local fields
      setLocalFields((prev) => {
        const currentFields = prev || canvasData.fields
        return updateFieldValue(currentFields, fieldId, value)
      })
      modifiedFieldIds.current.add(fieldId)
      setHasUnsavedChanges(true)

      // Sync to agent state
      if (setState) {
        setState((prev) => {
          const previous = prev || EMPTY_AGENT_STATE
          return {
            ...previous,
            extracted_brief: {
              ...(previous.extracted_brief || {}),
              [fieldId]: value,
            },
            field_updates: [...(previous.field_updates || []), fieldId],
            current_project_id: id,
          }
        })
      }
    },
    [canvasData.fields, id, setState]
  )

  // Handle tab change
  const handleTabChange = useCallback((tabId: TabId) => {
    // Could track active tab in state if needed
    console.log('Tab changed to:', tabId)
  }, [])

  // Handle project type override
  const handleTypeOverride = useCallback((newType: ProjectType | null) => {
    setProjectTypeOverride(newType)
    setHasUnsavedChanges(true)
  }, [])

  // Handle save
  const handleSave = useCallback(async () => {
    try {
      // Transform fields to API format
      const briefData = transformFieldsToApiFormat(effectiveFields)

      // Compute and include missing information
      const completeness = calculateCompleteness(effectiveFields)
      const missingInfo = completeness.missingFields.map(f =>
        `${f.field} (${f.priority})`
      )
      briefData.missing_information = missingInfo.length > 0 ? missingInfo : null

      // Add project type if overridden
      if (projectTypeOverride) {
        Object.assign(briefData, { project_type: projectTypeOverride })
      }

      // Save to API
      const response = await fetch(`/api/projects/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(briefData),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to save')
      }

      console.log('Project saved successfully')
      setHasUnsavedChanges(false)
      // Reset local fields to allow fresh sync from agent
      setLocalFields(null)
    } catch (error) {
      console.error('Failed to save project:', error)
    }
  }, [id, effectiveFields, projectTypeOverride])

  // Handle setup integrations (lean workflow - Slack + Nextcloud + Drive in one call)
  const handleSetupIntegrations = useCallback(async () => {
    const userEmail = tfUser?.email || ''

    try {
      const response = await fetch(`/api/projects/${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'setup_integrations',
          user_email: userEmail,
        }),
      })

      const result = await response.json()
      if (!response.ok) {
        throw new Error(result.error || 'Failed to setup integrations')
      }

      // Update local state with new integration data
      setFetchedProjectData((prev) => prev ? {
        ...prev,
        slack_channel: result.slack_channel || prev.slack_channel || null,
        nextcloud_folder: result.nextcloud_folder || prev.nextcloud_folder || null,
      } : prev)

      console.log('Integrations setup complete:', result)
    } catch (error) {
      console.error('Failed to setup integrations:', error)
    }
  }, [id])

  // Handle sync brief to Nextcloud (lean workflow)
  const handleSyncBrief = useCallback(async () => {
    const changedFields = Array.from(modifiedFieldIds.current)
    const changeSummary = changedFields.length > 0
      ? `Updated ${changedFields.map(f => f.replace(/_/g, ' ')).join(', ')}`
      : 'Brief updated'
    const changedBy = tfUser?.name || tfUser?.email || 'unknown'

    try {
      const response = await fetch(`/api/projects/${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'sync_brief',
          change_summary: changeSummary,
          changed_by: changedBy,
        }),
      })

      const result = await response.json()
      if (!response.ok) {
        throw new Error(result.error || 'Failed to sync brief')
      }

      modifiedFieldIds.current.clear()
      // Update last synced timestamp
      setLastSyncedAt(new Date().toISOString())
      console.log('Brief synced to Nextcloud:', result)
    } catch (error) {
      console.error('Failed to sync brief:', error)
    }
  }, [id, tfUser])

  // DEPRECATED: Handle Slack channel creation (kept for backwards compatibility)
  const handleCreateSlack = useCallback(async () => {
    console.warn('handleCreateSlack is deprecated. Use handleSetupIntegrations instead.')
    try {
      const response = await fetch(`/api/projects/${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create_slack_channel',
          project_title: canvasData.project.caseTitle,
          brief_data: transformFieldsToApiFormat(effectiveFields),
        }),
      })

      const result = await response.json()
      if (!response.ok) {
        throw new Error(result.error || 'Failed to create Slack channel')
      }

      setFetchedProjectData((prev) => prev ? {
        ...prev,
        slack_channel: result.slack_channel || prev.slack_channel || null,
      } : prev)
    } catch (error) {
      console.error('Failed to create Slack channel:', error)
    }
  }, [id, effectiveFields, canvasData.project])

  // DEPRECATED: Handle Nextcloud folder creation (kept for backwards compatibility)
  const handleCreateNextcloud = useCallback(async () => {
    console.warn('handleCreateNextcloud is deprecated. Use handleSetupIntegrations instead.')
    try {
      const response = await fetch(`/api/projects/${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create_nextcloud_folder',
          project_title: canvasData.project.caseTitle,
          brief_data: transformFieldsToApiFormat(effectiveFields),
        }),
      })

      const result = await response.json()
      if (!response.ok) {
        throw new Error(result.error || 'Failed to create Nextcloud folder')
      }

      setFetchedProjectData((prev) => prev ? {
        ...prev,
        nextcloud_folder: result.nextcloud_folder || prev.nextcloud_folder || null,
      } : prev)
    } catch (error) {
      console.error('Failed to create Nextcloud folder:', error)
    }
  }, [id, effectiveFields, canvasData.project])

  // Handle show missing fields modal
  const handleShowMissingFields = useCallback(() => {
    console.log('Missing fields:', canvasData.completenessBreakdown.missingFields)
    // Would open modal here
  }, [canvasData.completenessBreakdown])

  // Handle show classification details modal
  const handleShowClassificationDetails = useCallback(() => {
    console.log('Classification:', canvasData.classificationReasoning)
    // Would open modal here
  }, [canvasData.classificationReasoning])

  // Apply project type override to project data
  const projectWithOverride = projectTypeOverride
    ? { ...canvasData.project, projectTypeOverride }
    : canvasData.project

  // Compute integration status with lastSyncedAt
  const integrationStatus: IntegrationStatus = {
    ...canvasData.integrationStatus,
    nextcloud: {
      ...canvasData.integrationStatus.nextcloud,
      lastSyncedAt: lastSyncedAt || canvasData.integrationStatus.nextcloud.lastSyncedAt || null,
    },
    allSetUp: canvasData.integrationStatus.slack.connected &&
              canvasData.integrationStatus.nextcloud.connected,
  }

  return (
    <ProjectCanvas
      project={projectWithOverride}
      marginCalculation={canvasData.marginCalculation}
      completenessBreakdown={canvasData.completenessBreakdown}
      tabs={canvasData.tabs}
      fields={effectiveFields}
      teamMembers={canvasData.teamMembers}
      integrationStatus={integrationStatus}
      classificationReasoning={canvasData.classificationReasoning}
      hasUnsavedChanges={hasUnsavedChanges}
      onTabChange={handleTabChange}
      onFieldUpdate={handleFieldUpdate}
      onTypeOverride={handleTypeOverride}
      onSave={handleSave}
      onSetupIntegrations={handleSetupIntegrations}
      onSyncBrief={handleSyncBrief}
      onShowMissingFields={handleShowMissingFields}
      onShowClassificationDetails={handleShowClassificationDetails}
    />
  )
}
