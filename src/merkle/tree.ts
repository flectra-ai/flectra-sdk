import { keccak256, concat, type Hash, type Hex } from 'viem'
import type { MerkleTree, MerkleProof } from '../types.js'

/**
 * Sorts two hashes and concatenates them for consistent tree construction
 */
function sortAndConcat(a: Hash, b: Hash): Hex {
  return a < b ? concat([a, b]) : concat([b, a])
}

/**
 * Computes parent hash from two child hashes
 */
function hashPair(a: Hash, b: Hash): Hash {
  return keccak256(sortAndConcat(a, b))
}

/**
 * Builds a Merkle tree from an array of leaf hashes
 *
 * @param leaves - Array of leaf hashes (will be sorted for consistency)
 * @returns MerkleTree object with root, leaves, and proof generation
 *
 * @example
 * ```ts
 * import { buildMerkleTree } from '@flectra/sdk/merkle'
 * import { keccak256, toHex } from 'viem'
 *
 * const leaves = [
 *   keccak256(toHex('attestation1')),
 *   keccak256(toHex('attestation2')),
 *   keccak256(toHex('attestation3')),
 * ]
 *
 * const tree = buildMerkleTree(leaves)
 * console.log('Root:', tree.root)
 *
 * const proof = tree.getProof(0)
 * console.log('Valid:', tree.verify(proof))
 * ```
 */
export function buildMerkleTree(leaves: Hash[]): MerkleTree {
  if (leaves.length === 0) {
    throw new Error('Cannot build Merkle tree with no leaves')
  }

  // Store original leaves
  const originalLeaves = [...leaves]

  // Single leaf case - root is the leaf itself
  if (leaves.length === 1) {
    const root = leaves[0]!
    return {
      root,
      leaves: originalLeaves,
      depth: 0,
      getProof: (index: number) => {
        if (index !== 0) throw new Error('Invalid leaf index: ' + index)
        return { leaf: root, proof: [], positions: [], index: 0 }
      },
      verify: (proof: MerkleProof) => proof.leaf === root && proof.proof.length === 0,
    }
  }

  // If odd number of leaves, duplicate the last one
  const workingLeaves = [...leaves]
  if (workingLeaves.length % 2 === 1) {
    workingLeaves.push(workingLeaves[workingLeaves.length - 1]!)
  }

  // Build tree layers from bottom to top
  const layers: Hash[][] = [workingLeaves]

  while (layers[layers.length - 1]!.length > 1) {
    const currentLayer = layers[layers.length - 1]!
    const nextLayer: Hash[] = []

    for (let i = 0; i < currentLayer.length; i += 2) {
      const left = currentLayer[i]!
      const right = currentLayer[i + 1] ?? left
      nextLayer.push(hashPair(left, right))
    }

    layers.push(nextLayer)
  }

  const root = layers[layers.length - 1]![0]!
  const depth = layers.length - 1

  /**
   * Generates a Merkle proof for a leaf at the given index
   */
  function getProof(index: number): MerkleProof {
    if (index < 0 || index >= originalLeaves.length) {
      throw new Error(`Invalid leaf index: ${index}`)
    }

    const proof: Hash[] = []
    const positions: boolean[] = []
    let currentIndex = index

    for (let i = 0; i < depth; i++) {
      const layer = layers[i]!
      const isRightNode = currentIndex % 2 === 1
      const siblingIndex = isRightNode ? currentIndex - 1 : currentIndex + 1

      if (siblingIndex < layer.length) {
        proof.push(layer[siblingIndex]!)
        positions.push(!isRightNode) // true if sibling is on the right
      } else {
        // If no sibling (odd layer), use the current node
        proof.push(layer[currentIndex]!)
        positions.push(true)
      }

      currentIndex = Math.floor(currentIndex / 2)
    }

    return {
      leaf: originalLeaves[index]!,
      proof,
      positions,
      index,
    }
  }

  /**
   * Verifies a Merkle proof against the tree's root
   */
  function verify(proofData: MerkleProof): boolean {
    let computedHash = proofData.leaf

    for (let i = 0; i < proofData.proof.length; i++) {
      const sibling = proofData.proof[i]!
      const isRight = proofData.positions[i]!

      computedHash = isRight
        ? hashPair(computedHash, sibling)
        : hashPair(sibling, computedHash)
    }

    return computedHash === root
  }

  return {
    root,
    leaves: originalLeaves,
    depth,
    getProof,
    verify,
  }
}

/**
 * Verifies a Merkle proof against a known root
 *
 * @param root - Expected Merkle root
 * @param proof - The proof to verify
 * @returns true if the proof is valid
 */
export function verifyMerkleProof(root: Hash, proof: MerkleProof): boolean {
  let computedHash = proof.leaf

  for (let i = 0; i < proof.proof.length; i++) {
    const sibling = proof.proof[i]!
    const isRight = proof.positions[i]!

    computedHash = isRight
      ? hashPair(computedHash, sibling)
      : hashPair(sibling, computedHash)
  }

  return computedHash === root
}

/**
 * Computes the Merkle root from an array of leaf hashes
 * More efficient than building full tree if you only need the root
 *
 * @param leaves - Array of leaf hashes
 * @returns The Merkle root hash
 */
export function computeMerkleRoot(leaves: Hash[]): Hash {
  if (leaves.length === 0) {
    throw new Error('Cannot compute Merkle root with no leaves')
  }

  if (leaves.length === 1) {
    return leaves[0]!
  }

  // If odd number of leaves, duplicate the last one
  const workingLeaves = [...leaves]
  if (workingLeaves.length % 2 === 1) {
    workingLeaves.push(workingLeaves[workingLeaves.length - 1]!)
  }

  // Iteratively compute parents until we reach the root
  let currentLayer = workingLeaves

  while (currentLayer.length > 1) {
    const nextLayer: Hash[] = []

    for (let i = 0; i < currentLayer.length; i += 2) {
      const left = currentLayer[i]!
      const right = currentLayer[i + 1] ?? left
      nextLayer.push(hashPair(left, right))
    }

    currentLayer = nextLayer
  }

  return currentLayer[0]!
}

/**
 * Computes the hash of a leaf for inclusion in the Merkle tree
 * Uses double hashing to prevent second preimage attacks
 *
 * @param data - The data to hash
 * @returns The leaf hash
 */
export function hashLeaf(data: Hex): Hash {
  return keccak256(keccak256(data))
}
