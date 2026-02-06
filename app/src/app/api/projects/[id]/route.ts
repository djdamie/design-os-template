import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/client'
import {
  N8N_ENDPOINTS,
  callN8NWebhook,
  triggerProjectSetup,
  triggerBriefSync,
} from '@/lib/n8n/client'
import type { TFBrief } from '@/lib/supabase/types'

// Month name to number mapping
const MONTHS: Record<string, number> = {
  january: 0, jan: 0,
  february: 1, feb: 1,
  march: 2, mar: 2,
  april: 3, apr: 3,
  may: 4,
  june: 5, jun: 5,
  july: 6, jul: 6,
  august: 7, aug: 7,
  september: 8, sep: 8, sept: 8,
  october: 9, oct: 9,
  november: 10, nov: 10,
  december: 11, dec: 11,
}

// Helper to parse natural language dates like "mid-March", "early April", "late January"
function parseNaturalDate(value: string): Date | null {
  const normalized = value.toLowerCase().trim()

  // Try patterns like "mid-March", "early April", "late January 2024"
  const timeModifiers = ['early', 'mid', 'late', 'end of', 'beginning of', 'start of']

  for (const modifier of timeModifiers) {
    if (normalized.includes(modifier)) {
      // Extract month name
      for (const [monthName, monthNum] of Object.entries(MONTHS)) {
        if (normalized.includes(monthName)) {
          // Determine approximate day based on modifier
          let day = 15 // default to mid-month
          if (modifier === 'early' || modifier === 'beginning of' || modifier === 'start of') {
            day = 5
          } else if (modifier === 'mid') {
            day = 15
          } else if (modifier === 'late' || modifier === 'end of') {
            day = 25
          }

          // Extract year if present, otherwise use current/next year
          const yearMatch = normalized.match(/\b(20\d{2})\b/)
          let year = new Date().getFullYear()
          if (yearMatch) {
            year = parseInt(yearMatch[1], 10)
          } else {
            // If the month is in the past, assume next year
            const now = new Date()
            if (monthNum < now.getMonth() || (monthNum === now.getMonth() && day < now.getDate())) {
              year = now.getFullYear() + 1
            }
          }

          return new Date(year, monthNum, day)
        }
      }
    }
  }

  // Try "next Wednesday", "this Friday" patterns
  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
  for (let i = 0; i < days.length; i++) {
    if (normalized.includes(days[i])) {
      const now = new Date()
      const currentDay = now.getDay()
      let daysToAdd = i - currentDay
      if (daysToAdd <= 0) daysToAdd += 7 // next week
      if (normalized.includes('next')) daysToAdd += 7
      const result = new Date(now)
      result.setDate(result.getDate() + daysToAdd)
      return result
    }
  }

  return null
}

// Helper to validate and sanitize date fields
// Handles ISO dates, natural language dates, and returns null for truly invalid dates
function sanitizeDate(value: unknown): string | null {
  if (!value) return null
  if (typeof value !== 'string') return null

  // First, try to parse as standard date
  const date = new Date(value)
  if (!isNaN(date.getTime())) {
    return date.toISOString()
  }

  // Try to parse natural language date
  const naturalDate = parseNaturalDate(value)
  if (naturalDate) {
    return naturalDate.toISOString()
  }

  // Could not parse - return null
  console.warn(`Could not parse date: "${value}"`)
  return null
}

// GET /api/projects/[id] - Fetch a project with its brief
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = createServerClient()

    const { data, error } = await supabase
      .from('tf_cases')
      .select('*, tf_briefs(*)')
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Project not found' }, { status: 404 })
      }
      throw error
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching project:', error)
    return NextResponse.json(
      { error: 'Failed to fetch project' },
      { status: 500 }
    )
  }
}

// PUT /api/projects/[id] - Update a project's brief data
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const supabase = createServerClient()

    // Extract brief fields from the request body
    const briefUpdate: Partial<TFBrief> = {
      // Business
      client: body.client,
      agency: body.agency,
      brand: body.brand,
      project_title: body.project_title,
      media: body.media,
      term: body.term,
      territory: body.territory,
      budget_raw: body.budget_raw,
      budget_min: body.budget_min,
      budget_max: body.budget_max,
      exclusivity: body.exclusivity,
      exclusivity_details: body.exclusivity_details,
      // Brief sender info
      brief_sender_name: body.brief_sender_name,
      brief_sender_email: body.brief_sender_email,
      brief_sender_role: body.brief_sender_role,
      // Creative
      creative_direction: body.creative_direction,
      mood: body.mood || body.creative_direction,
      keywords: body.keywords || body.mood_keywords,
      genres: body.genres || body.genre_preferences,
      mood_descriptors: body.mood_descriptors,
      reference_tracks: body.reference_tracks,
      instruments: body.instruments,
      vocals_preference: body.vocals_preference,
      must_avoid: body.must_avoid,
      lyrics_requirements: body.lyrics_requirements,
      // Technical
      lengths: body.lengths || body.video_lengths,
      cutdowns: body.cutdowns,
      stems_required: body.stems_required,
      sync_points: body.sync_points,
      // Context
      campaign_context: body.campaign_context,
      target_audience: body.target_audience,
      brand_values: body.brand_values,
      // Timeline - sanitize dates to prevent invalid timestamp errors
      submission_deadline: sanitizeDate(body.submission_deadline || body.deadline_date),
      first_presentation_date: sanitizeDate(body.first_presentation_date),
      ppm_date: sanitizeDate(body.ppm_date),
      shoot_date: sanitizeDate(body.shoot_date),
      offline_date: sanitizeDate(body.offline_date),
      online_date: sanitizeDate(body.online_date),
      air_date: sanitizeDate(body.air_date),
      deadline_urgency: body.deadline_urgency,
      // Source
      raw_brief_text: body.raw_brief_text,
      brief_source: body.brief_source,
      // Metadata
      extraction_status: body.extraction_status,
      brief_quality: body.brief_quality,
      completion_rate: body.completion_rate || body.completeness,
      missing_information: body.missing_information,
      extraction_notes: body.extraction_notes,
      updated_at: new Date().toISOString(),
    }

    // Remove undefined values
    Object.keys(briefUpdate).forEach((key) => {
      if (briefUpdate[key as keyof typeof briefUpdate] === undefined) {
        delete briefUpdate[key as keyof typeof briefUpdate]
      }
    })

    // Update the brief
    const { data: briefData, error: briefError } = await supabase
      .from('tf_briefs')
      .update(briefUpdate)
      .eq('case_id', id)
      .select()
      .single()

    if (briefError) {
      // If no brief exists, create one
      if (briefError.code === 'PGRST116') {
        const { data: newBrief, error: createError } = await supabase
          .from('tf_briefs')
          .insert({ case_id: id, ...briefUpdate })
          .select()
          .single()

        if (createError) throw createError

        // Log the activity
        await logActivity(supabase, id, 'brief_created', 'Brief created', body.user_id)

        return NextResponse.json(newBrief)
      }
      throw briefError
    }

    // Update case-level fields if provided
    const caseUpdate: Record<string, unknown> = {
      updated_at: new Date().toISOString()
    }
    if (body.project_type) caseUpdate.project_type = body.project_type
    if (body.project_title) caseUpdate.project_title = body.project_title

    if (Object.keys(caseUpdate).length > 1) {
      await supabase
        .from('tf_cases')
        .update(caseUpdate)
        .eq('id', id)
    }

    // Log the activity
    await logActivity(supabase, id, 'brief_updated', 'Brief updated from canvas', body.user_id, briefUpdate)

    return NextResponse.json(briefData)
  } catch (error) {
    console.error('Error updating project:', error)
    return NextResponse.json(
      { error: 'Failed to update project' },
      { status: 500 }
    )
  }
}

// POST /api/projects/[id] - Create a new project or trigger actions
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const supabase = createServerClient()

    const { data: projectData, error: projectError } = await supabase
      .from('tf_cases')
      .select('id, case_number, catchy_case_id, project_title, slack_channel, nextcloud_folder, tf_briefs(*)')
      .eq('id', id)
      .single()

    if (projectError || !projectData) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    const brief = Array.isArray(projectData.tf_briefs) ? projectData.tf_briefs[0] : projectData.tf_briefs
    const briefPayload = body.brief_data || {
      client: brief?.client,
      agency: brief?.agency,
      brand: brief?.brand,
      media: brief?.media,
      territory: brief?.territory,
      budget_raw: brief?.budget_raw,
      submission_deadline: brief?.submission_deadline,
      air_date: brief?.air_date,
      mood: brief?.mood || brief?.creative_direction,
    }

    // Handle different actions
    switch (body.action) {
      // ========================================================================
      // NEW LEAN WORKFLOWS - Recommended
      // ========================================================================

      case 'setup_integrations': {
        // New lean workflow: Sets up Slack, Nextcloud, Drive after app created case
        // n8n fetches all data from DB - we just send IDs
        const userEmail = body.user_email || body.email || 'unknown@tracksandfields.com'

        const result = await triggerProjectSetup(id, userEmail)

        if (!result.success) {
          await logActivity(
            supabase,
            id,
            'integrations_setup_failed',
            result.error || 'Failed to set up integrations',
            body.user_id,
            { error: result.error },
            'n8n'
          )
          return NextResponse.json(
            { error: result.error || 'Failed to set up integrations' },
            { status: 500 }
          )
        }

        // Update case with integration results
        const updates: Record<string, unknown> = { updated_at: new Date().toISOString() }
        if (result.slack_channel_id) updates.slack_channel_id = result.slack_channel_id
        if (result.slack_channel_name) updates.slack_channel = result.slack_channel_name
        if (result.nextcloud_folder_url) updates.nextcloud_folder = result.nextcloud_folder_url

        if (Object.keys(updates).length > 1) {
          await supabase.from('tf_cases').update(updates).eq('id', id)
        }

        await logActivity(
          supabase,
          id,
          'integrations_setup_complete',
          'Project integrations set up (Slack, Nextcloud, Drive)',
          body.user_id,
          {
            slack_channel: result.slack_channel_name,
            nextcloud_folder: result.nextcloud_folder_url,
            google_drive: result.google_drive_brief_url,
          },
          'n8n'
        )

        return NextResponse.json({
          success: true,
          slack_channel: result.slack_channel_name,
          slack_channel_id: result.slack_channel_id,
          nextcloud_folder: result.nextcloud_folder_url,
          google_drive_url: result.google_drive_brief_url,
        })
      }

      case 'sync_brief': {
        // New lean workflow: Syncs brief to Nextcloud and notifies Slack
        const changeSummary = body.change_summary || 'Brief updated'
        const changedBy = body.changed_by || body.user_email || 'unknown'

        const result = await triggerBriefSync(id, changeSummary, changedBy)

        if (!result.success) {
          await logActivity(
            supabase,
            id,
            'brief_sync_failed',
            result.error || 'Failed to sync brief',
            body.user_id,
            { error: result.error },
            'n8n'
          )
          return NextResponse.json(
            { error: result.error || 'Failed to sync brief' },
            { status: 500 }
          )
        }

        await logActivity(
          supabase,
          id,
          'brief_synced',
          `Brief synced to Nextcloud (v${result.version || 'unknown'})`,
          body.user_id,
          {
            version: result.version,
            nextcloud_url: result.nextcloud_current_url,
            change_summary: changeSummary,
          },
          'n8n'
        )

        return NextResponse.json({
          success: true,
          version: result.version,
          nextcloud_url: result.nextcloud_current_url,
          nextcloud_versioned_url: result.nextcloud_versioned_url,
        })
      }

      // ========================================================================
      // LEGACY ACTIONS - Deprecated, use setup_integrations instead
      // ========================================================================

      case 'create_slack_channel': {
        const payload = {
          action: 'create_slack_channel',
          project_id: id,
          case_id: projectData.catchy_case_id || projectData.case_number || id,
          case_number: projectData.case_number,
          catchy_case_id: projectData.catchy_case_id,
          project_title: body.project_title || projectData.project_title || brief?.project_title,
          brief_data: briefPayload,
        }

        const result = await callN8NWebhook(N8N_ENDPOINTS.briefIntake, payload)
        if (!result.success) {
          await logActivity(
            supabase,
            id,
            'slack_channel_failed',
            result.error || 'Slack channel creation failed',
            body.user_id,
            { payload, error: result.error },
            'n8n'
          )
          return NextResponse.json(
            { error: result.error || 'Slack channel creation failed' },
            { status: 500 }
          )
        }

        const webhookResult = result as unknown as Record<string, unknown>
        const channelValue = webhookResult.slack_channel
          || webhookResult.slack_channel_id
          || projectData.slack_channel

        if (channelValue) {
          await supabase
            .from('tf_cases')
            .update({ slack_channel: String(channelValue), updated_at: new Date().toISOString() })
            .eq('id', id)
        }

        await logActivity(
          supabase,
          id,
          'slack_channel_created',
          `Slack channel created: ${String(channelValue || '')}`.trim(),
          body.user_id,
          { payload, result },
          'n8n'
        )

        return NextResponse.json({
          success: true,
          slack_channel: channelValue || null,
        })
      }

      case 'create_nextcloud_folder': {
        const payload = {
          action: 'create_nextcloud_folder',
          project_id: id,
          case_id: projectData.catchy_case_id || projectData.case_number || id,
          case_number: projectData.case_number,
          catchy_case_id: projectData.catchy_case_id,
          project_title: body.project_title || projectData.project_title || brief?.project_title,
          brief_data: briefPayload,
        }

        const result = await callN8NWebhook(N8N_ENDPOINTS.syncNextcloud, payload)
        if (!result.success) {
          await logActivity(
            supabase,
            id,
            'nextcloud_folder_failed',
            result.error || 'Nextcloud folder creation failed',
            body.user_id,
            { payload, error: result.error },
            'n8n'
          )
          return NextResponse.json(
            { error: result.error || 'Nextcloud folder creation failed' },
            { status: 500 }
          )
        }

        const webhookResult = result as unknown as Record<string, unknown>
        const folderValue = webhookResult.nextcloud_folder
          || webhookResult.nextcloud_folder_url
          || projectData.nextcloud_folder

        if (folderValue) {
          await supabase
            .from('tf_cases')
            .update({ nextcloud_folder: String(folderValue), updated_at: new Date().toISOString() })
            .eq('id', id)
        }

        await logActivity(
          supabase,
          id,
          'nextcloud_folder_created',
          `Nextcloud folder created: ${String(folderValue || '')}`.trim(),
          body.user_id,
          { payload, result },
          'n8n'
        )

        return NextResponse.json({
          success: true,
          nextcloud_folder: folderValue || null,
        })
      }

      default:
        return NextResponse.json(
          { error: 'Unknown action' },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error('Error processing action:', error)
    return NextResponse.json(
      { error: 'Failed to process action' },
      { status: 500 }
    )
  }
}

// Helper function to log activity
async function logActivity(
  supabase: ReturnType<typeof createServerClient>,
  caseId: string,
  activityType: string,
  description: string,
  userId?: string,
  changes?: Record<string, unknown>,
  source: 'ui' | 'chat' | 'n8n' | 'api' = 'ui'
) {
  try {
    await supabase.from('tf_case_activity').insert({
      case_id: caseId,
      activity_type: activityType,
      activity_description: description,
      user_id: userId || null,
      source,
      changes: changes || null,
    })
  } catch (error) {
    console.error('Error logging activity:', error)
  }
}
