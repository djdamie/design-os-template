"""
Brief Analyzer Agent using LangGraph

This agent analyzes raw client briefs and extracts structured data
for the TF Project Builder.
"""

import os
import json
import httpx
from typing import TypedDict, Annotated, Any
from operator import add

from langchain_groq import ChatGroq
from langchain_core.messages import BaseMessage, HumanMessage, AIMessage, SystemMessage
from langchain_core.tools import tool
from langgraph.graph import StateGraph, END
from langgraph.graph.message import add_messages
from langgraph.checkpoint.memory import MemorySaver
from langgraph.prebuilt import ToolNode
from copilotkit import CopilotKitState

# Frontend API base URL (Next.js app)
FRONTEND_API_URL = os.getenv("FRONTEND_API_URL", "http://localhost:3000")

# Field priorities for completeness calculation
CRITICAL_FIELDS = [
    "client_name",
    "budget_amount",  # Renamed from 'budget' to match frontend
    "territory",
    "deadline_date",
]

IMPORTANT_FIELDS = [
    "project_title",
    "media_types",
    "creative_direction",
    "video_lengths",
    "brief_sender_name",
    "brief_sender_email",
]

HELPFUL_FIELDS = [
    "agency_name",
    "brand_name",
    "mood_keywords",
    "genre_preferences",
    "reference_tracks",
    "sync_points",
    "stems_required",
    "vocals_preference",
    "term_length",
    "exclusivity",
    "air_date",
]

ALL_FIELDS = CRITICAL_FIELDS + IMPORTANT_FIELDS + HELPFUL_FIELDS + [
    "budget_currency",
    "exclusivity_details",
    "must_avoid",
    "deadline_urgency",
    "first_presentation_date",
    "kickoff_date",
    "brief_sender_role",
    "campaign_context",
    "target_audience",
    "brand_values",
    "extraction_notes",
]


def resolve_project_id(state: dict[str, Any]) -> str | None:
    """Resolve project UUID from explicit state first, then Copilot thread metadata."""
    explicit = state.get("current_project_id")
    if isinstance(explicit, str) and explicit.strip():
        return explicit.strip()

    copilot_meta = state.get("copilotkit") or {}
    if isinstance(copilot_meta, dict):
        thread_id = (
            copilot_meta.get("threadId")
            or copilot_meta.get("thread_id")
            or copilot_meta.get("thread")
        )
        if isinstance(thread_id, str) and thread_id.startswith("project:"):
            candidate = thread_id.split("project:", 1)[1].strip()
            return candidate or None

    return None


# =============================================================================
# Tools for the agent
# =============================================================================

@tool
def get_project_data(project_id: str) -> str:
    """
    Fetch the current project brief data from the database.
    Use this tool when you need to answer questions about the project,
    such as budget, client, timeline, creative direction, etc.
    
    Args:
        project_id: The UUID of the project to fetch
        
    Returns:
        JSON string with the project brief data, or an error message
    """
    try:
        # Make sync request to the Next.js API
        with httpx.Client(timeout=10.0) as client:
            response = client.get(f"{FRONTEND_API_URL}/api/projects/{project_id}")
            
            if response.status_code == 404:
                return json.dumps({"error": "Project not found"})
            
            if response.status_code != 200:
                return json.dumps({"error": f"Failed to fetch project: {response.status_code}"})
            
            data = response.json()
            
            # Extract brief data from the response
            brief = data.get("tf_briefs")
            if isinstance(brief, list):
                brief = brief[0] if brief else {}
            elif brief is None:
                brief = {}
            
            # Format the relevant data for the agent
            project_info = {
                "project_id": data.get("id"),
                "case_number": data.get("case_number"),
                "project_type": data.get("project_type"),
                "status": data.get("status"),
                "project_title": brief.get("project_title") or data.get("project_title"),
                "client": brief.get("client"),
                "agency": brief.get("agency"),
                "brand": brief.get("brand"),
                "budget_amount": brief.get("budget_min"),
                "budget_currency": "EUR",  # Default
                "territory": brief.get("territory"),
                "media_types": brief.get("media"),
                "term_length": brief.get("term"),
                "exclusivity": brief.get("exclusivity"),
                "creative_direction": brief.get("mood") or brief.get("creative_direction"),
                "mood_keywords": brief.get("keywords"),
                "genre_preferences": brief.get("genres"),
                "reference_tracks": brief.get("reference_tracks"),
                "vocals_preference": brief.get("vocals_preference"),
                "video_lengths": brief.get("lengths"),
                "deadline_date": brief.get("submission_deadline"),
                "air_date": brief.get("air_date"),
                "brief_sender_name": brief.get("brief_sender_name"),
                "brief_sender_email": brief.get("brief_sender_email"),
                "completion_rate": brief.get("completion_rate"),
            }
            
            # Filter out None values for cleaner output
            project_info = {k: v for k, v in project_info.items() if v is not None}
            
            return json.dumps(project_info, indent=2)
            
    except httpx.TimeoutException:
        return json.dumps({"error": "Request timed out"})
    except Exception as e:
        return json.dumps({"error": str(e)})


# List of tools available to the agent
agent_tools = [get_project_data]


class ExtractedBrief(TypedDict, total=False):
    """Extracted brief data structure"""
    completeness: int
    project_type: str | None
    # Business
    client_name: str
    agency_name: str
    brand_name: str
    project_title: str
    budget_amount: float  # Renamed from 'budget' to match frontend
    budget_currency: str
    territory: list[str]
    media_types: list[str]
    term_length: str
    exclusivity: bool
    exclusivity_details: str
    # Creative
    creative_direction: str
    mood_keywords: list[str]
    genre_preferences: list[str]
    reference_tracks: list[dict]
    must_avoid: str
    vocals_preference: str
    # Technical
    video_lengths: list[str]
    stems_required: bool
    sync_points: str
    # Timeline
    deadline_date: str
    air_date: str
    deadline_urgency: str
    first_presentation_date: str
    kickoff_date: str
    # Who
    brief_sender_name: str
    brief_sender_email: str
    brief_sender_role: str
    # Context
    campaign_context: str
    target_audience: str
    brand_values: list[str]
    # Notes
    extraction_notes: str  # Agent observations about ambiguous/interpreted information


class SuggestionChip(TypedDict):
    """Suggestion chip for missing fields"""
    id: str
    label: str
    field: str
    priority: str  # 'critical' | 'important' | 'helpful'


class InputState(CopilotKitState):
    """Input state - what we receive from the frontend"""
    pass  # CopilotKitState includes messages


class OutputState(CopilotKitState):
    """Output state - what we send back to the frontend for state sync"""
    extracted_brief: ExtractedBrief
    completeness: int
    project_type: str | None
    suggestion_chips: list[SuggestionChip]
    field_updates: list[str]
    current_project_id: str | None


class BriefAnalyzerState(InputState, OutputState):
    """Full state for the brief analyzer agent (combines input + output)"""
    current_project_id: str | None  # Track the project being worked on


def get_llm(with_tools: bool = False):
    """Initialize the LLM with Groq, optionally with tools bound"""
    llm = ChatGroq(
        model=os.getenv("MODEL_NAME", "llama-3.3-70b-versatile"),
        api_key=os.getenv("GROQ_API_KEY"),
        temperature=0.1,
    )
    if with_tools:
        return llm.bind_tools(agent_tools)
    return llm


def calculate_completeness(brief: ExtractedBrief) -> int:
    """Calculate completeness score based on field priorities"""
    score = 0
    max_score = 0
    filled_fields = []
    missing_fields = []

    # Critical fields: 10 points each
    for field in CRITICAL_FIELDS:
        max_score += 10
        value = brief.get(field)
        # Check for meaningful values (not None, not empty string, not empty list)
        has_value = value is not None and value != "" and value != []
        if has_value:
            score += 10
            filled_fields.append(f"{field}(critical)")
        else:
            missing_fields.append(f"{field}(critical)")

    # Important fields: 5 points each
    for field in IMPORTANT_FIELDS:
        max_score += 5
        value = brief.get(field)
        has_value = value is not None and value != "" and value != []
        if has_value:
            score += 5
            filled_fields.append(f"{field}(important)")
        else:
            missing_fields.append(f"{field}(important)")

    # Helpful fields: 2 points each
    for field in HELPFUL_FIELDS:
        max_score += 2
        value = brief.get(field)
        has_value = value is not None and value != "" and value != []
        if has_value:
            score += 2
            filled_fields.append(f"{field}(helpful)")
        else:
            missing_fields.append(f"{field}(helpful)")

    completeness = int((score / max_score) * 100) if max_score > 0 else 0
    print(f"DEBUG completeness: {completeness}% (score={score}/{max_score})")
    print(f"DEBUG filled fields: {filled_fields}")
    print(f"DEBUG missing fields: {missing_fields}")

    return completeness


def classify_project_type(budget: float | None) -> str | None:
    """Classify project type based on budget"""
    if budget is None:
        return None

    if budget >= 100000:
        return "A"
    elif budget >= 25000:
        return "B"
    elif budget >= 10000:
        return "C"
    elif budget >= 2500:
        return "D"
    else:
        return "E"


def normalize_project_type(value: Any) -> str | None:
    """Normalize user-provided project type labels to canonical values."""
    if value is None:
        return None
    raw = str(value).strip()
    if not raw:
        return None

    upper = raw.upper()
    if upper in {"A", "B", "C", "D", "E"}:
        return upper
    if upper in {"PRODUCTION", "PROD"}:
        return "Production"

    return None


def generate_suggestion_chips(brief: ExtractedBrief) -> list[SuggestionChip]:
    """Generate suggestion chips for missing fields"""
    chips = []
    chip_id = 0

    # Define questions for each field
    field_questions = {
        "budget_amount": "What's the total budget for this project?",
        "territory": "What territories will this be used in?",
        "deadline_date": "When is the music needed by?",
        "client_name": "Who is the client for this project?",
        "project_title": "What should this project be called?",
        "media_types": "What media types will be used?",
        "creative_direction": "What's the creative direction or mood?",
        "video_lengths": "What are the video/spot lengths?",
        "sync_points": "Are there specific sync points in the edit?",
        "stems_required": "Do they need stems for the music?",
        "vocals_preference": "Should the music be instrumental, with vocals, or either?",
        "reference_tracks": "Are there any reference tracks?",
        "brief_sender_name": "Who sent the brief?",
        "brief_sender_email": "What's the brief sender's email?",
        "air_date": "When does the campaign air?",
    }

    # Check critical fields
    for field in CRITICAL_FIELDS:
        if not brief.get(field) and field in field_questions:
            chips.append({
                "id": f"chip_{chip_id}",
                "label": field_questions[field],
                "field": field,
                "priority": "critical",
            })
            chip_id += 1

    # Check important fields (limit to 3)
    for field in IMPORTANT_FIELDS:
        if not brief.get(field) and field in field_questions and len([c for c in chips if c["priority"] == "important"]) < 3:
            chips.append({
                "id": f"chip_{chip_id}",
                "label": field_questions[field],
                "field": field,
                "priority": "important",
            })
            chip_id += 1

    # Check helpful fields (limit to 2)
    for field in HELPFUL_FIELDS:
        if not brief.get(field) and field in field_questions and len([c for c in chips if c["priority"] == "helpful"]) < 2:
            chips.append({
                "id": f"chip_{chip_id}",
                "label": field_questions[field],
                "field": field,
                "priority": "helpful",
            })
            chip_id += 1

    return chips[:8]  # Max 8 chips


EXTRACTION_PROMPT = """You are a music licensing brief analyzer and project assistant. Your job is to:
1. Extract structured information from raw client briefs (emails, notes, documents)
2. Update specific fields when the user asks (e.g., "change the budget to X")
3. Answer questions about the current project data

**TOOLS AVAILABLE**:
You have access to the `get_project_data` tool. Use it when:
- The user asks a question about the project (budget, client, timeline, etc.)
- You need to know the current state of the project data
- The "Current extracted data" below is empty or missing information

**IMPORTANT RULES**:
- If the user is asking a question about the project and you don't have the data, USE THE TOOL to fetch it first.
- If the user is asking to change, update, or set a specific field (like "make the title X" or "change the budget to Y"), treat that as a direct update request and return that field with the new value.
- If you already have the data in "Current extracted data", you can answer directly without using the tool.

Extract the following information if present:
- project_title: A short descriptive title for this project (e.g., "BMW Electric Launch" or "Nike Summer Campaign")
- client_name: The client company name
- agency_name: The agency name (if different from client)
- brand_name: The specific brand/sub-brand
- budget_amount: The total budget as a number (extract currency value, convert to number)
- budget_currency: The currency (EUR, USD, GBP, CHF)
- territory: List of territories/countries where music will be used
- media_types: List of media types (TV, Cinema, Online, Social, Radio, etc.)
- term_length: License duration (e.g., "2 years", "12 months")
- exclusivity: Whether exclusivity is required (true/false)
- exclusivity_details: Details about exclusivity scope
- creative_direction: Description of the creative direction/mood
- mood_keywords: List of mood/emotion keywords
- genre_preferences: List of preferred genres
- reference_tracks: List of reference tracks with artist, title, and notes
- must_avoid: Things to avoid in the music
- vocals_preference: "instrumental", "vocals", "either", or "specific"
- video_lengths: List of video/spot lengths (e.g., ["60s", "30s", "15s"])
- stems_required: Whether stems are needed (true/false)
- sync_points: Description of key sync points in the edit
- deadline_date: When music is needed (ISO date if possible, e.g., "2025-12-15")
- air_date: When the campaign airs (ISO date if possible)
- deadline_urgency: "standard", "rush", or "urgent"
- first_presentation_date: Date of first client presentation
- kickoff_date: When the project starts
- brief_sender_name: Name of person who sent the brief
- brief_sender_email: Email of person who sent the brief
- brief_sender_role: Role/title of brief sender
- campaign_context: Background information about the campaign or product launch
- target_audience: Who the campaign is aimed at (demographics, psychographics)
- brand_values: List of brand attributes or values mentioned (e.g., ["innovative", "premium", "sustainable"])
- extraction_notes: Your observations about ambiguous or interpreted information. Use this to note things like:
  - "Air date was 'mid-March' - interpreted as March 15, 2026"
  - "Budget described as 'around 18k' - may need confirmation"
  - "Deadline urgency unclear - client said 'by next Wednesday'"
  - "Reference track 'cozy Sunday morning vibes' - interpreted as acoustic/indie-folk genre"

**Response Format**:
- For extractions/updates: Respond with a JSON object containing the fields you extracted/updated and a "summary" field.
- For questions about the project: Respond with a JSON object containing just a "summary" field with your helpful answer.

Current extracted data:
{current_brief}

User message:
{user_message}"""


async def extract_node(state: BriefAnalyzerState) -> dict:
    """Extract brief information from user message, using tools if needed"""
    # Use LLM with tools for answering questions about project data
    llm = get_llm(with_tools=True)

    # Debug: print state to see what's coming in
    print(f"DEBUG: State keys: {state.keys() if hasattr(state, 'keys') else 'not a dict'}")
    print(f"DEBUG: Messages: {state.get('messages', [])}")

    # Get the last user message
    messages = state.get("messages", [])
    if not messages:
        print("DEBUG: No messages in state")
        return {
            "messages": [AIMessage(content="I didn't receive any message. Please paste your brief.")],
            "current_project_id": state.get("current_project_id"),
        }

    last_message = messages[-1]
    print(f"DEBUG: Last message type: {type(last_message)}, content: {last_message}")

    # Handle different message types (HumanMessage from langchain or dict from AG-UI)
    if isinstance(last_message, HumanMessage):
        user_message = last_message.content
    elif isinstance(last_message, dict):
        user_message = last_message.get("content", "")
    elif hasattr(last_message, "content"):
        user_message = last_message.content
    else:
        print(f"DEBUG: Unknown message type: {type(last_message)}")
        return {
            "messages": [AIMessage(content="I couldn't read your message. Please try again.")],
            "current_project_id": state.get("current_project_id"),
        }

    print(f"DEBUG: User message: {user_message[:100] if user_message else 'empty'}...")
    
    # Get current brief data from state
    current_brief_dict = dict(state.get("extracted_brief") or {})
    
    # Get current project ID from state or try to extract from context
    project_id = resolve_project_id(state)
    print(f"DEBUG: Current project ID: {project_id}")
    print(f"DEBUG: Current brief has {len(current_brief_dict)} fields")
    
    current_brief = json.dumps(current_brief_dict, indent=2)
    
    # Determine if this is a question about project data (needs tool) or extraction
    is_question = any(q in user_message.lower() for q in [
        "what", "who", "when", "where", "how much", "how many", "tell me", "show me",
        "budget", "client", "agency", "deadline", "territory", "give me", "?",
        "summary", "overview", "details", "information"
    ])
    is_brief_paste = len(user_message) > 200 or "from:" in user_message.lower() or "subject:" in user_message.lower()
    
    # If it's a question and we have a project ID but empty brief, we need to fetch data
    needs_project_data = is_question and not is_brief_paste and project_id and len(current_brief_dict) == 0
    
    print(f"DEBUG: is_question={is_question}, is_brief_paste={is_brief_paste}, needs_project_data={needs_project_data}")
    
    # If we need project data, fetch it first using the tool
    if needs_project_data:
        print(f"DEBUG: Fetching project data for {project_id}")
        tool_result = get_project_data.invoke({"project_id": project_id})
        try:
            fetched_data = json.loads(tool_result)
            if "error" not in fetched_data:
                # Merge fetched data into current brief
                for key, value in fetched_data.items():
                    if value is not None and key in ALL_FIELDS:
                        current_brief_dict[key] = value
                current_brief = json.dumps(current_brief_dict, indent=2)
                print(f"DEBUG: Fetched and merged {len(fetched_data)} fields from database")
        except json.JSONDecodeError:
            print(f"DEBUG: Failed to parse tool result: {tool_result}")

    # Create extraction prompt
    prompt = EXTRACTION_PROMPT.format(
        current_brief=current_brief,
        user_message=user_message
    )

    response = await llm.ainvoke([
        SystemMessage(content=prompt),
        HumanMessage(content="Process the user's request. If they're asking about project data and you have it in 'Current extracted data', answer their question. If they're pasting a brief, extract the fields and respond with JSON.")
    ])
    
    # Check if LLM wants to call a tool
    if hasattr(response, 'tool_calls') and response.tool_calls:
        print(f"DEBUG: LLM requested tool calls: {response.tool_calls}")
        # Execute the tool calls
        for tool_call in response.tool_calls:
            if tool_call['name'] == 'get_project_data':
                tool_result = get_project_data.invoke(tool_call['args'])
                try:
                    fetched_data = json.loads(tool_result)
                    if "error" not in fetched_data:
                        # Merge fetched data into current brief
                        for key, value in fetched_data.items():
                            if value is not None and key in ALL_FIELDS:
                                current_brief_dict[key] = value
                        # Now answer the question with the data
                        current_brief = json.dumps(current_brief_dict, indent=2)
                        print(f"DEBUG: Tool fetched {len(fetched_data)} fields, answering question")
                        
                        # Make another call to answer the question with the data
                        llm_no_tools = get_llm(with_tools=False)
                        answer_prompt = f"""Based on this project data, answer the user's question concisely and helpfully.

Project Data:
{current_brief}

User Question: {user_message}

Provide a clear, direct answer."""
                        
                        answer_response = await llm_no_tools.ainvoke([
                            SystemMessage(content=answer_prompt),
                            HumanMessage(content="Answer the question based on the project data.")
                        ])
                        
                        return {
                            "messages": [AIMessage(content=answer_response.content)],
                            "extracted_brief": current_brief_dict,
                            "current_project_id": project_id,
                        }
                except json.JSONDecodeError:
                    pass

    # Parse the response
    try:
        # Try to extract JSON from the response
        content = response.content
        if "```json" in content:
            content = content.split("```json")[1].split("```")[0]
        elif "```" in content:
            content = content.split("```")[1].split("```")[0]

        extracted = json.loads(content)
        summary = extracted.pop("summary", "")

        # Track which fields were updated
        field_updates = []
        # Use the current_brief_dict we already built (with CopilotKit context merged)
        # This was populated earlier from state + readable context

        print(f"DEBUG: Existing brief has {len(current_brief_dict)} fields")
        print(f"DEBUG: LLM extracted {len(extracted)} fields: {list(extracted.keys())}")

        explicit_project_type = None
        for key, value in extracted.items():
            # Check if value is meaningful (not None, not empty string, not empty list)
            # But allow False and 0 as valid values
            is_meaningful = value is not None and value != "" and value != []

            if key == "project_type":
                normalized_type = normalize_project_type(value) if is_meaningful else None
                if normalized_type and normalized_type != state.get("project_type"):
                    explicit_project_type = normalized_type
                    field_updates.append("project_type")
                    print(f"DEBUG: Updated root project_type to: {normalized_type}")
                continue

            if is_meaningful and key in ALL_FIELDS:
                if current_brief_dict.get(key) != value:
                    field_updates.append(key)
                    print(f"DEBUG: Updated field '{key}' to: {value}")
                current_brief_dict[key] = value
            elif key not in ALL_FIELDS and key != "summary":
                print(f"DEBUG: Skipping unknown field '{key}'")

        print(f"DEBUG: Merged brief now has {len(current_brief_dict)} fields")

        # Calculate completeness and project type
        completeness = calculate_completeness(current_brief_dict)
        project_type = explicit_project_type or classify_project_type(current_brief_dict.get("budget_amount"))

        # Generate suggestion chips
        suggestion_chips = generate_suggestion_chips(current_brief_dict)

        # Create response message
        response_parts = []
        if summary:
            response_parts.append(summary)

        if field_updates:
            response_parts.append(f"\n\n**Extracted {len(field_updates)} fields** from your brief.")

        if completeness < 70:
            response_parts.append(f"\n\nThe brief is **{completeness}% complete**. I've identified some missing information that would help with the music search.")
        elif completeness < 90:
            response_parts.append(f"\n\nThe brief is **{completeness}% complete**. Just a few more details would make it comprehensive.")
        else:
            response_parts.append(f"\n\nThe brief is **{completeness}% complete**. This is a solid brief with most key information captured.")

        if explicit_project_type:
            response_parts.append(f"\n\nProject type has been set to **{project_type}** based on your instruction.")
        elif project_type:
            budget = current_brief_dict.get("budget_amount")
            response_parts.append(f"\n\nBased on the budget of €{budget:,.0f}, this is classified as a **Type {project_type}** project.")

        ai_message = AIMessage(content="".join(response_parts))

        return {
            "messages": [ai_message],
            "extracted_brief": current_brief_dict,
            "completeness": completeness,
            "project_type": project_type,
            "suggestion_chips": suggestion_chips,
            "field_updates": field_updates,
            "current_project_id": project_id,
        }

    except (json.JSONDecodeError, KeyError) as e:
        # If extraction fails, provide a helpful response
        ai_message = AIMessage(
            content="I had trouble parsing that brief. Could you paste the raw text from the client email or document? I'll extract the key details like budget, territory, timeline, and creative direction."
        )
        return {
            "messages": [ai_message],
            "field_updates": [],
            "current_project_id": project_id,
        }


def should_continue(state: BriefAnalyzerState) -> str:
    """Determine if we should continue processing"""
    return END


# Build the graph
def create_brief_analyzer_graph():
    """Create the brief analyzer LangGraph

    Uses Input/Output schemas to properly sync state with the frontend:
    - InputState: what we receive from frontend (messages)
    - OutputState: what we send back (extracted_brief, completeness, etc.)
    """
    # Specify input and output schemas for proper frontend state sync
    workflow = StateGraph(BriefAnalyzerState, input=InputState, output=OutputState)

    # Add nodes
    workflow.add_node("extract", extract_node)

    # Add edges
    workflow.set_entry_point("extract")
    workflow.add_conditional_edges("extract", should_continue)

    # Add checkpointer for AG-UI state management
    checkpointer = MemorySaver()
    return workflow.compile(checkpointer=checkpointer)


# Export the compiled graph
brief_analyzer_graph = create_brief_analyzer_graph()
