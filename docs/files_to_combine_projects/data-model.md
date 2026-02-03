# Data Model Documentation

## Database Overview
The TF Project Builder uses Supabase PostgreSQL with the following core tables:

---

## Core Tables

### tf_projects
Primary table for project metadata and classification.

```sql
CREATE TABLE tf_projects (
  -- Identity
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_number SERIAL,
  case_title VARCHAR(255) NOT NULL,
  catchy_case_id VARCHAR(100),  -- e.g., "BMW-Energetic-Drive"
  
  -- Classification
  project_type VARCHAR(20) CHECK (project_type IN (
    'SYNCH_A',      -- Budget >= €100k
    'SYNCH_B',      -- Budget €25k-100k
    'SYNCH_C',      -- Budget < €25k
    'PRODUCTION',   -- Custom music
    'UNKNOWN'       -- Not yet classified
  )),
  workflow_path VARCHAR(50),  -- Derived from project_type
  
  -- Financial
  budget_amount DECIMAL(12,2),
  budget_currency VARCHAR(3) DEFAULT 'EUR',
  payout_amount DECIMAL(12,2),  -- Calculated from margin
  margin_percentage DECIMAL(5,2),
  margin_tier VARCHAR(20),  -- LIBRARY, TIER_1-5
  
  -- Status
  status VARCHAR(50) DEFAULT 'draft' CHECK (status IN (
    'draft',
    'active', 
    'pending_info',
    'in_progress',
    'completed',
    'cancelled'
  )),
  brief_completeness INTEGER DEFAULT 0 CHECK (
    brief_completeness >= 0 AND brief_completeness <= 100
  ),
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Relationships
  created_by UUID REFERENCES auth.users(id),
  brief_id UUID REFERENCES tf_briefs(id),
  
  -- External integrations
  slack_channel_id VARCHAR(50),
  slack_channel_name VARCHAR(100),
  nextcloud_folder_path TEXT,
  google_doc_id VARCHAR(100)
);

-- Indexes
CREATE INDEX idx_projects_type ON tf_projects(project_type);
CREATE INDEX idx_projects_status ON tf_projects(status);
CREATE INDEX idx_projects_created ON tf_projects(created_at DESC);
```

### tf_briefs
Detailed brief information extracted from client communications.

```sql
CREATE TABLE tf_briefs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES tf_projects(id) ON DELETE CASCADE,
  
  -- Raw Input
  raw_brief_text TEXT,
  brief_source VARCHAR(50) CHECK (brief_source IN (
    'email', 'chat', 'manual', 'phone', 'meeting'
  )),
  
  -- ═══════════════════════════════════════════
  -- BUSINESS BRIEF
  -- ═══════════════════════════════════════════
  client_name VARCHAR(255),
  agency_name VARCHAR(255),
  brand_name VARCHAR(255),
  brief_sender_name VARCHAR(255),
  brief_sender_email VARCHAR(255),
  brief_sender_role VARCHAR(100),
  
  -- Territory & Rights
  territory JSONB DEFAULT '[]',
  -- Example: ["Germany", "Austria", "Switzerland"]
  
  media_types JSONB DEFAULT '[]',
  -- Example: ["TV", "Online", "Social", "Cinema"]
  
  term_length VARCHAR(100),  -- "1 year", "perpetuity", "6 months"
  exclusivity BOOLEAN DEFAULT FALSE,
  exclusivity_details TEXT,
  
  -- ═══════════════════════════════════════════
  -- CREATIVE BRIEF
  -- ═══════════════════════════════════════════
  creative_direction TEXT,
  mood_keywords JSONB DEFAULT '[]',
  -- Example: ["upbeat", "energetic", "youthful"]
  
  genre_preferences JSONB DEFAULT '[]',
  -- Example: ["indie pop", "electronic", "acoustic"]
  
  reference_tracks JSONB DEFAULT '[]',
  -- Example: [{
  --   "spotify_id": "xxx",
  --   "title": "Song Name",
  --   "artist": "Artist Name",
  --   "notes": "Love the energy in the chorus"
  -- }]
  
  lyrics_requirements TEXT,
  -- "Must have positive message", "Instrumental preferred"
  
  must_avoid TEXT,
  -- "No heavy metal, no profanity"
  
  vocals_preference VARCHAR(50) CHECK (vocals_preference IN (
    'instrumental', 'vocals', 'either', 'specific'
  )),
  vocals_details TEXT,
  
  -- ═══════════════════════════════════════════
  -- TECHNICAL BRIEF
  -- ═══════════════════════════════════════════
  video_lengths JSONB DEFAULT '[]',
  -- Example: ["15s", "30s", "60s"]
  
  deliverable_formats JSONB DEFAULT '[]',
  -- Example: ["WAV", "MP3", "stems"]
  
  stems_required BOOLEAN DEFAULT FALSE,
  stems_details TEXT,
  
  sync_points TEXT,
  -- "Music needs to hit at 0:15 for logo reveal"
  
  -- ═══════════════════════════════════════════
  -- CONTEXTUAL BRIEF
  -- ═══════════════════════════════════════════
  campaign_context TEXT,
  -- "Summer campaign launching new product line"
  
  target_audience TEXT,
  -- "18-35 urban millennials"
  
  brand_values JSONB DEFAULT '[]',
  -- Example: ["innovation", "sustainability", "premium"]
  
  competitor_info TEXT,
  -- "Competitor X recently used track Y"
  
  previous_music TEXT,
  -- "Last campaign used indie folk style"
  
  -- ═══════════════════════════════════════════
  -- TIMELINE & DELIVERABLES
  -- ═══════════════════════════════════════════
  deadline_date DATE,
  deadline_urgency VARCHAR(20) CHECK (deadline_urgency IN (
    'standard',   -- 2+ weeks
    'rush',       -- 1 week
    'urgent'      -- <1 week
  )),
  
  first_presentation_date DATE,
  air_date DATE,
  
  deliverables_summary TEXT,
  
  -- ═══════════════════════════════════════════
  -- ANALYSIS METADATA
  -- ═══════════════════════════════════════════
  completeness_score INTEGER DEFAULT 0,
  
  missing_critical JSONB DEFAULT '[]',
  -- Fields that block project progress
  -- Example: ["budget", "territory", "deadline"]
  
  missing_important JSONB DEFAULT '[]',
  -- Fields that help but aren't blocking
  -- Example: ["reference_tracks", "brand_values"]
  
  missing_helpful JSONB DEFAULT '[]',
  -- Nice-to-have fields
  -- Example: ["competitor_info", "previous_music"]
  
  ai_suggestions JSONB DEFAULT '[]',
  -- Example: [{
  --   "type": "clarification",
  --   "field": "mood_keywords",
  --   "suggestion": "Ask client: 'When you say upbeat, do you mean..."
  -- }]
  
  ai_enhancements JSONB DEFAULT '{}',
  -- Interpretations of vague terms
  -- Example: {"upbeat": {"bpm_range": "120-140", "energy": "high"}}
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  analyzed_at TIMESTAMPTZ,
  
  -- Version tracking
  version INTEGER DEFAULT 1,
  previous_version_id UUID REFERENCES tf_briefs(id)
);

-- Indexes
CREATE INDEX idx_briefs_project ON tf_briefs(project_id);
CREATE INDEX idx_briefs_client ON tf_briefs(client_name);
CREATE INDEX idx_briefs_completeness ON tf_briefs(completeness_score);
```

### tf_activity
Activity log for all project changes.

```sql
CREATE TABLE tf_activity (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES tf_projects(id) ON DELETE CASCADE,
  brief_id UUID REFERENCES tf_briefs(id) ON DELETE CASCADE,
  
  -- Activity classification
  activity_type VARCHAR(50) CHECK (activity_type IN (
    'brief_created',
    'brief_analyzed',
    'field_updated',
    'classification_changed',
    'status_changed',
    'agent_suggestion',
    'user_comment',
    'external_sync'
  )),
  
  -- Actor information
  actor_type VARCHAR(20) CHECK (actor_type IN (
    'user', 'agent', 'system', 'webhook'
  )),
  actor_id VARCHAR(100),  -- User ID or agent name
  actor_name VARCHAR(255),
  
  -- Change details
  field_changed VARCHAR(100),
  old_value JSONB,
  new_value JSONB,
  
  -- Context
  message TEXT,
  metadata JSONB DEFAULT '{}',
  
  -- Timestamp
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_activity_project ON tf_activity(project_id);
CREATE INDEX idx_activity_type ON tf_activity(activity_type);
CREATE INDEX idx_activity_created ON tf_activity(created_at DESC);
```

---

## Database Functions

### calculate_payout
Converts budget to payout using TF's margin structure.

```sql
CREATE OR REPLACE FUNCTION calculate_payout(
  budget DECIMAL,
  currency VARCHAR DEFAULT 'EUR'
)
RETURNS TABLE(
  payout DECIMAL,
  margin_pct DECIMAL,
  tier VARCHAR
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    CASE 
      WHEN budget <= 1500 THEN 0::DECIMAL
      WHEN budget <= 30000 THEN budget * 0.50
      WHEN budget <= 100000 THEN budget * 0.75
      WHEN budget <= 250000 THEN budget * 0.80
      WHEN budget <= 500000 THEN budget * 0.85
      ELSE budget * 0.90
    END as payout,
    CASE 
      WHEN budget <= 1500 THEN 100.00
      WHEN budget <= 30000 THEN 50.00
      WHEN budget <= 100000 THEN 25.00
      WHEN budget <= 250000 THEN 20.00
      WHEN budget <= 500000 THEN 15.00
      ELSE 10.00
    END as margin_pct,
    CASE 
      WHEN budget <= 1500 THEN 'LIBRARY'
      WHEN budget <= 30000 THEN 'TIER_1'
      WHEN budget <= 100000 THEN 'TIER_2'
      WHEN budget <= 250000 THEN 'TIER_3'
      WHEN budget <= 500000 THEN 'TIER_4'
      ELSE 'TIER_5'
    END as tier;
END;
$$ LANGUAGE plpgsql;
```

### classify_project
Determines project type from budget.

```sql
CREATE OR REPLACE FUNCTION classify_project(budget DECIMAL)
RETURNS VARCHAR AS $$
BEGIN
  RETURN CASE 
    WHEN budget IS NULL THEN 'UNKNOWN'
    WHEN budget >= 100000 THEN 'SYNCH_A'
    WHEN budget >= 25000 THEN 'SYNCH_B'
    ELSE 'SYNCH_C'
  END;
END;
$$ LANGUAGE plpgsql;
```

### calculate_completeness
Scores brief completeness from 0-100.

```sql
CREATE OR REPLACE FUNCTION calculate_completeness(brief_id UUID)
RETURNS INTEGER AS $$
DECLARE
  score INTEGER := 0;
  brief_record RECORD;
BEGIN
  SELECT * INTO brief_record FROM tf_briefs WHERE id = brief_id;
  
  -- Critical fields (10 points each, max 50)
  IF brief_record.client_name IS NOT NULL THEN score := score + 10; END IF;
  IF brief_record.territory IS NOT NULL AND brief_record.territory != '[]' THEN score := score + 10; END IF;
  IF brief_record.deadline_date IS NOT NULL THEN score := score + 10; END IF;
  IF brief_record.media_types IS NOT NULL AND brief_record.media_types != '[]' THEN score := score + 10; END IF;
  IF brief_record.creative_direction IS NOT NULL THEN score := score + 10; END IF;
  
  -- Important fields (5 points each, max 30)
  IF brief_record.brand_name IS NOT NULL THEN score := score + 5; END IF;
  IF brief_record.mood_keywords IS NOT NULL AND brief_record.mood_keywords != '[]' THEN score := score + 5; END IF;
  IF brief_record.genre_preferences IS NOT NULL AND brief_record.genre_preferences != '[]' THEN score := score + 5; END IF;
  IF brief_record.reference_tracks IS NOT NULL AND brief_record.reference_tracks != '[]' THEN score := score + 5; END IF;
  IF brief_record.video_lengths IS NOT NULL AND brief_record.video_lengths != '[]' THEN score := score + 5; END IF;
  IF brief_record.term_length IS NOT NULL THEN score := score + 5; END IF;
  
  -- Helpful fields (2 points each, max 20)
  IF brief_record.campaign_context IS NOT NULL THEN score := score + 2; END IF;
  IF brief_record.target_audience IS NOT NULL THEN score := score + 2; END IF;
  IF brief_record.brand_values IS NOT NULL AND brief_record.brand_values != '[]' THEN score := score + 2; END IF;
  IF brief_record.competitor_info IS NOT NULL THEN score := score + 2; END IF;
  IF brief_record.previous_music IS NOT NULL THEN score := score + 2; END IF;
  IF brief_record.agency_name IS NOT NULL THEN score := score + 2; END IF;
  IF brief_record.brief_sender_name IS NOT NULL THEN score := score + 2; END IF;
  IF brief_record.lyrics_requirements IS NOT NULL THEN score := score + 2; END IF;
  IF brief_record.must_avoid IS NOT NULL THEN score := score + 2; END IF;
  IF brief_record.sync_points IS NOT NULL THEN score := score + 2; END IF;
  
  RETURN LEAST(score, 100);
END;
$$ LANGUAGE plpgsql;
```

---

## TypeScript Types

```typescript
// types/database.ts

export interface Project {
  id: string;
  case_number: number;
  case_title: string;
  catchy_case_id: string | null;
  
  project_type: 'SYNCH_A' | 'SYNCH_B' | 'SYNCH_C' | 'PRODUCTION' | 'UNKNOWN';
  workflow_path: string | null;
  
  budget_amount: number | null;
  budget_currency: string;
  payout_amount: number | null;
  margin_percentage: number | null;
  margin_tier: string | null;
  
  status: 'draft' | 'active' | 'pending_info' | 'in_progress' | 'completed' | 'cancelled';
  brief_completeness: number;
  
  created_at: string;
  updated_at: string;
  created_by: string | null;
  
  brief_id: string | null;
  slack_channel_id: string | null;
  slack_channel_name: string | null;
  nextcloud_folder_path: string | null;
  google_doc_id: string | null;
}

export interface Brief {
  id: string;
  project_id: string;
  
  raw_brief_text: string | null;
  brief_source: 'email' | 'chat' | 'manual' | 'phone' | 'meeting' | null;
  
  // Business
  client_name: string | null;
  agency_name: string | null;
  brand_name: string | null;
  brief_sender_name: string | null;
  brief_sender_email: string | null;
  brief_sender_role: string | null;
  territory: string[];
  media_types: string[];
  term_length: string | null;
  exclusivity: boolean;
  exclusivity_details: string | null;
  
  // Creative
  creative_direction: string | null;
  mood_keywords: string[];
  genre_preferences: string[];
  reference_tracks: ReferenceTrack[];
  lyrics_requirements: string | null;
  must_avoid: string | null;
  vocals_preference: 'instrumental' | 'vocals' | 'either' | 'specific' | null;
  vocals_details: string | null;
  
  // Technical
  video_lengths: string[];
  deliverable_formats: string[];
  stems_required: boolean;
  stems_details: string | null;
  sync_points: string | null;
  
  // Contextual
  campaign_context: string | null;
  target_audience: string | null;
  brand_values: string[];
  competitor_info: string | null;
  previous_music: string | null;
  
  // Timeline
  deadline_date: string | null;
  deadline_urgency: 'standard' | 'rush' | 'urgent' | null;
  first_presentation_date: string | null;
  air_date: string | null;
  deliverables_summary: string | null;
  
  // Analysis
  completeness_score: number;
  missing_critical: string[];
  missing_important: string[];
  missing_helpful: string[];
  ai_suggestions: AISuggestion[];
  ai_enhancements: Record<string, any>;
  
  created_at: string;
  updated_at: string;
  analyzed_at: string | null;
  version: number;
}

export interface ReferenceTrack {
  spotify_id?: string;
  title: string;
  artist: string;
  notes?: string;
}

export interface AISuggestion {
  type: 'clarification' | 'enhancement' | 'warning' | 'alternative';
  field?: string;
  suggestion: string;
  priority?: 'high' | 'medium' | 'low';
}

export interface Activity {
  id: string;
  project_id: string;
  brief_id: string | null;
  
  activity_type: string;
  actor_type: 'user' | 'agent' | 'system' | 'webhook';
  actor_id: string | null;
  actor_name: string | null;
  
  field_changed: string | null;
  old_value: any;
  new_value: any;
  
  message: string | null;
  metadata: Record<string, any>;
  
  created_at: string;
}
```

---

## Realtime Subscriptions

```typescript
// Enable realtime for tables
ALTER PUBLICATION supabase_realtime ADD TABLE tf_projects;
ALTER PUBLICATION supabase_realtime ADD TABLE tf_briefs;
ALTER PUBLICATION supabase_realtime ADD TABLE tf_activity;

// Client subscription example
const subscription = supabase
  .channel('project-changes')
  .on(
    'postgres_changes',
    {
      event: '*',
      schema: 'public',
      table: 'tf_briefs',
      filter: `project_id=eq.${projectId}`
    },
    (payload) => {
      console.log('Brief updated:', payload);
      // Update local state
    }
  )
  .subscribe();
```
