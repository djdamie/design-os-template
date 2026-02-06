"""
TF Project Builder Backend

FastAPI server with CopilotKit AG-UI integration for the brief analyzer agent.
"""

import os
import warnings
from dotenv import load_dotenv

# Suppress Pydantic warnings
warnings.filterwarnings("ignore", message="Valid config keys have changed in V2")

# Load environment variables
load_dotenv()

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

from copilotkit import LangGraphAGUIAgent
from ag_ui_langgraph import add_langgraph_fastapi_endpoint

from agents import brief_analyzer_graph

# Initialize FastAPI app
app = FastAPI(
    title="TF Project Builder API",
    description="Backend API for Brief Extraction with CopilotKit",
    version="0.1.0",
)

# Add CORS middleware
# FRONTEND_URL env var should be set to your Vercel URL in production
frontend_url = os.getenv("FRONTEND_URL", "")
allowed_origins = ["http://localhost:3000", "http://127.0.0.1:3000"]
if frontend_url:
    allowed_origins.append(frontend_url)

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create the agent using LangGraphAGUIAgent
agent = LangGraphAGUIAgent(
    name="brief_analyzer",
    description="An AI agent that extracts structured data from raw client briefs for music licensing projects.",
    graph=brief_analyzer_graph,
)

# Add the LangGraph endpoint at root path (AG-UI protocol)
# Note: This handles GET / for agent discovery and POST / for agent execution
add_langgraph_fastapi_endpoint(app, agent, "/")


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "model": os.getenv("MODEL_NAME", "openai/gpt-oss-20b"),
    }


if __name__ == "__main__":
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=port,
        reload=True,
    )
