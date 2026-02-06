import {
  keccak256,
  encodeAbiParameters,
  toHex,
  type Address,
  type Hash,
  type Hex,
} from 'viem'
import type { HardwareAttestation, RobotIdentity } from '../types.js'

/**
 * Generates a hardware hash from hardware identity data
 * This should be called with data from the TPM/secure enclave
 *
 * @param hardwareId - Unique hardware identifier bytes
 * @param manufacturerId - Manufacturer identifier
 * @param modelId - Model identifier
 * @returns Keccak256 hash of the hardware identity
 *
 * @example
 * ```ts
 * import { generateHardwareHash } from '@flectra/sdk/robot'
 *
 * const hardwareHash = generateHardwareHash(
 *   '0x...', // TPM public key or unique ID
 *   'ACME_ROBOTICS',
 *   'MODEL_X1'
 * )
 * ```
 */
export function generateHardwareHash(
  hardwareId: Hex,
  manufacturerId: string,
  modelId: string
): Hash {
  const manufacturerBytes = toHex(new TextEncoder().encode(manufacturerId))
  const modelBytes = toHex(new TextEncoder().encode(modelId))

  return keccak256(
    encodeAbiParameters(
      [
        { type: 'bytes', name: 'hardwareId' },
        { type: 'bytes', name: 'manufacturerId' },
        { type: 'bytes', name: 'modelId' },
      ],
      [hardwareId, manufacturerBytes as Hex, modelBytes as Hex]
    )
  )
}

/**
 * Creates the message to be signed for hardware attestation
 * This proves ownership of the hardware private key
 *
 * @param hardwareHash - The hardware hash
 * @param hardwareAddress - The hardware public address
 * @param operator - The operator wallet address
 * @param nonce - Current nonce from the RobotID contract
 * @returns Message hash to be signed
 */
export function createHardwareAttestationMessage(
  hardwareHash: Hash,
  hardwareAddress: Address,
  operator: Address,
  nonce: bigint
): Hash {
  return keccak256(
    encodeAbiParameters(
      [
        { type: 'bytes32', name: 'hardwareHash' },
        { type: 'address', name: 'hardwareAddress' },
        { type: 'address', name: 'operator' },
        { type: 'uint256', name: 'nonce' },
      ],
      [hardwareHash, hardwareAddress, operator, nonce]
    )
  )
}

/**
 * Creates a hardware attestation for robot registration
 *
 * @param hardwareHash - The hardware hash
 * @param hardwareAddress - The hardware public address
 * @param operator - The operator wallet address
 * @param nonce - Current nonce from the RobotID contract
 * @param signer - Function to sign with the hardware private key
 * @returns Hardware attestation with signature
 */
export async function createHardwareAttestation(
  hardwareHash: Hash,
  hardwareAddress: Address,
  operator: Address,
  nonce: bigint,
  signer: (message: Hash) => Promise<Hex>
): Promise<HardwareAttestation> {
  const message = createHardwareAttestationMessage(
    hardwareHash,
    hardwareAddress,
    operator,
    nonce
  )

  const signature = await signer(message)

  return {
    hardwareHash,
    hardwareAddress,
    signature,
    timestamp: Math.floor(Date.now() / 1000),
  }
}

/**
 * Validates that a robot identity is properly formed
 *
 * @param identity - Robot identity to validate
 * @returns true if valid
 */
export function validateRobotIdentity(identity: RobotIdentity): boolean {
  // Check token ID is positive
  if (identity.tokenId <= 0n) {
    return false
  }

  // Check hardware hash is 32 bytes
  if (
    !identity.hardwareHash ||
    identity.hardwareHash.length !== 66 // 0x + 64 hex chars
  ) {
    return false
  }

  // Check addresses are valid (20 bytes + 0x prefix)
  if (
    !identity.hardwareAddress ||
    identity.hardwareAddress.length !== 42 ||
    !identity.operator ||
    identity.operator.length !== 42
  ) {
    return false
  }

  // Check timestamp is reasonable (after 2024)
  if (identity.registeredAt < 1704067200) {
    return false
  }

  return true
}

/**
 * Formats a robot identity for display
 *
 * @param identity - Robot identity
 * @returns Formatted string
 */
export function formatRobotIdentity(identity: RobotIdentity): string {
  const shortHash = `${identity.hardwareHash.slice(0, 10)}...${identity.hardwareHash.slice(-8)}`
  const shortOperator = `${identity.operator.slice(0, 6)}...${identity.operator.slice(-4)}`

  return `Robot #${identity.tokenId} (${shortHash}) - Operator: ${shortOperator}`
}
