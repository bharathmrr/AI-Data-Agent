# AI Data Agent

Conversational analytics platform: upload any Excel file and ask complex business questions about your data. The system cleans messy spreadsheets, infers schemas, loads into SQLite, and uses an AI agent to answer questions with tables and charts.

## Tech Stack
- Frontend: React (Vite), TypeScript, Tailwind, React Query
- Backend: FastAPI (Python), SQLite + SQLAlchemy, Pandas, OpenPyXL/pyxlsb
- AI: LangChain + Ollama (`gemma3:1b-it-qat`) with SQL+Pandas toolchain

## Monorepo Layout
```
backend/
  app/
    main.py
    api/
      __init__.py
      datasets.py
      chat.py
    core/
      config.py
      db.py
      models.py
      ingestion.py
      profiling.py
      agent.py
    static/
  requirements.txt
frontend/
  index.html
  src/
    main.tsx
    App.tsx
    pages/
      Upload.tsx
      Chat.tsx
    components/
      ChatBox.tsx
      DataPreview.tsx
      ChartView.tsx
  package.json
```

## Prerequisites
- Python 3.10+
- Node.js 18+
- Ollama installed and model pulled: `gemma3:1b-it-qat`

## Quickstart
1) Backend
```
cd backend
python -m venv .venv && .venv/Scripts/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```
2) Frontend
```
cd frontend
npm install
npm run dev -- --port 5173
```
3) Pull Ollama model
```
ollama pull gemma3:1b-it-qat
```

Open http://localhost:5173

## Deployment
- Backend: Any container host. Expose port 8000
- Frontend: Static hosting (Vercel/Netlify)
- Set `OLLAMA_BASE_URL` if not default

## Notes
- Handles sheet/column inference, header detection, type casting, missing values
- Supports xlsx, xls, csv; more can be added in `ingestion.py`
