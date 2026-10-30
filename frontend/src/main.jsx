import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'

import './index.css'
import App from './App.jsx'
import { WalletProvider } from './context/WalletContext.jsx'
import { RiskProvider } from './context/RiskContext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <WalletProvider>
        <RiskProvider>
          <App />
        </RiskProvider>
      </WalletProvider>
    </BrowserRouter>
  </StrictMode>,
)
