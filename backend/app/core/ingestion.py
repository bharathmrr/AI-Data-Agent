from __future__ import annotations
import io
import re
from typing import Dict, List, Tuple
import pandas as pd
from sqlalchemy import text
from sqlalchemy.engine import Engine

HEADER_CLEAN_RE = re.compile(r"[^0-9a-zA-Z_]+")


def _normalize_header(name: str, existing: set[str]) -> str:
	candidate = HEADER_CLEAN_RE.sub("_", str(name or "col")).strip("_").lower()
	if candidate == "":
		candidate = "col"
	base = candidate
	i = 1
	while candidate in existing:
		candidate = f"{base}_{i}"
		i += 1
	return candidate


def _coerce_dataframe(df: pd.DataFrame) -> pd.DataFrame:
	# Normalize headers
	existing: set[str] = set()
	new_cols: List[str] = []
	for c in df.columns:
		new_cols.append(_normalize_header(c, existing))
		existing.add(new_cols[-1])
	df.columns = new_cols

	# Remove entirely empty rows
	df = df.dropna(how="all")

	# Try type inference via pandas
	for col in df.columns:
		# Convert common date-like strings
		try:
			df[col] = pd.to_datetime(df[col], errors="ignore")
		except Exception:
			pass
		# Numeric coercion where possible
		try:
			df[col] = pd.to_numeric(df[col], errors="ignore")
		except Exception:
			pass
	return df


def _is_valid_excel(file_bytes: bytes, filename: str) -> bool:
	"""Check if file is actually an Excel file by examining magic bytes"""
	name = filename.lower()
	if name.endswith('.xlsx'):
		# XLSX files start with PK (ZIP signature)
		return file_bytes.startswith(b'PK')
	elif name.endswith('.xls'):
		# XLS files start with specific OLE signature
		return file_bytes.startswith(b'\xd0\xcf\x11\xe0\xa1\xb1\x1a\xe1')
	elif name.endswith('.xlsb'):
		# XLSB files start with PK (ZIP signature like XLSX)
		return file_bytes.startswith(b'PK')
	return False


def read_any_table(file_bytes: bytes, filename: str) -> Dict[str, pd.DataFrame]:
	name = filename.lower()
	
	# Validate file isn't HTML/text masquerading as Excel
	if any(name.endswith(ext) for ext in ['.xlsx', '.xls', '.xlsb']):
		if not _is_valid_excel(file_bytes, filename):
			raise ValueError(f"File appears to be HTML/text, not a valid Excel file: {filename}")
	
	if name.endswith(".csv"):
		try:
			df = pd.read_csv(io.BytesIO(file_bytes))
			return {"sheet1": _coerce_dataframe(df)}
		except Exception as e:
			raise ValueError(f"Invalid CSV file: {e}") from e
	elif name.endswith(".xlsx"):
		try:
			xl = pd.ExcelFile(io.BytesIO(file_bytes), engine='openpyxl')
			sheets: Dict[str, pd.DataFrame] = {}
			for sheet in xl.sheet_names:
				df = xl.parse(sheet)
				sheets[sheet or "sheet1"] = _coerce_dataframe(df)
			return sheets
		except Exception as e:
			raise ValueError(f"Invalid XLSX file: {e}") from e
	elif name.endswith(".xls"):
		try:
			xl = pd.ExcelFile(io.BytesIO(file_bytes), engine='xlrd')
			sheets: Dict[str, pd.DataFrame] = {}
			for sheet in xl.sheet_names:
				df = xl.parse(sheet)
				sheets[sheet or "sheet1"] = _coerce_dataframe(df)
			return sheets
		except Exception as e:
			raise ValueError(f"Invalid XLS file: {e}") from e
	elif name.endswith(".xlsb"):
		try:
			xl = pd.read_excel(io.BytesIO(file_bytes), sheet_name=None, engine="pyxlsb")
			return {k: _coerce_dataframe(v) for k, v in xl.items()}
		except Exception as e:
			raise ValueError(f"Invalid XLSB file: {e}") from e
	else:
		# Try CSV fallback
		try:
			df = pd.read_csv(io.BytesIO(file_bytes))
			return {"sheet1": _coerce_dataframe(df)}
		except Exception as e:
			raise ValueError(f"Unsupported file type or corrupt file: {filename}. Error: {e}") from e


def write_to_sqlite(engine: Engine, dataset_id: str, sheets: Dict[str, pd.DataFrame]) -> List[str]:
	created_tables: List[str] = []
	with engine.begin() as conn:
		for sheet_name, df in sheets.items():
			table_name = f"{dataset_id}__" + HEADER_CLEAN_RE.sub("_", sheet_name.lower()).strip("_")
			if table_name == f"{dataset_id}__":
				table_name += "sheet"
			# write, replacing if re-uploaded
			df.to_sql(table_name, conn, if_exists="replace", index=False)
			created_tables.append(table_name)
			# create simple row count view
			conn.execute(text(f"create view if not exists {table_name}_meta as select count(*) as rows from {table_name}"))
	return created_tables