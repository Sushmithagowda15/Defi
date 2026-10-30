const RISK_API_URL = 'http://127.0.0.1:8002'

export async function predictRisk(riskData) {
  try {
    const response = await fetch(
      `${RISK_API_URL}/predict-risk`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(riskData),
      }
    )

    if (!response.ok) {
      const errorText = await response.text()

      throw new Error(
        `Risk API error: ${response.status} ${errorText}`
      )
    }

    return await response.json()
  } catch (error) {
    console.error('Risk prediction failed:', error)
    throw error
  }
}