'use client'

import { use, useState, useCallback, useMemo, useEffect } from 'react'
import { useCoAgent, useCopilotChat, useCopilotReadable } from '@copilotkit/react-core'
import { Role, TextMessage } from '@copilotkit/runtime-client-gql'
import { BriefWorkspace } from '@/components/brief-workspace'
import { useCanvasData, updateFieldValue, ExtractedBrief } from '@/hooks/use-canvas-data'
import { N8N_ENDPOINTS, callN8NWebhook } from '@/lib/n8n/client'
import { transformFieldsToN8NPayload, type N8NUser } from '@/lib/n8n/transform'
import type { AllFields, ProjectType, TabId, CanvasField } from '@/components/project-canvas/types'
import type { ChatMessage, SuggestionChip } from '@/components/brief-extraction/types'
import type { TFProjectWithBrief } from '@/lib/supabase/types'

// Transform Supabase data to ExtractedBrief format
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
    deadline_date: brief.submission_deadline || undefined,
    first_presentation_date: brief.first_presentation_date || undefined,
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
    client: getFieldValue(fields, 'WHAT', 'clientInfo', 'client_name'),
    agency: getFieldValue(fields, 'WHAT', 'clientInfo', 'agency_name'),
    brand: getFieldValue(fields, 'WHAT', 'clientInfo', 'brand_name'),
    territory: getFieldValue(fields, 'WHAT', 'rightsUsage', 'territory'),
    media: getFieldValue(fields, 'WHAT', 'rightsUsage', 'media_types'),
    term: getFieldValue(fields, 'WHAT', 'rightsUsage', 'term_length'),
    budget_raw: String(getFieldValue(fields, 'WHAT', 'budget', 'budget_amount') || ''),
    mood: getFieldValue(fields, 'WHAT', 'creative', 'creative_direction'),
    keywords: getFieldValue(fields, 'WHAT', 'creative', 'mood_keywords'),
    genres: getFieldValue(fields, 'WHAT', 'creative', 'genre_preferences'),
    reference_tracks: getFieldValue(fields, 'WHAT', 'creative', 'reference_tracks'),
    vocals_preference: getFieldValue(fields, 'WHAT', 'creative', 'vocals_preference'),
    must_avoid: getFieldValue(fields, 'WHAT', 'creative', 'must_avoid'),
    lengths: getFieldValue(fields, 'WHAT', 'projectDetails', 'video_lengths'),
    stems_required: getFieldValue(fields, 'WITH_WHAT', 'deliverables', 'stems_required'),
    sync_points: getFieldValue(fields, 'WITH_WHAT', 'technical', 'sync_points'),
    submission_deadline: getFieldValue(fields, 'WHEN', 'keyDates', 'deadline_date'),
    air_date: getFieldValue(fields, 'WHEN', 'keyDates', 'air_date'),
    deadline_urgency: getFieldValue(fields, 'WHEN', 'urgency', 'deadline_urgency'),
  }
}

// LangGraph message format from AG-UI
interface LangGraphMessage {
  id: string
  type: 'human' | 'ai' | 'system' | 'tool'
  content: string
  additional_kwargs?: Record<string, unknown>
  response_metadata?: Record<string, unknown>
}

// Agent state type
interface BriefAnalyzerState {
  messages: LangGraphMessage[]
  extracted_brief: ExtractedBrief | null
  completeness: number
  project_type: string | null
  suggestion_chips: SuggestionChip[]
  field_updates: string[]
  current_project_id: string | null  // Project ID for fetching data from database
}

export default function BriefWorkspacePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)

  // State for fetched project data
  const [fetchedBrief, setFetchedBrief] = useState<ExtractedBrief | null>(null)
  const [isLoadingProject, setIsLoadingProject] = useState(true)
  const [fetchError, setFetchError] = useState<string | null>(null)

  // Local state for unsaved changes and field overrides
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [localFields, setLocalFields] = useState<AllFields | null>(null)
  const [projectTypeOverride, setProjectTypeOverride] = useState<ProjectType | null>(null)

  // CopilotKit hooks for bidirectional sync
  const { appendMessage, isLoading } = useCopilotChat()
  const { state, setState } = useCoAgent<BriefAnalyzerState>({
    name: 'brief_analyzer',
    initialState: {
      messages: [],
      extracted_brief: null,
      completeness: 0,
      project_type: null,
      suggestion_chips: [],
      field_updates: [],
      current_project_id: id, // Pass project ID to the agent so it can fetch data
    },
  })

  // Fetch project data from Supabase on mount
  useEffect(() => {
    async function fetchProject() {
      try {
        setIsLoadingProject(true)
        setFetchError(null)
        
        const response = await fetch(`/api/projects/${id}`)
        if (!response.ok) {
          if (response.status === 404) {
            // New project - no existing data
            setFetchedBrief(null)
          } else {
            throw new Error('Failed to fetch project')
          }
        } else {
          const data: TFProjectWithBrief = await response.json()
          const brief = transformSupabaseToBrief(data)
          setFetchedBrief(brief)
          
          // Initialize agent state with fetched data so chat can answer questions about it
          if (brief && setState) {
            setState({
              ...state,
              extracted_brief: brief as ExtractedBrief,
              completeness: data.tf_briefs 
                ? (Array.isArray(data.tf_briefs) 
                    ? data.tf_briefs[0]?.completion_rate 
                    : data.tf_briefs.completion_rate) || 0
                : 0,
              project_type: data.project_type || null,
            })
          }
        }
      } catch (err) {
        console.error('Error fetching project:', err)
        setFetchError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setIsLoadingProject(false)
      }
    }

    fetchProject()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  // Use agent state if available, otherwise use fetched data
  const effectiveBrief = state?.extracted_brief || fetchedBrief

  // Provide brief data as context to the CopilotKit agent
  // This ensures the agent has access to the loaded project data when answering questions
  useCopilotReadable({
    description: "The current project brief data loaded from the database. Use this to answer questions about the project.",
    value: effectiveBrief ? JSON.stringify({
      project_title: effectiveBrief.project_title,
      client_name: effectiveBrief.client_name,
      agency_name: effectiveBrief.agency_name,
      brand_name: effectiveBrief.brand_name,
      budget_amount: effectiveBrief.budget_amount,
      budget_currency: effectiveBrief.budget_currency,
      territory: effectiveBrief.territory,
      media_types: effectiveBrief.media_types,
      term_length: effectiveBrief.term_length,
      exclusivity: effectiveBrief.exclusivity,
      creative_direction: effectiveBrief.creative_direction,
      mood_keywords: effectiveBrief.mood_keywords,
      genre_preferences: effectiveBrief.genre_preferences,
      reference_tracks: effectiveBrief.reference_tracks,
      vocals_preference: effectiveBrief.vocals_preference,
      video_lengths: effectiveBrief.video_lengths,
      deadline_date: effectiveBrief.deadline_date,
      air_date: effectiveBrief.air_date,
      brief_sender_name: effectiveBrief.brief_sender_name,
      brief_sender_email: effectiveBrief.brief_sender_email,
    }, null, 2) : "No brief data loaded yet.",
  })

  // Debug: log state
  console.log('DEBUG state:', state)
  console.log('DEBUG extracted_brief:', state?.extracted_brief)
  console.log('DEBUG fetchedBrief:', fetchedBrief)
  console.log('DEBUG effectiveBrief:', effectiveBrief)

  // Get canvas data from hook (transforms agent state or fetched data)
  console.log('>>> BEFORE useCanvasData call, effectiveBrief:', !!effectiveBrief)
  const canvasData = useCanvasData(id, effectiveBrief)
  console.log('>>> AFTER useCanvasData call, got project type:', canvasData.project.projectType)

  // Debug: log what useCanvasData returned
  console.log('DEBUG canvasData.completenessBreakdown:', canvasData.completenessBreakdown)
  console.log('DEBUG canvasData project_title field:',
    canvasData.fields?.WHAT?.projectDetails?.fields?.find((f: { id: string }) => f.id === 'project_title')
  )

  // Use local fields if modified, otherwise use computed fields
  const effectiveFields = localFields || canvasData.fields
  console.log('DEBUG using localFields:', !!localFields)

  // Convert LangGraph messages to chat format
  const messages: ChatMessage[] = useMemo(() => {
    const stateMessages = state?.messages || []
    return stateMessages
      .filter((msg) => msg.type === 'human' || msg.type === 'ai')
      .map((msg) => ({
        id: msg.id,
        role: (msg.type === 'human' ? 'user' : 'assistant') as 'user' | 'assistant',
        content: msg.content || '',
        timestamp: new Date().toISOString(),
      }))
  }, [state?.messages])

  // Project context for chat header
  const projectContext = useMemo(
    () => ({
      caseId: canvasData.project.caseId,
      caseTitle: canvasData.project.caseTitle,
      completeness: canvasData.completenessBreakdown.score,
    }),
    [canvasData.project, canvasData.completenessBreakdown]
  )

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
      const briefData = transformFieldsToApiFormat(effectiveFields)

      if (projectTypeOverride) {
        Object.assign(briefData, { project_type: projectTypeOverride })
      }

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
        // TODO: Update integration status in state
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
        // TODO: Update integration status in state
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
  }, [canvasData.completenessBreakdown])

  // Handle show classification details modal
  const handleShowClassificationDetails = useCallback(() => {
    console.log('Classification:', canvasData.classificationReasoning)
  }, [canvasData.classificationReasoning])

  // Handle send message in chat
  const handleSendMessage = useCallback(
    (content: string) => {
      appendMessage(new TextMessage({ content, role: Role.User }))
    },
    [appendMessage]
  )

  // Handle chip click
  const handleChipClick = useCallback(
    (chipId: string, label: string) => {
      handleSendMessage(label)
    },
    [handleSendMessage]
  )

  // Handle copy message
  const handleCopyMessage = useCallback(
    (messageId: string) => {
      const message = messages.find((m) => m.id === messageId)
      if (message) {
        navigator.clipboard.writeText(message.content)
      }
    },
    [messages]
  )

  // Apply project type override to project data
  const projectWithOverride = projectTypeOverride
    ? { ...canvasData.project, projectTypeOverride }
    : canvasData.project

  // Show loading state while fetching project data
  // NOTE: This must come AFTER all hooks are called
  if (isLoadingProject) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-stone-950">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-fuchsia-500 mx-auto mb-4" />
          <p className="text-stone-400">Loading project...</p>
        </div>
      </div>
    )
  }

  // Show error state if fetch failed
  if (fetchError) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-stone-950">
        <div className="text-center max-w-md">
          <div className="text-red-500 text-4xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-stone-100 mb-2">Error Loading Project</h2>
          <p className="text-stone-400 mb-4">{fetchError}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-fuchsia-600 hover:bg-fuchsia-700 text-white rounded-lg transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <BriefWorkspace
      // Canvas props
      project={projectWithOverride}
      marginCalculation={canvasData.marginCalculation}
      completenessBreakdown={canvasData.completenessBreakdown}
      tabs={canvasData.tabs}
      fields={effectiveFields}
      teamMembers={canvasData.teamMembers}
      integrationStatus={canvasData.integrationStatus}
      classificationReasoning={canvasData.classificationReasoning}
      hasUnsavedChanges={hasUnsavedChanges}
      // Chat props
      projectContext={projectContext}
      messages={messages}
      suggestionChips={state?.suggestion_chips || []}
      isProcessing={isLoading}
      // Canvas callbacks
      onTabChange={handleTabChange}
      onFieldUpdate={handleFieldUpdate}
      onTypeOverride={handleTypeOverride}
      onSave={handleSave}
      onCreateSlack={handleCreateSlack}
      onCreateNextcloud={handleCreateNextcloud}
      onShowMissingFields={handleShowMissingFields}
      onShowClassificationDetails={handleShowClassificationDetails}
      // Chat callbacks
      onSendMessage={handleSendMessage}
      onChipClick={handleChipClick}
      onCopyMessage={handleCopyMessage}
    />
  )
}
