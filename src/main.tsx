import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { SaaSProvider } from './contexts/SaaSContext'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <SaaSProvider>
          <App />
        </SaaSProvider>
      </BrowserRouter>
    </AuthProvider>
  </StrictMode>,
)
