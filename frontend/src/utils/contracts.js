import { Contract } from 'ethers'
import lendingPoolArtifact from './LendingPool.json'

// =====================================================
// Contract addresses
// =====================================================

export const LENDING_POOL_ADDRESS =
  '0xc7EF79cA55309fB0C35267142CF771D41e6d9076'

export const MOCK_USDC_ADDRESS = "0x23608f17d934deb9b2bce910b3160690a038ebfa";

// =====================================================
// LendingPool
// =====================================================

export const LENDING_POOL_ABI =
  lendingPoolArtifact.abi

export function getLendingPool(providerOrSigner) {
  return new Contract(
    LENDING_POOL_ADDRESS,
    LENDING_POOL_ABI,
    providerOrSigner
  )
}

// =====================================================
// MockUSDC
// =====================================================

export const MOCK_USDC_ABI = [
  'function balanceOf(address account) view returns (uint256)',
  'function approve(address spender, uint256 amount) returns (bool)',
  'function allowance(address owner, address spender) view returns (uint256)',
  'function decimals() view returns (uint8)'
]

export function getMockUSDC(providerOrSigner) {
  return new Contract(
    MOCK_USDC_ADDRESS,
    MOCK_USDC_ABI,
    providerOrSigner
)
}
