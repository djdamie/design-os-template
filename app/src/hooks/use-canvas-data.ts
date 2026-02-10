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
  ProjectType,
} from '@/components/project-canvas/types'
import {
  mapBriefToFields,
  calculateMargin as calculateMarginWithType,
  createDefaultIntegrationStatus,
  createClassificationReasoning,
  type FlatExtractedBrief,
} from '@/lib/brief-to-canvas'

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
  source_type?: string
  deliverable_formats?: string[]
  file_formats?: string[]

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

// Build integration status from project metadata
function buildIntegrationStatus(
  slackChannel: string | null,
  nextcloudFolder: string | null
): IntegrationStatus {
  return {
    ...createDefaultIntegrationStatus(),
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
  } | null,
  teamMembersOverride?: TeamMemberOption[]
): CanvasData {
  // Memoize the brief key to prevent expensive JSON.stringify on every render.
  // Only recalculate when the extractedBrief reference changes.
  const briefKey = useMemo(
    () => (extractedBrief ? JSON.stringify(extractedBrief) : 'null'),
    [extractedBrief]
  )

  return useMemo(() => {
    // Use mapBriefToFields from brief-to-canvas.ts — starts empty, only shows real data.
    // This eliminates sample data contamination.
    const briefForMapping = extractedBrief
      ? (extractedBrief as FlatExtractedBrief)
      : null
    const fields = mapBriefToFields(briefForMapping)

    // Calculate budget — use 0 when missing, never fall back to sample data
    const budget = extractedBrief?.budget_amount ?? 0

    // Determine project type from budget
    let projectType: ProjectType
    if (budget > 100000) projectType = 'A'
    else if (budget >= 25000) projectType = 'B'
    else if (budget >= 10000) projectType = 'C'
    else if (budget >= 2500) projectType = 'D'
    else projectType = 'E'

    const marginCalculation = calculateMarginWithType(budget, projectType)

    // Recalculate completeness from actual fields
    const completenessBreakdown = calculateCompleteness(fields)

    // Recalculate tab badges
    const tabs = calculateTabMissing(fields, completenessBreakdown)

    // Classification reasoning
    const classificationReasoning = createClassificationReasoning(briefForMapping)

    // Project metadata
    const projectTitle = extractedBrief?.project_title || projectMetadata?.project_title || 'Untitled Project'
    const caseNumberRaw = projectMetadata?.case_number
    const caseNumber = typeof caseNumberRaw === 'number'
      ? caseNumberRaw
      : typeof caseNumberRaw === 'string'
      ? Number.parseInt(caseNumberRaw.replace('TF-', ''), 36) || 0
      : 0
    const caseId = projectMetadata?.catchy_case_id || projectId.slice(0, 8)
    const slackChannel = projectMetadata?.slack_channel || null
    const nextcloudFolder = projectMetadata?.nextcloud_folder || null

    const integrationStatus = buildIntegrationStatus(slackChannel, nextcloudFolder)

    const project: Project = {
      id: projectId,
      caseNumber,
      caseId,
      caseTitle: projectTitle,
      projectType,
      projectTypeOverride: null,
      status: 'draft',
      completeness: completenessBreakdown.score,
      hasUnsavedChanges: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    return {
      project,
      marginCalculation,
      completenessBreakdown,
      tabs,
      fields,
      teamMembers: teamMembersOverride || [],
      integrationStatus,
      classificationReasoning,
    }
    // Use briefKey (stringified version) to ensure useMemo detects content changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    projectId,
    briefKey,
    projectMetadata?.project_title,
    projectMetadata?.case_number,
    projectMetadata?.catchy_case_id,
    projectMetadata?.slack_channel,
    projectMetadata?.nextcloud_folder,
    teamMembersOverride,
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
