import { useEffect, useRef, useState } from 'react'
import { VegaLite } from 'react-vega'
import { api } from '../lib/api'

interface Message { role: 'user' | 'assistant', content: string }

export default function ChatBox({ datasetId }: { datasetId: string }) {
	const [messages, setMessages] = useState<Message[]>([])
	const [input, setInput] = useState('')
	const [loading, setLoading] = useState(false)
	const [table, setTable] = useState<any[] | null>(null)
	const [chart, setChart] = useState<any | null>(null)
	const endRef = useRef<HTMLDivElement>(null)

	useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

	const send = async () => {
		if (!input.trim()) return
		const next = [...messages, { role: 'user', content: input }]
		setMessages(next)
		setInput('')
		setLoading(true)
		try {
			const res = await api.post<{ answer: string; table?: any[]; chart?: any }>(`/chat`, { dataset_id: datasetId, messages: next })
			if (res?.answer) setMessages(m => [...m, { role: 'assistant', content: res.answer }])
			setTable(res?.table || null)
			setChart(res?.chart || null)
		} catch (e: any) {
			setMessages(m => [...m, { role: 'assistant', content: e?.response?.data?.detail || 'Failed to get answer' }])
		} finally {
			setLoading(false)
		}
	}

	const columns = table && table.length ? Object.keys(table[0]) : []
	const vlSpec = chart && table ? {
		mark: {
			type: chart.type || 'bar',
			stroke: '#ffffff',
			strokeWidth: 1,
			cornerRadius: 2
		},
		encoding: {
			x: { 
				field: chart.x || columns[0], 
				type: 'nominal',
				title: chart.x || columns[0],
				axis: {
					titleColor: '#ffffff',
					labelColor: '#e2e8f0',
					titleFontSize: 14,
					labelFontSize: 12
				}
			},
			y: { 
				field: chart.y || columns[1], 
				type: 'quantitative', 
				aggregate: chart.agg || 'sum',
				title: `${chart.agg || 'sum'}( ${chart.y || columns[1]} )`,
				axis: {
					titleColor: '#ffffff',
					labelColor: '#e2e8f0',
					titleFontSize: 14,
					labelFontSize: 12
				}
			},
			color: chart.color ? { 
				field: chart.color, 
				type: 'nominal',
				title: chart.color,
				legend: {
					titleColor: '#ffffff',
					labelColor: '#e2e8f0'
				}
			} : {
				value: '#667eea'
			},
		},
		data: { values: table },
		width: 600,
		height: 400,
		background: 'transparent'
	} : null

	return (
		<div className="flex flex-col h-full">
			<div className="flex-1 overflow-auto space-y-4 p-6">
				{messages.length === 0 && (
					<div className="text-center py-12">
						<div className="text-6xl mb-4 animate-float">🤖</div>
						<h3 className="text-xl font-semibold gradient-text mb-2">Ask me anything about your data!</h3>
						<p className="text-sm opacity-70">Try questions like "What's the average salary?" or "Show me trends by department"</p>
					</div>
				)}
				
				{messages.map((m, i) => (
					<div key={i} className={`max-w-4xl ${m.role==='user' ? 'ml-auto' : ''}`}>
						<div className={`px-6 py-4 rounded-2xl whitespace-pre-wrap transition-all duration-300 ${
							m.role === 'user' 
								? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg' 
								: 'bg-white/10 border border-white/20 backdrop-blur-sm'
						}`}>
							{m.role === 'assistant' ? (
								<div className="prose prose-invert max-w-none">
									{m.content.split('**').map((part, idx) => 
										idx % 2 === 1 ? <strong key={idx} className="text-yellow-300">{part}</strong> : part
									)}
								</div>
							) : (
								<div className="flex items-center space-x-2">
									<span className="text-lg">👤</span>
									<span>{m.content}</span>
								</div>
							)}
						</div>
					</div>
				))}
				
				{loading && (
					<div className="max-w-4xl">
						<div className="bg-white/10 border border-white/20 backdrop-blur-sm px-6 py-4 rounded-2xl">
							<div className="flex items-center space-x-3">
								<div className="w-6 h-6 border-2 border-indigo-300/30 border-t-indigo-400 rounded-full animate-spin"></div>
								<span className="text-indigo-300">🤖 AI is thinking...</span>
							</div>
						</div>
					</div>
				)}
				
				<div ref={endRef} />
				
				{table && (
					<div className="card p-6 overflow-auto max-w-6xl">
						<div className="flex items-center space-x-2 mb-4">
							<span className="text-2xl">📊</span>
							<h4 className="font-semibold text-lg gradient-text">Query Results</h4>
							<span className="bg-green-500/20 px-3 py-1 rounded-full text-green-300 text-sm">
								{table.length} rows
							</span>
						</div>
						<div className="overflow-x-auto">
							<table className="w-full text-sm">
								<thead>
									<tr className="border-b border-white/20">
										{columns.map(c => (
											<th key={c} className="text-left p-3 font-semibold text-indigo-300 bg-white/5">
												{c}
											</th>
										))}
									</tr>
								</thead>
								<tbody>
									{table.slice(0, 100).map((row, idx) => (
										<tr key={idx} className="hover:bg-white/5 transition-colors border-b border-white/5">
											{columns.map(c => (
												<td key={c} className="p-3">
													{String(row[c])}
												</td>
											))}
										</tr>
									))}
								</tbody>
							</table>
						</div>
					</div>
				)}
				
				{vlSpec && (
					<div className="card p-6 max-w-6xl relative overflow-hidden">
						{/* Moving stars background */}
						<div className="absolute inset-0 pointer-events-none">
							{Array.from({ length: 15 }).map((_, i) => (
								<div
									key={i}
									className="absolute w-1 h-1 bg-white rounded-full opacity-60 animate-pulse"
									style={{
										left: `${Math.random() * 100}%`,
										top: `${Math.random() * 100}%`,
										animationDelay: `${Math.random() * 3}s`,
										animationDuration: `${2 + Math.random() * 2}s`,
									}}
								/>
							))}
						</div>
						
						<div className="relative z-10">
							<div className="flex items-center space-x-2 mb-6">
								<span className="text-2xl animate-pulse">📈</span>
								<h4 className="font-bold text-xl gradient-text">Data Visualization</h4>
								<div className="flex items-center space-x-2 ml-auto">
									<div className="w-2 h-2 bg-green-400 rounded-full animate-pulse-slow"></div>
									<span className="text-sm text-green-300">Interactive Chart</span>
								</div>
							</div>
							
							<div className="chart-container rounded-xl p-6 shadow-2xl">
								<VegaLite 
									spec={{
										...vlSpec,
										background: "rgba(0,0,0,0.8)",
										width: 600,
										height: 400,
										padding: 20,
										config: {
											background: "rgba(0,0,0,0.8)",
											axis: {
												titleColor: "#ffffff",
												labelColor: "#e2e8f0",
												domainColor: "#667eea",
												tickColor: "#667eea",
												gridColor: "rgba(102, 126, 234, 0.3)",
												titleFontSize: 16,
												labelFontSize: 14,
												titleFontWeight: "bold",
												labelFontWeight: "normal"
											},
											title: {
												color: "#ffffff",
												fontSize: 20,
												fontWeight: "bold",
												anchor: "start",
												offset: 20
											},
											legend: {
												titleColor: "#ffffff",
												labelColor: "#e2e8f0",
												titleFontSize: 14,
												labelFontSize: 12,
												labelFontWeight: "normal"
											},
											mark: {
												color: "#667eea",
												stroke: "#ffffff",
												strokeWidth: 1
											},
											range: {
												category: ["#667eea", "#764ba2", "#f093fb", "#f5576c", "#4facfe", "#00f2fe", "#ff6b6b", "#4ecdc4"],
												ordinal: ["#667eea", "#764ba2", "#f093fb", "#f5576c", "#4facfe", "#00f2fe", "#ff6b6b", "#4ecdc4"]
											},
											text: {
												color: "#ffffff",
												fontSize: 12
											}
										},
										title: {
											text: `Chart: ${chart?.type?.toUpperCase() || 'Data Visualization'}`,
											color: "#ffffff",
											fontSize: 20,
											fontWeight: "bold",
											anchor: "start"
										}
									} as any} 
									actions={false}
								/>
							</div>
							
							<div className="mt-4 flex flex-wrap gap-2 text-xs opacity-70">
								<span className="bg-blue-500/20 px-2 py-1 rounded text-blue-300">
									{chart?.type?.toUpperCase() || 'CHART'}
								</span>
								{chart?.x && (
									<span className="bg-green-500/20 px-2 py-1 rounded text-green-300">
										X: {chart.x}
									</span>
								)}
								{chart?.y && (
									<span className="bg-purple-500/20 px-2 py-1 rounded text-purple-300">
										Y: {chart.y}
									</span>
								)}
								{chart?.color && (
									<span className="bg-orange-500/20 px-2 py-1 rounded text-orange-300">
										Color: {chart.color}
									</span>
								)}
								{chart?.agg && (
									<span className="bg-pink-500/20 px-2 py-1 rounded text-pink-300">
										Agg: {chart.agg.toUpperCase()}
									</span>
								)}
							</div>
						</div>
					</div>
				)}
			</div>
			
			<div className="p-6 border-t border-white/10 bg-black/20 backdrop-blur-sm">
				<div className="flex gap-3 items-end">
					<div className="flex-1 relative">
						<input 
							value={input} 
							onChange={e=>setInput(e.target.value)} 
							onKeyDown={e=>{ if(e.key==='Enter' && !e.shiftKey) { e.preventDefault(); send(); }}} 
							placeholder="Ask a question about your data... (Shift+Enter for new line)" 
							className="w-full bg-white/10 border border-white/20 rounded-2xl px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:border-indigo-400 focus:bg-white/15 transition-all duration-300" 
						/>
					</div>
					<button 
						onClick={send} 
						disabled={loading || !input.trim()} 
						className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 disabled:from-gray-500 disabled:to-gray-600 text-white px-6 py-3 rounded-2xl font-semibold transition-all duration-300 transform hover:scale-105 glow disabled:transform-none disabled:glow-none"
					>
						{loading ? (
							<div className="flex items-center space-x-2">
								<div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
								<span>Thinking...</span>
							</div>
						) : (
							'🚀 Send'
						)}
					</button>
				</div>
			</div>
		</div>
	)
}
