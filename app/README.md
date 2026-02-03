# TF Project Builder

AI-powered brief extraction tool for music supervisors. Transform unstructured client briefs into actionable project data through conversational AI.

## Features

- **Brief Extraction** - Paste raw client emails/documents, AI extracts 27+ structured fields
- **Project Canvas** - Editable view with 5 category tabs (WHAT/WHO/WITH WHAT/WHEN/OTHER)
- **Bidirectional Sync** - Canvas edits sync to AI context, AI extractions update canvas
- **Project Classification** - Auto-classifies projects as Type A/B/C/D/E based on budget
- **Margin Calculations** - Tiered payout calculations based on project type
- **Completeness Scoring** - Weighted 0-100% scoring with critical/important/helpful priorities
- **Integrations** - Trigger Slack channels and Nextcloud folders via n8n webhooks

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React, TypeScript, Tailwind CSS, shadcn/ui
- **AI Integration**: CopilotKit, LangGraph
- **Backend**: FastAPI (Python)
- **Database**: Supabase (PostgreSQL)
- **Automation**: n8n webhooks

## Prerequisites

- Node.js 18+ 
- Python 3.11+
- Supabase account
- Groq API key (for LLM)
- n8n instance (optional, for integrations)

## Setup

### 1. Clone the repository

```bash
git clone https://github.com/djdamie/tf-project-builder.git
cd tf-project-builder
```

### 2. Set up the Frontend (Next.js)

```bash
cd app
npm install
```

Create `app/.env.local`:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# CopilotKit - connects to Python backend
COPILOTKIT_REMOTE_ENDPOINT=http://localhost:8000
```

### 3. Set up the Backend (FastAPI)

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

Create `backend/.env`:

```env
# Groq API Key for LLM
GROQ_API_KEY=your-groq-api-key

# Model to use (Groq models)
MODEL_NAME=llama-3.3-70b-versatile

# Server port
PORT=8000

# Frontend URL (for CORS and tool callbacks)
FRONTEND_API_URL=http://localhost:3000
```

### 4. Set up Supabase

Create these tables in your Supabase project:

```sql
-- Projects table
CREATE TABLE tf_cases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_number TEXT UNIQUE,
  catchy_case_id TEXT,
  project_title TEXT,
  project_type TEXT CHECK (project_type IN ('A', 'B', 'C', 'D', 'E', 'Production')),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'on_hold', 'cancelled')),
  slack_channel_id TEXT,
  nextcloud_folder_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Briefs table
CREATE TABLE tf_briefs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID REFERENCES tf_cases(id) ON DELETE CASCADE,
  project_title TEXT,
  client TEXT,
  agency TEXT,
  brand TEXT,
  brief_sender_name TEXT,
  brief_sender_email TEXT,
  brief_sender_role TEXT,
  territory TEXT,
  media TEXT,
  term TEXT,
  exclusivity BOOLEAN,
  exclusivity_details TEXT,
  budget_min NUMERIC,
  budget_max NUMERIC,
  budget_currency TEXT DEFAULT 'EUR',
  creative_direction TEXT,
  mood TEXT,
  keywords TEXT[],
  genres TEXT[],
  reference_tracks JSONB,
  vocals_preference TEXT,
  must_avoid TEXT[],
  lengths TEXT[],
  stems_required BOOLEAN,
  sync_points TEXT,
  submission_deadline DATE,
  first_presentation_date DATE,
  air_date DATE,
  deadline_urgency TEXT,
  completion_rate INTEGER DEFAULT 0,
  extraction_status TEXT DEFAULT 'pending',
  raw_brief_text TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE tf_cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE tf_briefs ENABLE ROW LEVEL SECURITY;

-- Policies (adjust based on your auth setup)
CREATE POLICY "Allow all for authenticated users" ON tf_cases FOR ALL USING (true);
CREATE POLICY "Allow all for authenticated users" ON tf_briefs FOR ALL USING (true);
```

### 5. Run the Application

**Terminal 1 - Backend:**
```bash
cd backend
source venv/bin/activate
uvicorn main:app --reload --port 8000
```

**Terminal 2 - Frontend:**
```bash
cd app
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Usage

1. **Create a Project** - Click "New Project" from the dashboard
2. **Paste a Brief** - Copy/paste a client email or brief document into the chat
3. **Review Extractions** - Watch the AI extract fields into the canvas in real-time
4. **Edit & Refine** - Click any field to edit, changes sync back to AI context
5. **Save to Database** - Click "Save Changes" to persist to Supabase
6. **Trigger Integrations** - Create Slack channels or Nextcloud folders

## Project Structure

```
├── app/                    # Next.js frontend
│   ├── src/
│   │   ├── app/           # App Router pages
│   │   ├── components/    # React components
│   │   ├── hooks/         # Custom React hooks
│   │   ├── lib/           # Utilities (Supabase, n8n)
│   │   └── data/          # Sample data files
│   └── .env.local         # Frontend environment variables
│
├── backend/               # FastAPI backend
│   ├── agents/           # LangGraph agent definitions
│   ├── main.py           # FastAPI entry point
│   └── .env              # Backend environment variables
│
├── product/              # Product specifications
│   ├── sections/         # Feature specs
│   └── data-model/       # Entity definitions
│
└── reference/            # Business rules & sample briefs
```

## Environment Variables Reference

### Frontend (`app/.env.local`)

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key (public) |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (server-only) |
| `COPILOTKIT_REMOTE_ENDPOINT` | Backend URL (default: http://localhost:8000) |

### Backend (`backend/.env`)

| Variable | Description |
|----------|-------------|
| `GROQ_API_KEY` | Your Groq API key for LLM access |
| `MODEL_NAME` | LLM model name (default: llama-3.3-70b-versatile) |
| `PORT` | Server port (default: 8000) |
| `FRONTEND_API_URL` | Frontend URL for CORS (default: http://localhost:3000) |

## Deployment

### Vercel (Frontend)
1. Connect your GitHub repo to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy

### Railway/Render (Backend)
1. Create a new Python service
2. Set the start command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
3. Add environment variables
4. Deploy

### n8n (Integrations)
Import the workflow templates from `reference/n8n-workflows/` into your n8n instance.

## License

Private - All rights reserved.
