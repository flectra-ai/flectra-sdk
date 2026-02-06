import {
  encodeAbiParameters,
  keccak256,
  toHex,
  type Hash,
  type Hex,
} from 'viem'
import type { AttestationData, AttestationType } from '../types.js'

/**
 * Action type to numeric ID mapping for on-chain encoding
 */
const ACTION_TYPE_IDS: Record<AttestationType, number> = {
  movement: 1,
  manipulation: 2,
  perception: 3,
  communication: 4,
  computation: 5,
  custom: 255,
}

/**
 * Encodes attestation data into a bytes payload for hashing
 *
 * @param data - The attestation data to encode
 * @returns Encoded bytes
 */
export function encodeAttestationData(data: AttestationData): Hex {
  const actionTypeId = ACTION_TYPE_IDS[data.actionType]

  // Encode location as fixed-point integers (6 decimals)
  const lat = data.location ? Math.round(data.location[0] * 1e6) : 0
  const lng = data.location ? Math.round(data.location[1] * 1e6) : 0

  // Encode metadata as bytes
  const metadataBytes = data.metadata
    ? toHex(new TextEncoder().encode(data.metadata))
    : '0x'

  return encodeAbiParameters(
    [
      { type: 'uint8', name: 'actionType' },
      { type: 'bytes', name: 'payload' },
      { type: 'uint64', name: 'timestamp' },
      { type: 'int64', name: 'latitude' },
      { type: 'int64', name: 'longitude' },
      { type: 'bytes', name: 'metadata' },
    ],
    [
      actionTypeId,
      data.payload,
      BigInt(data.timestamp),
      BigInt(lat),
      BigInt(lng),
      metadataBytes as Hex,
    ]
  )
}

/**
 * Computes the hash of attestation data
 *
 * @param data - The attestation data
 * @returns Keccak256 hash of the encoded data
 */
export function hashAttestationData(data: AttestationData): Hash {
  const encoded = encodeAttestationData(data)
  return keccak256(encoded)
}

/**
 * Creates the signing message for an attestation
 * Format: keccak256(robotId || dataHash || timestamp)
 *
 * @param robotId - Robot token ID
 * @param dataHash - Hash of attestation data
 * @param timestamp - Timestamp of signing
 * @returns Hash to be signed by hardware key
 */
export function createAttestationSigningMessage(
  robotId: bigint,
  dataHash: Hash,
  timestamp: number
): Hash {
  return keccak256(
    encodeAbiParameters(
      [
        { type: 'uint256', name: 'robotId' },
        { type: 'bytes32', name: 'dataHash' },
        { type: 'uint64', name: 'timestamp' },
      ],
      [robotId, dataHash, BigInt(timestamp)]
    )
  )
}

/**
 * Creates the signing message for a batch attestation
 * Format: keccak256(robotId || merkleRoot || count || timestamp)
 *
 * @param robotId - Robot token ID
 * @param merkleRoot - Merkle root of all attestation hashes
 * @param count - Number of attestations in batch
 * @param timestamp - Timestamp of batch creation
 * @returns Hash to be signed by hardware key
 */
export function createBatchSigningMessage(
  robotId: bigint,
  merkleRoot: Hash,
  count: number,
  timestamp: number
): Hash {
  return keccak256(
    encodeAbiParameters(
      [
        { type: 'uint256', name: 'robotId' },
        { type: 'bytes32', name: 'merkleRoot' },
        { type: 'uint32', name: 'count' },
        { type: 'uint64', name: 'timestamp' },
      ],
      [robotId, merkleRoot, count, BigInt(timestamp)]
    )
  )
}

/**
 * Decodes attestation data from bytes
 *
 * @param encoded - Encoded attestation bytes
 * @returns Decoded attestation data
 */
export function decodeAttestationData(encoded: Hex): AttestationData {
  // Manual decoding since we need to handle the structure
  // This is a simplified version - production would use proper ABI decoding

  // For now, throw as this requires more complex parsing
  throw new Error('decodeAttestationData not yet implemented')
}
