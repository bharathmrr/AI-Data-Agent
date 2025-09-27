from __future__ import annotations
from flask import Flask, jsonify, request
from flask_cors import CORS
from app.core.db import get_engine
from app.core.ingestion import read_any_table, write_to_sqlite
from app.core.profiling import list_dataset_tables, profile_table
from app.core.agent import run_agent

app = Flask(__name__)
app.url_map.strict_slashes = False
app.config['MAX_CONTENT_LENGTH'] = 50 * 1024 * 1024  # 50 MB
CORS(app)

@app.errorhandler(404)
def not_found(_e):
	return jsonify({'detail': 'Not Found', 'hint': 'Check path and method. Try /api/datasets/upload (POST), /api/chat/profile/<dataset_id> (GET).'}), 404

@app.errorhandler(413)
def too_large(_e):
	return jsonify({'detail': 'File too large (max 50MB)'}), 413

@app.errorhandler(500)
def internal_error(e):
	return jsonify({'detail': 'Server error', 'error': str(e)}), 500

@app.get('/')
def root():
	return jsonify({ 'status': 'ok', 'service': 'ai-data-agent' })

@app.get('/health')
def health():
	return jsonify({ 'status': 'ok' })

# Primary (with /api prefix)
@app.post('/api/datasets/upload')
def upload_dataset():
	up = request.files.get('file') or request.files.get('files[]')
	if not up:
		return jsonify({ 'detail': 'No file part. Use form-data key "file".' }), 400
	content = up.read()
	if not content:
		return jsonify({ 'detail': 'Empty file' }), 400
	stem = (up.filename or 'dataset').split('.') [0].lower().replace(' ', '_')
	try:
		sheets = read_any_table(content, up.filename or stem)
	except Exception as e:
		return jsonify({ 'detail': f'Unsupported or unreadable file: {e}' }), 400
	engine = get_engine()
	tables = write_to_sqlite(engine, stem, sheets)
	return jsonify({ 'id': stem, 'tables': tables })

@app.get('/api/chat/profile/<dataset_id>')
def profile(dataset_id: str):
	engine = get_engine()
	tables = list_dataset_tables(engine, dataset_id)
	if not tables:
		return jsonify({ 'detail': 'Dataset not found' }), 404
	return jsonify({ 'tables': [profile_table(engine, t) for t in tables] })

@app.post('/api/chat')
def chat():
	data = request.get_json(force=True)
	dataset_id = data.get('dataset_id')
	messages = data.get('messages') or []
	engine = get_engine()
	tables = list_dataset_tables(engine, dataset_id)
	if not tables:
		return jsonify({ 'detail': 'Dataset not found' }), 404
	out = run_agent(dataset_id, messages)
	return jsonify(out)

# Tolerant duplicates (without /api prefix) to avoid 404 when misconfigured
@app.post('/datasets/upload')
def upload_dataset_no_api():
	return upload_dataset()

@app.get('/chat/profile/<dataset_id>')
def profile_no_api(dataset_id: str):
	return profile(dataset_id)

@app.post('/chat')
def chat_no_api():
	return chat()

if __name__ == '__main__':
	app.run(host='127.0.0.1', port=8001, debug=True)
