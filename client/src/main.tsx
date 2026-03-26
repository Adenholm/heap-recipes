import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { AuthProvider } from './context/auth'
import { ModalProvider } from './context/modal'
import { RecipesProvider } from './context/recipes'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <ModalProvider>
        <RecipesProvider>
          <App />
        </RecipesProvider>
      </ModalProvider>
    </AuthProvider>
  </StrictMode>
)
