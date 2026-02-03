/**
 * Maps extracted brief data from the AI agent to the canvas field structure
 *
 * NOTE: The backend returns a FLAT structure (all fields at top level),
 * not a nested structure. This mapper handles that flat format.
 */
import type {
  AllFields,
  Project,
  MarginCalculation,
  CompletenessBreakdown,
  CanvasTab,
  TeamMemberOption,
  IntegrationStatus,
  ClassificationReasoning,
  FieldStatus,
  ProjectType,
  TabId,
} from '@/components/project-canvas/types'

/**
 * Flat extracted brief structure from the backend agent
 * All fields are at the top level, not nested
 */
export interface FlatExtractedBrief {
  completeness?: number
  project_type?: string | null
  // Business fields
  client_name?: string
  agency_name?: string
  brand_name?: string
  project_title?: string
  budget_amount?: number
  territory?: string[]
  media_types?: string[]
  term_length?: string
  exclusivity?: boolean
  exclusivity_details?: string
  // Creative fields
  creative_direction?: string
  mood_keywords?: string[]
  genre_preferences?: string[]
  reference_tracks?: Array<{ artist: string; title: string | null; notes: string }>
  must_avoid?: string
  vocals_preference?: string
  // Technical fields
  video_lengths?: string[]
  stems_required?: boolean
  sync_points?: string
  // Timeline fields
  deadline_date?: string
  air_date?: string
  deadline_urgency?: string
  first_presentation_date?: string
  // Who fields
  brief_sender_name?: string
  brief_sender_email?: string
  brief_sender_role?: string
}

// Calculate margin based on project type
const MARGIN_TIERS: Record<ProjectType, { percentage: number; description: string }> = {
  A: { percentage: 22, description: 'Full workflow with management oversight' },
  B: { percentage: 25, description: 'Full workflow' },
  C: { percentage: 50, description: 'Simplified workflow' },
  D: { percentage: 50, description: 'Simplified workflow' },
  E: { percentage: 100, description: 'Blanket license only' },
  Production: { percentage: 30, description: 'Custom production workflow' },
}

export function getFieldStatus(value: unknown): FieldStatus {
  if (value === null || value === undefined || value === '' || (Array.isArray(value) && value.length === 0)) {
    return 'empty'
  }
  return 'ai-filled'
}

export function calculateMargin(budget: number, projectType: ProjectType): MarginCalculation {
  const tier = MARGIN_TIERS[projectType]
  const marginPercentage = tier.percentage
  const marginAmount = Math.round(budget * (marginPercentage / 100))
  const payoutAmount = budget - marginAmount

  return {
    budget,
    budgetCurrency: 'EUR',
    marginPercentage,
    payoutAmount,
    marginAmount,
    tier: projectType,
    tierDescription: tier.description,
  }
}

export function createDefaultProject(brief: FlatExtractedBrief | null): Project {
  const projectType = brief?.project_type || 'C'
  const clientName = brief?.client_name || 'New'
  const caseId = `${clientName.replace(/\s+/g, '-')}-${Date.now()}`

  return {
    id: `proj-${Date.now()}`,
    caseNumber: Date.now(),
    caseId,
    caseTitle: `${clientName} Project`,
    projectType: projectType as ProjectType,
    projectTypeOverride: null,
    status: 'draft',
    completeness: brief?.completeness || 0,
    hasUnsavedChanges: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
}

export function createCompleteness(brief: FlatExtractedBrief | null): CompletenessBreakdown {
  // Calculate based on which fields are present
  const criticalFields = ['client_name', 'budget_amount', 'territory', 'deadline_date']
  const importantFields = ['media_types', 'creative_direction', 'video_lengths', 'brief_sender_name', 'brief_sender_email']
  const helpfulFields = ['agency_name', 'mood_keywords', 'genre_preferences', 'reference_tracks', 'sync_points', 'stems_required', 'vocals_preference', 'term_length', 'exclusivity']

  const hasCritical = criticalFields.filter(f => brief && brief[f as keyof FlatExtractedBrief])
  const hasImportant = importantFields.filter(f => brief && brief[f as keyof FlatExtractedBrief])
  const hasHelpful = helpfulFields.filter(f => brief && brief[f as keyof FlatExtractedBrief])

  const missingCritical = criticalFields.filter(f => !brief || !brief[f as keyof FlatExtractedBrief])
  const missingImportant = importantFields.filter(f => !brief || !brief[f as keyof FlatExtractedBrief])
  const missingHelpful = helpfulFields.filter(f => !brief || !brief[f as keyof FlatExtractedBrief])

  return {
    score: brief?.completeness || 0,
    criticalComplete: hasCritical.length,
    criticalTotal: criticalFields.length,
    importantComplete: hasImportant.length,
    importantTotal: importantFields.length,
    helpfulComplete: hasHelpful.length,
    helpfulTotal: helpfulFields.length,
    missingFields: [
      ...missingCritical.map((field) => ({ field, priority: 'critical' as const, tab: 'WHAT' as TabId })),
      ...missingImportant.map((field) => ({ field, priority: 'important' as const, tab: 'WHAT' as TabId })),
      ...missingHelpful.slice(0, 5).map((field) => ({ field, priority: 'helpful' as const, tab: 'OTHER' as TabId })),
    ],
  }
}

export function createDefaultTabs(): CanvasTab[] {
  return [
    { id: 'WHAT', label: 'WHAT', description: 'Project overview, client info, rights & budget', missingCritical: 0, missingImportant: 0 },
    { id: 'WHO', label: 'WHO', description: 'Team assignments and responsibilities', missingCritical: 0, missingImportant: 0 },
    { id: 'WITH_WHAT', label: 'WITH WHAT', description: 'Tools, sources, deliverables & technical specs', missingCritical: 0, missingImportant: 0 },
    { id: 'WHEN', label: 'WHEN', description: 'Timeline, deadlines & milestones', missingCritical: 0, missingImportant: 0 },
    { id: 'OTHER', label: 'OTHER', description: 'Notes, context & attachments', missingCritical: 0, missingImportant: 0 },
  ]
}

export function createDefaultTeamMembers(): TeamMemberOption[] {
  return [
    { id: 'user-001', name: 'Julia Richter', role: 'Managing Director', avatar: null },
    { id: 'user-002', name: 'Lisa Weber', role: 'Account Manager', avatar: null },
    { id: 'user-003', name: 'Max Fischer', role: 'Senior Music Supervisor', avatar: null },
    { id: 'user-004', name: 'Anna Schmidt', role: 'Project Manager', avatar: null },
    { id: 'user-005', name: 'Thomas Müller', role: 'Business Affairs', avatar: null },
    { id: 'user-006', name: 'Sarah Klein', role: 'Music Coordinator', avatar: null },
    { id: 'user-007', name: 'David Braun', role: 'Junior Music Supervisor', avatar: null },
  ]
}

export function createDefaultIntegrationStatus(): IntegrationStatus {
  return {
    slack: { connected: false, channelName: null, channelUrl: null, connectedAt: null },
    nextcloud: { connected: false, folderPath: null, folderUrl: null, connectedAt: null },
  }
}

export function createClassificationReasoning(brief: FlatExtractedBrief | null): ClassificationReasoning {
  const projectType = (brief?.project_type || 'C') as ProjectType
  const budget = brief?.budget_amount || 0

  let reasoning = 'Classification pending - awaiting brief extraction.'
  if (budget > 0) {
    if (budget >= 100000) reasoning = `Budget of €${budget.toLocaleString()} exceeds €100,000 threshold for Type A classification.`
    else if (budget >= 25000) reasoning = `Budget of €${budget.toLocaleString()} falls within €25K-€100K range for Type B classification.`
    else if (budget >= 10000) reasoning = `Budget of €${budget.toLocaleString()} falls within €10K-€25K range for Type C classification.`
    else if (budget >= 2500) reasoning = `Budget of €${budget.toLocaleString()} falls within €2.5K-€10K range for Type D classification.`
    else reasoning = `Budget of €${budget.toLocaleString()} is under €2,500 threshold for Type E (blanket only).`
  }

  return {
    currentType: projectType,
    calculatedType: projectType,
    isOverridden: false,
    reasoning,
  }
}

/**
 * Maps FlatExtractedBrief from the agent to AllFields for the canvas
 * The backend returns all fields at the top level (flat), not nested
 */
export function mapBriefToFields(brief: FlatExtractedBrief | null): AllFields {
  // Access fields directly from the flat structure
  const b = brief || {}

  return {
    WHAT: {
      clientInfo: {
        label: 'Client Information',
        fields: [
          { id: 'client_name', label: 'Client Name', value: b.client_name || '', type: 'text', status: getFieldStatus(b.client_name), priority: 'critical', placeholder: 'e.g., BMW, Nike, Apple' },
          { id: 'agency_name', label: 'Agency Name', value: b.agency_name || '', type: 'text', status: getFieldStatus(b.agency_name), priority: 'important', placeholder: 'e.g., Jung von Matt, Serviceplan' },
          { id: 'brand_name', label: 'Brand/Sub-brand', value: b.brand_name || '', type: 'text', status: getFieldStatus(b.brand_name), priority: 'important', placeholder: 'e.g., BMW i, Nike Air' },
          { id: 'brief_sender_name', label: 'Brief Sender', value: b.brief_sender_name || '', type: 'text', status: getFieldStatus(b.brief_sender_name), priority: 'helpful', placeholder: 'Name of person who sent the brief' },
          { id: 'brief_sender_email', label: 'Sender Email', value: b.brief_sender_email || '', type: 'email', status: getFieldStatus(b.brief_sender_email), priority: 'helpful', placeholder: 'email@agency.com' },
          { id: 'brief_sender_role', label: 'Sender Role', value: b.brief_sender_role || '', type: 'text', status: getFieldStatus(b.brief_sender_role), priority: 'helpful', placeholder: 'e.g., Producer, Creative Director' },
        ],
      },
      projectDetails: {
        label: 'Project Details',
        fields: [
          { id: 'project_title', label: 'Project Title', value: b.project_title || '', type: 'text', status: getFieldStatus(b.project_title), priority: 'critical', placeholder: 'Descriptive project name' },
          { id: 'video_lengths', label: 'Video Lengths', value: b.video_lengths || [], type: 'multi-select', options: ['6s', '10s', '15s', '20s', '30s', '45s', '60s', '90s', 'custom'], status: getFieldStatus(b.video_lengths), priority: 'important', placeholder: 'Select all needed lengths' },
          { id: 'language_adaptations', label: 'Language Adaptations', value: [], type: 'multi-select', options: ['DE', 'EN', 'FR', 'ES', 'IT', 'PT', 'CN', 'JP', 'KR', 'AR'], status: 'empty', priority: 'helpful', placeholder: 'Select languages' },
        ],
      },
      rightsUsage: {
        label: 'Rights & Usage',
        fields: [
          { id: 'territory', label: 'Territory', value: b.territory || [], type: 'multi-select', options: ['Global', 'DACH', 'Europe', 'North America', 'APAC', 'LATAM', 'Germany', 'UK', 'USA', 'France'], status: getFieldStatus(b.territory), priority: 'critical', placeholder: 'Select territories' },
          { id: 'media_types', label: 'Media Types', value: b.media_types || [], type: 'multi-select', options: ['TV', 'Cinema', 'Online', 'Social', 'OOH', 'OOH digital', 'Radio', 'Podcast', 'POS', 'Dealership POS', 'CTV/ATV'], status: getFieldStatus(b.media_types), priority: 'critical', placeholder: 'Select media channels' },
          { id: 'term_length', label: 'Term Length', value: b.term_length || '', type: 'select', options: ['3 months', '6 months', '1 year', '2 years', '3 years', 'perpetuity'], status: getFieldStatus(b.term_length), priority: 'important', placeholder: 'Select license duration' },
          { id: 'exclusivity', label: 'Exclusivity', value: b.exclusivity || false, type: 'boolean', status: getFieldStatus(b.exclusivity), priority: 'important' },
          { id: 'exclusivity_details', label: 'Exclusivity Details', value: b.exclusivity_details || '', type: 'text', status: getFieldStatus(b.exclusivity_details), priority: 'helpful', placeholder: 'Specify exclusivity scope', dependsOn: { field: 'exclusivity', value: true } },
        ],
      },
      budget: {
        label: 'Budget',
        fields: [
          { id: 'budget_amount', label: 'Budget Amount', value: b.budget_amount || 0, type: 'currency', status: getFieldStatus(b.budget_amount), priority: 'critical', placeholder: 'Enter budget' },
          { id: 'budget_currency', label: 'Currency', value: 'EUR', type: 'select', options: ['EUR', 'USD', 'GBP', 'CHF'], status: b.budget_amount ? 'ai-filled' : 'empty', priority: 'critical' },
        ],
      },
      creative: {
        label: 'Creative Direction',
        fields: [
          { id: 'creative_direction', label: 'Creative Direction', value: b.creative_direction || '', type: 'textarea', status: getFieldStatus(b.creative_direction), priority: 'critical', placeholder: 'Describe the creative vision and mood' },
          { id: 'mood_keywords', label: 'Mood Keywords', value: b.mood_keywords || [], type: 'tags', status: getFieldStatus(b.mood_keywords), priority: 'important', placeholder: 'Add mood descriptors' },
          { id: 'genre_preferences', label: 'Genre Preferences', value: b.genre_preferences || [], type: 'tags', status: getFieldStatus(b.genre_preferences), priority: 'important', placeholder: 'Add preferred genres' },
          { id: 'reference_tracks', label: 'Reference Tracks', value: b.reference_tracks || [], type: 'reference-list', status: getFieldStatus(b.reference_tracks), priority: 'important', placeholder: 'Add reference tracks' },
          { id: 'must_avoid', label: 'Must Avoid', value: b.must_avoid || '', type: 'textarea', status: getFieldStatus(b.must_avoid), priority: 'helpful', placeholder: 'What to avoid in music selection' },
          { id: 'vocals_preference', label: 'Vocals Preference', value: b.vocals_preference || 'either', type: 'select', options: ['instrumental', 'vocals', 'either', 'specific'], status: getFieldStatus(b.vocals_preference), priority: 'important' },
        ],
      },
    },
    WHO: {
      projectTeam: {
        label: 'Project Team',
        fields: [
          { id: 'account_manager', label: 'Account Manager (AM)', value: null, type: 'team-select', status: 'empty', priority: 'critical', placeholder: 'Assign account manager' },
          { id: 'music_supervisor', label: 'Music Supervisor (MS)', value: null, type: 'team-select', status: 'empty', priority: 'critical', placeholder: 'Assign music supervisor' },
          { id: 'project_manager', label: 'Project Manager (PM)', value: null, type: 'team-select', status: 'empty', priority: 'important', placeholder: 'Assign project manager' },
          { id: 'music_coordinator', label: 'Music Coordinator (MC)', value: null, type: 'team-select', status: 'empty', priority: 'helpful', placeholder: 'Assign coordinator' },
          { id: 'business_affairs', label: 'Business Affairs (BA)', value: null, type: 'team-select', status: 'empty', priority: 'important', placeholder: 'Assign BA contact' },
          { id: 'management', label: 'Management (MGMT)', value: null, type: 'team-select', status: 'empty', priority: 'critical', showFor: ['A', 'B'], placeholder: 'Required for Type A/B projects' },
        ],
      },
      external: {
        label: 'External Contacts',
        fields: [
          { id: 'composers', label: 'Composers', value: [], type: 'multi-team-select', status: 'empty', priority: 'helpful', showFor: ['Production'], placeholder: 'Add composers if bespoke' },
          { id: 'external_partners', label: 'External Partners', value: '', type: 'text', status: 'empty', priority: 'helpful', placeholder: 'Labels, publishers, agencies' },
        ],
      },
    },
    WITH_WHAT: {
      musicSource: {
        label: 'Music Source',
        fields: [
          { id: 'source_type', label: 'Source Type', value: '', type: 'select', options: ['Internal only', 'Request + playlist', 'Label/publisher briefing', 'Blanket license', 'Bespoke composition'], status: 'empty', priority: 'important', placeholder: 'How will music be sourced?' },
          { id: 'submission_rules', label: 'Submission Rules', value: '', type: 'textarea', status: 'empty', priority: 'helpful', placeholder: 'Any rules for submissions' },
        ],
      },
      deliverables: {
        label: 'Deliverables',
        fields: [
          { id: 'deliverable_formats', label: 'Deliverable Format', value: [], type: 'multi-select', options: ['playlist link', 'shortlist file', 'comparison notes', 'demo', 'presentation deck'], status: 'empty', priority: 'important', placeholder: 'What format for delivery?' },
          { id: 'file_formats', label: 'File Formats', value: [], type: 'multi-select', options: ['WAV', 'MP3', 'AIFF', 'stems'], status: 'empty', priority: 'helpful', placeholder: 'Required audio formats' },
          { id: 'stems_required', label: 'Stems Required', value: b.stems_required || false, type: 'boolean', status: getFieldStatus(b.stems_required), priority: 'important' },
          { id: 'stems_details', label: 'Stems Details', value: '', type: 'textarea', status: 'empty', priority: 'helpful', placeholder: 'Specify stem requirements', dependsOn: { field: 'stems_required', value: true } },
        ],
      },
      technical: {
        label: 'Technical Specs',
        fields: [
          { id: 'sync_points', label: 'Sync Points', value: b.sync_points || '', type: 'textarea', status: getFieldStatus(b.sync_points), priority: 'important', placeholder: 'Key timing moments' },
          { id: 'pre_clearance', label: 'Pre-clearance Required', value: false, type: 'boolean', status: 'empty', priority: 'helpful' },
        ],
      },
    },
    WHEN: {
      keyDates: {
        label: 'Key Dates',
        fields: [
          { id: 'kickoff_date', label: 'Kick-off Date', value: '', type: 'date', status: 'empty', priority: 'helpful', placeholder: 'Project start date' },
          { id: 'first_presentation_date', label: 'First Presentation', value: b.first_presentation_date || '', type: 'date', status: getFieldStatus(b.first_presentation_date), priority: 'important', placeholder: 'Internal first look' },
          { id: 'client_presentation_date', label: 'Client Presentation', value: '', type: 'date', status: 'empty', priority: 'important', placeholder: 'Present to client' },
          { id: 'deadline_date', label: 'Final Deadline', value: b.deadline_date || '', type: 'date', status: getFieldStatus(b.deadline_date), priority: 'critical', placeholder: 'Final approval needed' },
          { id: 'air_date', label: 'Air Date', value: b.air_date || '', type: 'date', status: getFieldStatus(b.air_date), priority: 'critical', placeholder: 'Campaign launch' },
        ],
      },
      urgency: {
        label: 'Urgency',
        fields: [
          { id: 'deadline_urgency', label: 'Deadline Urgency', value: b.deadline_urgency || 'standard', type: 'select', options: ['standard', 'rush', 'urgent'], status: getFieldStatus(b.deadline_urgency), priority: 'important' },
          { id: 'timing_notes', label: 'Timing Notes', value: '', type: 'textarea', status: 'empty', priority: 'helpful', placeholder: 'Additional timing context' },
        ],
      },
    },
    OTHER: {
      context: {
        label: 'Campaign Context',
        fields: [
          { id: 'campaign_context', label: 'Campaign Background', value: '', type: 'textarea', status: 'empty', priority: 'helpful', placeholder: 'Background on the campaign' },
          { id: 'target_audience', label: 'Target Audience', value: '', type: 'textarea', status: 'empty', priority: 'helpful', placeholder: 'Who is this campaign for?' },
          { id: 'brand_values', label: 'Brand Values', value: [], type: 'tags', status: 'empty', priority: 'helpful', placeholder: 'Add brand attributes' },
          { id: 'previous_music', label: 'Previous Music', value: '', type: 'textarea', status: 'empty', priority: 'helpful', placeholder: 'Past music used by client' },
          { id: 'competitor_info', label: 'Competitor Info', value: '', type: 'textarea', status: 'empty', priority: 'helpful', placeholder: 'Competitor music usage' },
        ],
      },
      notes: {
        label: 'Notes & Comments',
        fields: [
          { id: 'notes', label: 'Additional Notes', value: '', type: 'textarea', status: 'empty', priority: 'helpful', placeholder: 'Any other relevant notes' },
          { id: 'approval_risks', label: 'Approval Risks', value: '', type: 'textarea', status: 'empty', priority: 'helpful', placeholder: 'Known approval challenges' },
        ],
      },
      attachments: {
        label: 'Attachments & Links',
        fields: [
          { id: 'creative_deck_link', label: 'Creative Deck', value: '', type: 'url', status: 'empty', priority: 'helpful', placeholder: 'Link to creative deck' },
          { id: 'agency_brief_link', label: 'Agency Brief', value: '', type: 'url', status: 'empty', priority: 'helpful', placeholder: 'Link to original brief' },
          { id: 'reference_playlist_link', label: 'Reference Playlist', value: '', type: 'url', status: 'empty', priority: 'helpful', placeholder: 'Spotify/Apple Music playlist' },
        ],
      },
    },
  }
}
