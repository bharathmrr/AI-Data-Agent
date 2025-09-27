import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent
BACKEND = ROOT / "backend"
if str(BACKEND) not in sys.path:
	sys.path.insert(0, str(BACKEND))

from backend.flask_app import app  # type: ignore

if __name__ == "__main__":
	app.run(host="127.0.0.1", port=8001, debug=True)
