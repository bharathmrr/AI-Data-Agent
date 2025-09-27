import sys
from pathlib import Path

# Ensure backend package is importable when running from repo root
ROOT = Path(__file__).resolve().parent
BACKEND = ROOT / "backend"
if str(BACKEND) not in sys.path:
	sys.path.insert(0, str(BACKEND))

if __name__ == "__main__":
	import uvicorn
	uvicorn.run("app.main:app", host="127.0.0.1", port=8000, reload=True)
