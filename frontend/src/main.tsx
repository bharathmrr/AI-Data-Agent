import React from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import './index.css'
import App from './App'
import Upload from './pages/Upload'
import Chat from './pages/Chat'

const router = createBrowserRouter([
	{ path: '/', element: <App /> },
	{ path: '/upload', element: <Upload /> },
	{ path: '/chat/:datasetId', element: <Chat /> },
])

const queryClient = new QueryClient()

ReactDOM.createRoot(document.getElementById('root')!).render(
	<React.StrictMode>
		<QueryClientProvider client={queryClient}>
			<RouterProvider router={router} />
		</QueryClientProvider>
	</React.StrictMode>
)
