// Main client
export { FlectraClient } from './contracts/client.js'

// Robot module
export {
  generateHardwareHash,
  createHardwareAttestationMessage,
  createHardwareAttestation,
  validateRobotIdentity,
  formatRobotIdentity,
} from './robot/index.js'

// Attestation module
export {
  AttestationBuilder,
  BatchBuilder,
  createAttestation,
  createBatch,
  encodeAttestationData,
  hashAttestationData,
  createAttestationSigningMessage,
  createBatchSigningMessage,
  type HardwareSigner,
} from './attestation/index.js'

// Merkle module
export {
  buildMerkleTree,
  verifyMerkleProof,
  computeMerkleRoot,
  hashLeaf,
} from './merkle/index.js'

// Contract ABIs
export {
  RobotIdAbi,
  AttestationRegistryAbi,
  FlectraStakingAbi,
  ERC20Abi,
} from './contracts/abis.js'

// Utilities
export {
  formatUsdc,
  parseUsdc,
  shortenAddress,
  shortenHash,
  isValidAddress,
  isValidHash,
  isValidHex,
  formatTrustScore,
  getTrustScoreLabel,
  delay,
  retry,
} from './utils/index.js'

// Types
export type {
  // Robot types
  RobotIdentity,
  HardwareAttestation,
  RobotRegistrationParams,
  // Attestation types
  AttestationType,
  AttestationData,
  Attestation,
  AttestationBatch,
  OnChainAttestation,
  // Merkle types
  MerkleProof,
  MerkleTree,
  // Staking types
  StakeInfo,
  SlashRecord,
  // Config types
  FlectraConfig,
  FlectraClientOptions,
} from './types.js'

// Constants
export {
  BASE_SEPOLIA_ADDRESSES,
  BASE_MAINNET_ADDRESSES,
} from './types.js'

// Pre-configured configs
import type { FlectraConfig } from './types.js'
import { BASE_SEPOLIA_ADDRESSES, BASE_MAINNET_ADDRESSES } from './types.js'

/**
 * Pre-configured config for Base Sepolia testnet
 */
export const BASE_SEPOLIA_CONFIG: FlectraConfig = {
  chainId: 84532,
  robotIdAddress: BASE_SEPOLIA_ADDRESSES.robotId,
  attestationRegistryAddress: BASE_SEPOLIA_ADDRESSES.attestationRegistry,
  stakingAddress: BASE_SEPOLIA_ADDRESSES.staking,
  usdcAddress: BASE_SEPOLIA_ADDRESSES.usdc,
  rpcUrl: 'https://sepolia.base.org',
}

/**
 * Pre-configured config for Base mainnet
 */
export const BASE_MAINNET_CONFIG: FlectraConfig = {
  chainId: 8453,
  robotIdAddress: BASE_MAINNET_ADDRESSES.robotId,
  attestationRegistryAddress: BASE_MAINNET_ADDRESSES.attestationRegistry,
  stakingAddress: BASE_MAINNET_ADDRESSES.staking,
  usdcAddress: BASE_MAINNET_ADDRESSES.usdc,
  rpcUrl: 'https://mainnet.base.org',
}
