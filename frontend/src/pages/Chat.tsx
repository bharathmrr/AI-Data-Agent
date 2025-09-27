import { useQuery } from '@tanstack/react-query'
import { useParams, Link } from 'react-router-dom'
import ChatBox from '../components/ChatBox'
import { api } from '../lib/api'

const Stars = () => (
	<div className="fixed inset-0 pointer-events-none">
		{Array.from({ length: 20 }).map((_, i) => (
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

export default function Chat() {
	const { datasetId } = useParams()
	const { data } = useQuery({
		queryKey: ['profile', datasetId],
		queryFn: async () => api.get(`/chat/profile/${datasetId}`),
		enabled: !!datasetId
	})

	return (
		<div className="min-h-screen relative">
			<Stars />
			<div className="grid grid-rows-[auto_1fr] relative z-10">
				<header className="p-6 border-b border-white/10 bg-black/20 backdrop-blur-sm">
					<div className="flex items-center justify-between">
						<div>
							<h2 className="text-2xl font-bold gradient-text">📊 {datasetId}</h2>
							<p className="text-sm opacity-70 mt-1">AI-powered data analysis</p>
						</div>
						<div className="flex items-center space-x-4">
							<div className="flex items-center space-x-2 bg-green-500/20 px-3 py-1 rounded-full border border-green-500/30">
								<div className="w-2 h-2 bg-green-400 rounded-full animate-pulse-slow"></div>
								<span className="text-green-300 text-sm font-medium">{data?.tables?.length ?? 0} tables loaded</span>
							</div>
							<Link 
								to="/upload" 
								className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300 transform hover:scale-105 glow"
							>
								📁 New Upload
							</Link>
						</div>
					</div>
				</header>
				
				<main className="grid grid-cols-1 lg:grid-cols-4 gap-6 p-6">
					<section className="card p-6 lg:col-span-1 overflow-auto animate-float">
						<h3 className="font-bold text-lg mb-4 gradient-text">🗂️ Data Schema</h3>
						<div className="space-y-4 text-sm">
							{data?.tables?.map((t: any, idx: number) => (
								<div key={t.table} className="bg-white/5 rounded-lg p-4 border border-white/10 hover:border-indigo-300/50 transition-colors">
									<div className="font-mono text-indigo-300 font-semibold mb-2">
										📋 {t.table}
										<span className="ml-2 text-xs bg-indigo-500/20 px-2 py-1 rounded-full">
											{t.rows} rows
										</span>
									</div>
									<div className="space-y-2">
										{t.columns.map((c: any, colIdx: number) => (
											<div key={c.name} className="text-xs opacity-80 flex justify-between items-center">
												<span className="font-medium">{c.name}</span>
												<div className="flex items-center space-x-2">
													<span className="bg-blue-500/20 px-2 py-1 rounded text-blue-300">{c.dtype}</span>
													{c.nulls > 0 && (
														<span className="bg-orange-500/20 px-2 py-1 rounded text-orange-300">
															{c.nulls} nulls
														</span>
													)}
													<span className="bg-green-500/20 px-2 py-1 rounded text-green-300">
														{c.unique} unique
													</span>
												</div>
											</div>
										))}
									</div>
								</div>
							))}
						</div>
					</section>
					
					<section className="card p-0 lg:col-span-3 min-h-[70vh] overflow-hidden animate-float-delayed">
						<ChatBox datasetId={datasetId!} />
					</section>
				</main>
			</div>
		</div>
	)
}
