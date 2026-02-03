# TF Project Builder - Technical Specification

**Version:** 1.0  
**Date:** January 13, 2026  
**Status:** Draft  

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Architecture Overview](#2-architecture-overview)
3. [Technology Stack](#3-technology-stack)
4. [Data Models & Schema](#4-data-models--schema)
5. [Backend Architecture](#5-backend-architecture)
6. [Frontend Architecture](#6-frontend-architecture)
7. [Agent Architecture](#7-agent-architecture)
8. [Real-Time State Management](#8-real-time-state-management)
9. [Integration Points](#9-integration-points)
10. [Security & Authentication](#10-security--authentication)
11. [Deployment Architecture](#11-deployment-architecture)
12. [Implementation Phases](#12-implementation-phases)
13. [Testing Strategy](#13-testing-strategy)
14. [Appendices](#appendices)

---

## 1. Executive Summary

### 1.1 Project Vision

Build a purpose-built web application for Tracks & Fields (TF) that provides a **side-by-side interface** where users can simultaneously:
- **Chat with an AI briefing agent** (right panel) to extract and refine project details
- **View and edit a live project canvas** (left panel) that updates in real-time

This replaces the current OpenWebUI → webhook → Slack flow with a cohesive, professional experience designed specifically for music supervision workflows.

### 1.2 Core Principles

| Principle | Description |
|-----------|-------------|
| **Bidirectional Sync** | Changes flow both ways: chat updates canvas, canvas edits update agent context |
| **100% Creative Fulfillment** | Agent enhances vague briefs into comprehensive, searchable intelligence |
| **Human-in-the-Loop** | Users maintain control; agent suggests, user confirms |
| **Progressive Enhancement** | Start with brief extraction, expand to full project lifecycle |
| **Self-Hosted** | Deployable on TF servers with no external dependencies |

### 1.3 Key Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Frontend Framework | **Next.js 14+** | Full-stack React, SSR, API routes, excellent DX |
| Agent Framework | **CopilotKit + AG-UI** | Real-time bidirectional state, tool rendering, HITL support |
| LLM | **gpt-oss-20b** | Apache 2.0, runs on 16GB, tool calling, self-hostable |
| Backend | **FastAPI (Python)** | LangGraph compatibility, async, type-safe |
| Database | **Supabase PostgreSQL** | Existing infrastructure, real-time subscriptions |
| Real-time | **Supabase Realtime** | Native PostgreSQL integration, WebSocket support |
| Generative UI | **Open-JSON-UI** | OpenAI standard, declarative, streaming-friendly |

---

## 2. Architecture Overview

### 2.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           TF Project Builder                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌─────────────────────────────┐    ┌─────────────────────────────────────┐ │
│  │                             │    │                                     │ │
│  │     📋 PROJECT CANVAS       │    │         💬 CHAT PANEL               │ │
│  │        (Left Panel)         │    │         (Right Panel)               │ │
│  │                             │    │                                     │ │
│  │  ┌───────────────────────┐  │    │  ┌─────────────────────────────┐   │ │
│  │  │ [Brief] [Team] [Time] │  │    │  │  Agent: "I've extracted     │   │ │
│  │  └───────────────────────┘  │    │  │  the following from your    │   │ │
│  │                             │    │  │  brief..."                  │   │ │
│  │  Business Brief             │    │  │                             │   │ │
│  │  ┌───────────────────────┐  │    │  │  [Suggested fields appear]  │   │ │
│  │  │ Client: [BMW      ▼]  │  │◄───┼──►                             │   │ │
│  │  │ Brand:  [4MATIC    ]  │  │    │  │  User: "The budget should   │   │ │
│  │  │ Budget: [€75,000   ]  │  │    │  │  be €75k not €50k"          │   │ │
│  │  │ Tier:   [B] Auto-calc │  │    │  │                             │   │ │
│  │  └───────────────────────┘  │    │  │  Agent: "Updated! I've      │   │ │
│  │                             │    │  │  recalculated the payout..."│   │ │
│  │  Creative Brief             │    │  └─────────────────────────────┘   │ │
│  │  ┌───────────────────────┐  │    │                                     │ │
│  │  │ Mood: [Energetic    ] │  │    │  ┌─────────────────────────────┐   │ │
│  │  │ Keywords: [+Add]      │  │    │  │ Type a message...      [→] │   │ │
│  │  │ • uplifting           │  │    │  └─────────────────────────────┘   │ │
│  │  │ • driving             │  │    │                                     │ │
│  │  └───────────────────────┘  │    │                                     │ │
│  │                             │    │                                     │ │
│  │  [Create Project] [Save]    │    │                                     │ │
│  │                             │    │                                     │ │
│  └─────────────────────────────┘    └─────────────────────────────────────┘ │
│                                                                              │
├──────────────────────────────────────┬──────────────────────────────────────┤
│          Shared State Layer          │        CopilotKit Runtime            │
│     (React Context / Zustand)        │     (AG-UI Protocol over WS)         │
└──────────────────────────────────────┴──────────────────────────────────────┘
                                       │
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                              Backend Services                                │
├──────────────────┬──────────────────┬───────────────────┬───────────────────┤
│                  │                  │                   │                   │
│   FastAPI        │   LangGraph      │   gpt-oss-20b     │   Supabase        │
│   REST API       │   Agent          │   (Self-hosted    │   PostgreSQL      │
│                  │   Orchestrator   │   or OpenRouter)  │   + Realtime      │
│   • Projects     │                  │                   │                   │
│   • Briefs       │   • Brief        │   • Reasoning     │   • tf_projects   │
│   • Users        │     Extraction   │   • Tool calling  │   • tf_briefs     │
│   • Activities   │   • Enhancement  │   • Streaming     │   • tf_users      │
│                  │   • Suggestions  │                   │   • tf_activity   │
│                  │                  │                   │                   │
└──────────────────┴──────────────────┴───────────────────┴───────────────────┘
                                       │
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                          External Integrations                               │
├────────────────────┬────────────────────┬───────────────────────────────────┤
│   n8n Workflows    │   Slack            │   Nextcloud / Google Drive        │
│   (via webhooks)   │   (notifications)  │   (file storage)                  │
└────────────────────┴────────────────────┴───────────────────────────────────┘
```

### 2.2 Data Flow

```
User Action                    State Change                  Side Effects
─────────────────────────────────────────────────────────────────────────────

1. CHAT MESSAGE
   User: "Budget is €75k"
         │
         ▼
   ┌─────────────────┐
   │  CopilotKit     │──► Agent processes message
   │  Runtime        │    Agent calls updateBrief tool
   │  (AG-UI)        │    Tool emits STATE_SNAPSHOT event
   └────────┬────────┘
            │
            ▼
   ┌─────────────────┐
   │  Shared State   │──► budget field updates to €75,000
   │  (useCoAgent)   │    tier auto-calculates to "B"
   └────────┬────────┘    payout calculates to €37,500
            │
            ▼
   Canvas re-renders with new values
   Supabase syncs (debounced)

2. DIRECT EDIT
   User clicks Budget field, types €100,000
         │
         ▼
   ┌─────────────────┐
   │  Form onChange  │──► Local state updates immediately
   │  Handler        │    Debounced sync to shared state
   └────────┬────────┘
            │
            ▼
   ┌─────────────────┐
   │  Shared State   │──► Agent context includes new value
   │  Sync           │    Supabase persists change
   └────────┬────────┘    Activity logged
            │
            ▼
   Next agent message sees updated budget
   Agent can comment: "I see you updated the budget..."
```

---

## 3. Technology Stack

### 3.1 Frontend

| Layer | Technology | Version | Purpose |
|-------|------------|---------|---------|
| Framework | Next.js | 14.x | React framework with App Router |
| UI Components | shadcn/ui | Latest | Accessible, customizable components |
| Styling | Tailwind CSS | 3.x | Utility-first CSS |
| State Management | Zustand | 4.x | Lightweight global state |
| Agent Integration | CopilotKit | 1.50+ | AG-UI protocol, useCoAgent hook |
| Forms | React Hook Form | 7.x | Form handling + validation |
| Validation | Zod | 3.x | Schema validation |
| Icons | Lucide React | Latest | Icon library |

### 3.2 Backend

| Layer | Technology | Version | Purpose |
|-------|------------|---------|---------|
| API Framework | FastAPI | 0.109+ | REST API, async support |
| Agent Framework | LangGraph | 0.2+ | Agent orchestration |
| LLM Interface | LangChain | 0.3+ | LLM abstraction layer |
| Validation | Pydantic | 2.x | Data validation |
| Database ORM | SQLAlchemy | 2.x | Database abstraction |
| Task Queue | Celery (optional) | 5.x | Background tasks |

### 3.3 LLM Configuration

**Primary Model: gpt-oss-20b**

```yaml
Model: openai/gpt-oss-20b
Parameters:
  total: 21B
  active: 3.6B (MoE)
Memory: 16GB minimum
License: Apache 2.0
Capabilities:
  - Function/tool calling
  - Structured outputs
  - Configurable reasoning (low/medium/high)
  - Full chain-of-thought

Hosting Options:
  1. Self-hosted via vLLM/Ollama
  2. OpenRouter API (managed)
  3. Together AI (managed)
```

**Configuration:**

```python
# agent/config.py
LLM_CONFIG = {
    "model": "openai/gpt-oss-20b",
    "reasoning_effort": "medium",  # low, medium, high
    "temperature": 0.7,
    "max_tokens": 4096,
    "tools": [...],  # Brief extraction tools
}
```

### 3.4 Database

**Supabase PostgreSQL with Extensions:**

```sql
-- Required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- For full-text search on briefs
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
```

### 3.5 Infrastructure

| Component | Technology | Purpose |
|-----------|------------|---------|
| Container | Docker | Containerization |
| Orchestration | Docker Compose | Multi-container management |
| Reverse Proxy | Nginx/Caddy | SSL termination, routing |
| Process Manager | PM2/Supervisor | Process management |

---

## 4. Data Models & Schema

### 4.1 Core Entities

```
┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
│    tf_users     │       │   tf_projects   │       │   tf_briefs     │
├─────────────────┤       ├─────────────────┤       ├─────────────────┤
│ id (PK)         │       │ id (PK)         │       │ id (PK)         │
│ email           │◄──┐   │ project_number  │       │ project_id (FK) │──┐
│ name            │   │   │ catchy_id       │       │ version         │  │
│ role            │   └───│ owner_id (FK)   │       │ analysis (JSON) │  │
│ avatar_url      │       │ status          │◄──────│ quality_score   │  │
│ created_at      │       │ created_at      │       │ created_at      │  │
└─────────────────┘       └─────────────────┘       └─────────────────┘  │
                                   │                         │           │
                                   │                         ▼           │
                          ┌────────┴────────┐       ┌─────────────────┐  │
                          │                 │       │ tf_activity     │  │
                          ▼                 ▼       ├─────────────────┤  │
                 ┌─────────────────┐  ┌──────────┐ │ id (PK)         │  │
                 │ tf_project_team │  │tf_slack  │ │ project_id (FK) │◄─┘
                 ├─────────────────┤  │_channels │ │ brief_id (FK)   │
                 │ project_id (FK) │  ├──────────┤ │ activity_type   │
                 │ user_id (FK)    │  │project_id│ │ changes (JSON)  │
                 │ role            │  │channel_id│ │ user_id (FK)    │
                 │ is_primary      │  │ name     │ │ source          │
                 └─────────────────┘  └──────────┘ │ created_at      │
                                                   └─────────────────┘
```

### 4.2 Database Schema

```sql
-- ============================================
-- USERS
-- ============================================
CREATE TABLE tf_users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'user' CHECK (role IN ('user', 'admin', 'supervisor', 'coordinator', 'viewer')),
    avatar_url TEXT,
    preferences JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- PROJECTS
-- ============================================
CREATE TABLE tf_projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Identifiers
    project_number SERIAL,
    catchy_id VARCHAR(100) UNIQUE,  -- e.g., "TF-00147-bmw-energetic"
    title VARCHAR(500),
    
    -- Classification
    project_type VARCHAR(20) CHECK (project_type IN ('SYNCH_A', 'SYNCH_B', 'SYNCH_C', 'PRODUCTION', 'UNKNOWN')),
    project_category VARCHAR(50),  -- e.g., 'search_only', 'search_licensing', 'bespoke'
    
    -- Ownership
    owner_id UUID REFERENCES tf_users(id),
    
    -- Status
    status VARCHAR(50) DEFAULT 'draft' CHECK (status IN (
        'draft', 'active', 'in_review', 'pending_client', 
        'cleared', 'delivered', 'completed', 'on_hold', 'cancelled'
    )),
    
    -- Integration references
    slack_channel_id VARCHAR(50),
    slack_channel_name VARCHAR(100),
    nextcloud_folder_path TEXT,
    google_drive_id VARCHAR(100),
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Session tracking (for chat continuity)
    session_id VARCHAR(100)
);

CREATE INDEX idx_projects_owner ON tf_projects(owner_id);
CREATE INDEX idx_projects_status ON tf_projects(status);
CREATE INDEX idx_projects_catchy_id ON tf_projects(catchy_id);

-- ============================================
-- BRIEFS (Versioned)
-- ============================================
CREATE TABLE tf_briefs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES tf_projects(id) ON DELETE CASCADE,
    version INTEGER DEFAULT 1,
    
    -- Full analysis JSON (complete brief extraction)
    analysis JSONB NOT NULL DEFAULT '{}',
    
    -- Flattened fields for querying (denormalized from analysis)
    -- Business Brief
    client VARCHAR(255),
    agency VARCHAR(255),
    brand VARCHAR(255),
    brief_sender VARCHAR(255),
    brief_sender_email VARCHAR(255),
    
    -- Budget & Classification
    budget_raw VARCHAR(100),
    budget_min DECIMAL(12,2),
    budget_max DECIMAL(12,2),
    budget_currency VARCHAR(10) DEFAULT 'EUR',
    calculated_payout DECIMAL(12,2),
    margin_percentage DECIMAL(5,2),
    
    -- Territory & Rights
    territories TEXT[],
    media_types TEXT[],
    term VARCHAR(100),
    
    -- Creative
    mood TEXT,
    keywords TEXT[],
    genres TEXT[],
    reference_tracks JSONB DEFAULT '[]',
    instruments TEXT[],
    
    -- Deliverables
    lengths TEXT[],
    cutdowns TEXT[],
    extras TEXT[],
    
    -- Dates
    submission_deadline DATE,
    ppm_date DATE,
    shoot_date DATE,
    air_date DATE,
    
    -- Quality Metrics
    extraction_status VARCHAR(20) DEFAULT 'pending' CHECK (extraction_status IN ('pending', 'partial', 'complete')),
    brief_quality VARCHAR(20) CHECK (brief_quality IN ('excellent', 'good', 'fair', 'poor')),
    confidence_score DECIMAL(3,2),
    missing_information TEXT[],
    extraction_notes TEXT,
    
    -- Human-in-the-loop status
    hitl_status VARCHAR(20) DEFAULT 'pending' CHECK (hitl_status IN ('pending', 'confirmed', 'modified', 'rejected')),
    hitl_modified_by UUID REFERENCES tf_users(id),
    hitl_modified_at TIMESTAMP WITH TIME ZONE,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(project_id, version)
);

CREATE INDEX idx_briefs_project ON tf_briefs(project_id);
CREATE INDEX idx_briefs_client ON tf_briefs(client);
CREATE INDEX idx_briefs_brand ON tf_briefs(brand);
CREATE INDEX idx_briefs_keywords ON tf_briefs USING GIN(keywords);

-- ============================================
-- PROJECT TEAM
-- ============================================
CREATE TABLE tf_project_team (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES tf_projects(id) ON DELETE CASCADE,
    user_id UUID REFERENCES tf_users(id),
    
    -- Role on project
    role VARCHAR(50) NOT NULL CHECK (role IN (
        'project_lead', 'account_contact', 'creative_lead', 
        'music_supervisor', 'licensing_lead', 'composer',
        'support', 'backup', 'external_partner'
    )),
    
    -- For external team members (not in tf_users)
    external_name VARCHAR(255),
    external_email VARCHAR(255),
    
    is_primary BOOLEAN DEFAULT FALSE,
    notes TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(project_id, user_id, role)
);

-- ============================================
-- ACTIVITY LOG
-- ============================================
CREATE TABLE tf_activity (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES tf_projects(id) ON DELETE CASCADE,
    brief_id UUID REFERENCES tf_briefs(id),
    
    activity_type VARCHAR(50) NOT NULL CHECK (activity_type IN (
        'project_created', 'brief_extracted', 'brief_updated', 
        'brief_confirmed', 'status_changed', 'team_assigned',
        'file_uploaded', 'slack_notified', 'comment_added'
    )),
    
    activity_description TEXT,
    changes JSONB,  -- { field: { old: x, new: y } }
    
    user_id UUID REFERENCES tf_users(id),
    source VARCHAR(50) CHECK (source IN ('chat', 'canvas', 'slack', 'api', 'system')),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_activity_project ON tf_activity(project_id);
CREATE INDEX idx_activity_type ON tf_activity(activity_type);
CREATE INDEX idx_activity_created ON tf_activity(created_at DESC);

-- ============================================
-- CHAT SESSIONS (for conversation continuity)
-- ============================================
CREATE TABLE tf_chat_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES tf_projects(id),
    user_id UUID NOT NULL REFERENCES tf_users(id),
    
    -- AG-UI thread tracking
    thread_id VARCHAR(100),
    
    -- Conversation state
    messages JSONB DEFAULT '[]',
    agent_state JSONB DEFAULT '{}',
    
    -- Status
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'abandoned')),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_projects_timestamp
    BEFORE UPDATE ON tf_projects
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_briefs_timestamp
    BEFORE UPDATE ON tf_briefs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Generate catchy_id for new projects
CREATE OR REPLACE FUNCTION generate_catchy_id()
RETURNS TRIGGER AS $$
DECLARE
    client_slug VARCHAR(20);
    keywords_slug VARCHAR(30);
BEGIN
    -- Extract first word of client (lowercase, alphanumeric only)
    client_slug := LOWER(REGEXP_REPLACE(
        COALESCE(
            (SELECT client FROM tf_briefs WHERE project_id = NEW.id ORDER BY version DESC LIMIT 1),
            'unknown'
        ),
        '[^a-zA-Z0-9]', '', 'g'
    ));
    client_slug := SUBSTRING(client_slug FROM 1 FOR 15);
    
    -- Generate catchy_id
    NEW.catchy_id := 'TF-' || LPAD(NEW.project_number::TEXT, 5, '0') || '-' || client_slug;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Calculate margin and payout
CREATE OR REPLACE FUNCTION calculate_payout(budget DECIMAL)
RETURNS TABLE(payout DECIMAL, margin_pct DECIMAL) AS $$
BEGIN
    IF budget <= 1500 THEN
        RETURN QUERY SELECT budget, 100.00::DECIMAL;  -- 100% margin (blanket)
    ELSIF budget <= 30000 THEN
        RETURN QUERY SELECT budget * 0.50, 50.00::DECIMAL;  -- 50% margin
    ELSIF budget <= 100000 THEN
        RETURN QUERY SELECT budget * 0.75, 25.00::DECIMAL;  -- 25% margin
    ELSIF budget <= 250000 THEN
        RETURN QUERY SELECT budget * 0.80, 20.00::DECIMAL;  -- 20% margin
    ELSIF budget <= 500000 THEN
        RETURN QUERY SELECT budget * 0.85, 15.00::DECIMAL;  -- 15% margin
    ELSE
        RETURN QUERY SELECT budget * 0.90, 10.00::DECIMAL;  -- 10% margin
    END IF;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================
ALTER TABLE tf_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE tf_briefs ENABLE ROW LEVEL SECURITY;
ALTER TABLE tf_activity ENABLE ROW LEVEL SECURITY;

-- Policies (simplified - expand based on role requirements)
CREATE POLICY "Users can view all projects" ON tf_projects
    FOR SELECT USING (true);

CREATE POLICY "Users can create projects" ON tf_projects
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Owners can update their projects" ON tf_projects
    FOR UPDATE USING (owner_id = auth.uid() OR 
        EXISTS (SELECT 1 FROM tf_users WHERE id = auth.uid() AND role IN ('admin', 'supervisor')));
```

### 4.3 Brief Analysis JSON Schema

The `analysis` JSONB field in `tf_briefs` follows this structure:

```typescript
interface BriefAnalysis {
  // Extraction metadata
  extraction_status: 'pending' | 'partial' | 'complete';
  brief_quality: 'excellent' | 'good' | 'fair' | 'poor';
  confidence_score: number; // 0.0 - 1.0
  
  // 1. Business Brief
  business_brief: {
    client: string | null;
    agency: string | null;
    brand: string | null;
    brief_sender: string | null;
    brief_sender_email: string | null;
    media: string[];
    territory: string[];
    budget: string | null;
    budget_parsed: {
      min: number | null;
      max: number | null;
      currency: string;
    };
    term: string | null;
    lengths: string[];
    cutdowns: string[];
    extras: string[];
    options: string[];
  };
  
  // 2. Creative Brief
  creative_brief: {
    original_brief: string | null;
    mood: string | null;
    keywords: string[];
    genres: string[];
    reference_tracks: Array<{
      title: string;
      artist: string;
      spotify_id?: string;
      notes?: string;
    }>;
    descriptions: string | null;
    lyrics_requirements: string | null;
    structure_preferences: string | null;
    instruments: string[];
    enhanced_interpretation: {
      search_keywords: string[];
      mood_descriptors: string[];
      genre_suggestions: string[];
      reference_analysis: string | null;
      enhancement_level: 'minimal' | 'moderate' | 'significant';
    };
  };
  
  // 3. Contextual Brief
  contextual_brief: {
    brand_category: string | null;
    brand_attributes: string[];
    story: string | null;
    music_performance: string | null;
    audience_preferences: string | null;
    director_vision: string | null;
  };
  
  // 4. Technical Brief
  technical_brief: {
    lengths: string[];
    musical_attributes: {
      bpm: string | null;
      key: string | null;
      time_signature: string | null;
    };
    process_requirements: string | null;
    stem_requirements: string | null;
    format_specifications: string | null;
  };
  
  // 5. Deliverables & Deadlines
  deliverables: {
    urgency_level: 'rush' | 'standard' | 'flexible';
    brief_received: string | null;  // ISO date
    submission_deadline: string | null;
    ppm_date: string | null;
    shoot_date: string | null;
    offline_edit: string | null;
    online_delivery: string | null;
    final_delivery: string | null;
    air_date: string | null;
  };
  
  // 6. Competitive Brief
  competitive_brief: {
    stakeholders: string[];
    competitor_activity: string | null;
    pitch_situation: string | null;
    multiple_parties_pitching: boolean | null;
    strategic_alternatives: {
      high_budget: string[];
      medium_budget: string[];
      low_budget: string[];
    };
    boundary_pushing_ideas: string[];
    wildcard_opportunities: string[];
  };
  
  // Quality tracking
  missing_information: Array<{
    field: string;
    priority: 'critical' | 'important' | 'helpful';
    suggested_question: string;
  }>;
  extraction_notes: string | null;
}
```

---

## 5. Backend Architecture

### 5.1 FastAPI Application Structure

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py                 # FastAPI app initialization
│   ├── config.py               # Environment configuration
│   │
│   ├── api/
│   │   ├── __init__.py
│   │   ├── deps.py             # Dependency injection
│   │   ├── v1/
│   │   │   ├── __init__.py
│   │   │   ├── router.py       # API router aggregation
│   │   │   ├── projects.py     # Project CRUD endpoints
│   │   │   ├── briefs.py       # Brief endpoints
│   │   │   ├── users.py        # User endpoints
│   │   │   └── webhooks.py     # n8n webhook handlers
│   │   └── copilot/
│   │       ├── __init__.py
│   │       └── route.py        # CopilotKit runtime endpoint
│   │
│   ├── agent/
│   │   ├── __init__.py
│   │   ├── graph.py            # LangGraph agent definition
│   │   ├── state.py            # Agent state schema
│   │   ├── nodes/
│   │   │   ├── __init__.py
│   │   │   ├── extract.py      # Brief extraction node
│   │   │   ├── enhance.py      # Creative enhancement node
│   │   │   ├── classify.py     # Project classification node
│   │   │   └── suggest.py      # Proactive suggestions node
│   │   ├── tools/
│   │   │   ├── __init__.py
│   │   │   ├── update_brief.py # Brief update tool
│   │   │   ├── get_status.py   # Status retrieval tool
│   │   │   └── calculate.py    # Budget/payout calculation
│   │   └── prompts/
│   │       ├── __init__.py
│   │       └── brief_analyzer.py
│   │
│   ├── models/
│   │   ├── __init__.py
│   │   ├── project.py          # SQLAlchemy models
│   │   ├── brief.py
│   │   ├── user.py
│   │   └── activity.py
│   │
│   ├── schemas/
│   │   ├── __init__.py
│   │   ├── project.py          # Pydantic schemas
│   │   ├── brief.py
│   │   └── analysis.py
│   │
│   ├── services/
│   │   ├── __init__.py
│   │   ├── project_service.py
│   │   ├── brief_service.py
│   │   └── notification_service.py
│   │
│   └── db/
│       ├── __init__.py
│       ├── session.py          # Database session
│       └── supabase.py         # Supabase client
│
├── tests/
│   ├── __init__.py
│   ├── conftest.py
│   ├── test_api/
│   └── test_agent/
│
├── Dockerfile
├── requirements.txt
└── pyproject.toml
```

### 5.2 API Endpoints

```yaml
# Projects API
POST   /api/v1/projects              # Create new project
GET    /api/v1/projects              # List projects (with filters)
GET    /api/v1/projects/{id}         # Get project details
PATCH  /api/v1/projects/{id}         # Update project
DELETE /api/v1/projects/{id}         # Delete project

# Briefs API
POST   /api/v1/projects/{id}/briefs  # Create brief version
GET    /api/v1/projects/{id}/briefs  # List brief versions
GET    /api/v1/briefs/{id}           # Get specific brief
PATCH  /api/v1/briefs/{id}           # Update brief
POST   /api/v1/briefs/{id}/confirm   # Confirm HITL review

# Activity API
GET    /api/v1/projects/{id}/activity  # Get project activity log

# Users API
GET    /api/v1/users/me              # Get current user
GET    /api/v1/users                 # List users (admin)

# CopilotKit Runtime (AG-UI Protocol)
POST   /api/copilot                  # CopilotKit SSE endpoint

# Webhooks (for n8n integration)
POST   /api/webhooks/slack-update    # Receive Slack updates
POST   /api/webhooks/file-sync       # Trigger file sync
```

### 5.3 LangGraph Agent Definition

```python
# app/agent/graph.py
from langgraph.graph import StateGraph, END
from langgraph.prebuilt import ToolNode
from copilotkit.langgraph import copilotkit_emit_state

from app.agent.state import AgentState
from app.agent.nodes import extract_node, enhance_node, classify_node, suggest_node
from app.agent.tools import update_brief_tool, get_status_tool, calculate_payout_tool


def create_brief_agent():
    """Create the TF Brief Analysis agent graph."""
    
    # Define the graph
    graph = StateGraph(AgentState)
    
    # Add nodes
    graph.add_node("extract", extract_node)
    graph.add_node("enhance", enhance_node)
    graph.add_node("classify", classify_node)
    graph.add_node("suggest", suggest_node)
    graph.add_node("tools", ToolNode([
        update_brief_tool,
        get_status_tool,
        calculate_payout_tool
    ]))
    
    # Define edges
    graph.set_entry_point("extract")
    
    graph.add_edge("extract", "enhance")
    graph.add_edge("enhance", "classify")
    graph.add_edge("classify", "suggest")
    
    # Conditional routing from suggest
    graph.add_conditional_edges(
        "suggest",
        should_use_tools,
        {
            "tools": "tools",
            "end": END
        }
    )
    
    graph.add_edge("tools", "suggest")
    
    return graph.compile()


def should_use_tools(state: AgentState) -> str:
    """Determine if we should route to tools or end."""
    if state.get("pending_tool_calls"):
        return "tools"
    return "end"
```

### 5.4 Agent State Schema

```python
# app/agent/state.py
from typing import TypedDict, List, Optional, Annotated
from langgraph.graph import add_messages
from copilotkit.langgraph import CopilotKitState


class BriefState(TypedDict):
    """State for brief extraction and editing."""
    
    # Business Brief
    client: Optional[str]
    agency: Optional[str]
    brand: Optional[str]
    brief_sender: Optional[str]
    budget: Optional[str]
    budget_min: Optional[float]
    budget_max: Optional[float]
    territories: List[str]
    media_types: List[str]
    term: Optional[str]
    lengths: List[str]
    
    # Creative Brief
    mood: Optional[str]
    keywords: List[str]
    genres: List[str]
    reference_tracks: List[dict]
    instruments: List[str]
    enhanced_keywords: List[str]
    
    # Classification
    project_type: Optional[str]  # SYNCH_A, SYNCH_B, SYNCH_C, PRODUCTION
    calculated_payout: Optional[float]
    margin_percentage: Optional[float]
    
    # Dates
    submission_deadline: Optional[str]
    ppm_date: Optional[str]
    shoot_date: Optional[str]
    air_date: Optional[str]
    
    # Quality
    confidence_score: float
    extraction_status: str
    missing_information: List[dict]


class AgentState(CopilotKitState):
    """Full agent state including CopilotKit integration."""
    
    messages: Annotated[list, add_messages]
    brief: BriefState
    
    # Project tracking
    project_id: Optional[str]
    project_status: str
    
    # Suggestions
    pending_suggestions: List[dict]
    
    # Tool tracking
    pending_tool_calls: List[dict]
```

### 5.5 CopilotKit Runtime Endpoint

```python
# app/api/copilot/route.py
from fastapi import APIRouter, Request
from fastapi.responses import StreamingResponse
from copilotkit.langgraph import copilotkit_messages_to_langchain
from copilotkit import CopilotKitRemoteEndpoint, LangGraphAgent

from app.agent.graph import create_brief_agent
from app.config import settings

router = APIRouter()

# Initialize the agent
brief_agent = create_brief_agent()

# Create CopilotKit endpoint
copilot = CopilotKitRemoteEndpoint(
    agents=[
        LangGraphAgent(
            name="brief_analyzer",
            description="Analyzes music licensing briefs and extracts structured information",
            graph=brief_agent,
        )
    ]
)


@router.post("/copilot")
async def copilot_runtime(request: Request):
    """CopilotKit runtime endpoint using AG-UI protocol."""
    return copilot.handle(request)
```

---

## 6. Frontend Architecture

### 6.1 Project Structure

```
frontend/
├── src/
│   ├── app/
│   │   ├── layout.tsx              # Root layout with providers
│   │   ├── page.tsx                # Landing/dashboard
│   │   ├── projects/
│   │   │   ├── page.tsx            # Projects list
│   │   │   ├── new/
│   │   │   │   └── page.tsx        # New project (canvas + chat)
│   │   │   └── [id]/
│   │   │       ├── page.tsx        # Project detail
│   │   │       └── edit/
│   │   │           └── page.tsx    # Edit project (canvas + chat)
│   │   └── api/
│   │       └── copilotkit/
│   │           └── route.ts        # CopilotKit API route
│   │
│   ├── components/
│   │   ├── ui/                     # shadcn/ui components
│   │   │   ├── button.tsx
│   │   │   ├── input.tsx
│   │   │   ├── card.tsx
│   │   │   └── ...
│   │   │
│   │   ├── layout/
│   │   │   ├── Header.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   └── SplitPane.tsx       # Resizable split view
│   │   │
│   │   ├── canvas/                 # Project Canvas (Left Panel)
│   │   │   ├── ProjectCanvas.tsx   # Main canvas container
│   │   │   ├── CanvasTabs.tsx      # Brief/Team/Timeline tabs
│   │   │   ├── BriefCanvas.tsx     # Brief form view
│   │   │   ├── sections/
│   │   │   │   ├── BusinessSection.tsx
│   │   │   │   ├── CreativeSection.tsx
│   │   │   │   ├── ContextualSection.tsx
│   │   │   │   ├── TechnicalSection.tsx
│   │   │   │   ├── DeliverablesSection.tsx
│   │   │   │   └── CompetitiveSection.tsx
│   │   │   ├── fields/
│   │   │   │   ├── TextField.tsx
│   │   │   │   ├── TagsField.tsx
│   │   │   │   ├── DateField.tsx
│   │   │   │   ├── BudgetField.tsx
│   │   │   │   └── ReferenceTracksField.tsx
│   │   │   └── indicators/
│   │   │       ├── QualityIndicator.tsx
│   │   │       ├── TierBadge.tsx
│   │   │       └── MissingFieldsAlert.tsx
│   │   │
│   │   ├── chat/                   # Chat Panel (Right Panel)
│   │   │   ├── ChatPanel.tsx       # Main chat container
│   │   │   ├── MessageList.tsx
│   │   │   ├── MessageInput.tsx
│   │   │   ├── AgentMessage.tsx
│   │   │   ├── UserMessage.tsx
│   │   │   └── SuggestionCard.tsx  # Agent suggestions UI
│   │   │
│   │   └── shared/
│   │       ├── LoadingState.tsx
│   │       ├── ErrorBoundary.tsx
│   │       └── ConfirmDialog.tsx
│   │
│   ├── hooks/
│   │   ├── useProject.ts           # Project data hook
│   │   ├── useBrief.ts             # Brief state hook
│   │   ├── useCanvas.ts            # Canvas-specific logic
│   │   └── useRealtime.ts          # Supabase realtime hook
│   │
│   ├── lib/
│   │   ├── supabase.ts             # Supabase client
│   │   ├── api.ts                  # API client
│   │   ├── utils.ts                # Utility functions
│   │   └── calculations.ts         # Budget/payout calculations
│   │
│   ├── store/
│   │   ├── index.ts                # Zustand store setup
│   │   ├── briefSlice.ts           # Brief state slice
│   │   └── uiSlice.ts              # UI state slice
│   │
│   ├── types/
│   │   ├── index.ts
│   │   ├── project.ts
│   │   ├── brief.ts
│   │   └── agent.ts
│   │
│   └── styles/
│       └── globals.css
│
├── public/
├── next.config.js
├── tailwind.config.js
├── tsconfig.json
└── package.json
```

### 6.2 Core Components

#### 6.2.1 Split Pane Layout

```tsx
// src/components/layout/SplitPane.tsx
'use client';

import { useState, useCallback } from 'react';
import { cn } from '@/lib/utils';

interface SplitPaneProps {
  left: React.ReactNode;
  right: React.ReactNode;
  defaultRatio?: number;  // 0-1, default 0.6 (60% left)
  minLeft?: number;       // Min width in pixels
  minRight?: number;
}

export function SplitPane({
  left,
  right,
  defaultRatio = 0.6,
  minLeft = 400,
  minRight = 350,
}: SplitPaneProps) {
  const [ratio, setRatio] = useState(defaultRatio);
  const [isDragging, setIsDragging] = useState(false);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging) return;
    
    const container = document.getElementById('split-container');
    if (!container) return;
    
    const rect = container.getBoundingClientRect();
    const newRatio = (e.clientX - rect.left) / rect.width;
    
    // Enforce min widths
    const leftWidth = rect.width * newRatio;
    const rightWidth = rect.width * (1 - newRatio);
    
    if (leftWidth >= minLeft && rightWidth >= minRight) {
      setRatio(newRatio);
    }
  }, [isDragging, minLeft, minRight]);

  return (
    <div 
      id="split-container"
      className="flex h-full w-full"
      onMouseMove={(e) => handleMouseMove(e.nativeEvent)}
      onMouseUp={() => setIsDragging(false)}
      onMouseLeave={() => setIsDragging(false)}
    >
      {/* Left Panel - Project Canvas */}
      <div 
        className="h-full overflow-auto bg-background"
        style={{ width: `${ratio * 100}%` }}
      >
        {left}
      </div>
      
      {/* Divider */}
      <div
        className={cn(
          "w-1 cursor-col-resize bg-border hover:bg-primary/50 transition-colors",
          isDragging && "bg-primary"
        )}
        onMouseDown={() => setIsDragging(true)}
      />
      
      {/* Right Panel - Chat */}
      <div 
        className="h-full overflow-hidden bg-muted/30"
        style={{ width: `${(1 - ratio) * 100}%` }}
      >
        {right}
      </div>
    </div>
  );
}
```

#### 6.2.2 Project Canvas with CopilotKit Integration

```tsx
// src/components/canvas/ProjectCanvas.tsx
'use client';

import { useCoAgent } from '@copilotkit/react-core';
import { useMemo, useCallback } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

import { BusinessSection } from './sections/BusinessSection';
import { CreativeSection } from './sections/CreativeSection';
import { DeliverablesSection } from './sections/DeliverablesSection';
import { QualityIndicator } from './indicators/QualityIndicator';
import { TierBadge } from './indicators/TierBadge';
import { MissingFieldsAlert } from './indicators/MissingFieldsAlert';

import type { BriefState } from '@/types/brief';

interface ProjectCanvasProps {
  projectId?: string;
}

export function ProjectCanvas({ projectId }: ProjectCanvasProps) {
  // Connect to agent state via CopilotKit
  const { state, setState } = useCoAgent<{ brief: BriefState }>({
    name: 'brief_analyzer',
    initialState: {
      brief: {
        client: null,
        agency: null,
        brand: null,
        budget: null,
        territories: [],
        media_types: [],
        mood: null,
        keywords: [],
        genres: [],
        reference_tracks: [],
        lengths: [],
        project_type: null,
        confidence_score: 0,
        extraction_status: 'pending',
        missing_information: [],
      }
    }
  });

  const brief = state.brief;

  // Handle direct edits from canvas
  const handleFieldChange = useCallback((field: keyof BriefState, value: any) => {
    setState((prev) => ({
      ...prev,
      brief: {
        ...prev.brief,
        [field]: value,
      }
    }));
  }, [setState]);

  // Calculate derived values
  const projectTier = useMemo(() => {
    if (!brief.budget_max) return null;
    if (brief.budget_max >= 100000) return 'A';
    if (brief.budget_max >= 25000) return 'B';
    return 'C';
  }, [brief.budget_max]);

  return (
    <div className="h-full flex flex-col p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-semibold">
            {brief.client || 'New Project'}
          </h1>
          {projectTier && <TierBadge tier={projectTier} />}
        </div>
        <QualityIndicator 
          score={brief.confidence_score} 
          status={brief.extraction_status}
        />
      </div>

      {/* Missing Fields Alert */}
      {brief.missing_information.length > 0 && (
        <MissingFieldsAlert fields={brief.missing_information} />
      )}

      {/* Tabs */}
      <Tabs defaultValue="brief" className="flex-1">
        <TabsList>
          <TabsTrigger value="brief">Brief</TabsTrigger>
          <TabsTrigger value="team" disabled>Team</TabsTrigger>
          <TabsTrigger value="timeline" disabled>Timeline</TabsTrigger>
          <TabsTrigger value="quality" disabled>Quality Check</TabsTrigger>
        </TabsList>

        <TabsContent value="brief" className="flex-1 overflow-auto">
          <div className="space-y-6 pb-20">
            <BusinessSection 
              data={brief}
              onChange={handleFieldChange}
            />
            <CreativeSection 
              data={brief}
              onChange={handleFieldChange}
            />
            <DeliverablesSection 
              data={brief}
              onChange={handleFieldChange}
            />
          </div>
        </TabsContent>
      </Tabs>

      {/* Action Buttons */}
      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button variant="outline">Save Draft</Button>
        <Button disabled={brief.extraction_status !== 'complete'}>
          Create Project
        </Button>
      </div>
    </div>
  );
}
```

#### 6.2.3 Chat Panel

```tsx
// src/components/chat/ChatPanel.tsx
'use client';

import { CopilotChat } from '@copilotkit/react-ui';
import { useCopilotAction } from '@copilotkit/react-core';
import '@copilotkit/react-ui/styles.css';

import { SuggestionCard } from './SuggestionCard';

export function ChatPanel() {
  // Register frontend actions that agent can trigger
  useCopilotAction({
    name: 'showSuggestion',
    description: 'Display a proactive suggestion to the user',
    parameters: [
      {
        name: 'title',
        type: 'string',
        description: 'Suggestion title',
        required: true,
      },
      {
        name: 'description',
        type: 'string',
        description: 'Suggestion description',
        required: true,
      },
      {
        name: 'action',
        type: 'string',
        description: 'Suggested action to take',
        required: false,
      },
    ],
    handler: ({ title, description, action }) => {
      // This renders in the chat as a suggestion card
      return <SuggestionCard title={title} description={description} action={action} />;
    },
  });

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b">
        <h2 className="font-semibold">Brief Assistant</h2>
        <p className="text-sm text-muted-foreground">
          Paste a brief or describe your project
        </p>
      </div>
      
      <CopilotChat
        className="flex-1"
        instructions={`You are the TF Brief Analysis Assistant. Your goal is 100% creative fulfillment.

When analyzing briefs:
1. Extract all available information into the brief state
2. Enhance vague creative descriptions into searchable terms
3. Identify missing critical information
4. Suggest alternatives and boundary-pushing ideas
5. Calculate budget-to-payout using TF margin structure

Always update the canvas state as you extract information.
Be proactive - suggest improvements and ask clarifying questions.`}
        labels={{
          title: 'Brief Assistant',
          initial: "👋 Hi! Paste a brief or tell me about your project. I'll help extract and organize all the details.",
          placeholder: 'Paste a brief or describe your project...',
        }}
      />
    </div>
  );
}
```

#### 6.2.4 Business Section with Editable Fields

```tsx
// src/components/canvas/sections/BusinessSection.tsx
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TextField } from '../fields/TextField';
import { TagsField } from '../fields/TagsField';
import { BudgetField } from '../fields/BudgetField';
import { TierBadge } from '../indicators/TierBadge';

import type { BriefState } from '@/types/brief';

interface BusinessSectionProps {
  data: BriefState;
  onChange: (field: keyof BriefState, value: any) => void;
}

export function BusinessSection({ data, onChange }: BusinessSectionProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          📊 Business Brief
          {data.project_type && (
            <TierBadge tier={data.project_type.replace('SYNCH_', '')} />
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-4">
        <TextField
          label="Client"
          value={data.client}
          onChange={(v) => onChange('client', v)}
          placeholder="Client name"
          required
        />
        <TextField
          label="Brief Sender"
          value={data.brief_sender}
          onChange={(v) => onChange('brief_sender', v)}
          placeholder="Contact person"
        />
        <TextField
          label="Agency"
          value={data.agency}
          onChange={(v) => onChange('agency', v)}
          placeholder="Agency name"
        />
        <TextField
          label="Brand"
          value={data.brand}
          onChange={(v) => onChange('brand', v)}
          placeholder="Brand name"
          required
        />
        
        <BudgetField
          value={data.budget}
          min={data.budget_min}
          max={data.budget_max}
          payout={data.calculated_payout}
          margin={data.margin_percentage}
          onChange={(budget, min, max) => {
            onChange('budget', budget);
            onChange('budget_min', min);
            onChange('budget_max', max);
          }}
        />
        
        <TextField
          label="Term"
          value={data.term}
          onChange={(v) => onChange('term', v)}
          placeholder="e.g., 1 year, perpetual"
        />
        
        <TagsField
          label="Territories"
          value={data.territories}
          onChange={(v) => onChange('territories', v)}
          placeholder="Add territory..."
          suggestions={['Germany', 'DACH', 'Europe', 'Global', 'US', 'UK']}
          className="col-span-2"
        />
        
        <TagsField
          label="Media Types"
          value={data.media_types}
          onChange={(v) => onChange('media_types', v)}
          placeholder="Add media..."
          suggestions={['TV', 'Online', 'Cinema', 'Social', 'Radio', 'OOH']}
          className="col-span-2"
        />
        
        <TagsField
          label="Lengths"
          value={data.lengths}
          onChange={(v) => onChange('lengths', v)}
          placeholder="Add length..."
          suggestions={['15s', '30s', '45s', '60s', '90s', '120s']}
        />
        
        <TagsField
          label="Cutdowns/Extras"
          value={data.cutdowns}
          onChange={(v) => onChange('cutdowns', v)}
          placeholder="Add extras..."
          suggestions={['Social cutdowns', 'BTS', 'Teaser', 'PR', 'Reel']}
        />
      </CardContent>
    </Card>
  );
}
```

### 6.3 CopilotKit Provider Setup

```tsx
// src/app/layout.tsx
import { CopilotKit } from '@copilotkit/react-core';
import { CopilotSidebar } from '@copilotkit/react-ui';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <CopilotKit 
          runtimeUrl="/api/copilotkit"
          agent="brief_analyzer"
        >
          {children}
        </CopilotKit>
      </body>
    </html>
  );
}
```

```tsx
// src/app/api/copilotkit/route.ts
import { NextRequest } from 'next/server';
import { CopilotRuntime, LangGraphAdapter } from '@copilotkit/runtime';

const runtime = new CopilotRuntime({
  remoteEndpoints: [
    {
      url: process.env.AGENT_URL || 'http://localhost:8000/api/copilot',
    },
  ],
});

export async function POST(req: NextRequest) {
  const { handleRequest } = runtime;
  return handleRequest(req);
}
```

---

## 7. Agent Architecture

### 7.1 Agent Flow Diagram

```
                              ┌─────────────────┐
                              │   User Input    │
                              │  (Brief/Chat)   │
                              └────────┬────────┘
                                       │
                                       ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│                            BRIEF ANALYSIS AGENT                               │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                               │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐   │
│  │             │    │             │    │             │    │             │   │
│  │   EXTRACT   │───►│   ENHANCE   │───►│  CLASSIFY   │───►│   SUGGEST   │   │
│  │             │    │             │    │             │    │             │   │
│  └─────────────┘    └─────────────┘    └─────────────┘    └──────┬──────┘   │
│                                                                   │          │
│  • Parse raw text    • Expand vague     • Determine tier         │          │
│  • Identify fields     terms            • Calculate payout  ┌────┴────┐     │
│  • Extract entities  • Add searchable   • Set workflow      │  TOOLS  │     │
│  • Detect dates        keywords         • Flag missing      └────┬────┘     │
│                      • Suggest genres                            │          │
│                                                                   │          │
│                                                                   ▼          │
│                                                          ┌─────────────┐     │
│                                                          │   OUTPUT    │     │
│                                                          │ + STATE     │     │
│                                                          │ SNAPSHOT    │     │
│                                                          └─────────────┘     │
│                                                                               │
└──────────────────────────────────────────────────────────────────────────────┘
                                       │
                                       ▼
                              ┌─────────────────┐
                              │  Canvas Update  │
                              │  (Real-time)    │
                              └─────────────────┘
```

### 7.2 Agent Tools

```python
# app/agent/tools/update_brief.py
from langchain_core.tools import tool
from copilotkit.langgraph import copilotkit_emit_state
from pydantic import BaseModel, Field
from typing import Optional, List


class BriefUpdate(BaseModel):
    """Schema for brief field updates."""
    client: Optional[str] = Field(None, description="Client name")
    brand: Optional[str] = Field(None, description="Brand name")
    agency: Optional[str] = Field(None, description="Agency name")
    budget: Optional[str] = Field(None, description="Budget string")
    budget_min: Optional[float] = Field(None, description="Minimum budget")
    budget_max: Optional[float] = Field(None, description="Maximum budget")
    territories: Optional[List[str]] = Field(None, description="List of territories")
    media_types: Optional[List[str]] = Field(None, description="List of media types")
    mood: Optional[str] = Field(None, description="Creative mood/feel")
    keywords: Optional[List[str]] = Field(None, description="Search keywords")
    genres: Optional[List[str]] = Field(None, description="Music genres")
    lengths: Optional[List[str]] = Field(None, description="Required lengths")
    submission_deadline: Optional[str] = Field(None, description="Deadline (YYYY-MM-DD)")


@tool
async def update_brief(
    updates: BriefUpdate,
    state: dict,
) -> str:
    """
    Update brief fields in the shared state.
    
    Use this tool to update specific fields in the brief as you extract
    information from user messages. Each update will sync to the canvas
    in real-time.
    
    Args:
        updates: The fields to update with their new values
        state: Current agent state (injected)
    
    Returns:
        Confirmation of which fields were updated
    """
    updated_fields = []
    brief = state.get("brief", {})
    
    for field, value in updates.dict(exclude_none=True).items():
        if value is not None:
            brief[field] = value
            updated_fields.append(field)
    
    # Emit state update to frontend
    await copilotkit_emit_state({
        "brief": brief
    })
    
    return f"Updated fields: {', '.join(updated_fields)}"
```

```python
# app/agent/tools/calculate.py
from langchain_core.tools import tool
from typing import Tuple


MARGIN_TIERS = [
    (1500, 1.00, "Library Blanket"),
    (30000, 0.50, "Standard"),
    (100000, 0.75, "Premium"),
    (250000, 0.80, "High-Value"),
    (500000, 0.85, "Enterprise"),
    (float('inf'), 0.90, "Custom"),
]


@tool
def calculate_payout(budget: float, currency: str = "EUR") -> dict:
    """
    Calculate the payout amount based on TF margin structure.
    
    Args:
        budget: The total budget amount
        currency: Currency code (default EUR)
    
    Returns:
        Dictionary with payout, margin percentage, and tier name
    """
    for threshold, margin_multiplier, tier_name in MARGIN_TIERS:
        if budget <= threshold:
            payout = budget * margin_multiplier
            margin_pct = (1 - margin_multiplier) * 100
            
            # Determine project type
            if budget >= 100000:
                project_type = "SYNCH_A"
            elif budget >= 25000:
                project_type = "SYNCH_B"
            else:
                project_type = "SYNCH_C"
            
            return {
                "budget": budget,
                "currency": currency,
                "payout": round(payout, 2),
                "margin_percentage": margin_pct,
                "tier_name": tier_name,
                "project_type": project_type,
            }
    
    return {"error": "Unable to calculate payout"}


@tool
def classify_project(budget: float) -> dict:
    """
    Classify a project based on budget.
    
    Args:
        budget: The total budget amount
    
    Returns:
        Project classification with workflow recommendations
    """
    if budget >= 100000:
        return {
            "type": "SYNCH_A",
            "description": "Full service with custom mailouts",
            "workflow": "Premium",
            "management_oversight": True,
            "custom_mailouts": True,
        }
    elif budget >= 25000:
        return {
            "type": "SYNCH_B",
            "description": "Playlist/request with PM collaboration",
            "workflow": "Standard",
            "management_oversight": False,
            "custom_mailouts": True,
        }
    else:
        return {
            "type": "SYNCH_C",
            "description": "Request-first, simplified workflow",
            "workflow": "Simplified",
            "management_oversight": False,
            "custom_mailouts": False,
        }
```

### 7.3 Agent Prompts

```python
# app/agent/prompts/brief_analyzer.py

SYSTEM_PROMPT = """You are the TF Brief Analysis Assistant, an elite internal tool for Tracks & Fields (TF) staff to analyze music licensing briefs.

## Your Core Mission
1. **Extract** all available information from briefs (even poorly written ones)
2. **Structure** information into comprehensive brief categories
3. **Enhance** vague creative descriptions into powerful, searchable terms
4. **Identify** missing critical information with priority levels
5. **Push boundaries** - identify opportunities beyond what's explicitly requested
6. **Ensure 100% Creative Fulfillment** - excellence is non-negotiable

## Project Classifications & Margin Structure

### Budget Thresholds
- **SYNCH_A**: Above €100,000 (Full service with custom mailouts, management oversight)
- **SYNCH_B**: €25,000-€100,000 (Playlist/request with PM collaboration)
- **SYNCH_C**: Below €25,000 (Request-first, simplified workflow)

### TF Margin Structure (for Payout Calculations)
- €0-€1,500: 100% margin (Library Blanket Deals)
- €1,500-€30,000: 50% margin
- €30,000-€100,000: 25% margin
- €100,000-€250,000: 20% margin
- Above €500,000: 10% margin

## How You Work

When a user shares a brief or discusses a project:

1. **Extract immediately** - As you identify information, use the update_brief tool to update the canvas in real-time
2. **Enhance vague terms** - Transform single words into comprehensive search terms:
   - "Modern" → contemporary, current, fresh, innovative, cutting-edge
   - "Emotional" → uplifting, melancholic, nostalgic, bittersweet, cathartic
   - "Upbeat" → energetic, positive, driving, optimistic, feel-good, anthemic
3. **Calculate automatically** - When budget is mentioned, immediately calculate payout and classify the project
4. **Be proactive** - Suggest missing information, ask clarifying questions, propose alternatives
5. **Sync continuously** - Every extraction should update the canvas state

## Interaction Style

- Be conversational and helpful
- Update the canvas as you go (don't wait for complete extraction)
- Highlight critical missing information
- Suggest boundary-pushing ideas beyond the brief
- Never settle for 90% when 100% is the standard

## Tools Available

- `update_brief`: Update specific brief fields (syncs to canvas in real-time)
- `calculate_payout`: Calculate payout from budget using margin structure
- `classify_project`: Determine project type (A/B/C) based on budget

Always use these tools as you extract information - don't just describe what you found, actually update the state!
"""

EXTRACTION_PROMPT = """Analyze the following brief and extract all available information.

Brief Content:
{brief_content}

Current State:
{current_state}

Instructions:
1. Identify all extractable fields from the brief
2. For each field found, use update_brief to update the canvas
3. Enhance any vague creative terms with searchable alternatives
4. Calculate payout if budget is mentioned
5. List critical missing information that should be requested
6. Suggest any boundary-pushing opportunities

Remember: Update the canvas state as you extract - don't just list findings!
"""
```

---

## 8. Real-Time State Management

### 8.1 State Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           STATE MANAGEMENT LAYERS                            │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                    Layer 1: CopilotKit Agent State                     │  │
│  │                         (useCoAgent hook)                              │  │
│  │                                                                        │  │
│  │  • Brief extraction data                                               │  │
│  │  • Real-time sync with agent                                          │  │
│  │  • Bidirectional updates (chat ↔ canvas)                              │  │
│  │  • STATE_SNAPSHOT events                                              │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                    │                                         │
│                                    ▼                                         │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                    Layer 2: Local UI State                             │  │
│  │                    (Zustand / React State)                             │  │
│  │                                                                        │  │
│  │  • Form validation state                                               │  │
│  │  • UI preferences (tab selection, panel sizes)                        │  │
│  │  • Optimistic updates before sync                                     │  │
│  │  • Debounced persistence                                              │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                    │                                         │
│                                    ▼                                         │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                    Layer 3: Persistent Storage                         │  │
│  │                    (Supabase PostgreSQL)                               │  │
│  │                                                                        │  │
│  │  • Versioned brief history                                            │  │
│  │  • Project metadata                                                   │  │
│  │  • Activity logs                                                      │  │
│  │  • Team assignments                                                   │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                    │                                         │
│                                    ▼                                         │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                    Layer 4: Real-time Subscriptions                    │  │
│  │                    (Supabase Realtime)                                 │  │
│  │                                                                        │  │
│  │  • Multi-user sync (future)                                           │  │
│  │  • External updates (Slack bot changes)                               │  │
│  │  • Activity feed updates                                              │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 8.2 Zustand Store

```typescript
// src/store/index.ts
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

import type { BriefState } from '@/types/brief';

interface UIState {
  activeTab: 'brief' | 'team' | 'timeline' | 'quality';
  panelRatio: number;
  isChatExpanded: boolean;
}

interface ProjectStore {
  // Brief state (synced with agent)
  brief: BriefState;
  setBrief: (brief: Partial<BriefState>) => void;
  updateField: <K extends keyof BriefState>(field: K, value: BriefState[K]) => void;
  
  // Project metadata
  projectId: string | null;
  projectStatus: string;
  setProject: (id: string, status: string) => void;
  
  // UI state
  ui: UIState;
  setActiveTab: (tab: UIState['activeTab']) => void;
  setPanelRatio: (ratio: number) => void;
  
  // Sync state
  isDirty: boolean;
  lastSynced: Date | null;
  markDirty: () => void;
  markSynced: () => void;
  
  // Actions
  reset: () => void;
}

const initialBrief: BriefState = {
  client: null,
  agency: null,
  brand: null,
  brief_sender: null,
  budget: null,
  budget_min: null,
  budget_max: null,
  territories: [],
  media_types: [],
  term: null,
  lengths: [],
  mood: null,
  keywords: [],
  genres: [],
  reference_tracks: [],
  instruments: [],
  enhanced_keywords: [],
  project_type: null,
  calculated_payout: null,
  margin_percentage: null,
  submission_deadline: null,
  ppm_date: null,
  shoot_date: null,
  air_date: null,
  confidence_score: 0,
  extraction_status: 'pending',
  missing_information: [],
};

export const useProjectStore = create<ProjectStore>()(
  devtools(
    persist(
      immer((set) => ({
        brief: initialBrief,
        
        setBrief: (updates) => set((state) => {
          Object.assign(state.brief, updates);
          state.isDirty = true;
        }),
        
        updateField: (field, value) => set((state) => {
          state.brief[field] = value;
          state.isDirty = true;
        }),
        
        projectId: null,
        projectStatus: 'draft',
        setProject: (id, status) => set((state) => {
          state.projectId = id;
          state.projectStatus = status;
        }),
        
        ui: {
          activeTab: 'brief',
          panelRatio: 0.6,
          isChatExpanded: true,
        },
        
        setActiveTab: (tab) => set((state) => {
          state.ui.activeTab = tab;
        }),
        
        setPanelRatio: (ratio) => set((state) => {
          state.ui.panelRatio = ratio;
        }),
        
        isDirty: false,
        lastSynced: null,
        
        markDirty: () => set((state) => {
          state.isDirty = true;
        }),
        
        markSynced: () => set((state) => {
          state.isDirty = false;
          state.lastSynced = new Date();
        }),
        
        reset: () => set((state) => {
          state.brief = initialBrief;
          state.projectId = null;
          state.projectStatus = 'draft';
          state.isDirty = false;
        }),
      })),
      {
        name: 'tf-project-store',
        partialize: (state) => ({ ui: state.ui }), // Only persist UI state
      }
    )
  )
);
```

### 8.3 Supabase Real-time Hook

```typescript
// src/hooks/useRealtime.ts
import { useEffect, useCallback } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useProjectStore } from '@/store';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export function useRealtimeSync(projectId: string | null) {
  const { setBrief, markSynced } = useProjectStore();
  
  useEffect(() => {
    if (!projectId) return;
    
    // Subscribe to brief changes
    const channel = supabase
      .channel(`project:${projectId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'tf_briefs',
          filter: `project_id=eq.${projectId}`,
        },
        (payload) => {
          // Only apply if from external source (Slack, API)
          if (payload.new.source !== 'canvas') {
            setBrief(payload.new.analysis);
            markSynced();
          }
        }
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, [projectId, setBrief, markSynced]);
  
  // Debounced save to Supabase
  const saveToSupabase = useCallback(
    async (brief: BriefState) => {
      if (!projectId) return;
      
      await supabase
        .from('tf_briefs')
        .update({
          analysis: brief,
          source: 'canvas',
          updated_at: new Date().toISOString(),
        })
        .eq('project_id', projectId)
        .order('version', { ascending: false })
        .limit(1);
      
      markSynced();
    },
    [projectId, markSynced]
  );
  
  return { saveToSupabase };
}
```

---

## 9. Integration Points

### 9.1 n8n Webhook Integration

The existing n8n workflows will be triggered via webhooks:

```typescript
// src/lib/integrations/n8n.ts

const N8N_BASE_URL = process.env.N8N_WEBHOOK_URL;

export const n8nWebhooks = {
  // Trigger Slack channel creation and notification
  notifySlack: async (project: Project, brief: Brief) => {
    const response = await fetch(`${N8N_BASE_URL}/webhook/tf-brief-intake-v5`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        project_id: project.id,
        catchy_id: project.catchy_id,
        title: project.title,
        client: brief.client,
        brand: brief.brand,
        budget: brief.budget,
        analysis: brief.analysis,
        source: 'project_builder',
      }),
    });
    return response.json();
  },
  
  // Trigger Nextcloud folder creation and file sync
  syncFiles: async (projectId: string, briefVersion: number) => {
    const response = await fetch(`${N8N_BASE_URL}/webhook/sync-brief-to-nextcloud`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        project_id: projectId,
        version: briefVersion,
      }),
    });
    return response.json();
  },
  
  // Notify about brief updates
  notifyUpdate: async (projectId: string, changes: Record<string, any>, source: string) => {
    const response = await fetch(`${N8N_BASE_URL}/webhook/update-brief-openwebui`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        project_id: projectId,
        changes,
        source,
      }),
    });
    return response.json();
  },
};
```

### 9.2 Integration Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        TF PROJECT BUILDER APP                                │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   User creates/updates project in canvas + chat                             │
│                           │                                                  │
│                           ▼                                                  │
│   ┌─────────────────────────────────────────────────────────────────┐       │
│   │                    FastAPI Backend                               │       │
│   │                                                                  │       │
│   │   POST /api/v1/projects                                         │       │
│   │   → Create project in Supabase                                   │       │
│   │   → Return project_id                                            │       │
│   │                                                                  │       │
│   │   POST /api/v1/projects/{id}/briefs/confirm                      │       │
│   │   → Save confirmed brief                                         │       │
│   │   → Trigger n8n webhooks                                         │       │
│   └──────────────────────────────┬──────────────────────────────────┘       │
│                                  │                                           │
└──────────────────────────────────┼───────────────────────────────────────────┘
                                   │
                                   ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           n8n WORKFLOWS                                      │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   TF_brief_to_project_v5 (rXuPgSxcLjmsbpIe)                                │
│   ┌─────────────────────────────────────────────────────────────────┐       │
│   │  Webhook → Create Slack Channel → Post Brief Summary            │       │
│   │         → Create Nextcloud Folder → Upload Brief.md             │       │
│   │         → Log Activity                                          │       │
│   └─────────────────────────────────────────────────────────────────┘       │
│                                                                              │
│   Sync Brief to Nextcloud (xpnOcoHAwqtpm6d7)                                │
│   ┌─────────────────────────────────────────────────────────────────┐       │
│   │  Webhook → Get Latest Brief → Render Markdown                   │       │
│   │         → Version Management → Upload to Nextcloud              │       │
│   └─────────────────────────────────────────────────────────────────┘       │
│                                                                              │
│   SlackBot (rg3gklwz5xhghUsA)                                               │
│   ┌─────────────────────────────────────────────────────────────────┐       │
│   │  @mention → Parse Intent → Update Brief → Notify                │       │
│   │                                    │                            │       │
│   └────────────────────────────────────┼────────────────────────────┘       │
│                                        │                                     │
│                                        ▼                                     │
│                            Supabase Real-time                               │
│                                        │                                     │
│                                        ▼                                     │
│                            Project Builder updates                           │
│                            (via useRealtime hook)                           │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 10. Security & Authentication

### 10.1 Authentication Flow

```
┌──────────────────┐     ┌──────────────────┐     ┌──────────────────┐
│                  │     │                  │     │                  │
│   TF Staff       │────►│   Supabase       │────►│   Project        │
│   Login          │     │   Auth           │     │   Builder        │
│                  │     │                  │     │                  │
└──────────────────┘     └──────────────────┘     └──────────────────┘
         │                        │                        │
         │                        ▼                        │
         │               ┌──────────────────┐              │
         │               │   JWT Token      │              │
         │               │   (Access +      │              │
         │               │    Refresh)      │              │
         │               └──────────────────┘              │
         │                        │                        │
         │                        ▼                        │
         │               ┌──────────────────┐              │
         └──────────────►│   Row Level      │◄─────────────┘
                         │   Security       │
                         │   (RLS)          │
                         └──────────────────┘
```

### 10.2 Security Measures

```typescript
// Environment Variables (never commit)
// .env.local
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...  # Server-side only
OPENAI_API_KEY=sk-...              # Server-side only
N8N_WEBHOOK_SECRET=xxx             # Webhook validation
```

**Security Checklist:**
- [ ] All API routes require authentication
- [ ] Row Level Security enabled on all tables
- [ ] Service role key only used server-side
- [ ] Webhook requests validated with shared secret
- [ ] CORS configured for production domain only
- [ ] Rate limiting on API endpoints
- [ ] Input sanitization on all user inputs
- [ ] Audit logging for sensitive operations

---

## 11. Deployment Architecture

### 11.1 Self-Hosted Deployment

```yaml
# docker-compose.yml
version: '3.8'

services:
  # Frontend (Next.js)
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_SUPABASE_URL=${SUPABASE_URL}
      - NEXT_PUBLIC_SUPABASE_ANON_KEY=${SUPABASE_ANON_KEY}
      - AGENT_URL=http://backend:8000/api/copilot
    depends_on:
      - backend
    restart: unless-stopped

  # Backend (FastAPI + LangGraph)
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    ports:
      - "8000:8000"
    environment:
      - SUPABASE_URL=${SUPABASE_URL}
      - SUPABASE_SERVICE_KEY=${SUPABASE_SERVICE_KEY}
      - LLM_API_URL=${LLM_API_URL}
      - LLM_API_KEY=${LLM_API_KEY}
    restart: unless-stopped

  # LLM Server (gpt-oss-20b via vLLM) - Optional if using OpenRouter
  llm:
    image: vllm/vllm-openai:latest
    ports:
      - "8080:8000"
    volumes:
      - ./models:/models
    command: >
      --model openai/gpt-oss-20b
      --tensor-parallel-size 1
      --max-model-len 8192
    deploy:
      resources:
        reservations:
          devices:
            - driver: nvidia
              count: 1
              capabilities: [gpu]
    restart: unless-stopped

  # Reverse Proxy
  caddy:
    image: caddy:2
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./Caddyfile:/etc/caddy/Caddyfile
      - caddy_data:/data
    depends_on:
      - frontend
      - backend
    restart: unless-stopped

volumes:
  caddy_data:
```

### 11.2 Caddyfile

```
# Caddyfile
tf-builder.tracksandfields.com {
    # Frontend
    handle /* {
        reverse_proxy frontend:3000
    }
    
    # Backend API
    handle /api/* {
        reverse_proxy backend:8000
    }
    
    # LLM API (optional, for direct access)
    handle /llm/* {
        reverse_proxy llm:8000
    }
}
```

### 11.3 Production Checklist

- [ ] SSL certificates configured (auto with Caddy)
- [ ] Environment variables secured
- [ ] Database backups configured
- [ ] Logging and monitoring setup
- [ ] Health check endpoints implemented
- [ ] Rate limiting configured
- [ ] Error tracking (e.g., Sentry) integrated
- [ ] Performance monitoring enabled

---

## 12. Implementation Phases

### Phase 1: Foundation (Weeks 1-2)
**Goal:** Basic infrastructure and core chat + canvas functionality

| Task | Priority | Estimate |
|------|----------|----------|
| Set up Next.js project with TypeScript | P0 | 2h |
| Configure Tailwind + shadcn/ui | P0 | 2h |
| Implement split-pane layout | P0 | 4h |
| Set up FastAPI backend structure | P0 | 4h |
| Configure Supabase connection | P0 | 2h |
| Create database schema (migration) | P0 | 4h |
| Implement basic CopilotKit integration | P0 | 8h |
| Build basic canvas form (business section) | P1 | 8h |
| Create basic chat interface | P1 | 4h |
| **Total** | | **38h** |

**Deliverable:** Working split-pane UI with basic chat and form that sync

### Phase 2: Brief Extraction Agent (Weeks 3-4)
**Goal:** Full brief analysis agent with real-time canvas updates

| Task | Priority | Estimate |
|------|----------|----------|
| Implement LangGraph agent structure | P0 | 8h |
| Create extraction node (parse briefs) | P0 | 8h |
| Create enhancement node (expand terms) | P0 | 6h |
| Create classification node (tier + payout) | P0 | 4h |
| Implement agent tools (update_brief, calculate) | P0 | 6h |
| Build all canvas sections (creative, dates, etc.) | P0 | 12h |
| Implement useCoAgent state sync | P0 | 6h |
| Add field validation with Zod | P1 | 4h |
| Create quality indicators (confidence, missing) | P1 | 4h |
| Test with sample briefs | P1 | 6h |
| **Total** | | **64h** |

**Deliverable:** Fully functional brief extraction with real-time canvas updates

### Phase 3: Persistence & Integration (Weeks 5-6)
**Goal:** Save projects, integrate with existing n8n workflows

| Task | Priority | Estimate |
|------|----------|----------|
| Implement project CRUD endpoints | P0 | 6h |
| Build project save/create flow | P0 | 4h |
| Implement brief versioning | P0 | 4h |
| Add activity logging | P0 | 4h |
| Integrate n8n webhooks (Slack, Nextcloud) | P0 | 8h |
| Implement Supabase real-time sync | P1 | 6h |
| Add HITL confirmation flow | P1 | 4h |
| Build projects list page | P1 | 4h |
| Implement project detail/edit page | P1 | 4h |
| **Total** | | **44h** |

**Deliverable:** Complete project lifecycle with Slack + Nextcloud integration

### Phase 4: Polish & Production (Weeks 7-8)
**Goal:** Production-ready deployment

| Task | Priority | Estimate |
|------|----------|----------|
| Add authentication (Supabase Auth) | P0 | 6h |
| Implement Row Level Security | P0 | 4h |
| Docker containerization | P0 | 4h |
| Production deployment setup | P0 | 6h |
| Error handling & logging | P1 | 4h |
| Performance optimization | P1 | 4h |
| Documentation | P1 | 4h |
| User acceptance testing | P1 | 8h |
| Bug fixes & refinements | P1 | 8h |
| **Total** | | **48h** |

**Deliverable:** Production deployment on TF servers

### Phase 5: Future Enhancements (Post-Launch)
- Team assignment tab
- Timeline/milestones tab
- Quality check workflow
- Strategy phase integration
- Multi-project dashboard
- Advanced analytics

---

## 13. Testing Strategy

### 13.1 Test Categories

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                            TESTING PYRAMID                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│                           ┌─────────┐                                        │
│                           │   E2E   │  Playwright                            │
│                           │  Tests  │  • Full user flows                     │
│                           └────┬────┘  • Brief → Project                     │
│                                │                                             │
│                       ┌────────┴────────┐                                    │
│                       │   Integration   │  Pytest + Jest                     │
│                       │     Tests       │  • API endpoints                   │
│                       └────────┬────────┘  • Agent tools                     │
│                                │          • Database operations              │
│               ┌────────────────┴────────────────┐                            │
│               │         Unit Tests              │  Pytest + Jest + RTL       │
│               │                                 │  • Components               │
│               │                                 │  • Hooks                    │
│               │                                 │  • Utilities                │
│               └─────────────────────────────────┘  • Agent nodes              │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 13.2 Sample Test Cases

```python
# tests/test_agent/test_extraction.py
import pytest
from app.agent.nodes.extract import extract_node

SAMPLE_BRIEFS = [
    {
        "name": "Mercedes Brief",
        "content": """Got this from John at BBH: Mercedes campaign, $150k budget, 
                     uplifting orchestral like Hans Zimmer's Time, global rights 2 years, 
                     TV and online, 30s + 60s + social cutdowns""",
        "expected": {
            "client": "Mercedes",
            "agency": "BBH",
            "brief_sender": "John",
            "budget_min": 150000,
            "project_type": "SYNCH_A",
            "territories": ["Global"],
            "media_types": ["TV", "Online"],
            "lengths": ["30s", "60s"],
        }
    },
    {
        "name": "Minimal Brief",
        "content": "Need something upbeat for German TV next week",
        "expected": {
            "territories": ["Germany"],
            "media_types": ["TV"],
            "mood": "upbeat",
            "extraction_status": "partial",
        }
    },
]


@pytest.mark.parametrize("brief", SAMPLE_BRIEFS, ids=lambda b: b["name"])
async def test_brief_extraction(brief):
    """Test that briefs are correctly extracted."""
    state = {"messages": [], "brief": {}}
    state["messages"].append({"role": "user", "content": brief["content"]})
    
    result = await extract_node(state)
    
    for field, expected_value in brief["expected"].items():
        assert result["brief"].get(field) == expected_value, \
            f"Field {field}: expected {expected_value}, got {result['brief'].get(field)}"


async def test_budget_classification():
    """Test project tier classification based on budget."""
    from app.agent.tools.calculate import classify_project
    
    assert classify_project(150000)["type"] == "SYNCH_A"
    assert classify_project(50000)["type"] == "SYNCH_B"
    assert classify_project(10000)["type"] == "SYNCH_C"


async def test_payout_calculation():
    """Test payout calculation with margin structure."""
    from app.agent.tools.calculate import calculate_payout
    
    # €1,500 or less = 100% margin (payout = budget)
    result = calculate_payout(1000)
    assert result["payout"] == 1000
    assert result["margin_percentage"] == 0
    
    # €30k = 50% margin
    result = calculate_payout(30000)
    assert result["payout"] == 15000
    assert result["margin_percentage"] == 50
    
    # €100k = 25% margin
    result = calculate_payout(100000)
    assert result["payout"] == 75000
    assert result["margin_percentage"] == 25
```

```typescript
// frontend/__tests__/components/canvas/BusinessSection.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { BusinessSection } from '@/components/canvas/sections/BusinessSection';

describe('BusinessSection', () => {
  const mockOnChange = jest.fn();
  const defaultData = {
    client: null,
    agency: null,
    brand: null,
    budget: null,
    territories: [],
    media_types: [],
  };

  beforeEach(() => {
    mockOnChange.mockClear();
  });

  it('renders all business fields', () => {
    render(<BusinessSection data={defaultData} onChange={mockOnChange} />);
    
    expect(screen.getByLabelText('Client')).toBeInTheDocument();
    expect(screen.getByLabelText('Agency')).toBeInTheDocument();
    expect(screen.getByLabelText('Brand')).toBeInTheDocument();
    expect(screen.getByLabelText('Budget')).toBeInTheDocument();
  });

  it('calls onChange when client field is edited', () => {
    render(<BusinessSection data={defaultData} onChange={mockOnChange} />);
    
    const clientInput = screen.getByLabelText('Client');
    fireEvent.change(clientInput, { target: { value: 'BMW' } });
    
    expect(mockOnChange).toHaveBeenCalledWith('client', 'BMW');
  });

  it('displays tier badge when project_type is set', () => {
    const dataWithTier = { ...defaultData, project_type: 'SYNCH_A' };
    render(<BusinessSection data={dataWithTier} onChange={mockOnChange} />);
    
    expect(screen.getByText('A')).toBeInTheDocument();
  });
});
```

---

## Appendices

### A. Sample Brief Documents

Located in `/mnt/project/`:
- `240814_AS_ALDISTORIES_MUSIKBRIEF__us_c.pdf`
- `Briefing_MercedesBenz_4MATIC__CONFIDENTIAL.pdf`
- `HeyCar.pdf`
- `Christmas_Music_Briefing_Voucher_antoni.pdf`

### B. Reference Documentation

- CopilotKit Docs: https://docs.copilotkit.ai/
- AG-UI Protocol: https://docs.copilotkit.ai/langgraph/
- LangGraph Docs: https://langchain-ai.github.io/langgraph/
- gpt-oss-20b: https://platform.openai.com/docs/models/gpt-oss-20b
- Supabase Realtime: https://supabase.com/docs/guides/realtime

### C. Existing Workflow IDs

| Workflow | ID | Purpose |
|----------|-----|---------|
| TF_brief_to_project_v5 | rXuPgSxcLjmsbpIe | Main project creation |
| Update Brief from OpenWebUI | 6c4UWPOhua0t3DdE | Brief updates |
| SlackBot | rg3gklwz5xhghUsA | Slack @mentions |
| SlackBot - Get Brief Info | 9SfAEtstGa2JZr7L | Brief info display |
| Sync Brief to Nextcloud | xpnOcoHAwqtpm6d7 | File versioning |

### D. Glossary

| Term | Definition |
|------|------------|
| SYNCH_A | Premium project tier (>€100k), full service |
| SYNCH_B | Standard project tier (€25k-€100k) |
| SYNCH_C | Simplified project tier (<€25k) |
| HITL | Human-in-the-loop review |
| AG-UI | Agent-User Interaction Protocol |
| Payout | Budget minus TF margin |
| Catchy ID | Human-readable project ID (e.g., TF-00147-bmw-energetic) |

---

**Document Control**

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-01-13 | Claude | Initial specification |

---

*This specification is a living document and will be updated as the project evolves.*
