import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/index.css'
import App from './App.jsx'
import RoomProvider from './context/RoomProvider.jsx'
import HomePage from './pages/HomePage.jsx'
import RoomRoute from './pages/RoomRoute.jsx'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'

const router = createBrowserRouter([
  {
    
    element: <App />,
    children: [
      { path: '/', element: <HomePage /> }
    ]
  },
  { path: 'room/:roomId', element: <RoomRoute /> }
])

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RoomProvider>
      <RouterProvider router={router} />
    </RoomProvider>
  </StrictMode>
)
