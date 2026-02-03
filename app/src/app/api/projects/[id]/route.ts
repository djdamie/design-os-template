import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/client'
import type { TFBrief } from '@/lib/supabase/types'

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
      // Timeline
      submission_deadline: body.submission_deadline || body.deadline_date,
      first_presentation_date: body.first_presentation_date,
      ppm_date: body.ppm_date,
      shoot_date: body.shoot_date,
      offline_date: body.offline_date,
      online_date: body.online_date,
      air_date: body.air_date,
      deadline_urgency: body.deadline_urgency,
      // Source
      raw_brief_text: body.raw_brief_text,
      brief_source: body.brief_source,
      // Metadata
      extraction_status: body.extraction_status,
      brief_quality: body.brief_quality,
      completion_rate: body.completion_rate || body.completeness,
      missing_information: body.missing_information,
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

    // Handle different actions
    switch (body.action) {
      case 'create_slack_channel':
        // This will be implemented with n8n webhook
        return NextResponse.json({
          message: 'Slack channel creation triggered',
          status: 'pending'
        })

      case 'create_nextcloud_folder':
        // This will be implemented with n8n webhook
        return NextResponse.json({
          message: 'Nextcloud folder creation triggered',
          status: 'pending'
        })

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
  changes?: Record<string, unknown>
) {
  try {
    await supabase.from('tf_case_activity').insert({
      case_id: caseId,
      activity_type: activityType,
      activity_description: description,
      user_id: userId || null,
      source: 'ui',
      changes: changes || null,
    })
  } catch (error) {
    console.error('Error logging activity:', error)
  }
}
