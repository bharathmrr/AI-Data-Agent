from __future__ import annotations
from typing import Any, Dict, List, Optional
from sqlalchemy import text
from sqlalchemy.engine import Engine
from .db import get_engine
from .profiling import list_dataset_tables
from .config import OLLAMA_BASE_URL, OLLAMA_MODEL

# Lazy import to avoid heavy import at startup if Ollama not installed
_llm = None

def _get_llm():
	global _llm
	if _llm is None:
		from langchain_community.llms import Ollama
		_llm = Ollama(base_url=OLLAMA_BASE_URL, model=OLLAMA_MODEL, temperature=0.2)
	return _llm

SYSTEM_PROMPT = (
	"You are a data analyst. Given SQLite schema and a user question, write a safe SQL query "
	"that answers the question. Respond ONLY in valid JSON format with these exact keys:\n"
	'{"sql": "SELECT statement here", "rationale": "Clear explanation of what the query does and what insights it provides", "chart": {"type": "bar|line|scatter|pie", "x": "column_name", "y": "column_name", "color": "column_name", "agg": "sum|count|avg"}}\n'
	"Rules: Only SELECT queries, no DDL. Provide clear, structured explanations. Include chart specs when data would benefit from visualization."
)

SCHEMA_PROMPT_TEMPLATE = (
	"SQLite tables available:\n{tables}\n\n"
	"For each table, columns:\n{columns}\n\n"
	"User question: {question}\n"
	"Return JSON only."
)


def _introspect_schema(engine: Engine, tables: List[str]) -> Dict[str, List[str]]:
	schema: Dict[str, List[str]] = {}
	with engine.begin() as conn:
		for t in tables:
			cols = conn.execute(text(f"PRAGMA table_info({t})")).fetchall()
			schema[t] = [c[1] for c in cols]
	return schema


def run_agent(dataset_id: str, history: List[Dict[str, str]]) -> Dict[str, Any]:
	engine = get_engine()
	tables = list_dataset_tables(engine, dataset_id)
	if not tables:
		raise ValueError("Dataset not found")
	schema = _introspect_schema(engine, tables)
	user_msg = next((m["content"] for m in reversed(history) if m.get("role") == "user"), "")
	prompt = SCHEMA_PROMPT_TEMPLATE.format(
		tables=", ".join(tables),
		columns="\n".join([f"- {t}: {', '.join(cols)}" for t, cols in schema.items()]),
		question=user_msg,
	)
	llm = _get_llm()
	raw = llm.invoke(f"{SYSTEM_PROMPT}\n\n{prompt}")
	# best effort JSON extraction with better error handling
	import json, re
	json_text = raw.strip()
	
	# Try to find JSON block
	m = re.search(r"\{[\s\S]*\}", json_text)
	if m:
		json_text = m.group(0)
	
	try:
		plan = json.loads(json_text)
		# Validate required fields
		if not isinstance(plan, dict):
			raise ValueError("Response is not a JSON object")
		if "sql" not in plan:
			plan["sql"] = ""
		if "rationale" not in plan:
			plan["rationale"] = "Unable to generate proper response"
	except Exception as e:
		# Fallback with better structure
		plan = {
			"sql": "",
			"rationale": f"I encountered an error processing your request: {str(e)}\n\nRaw response: {raw[:200]}...",
			"chart": None
		}

	result_rows: List[Dict[str, Any]] | None = None
	execution_error = None
	
	if plan.get("sql"):
		try:
			with engine.begin() as conn:
				res = conn.execute(text(plan["sql"]))
				cols = res.keys()
				result_rows = [dict(zip(cols, row)) for row in res.fetchall()]
		except Exception as e:
			execution_error = str(e)
			result_rows = None

	# Build structured response
	answer_parts = []
	
	# Add rationale
	if plan.get("rationale"):
		answer_parts.append(f"**Analysis:** {plan['rationale']}")
	
	# Add execution info
	if plan.get("sql"):
		answer_parts.append(f"**Query executed:** `{plan['sql']}`")
		
	if execution_error:
		answer_parts.append(f"**Query error:** {execution_error}")
	elif result_rows:
		answer_parts.append(f"**Results:** Found {len(result_rows)} rows")
	
	# Add chart info if specified
	if plan.get("chart"):
		chart = plan["chart"]
		answer_parts.append(f"**Visualization:** {chart.get('type', 'chart')} showing {chart.get('x', 'data')} vs {chart.get('y', 'values')}")

	response: Dict[str, Any] = {
		"answer": "\n\n".join(answer_parts),
		"table": result_rows,
		"chart": plan.get("chart"),
	}
	return response
