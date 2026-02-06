import { describe, it, expect } from 'vitest'
import { keccak256, toHex } from 'viem'
import {
  buildMerkleTree,
  verifyMerkleProof,
  computeMerkleRoot,
  hashLeaf,
} from './tree.js'

describe('Merkle Tree', () => {
  describe('buildMerkleTree', () => {
    it('should build tree with single leaf', () => {
      const leaf = keccak256(toHex('test'))
      const tree = buildMerkleTree([leaf])

      expect(tree.root).toBe(leaf)
      expect(tree.leaves).toHaveLength(1)
      expect(tree.depth).toBe(0)
    })

    it('should build tree with two leaves', () => {
      const leaves = [
        keccak256(toHex('leaf1')),
        keccak256(toHex('leaf2')),
      ]
      const tree = buildMerkleTree(leaves)

      expect(tree.leaves).toHaveLength(2)
      expect(tree.depth).toBe(1)
      expect(tree.root).not.toBe(leaves[0])
      expect(tree.root).not.toBe(leaves[1])
    })

    it('should build tree with odd number of leaves', () => {
      const leaves = [
        keccak256(toHex('leaf1')),
        keccak256(toHex('leaf2')),
        keccak256(toHex('leaf3')),
      ]
      const tree = buildMerkleTree(leaves)

      expect(tree.leaves).toHaveLength(3)
      expect(tree.depth).toBe(2)
    })

    it('should build tree with power of 2 leaves', () => {
      const leaves = [
        keccak256(toHex('leaf1')),
        keccak256(toHex('leaf2')),
        keccak256(toHex('leaf3')),
        keccak256(toHex('leaf4')),
      ]
      const tree = buildMerkleTree(leaves)

      expect(tree.leaves).toHaveLength(4)
      expect(tree.depth).toBe(2)
    })

    it('should throw for empty leaves', () => {
      expect(() => buildMerkleTree([])).toThrow('Cannot build Merkle tree with no leaves')
    })
  })

  describe('getProof and verify', () => {
    it('should generate valid proofs for all leaves', () => {
      const leaves = [
        keccak256(toHex('leaf1')),
        keccak256(toHex('leaf2')),
        keccak256(toHex('leaf3')),
        keccak256(toHex('leaf4')),
      ]
      const tree = buildMerkleTree(leaves)

      for (let i = 0; i < leaves.length; i++) {
        const proof = tree.getProof(i)
        expect(proof.leaf).toBe(leaves[i])
        expect(proof.index).toBe(i)
        expect(tree.verify(proof)).toBe(true)
      }
    })

    it('should generate valid proofs for odd leaf count', () => {
      const leaves = [
        keccak256(toHex('a')),
        keccak256(toHex('b')),
        keccak256(toHex('c')),
      ]
      const tree = buildMerkleTree(leaves)

      for (let i = 0; i < leaves.length; i++) {
        const proof = tree.getProof(i)
        expect(tree.verify(proof)).toBe(true)
      }
    })

    it('should throw for invalid index', () => {
      const leaves = [keccak256(toHex('test'))]
      const tree = buildMerkleTree(leaves)

      expect(() => tree.getProof(-1)).toThrow('Invalid leaf index')
      expect(() => tree.getProof(1)).toThrow('Invalid leaf index')
    })
  })

  describe('verifyMerkleProof', () => {
    it('should verify proof against known root', () => {
      const leaves = [
        keccak256(toHex('leaf1')),
        keccak256(toHex('leaf2')),
      ]
      const tree = buildMerkleTree(leaves)
      const proof = tree.getProof(0)

      expect(verifyMerkleProof(tree.root, proof)).toBe(true)
    })

    it('should reject proof with wrong root', () => {
      const leaves = [
        keccak256(toHex('leaf1')),
        keccak256(toHex('leaf2')),
      ]
      const tree = buildMerkleTree(leaves)
      const proof = tree.getProof(0)
      const wrongRoot = keccak256(toHex('wrong'))

      expect(verifyMerkleProof(wrongRoot, proof)).toBe(false)
    })
  })

  describe('computeMerkleRoot', () => {
    it('should compute same root as buildMerkleTree', () => {
      const leaves = [
        keccak256(toHex('leaf1')),
        keccak256(toHex('leaf2')),
        keccak256(toHex('leaf3')),
        keccak256(toHex('leaf4')),
      ]

      const tree = buildMerkleTree(leaves)
      const root = computeMerkleRoot(leaves)

      expect(root).toBe(tree.root)
    })

    it('should throw for empty leaves', () => {
      expect(() => computeMerkleRoot([])).toThrow('Cannot compute Merkle root with no leaves')
    })
  })

  describe('hashLeaf', () => {
    it('should double hash the data', () => {
      const data = toHex('test data')
      const leaf = hashLeaf(data)

      // Should be keccak256(keccak256(data))
      const expected = keccak256(keccak256(data))
      expect(leaf).toBe(expected)
    })
  })
})
