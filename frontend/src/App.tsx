import { Link } from 'react-router-dom'

const Stars = () => (
	<div className="fixed inset-0 pointer-events-none">
		{Array.from({ length: 50 }).map((_, i) => (
			<div
				key={i}
				className="star"
				style={{
					left: `${Math.random() * 100}%`,
					top: `${Math.random() * 100}%`,
					width: `${Math.random() * 3 + 1}px`,
					height: `${Math.random() * 3 + 1}px`,
					animationDelay: `${Math.random() * 3}s`,
				}}
			/>
		))}
	</div>
)

export default function App() {
	return (
		<div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden">
			<Stars />
			<div className="max-w-2xl w-full card p-8 animate-float relative z-10">
				<div className="text-center">
					<h1 className="text-5xl font-bold gradient-text mb-4">AI Data Agent</h1>
					<p className="text-lg mt-4 opacity-90 leading-relaxed">
						Upload Excel/CSV files and ask questions in natural language. 
						Get intelligent answers with interactive tables and beautiful charts.
					</p>
					<div className="mt-8">
						<Link 
							to="/upload" 
							className="inline-block bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white px-8 py-4 rounded-full font-semibold text-lg transition-all duration-300 transform hover:scale-105 glow"
						>
							🚀 Get Started
						</Link>
					</div>
					<div className="mt-6 flex justify-center space-x-4 text-sm opacity-70">
						<span className="flex items-center">
							<span className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse-slow"></span>
							Real-time Analysis
						</span>
						<span className="flex items-center">
							<span className="w-2 h-2 bg-blue-400 rounded-full mr-2 animate-pulse-slow"></span>
							Smart Charts
						</span>
						<span className="flex items-center">
							<span className="w-2 h-2 bg-purple-400 rounded-full mr-2 animate-pulse-slow"></span>
							AI Powered
						</span>
					</div>
				</div>
			</div>
		</div>
	)
}
