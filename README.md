# @flectra/sdk

TypeScript SDK for the Flectra robot attestation protocol.

## Installation

```bash
npm install @flectra/sdk
```

## Quick Start

```typescript
import {
  FlectraClient,
  BatchBuilder,
  BASE_SEPOLIA_CONFIG,
} from '@flectra/sdk'

// Initialize client
const client = new FlectraClient({
  config: BASE_SEPOLIA_CONFIG,
  operatorPrivateKey: '0x...', // Your operator wallet
  hardwareSigner: async (message) => {
    // Sign with TPM/secure enclave
    return signature
  },
})

// Create attestation batch
const batch = new BatchBuilder(robotId, hardwareSigner)

await batch.addAttestation({
  actionType: 'movement',
  payload: '0x...',
  timestamp: Math.floor(Date.now() / 1000),
  location: [37.7749, -122.4194],
})

await batch.addAttestation({
  actionType: 'manipulation',
  payload: '0x...',
  timestamp: Math.floor(Date.now() / 1000),
})

// Build and submit
const attestationBatch = await batch.build()
const txHash = await client.submitBatch(attestationBatch)
await client.waitForTransaction(txHash)
```

## Features

### Robot Identity

```typescript
import {
  generateHardwareHash,
  createHardwareAttestation,
} from '@flectra/sdk'

// Generate hardware hash from TPM data
const hardwareHash = generateHardwareHash(
  tpmPublicKey,
  'ACME_ROBOTICS',
  'MODEL_X1'
)

// Create attestation for registration
const attestation = await createHardwareAttestation(
  hardwareHash,
  hardwareAddress,
  operatorAddress,
  nonce,
  tpmSigner
)
```

### Attestation Generation

```typescript
import { AttestationBuilder, createAttestation } from '@flectra/sdk'

// Using builder pattern
const builder = new AttestationBuilder(robotId, hardwareSigner)
const attestation = await builder
  .setAction('movement', movementPayload)
  .setLocation(37.7749, -122.4194)
  .setMetadata({ speed: 1.5, direction: 'north' })
  .build()

// Direct creation
const attestation = await createAttestation(
  robotId,
  {
    actionType: 'perception',
    payload: sensorData,
    timestamp: Date.now() / 1000,
  },
  hardwareSigner
)
```

### Merkle Tree Batching

```typescript
import { buildMerkleTree, verifyMerkleProof } from '@flectra/sdk'

// Build tree from attestation hashes
const leaves = attestations.map(a => a.dataHash)
const tree = buildMerkleTree(leaves)

console.log('Merkle Root:', tree.root)

// Generate proof for specific attestation
const proof = tree.getProof(0)

// Verify proof
const isValid = tree.verify(proof)
// Or verify against known root
const isValid = verifyMerkleProof(knownRoot, proof)
```

### On-Chain Publishing

```typescript
// Submit single attestation
const txHash = await client.submitAttestation(attestation)

// Submit batch (more gas efficient)
const txHash = await client.submitBatch(batch)

// Wait for confirmation
const receipt = await client.waitForTransaction(txHash)
```

### Staking

```typescript
// Check stake
const stakeInfo = await client.getStake(robotId)
console.log('Staked:', formatUsdc(stakeInfo.amount))

// Add stake
await client.stake(robotId, parseUsdc('100'))

// Initiate unstake (starts lock period)
await client.initiateUnstake(robotId, parseUsdc('50'))

// Complete unstake (after lock period)
await client.completeUnstake(robotId)
```

## API Reference

### FlectraClient

Main client for interacting with Flectra protocol contracts.

#### Constructor Options

```typescript
interface FlectraClientOptions {
  config: FlectraConfig
  hardwareSigner?: (message: Hash) => Promise<Hex>
  operatorPrivateKey?: Hex
}
```

#### Methods

- `getRobot(tokenId)` - Get robot information
- `getOperatorRobots(operator)` - Get all robots for an operator
- `registerRobot(params)` - Register a new robot
- `submitAttestation(attestation)` - Submit single attestation
- `submitBatch(batch)` - Submit attestation batch
- `getAttestation(id)` - Get attestation by ID
- `verifyAttestation(root, proof, leaf)` - Verify merkle proof
- `getStake(robotId)` - Get stake information
- `stake(robotId, amount)` - Stake USDC
- `initiateUnstake(robotId, amount)` - Start unstaking
- `completeUnstake(robotId)` - Complete unstaking

### AttestationBuilder

Builder for creating single attestations.

```typescript
const attestation = await new AttestationBuilder(robotId, signer)
  .setAction(type, payload)
  .setTimestamp(timestamp)
  .setLocation(lat, lng)
  .setMetadata(data)
  .build()
```

### BatchBuilder

Builder for creating batched attestations with Merkle tree.

```typescript
const batch = new BatchBuilder(robotId, signer)
await batch.addAttestation(data1)
await batch.addAttestation(data2)
const result = await batch.build()
```

### Merkle Functions

- `buildMerkleTree(leaves)` - Build complete Merkle tree
- `computeMerkleRoot(leaves)` - Compute root only (more efficient)
- `verifyMerkleProof(root, proof)` - Verify a proof
- `hashLeaf(data)` - Hash data for tree inclusion

### Utility Functions

- `formatUsdc(amount, decimals?)` - Format USDC for display
- `parseUsdc(amount)` - Parse USDC string to bigint
- `shortenAddress(address, chars?)` - Shorten address for display
- `shortenHash(hash, chars?)` - Shorten hash for display
- `formatTrustScore(score)` - Format trust score as percentage
- `getTrustScoreLabel(score)` - Get trust score label

## Types

```typescript
// Attestation types
type AttestationType =
  | 'movement'
  | 'manipulation'
  | 'perception'
  | 'communication'
  | 'computation'
  | 'custom'

interface AttestationData {
  actionType: AttestationType
  payload: Hex
  timestamp: number
  location?: [number, number]
  metadata?: string
}

interface Attestation {
  robotId: bigint
  dataHash: Hash
  signature: Hex
  data: AttestationData
}

interface AttestationBatch {
  robotId: bigint
  merkleRoot: Hash
  count: number
  attestations: Attestation[]
  signature: Hex
  timestamp: number
}
```

## Configuration

### Base Sepolia (Testnet)

```typescript
import { BASE_SEPOLIA_CONFIG } from '@flectra/sdk'

const client = new FlectraClient({
  config: BASE_SEPOLIA_CONFIG,
  // ...
})
```

### Base Mainnet

```typescript
import { BASE_MAINNET_CONFIG } from '@flectra/sdk'

const client = new FlectraClient({
  config: BASE_MAINNET_CONFIG,
  // ...
})
```

### Custom Configuration

```typescript
const config: FlectraConfig = {
  chainId: 84532,
  robotIdAddress: '0x...',
  attestationRegistryAddress: '0x...',
  stakingAddress: '0x...',
  usdcAddress: '0x...',
  rpcUrl: 'https://your-rpc-url',
}
```

## License

MIT
