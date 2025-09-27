from __future__ import annotations
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Any, Dict, List, Optional
from ..core.db import get_engine
from ..core.profiling import profile_table, list_dataset_tables
from ..core.agent import run_agent

router = APIRouter(prefix="/chat", tags=["chat"])

class Message(BaseModel):
	role: str
	content: str

class ChatRequest(BaseModel):
	dataset_id: str
	messages: List[Message]

class ChartSpec(BaseModel):
	type: str
	x: Optional[str] = None
	y: Optional[str] = None
	color: Optional[str] = None
	agg: Optional[str] = None

class ChatResponse(BaseModel):
	answer: str
	table: Optional[List[Dict[str, Any]]] = None
	chart: Optional[ChartSpec] = None

@router.get("/profile/{dataset_id}")
async def profile_dataset(dataset_id: str):
	engine = get_engine()
	tables = list_dataset_tables(engine, dataset_id)
	if not tables:
		raise HTTPException(status_code=404, detail="Dataset not found")
	return {"tables": [profile_table(engine, t) for t in tables]}

@router.post("")
async def chat(req: ChatRequest) -> ChatResponse:
	engine = get_engine()
	tables = list_dataset_tables(engine, req.dataset_id)
	if not tables:
		raise HTTPException(status_code=404, detail="Dataset not found")
	agent_out = run_agent(req.dataset_id, [m.dict() for m in req.messages])
	return ChatResponse(
		answer=agent_out.get("answer", ""),
		table=agent_out.get("table"),
		chart=agent_out.get("chart"),
	)
