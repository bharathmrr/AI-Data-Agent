from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .api import datasets, chat

app = FastAPI(title="AI Data Agent", version="0.1.0")

app.add_middleware(	CORSMiddleware,
	allow_origins=["*"],
	allow_credentials=True,
	allow_methods=["*"],
	allow_headers=["*"],
)

app.include_router(datasets.router, prefix="/api")
app.include_router(chat.router, prefix="/api")

@app.get("/health")
async def health():
	return {"status": "ok"}
