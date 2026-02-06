// n8n webhook client for TF Project Builder
//
// Architecture: App owns Supabase writes, n8n owns external integrations only
// - projectSetup: Creates Slack channel, Nextcloud folder, Drive upload (after app creates case)
// - briefSync: Syncs brief to Nextcloud and notifies Slack (after app updates brief)

const N8N_BASE_URL = process.env.NEXT_PUBLIC_N8N_BASE_URL || 'https://n8n.gex44.tnfserver.de'

export const N8N_ENDPOINTS = {
  // NEW LEAN WORKFLOWS (external integrations only)
  projectSetup: `${N8N_BASE_URL}/webhook/tf-project-setup`,
  briefSync: `${N8N_BASE_URL}/webhook/tf-brief-sync`,

  // Existing reusable sub-workflow
  syncNextcloud: `${N8N_BASE_URL}/webhook/sync-brief-to-nextcloud`,

  // DEPRECATED: Use projectSetup instead (v5 duplicates DB writes the app already does)
  /** @deprecated Use projectSetup instead - this workflow duplicates database operations */
  briefIntake: `${N8N_BASE_URL}/webhook/tf-brief-intake-v5`,
} as const

// ============================================================================
// Response Types
// ============================================================================

export interface N8NWebhookResponse {
  success: boolean
  case_number?: string
  catchy_case_id?: string
  slack_channel?: string
  slack_channel_id?: string
  nextcloud_folder?: string
  nextcloud_url?: string
  google_drive_url?: string
  error?: string
  raw_response?: string
}

export interface ProjectSetupResponse extends N8NWebhookResponse {
  slack_channel_id?: string
  slack_channel_name?: string
  nextcloud_folder_url?: string
  google_drive_brief_url?: string
}

export interface BriefSyncResponse extends N8NWebhookResponse {
  version?: number
  nextcloud_current_url?: string
  nextcloud_versioned_url?: string
}

// ============================================================================
// Payload Types
// ============================================================================

export interface ProjectSetupPayload {
  case_id: string
  user_email: string
  [key: string]: unknown
}

export interface BriefSyncPayload {
  case_id: string
  change_summary?: string
  changed_by?: string
  [key: string]: unknown
}

export async function callN8NWebhook(
  endpoint: string,
  payload: Record<string, unknown>
): Promise<N8NWebhookResponse> {
  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    const responseText = await response.text()

    if (!response.ok) {
      console.error('n8n webhook error:', responseText)
      return {
        success: false,
        error: `Webhook failed with status ${response.status}: ${responseText}`,
      }
    }

    // Handle empty responses
    if (!responseText || responseText.trim() === '') {
      return {
        success: true,
      }
    }

    // Try to parse JSON response
    try {
      const data = JSON.parse(responseText)
      return {
        success: true,
        ...data,
      }
    } catch {
      // If response isn't JSON, return success with raw text
      console.warn('n8n webhook returned non-JSON response:', responseText)
      return {
        success: true,
        raw_response: responseText,
      }
    }
  } catch (error) {
    console.error('n8n webhook error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

// ============================================================================
// NEW LEAN WORKFLOW TRIGGERS
// ============================================================================

/**
 * Trigger project setup in n8n after app has created the case in Supabase.
 * Creates: Slack channel, Nextcloud folder, Google Drive upload.
 * Does NOT create case/brief (app already did this).
 */
export async function triggerProjectSetup(
  caseId: string,
  userEmail: string
): Promise<ProjectSetupResponse> {
  const payload: ProjectSetupPayload = {
    case_id: caseId,
    user_email: userEmail,
  }
  return callN8NWebhook(N8N_ENDPOINTS.projectSetup, payload) as Promise<ProjectSetupResponse>
}

/**
 * Trigger brief sync to Nextcloud after app has updated the brief in Supabase.
 * Syncs brief markdown to Nextcloud and posts notification to Slack.
 */
export async function triggerBriefSync(
  caseId: string,
  changeSummary?: string,
  changedBy?: string
): Promise<BriefSyncResponse> {
  const payload: BriefSyncPayload = {
    case_id: caseId,
    change_summary: changeSummary,
    changed_by: changedBy,
  }
  return callN8NWebhook(N8N_ENDPOINTS.briefSync, payload) as Promise<BriefSyncResponse>
}

/**
 * Trigger direct Nextcloud sync (reusable sub-workflow).
 * Can be called independently or used by other workflows.
 */
export async function triggerNextcloudSync(
  caseId: string
): Promise<N8NWebhookResponse> {
  return callN8NWebhook(N8N_ENDPOINTS.syncNextcloud, { case_id: caseId })
}

// ============================================================================
// DEPRECATED - Use lean workflows above instead
// ============================================================================

/**
 * @deprecated Use triggerProjectSetup instead.
 * This workflow duplicates database operations that the app already performs.
 */
export async function triggerBriefIntake(
  payload: Record<string, unknown>
): Promise<N8NWebhookResponse> {
  console.warn('triggerBriefIntake is deprecated. Use triggerProjectSetup instead.')
  return callN8NWebhook(N8N_ENDPOINTS.briefIntake, payload)
}
