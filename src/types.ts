import type { Address, Hash, Hex } from 'viem'

// ============================================================================
// Robot Types
// ============================================================================

export interface RobotIdentity {
  /** On-chain robot token ID */
  tokenId: bigint
  /** Hardware hash from TPM/secure enclave */
  hardwareHash: Hash
  /** Hardware public address derived from secure enclave */
  hardwareAddress: Address
  /** Operator wallet address */
  operator: Address
  /** Whether the robot is currently active */
  active: boolean
  /** Registration timestamp (unix seconds) */
  registeredAt: number
}

export interface HardwareAttestation {
  /** Hardware hash (keccak256 of hardware identity) */
  hardwareHash: Hash
  /** Hardware public address */
  hardwareAddress: Address
  /** Signature from hardware private key */
  signature: Hex
  /** Timestamp of attestation */
  timestamp: number
}

export interface RobotRegistrationParams {
  /** Hardware hash from TPM/secure enclave */
  hardwareHash: Hash
  /** Hardware public address */
  hardwareAddress: Address
  /** Signed attestation proving hardware ownership */
  hardwareAttestation: Hex
  /** Initial stake amount in USDC (with 6 decimals) */
  stakeAmount: bigint
}

// ============================================================================
// Attestation Types
// ============================================================================

export type AttestationType =
  | 'movement'
  | 'manipulation'
  | 'perception'
  | 'communication'
  | 'computation'
  | 'custom'

export interface AttestationData {
  /** Type of action being attested */
  actionType: AttestationType
  /** Action-specific data payload */
  payload: Hex
  /** Unix timestamp when action occurred */
  timestamp: number
  /** Optional location data [lat, lng] in fixed point (6 decimals) */
  location?: [number, number]
  /** Optional metadata as JSON string */
  metadata?: string
}

export interface Attestation {
  /** Robot token ID that performed the action */
  robotId: bigint
  /** Keccak256 hash of the attestation data */
  dataHash: Hash
  /** Signature from robot's hardware key */
  signature: Hex
  /** The attestation data */
  data: AttestationData
}

export interface AttestationBatch {
  /** Robot token ID */
  robotId: bigint
  /** Merkle root of all attestations in batch */
  merkleRoot: Hash
  /** Number of attestations in batch */
  count: number
  /** Individual attestations */
  attestations: Attestation[]
  /** Hardware signature over the merkle root */
  signature: Hex
  /** Timestamp of batch creation */
  timestamp: number
}

export interface OnChainAttestation {
  /** Attestation ID on chain */
  id: bigint
  /** Robot token ID */
  robotId: bigint
  /** Merkle root (for batched) or data hash (for single) */
  attestationHash: Hash
  /** Block timestamp */
  timestamp: number
  /** Whether this is a batch or single attestation */
  isBatch: boolean
  /** Number of attestations (1 for single, N for batch) */
  count: number
}

// ============================================================================
// Merkle Types
// ============================================================================

export interface MerkleProof {
  /** Leaf hash being proven */
  leaf: Hash
  /** Sibling hashes from leaf to root */
  proof: Hash[]
  /** Directions for each sibling (true = right, false = left) */
  positions: boolean[]
  /** Index of leaf in original array */
  index: number
}

export interface MerkleTree {
  /** Root hash of the tree */
  root: Hash
  /** All leaves in order */
  leaves: Hash[]
  /** Depth of the tree */
  depth: number
  /** Get proof for a specific leaf index */
  getProof: (index: number) => MerkleProof
  /** Verify a proof against this tree's root */
  verify: (proof: MerkleProof) => boolean
}

// ============================================================================
// Staking Types
// ============================================================================

export interface StakeInfo {
  /** Robot token ID */
  robotId: bigint
  /** Total staked amount */
  amount: bigint
  /** Amount currently locked (pending unstake) */
  lockedAmount: bigint
  /** Unlock timestamp for locked amount */
  unlockTime: number
}

export interface SlashRecord {
  /** Slash ID */
  id: bigint
  /** Robot token ID */
  robotId: bigint
  /** Amount slashed */
  amount: bigint
  /** Reason for slash */
  reason: string
  /** Reporter address (if any) */
  reporter: Address
  /** Timestamp of slash */
  timestamp: number
}

// ============================================================================
// SDK Configuration
// ============================================================================

export interface FlectraConfig {
  /** Chain ID (8453 for Base mainnet, 84532 for Base Sepolia) */
  chainId: number
  /** RobotID contract address */
  robotIdAddress: Address
  /** AttestationRegistry contract address */
  attestationRegistryAddress: Address
  /** FlectraStaking contract address */
  stakingAddress: Address
  /** USDC token address */
  usdcAddress: Address
  /** RPC URL */
  rpcUrl: string
}

export interface FlectraClientOptions {
  /** SDK configuration */
  config: FlectraConfig
  /** Hardware signer function (signs with TPM/secure enclave key) */
  hardwareSigner?: (message: Hash) => Promise<Hex>
  /** Operator wallet private key or signer */
  operatorPrivateKey?: Hex
}

// ============================================================================
// Contract Addresses (Base Sepolia Testnet)
// ============================================================================

export const BASE_SEPOLIA_ADDRESSES = {
  robotId: '0x3b0fCF2D21643cB347E006A289Ee64d3f3e08415' as Address,
  attestationRegistry: '0x1ae2aA8C70400e5be3C12aE7B93ae33Af9D14d92' as Address,
  staking: '0xB452e082ba744C22D506Dcf2DaaEd21A490d1598' as Address,
  usdc: '0x036CbD53842c5426634e7929541eC2318f3dCF7e' as Address, // Base Sepolia USDC
} as const

// Note: Mainnet addresses will be updated after mainnet deployment
export const BASE_MAINNET_ADDRESSES = {
  robotId: '0x0000000000000000000000000000000000000000' as Address,
  attestationRegistry: '0x0000000000000000000000000000000000000000' as Address,
  staking: '0x0000000000000000000000000000000000000000' as Address,
  usdc: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913' as Address, // Base USDC
} as const
