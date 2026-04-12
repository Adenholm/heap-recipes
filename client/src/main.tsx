import { StrictMode } from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import App from './App.js'
import { AuthProvider } from './context/auth.js'
import { ModalProvider } from './context/modal.js'
import { RecipesProvider } from './context/recipes.js'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <ModalProvider>
        <RecipesProvider>
          <App />
        </RecipesProvider>
      </ModalProvider>
    </AuthProvider>
  </StrictMode>,
)
