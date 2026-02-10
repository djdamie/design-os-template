// Database types for TF Project Builder

export interface TFUser {
  id: string
  email: string
  name: string | null
  role: string
  created_at: string
}

export interface TFCase {
  id: string
  case_number: string | null
  catchy_case_id: string | null
  project_title: string | null
  project_type: 'A' | 'B' | 'C' | 'D' | 'E' | 'Production' | null
  status: 'draft' | 'active' | 'completed' | 'archived'
  slack_channel: string | null
  nextcloud_folder: string | null
  created_by: string | null
  created_at: string
  updated_at: string
}

export interface TFBrief {
  id: string
  case_id: string
  // Business
  client: string | null
  agency: string | null
  brand: string | null
  project_title: string | null
  media: string[] | null
  term: string | null
  territory: string[] | null
  budget_raw: string | null
  budget_min: number | null
  budget_max: number | null
  exclusivity: boolean | null
  exclusivity_details: string | null
  // Brief sender
  brief_sender_name: string | null
  brief_sender_email: string | null
  brief_sender_role: string | null
  // Creative
  creative_direction: string | null
  mood: string | null
  keywords: string[] | null
  genres: string[] | null
  mood_descriptors: string[] | null
  reference_tracks: { artist: string; title: string; notes?: string }[] | null
  instruments: string[] | null
  vocals_preference: string | null
  must_avoid: string | null
  lyrics_requirements: string | null
  // Technical
  lengths: string[] | null
  cutdowns: string[] | null
  stems_required: boolean
  sync_points: string | null
  source_type: string | null
  deliverable_formats: string[] | null
  file_formats: string[] | null
  language_adaptations: string[] | null
  // Context
  campaign_context: string | null
  target_audience: string | null
  brand_values: string[] | null
  // Timeline
  submission_deadline: string | null
  first_presentation_date: string | null
  ppm_date: string | null
  shoot_date: string | null
  offline_date: string | null
  online_date: string | null
  air_date: string | null
  deadline_urgency: string | null
  // Source
  raw_brief_text: string | null
  brief_source: string | null
  // Metadata
  extraction_status: 'pending' | 'in_progress' | 'complete' | 'error'
  brief_quality: string | null
  completion_rate: number | null
  missing_information: string[] | null
  extraction_notes: string | null // Agent observations about the extraction (e.g., "air date was 'mid-March' - interpreted as March 15")
  version: number
  created_at: string
  updated_at: string
}

export interface TFCaseActivity {
  id: string
  case_id: string
  activity_type: string
  activity_description: string | null
  user_id: string | null
  source: 'ui' | 'chat' | 'n8n' | 'api'
  changes: Record<string, unknown> | null
  created_at: string
}

// Combined type for project with brief
// Note: Supabase returns arrays for relationships, even for one-to-one
export interface TFProjectWithBrief extends TFCase {
  tf_briefs: TFBrief | TFBrief[] | null
}
