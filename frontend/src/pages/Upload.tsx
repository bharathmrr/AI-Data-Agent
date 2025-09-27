import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../lib/api'

const Stars = () => (
	<div className="fixed inset-0 pointer-events-none">
		{Array.from({ length: 30 }).map((_, i) => (
			<div
				key={i}
				className="star"
				style={{
					left: `${Math.random() * 100}%`,
					top: `${Math.random() * 100}%`,
					width: `${Math.random() * 2 + 1}px`,
					height: `${Math.random() * 2 + 1}px`,
					animationDelay: `${Math.random() * 3}s`,
				}}
			/>
		))}
	</div>
)

export default function Upload() {
	const [file, setFile] = useState<File | null>(null)
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState<string | null>(null)
	const [dragOver, setDragOver] = useState(false)
	const navigate = useNavigate()

	const onSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		if (!file) return
		setLoading(true)
		setError(null)
		try {
			const form = new FormData()
			form.append('file', file)
			const res = await api.post<{ id: string }>("/datasets/upload", form)
			navigate(`/chat/${res.id}`)
		} catch (err: any) {
			const detail = err?.response?.data?.detail || err?.message || 'Upload failed'
			setError(detail)
		} finally {
			setLoading(false)
		}
	}

	const handleDrop = (e: React.DragEvent) => {
		e.preventDefault()
		setDragOver(false)
		const files = e.dataTransfer.files
		if (files.length > 0) {
			setFile(files[0])
		}
	}

	return (
		<div className="min-h-screen p-6 relative">
			<Stars />
			<div className="max-w-4xl mx-auto card p-8 animate-float-delayed relative z-10">
				<div className="text-center mb-8">
					<h2 className="text-4xl font-bold gradient-text mb-4">📊 Upload Your Data</h2>
					<p className="text-lg opacity-80">Drop your Excel or CSV files here to start analyzing</p>
				</div>
				
				<form onSubmit={onSubmit} className="space-y-6">
					<div 
						className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-300 ${
							dragOver 
								? 'border-indigo-400 bg-indigo-500/10 scale-105' 
								: 'border-white/20 hover:border-indigo-300 hover:bg-indigo-500/5'
						}`}
						onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
						onDragLeave={() => setDragOver(false)}
						onDrop={handleDrop}
					>
						<div className="text-6xl mb-4 animate-float">📁</div>
						<p className="text-lg mb-4">
							{dragOver ? 'Drop your file here!' : 'Drag & drop your file here or click to browse'}
						</p>
						<input 
							type="file" 
							accept=".xlsx,.xls,.xlsb,.csv" 
							onChange={e => setFile(e.target.files?.[0] || null)} 
							className="hidden"
							id="file-upload"
						/>
						<label 
							htmlFor="file-upload" 
							className="inline-block bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white px-6 py-3 rounded-full font-semibold cursor-pointer transition-all duration-300 transform hover:scale-105 glow"
						>
							Choose File
						</label>
						{file && (
							<div className="mt-4 p-4 bg-green-500/20 rounded-lg border border-green-500/30">
								<p className="text-green-300 font-semibold">✅ Selected: {file.name}</p>
								<p className="text-sm text-green-200">Size: {(file.size / 1024 / 1024).toFixed(2)} MB</p>
							</div>
						)}
					</div>
					
					<div className="flex flex-col items-center space-y-4">
						<button 
							disabled={!file || loading} 
							className="bg-gradient-to-r from-green-500 to-emerald-600 disabled:from-gray-500 disabled:to-gray-600 hover:from-green-600 hover:to-emerald-700 text-white px-8 py-4 rounded-full font-bold text-lg transition-all duration-300 transform hover:scale-105 glow disabled:transform-none"
						>
							{loading ? (
								<div className="flex items-center space-x-2">
									<div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
									<span>Uploading & Analyzing...</span>
								</div>
							) : (
								'🚀 Upload & Analyze'
							)}
						</button>
						
						{error && (
							<div className="bg-red-500/20 border border-red-500/30 rounded-lg p-4 max-w-md">
								<p className="text-red-300 font-semibold">❌ Upload Failed</p>
								<p className="text-red-200 text-sm mt-1">{error}</p>
							</div>
						)}
						
						<div className="flex flex-wrap justify-center gap-4 text-sm opacity-70">
							<span className="flex items-center">
								<span className="w-2 h-2 bg-blue-400 rounded-full mr-2"></span>
								Excel (.xlsx, .xls)
							</span>
							<span className="flex items-center">
								<span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
								CSV files
							</span>
							<span className="flex items-center">
								<span className="w-2 h-2 bg-purple-400 rounded-full mr-2"></span>
								Binary Excel (.xlsb)
							</span>
						</div>
					</div>
				</form>
			</div>
		</div>
	)
}
