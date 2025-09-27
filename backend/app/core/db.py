from sqlalchemy import create_engine
from sqlalchemy.engine import Engine
from .config import DATABASE_URL

_engine: Engine | None = None

def get_engine() -> Engine:
	global _engine
	if _engine is None:
		_engine = create_engine(DATABASE_URL, future=True)
	return _engine
