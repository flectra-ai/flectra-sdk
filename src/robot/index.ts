export {
  generateHardwareHash,
  createHardwareAttestationMessage,
  createHardwareAttestation,
  validateRobotIdentity,
  formatRobotIdentity,
} from './identity.js'

export type {
  RobotIdentity,
  HardwareAttestation,
  RobotRegistrationParams,
} from '../types.js'
