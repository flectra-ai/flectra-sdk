import type { Hash, Hex } from 'viem'
import type {
  Attestation,
  AttestationBatch,
  AttestationData,
} from '../types.js'
import {
  hashAttestationData,
  createAttestationSigningMessage,
  createBatchSigningMessage,
} from './encode.js'
import { buildMerkleTree, computeMerkleRoot } from '../merkle/tree.js'

export type HardwareSigner = (message: Hash) => Promise<Hex>

/**
 * Builder class for creating individual attestations
 *
 * @example
 * ```ts
 * import { AttestationBuilder } from '@flectra/sdk/attestation'
 *
 * const builder = new AttestationBuilder(robotId, hardwareSigner)
 *
 * const attestation = await builder
 *   .setAction('movement', movementPayload)
 *   .setLocation(37.7749, -122.4194)
 *   .setMetadata({ speed: 1.5 })
 *   .build()
 * ```
 */
export class AttestationBuilder {
  private robotId: bigint
  private signer: HardwareSigner
  private data: Partial<AttestationData> = {}

  constructor(robotId: bigint, signer: HardwareSigner) {
    this.robotId = robotId
    this.signer = signer
  }

  /**
   * Sets the action type and payload
   */
  setAction(
    actionType: AttestationData['actionType'],
    payload: Hex
  ): AttestationBuilder {
    this.data.actionType = actionType
    this.data.payload = payload
    return this
  }

  /**
   * Sets the timestamp (defaults to current time)
   */
  setTimestamp(timestamp: number): AttestationBuilder {
    this.data.timestamp = timestamp
    return this
  }

  /**
   * Sets location data
   */
  setLocation(latitude: number, longitude: number): AttestationBuilder {
    this.data.location = [latitude, longitude]
    return this
  }

  /**
   * Sets metadata (will be JSON stringified if object)
   */
  setMetadata(metadata: string | Record<string, unknown>): AttestationBuilder {
    this.data.metadata =
      typeof metadata === 'string' ? metadata : JSON.stringify(metadata)
    return this
  }

  /**
   * Builds and signs the attestation
   */
  async build(): Promise<Attestation> {
    if (!this.data.actionType || !this.data.payload) {
      throw new Error('Action type and payload are required')
    }

    const timestamp = this.data.timestamp ?? Math.floor(Date.now() / 1000)

    const attestationData: AttestationData = {
      actionType: this.data.actionType,
      payload: this.data.payload,
      timestamp,
      location: this.data.location,
      metadata: this.data.metadata,
    }

    const dataHash = hashAttestationData(attestationData)
    const signingMessage = createAttestationSigningMessage(
      this.robotId,
      dataHash,
      timestamp
    )
    const signature = await this.signer(signingMessage)

    return {
      robotId: this.robotId,
      dataHash,
      signature,
      data: attestationData,
    }
  }

  /**
   * Resets the builder for reuse
   */
  reset(): AttestationBuilder {
    this.data = {}
    return this
  }
}

/**
 * Builder class for creating batched attestations with Merkle tree
 *
 * @example
 * ```ts
 * import { BatchBuilder } from '@flectra/sdk/attestation'
 *
 * const batch = new BatchBuilder(robotId, hardwareSigner)
 *
 * // Add multiple attestations
 * for (const action of actions) {
 *   await batch.addAttestation({
 *     actionType: 'movement',
 *     payload: action.payload,
 *     timestamp: action.timestamp,
 *   })
 * }
 *
 * // Build the batch with Merkle root
 * const attestationBatch = await batch.build()
 * ```
 */
export class BatchBuilder {
  private robotId: bigint
  private signer: HardwareSigner
  private attestations: Attestation[] = []

  constructor(robotId: bigint, signer: HardwareSigner) {
    this.robotId = robotId
    this.signer = signer
  }

  /**
   * Adds a pre-built attestation to the batch
   */
  add(attestation: Attestation): BatchBuilder {
    if (attestation.robotId !== this.robotId) {
      throw new Error('Attestation robot ID does not match batch robot ID')
    }
    this.attestations.push(attestation)
    return this
  }

  /**
   * Creates and adds an attestation from data
   */
  async addAttestation(data: AttestationData): Promise<BatchBuilder> {
    const dataHash = hashAttestationData(data)
    const signingMessage = createAttestationSigningMessage(
      this.robotId,
      dataHash,
      data.timestamp
    )
    const signature = await this.signer(signingMessage)

    this.attestations.push({
      robotId: this.robotId,
      dataHash,
      signature,
      data,
    })

    return this
  }

  /**
   * Returns the current attestation count
   */
  get count(): number {
    return this.attestations.length
  }

  /**
   * Builds the batch with Merkle tree and batch signature
   */
  async build(): Promise<AttestationBatch> {
    if (this.attestations.length === 0) {
      throw new Error('Cannot build batch with no attestations')
    }

    const timestamp = Math.floor(Date.now() / 1000)

    // Build Merkle tree from attestation hashes
    const leaves = this.attestations.map((a) => a.dataHash)
    const tree = buildMerkleTree(leaves)

    // Sign the batch
    const signingMessage = createBatchSigningMessage(
      this.robotId,
      tree.root,
      this.attestations.length,
      timestamp
    )
    const signature = await this.signer(signingMessage)

    return {
      robotId: this.robotId,
      merkleRoot: tree.root,
      count: this.attestations.length,
      attestations: [...this.attestations],
      signature,
      timestamp,
    }
  }

  /**
   * Resets the builder for reuse
   */
  reset(): BatchBuilder {
    this.attestations = []
    return this
  }
}

/**
 * Creates a single attestation without using the builder pattern
 *
 * @param robotId - Robot token ID
 * @param data - Attestation data
 * @param signer - Hardware signing function
 * @returns Signed attestation
 */
export async function createAttestation(
  robotId: bigint,
  data: AttestationData,
  signer: HardwareSigner
): Promise<Attestation> {
  const dataHash = hashAttestationData(data)
  const signingMessage = createAttestationSigningMessage(
    robotId,
    dataHash,
    data.timestamp
  )
  const signature = await signer(signingMessage)

  return {
    robotId,
    dataHash,
    signature,
    data,
  }
}

/**
 * Creates a batch from an array of attestation data
 *
 * @param robotId - Robot token ID
 * @param dataArray - Array of attestation data
 * @param signer - Hardware signing function
 * @returns Signed attestation batch
 */
export async function createBatch(
  robotId: bigint,
  dataArray: AttestationData[],
  signer: HardwareSigner
): Promise<AttestationBatch> {
  if (dataArray.length === 0) {
    throw new Error('Cannot create batch with no attestations')
  }

  const builder = new BatchBuilder(robotId, signer)

  for (const data of dataArray) {
    await builder.addAttestation(data)
  }

  return builder.build()
}
