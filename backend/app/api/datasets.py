from fastapi import APIRouter, UploadFile, File, HTTPException
from pydantic import BaseModel
from typing import List
from ..core.db import get_engine
from ..core.ingestion import read_any_table, write_to_sqlite

router = APIRouter(prefix="/datasets", tags=["datasets"])

class UploadResponse(BaseModel):
	id: str
	tables: List[str]

@router.post("/upload", response_model=UploadResponse)
async def upload_dataset(file: UploadFile = File(...)):
	contents = await file.read()
	if not contents:
		raise HTTPException(status_code=400, detail="Empty file")
	# simple dataset id from filename stem
	stem = (file.filename or "dataset").split(".")[0].lower()
	dataset_id = stem.replace(" ", "_")
	sheets = read_any_table(contents, file.filename or dataset_id)
	engine = get_engine()
	tables = write_to_sqlite(engine, dataset_id, sheets)
	return UploadResponse(id=dataset_id, tables=tables)
