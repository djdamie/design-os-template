// Transform canvas data to n8n webhook payload format

import type { AllFields, CanvasField } from '@/components/project-canvas/types'

// Helper to extract field value from canvas fields structure
function getFieldValue(fields: AllFields, tab: string, group: string, fieldId: string): unknown {
  const tabFields = fields[tab as keyof AllFields]
  if (!tabFields) return undefined
  const groupFields = tabFields[group as keyof typeof tabFields]
  if (!groupFields?.fields) return undefined
  const field = groupFields.fields.find((f: CanvasField) => f.id === fieldId)
  return field?.value
}

export interface N8NUser {
  email: string
  name: string
  id: string
  role: string
}

export interface N8NBriefAnalysis {
  business_brief: {
    client: string | null
    agency: string | null
    brand: string | null
    media: string[] | null
    term: string | null
    territory: string[] | null
    budget: string | null
    lengths: string[] | null
    cutdowns: string[] | null
    extras: string | null
  }
  creative_brief: {
    mood: string | null
    keywords: string[] | null
    genres: string[] | null
    instruments: string[] | null
    reference_tracks: unknown[] | null
    descriptions: string | null
    lyrics_requirements: string | null
    enhanced_interpretation?: {
      search_keywords: string[]
      mood_descriptors: string[]
      genre_suggestions: string[]
      reference_analysis: string
    }
  }
  contextual_brief: {
    brand: string | null
    brand_category: string | null
    brand_attributes: string[] | null
    audience_preferences: string | null
    story: string | null
  }
  technical_brief: {
    lengths: string[] | null
    musical_attributes: Record<string, unknown> | null
    stem_requirements: string | null
    format_specs: string | null
  }
  deliverables: {
    submission_deadline: string | null
    ppm_date: string | null
    shoot_date: string | null
    offline_date: string | null
    online_date: string | null
    air_date: string | null
  }
  missing_information: string[]
  brief_quality: string
  confidence_score: number
  extraction_status: string
}

export interface N8NWebhookPayload {
  briefAnalysis: N8NBriefAnalysis
  user: N8NUser
  projectId: string
  chatId?: string
  messageId?: string
  version: number
  timestamp: string
}

export function transformFieldsToN8NPayload(
  fields: AllFields,
  projectId: string,
  user: N8NUser,
  options?: {
    chatId?: string
    messageId?: string
  }
): N8NWebhookPayload {
  // Extract all field values
  const client = getFieldValue(fields, 'WHAT', 'clientInfo', 'client_name') as string | null
  const agency = getFieldValue(fields, 'WHAT', 'clientInfo', 'agency_name') as string | null
  const brand = getFieldValue(fields, 'WHAT', 'clientInfo', 'brand_name') as string | null
  const media = getFieldValue(fields, 'WHAT', 'rightsUsage', 'media_types') as string[] | null
  const term = getFieldValue(fields, 'WHAT', 'rightsUsage', 'term_length') as string | null
  const territory = getFieldValue(fields, 'WHAT', 'rightsUsage', 'territory') as string[] | null
  const budgetAmount = getFieldValue(fields, 'WHAT', 'budget', 'budget_amount') as number | null
  const videoLengths = getFieldValue(fields, 'WHAT', 'projectDetails', 'video_lengths') as string[] | null

  // Creative fields
  const mood = getFieldValue(fields, 'WHAT', 'creative', 'creative_direction') as string | null
  const keywords = getFieldValue(fields, 'WHAT', 'creative', 'mood_keywords') as string[] | null
  const genres = getFieldValue(fields, 'WHAT', 'creative', 'genre_preferences') as string[] | null
  const referenceTracks = getFieldValue(fields, 'WHAT', 'creative', 'reference_tracks') as unknown[] | null
  const vocalsPreference = getFieldValue(fields, 'WHAT', 'creative', 'vocals_preference') as string | null
  const mustAvoid = getFieldValue(fields, 'WHAT', 'creative', 'must_avoid') as string | null

  // Technical fields
  const syncPoints = getFieldValue(fields, 'WITH_WHAT', 'technical', 'sync_points') as string | null
  const stemsRequired = getFieldValue(fields, 'WITH_WHAT', 'deliverables', 'stems_required') as boolean | null

  // Timeline fields
  const submissionDeadline = getFieldValue(fields, 'WHEN', 'keyDates', 'deadline_date') as string | null
  const firstPresentation = getFieldValue(fields, 'WHEN', 'keyDates', 'first_presentation_date') as string | null
  const airDate = getFieldValue(fields, 'WHEN', 'keyDates', 'air_date') as string | null
  const deadlineUrgency = getFieldValue(fields, 'WHEN', 'urgency', 'deadline_urgency') as string | null

  // Context fields
  const campaignContext = getFieldValue(fields, 'OTHER', 'context', 'campaign_context') as string | null
  const targetAudience = getFieldValue(fields, 'OTHER', 'context', 'target_audience') as string | null
  const brandValues = getFieldValue(fields, 'OTHER', 'context', 'brand_values') as string[] | null

  // Calculate missing fields
  const missingFields: string[] = []
  if (!client) missingFields.push('client')
  if (!budgetAmount) missingFields.push('budget')
  if (!territory || territory.length === 0) missingFields.push('territory')
  if (!media || media.length === 0) missingFields.push('media')
  if (!submissionDeadline) missingFields.push('submission_deadline')

  // Determine brief quality
  const criticalFieldsCount = 5
  const filledCritical = criticalFieldsCount - missingFields.length
  const briefQuality = filledCritical === criticalFieldsCount ? 'complete'
    : filledCritical >= 3 ? 'good'
    : filledCritical >= 2 ? 'partial'
    : 'incomplete'

  return {
    briefAnalysis: {
      business_brief: {
        client,
        agency,
        brand,
        media,
        term,
        territory,
        budget: budgetAmount ? String(budgetAmount) : null,
        lengths: videoLengths,
        cutdowns: null, // Not typically in canvas, could be derived from lengths
        extras: null,
      },
      creative_brief: {
        mood,
        keywords,
        genres,
        instruments: null, // Not typically captured
        reference_tracks: referenceTracks,
        descriptions: mood, // Use mood as description fallback
        lyrics_requirements: vocalsPreference,
        enhanced_interpretation: {
          search_keywords: keywords || [],
          mood_descriptors: keywords || [],
          genre_suggestions: genres || [],
          reference_analysis: '',
        },
      },
      contextual_brief: {
        brand,
        brand_category: null,
        brand_attributes: brandValues,
        audience_preferences: targetAudience,
        story: campaignContext,
      },
      technical_brief: {
        lengths: videoLengths,
        musical_attributes: null,
        stem_requirements: stemsRequired ? 'Full stems needed' : 'No stems required',
        format_specs: null,
      },
      deliverables: {
        submission_deadline: submissionDeadline,
        ppm_date: firstPresentation,
        shoot_date: null,
        offline_date: null,
        online_date: null,
        air_date: airDate,
      },
      missing_information: missingFields,
      brief_quality: briefQuality,
      confidence_score: filledCritical / criticalFieldsCount,
      extraction_status: 'complete',
    },
    user,
    projectId,
    chatId: options?.chatId,
    messageId: options?.messageId,
    version: 1,
    timestamp: new Date().toISOString(),
  }
}

// Simpler payload for specific actions
export function createSlackChannelPayload(
  projectId: string,
  caseNumber: string | null,
  caseId: string,
  fields: AllFields,
  user: N8NUser
) {
  return {
    action: 'create_slack_channel',
    project_id: projectId,
    case_number: caseNumber,
    case_id: caseId,
    ...transformFieldsToN8NPayload(fields, projectId, user),
  }
}

export function createNextcloudFolderPayload(
  projectId: string,
  caseNumber: string | null,
  caseId: string,
  fields: AllFields,
  user: N8NUser
) {
  return {
    action: 'create_nextcloud_folder',
    project_id: projectId,
    case_number: caseNumber,
    case_id: caseId,
    ...transformFieldsToN8NPayload(fields, projectId, user),
  }
}
