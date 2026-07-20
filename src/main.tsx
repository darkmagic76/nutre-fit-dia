import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { I18nProvider } from '@shared/i18n'
import { ThemeProvider } from '@shared/theme'
import './index.css'
import App from './App'

const root = document.getElementById('root')
if (!root) throw new Error('Fatal: #root element not found — cannot mount application')

createRoot(root).render(
  <StrictMode>
    <ThemeProvider>
      <I18nProvider>
        <App />
      </I18nProvider>
    </ThemeProvider>
  </StrictMode>,
)
