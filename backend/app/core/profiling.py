from __future__ import annotations
from typing import Dict, Any, List
import pandas as pd
from sqlalchemy import text
from sqlalchemy.engine import Engine


def profile_table(engine: Engine, table_name: str, sample_rows: int = 5) -> Dict[str, Any]:
	with engine.begin() as conn:
		df = pd.read_sql(text(f"select * from {table_name} limit 5000"), conn)
		summary: Dict[str, Any] = {"table": table_name, "rows": int(df.shape[0]), "columns": []}
		for col in df.columns:
			series = df[col]
			col_info: Dict[str, Any] = {
				"name": col,
				"dtype": str(series.dtype),
				"nulls": int(series.isna().sum()),
				"unique": int(series.nunique(dropna=True)),
				"example_values": series.dropna().astype(str).head(3).tolist(),
			}
			summary["columns"].append(col_info)
		# sample rows for preview
		summary["sample"] = df.head(sample_rows).to_dict(orient="records")
		return summary


def list_dataset_tables(engine: Engine, dataset_id: str) -> List[str]:
	with engine.begin() as conn:
		res = conn.execute(text("select name from sqlite_master where type='table'"))
		all_tables = [r[0] for r in res.fetchall()]
	return [t for t in all_tables if t.startswith(f"{dataset_id}__")]
