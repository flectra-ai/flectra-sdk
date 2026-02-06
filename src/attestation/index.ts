export {
  AttestationBuilder,
  BatchBuilder,
  createAttestation,
  createBatch,
  type HardwareSigner,
} from './builder.js'

export {
  encodeAttestationData,
  hashAttestationData,
  createAttestationSigningMessage,
  createBatchSigningMessage,
} from './encode.js'

export type {
  Attestation,
  AttestationBatch,
  AttestationData,
  AttestationType,
  OnChainAttestation,
} from '../types.js'
