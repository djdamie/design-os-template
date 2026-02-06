'use client'

import { useMemo } from 'react'
import type {
  Project,
  MarginCalculation,
  CompletenessBreakdown,
  CanvasTab,
  AllFields,
  TeamMemberOption,
  IntegrationStatus,
  ClassificationReasoning,
  TabId,
} from '@/components/project-canvas/types'
import { calculateMargin } from '@/types/types'

// Sample data imported from JSON structure
import sampleDataJson from '@/data/canvas-sample-data.json'

// ExtractedBrief type from the brief analyzer agent
export interface ExtractedBrief {
  // Client Info
  client_name?: string
  agency_name?: string
  brand_name?: string
  brief_sender_name?: string
  brief_sender_email?: string
  brief_sender_role?: string

  // Project Details
  project_title?: string
  video_lengths?: string[]
  language_adaptations?: string[]

  // Rights & Usage
  territory?: string[]
  media_types?: string[]
  term_length?: string
  exclusivity?: boolean
  exclusivity_details?: string

  // Budget
  budget_amount?: number
  budget_currency?: 'EUR' | 'USD' | 'GBP' | 'CHF'

  // Creative
  creative_direction?: string
  mood_keywords?: string[]
  genre_preferences?: string[]
  reference_tracks?: Array<{ artist: string; title: string | null; notes?: string }>
  must_avoid?: string
  vocals_preference?: 'instrumental' | 'vocals' | 'either' | 'specific'

  // Technical
  sync_points?: string
  stems_required?: boolean

  // Timeline
  deadline_date?: string
  first_presentation_date?: string
  air_date?: string
  deadline_urgency?: 'standard' | 'rush' | 'urgent'
  kickoff_date?: string

  // Context
  campaign_context?: string
  target_audience?: string
  brand_values?: string[]

  // Agent notes
  extraction_notes?: string  // Agent observations about ambiguous/interpreted information

  // Allow additional fields
  [key: string]: unknown
}

export interface CanvasData {
  project: Project
  marginCalculation: MarginCalculation
  completenessBreakdown: CompletenessBreakdown
  tabs: CanvasTab[]
  fields: AllFields
  teamMembers: TeamMemberOption[]
  integrationStatus: IntegrationStatus
  classificationReasoning: ClassificationReasoning
}

// Calculate completeness from fields
function calculateCompleteness(fields: AllFields): CompletenessBreakdown {
  const criticalFields: string[] = []
  const importantFields: string[] = []
  const helpfulFields: string[] = []
  const missingFields: CompletenessBreakdown['missingFields'] = []

  // Walk through all fields and categorize
  const tabIds: TabId[] = ['WHAT', 'WHO', 'WITH_WHAT', 'WHEN', 'OTHER']

  if (!fields || typeof fields !== 'object') {
    return {
      score: 0,
      criticalComplete: 0,
      criticalTotal: 0,
      importantComplete: 0,
      importantTotal: 0,
      helpfulComplete: 0,
      helpfulTotal: 0,
      missingFields: [],
    }
  }

  for (const tabId of tabIds) {
    const tabFields = fields[tabId]
    if (!tabFields) {
      continue
    }

    for (const groupKey of Object.keys(tabFields)) {
      const group = tabFields[groupKey as keyof typeof tabFields]
      if (!group?.fields) {
        continue
      }

      for (const field of group.fields) {
        // Treat undefined/missing status as empty
        const isEmpty = !field.status || field.status === 'empty'

        switch (field.priority) {
          case 'critical':
            criticalFields.push(field.id)
            if (isEmpty) {
              missingFields.push({ field: field.id, priority: 'critical', tab: tabId })
            }
            break
          case 'important':
            importantFields.push(field.id)
            if (isEmpty) {
              missingFields.push({ field: field.id, priority: 'important', tab: tabId })
            }
            break
          case 'helpful':
            helpfulFields.push(field.id)
            if (isEmpty) {
              missingFields.push({ field: field.id, priority: 'helpful', tab: tabId })
            }
            break
        }
      }
    }
  }

  const criticalComplete = criticalFields.length - missingFields.filter(f => f.priority === 'critical').length
  const importantComplete = importantFields.length - missingFields.filter(f => f.priority === 'important').length
  const helpfulComplete = helpfulFields.length - missingFields.filter(f => f.priority === 'helpful').length

  // Calculate weighted score:
  // Critical: 60% weight, Important: 30% weight, Helpful: 10% weight
  const criticalScore = criticalFields.length > 0
    ? (criticalComplete / criticalFields.length) * 60
    : 60
  const importantScore = importantFields.length > 0
    ? (importantComplete / importantFields.length) * 30
    : 30
  const helpfulScore = helpfulFields.length > 0
    ? (helpfulComplete / helpfulFields.length) * 10
    : 10

  const score = Math.round(criticalScore + importantScore + helpfulScore)

  return {
    score,
    criticalComplete,
    criticalTotal: criticalFields.length,
    importantComplete,
    importantTotal: importantFields.length,
    helpfulComplete,
    helpfulTotal: helpfulFields.length,
    missingFields,
  }
}

// Calculate tab missing counts
function calculateTabMissing(
  fields: AllFields,
  completeness: CompletenessBreakdown
): CanvasTab[] {
  const tabs: CanvasTab[] = [
    { id: 'WHAT', label: 'WHAT', description: 'Project overview, client info, rights & budget', missingCritical: 0, missingImportant: 0 },
    { id: 'WHO', label: 'WHO', description: 'Team assignments and responsibilities', missingCritical: 0, missingImportant: 0 },
    { id: 'WITH_WHAT', label: 'WITH WHAT', description: 'Tools, sources, deliverables & technical specs', missingCritical: 0, missingImportant: 0 },
    { id: 'WHEN', label: 'WHEN', description: 'Timeline, deadlines & milestones', missingCritical: 0, missingImportant: 0 },
    { id: 'OTHER', label: 'OTHER', description: 'Notes, context & attachments', missingCritical: 0, missingImportant: 0 },
  ]

  for (const missing of completeness.missingFields) {
    const tab = tabs.find(t => t.id === missing.tab)
    if (tab) {
      if (missing.priority === 'critical') {
        tab.missingCritical++
      } else if (missing.priority === 'important') {
        tab.missingImportant++
      }
    }
  }

  return tabs
}

// Hook to get canvas data
export function useCanvasData(
  projectId: string,
  extractedBrief?: ExtractedBrief | null,
  projectMetadata?: {
    project_title?: string | null
    case_number?: number | string | null
    catchy_case_id?: string | null
    slack_channel?: string | null
    nextcloud_folder?: string | null
  } | null
): CanvasData {
  // Memoize the brief key to prevent expensive JSON.stringify on every render.
  // Only recalculate when the extractedBrief reference changes.
  const briefKey = useMemo(
    () => (extractedBrief ? JSON.stringify(extractedBrief) : 'null'),
    [extractedBrief]
  )

  return useMemo(() => {
    // Start with sample data as base
    const sampleData = sampleDataJson as unknown as CanvasData

    // If no extracted brief, return sample data with metadata applied
    if (!extractedBrief) {
      const projectTitle = projectMetadata?.project_title || sampleData.project.caseTitle
      const caseNumberRaw = projectMetadata?.case_number
      const caseNumber = typeof caseNumberRaw === 'number'
        ? caseNumberRaw
        : typeof caseNumberRaw === 'string'
        ? Number.parseInt(caseNumberRaw.replace('TF-', ''), 36) || sampleData.project.caseNumber
        : sampleData.project.caseNumber
      const caseId = projectMetadata?.catchy_case_id || projectId.slice(0, 8)
      const slackChannel = projectMetadata?.slack_channel || null
      const nextcloudFolder = projectMetadata?.nextcloud_folder || null
      const integrationStatus: IntegrationStatus = {
        ...sampleData.integrationStatus,
        slack: {
          connected: !!slackChannel,
          channelName: slackChannel,
          channelUrl: slackChannel?.startsWith('http') ? slackChannel : null,
          connectedAt: slackChannel ? new Date().toISOString() : null,
        },
        nextcloud: {
          connected: !!nextcloudFolder,
          folderPath: nextcloudFolder,
          folderUrl: nextcloudFolder?.startsWith('http') ? nextcloudFolder : null,
          connectedAt: nextcloudFolder ? new Date().toISOString() : null,
          lastSyncedAt: null,
        },
        allSetUp: !!slackChannel && !!nextcloudFolder,
      }

      return {
        project: {
          ...sampleData.project,
          id: projectId,
          caseTitle: projectTitle,
          caseNumber: caseNumber,
          caseId: caseId,
        },
        marginCalculation: sampleData.marginCalculation,
        completenessBreakdown: sampleData.completenessBreakdown,
        tabs: sampleData.tabs,
        fields: sampleData.fields,
        teamMembers: sampleData.teamMembers,
        integrationStatus,
        classificationReasoning: sampleData.classificationReasoning,
      }
    }

    // Merge extracted brief data into fields
    const mergedFields = JSON.parse(JSON.stringify(sampleData.fields)) as AllFields

    // Helper function to update a field if the value exists in extracted brief
    const updateField = (
      tab: TabId,
      group: string,
      fieldId: string,
      value: unknown
    ) => {
      if (value === undefined || value === null || value === '') {
        return
      }
      if (Array.isArray(value) && value.length === 0) return

      const tabFields = mergedFields[tab]
      if (!tabFields) return
      const groupFields = tabFields[group as keyof typeof tabFields]
      if (!groupFields?.fields) return
      const field = groupFields.fields.find(f => f.id === fieldId)
      if (field) {
        field.value = value
        field.status = 'ai-filled'
      }
    }

    // WHAT tab - Client Info
    updateField('WHAT', 'clientInfo', 'client_name', extractedBrief.client_name)
    updateField('WHAT', 'clientInfo', 'agency_name', extractedBrief.agency_name)
    updateField('WHAT', 'clientInfo', 'brand_name', extractedBrief.brand_name)
    updateField('WHAT', 'clientInfo', 'brief_sender_name', extractedBrief.brief_sender_name)
    updateField('WHAT', 'clientInfo', 'brief_sender_email', extractedBrief.brief_sender_email)
    updateField('WHAT', 'clientInfo', 'brief_sender_role', extractedBrief.brief_sender_role)

    // WHAT tab - Project Details
    updateField('WHAT', 'projectDetails', 'project_title', extractedBrief.project_title)
    updateField('WHAT', 'projectDetails', 'video_lengths', extractedBrief.video_lengths)

    // WHAT tab - Rights & Usage
    updateField('WHAT', 'rightsUsage', 'territory', extractedBrief.territory)
    updateField('WHAT', 'rightsUsage', 'media_types', extractedBrief.media_types)
    updateField('WHAT', 'rightsUsage', 'term_length', extractedBrief.term_length)
    updateField('WHAT', 'rightsUsage', 'exclusivity', extractedBrief.exclusivity)
    updateField('WHAT', 'rightsUsage', 'exclusivity_details', extractedBrief.exclusivity_details)

    // WHAT tab - Budget
    updateField('WHAT', 'budget', 'budget_amount', extractedBrief.budget_amount)
    updateField('WHAT', 'budget', 'budget_currency', extractedBrief.budget_currency)

    // WHAT tab - Creative
    updateField('WHAT', 'creative', 'creative_direction', extractedBrief.creative_direction)
    updateField('WHAT', 'creative', 'mood_keywords', extractedBrief.mood_keywords)
    updateField('WHAT', 'creative', 'genre_preferences', extractedBrief.genre_preferences)
    updateField('WHAT', 'creative', 'reference_tracks', extractedBrief.reference_tracks)
    updateField('WHAT', 'creative', 'must_avoid', extractedBrief.must_avoid)
    updateField('WHAT', 'creative', 'vocals_preference', extractedBrief.vocals_preference)

    // WITH_WHAT tab - Technical
    updateField('WITH_WHAT', 'technical', 'sync_points', extractedBrief.sync_points)

    // WITH_WHAT tab - Deliverables
    updateField('WITH_WHAT', 'deliverables', 'stems_required', extractedBrief.stems_required)

    // WHEN tab - Key Dates
    updateField('WHEN', 'keyDates', 'deadline_date', extractedBrief.deadline_date)
    updateField('WHEN', 'keyDates', 'first_presentation_date', extractedBrief.first_presentation_date)
    updateField('WHEN', 'keyDates', 'air_date', extractedBrief.air_date)
    updateField('WHEN', 'keyDates', 'kickoff_date', extractedBrief.kickoff_date)

    // WHEN tab - Urgency
    updateField('WHEN', 'urgency', 'deadline_urgency', extractedBrief.deadline_urgency)

    // OTHER tab - Context
    updateField('OTHER', 'context', 'campaign_context', extractedBrief.campaign_context)
    updateField('OTHER', 'context', 'target_audience', extractedBrief.target_audience)
    updateField('OTHER', 'context', 'brand_values', extractedBrief.brand_values)

    // OTHER tab - Notes
    updateField('OTHER', 'notes', 'extraction_notes', extractedBrief.extraction_notes)

    // Calculate margin from budget
    const budget = extractedBrief.budget_amount || sampleData.marginCalculation.budget
    const marginCalculation = calculateMargin(budget)

    // Recalculate completeness
    const completenessBreakdown = calculateCompleteness(mergedFields)

    // Recalculate tab badges
    const tabs = calculateTabMissing(mergedFields, completenessBreakdown)

    // Update classification based on margin tier
    const classificationReasoning: ClassificationReasoning = {
      currentType: marginCalculation.tier,
      calculatedType: marginCalculation.tier,
      isOverridden: false,
      reasoning: `Budget of €${budget.toLocaleString()} ${
        marginCalculation.tier === 'A' ? 'exceeds €100,000 threshold for Type A' :
        marginCalculation.tier === 'B' ? 'is between €25,000-€100,000 for Type B' :
        marginCalculation.tier === 'C' ? 'is between €10,000-€25,000 for Type C' :
        marginCalculation.tier === 'D' ? 'is between €2,500-€10,000 for Type D' :
        'is below €2,500 for Type E'
      } classification.`,
    }

    // Update project with new values
    // Prioritize: extractedBrief.project_title > projectMetadata.project_title > sample data
    const projectTitle = extractedBrief.project_title || projectMetadata?.project_title || sampleData.project.caseTitle
    const caseNumberRaw = projectMetadata?.case_number
    const caseNumber = typeof caseNumberRaw === 'number'
      ? caseNumberRaw
      : typeof caseNumberRaw === 'string'
      ? Number.parseInt(caseNumberRaw.replace('TF-', ''), 36) || sampleData.project.caseNumber
      : sampleData.project.caseNumber
    const caseId = projectMetadata?.catchy_case_id || projectId.slice(0, 8)
    const slackChannel = projectMetadata?.slack_channel || null
    const nextcloudFolder = projectMetadata?.nextcloud_folder || null
    const integrationStatus: IntegrationStatus = {
      ...sampleData.integrationStatus,
      slack: {
        connected: !!slackChannel,
        channelName: slackChannel,
        channelUrl: slackChannel?.startsWith('http') ? slackChannel : null,
        connectedAt: slackChannel ? new Date().toISOString() : null,
      },
      nextcloud: {
        connected: !!nextcloudFolder,
        folderPath: nextcloudFolder,
        folderUrl: nextcloudFolder?.startsWith('http') ? nextcloudFolder : null,
        connectedAt: nextcloudFolder ? new Date().toISOString() : null,
        lastSyncedAt: null,
      },
      allSetUp: !!slackChannel && !!nextcloudFolder,
    }

    const project: Project = {
      ...sampleData.project,
      id: projectId,
      caseTitle: projectTitle,
      caseNumber: caseNumber,
      caseId: caseId,
      projectType: marginCalculation.tier,
      completeness: completenessBreakdown.score,
    }

    const result = {
      project,
      marginCalculation,
      completenessBreakdown,
      tabs,
      fields: mergedFields,
      teamMembers: sampleData.teamMembers,
      integrationStatus,
      classificationReasoning,
    }
    return result
    // Use briefKey (stringified version) to ensure useMemo detects content changes
    // Include projectMetadata in dependencies
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    projectId,
    briefKey,
    projectMetadata?.project_title,
    projectMetadata?.case_number,
    projectMetadata?.catchy_case_id,
    projectMetadata?.slack_channel,
    projectMetadata?.nextcloud_folder,
  ])
}

// Hook to update a single field value
export function updateFieldValue(
  fields: AllFields,
  fieldId: string,
  newValue: unknown
): AllFields {
  const updatedFields = { ...fields }
  const tabIds: TabId[] = ['WHAT', 'WHO', 'WITH_WHAT', 'WHEN', 'OTHER']

  for (const tabId of tabIds) {
    const tabFields = updatedFields[tabId]
    if (!tabFields) continue

    for (const groupKey of Object.keys(tabFields)) {
      const group = tabFields[groupKey as keyof typeof tabFields]
      if (!group?.fields) continue

      const fieldIndex = group.fields.findIndex(f => f.id === fieldId)
      if (fieldIndex >= 0) {
        // Found the field, update it
        group.fields[fieldIndex] = {
          ...group.fields[fieldIndex],
          value: newValue,
          status: 'user-edited',
        }
        return updatedFields
      }
    }
  }

  return updatedFields
}
