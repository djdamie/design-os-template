'use client'

import { use, useState, useCallback } from 'react'
import { useCoAgent } from '@copilotkit/react-core'
import { ProjectCanvas } from '@/components/project-canvas'
import { useCanvasData, updateFieldValue, ExtractedBrief } from '@/hooks/use-canvas-data'
import { N8N_ENDPOINTS, callN8NWebhook } from '@/lib/n8n/client'
import { transformFieldsToN8NPayload, type N8NUser } from '@/lib/n8n/transform'
import type { TabId, AllFields, ProjectType, CanvasField } from '@/components/project-canvas/types'

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
    // Rights
    territory: getFieldValue(fields, 'WHAT', 'rightsUsage', 'territory'),
    media: getFieldValue(fields, 'WHAT', 'rightsUsage', 'media_types'),
    term: getFieldValue(fields, 'WHAT', 'rightsUsage', 'term_length'),
    // Budget
    budget_raw: String(getFieldValue(fields, 'WHAT', 'budget', 'budget_amount') || ''),
    // Creative
    mood: getFieldValue(fields, 'WHAT', 'creative', 'creative_direction'),
    keywords: getFieldValue(fields, 'WHAT', 'creative', 'mood_keywords'),
    genres: getFieldValue(fields, 'WHAT', 'creative', 'genre_preferences'),
    reference_tracks: getFieldValue(fields, 'WHAT', 'creative', 'reference_tracks'),
    vocals_preference: getFieldValue(fields, 'WHAT', 'creative', 'vocals_preference'),
    must_avoid: getFieldValue(fields, 'WHAT', 'creative', 'must_avoid'),
    // Technical
    lengths: getFieldValue(fields, 'WHAT', 'projectDetails', 'video_lengths'),
    stems_required: getFieldValue(fields, 'WITH_WHAT', 'deliverables', 'stems_required'),
    sync_points: getFieldValue(fields, 'WITH_WHAT', 'technical', 'sync_points'),
    // Timeline
    submission_deadline: getFieldValue(fields, 'WHEN', 'keyDates', 'deadline_date'),
    air_date: getFieldValue(fields, 'WHEN', 'keyDates', 'air_date'),
    deadline_urgency: getFieldValue(fields, 'WHEN', 'urgency', 'deadline_urgency'),
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
}

export default function ProjectCanvasPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)

  // Local state for unsaved changes and field overrides
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [localFields, setLocalFields] = useState<AllFields | null>(null)
  const [projectTypeOverride, setProjectTypeOverride] = useState<ProjectType | null>(null)

  // CopilotKit state for bidirectional sync with brief_analyzer agent
  const { state, setState } = useCoAgent<BriefAnalyzerState>({
    name: 'brief_analyzer',
    initialState: {
      messages: [],
      extracted_brief: null,
      completeness: 0,
      project_type: null,
      suggestion_chips: [],
      field_updates: [],
    },
  })

  // Get canvas data from hook (transforms agent state or uses sample data)
  const canvasData = useCanvasData(id, state?.extracted_brief)

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
      setHasUnsavedChanges(true)

      // Sync to agent state
      if (state && setState) {
        setState({
          ...state,
          extracted_brief: {
            ...state.extracted_brief,
            [fieldId]: value,
          },
          field_updates: [...(state.field_updates || []), fieldId],
        })
      }
    },
    [canvasData.fields, state, setState]
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

  // Save status for UI feedback
  const [isSaving, setIsSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  // Handle save
  const handleSave = useCallback(async () => {
    setIsSaving(true)
    setSaveError(null)

    try {
      // Transform fields to API format
      const briefData = transformFieldsToApiFormat(effectiveFields)

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
      setSaveError(error instanceof Error ? error.message : 'Failed to save')
    } finally {
      setIsSaving(false)
    }
  }, [id, effectiveFields, projectTypeOverride])

  // Handle Slack channel creation
  const handleCreateSlack = useCallback(async () => {
    // Create user object for n8n payload
    const user: N8NUser = {
      email: 'user@tracksandfields.com', // TODO: Get from auth context
      name: 'Project Owner',
      id: id,
      role: 'user',
    }

    try {
      const payload = transformFieldsToN8NPayload(effectiveFields, id, user)
      const result = await callN8NWebhook(N8N_ENDPOINTS.briefIntake, {
        ...payload,
        action: 'create_slack_channel',
        case_number: canvasData.project.caseNumber,
        case_id: canvasData.project.caseId,
      })

      if (result.success) {
        console.log('Slack channel created:', result.slack_channel)
        // TODO: Update integrationStatus in state
      } else {
        console.error('Failed to create Slack channel:', result.error)
      }
    } catch (error) {
      console.error('Failed to create Slack channel:', error)
    }
  }, [id, effectiveFields, canvasData.project])

  // Handle Nextcloud folder creation
  const handleCreateNextcloud = useCallback(async () => {
    // Create user object for n8n payload
    const user: N8NUser = {
      email: 'user@tracksandfields.com', // TODO: Get from auth context
      name: 'Project Owner',
      id: id,
      role: 'user',
    }

    try {
      const payload = transformFieldsToN8NPayload(effectiveFields, id, user)
      const result = await callN8NWebhook(N8N_ENDPOINTS.syncNextcloud, {
        ...payload,
        action: 'create_nextcloud_folder',
        case_number: canvasData.project.caseNumber,
        case_id: canvasData.project.caseId,
      })

      if (result.success) {
        console.log('Nextcloud folder created:', result.nextcloud_folder)
        // TODO: Update integrationStatus in state
      } else {
        console.error('Failed to create Nextcloud folder:', result.error)
      }
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

  return (
    <ProjectCanvas
      project={projectWithOverride}
      marginCalculation={canvasData.marginCalculation}
      completenessBreakdown={canvasData.completenessBreakdown}
      tabs={canvasData.tabs}
      fields={effectiveFields}
      teamMembers={canvasData.teamMembers}
      integrationStatus={canvasData.integrationStatus}
      classificationReasoning={canvasData.classificationReasoning}
      hasUnsavedChanges={hasUnsavedChanges}
      onTabChange={handleTabChange}
      onFieldUpdate={handleFieldUpdate}
      onTypeOverride={handleTypeOverride}
      onSave={handleSave}
      onCreateSlack={handleCreateSlack}
      onCreateNextcloud={handleCreateNextcloud}
      onShowMissingFields={handleShowMissingFields}
      onShowClassificationDetails={handleShowClassificationDetails}
    />
  )
}
