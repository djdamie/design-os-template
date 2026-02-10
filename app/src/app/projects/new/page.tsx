'use client'

import { useCallback, useEffect, useMemo, useState, useRef } from 'react'
import { useCopilotChat, useCoAgent } from '@copilotkit/react-core'
import { Role, TextMessage } from '@copilotkit/runtime-client-gql'
import { useRouter } from 'next/navigation'
import { BriefWorkspace } from '@/components/brief-workspace'
import type { ChatMessage, SuggestionChip } from '@/components/brief-extraction/types'
import type { TabId, ProjectType } from '@/components/project-canvas/types'
import {
  mapBriefToFields,
  createDefaultProject,
  calculateMargin,
  createCompleteness,
  createDefaultTabs,
  createDefaultIntegrationStatus,
  createClassificationReasoning,
  type FlatExtractedBrief,
} from '@/lib/brief-to-canvas'
import { useTeamMembers } from '@/hooks/use-team-members'

// LangGraph message format from AG-UI
interface LangGraphMessage {
  id: string
  type: 'human' | 'ai' | 'system' | 'tool'
  content: string
  additional_kwargs?: Record<string, unknown>
  response_metadata?: Record<string, unknown>
}

interface BriefAnalyzerState {
  messages: LangGraphMessage[]
  extracted_brief: FlatExtractedBrief | null
  completeness: number
  project_type: string | null
  suggestion_chips: SuggestionChip[]
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

export default function NewProjectPage() {
  const router = useRouter()
  const [typeOverride, setTypeOverride] = useState<ProjectType | null>(null)
  // Local state for user field edits (overrides agent state)
  const [localFieldOverrides, setLocalFieldOverrides] = useState<Record<string, unknown>>({})
  // Track saved project ID (null = new project, string = saved)
  const [savedProjectId, setSavedProjectId] = useState<string | null>(null)
  // Track the last saved brief state to detect agent-initiated changes
  const lastSavedBriefRef = useRef<FlatExtractedBrief | null>(null)

  // useCopilotChat for sending messages
  const { appendMessage, isLoading } = useCopilotChat()

  // useCoAgent for reading AND writing agent state (bidirectional sync via AG-UI)
  const { state, setState } = useCoAgent<BriefAnalyzerState>({
    name: 'brief_analyzer',
    initialState: {
      ...EMPTY_AGENT_STATE,
    },
  })

  // Reset all state when starting a new project
  // (CopilotKit persists agent state across navigations since the provider doesn't remount)
  useEffect(() => {
    setState({ ...EMPTY_AGENT_STATE })
    setLocalFieldOverrides({})
    setSavedProjectId(null)
    lastSavedBriefRef.current = null
    setTypeOverride(null)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Get extracted brief from agent state, merged with local overrides
  const extractedBrief = useMemo(() => {
    const agentBrief = state?.extracted_brief
    if (!agentBrief) return null
    // Merge local field overrides on top of agent state
    return {
      ...agentBrief,
      ...localFieldOverrides,
    } as FlatExtractedBrief
  }, [state?.extracted_brief, localFieldOverrides])

  // Convert LangGraph messages to our ChatMessage format
  const messages: ChatMessage[] = useMemo(() => {
    const stateMessages = state?.messages || []
    return stateMessages
      .slice(-60)
      .filter((msg) => msg.type === 'human' || msg.type === 'ai')
      .map((msg) => {
        const role = msg.type === 'human' ? 'user' : 'assistant'
        return {
          id: msg.id,
          role: role as 'user' | 'assistant',
          content: msg.content || '',
          timestamp: '',
        }
      })
  }, [state?.messages])

  // Derive canvas data from extracted brief
  // Note: project_type and completeness come from root state, not inside extracted_brief
  const project = useMemo(() => {
    // Merge root-level state values into brief for createDefaultProject
    const briefWithState = extractedBrief ? {
      ...extractedBrief,
      project_type: state?.project_type || extractedBrief.project_type,
      completeness: state?.completeness ?? extractedBrief.completeness,
    } : null
    const proj = createDefaultProject(briefWithState)
    if (typeOverride) {
      return { ...proj, projectType: typeOverride, projectTypeOverride: typeOverride }
    }
    return proj
  }, [extractedBrief, state?.project_type, state?.completeness, typeOverride])

  const fields = useMemo(() => mapBriefToFields(extractedBrief), [extractedBrief])

  const marginCalculation = useMemo(
    () => calculateMargin(extractedBrief?.budget_amount || 0, project.projectType),
    [extractedBrief?.budget_amount, project.projectType]
  )

  const completenessBreakdown = useMemo(() => {
    // Use root-level completeness from state if available
    const briefWithCompleteness = extractedBrief ? {
      ...extractedBrief,
      completeness: state?.completeness ?? extractedBrief.completeness,
    } : null
    return createCompleteness(briefWithCompleteness)
  }, [extractedBrief, state?.completeness])

  const classificationReasoning = useMemo(() => {
    // Use root-level project_type from state if available
    const briefWithType = extractedBrief ? {
      ...extractedBrief,
      project_type: state?.project_type || extractedBrief.project_type,
    } : null
    const reasoning = createClassificationReasoning(briefWithType)
    if (typeOverride) {
      return {
        ...reasoning,
        currentType: typeOverride,
        isOverridden: true,
        reasoning: `Manually overridden to Type ${typeOverride}. ${reasoning.reasoning}`,
      }
    }
    return reasoning
  }, [extractedBrief, state?.project_type, typeOverride])

  // Static data
  const tabs = createDefaultTabs()
  const { teamMembers } = useTeamMembers()
  const integrationStatus = createDefaultIntegrationStatus()

  // Check if brief has changed since last save (detects agent-initiated changes)
  const hasAgentChanges = useMemo(() => {
    if (!savedProjectId || !state?.extracted_brief) return false
    if (!lastSavedBriefRef.current) return false
    
    // Compare current agent state with last saved state
    const currentBrief = state.extracted_brief
    const savedBrief = lastSavedBriefRef.current
    
    // Simple JSON comparison (works for flat objects)
    return JSON.stringify(currentBrief) !== JSON.stringify(savedBrief)
  }, [savedProjectId, state?.extracted_brief])

  // Chat callbacks
  const handleSendMessage = useCallback(
    (content: string) => {
      if (savedProjectId) {
        setState((prev) => {
          const previous = prev || EMPTY_AGENT_STATE
          if (previous.current_project_id === savedProjectId) {
            return previous
          }
          return {
            ...previous,
            current_project_id: savedProjectId,
          }
        })
      }
      appendMessage(new TextMessage({ content, role: Role.User }))
    },
    [appendMessage, savedProjectId, setState]
  )

  const handleChipClick = useCallback(
    (chipId: string, label: string) => {
      handleSendMessage(label)
    },
    [handleSendMessage]
  )

  const handleCopyMessage = useCallback(
    (messageId: string) => {
      const message = messages.find((m) => m.id === messageId)
      if (message) {
        navigator.clipboard.writeText(message.content)
      }
    },
    [messages]
  )

  // Canvas callbacks
  const handleTabChange = useCallback((tabId: TabId) => {
    void tabId
  }, [])

  const handleFieldUpdate = useCallback((fieldId: string, value: unknown) => {
    // Store user edits in local state (overrides agent state)
    setLocalFieldOverrides(prev => ({
      ...prev,
      [fieldId]: value,
    }))
  }, [])

  const handleTypeOverride = useCallback((newType: ProjectType | null) => {
    setTypeOverride(newType)
  }, [])

  const handleSave = useCallback(async () => {
    if (!extractedBrief) {
      console.warn('No brief data to save')
      return
    }

    console.log('Saving project to Supabase...')
    console.log('Brief data:', extractedBrief)

    try {
      let projectId = savedProjectId

      // If this is a new project, create it first
      if (!projectId) {
        // Create the project/case
        const createResponse = await fetch('/api/projects', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            catchy_case_id: `${extractedBrief.client_name || 'New'}-${Date.now()}`,
            project_type: state?.project_type || 'C',
          }),
        })

        if (!createResponse.ok) {
          throw new Error('Failed to create project')
        }

        const createResult = await createResponse.json()
        projectId = createResult.id
        setSavedProjectId(projectId)
        console.log('Created new project:', projectId)

        // Persist project context in agent state so follow-up chat edits are project-aware.
        setState((prev) => {
          const previous = prev || EMPTY_AGENT_STATE
          return {
            ...previous,
            current_project_id: projectId,
          }
        })
      }

      // Map the extracted brief to the API format
      const briefPayload = {
        // Business
        client: extractedBrief.client_name,
        agency: extractedBrief.agency_name,
        brand: extractedBrief.brand_name,
        project_title: extractedBrief.project_title,
        media: extractedBrief.media_types,
        term: extractedBrief.term_length,
        territory: extractedBrief.territory,
        budget_min: extractedBrief.budget_amount,
        budget_max: extractedBrief.budget_amount,
        exclusivity: extractedBrief.exclusivity,
        exclusivity_details: extractedBrief.exclusivity_details,
        // Brief sender
        brief_sender_name: extractedBrief.brief_sender_name,
        brief_sender_email: extractedBrief.brief_sender_email,
        brief_sender_role: extractedBrief.brief_sender_role,
        // Creative
        creative_direction: extractedBrief.creative_direction,
        mood_keywords: extractedBrief.mood_keywords,
        genre_preferences: extractedBrief.genre_preferences,
        reference_tracks: extractedBrief.reference_tracks,
        vocals_preference: extractedBrief.vocals_preference,
        must_avoid: extractedBrief.must_avoid,
        // Technical
        video_lengths: extractedBrief.video_lengths,
        stems_required: extractedBrief.stems_required,
        sync_points: extractedBrief.sync_points,
        // Timeline
        deadline_date: extractedBrief.deadline_date,
        first_presentation_date: extractedBrief.first_presentation_date,
        air_date: extractedBrief.air_date,
        deadline_urgency: extractedBrief.deadline_urgency,
        // Metadata
        extraction_status: 'complete',
        completeness: state?.completeness || 0,
        project_type: state?.project_type || 'C',
        extraction_notes: extractedBrief.extraction_notes,
      }

      // Update the brief
      const updateResponse = await fetch(`/api/projects/${projectId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(briefPayload),
      })

      if (!updateResponse.ok) {
        throw new Error('Failed to update brief')
      }

      console.log('Brief saved successfully!')

      // Store the saved state for future comparison
      // This includes both agent state and any local overrides
      lastSavedBriefRef.current = { ...extractedBrief }

      // Sync local overrides back to agent state
      if (state?.extracted_brief && Object.keys(localFieldOverrides).length > 0) {
        setState({
          ...state,
          extracted_brief: {
            ...state.extracted_brief,
            ...localFieldOverrides,
          },
        })
        setLocalFieldOverrides({})
      }

      // Show success feedback
      alert(`Project saved successfully! ID: ${projectId}`)

      // Move to the persisted project route so navigation/chat uses project-scoped context.
      if (projectId) {
        router.push(`/projects/${projectId}`)
      }

    } catch (error) {
      console.error('Error saving project:', error)
      alert('Failed to save project. Check the console for details.')
    }
  }, [extractedBrief, localFieldOverrides, state, setState, savedProjectId, router])

  const handleCreateSlack = useCallback(() => {
    console.log('Create Slack channel')
    // Would call n8n webhook
  }, [])

  const handleCreateNextcloud = useCallback(() => {
    console.log('Create Nextcloud folder')
    // Would call n8n webhook
  }, [])

  const handleShowMissingFields = useCallback(() => {
    console.log('Show missing fields modal')
  }, [])

  const handleShowClassificationDetails = useCallback(() => {
    console.log('Show classification details modal')
  }, [])

  return (
    <BriefWorkspace
      // Canvas props
      project={project}
      marginCalculation={marginCalculation}
      completenessBreakdown={completenessBreakdown}
      tabs={tabs}
      fields={fields}
      teamMembers={teamMembers}
      integrationStatus={integrationStatus}
      classificationReasoning={classificationReasoning}
      hasUnsavedChanges={(extractedBrief !== null && !savedProjectId) || Object.keys(localFieldOverrides).length > 0 || hasAgentChanges}
      // Chat props
      projectContext={{
        caseId: project.caseId,
        caseTitle: project.caseTitle,
        completeness: state?.completeness ?? 0,
      }}
      messages={messages}
      suggestionChips={state?.suggestion_chips ?? []}
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
