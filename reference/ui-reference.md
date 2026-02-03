# UI Reference: Canvas + Chat Side-by-Side Pattern

## Design Vision

The TF Project Builder uses a **split-pane interface** with:
- **Left Panel (60-70%)**: Project Canvas - editable structured data
- **Right Panel (30-40%)**: AI Chat - conversational brief analysis

This pattern enables **bidirectional sync** where:
- Chat analysis → Canvas fields update in real-time
- Canvas edits → Agent context updates automatically

---

## Reference Implementations

### Primary Reference
**Repository**: https://github.com/CopilotKit/canvas-with-langgraph-python

| File | Purpose |
|------|---------|
| `src/app/page.tsx` | Main split-pane layout |
| `src/components/` | Canvas card components |
| `agent/agent.py` | LangGraph backend with state sync |

### Alternative Reference  
**Repository**: https://github.com/CopilotKit/open-research-ANA

This "Research Canvas" example shows the exact interaction pattern:
- Research results populate on the left as cards
- Chat on the right with human-in-the-loop approval
- Real-time state streaming between agent and UI

### Live Demo
**URL**: https://www.copilotkit.ai/examples/canvas-research

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        Browser Window                            │
├────────────────────────────────┬────────────────────────────────┤
│                                │                                 │
│      PROJECT CANVAS            │         CHAT PANEL              │
│         (Left 65%)             │         (Right 35%)             │
│                                │                                 │
│  ┌──────────────────────────┐  │  ┌───────────────────────────┐  │
│  │ Project Header           │  │  │ Chat Header               │  │
│  │ [SYNCH_B] BMW Campaign   │  │  │ Brief Analyzer Agent      │  │
│  └──────────────────────────┘  │  └───────────────────────────┘  │
│                                │                                 │
│  ┌──────────────────────────┐  │  ┌───────────────────────────┐  │
│  │ Tab Navigation           │  │  │                           │  │
│  │ [Business][Creative]...  │  │  │  Message History          │  │
│  └──────────────────────────┘  │  │                           │  │
│                                │  │  Agent: I've extracted    │  │
│  ┌──────────────────────────┐  │  │  the following from your  │  │
│  │                          │  │  │  brief...                 │  │
│  │  Editable Fields         │  │  │                           │  │
│  │                          │  │  │  User: The budget is      │  │
│  │  Client: [BMW________]   │  │  │  actually €85,000         │  │
│  │  Territory: [Germany___] │  │  │                           │  │
│  │  Budget: [€75,000____]   │  │  │  Agent: Updated! This     │  │
│  │  ↑ Editable directly     │  │  │  classifies as SYNCH_B... │  │
│  │                          │  │  │                           │  │
│  │  Missing Fields Alert    │  │  └───────────────────────────┘  │
│  │  ⚠️ Deadline not set     │  │                                 │
│  │                          │  │  ┌───────────────────────────┐  │
│  └──────────────────────────┘  │  │ Suggestion Chips          │  │
│                                │  │ [Ask about deadline]      │  │
│  ┌──────────────────────────┐  │  │ [Clarify territory]       │  │
│  │ Completeness: ████░░ 65% │  │  └───────────────────────────┘  │
│  │ [Save Draft] [Submit]    │  │                                 │
│  └──────────────────────────┘  │  ┌───────────────────────────┐  │
│                                │  │ [Type message...    ] [→] │  │
└────────────────────────────────┴──┴───────────────────────────┴──┘
```

---

## Core Layout Code Pattern

### Main Page Structure
```tsx
// src/app/page.tsx
"use client";

import { useCoAgent, useCoAgentStateRender } from "@copilotkit/react-core";
import { CopilotChat } from "@copilotkit/react-ui";
import { ProjectCanvas } from "@/components/canvas/ProjectCanvas";
import { BriefState } from "@/types";

export default function ProjectBuilderPage() {
  // Bidirectional state sync with LangGraph agent
  const { state, setState } = useCoAgent<BriefState>({
    name: "brief_analyzer",
    initialState: {
      brief: {},
      classification: null,
      suggestions: [],
      completeness: 0
    }
  });

  // Render agent state updates in chat
  useCoAgentStateRender<BriefState>({
    name: "brief_analyzer",
    render: ({ state }) => {
      if (state.analyzing) {
        return <AnalyzingIndicator />;
      }
      return null;
    }
  });

  // Handle direct canvas edits
  const handleFieldUpdate = (field: string, value: any) => {
    setState(prev => ({
      ...prev,
      brief: { ...prev.brief, [field]: value }
    }));
  };

  return (
    <div className="h-screen flex overflow-hidden bg-gray-50">
      {/* LEFT: Project Canvas */}
      <div className="flex-1 overflow-auto border-r border-gray-200">
        <ProjectCanvas 
          state={state}
          onFieldUpdate={handleFieldUpdate}
        />
      </div>

      {/* RIGHT: Chat Panel */}
      <div className="w-[400px] flex flex-col">
        <CopilotChat
          className="flex-1"
          labels={{
            title: "Brief Analyzer",
            initial: "Paste a client brief and I'll extract the key information..."
          }}
        />
      </div>
    </div>
  );
}
```

### CopilotKit Provider Setup
```tsx
// src/app/layout.tsx
import { CopilotKit } from "@copilotkit/react-core";
import "@copilotkit/react-ui/styles.css";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <CopilotKit runtimeUrl="/api/copilotkit">
          {children}
        </CopilotKit>
      </body>
    </html>
  );
}
```

---

## State Synchronization Pattern

### Frontend → Agent (Canvas Edits)
```tsx
// When user edits a field directly in canvas
const handleFieldUpdate = (field: string, value: any) => {
  // Update local state immediately (optimistic)
  setState(prev => ({
    ...prev,
    brief: { ...prev.brief, [field]: value }
  }));
  
  // Agent automatically receives updated state via useCoAgent
  // No explicit API call needed - CopilotKit handles sync
};
```

### Agent → Frontend (Analysis Results)
```python
# agent/agent.py
from copilotkit import CopilotKitState
from langgraph.graph import StateGraph

class BriefAnalyzerState(TypedDict):
    messages: Annotated[list, add_messages]
    brief: dict
    classification: str
    completeness: int
    suggestions: list

async def analyze_node(state: BriefAnalyzerState):
    """Extract brief data and emit to frontend"""
    # LLM extraction logic here
    extracted = await extract_brief(state["messages"][-1].content)
    
    return {
        "brief": extracted,
        "classification": classify_project(extracted.get("budget")),
        "completeness": calculate_completeness(extracted),
        "suggestions": generate_suggestions(extracted)
    }
    # State automatically syncs to frontend via CopilotKit
```

---

## Component Breakdown

### ProjectCanvas Component
```tsx
// src/components/canvas/ProjectCanvas.tsx
interface ProjectCanvasProps {
  state: BriefState;
  onFieldUpdate: (field: string, value: any) => void;
}

export function ProjectCanvas({ state, onFieldUpdate }: ProjectCanvasProps) {
  const [activeTab, setActiveTab] = useState("business");

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header with classification badge */}
      <ProjectHeader 
        title={state.brief.client_name || "New Project"}
        classification={state.classification}
      />

      {/* Tab navigation */}
      <TabNav 
        active={activeTab} 
        onChange={setActiveTab}
        tabs={["business", "creative", "technical", "contextual"]}
      />

      {/* Tab content - editable sections */}
      <div className="mt-6">
        {activeTab === "business" && (
          <BusinessSection 
            data={state.brief}
            onUpdate={onFieldUpdate}
          />
        )}
        {activeTab === "creative" && (
          <CreativeSection 
            data={state.brief}
            onUpdate={onFieldUpdate}
          />
        )}
        {/* ... other tabs */}
      </div>

      {/* Footer with completeness and actions */}
      <CanvasFooter
        completeness={state.completeness}
        missingFields={state.suggestions?.filter(s => s.type === "missing")}
      />
    </div>
  );
}
```

### Editable Field Component
```tsx
// src/components/canvas/EditableField.tsx
interface EditableFieldProps {
  label: string;
  field: string;
  value: string | string[];
  type: "text" | "textarea" | "tags" | "select";
  options?: string[];
  confidence?: number;  // AI confidence in extracted value
  onUpdate: (field: string, value: any) => void;
}

export function EditableField({ 
  label, field, value, type, confidence, onUpdate 
}: EditableFieldProps) {
  return (
    <div className="mb-4">
      <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
        {label}
        {confidence && (
          <ConfidenceBadge value={confidence} />
        )}
      </label>
      
      {type === "text" && (
        <input
          type="text"
          value={value || ""}
          onChange={(e) => onUpdate(field, e.target.value)}
          className="mt-1 w-full px-3 py-2 border rounded-md"
        />
      )}
      
      {type === "tags" && (
        <TagInput
          value={value as string[]}
          onChange={(tags) => onUpdate(field, tags)}
        />
      )}
      
      {/* ... other types */}
    </div>
  );
}
```

---

## Responsive Behavior

### Desktop (>1024px)
- Side-by-side split: 65% canvas / 35% chat
- Both panels always visible

### Tablet (768px - 1024px)
- Collapsible chat panel
- Toggle button to show/hide chat
- Canvas takes full width when chat hidden

### Mobile (<768px)
- Stacked layout: Canvas on top, chat below
- Or: Tab-based switching between views

```tsx
// Responsive container
<div className="h-screen flex flex-col lg:flex-row">
  {/* Canvas - full on mobile, partial on desktop */}
  <div className="flex-1 lg:flex-[0.65] overflow-auto">
    <ProjectCanvas {...props} />
  </div>
  
  {/* Chat - bottom on mobile, right side on desktop */}
  <div className="h-[50vh] lg:h-auto lg:flex-[0.35] border-t lg:border-t-0 lg:border-l">
    <CopilotChat {...chatProps} />
  </div>
</div>
```

---

## Key CopilotKit Hooks

| Hook | Purpose |
|------|---------|
| `useCoAgent` | Bidirectional state sync with LangGraph agent |
| `useCoAgentStateRender` | Render agent state changes in chat UI |
| `useCopilotAction` | Define frontend actions agent can trigger |
| `useCopilotChatSuggestions` | Generate contextual suggestion chips |

---

## Integration with TF Requirements

### How This Pattern Maps to TF

| CopilotKit Pattern | TF Implementation |
|-------------------|-------------------|
| Canvas cards | Brief section fields (Business, Creative, etc.) |
| State sync | Brief extraction → Form population |
| Agent tools | `updateBrief`, `classifyProject`, `calculateMargin` |
| Chat suggestions | "Ask about budget", "Clarify territory" |
| Human-in-the-loop | Confirm classification, approve suggestions |

### TF-Specific Additions

1. **Classification Badge**: Show SYNCH_A/B/C with color coding
2. **Margin Calculator**: Display budget → payout in real-time
3. **Completeness Meter**: Visual progress toward "100% brief"
4. **Missing Field Alerts**: Highlight critical gaps
5. **Webhook Triggers**: Button to create Slack channel + Nextcloud folder

---

## Files to Create

Based on this pattern, create these files in order:

```
src/
├── app/
│   ├── layout.tsx          # CopilotKit provider
│   ├── page.tsx            # Main split-pane layout
│   └── api/
│       └── copilotkit/
│           └── route.ts    # Runtime endpoint
├── components/
│   ├── canvas/
│   │   ├── ProjectCanvas.tsx
│   │   ├── ProjectHeader.tsx
│   │   ├── TabNav.tsx
│   │   ├── BusinessSection.tsx
│   │   ├── CreativeSection.tsx
│   │   ├── TechnicalSection.tsx
│   │   ├── ContextualSection.tsx
│   │   ├── EditableField.tsx
│   │   ├── ConfidenceBadge.tsx
│   │   └── CanvasFooter.tsx
│   └── chat/
│       ├── SuggestionChips.tsx
│       └── AnalyzingIndicator.tsx
├── hooks/
│   └── useProjectAgent.ts  # Custom hook wrapping useCoAgent
├── types/
│   └── index.ts            # BriefState, ProjectState types
└── lib/
    └── utils.ts
```

---

## Additional Resources

- **CopilotKit Docs**: https://docs.copilotkit.ai
- **useCoAgent Reference**: https://docs.copilotkit.ai/langgraph/concepts/langgraph
- **Styling Guide**: https://docs.copilotkit.ai/custom-look-and-feel/customize-built-in-ui-components
- **LangGraph Python**: https://langchain-ai.github.io/langgraph/
