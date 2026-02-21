import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import { Toaster } from 'react-hot-toast'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3500,
          style: {
            background: '#ffffff',
            color: '#0f2746',
            border: '1px solid #d7e3f2',
            fontSize: '0.875rem',
            boxShadow: '0 10px 25px rgba(17, 48, 84, 0.08)',
          },
          success: { iconTheme: { primary: '#0f7a4d', secondary: '#ffffff' } },
          error:   { iconTheme: { primary: '#b32d3e', secondary: '#ffffff' } },
        }}
      />
      <App />
    </AuthProvider>
  </StrictMode>,
)

