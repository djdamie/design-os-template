// n8n webhook client for TF Project Builder

const N8N_BASE_URL = process.env.NEXT_PUBLIC_N8N_BASE_URL || 'https://n8n.gex44.tnfserver.de'

export const N8N_ENDPOINTS = {
  briefIntake: `${N8N_BASE_URL}/webhook/tf-brief-intake-v5`,
  syncNextcloud: `${N8N_BASE_URL}/webhook/project-builder-sync`,
} as const

export interface N8NWebhookResponse {
  success: boolean
  case_number?: string
  catchy_case_id?: string
  slack_channel?: string
  nextcloud_folder?: string
  error?: string
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

    if (!response.ok) {
      const errorText = await response.text()
      console.error('n8n webhook error:', errorText)
      return {
        success: false,
        error: `Webhook failed with status ${response.status}: ${errorText}`,
      }
    }

    const data = await response.json()
    return {
      success: true,
      ...data,
    }
  } catch (error) {
    console.error('n8n webhook error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

export async function triggerBriefIntake(
  payload: Record<string, unknown>
): Promise<N8NWebhookResponse> {
  return callN8NWebhook(N8N_ENDPOINTS.briefIntake, payload)
}

export async function triggerNextcloudSync(
  payload: Record<string, unknown>
): Promise<N8NWebhookResponse> {
  return callN8NWebhook(N8N_ENDPOINTS.syncNextcloud, payload)
}
