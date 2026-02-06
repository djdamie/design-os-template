import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/client'

// GET /api/projects - List all projects
export async function GET(request: NextRequest) {
  try {
    const supabase = createServiceClient()
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const limit = parseInt(searchParams.get('limit') || '50')

    let query = supabase
      .from('tf_cases')
      .select('*, tf_briefs(client, agency, brand, project_title, completion_rate, extraction_status, budget_min, submission_deadline)')
      .order('created_at', { ascending: false })
      .limit(limit)

    if (status) {
      query = query.eq('status', status)
    }

    const { data, error } = await query

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error listing projects:', error)
    return NextResponse.json(
      { error: 'Failed to list projects' },
      { status: 500 }
    )
  }
}

// POST /api/projects - Create a new project
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const supabase = createServiceClient()

    // Generate a case number (simple version - can be enhanced)
    const timestamp = Date.now().toString(36).toUpperCase()
    const caseNumber = `TF-${timestamp}`

    // Create the case
    const { data: caseData, error: caseError } = await supabase
      .from('tf_cases')
      .insert({
        case_number: caseNumber,
        catchy_case_id: body.catchy_case_id || null,
        project_type: body.project_type || null,
        status: 'draft',
        created_by: body.user_id || null,
      })
      .select()
      .single()

    if (caseError) throw caseError

    // Create an empty brief for the case
    const { error: briefError } = await supabase
      .from('tf_briefs')
      .insert({
        case_id: caseData.id,
        extraction_status: 'pending',
      })

    if (briefError) {
      // Rollback the case creation if brief fails
      await supabase.from('tf_cases').delete().eq('id', caseData.id)
      throw briefError
    }

    // Log the activity
    await supabase.from('tf_case_activity').insert({
      case_id: caseData.id,
      activity_type: 'project_created',
      activity_description: `Project ${caseNumber} created`,
      user_id: body.user_id || null,
      source: 'ui',
    })

    return NextResponse.json({
      ...caseData,
      message: 'Project created successfully',
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating project:', error)
    return NextResponse.json(
      { error: 'Failed to create project' },
      { status: 500 }
    )
  }
}
