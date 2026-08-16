import { BrowserProvider, formatEther } from 'ethers'

const SEPOLIA_CHAIN_ID = '0xaa36a7'

export async function connectWallet() {
  if (!window.ethereum) {
    throw new Error('MetaMask is not installed')
  }

  // Ask MetaMask to switch to Sepolia
  try {
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: SEPOLIA_CHAIN_ID }]
    })
  } catch (error) {
    console.error('Network switch error:', error)

    throw new Error(
      'Please switch MetaMask to Sepolia and try again.'
    )
  }

  const provider = new BrowserProvider(window.ethereum)

  // Connect to MetaMask
  const accounts = await provider.send('eth_requestAccounts', [])

  if (!accounts || accounts.length === 0) {
    throw new Error('No wallet account found')
  }

  const address = accounts[0]

  // Get network AFTER switching
  const network = await provider.getNetwork()
  const chainId = network.chainId.toString()

  console.log('Network:', network.name)
  console.log('Chain ID:', chainId)
  console.log('Wallet:', address)

  // Confirm Sepolia
  if (chainId !== '11155111') {
    throw new Error(
      'Wrong network. Please switch MetaMask to Sepolia.'
    )
  }

  // Get Sepolia ETH balance
  const balanceWei = await provider.getBalance(address)
  const balance = formatEther(balanceWei)

  console.log('Sepolia ETH Balance:', balance)

  return {
    provider,
    address,
    chainId,
    balance
  }
}