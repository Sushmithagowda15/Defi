import { createContext, useContext, useState } from 'react'
import { connectWallet } from '../blockchain/web3'

const WalletContext = createContext(null)

export function WalletProvider({ children }) {
  const [walletAddress, setWalletAddress] = useState('')
  const [walletError, setWalletError] = useState('')

  const handleConnectWallet = async () => {
    try {
      setWalletError('')

      const wallet = await connectWallet()

      setWalletAddress(wallet.address)

      return wallet
    } catch (error) {
      console.error(error)
      setWalletError(error.message)
      throw error
    }
  }

  const disconnectWallet = () => {
    setWalletAddress('')
    setWalletError('')
  }

  return (
    <WalletContext.Provider
      value={{
        walletAddress,
        walletError,
        connectWallet: handleConnectWallet,
        disconnectWallet,
      }}
    >
      {children}
    </WalletContext.Provider>
  )
}

export function useWallet() {
  const context = useContext(WalletContext)

  if (!context) {
    throw new Error(
      'useWallet must be used inside WalletProvider'
    )
  }

  return context
}