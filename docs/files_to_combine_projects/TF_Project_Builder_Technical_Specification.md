# TF Project Builder - Technical Specification

## Document Information
- **Version**: 1.0
- **Created**: January 2025
- **Purpose**: Complete technical specification for Design OS + Autocoder implementation

---

## 1. Executive Summary

### 1.1 Project Vision
Build a purpose-built application for Tracks & Fields (TF) that enables music supervisors to analyze client briefs through an AI-powered chat interface while simultaneously building structured project data in a side-by-side canvas view.

### 1.2 Core Value Proposition
Replace the current OpenWebUI → webhook → Slack flow with a unified interface that provides:
- Real-time brief analysis with conversational AI
- Bidirectional sync between chat and project canvas
- Automated project classification (A/B/C types)
- Budget-to-payout margin calculations
- Integration with existing n8n workflows

### 1.3 Success Metrics
| Metric | Target |
|--------|--------|
| Brief extraction accuracy | >95% |
| Time from brief to structured data | <5 minutes |
| Project classification accuracy | 100% |
| User adoption rate | 90% of eligible projects |

---

## 2. Technical Architecture

### 2.1 Stack Overview

```
┌─────────────────────────────────────────────────────────────┐
│                      FRONTEND                                │
│  Next.js 14+ (App Router) + CopilotKit + Zustand            │
│  shadcn/ui + Tailwind CSS                                   │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      BACKEND                                 │
│  FastAPI + LangGraph Agent Orchestration                    │
│  gpt-oss-20b (Apache 2.0, self-hostable)                   │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    DATA LAYER                                │
│  Supabase PostgreSQL + Realtime Subscriptions               │
│  Existing n8n webhooks for Slack/Nextcloud                  │
└─────────────────────────────────────────────────────────────┘
```

### 2.2 Technology Choices

| Component | Technology | Rationale |
|-----------|------------|-----------|
| Frontend Framework | Next.js 14+ | App Router, server components, proven ecosystem |
| AI Integration | CopilotKit + AG-UI | Open JSON UI for self-hosting, useCoAgent hook |
| State Management | Zustand (local) + Supabase Realtime | Simple local state + real-time sync |
| UI Components | shadcn/ui | Customizable, accessible, Tailwind-based |
| Backend API | FastAPI | Python ecosystem for LangGraph, async support |
| Agent Framework | LangGraph | Proven with TF Scout, state machine patterns |
| LLM | gpt-oss-20b | Apache 2.0 license, 16GB memory, self-hostable |
| Database | Supabase PostgreSQL | Existing infrastructure, Realtime built-in |
| File Storage | Nextcloud (existing) | Maintains current workflow |
| Notifications | Slack via n8n (existing) | Maintains current workflow |

### 2.3 Deployment Architecture

```
┌──────────────────┐     ┌──────────────────┐
│   TF Servers     │     │   External       │
│                  │     │                  │
│  ┌────────────┐  │     │  ┌────────────┐  │
│  │ Next.js    │  │     │  │ Supabase   │  │
│  │ Frontend   │◄─┼─────┼──│ (managed)  │  │
│  └────────────┘  │     │  └────────────┘  │
│        │         │     │                  │
│        ▼         │     │  ┌────────────┐  │
│  ┌────────────┐  │     │  │ n8n        │  │
│  │ FastAPI    │◄─┼─────┼──│ webhooks   │  │
│  │ + LangGraph│  │     │  └────────────┘  │
│  └────────────┘  │     │                  │
│        │         │     └──────────────────┘
│        ▼         │
│  ┌────────────┐  │
│  │ gpt-oss-20b│  │
│  │ (Ollama)   │  │
│  └────────────┘  │
└──────────────────┘
```

---

## 3. Data Models

### 3.1 Database Schema

#### tf_projects Table
```sql
CREATE TABLE tf_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_number SERIAL,
  case_title VARCHAR(255) NOT NULL,
  catchy_case_id VARCHAR(100),
  
  -- Classification
  project_type VARCHAR(20) CHECK (project_type IN ('SYNCH_A', 'SYNCH_B', 'SYNCH_C', 'PRODUCTION', 'UNKNOWN')),
  workflow_path VARCHAR(50),
  
  -- Financial
  budget_amount DECIMAL(12,2),
  budget_currency VARCHAR(3) DEFAULT 'EUR',
  payout_amount DECIMAL(12,2),
  margin_percentage DECIMAL(5,2),
  
  -- Status
  status VARCHAR(50) DEFAULT 'draft',
  brief_completeness INTEGER DEFAULT 0,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  
  -- Relationships
  brief_id UUID REFERENCES tf_briefs(id),
  slack_channel_id VARCHAR(50),
  nextcloud_folder_path TEXT
);
```

#### tf_briefs Table
```sql
CREATE TABLE tf_briefs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES tf_projects(id),
  
  -- Raw Input
  raw_brief_text TEXT,
  brief_source VARCHAR(50), -- 'email', 'chat', 'manual'
  
  -- Business Brief
  client_name VARCHAR(255),
  agency_name VARCHAR(255),
  brand_name VARCHAR(255),
  brief_sender_name VARCHAR(255),
  brief_sender_email VARCHAR(255),
  
  -- Territory & Rights
  territory JSONB, -- ["Germany", "Austria"]
  media_types JSONB, -- ["TV", "Online", "Social"]
  term_length VARCHAR(100),
  exclusivity BOOLEAN DEFAULT FALSE,
  
  -- Creative Brief
  creative_direction TEXT,
  mood_keywords JSONB,
  genre_preferences JSONB,
  reference_tracks JSONB, -- [{spotify_id, title, artist, notes}]
  lyrics_requirements TEXT,
  must_avoid TEXT,
  
  -- Technical Brief
  video_lengths JSONB, -- ["15s", "30s", "60s"]
  deliverable_formats JSONB,
  stems_required BOOLEAN DEFAULT FALSE,
  
  -- Timeline
  deadline_date DATE,
  deadline_urgency VARCHAR(20), -- 'standard', 'rush', 'urgent'
  
  -- Contextual
  campaign_context TEXT,
  target_audience TEXT,
  brand_values JSONB,
  competitor_info TEXT,
  
  -- Analysis Metadata
  completeness_score INTEGER,
  missing_critical JSONB,
  missing_important JSONB,
  ai_suggestions JSONB,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  analyzed_at TIMESTAMPTZ
);
```

#### tf_activity Table
```sql
CREATE TABLE tf_activity (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES tf_projects(id),
  
  activity_type VARCHAR(50), -- 'brief_update', 'classification', 'agent_suggestion'
  actor_type VARCHAR(20), -- 'user', 'agent', 'system'
  actor_id VARCHAR(100),
  
  field_changed VARCHAR(100),
  old_value JSONB,
  new_value JSONB,
  
  message TEXT,
  metadata JSONB,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 3.2 Margin Calculation Function

```sql
CREATE OR REPLACE FUNCTION calculate_payout(budget DECIMAL, currency VARCHAR DEFAULT 'EUR')
RETURNS TABLE(payout DECIMAL, margin_pct DECIMAL, tier VARCHAR) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    CASE 
      WHEN budget <= 1500 THEN 0::DECIMAL -- 100% margin (library deals)
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

### 3.3 Project Classification Function

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

---

## 4. Agent Architecture

### 4.1 LangGraph State Machine

```python
from typing import TypedDict, Optional, List
from langgraph.graph import StateGraph, END

class BriefAnalysisState(TypedDict):
    # Input
    raw_brief: str
    conversation_history: List[dict]
    
    # Extraction Results
    business_brief: Optional[dict]
    creative_brief: Optional[dict]
    technical_brief: Optional[dict]
    contextual_brief: Optional[dict]
    
    # Classification
    project_type: Optional[str]
    budget_analysis: Optional[dict]
    
    # Quality Metrics
    completeness_score: int
    missing_critical: List[str]
    missing_important: List[str]
    
    # Agent Suggestions
    clarification_questions: List[str]
    enhancement_suggestions: List[str]
    alternative_approaches: List[str]
    
    # Workflow Control
    current_step: str
    needs_human_input: bool
```

### 4.2 Agent Flow

```
┌─────────────┐
│   START     │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  EXTRACT    │ ─── Parse raw brief into structured categories
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  ENHANCE    │ ─── Fill gaps with AI interpretation
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  CLASSIFY   │ ─── Determine project type, calculate margins
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  SUGGEST    │ ─── Generate questions and recommendations
└──────┬──────┘
       │
       ▼
┌─────────────┐
│    END      │
└─────────────┘
```

### 4.3 Node Implementations

```python
def extract_node(state: BriefAnalysisState) -> BriefAnalysisState:
    """Extract structured data from raw brief text"""
    extraction_prompt = """
    Analyze this brief and extract information into these categories:
    
    BUSINESS: client, agency, brand, sender, budget, territory, media, term
    CREATIVE: mood, genre, references, lyrics requirements, must avoid
    TECHNICAL: lengths, formats, stems needed
    CONTEXTUAL: campaign context, target audience, brand values
    
    Brief: {raw_brief}
    """
    # LLM call with structured output
    return updated_state

def enhance_node(state: BriefAnalysisState) -> BriefAnalysisState:
    """Enhance extraction with AI interpretation of vague terms"""
    # Convert "upbeat" → specific BPM range, genre suggestions
    # Interpret brand values → musical characteristics
    return updated_state

def classify_node(state: BriefAnalysisState) -> BriefAnalysisState:
    """Classify project and calculate financial metrics"""
    budget = state.get('business_brief', {}).get('budget')
    
    if budget:
        state['project_type'] = classify_project(budget)
        payout_info = calculate_payout(budget)
        state['budget_analysis'] = {
            'budget': budget,
            'payout': payout_info['payout'],
            'margin_pct': payout_info['margin_pct'],
            'tier': payout_info['tier']
        }
    else:
        state['project_type'] = 'UNKNOWN'
        state['missing_critical'].append('budget')
    
    return state

def suggest_node(state: BriefAnalysisState) -> BriefAnalysisState:
    """Generate clarification questions and recommendations"""
    # Based on missing fields, generate targeted questions
    # Suggest alternative approaches based on budget constraints
    return updated_state
```

---

## 5. Frontend Architecture

### 5.1 Component Hierarchy

```
<App>
├── <Header />
│   ├── <ProjectSelector />
│   └── <UserMenu />
│
├── <SplitPane>
│   ├── <ProjectCanvas>              # Left panel
│   │   ├── <ProjectHeader />
│   │   ├── <ClassificationBadge />
│   │   ├── <TabNav />
│   │   │   ├── Business
│   │   │   ├── Creative
│   │   │   ├── Technical
│   │   │   └── Contextual
│   │   │
│   │   ├── <BriefSection />         # Repeatable per tab
│   │   │   ├── <FieldGroup />
│   │   │   │   ├── <EditableField />
│   │   │   │   └── <FieldConfidence />
│   │   │   └── <MissingFieldAlert />
│   │   │
│   │   └── <CanvasFooter />
│   │       ├── <CompletenessBar />
│   │       └── <ActionButtons />
│   │
│   └── <ChatPanel>                  # Right panel
│       ├── <ChatHeader />
│       ├── <MessageList />
│       │   ├── <UserMessage />
│       │   ├── <AgentMessage />
│       │   └── <SystemMessage />
│       ├── <SuggestionChips />
│       └── <ChatInput />
│
└── <Footer />
```

### 5.2 CopilotKit Integration

```typescript
// hooks/useProjectAgent.ts
import { useCoAgent } from '@copilotkit/react-core';

interface ProjectAgentState {
  brief: BriefData;
  classification: ClassificationData;
  suggestions: SuggestionData;
}

export function useProjectAgent(projectId: string) {
  const { state, setState, run } = useCoAgent<ProjectAgentState>({
    name: 'brief-analyzer',
    initialState: {
      brief: {},
      classification: null,
      suggestions: []
    }
  });

  // Bidirectional sync
  const updateField = (path: string, value: any) => {
    setState(prev => ({
      ...prev,
      brief: setNestedValue(prev.brief, path, value)
    }));
  };

  const analyzeBrief = async (rawText: string) => {
    await run('analyze', { rawBrief: rawText });
  };

  return { state, updateField, analyzeBrief };
}
```

### 5.3 State Management Layers

```
┌─────────────────────────────────────────────────────────────┐
│ Layer 1: Agent State (CopilotKit useCoAgent)                │
│ - Brief extraction results                                   │
│ - Classification data                                        │
│ - Suggestions and recommendations                            │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│ Layer 2: Local UI State (Zustand)                           │
│ - Active tab                                                 │
│ - Edit mode flags                                            │
│ - Unsaved changes                                            │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│ Layer 3: Persistent State (Supabase)                        │
│ - Project records                                            │
│ - Brief data                                                 │
│ - Activity history                                           │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│ Layer 4: Real-time Sync (Supabase Realtime)                 │
│ - Multi-user collaboration                                   │
│ - External updates (Slack bot changes)                       │
└─────────────────────────────────────────────────────────────┘
```

---

## 6. Integration Points

### 6.1 Existing n8n Webhooks

| Webhook | Purpose | Trigger |
|---------|---------|---------|
| `/webhook/tf-brief-intake-v5` | Create case + Slack channel + Nextcloud folder | Project creation |
| `/webhook/update-brief-openwebui` | Sync brief updates to database | Field changes |
| `/webhook/slack-notification` | Send notifications to Slack | Status changes |

### 6.2 New API Endpoints (FastAPI)

```python
# Agent endpoints
POST /api/agent/analyze          # Start brief analysis
POST /api/agent/chat             # Continue conversation
GET  /api/agent/state/{id}       # Get current agent state

# Project endpoints
GET  /api/projects               # List projects
POST /api/projects               # Create project
GET  /api/projects/{id}          # Get project details
PATCH /api/projects/{id}         # Update project
DELETE /api/projects/{id}        # Delete project

# Brief endpoints
GET  /api/briefs/{id}            # Get brief
PATCH /api/briefs/{id}           # Update brief fields
POST /api/briefs/{id}/analyze    # Re-analyze brief

# Utility endpoints
POST /api/calculate-payout       # Calculate payout from budget
GET  /api/classify               # Classify project type
```

---

## 7. Implementation Phases

### Phase 1: Foundation (Weeks 1-2)
- [ ] Next.js project setup with App Router
- [ ] SplitPane layout component
- [ ] Basic ProjectCanvas with static fields
- [ ] Basic ChatPanel with message display
- [ ] Supabase connection and auth

### Phase 2: Agent Integration (Weeks 3-4)
- [ ] FastAPI backend setup
- [ ] LangGraph state machine
- [ ] Brief extraction node
- [ ] CopilotKit integration
- [ ] Bidirectional state sync

### Phase 3: Full Brief System (Weeks 5-6)
- [ ] All brief categories (Business, Creative, Technical, Contextual)
- [ ] Classification logic
- [ ] Margin calculations
- [ ] Missing field detection
- [ ] Suggestion generation

### Phase 4: Production Ready (Weeks 7-8)
- [ ] n8n webhook integration
- [ ] Supabase Realtime sync
- [ ] Error handling and recovery
- [ ] Testing with real briefs
- [ ] Deployment to TF servers

---

## 8. File Structure

```
TF_workflow_v6/
├── frontend/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── projects/
│   │       ├── [id]/
│   │       │   └── page.tsx
│   │       └── new/
│   │           └── page.tsx
│   ├── components/
│   │   ├── canvas/
│   │   │   ├── ProjectCanvas.tsx
│   │   │   ├── BriefSection.tsx
│   │   │   └── EditableField.tsx
│   │   ├── chat/
│   │   │   ├── ChatPanel.tsx
│   │   │   ├── MessageList.tsx
│   │   │   └── ChatInput.tsx
│   │   └── ui/
│   │       └── (shadcn components)
│   ├── hooks/
│   │   ├── useProjectAgent.ts
│   │   └── useSupabaseRealtime.ts
│   ├── lib/
│   │   ├── supabase.ts
│   │   └── utils.ts
│   └── types/
│       └── index.ts
│
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   ├── routes/
│   │   │   ├── agent.py
│   │   │   ├── projects.py
│   │   │   └── briefs.py
│   │   ├── agents/
│   │   │   ├── brief_analyzer.py
│   │   │   └── state.py
│   │   └── services/
│   │       ├── supabase.py
│   │       └── calculations.py
│   └── requirements.txt
│
├── docs/
│   ├── product-vision.md
│   ├── data-model.md
│   └── domain-knowledge/
│
└── docker-compose.yml
```

---

## 9. Testing Strategy

### 9.1 Test Briefs

Include 5-10 test briefs with varying complexity:

| Test Case | Completeness | Challenge |
|-----------|--------------|-----------|
| Perfect Brief | 95%+ | Baseline validation |
| Minimal Brief | 30% | Missing field detection |
| Vague Brief | 50% | Enhancement logic |
| Rush Project | 70% | Timeline urgency |
| High Budget | 80% | A-type classification |
| Contradictory | 60% | Conflict resolution |

### 9.2 Expected Outputs

Each test case should have documented expected JSON output for validation.

---

## 10. Security Considerations

- All API endpoints require authentication
- Budget information is encrypted at rest
- Audit trail for all changes
- Role-based access control for project visibility
- Secure handling of client confidential information

---

## Appendix A: Brief Categories Schema

See `TF_Brief_Analysis_Agent_-_Complete_Enhanced_Prompt.md` for the full extraction schema.

## Appendix B: Margin Structure Reference

See `Budget_vs_Payout__Tabellenblatt1.csv` for complete margin tiers.

## Appendix C: Project Type Workflows

See `Client_project_types_a______TF_Wiki.pdf` for A/B/C type process flows.
