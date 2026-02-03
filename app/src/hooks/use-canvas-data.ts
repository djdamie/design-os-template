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
  FieldStatus,
  FieldPriority,
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

// Helper to determine field status from value
function getFieldStatus(value: unknown, existingStatus?: FieldStatus): FieldStatus {
  if (existingStatus === 'user-edited') return 'user-edited'
  if (value === null || value === undefined || value === '') return 'empty'
  if (Array.isArray(value) && value.length === 0) return 'empty'
  return existingStatus || 'ai-filled'
}

// Calculate completeness from fields
function calculateCompleteness(fields: AllFields): CompletenessBreakdown {
  const criticalFields: string[] = []
  const importantFields: string[] = []
  const helpfulFields: string[] = []
  const missingFields: CompletenessBreakdown['missingFields'] = []

  // Walk through all fields and categorize
  const tabIds: TabId[] = ['WHAT', 'WHO', 'WITH_WHAT', 'WHEN', 'OTHER']

  // Debug: Check if fields structure is valid
  if (!fields || typeof fields !== 'object') {
    console.warn('calculateCompleteness: fields is invalid:', fields)
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
      console.debug(`calculateCompleteness: No fields for tab ${tabId}`)
      continue
    }

    for (const groupKey of Object.keys(tabFields)) {
      const group = tabFields[groupKey as keyof typeof tabFields]
      if (!group?.fields) {
        console.debug(`calculateCompleteness: No fields in group ${tabId}.${groupKey}`)
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
  extractedBrief?: ExtractedBrief | null
): CanvasData {
  // Log hook call BEFORE useMemo
  console.log('>>> useCanvasData HOOK CALLED with extractedBrief:', !!extractedBrief, extractedBrief?.project_title)

  // Create a stable dependency key from the brief content to ensure useMemo detects changes
  // React's useMemo uses reference equality for objects, which can miss updates
  const briefKey = extractedBrief ? JSON.stringify(extractedBrief) : 'null'
  console.log('>>> useCanvasData briefKey length:', briefKey.length)

  return useMemo(() => {
    console.log('>>> useCanvasData useMemo EXECUTING (briefKey length:', briefKey.length, ')')
    // Start with sample data as base
    const sampleData = sampleDataJson as unknown as CanvasData

    // Debug logging (use console.log not console.debug to ensure visibility)
    console.log('useCanvasData called:', {
      projectId,
      hasExtractedBrief: !!extractedBrief,
      extractedBriefKeys: extractedBrief ? Object.keys(extractedBrief) : [],
      project_title: extractedBrief?.project_title,
    })

    // If no extracted brief, return sample data
    if (!extractedBrief) {
      console.log('useCanvasData: No extracted brief, using sample data (completeness:', sampleData.completenessBreakdown.score, '%)')
      return {
        project: sampleData.project,
        marginCalculation: sampleData.marginCalculation,
        completenessBreakdown: sampleData.completenessBreakdown,
        tabs: sampleData.tabs,
        fields: sampleData.fields,
        teamMembers: sampleData.teamMembers,
        integrationStatus: sampleData.integrationStatus,
        classificationReasoning: sampleData.classificationReasoning,
      }
    }

    // Merge extracted brief data into fields
    const mergedFields = JSON.parse(JSON.stringify(sampleData.fields)) as AllFields
    let fieldsUpdatedCount = 0

    // Helper function to update a field if the value exists in extracted brief
    const updateField = (
      tab: TabId,
      group: string,
      fieldId: string,
      value: unknown
    ) => {
      // Log specifically for project_title to trace the issue
      if (fieldId === 'project_title') {
        console.log(`updateField: project_title called with value:`, value)
      }

      if (value === undefined || value === null || value === '') {
        if (fieldId === 'project_title') {
          console.log(`updateField: project_title skipped - value is empty/null/undefined`)
        }
        return
      }
      if (Array.isArray(value) && value.length === 0) return

      const tabFields = mergedFields[tab]
      if (!tabFields) {
        console.log(`updateField: Tab ${tab} not found`)
        return
      }
      const groupFields = tabFields[group as keyof typeof tabFields]
      if (!groupFields?.fields) {
        console.log(`updateField: Group ${tab}.${group} not found`)
        return
      }
      const field = groupFields.fields.find(f => f.id === fieldId)
      if (field) {
        field.value = value
        field.status = 'ai-filled'
        fieldsUpdatedCount++
        if (fieldId === 'project_title') {
          console.log(`updateField: project_title UPDATED to:`, value, 'status:', field.status)
        }
      } else {
        console.log(`updateField: Field ${fieldId} not found in ${tab}.${group}`)
      }
    }

    // WHAT tab - Client Info
    updateField('WHAT', 'clientInfo', 'client_name', extractedBrief.client_name)
    updateField('WHAT', 'clientInfo', 'agency_name', extractedBrief.agency_name)
    updateField('WHAT', 'clientInfo', 'brand_name', extractedBrief.brand_name)
    updateField('WHAT', 'clientInfo', 'brief_sender_name', extractedBrief.brief_sender_name)
    updateField('WHAT', 'clientInfo', 'brief_sender_email', extractedBrief.brief_sender_email)

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

    // WHEN tab - Urgency
    updateField('WHEN', 'urgency', 'deadline_urgency', extractedBrief.deadline_urgency)

    console.log(`useCanvasData: Updated ${fieldsUpdatedCount} fields from extracted brief`)

    // Verify project_title was set correctly
    const projectTitleField = mergedFields.WHAT?.projectDetails?.fields?.find(f => f.id === 'project_title')
    console.log('useCanvasData: project_title field after merge:', projectTitleField)

    // Calculate margin from budget
    const budget = extractedBrief.budget_amount || sampleData.marginCalculation.budget
    const marginCalculation = calculateMargin(budget)

    // Recalculate completeness
    const completenessBreakdown = calculateCompleteness(mergedFields)
    console.log('useCanvasData: Calculated completeness:', {
      score: completenessBreakdown.score,
      criticalComplete: `${completenessBreakdown.criticalComplete}/${completenessBreakdown.criticalTotal}`,
      importantComplete: `${completenessBreakdown.importantComplete}/${completenessBreakdown.importantTotal}`,
      helpfulComplete: `${completenessBreakdown.helpfulComplete}/${completenessBreakdown.helpfulTotal}`,
      missingFieldsCount: completenessBreakdown.missingFields.length,
    })

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
    const project: Project = {
      ...sampleData.project,
      id: projectId,
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
      integrationStatus: sampleData.integrationStatus,
      classificationReasoning,
    }
    console.log('>>> useCanvasData useMemo COMPLETE - returning project type:', result.project.projectType, 'completeness:', result.completenessBreakdown.score)
    return result
    // Use briefKey (stringified version) to ensure useMemo detects content changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId, briefKey])
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
