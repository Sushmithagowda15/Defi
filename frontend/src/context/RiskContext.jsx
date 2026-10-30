import { createContext, useContext, useState } from 'react'

const RiskContext = createContext(null)

export function RiskProvider({ children }) {
  const [riskData, setRiskData] = useState(null)

  return (
    <RiskContext.Provider value={{ riskData, setRiskData }}>
      {children}
    </RiskContext.Provider>
  )
}

export function useRisk() {
  const context = useContext(RiskContext)

  if (!context) {
    throw new Error('useRisk must be used inside RiskProvider')
  }

  return context
}
