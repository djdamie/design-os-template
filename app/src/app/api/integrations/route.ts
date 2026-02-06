import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/client'
import { N8N_ENDPOINTS, callN8NWebhook } from '@/lib/n8n/client'
import type { TFProjectWithBrief, TFCaseActivity } from '@/lib/supabase/types'
import type {
  CurrentUser,
  EventStatus,
  EventType,
  IntegrationEvent,
  PendingRetry,
  ServiceHealth,
  ServiceConnection,
  ServiceIcon,
  ServiceStatus,
  SyncStatus,
  UserRole,
  WebhookConfig,
} from '@/components/integrations/types'

type ServiceId = 'svc-slack' | 'svc-nextcloud' | 'svc-gdrive' | 'svc-supabase'

const SERVICE_DEFINITIONS: Record<ServiceId, {
  id: ServiceId
  name: string
  description: string
  icon: ServiceIcon
  visibleToUsers: boolean
}> = {
  'svc-slack': {
    id: 'svc-slack',
    name: 'Slack',
    description: 'Project channels and notifications',
    icon: 'slack',
    visibleToUsers: true,
  },
  'svc-nextcloud': {
    id: 'svc-nextcloud',
    name: 'Nextcloud',
    description: 'Project folders and shared files',
    icon: 'cloud',
    visibleToUsers: true,
  },
  'svc-gdrive': {
    id: 'svc-gdrive',
    name: 'Google Drive',
    description: 'Backup and document storage',
    icon: 'hard-drive',
    visibleToUsers: true,
  },
  'svc-supabase': {
    id: 'svc-supabase',
    name: 'Supabase',
    description: 'Database and realtime sync',
    icon: 'database',
    visibleToUsers: false,
  },
}

function detectService(activityType: string, description?: string | null): ServiceId {
  const lower = `${activityType} ${description || ''}`.toLowerCase()
  if (lower.includes('slack')) return 'svc-slack'
  if (lower.includes('nextcloud')) return 'svc-nextcloud'
  if (lower.includes('gdrive') || lower.includes('google drive')) return 'svc-gdrive'
  return 'svc-supabase'
}

function mapEventType(activityType: string): EventType {
  const lower = activityType.toLowerCase()
  if (lower.includes('slack_channel_created')) return 'channel_created'
  if (lower.includes('nextcloud_folder_created')) return 'folder_created'
  if (lower.includes('project_created')) return 'case_created'
  if (lower.includes('brief_updated') || lower.includes('brief_created')) return 'brief_synced'
  if (lower.includes('message')) return 'message_posted'
  if (lower.includes('retry')) return 'webhook_retried'
  if (lower.includes('failed') || lower.includes('error')) return 'webhook_failed'
  return 'webhook_executed'
}

function mapEventStatus(activityType: string): EventStatus {
  const lower = activityType.toLowerCase()
  if (lower.includes('failed') || lower.includes('error')) return 'failed'
  if (lower.includes('pending')) return 'pending'
  return 'success'
}

function mapSyncStatus(status: EventStatus): SyncStatus {
  if (status === 'success') return 'success'
  if (status === 'pending') return 'partial'
  return 'failed'
}

function buildProjectName(project?: TFProjectWithBrief | null): string | null {
  if (!project) return null
  const brief = Array.isArray(project.tf_briefs) ? project.tf_briefs[0] : project.tf_briefs
  return (
    project.project_title
    || brief?.project_title
    || brief?.client
    || project.catchy_case_id
    || project.case_number
    || null
  )
}

function buildIntegrationEvents(
  activities: TFCaseActivity[],
  projectById: Record<string, TFProjectWithBrief>
): IntegrationEvent[] {
  return activities.map((activity) => {
    const serviceId = detectService(activity.activity_type, activity.activity_description)
    const serviceName = SERVICE_DEFINITIONS[serviceId].name
    const project = projectById[activity.case_id]
    return {
      id: activity.id,
      serviceId,
      serviceName,
      eventType: mapEventType(activity.activity_type),
      message: activity.activity_description || activity.activity_type,
      projectId: activity.case_id || null,
      projectName: buildProjectName(project),
      timestamp: activity.created_at,
      status: mapEventStatus(activity.activity_type),
      details: ((activity.changes as Record<string, unknown> | null)?.error as string) || null,
    }
  })
}

function calculateSuccessRate(events: IntegrationEvent[]): number {
  if (events.length === 0) return 100
  const successCount = events.filter((e) => e.status === 'success').length
  return Number(((successCount / events.length) * 100).toFixed(1))
}

function buildServiceConnections(
  projects: TFProjectWithBrief[],
  events: IntegrationEvent[]
): ServiceConnection[] {
  const now = new Date().toISOString()
  const eventsByService = new Map<ServiceId, IntegrationEvent[]>()
  for (const serviceId of Object.keys(SERVICE_DEFINITIONS) as ServiceId[]) {
    eventsByService.set(
      serviceId,
      events.filter((event) => event.serviceId === serviceId)
    )
  }

  const slackConnectedCount = projects.filter((project) => !!project.slack_channel).length
  const nextcloudConnectedCount = projects.filter((project) => !!project.nextcloud_folder).length
  const briefCount = projects.reduce((count, project) => {
    if (!project.tf_briefs) return count
    return count + (Array.isArray(project.tf_briefs) ? project.tf_briefs.length : 1)
  }, 0)

  return (Object.keys(SERVICE_DEFINITIONS) as ServiceId[]).map((serviceId) => {
    const def = SERVICE_DEFINITIONS[serviceId]
    const serviceEvents = eventsByService.get(serviceId) || []
    const latestEvent = serviceEvents[0]
    const failedCount = serviceEvents.filter((event) => event.status === 'failed').length

    const status: ServiceStatus = failedCount > 0 && (latestEvent?.status === 'failed')
      ? 'error'
      : 'connected'

    const health: ServiceHealth = failedCount >= 3
      ? 'unhealthy'
      : failedCount >= 1
      ? 'degraded'
      : 'healthy'

    const lastSyncStatus = latestEvent ? mapSyncStatus(latestEvent.status) : 'success'

    const common = {
      id: def.id,
      name: def.name,
      description: def.description,
      icon: def.icon,
      status,
      health,
      lastSyncAt: latestEvent?.timestamp || now,
      lastSyncStatus,
      visibleToUsers: def.visibleToUsers,
      error: latestEvent?.status === 'failed' ? (latestEvent.details || latestEvent.message) : null,
    }

    if (serviceId === 'svc-slack') {
      return {
        ...common,
        stats: {
          channelsCreated: slackConnectedCount,
          messagesSent: serviceEvents.filter((event) => event.eventType === 'message_posted').length,
          lastActivity: latestEvent?.timestamp || now,
        },
      }
    }

    if (serviceId === 'svc-nextcloud') {
      return {
        ...common,
        stats: {
          foldersCreated: nextcloudConnectedCount,
          filesUploaded: 0,
          lastActivity: latestEvent?.timestamp || now,
        },
      }
    }

    if (serviceId === 'svc-gdrive') {
      return {
        ...common,
        status: 'disconnected' as ServiceStatus,
        health: 'healthy' as const,
        stats: {
          documentsUploaded: 0,
          storageUsed: '0 MB',
          lastActivity: latestEvent?.timestamp || now,
        },
      }
    }

    return {
      ...common,
      stats: {
        casesStored: projects.length,
        briefsStored: briefCount,
        activeUsers: 1,
        lastActivity: latestEvent?.timestamp || now,
      },
    }
  })
}

function buildWebhookConfigs(events: IntegrationEvent[]): WebhookConfig[] {
  const now = new Date().toISOString()
  const slackEvents = events.filter((event) => event.serviceId === 'svc-slack')
  const nextcloudEvents = events.filter((event) => event.serviceId === 'svc-nextcloud')

  return [
    {
      id: 'wh-slack-intake',
      serviceId: 'svc-slack',
      name: 'Slack Channel Provisioning',
      workflowName: 'tf-brief-intake-v5',
      webhookUrl: N8N_ENDPOINTS.briefIntake,
      method: 'POST',
      enabled: true,
      lastTriggered: slackEvents[0]?.timestamp || now,
      successRate: calculateSuccessRate(slackEvents),
      totalExecutions: slackEvents.length,
    },
    {
      id: 'wh-nextcloud-sync',
      serviceId: 'svc-nextcloud',
      name: 'Nextcloud Project Sync',
      workflowName: 'project-builder-sync',
      webhookUrl: N8N_ENDPOINTS.syncNextcloud,
      method: 'POST',
      enabled: true,
      lastTriggered: nextcloudEvents[0]?.timestamp || now,
      successRate: calculateSuccessRate(nextcloudEvents),
      totalExecutions: nextcloudEvents.length,
    },
  ]
}

function buildPendingRetries(events: IntegrationEvent[]): PendingRetry[] {
  return events
    .filter((event) => event.status === 'failed')
    .slice(0, 10)
    .map((event) => ({
      id: `retry-${event.id}`,
      eventId: event.id,
      serviceId: event.serviceId,
      serviceName: event.serviceName,
      projectId: event.projectId,
      projectName: event.projectName,
      description: event.message,
      failedAt: event.timestamp,
      retryCount: 0,
      maxRetries: 3,
      canRetry: true,
    }))
}

async function triggerProjectAction(request: NextRequest, projectId: string, action: 'create_slack_channel' | 'create_nextcloud_folder') {
  const endpoint = new URL(`/api/projects/${projectId}`, request.url)
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action }),
  })
  const result = await response.json().catch(() => ({}))
  return { ok: response.ok, result }
}

export async function GET() {
  try {
    const supabase = createServiceClient()
    const [projectsResult, activityResult] = await Promise.all([
      supabase
        .from('tf_cases')
        .select('*, tf_briefs(*)')
        .order('updated_at', { ascending: false })
        .limit(200),
      supabase
        .from('tf_case_activity')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(200),
    ])

    if (projectsResult.error) throw projectsResult.error
    if (activityResult.error) throw activityResult.error

    const projects = (projectsResult.data || []) as TFProjectWithBrief[]
    const activities = (activityResult.data || []) as TFCaseActivity[]

    const projectById = Object.fromEntries(
      projects.map((project) => [project.id, project])
    ) as Record<string, TFProjectWithBrief>

    const integrationEvents = buildIntegrationEvents(activities, projectById)
    const serviceConnections = buildServiceConnections(projects, integrationEvents)
    const webhookConfigs = buildWebhookConfigs(integrationEvents)
    const pendingRetries = buildPendingRetries(integrationEvents)

    const role = (process.env.INTEGRATIONS_USER_ROLE as UserRole | undefined) || 'admin'
    const currentUser: CurrentUser = {
      id: 'local-user',
      name: 'TF User',
      email: 'user@tracksandfields.com',
      role,
      avatarUrl: null,
    }

    return NextResponse.json({
      currentUser,
      serviceConnections,
      integrationEvents,
      webhookConfigs,
      pendingRetries,
    })
  } catch (error) {
    console.error('Error loading integrations:', error)
    return NextResponse.json(
      { error: 'Failed to load integrations' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const supabase = createServiceClient()

    if (body.action === 'sync_service') {
      const serviceId = body.serviceId as ServiceId
      const requestedProjectId = body.projectId as string | undefined
      const action = serviceId === 'svc-slack'
        ? 'create_slack_channel'
        : serviceId === 'svc-nextcloud'
        ? 'create_nextcloud_folder'
        : null

      if (!action) {
        return NextResponse.json({ error: 'Service does not support manual sync' }, { status: 400 })
      }

      let projectId = requestedProjectId
      if (!projectId || projectId === 'current') {
        const { data: latestProject } = await supabase
          .from('tf_cases')
          .select('id')
          .order('updated_at', { ascending: false })
          .limit(1)
          .maybeSingle()

        projectId = latestProject?.id
      }

      if (!projectId) {
        return NextResponse.json({ error: 'No project available for sync' }, { status: 400 })
      }

      const response = await triggerProjectAction(request, projectId, action)
      if (!response.ok) {
        return NextResponse.json(response.result, { status: 500 })
      }

      return NextResponse.json({ success: true, projectId, result: response.result })
    }

    if (body.action === 'retry_event') {
      const eventId = String(body.eventId || '')
      if (!eventId) {
        return NextResponse.json({ error: 'eventId is required' }, { status: 400 })
      }

      const { data: activity, error } = await supabase
        .from('tf_case_activity')
        .select('*')
        .eq('id', eventId)
        .single()

      if (error || !activity) {
        return NextResponse.json({ error: 'Event not found' }, { status: 404 })
      }

      const serviceId = detectService(activity.activity_type, activity.activity_description)
      const action = serviceId === 'svc-slack'
        ? 'create_slack_channel'
        : serviceId === 'svc-nextcloud'
        ? 'create_nextcloud_folder'
        : null

      if (!action) {
        return NextResponse.json({ error: 'Event cannot be retried' }, { status: 400 })
      }

      const response = await triggerProjectAction(request, activity.case_id, action)
      if (!response.ok) {
        return NextResponse.json(response.result, { status: 500 })
      }

      return NextResponse.json({ success: true, eventId, result: response.result })
    }

    if (body.action === 'test_webhook') {
      const serviceId = body.serviceId as ServiceId
      const endpoint = serviceId === 'svc-nextcloud' ? N8N_ENDPOINTS.syncNextcloud : N8N_ENDPOINTS.briefIntake
      const result = await callN8NWebhook(endpoint, {
        action: 'test_webhook',
        service_id: serviceId,
        timestamp: new Date().toISOString(),
      })

      if (!result.success) {
        return NextResponse.json({ error: result.error || 'Webhook test failed' }, { status: 500 })
      }
      return NextResponse.json({ success: true })
    }

    if (body.action === 'toggle_webhook' || body.action === 'update_webhook' || body.action === 'dismiss_event') {
      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
  } catch (error) {
    console.error('Error handling integrations action:', error)
    return NextResponse.json(
      { error: 'Failed to process integrations action' },
      { status: 500 }
    )
  }
}
