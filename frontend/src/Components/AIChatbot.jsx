
import { useEffect, useState } from 'react'
import { useRisk } from '../context/RiskContext'
import { useWallet } from '../context/WalletContext'

const suggestedQuestions = [
  'What is my risk level?',
  'What are my risk factors?',
  'What is my current debt?',
  'How can I improve my risk?',
  'What is my Health Factor?',
  'What is LTV?',
  'How does collateral work?',
  'What is liquidation?',
  'How do I repay my loan?',
]

function getAnswer(question) {
  const q = question.toLowerCase()

  if (q.includes('ltv') || q.includes('loan-to-value')) {
    return 'LTV (Loan-to-Value) is the ratio of your borrowed amount to your collateral value. Your lending protocol has a maximum LTV of 70%. A lower LTV generally means a safer borrowing position.'
  }

  if (q.includes('collateral') || q.includes('eth')) {
    return 'Collateral is the ETH you deposit to secure your loan. The protocol uses its USD value to calculate your borrowing limit. Withdrawing collateral may reduce your borrowing safety, so check your position before withdrawing.'
  }

  if (q.includes('liquidat')) {
    return 'Liquidation is a risk when a borrowing position no longer meets the protocol’s safety requirements. Falling collateral prices or increasing debt can make a position less safe. Monitor your Health Factor and keep a safety buffer.'
  }

  if (q.includes('repay') || q.includes('payment') || q.includes('debt')) {
    return 'Open the Repay page to repay your outstanding USDC debt. Make sure you have enough USDC and approve the token allowance if requested. Review the amount carefully before confirming the transaction in MetaMask.'
  }

  if (q.includes('health factor') || q.includes('health')) {
    return 'The Health Factor indicates how safely your collateral supports your debt. A higher value generally means a safer position. A value approaching 1 indicates increased risk. Check the value displayed by your protocol.'
  }

  if (q.includes('borrow') || q.includes('loan') || q.includes('maximum')) {
    return 'Open the Borrow page to view your borrowing limit. The protocol uses your collateral value and its 70% maximum LTV rule. Your actual available amount can be lower depending on your existing debt.'
  }

  if (q.includes('interest')) {
    return 'Interest is the additional amount accrued on your outstanding debt over time. Check the Repay and Risk Analysis pages for your current debt and accrued interest.'
  }

  if (q.includes('risk') || q.includes('score')) {
    return 'Open Risk Analysis to view your lending metrics and the Random Forest model’s risk classification. Treat the AI result as an estimate, not a guarantee of safety. Always check your Health Factor and current debt.'
  }

  if (q.includes('supply') || q.includes('deposit')) {
    return 'Open the Lend page to supply ETH collateral. Review the amount, confirm the transaction in MetaMask, and wait for blockchain confirmation before relying on the updated balance.'
  }

  if (q.includes('wallet') || q.includes('metamask') || q.includes('network')) {
    return 'Connect your wallet and switch MetaMask to Sepolia, the test network used by this project. Transactions require test ETH for gas. Never share your recovery phrase or private key.'
  }

  return 'I can help explain LTV, collateral, borrowing, repayment, interest, Health Factor, liquidation, and AI risk results. Try one of the suggested questions below. I cannot execute transactions or guarantee that a lending position is safe.'
}

export default function AIChatbot() {
  const { riskData } = useRisk()
  const { walletAddress } = useWallet()

  const [isOpen, setIsOpen] = useState(false)
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      text: 'Hi! I’m your DeFi Lending Assistant. Ask me about collateral, borrowing, repayment, or lending risk.',
    },
  ])

  useEffect(() => {
    setMessages([
      {
        role: 'assistant',
        text: 'Hi! I’m your DeFi Lending Assistant. Ask me about collateral, borrowing, repayment, or lending risk.',
      },
    ])
  }, [walletAddress])


  function getPersonalizedAnswer(question) {
    const q = question.toLowerCase()

    const asksPersonalRisk =
      q.includes('my risk') ||
      q.includes('my loan') ||
      q.includes('current loan risk') ||
      q.includes('current risk level') ||
      q.includes('current risk score') ||
      q.includes('how risky is my') ||
      q.includes('risk factors for my') ||
      q.includes('my risk factor') ||
      q.includes('improve my risk') ||
      q.includes('my debt') ||
      q.includes('current debt') ||
      q.includes('how much do i owe') ||
      q.includes('how much have i borrowed') ||
      q.includes('my interest') ||
      q.includes('interest on my loan') ||
      q.includes('my health factor') ||
      q.includes('current health factor') ||
      q.includes('my ltv') ||
      q.includes('current ltv') ||
      q.includes('my loan-to-value') ||
      q.includes('my eth') ||
      q.includes('my collateral') ||
      q.includes('current collateral') ||
      q.includes('value of my collateral')

    if (!asksPersonalRisk) return null

    if (!walletAddress) {
      return 'Connect your wallet to view personalized risk results. I can still explain general lending concepts.'
    }

    if (
      !riskData ||
      !riskData.walletAddress ||
      riskData.walletAddress.toLowerCase() !== walletAddress.toLowerCase()
    ) {
      return 'No current risk results are available for this wallet. Open Risk Analysis and run the analysis first.'
    }

    if (
      q.includes('risk factor') ||
      q.includes('recommendation') ||
      q.includes('improve my risk') ||
      q.includes('why') ||
      q.includes('high risk')
    ) {
      const factors = riskData.riskFactors.length
        ? riskData.riskFactors.join(' ')
        : 'The model did not return specific risk-factor messages.'

      const isAskingWhyHigh = q.includes('why') && q.includes('high')
      const riskExplanation =
        isAskingWhyHigh &&
        !riskData.riskLevel.toLowerCase().includes('high')
          ? `Your current classification is ${riskData.riskLevel}, with a score of ${riskData.riskScore}/100. The model is not currently classifying your position as high risk.`
          : `Your current classification is ${riskData.riskLevel}, with a score of ${riskData.riskScore}/100.`

      return `${riskExplanation} Risk signals: ${factors} Recommendation: ${riskData.recommendation || 'Review your collateral, debt, LTV and Health Factor.'} This model estimate does not guarantee safety.`
    }

    if (
      q.includes('my risk') ||
      q.includes('risk level') ||
      q.includes('risk score') ||
      q.includes('how risky') ||
      q.includes('current loan risk') ||
      q.includes('my loan risk')
    ) {
      return `Your latest AI risk classification is ${riskData.riskLevel}, with a score of ${riskData.riskScore}/100. This is an estimate, not a guarantee of safety.`
    }

    if (
      q.includes('my debt') ||
      q.includes('current debt') ||
      q.includes('how much do i owe') ||
      q.includes('borrowed')
    ) {
      return `Your original borrowed amount is ${riskData.principalBorrowedUSDC.toFixed(6)} USDC. Your current debt is ${riskData.currentDebtUSDC.toFixed(6)} USDC, including approximately ${riskData.interestUSDC.toFixed(6)} USDC in accrued interest.`
    }

    if (q.includes('interest')) {
      return `Your accrued interest is approximately ${riskData.interestUSDC.toFixed(6)} USDC. Your current debt is ${riskData.currentDebtUSDC.toFixed(6)} USDC. Confirm the repayment amount on the Repay page before submitting a transaction.`
    }

    if (q.includes('health factor')) {
      const health = Number.isFinite(riskData.healthFactor)
        ? riskData.healthFactor.toFixed(2)
        : 'Not available'

      return `Your reported Health Factor is ${health}. This is a protocol-specific metric; it does not guarantee liquidation safety.`
    }

    if (
      q.includes('my ltv') ||
      q.includes('current ltv') ||
      q.includes('loan-to-value')
    ) {
      return `Your current LTV is ${riskData.ltvPercent.toFixed(2)}%. The configured maximum LTV is 70%, so keeping a buffer below that limit is prudent.`
    }

   if (
  q.includes('my eth') ||
  q.includes('my collateral') ||
  q.includes('current collateral') ||
  q.includes('collateral value')
) {
      return `Your recorded collateral is ${riskData.collateralETH.toFixed(6)} ETH, valued at $${riskData.collateralUSD.toFixed(2)} according to the latest risk analysis.`
    }

    return null
  }


  function sendMessage(text = input) {
    const question = text.trim()
    if (!question) return

    const answer =
      getPersonalizedAnswer(question) ?? getAnswer(question)

    setMessages((previous) => [
      ...previous,
      { role: 'user', text: question },
      { role: 'assistant', text: answer },
    ])
    setInput('')
  }

  return (
    <div className="ai-chatbot">
      {isOpen && (
        <section
          className="ai-chat-window"
          aria-label="DeFi Lending Assistant"
        >
          <header className="ai-chat-header">
            <div>
              <strong>DeFi Assistant</strong>
              <small> Lending guidance</small>
            </div>

            <button
              type="button"
              className="ai-chat-close"
              onClick={() => setIsOpen(false)}
              aria-label="Close chat"
            >
              ×
            </button>
          </header>

          <div className="ai-chat-messages" aria-live="polite">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`ai-chat-message ${
                  message.role === 'user' ? 'user' : 'assistant'
                }`}
              >
                {message.text}
              </div>
            ))}
          </div>

          <div className="ai-chat-suggestions">
            {suggestedQuestions.map((question) => (
              <button
                type="button"
                key={question}
                onClick={() => sendMessage(question)}
              >
                {question}
              </button>
            ))}
          </div>

          <form
            className="ai-chat-form"
            onSubmit={(event) => {
              event.preventDefault()
              sendMessage()
            }}
          >
            <input
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Ask a lending question..."
              aria-label="Ask a lending question"
            />
            <button type="submit" disabled={!input.trim()}>
              Send
            </button>
          </form>
        </section>
      )}

      <button
        type="button"
        className="ai-chat-toggle"
        onClick={() => setIsOpen((open) => !open)}
        aria-label={isOpen ? 'Close assistant' : 'Open AI assistant'}
      >
        {isOpen ? '×' : '✦ AI Help'}
      </button>
    </div>
  )
}
