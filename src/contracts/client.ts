import {
  createPublicClient,
  createWalletClient,
  http,
  type Address,
  type Hash,
  type Hex,
  type PublicClient,
  type WalletClient,
  type Chain,
} from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { base, baseSepolia } from 'viem/chains'
import type {
  FlectraConfig,
  FlectraClientOptions,
  RobotIdentity,
  Attestation,
  AttestationBatch,
  StakeInfo,
  OnChainAttestation,
} from '../types.js'
import {
  RobotIdAbi,
  AttestationRegistryAbi,
  FlectraStakingAbi,
  ERC20Abi,
} from './abis.js'

/**
 * Main client for interacting with Flectra protocol
 *
 * @example
 * ```ts
 * import { FlectraClient, BASE_SEPOLIA_CONFIG } from '@flectra/sdk'
 *
 * const client = new FlectraClient({
 *   config: BASE_SEPOLIA_CONFIG,
 *   operatorPrivateKey: '0x...',
 *   hardwareSigner: async (message) => {
 *     // Sign with TPM/secure enclave
 *     return signature
 *   },
 * })
 *
 * // Register a robot
 * const tokenId = await client.registerRobot({
 *   hardwareHash: '0x...',
 *   hardwareAddress: '0x...',
 *   hardwareAttestation: '0x...',
 *   stakeAmount: 100_000_000n, // 100 USDC
 * })
 *
 * // Submit attestations
 * await client.submitBatch(batch)
 * ```
 */
export class FlectraClient {
  public readonly config: FlectraConfig
  public readonly publicClient: PublicClient
  public readonly walletClient: WalletClient | null
  public readonly hardwareSigner: ((message: Hash) => Promise<Hex>) | null

  private chain: Chain

  constructor(options: FlectraClientOptions) {
    this.config = options.config
    this.hardwareSigner = options.hardwareSigner ?? null

    // Determine chain
    this.chain = options.config.chainId === 8453 ? base : baseSepolia

    // Create public client for reading
    this.publicClient = createPublicClient({
      chain: this.chain,
      transport: http(options.config.rpcUrl),
    })

    // Create wallet client for writing (if private key provided)
    if (options.operatorPrivateKey) {
      const account = privateKeyToAccount(options.operatorPrivateKey)
      this.walletClient = createWalletClient({
        account,
        chain: this.chain,
        transport: http(options.config.rpcUrl),
      })
    } else {
      this.walletClient = null
    }
  }

  // ============================================================================
  // Robot ID Methods
  // ============================================================================

  /**
   * Gets robot information by token ID
   */
  async getRobot(tokenId: bigint): Promise<RobotIdentity | null> {
    try {
      const result = await this.publicClient.readContract({
        address: this.config.robotIdAddress,
        abi: RobotIdAbi,
        functionName: 'getRobot',
        args: [tokenId],
      })

      return {
        tokenId,
        operator: result[0],
        hardwareHash: result[1],
        hardwareAddress: result[2],
        registeredAt: Number(result[3]),
        active: result[4],
      }
    } catch {
      return null
    }
  }

  /**
   * Gets robot token ID by hardware hash
   */
  async getTokenIdByHardwareHash(hardwareHash: Hash): Promise<bigint | null> {
    try {
      const tokenId = await this.publicClient.readContract({
        address: this.config.robotIdAddress,
        abi: RobotIdAbi,
        functionName: 'getTokenIdByHardwareHash',
        args: [hardwareHash],
      })
      return tokenId > 0n ? tokenId : null
    } catch {
      return null
    }
  }

  /**
   * Gets all robot token IDs owned by an operator
   */
  async getOperatorRobots(operator: Address): Promise<bigint[]> {
    const robots = await this.publicClient.readContract({
      address: this.config.robotIdAddress,
      abi: RobotIdAbi,
      functionName: 'getOperatorRobots',
      args: [operator],
    })
    return [...robots]
  }

  /**
   * Gets the current registration nonce
   */
  async getRegistrationNonce(): Promise<bigint> {
    return this.publicClient.readContract({
      address: this.config.robotIdAddress,
      abi: RobotIdAbi,
      functionName: 'registrationNonce',
    })
  }

  /**
   * Registers a new robot
   */
  async registerRobot(params: {
    hardwareHash: Hash
    hardwareAddress: Address
    hardwareAttestation: Hex
  }): Promise<Hash> {
    if (!this.walletClient) {
      throw new Error('Wallet client required for write operations')
    }

    const hash = await this.walletClient.writeContract({
      chain: this.chain,
      address: this.config.robotIdAddress,
      abi: RobotIdAbi,
      functionName: 'registerRobot',
      args: [params.hardwareHash, params.hardwareAddress, params.hardwareAttestation],
    })

    return hash
  }

  // ============================================================================
  // Attestation Methods
  // ============================================================================

  /**
   * Submits a single attestation
   */
  async submitAttestation(attestation: Attestation): Promise<Hash> {
    if (!this.walletClient) {
      throw new Error('Wallet client required for write operations')
    }

    const hash = await this.walletClient.writeContract({
      chain: this.chain,
      address: this.config.attestationRegistryAddress,
      abi: AttestationRegistryAbi,
      functionName: 'submitAttestation',
      args: [attestation.robotId, attestation.dataHash, attestation.signature],
    })

    return hash
  }

  /**
   * Submits a batch of attestations
   */
  async submitBatch(batch: AttestationBatch): Promise<Hash> {
    if (!this.walletClient) {
      throw new Error('Wallet client required for write operations')
    }

    const hash = await this.walletClient.writeContract({
      chain: this.chain,
      address: this.config.attestationRegistryAddress,
      abi: AttestationRegistryAbi,
      functionName: 'submitBatch',
      args: [batch.robotId, batch.merkleRoot, batch.count, batch.signature],
    })

    return hash
  }

  /**
   * Gets attestation by ID
   */
  async getAttestation(attestationId: bigint): Promise<OnChainAttestation | null> {
    try {
      const result = await this.publicClient.readContract({
        address: this.config.attestationRegistryAddress,
        abi: AttestationRegistryAbi,
        functionName: 'getAttestation',
        args: [attestationId],
      })

      return {
        id: attestationId,
        robotId: result[0],
        attestationHash: result[1],
        timestamp: Number(result[2]),
        isBatch: result[3],
        count: result[4],
      }
    } catch {
      return null
    }
  }

  /**
   * Gets total attestation count for a robot
   */
  async getRobotAttestationCount(robotId: bigint): Promise<bigint> {
    return this.publicClient.readContract({
      address: this.config.attestationRegistryAddress,
      abi: AttestationRegistryAbi,
      functionName: 'getRobotAttestationCount',
      args: [robotId],
    })
  }

  /**
   * Verifies an attestation against a merkle root
   */
  async verifyAttestation(
    merkleRoot: Hash,
    proof: Hash[],
    leaf: Hash
  ): Promise<boolean> {
    return this.publicClient.readContract({
      address: this.config.attestationRegistryAddress,
      abi: AttestationRegistryAbi,
      functionName: 'verifyAttestation',
      args: [merkleRoot, proof, leaf],
    })
  }

  // ============================================================================
  // Staking Methods
  // ============================================================================

  /**
   * Gets stake information for a robot
   */
  async getStake(robotId: bigint): Promise<StakeInfo> {
    const result = await this.publicClient.readContract({
      address: this.config.stakingAddress,
      abi: FlectraStakingAbi,
      functionName: 'getStake',
      args: [robotId],
    })

    return {
      robotId,
      amount: result[0],
      lockedAmount: result[1],
      unlockTime: Number(result[2]),
    }
  }

  /**
   * Stakes USDC for a robot
   */
  async stake(robotId: bigint, amount: bigint): Promise<Hash> {
    if (!this.walletClient) {
      throw new Error('Wallet client required for write operations')
    }

    // First approve USDC
    await this.approveUsdc(this.config.stakingAddress, amount)

    const hash = await this.walletClient.writeContract({
      chain: this.chain,
      address: this.config.stakingAddress,
      abi: FlectraStakingAbi,
      functionName: 'stake',
      args: [robotId, amount],
    })

    return hash
  }

  /**
   * Initiates unstaking
   */
  async initiateUnstake(robotId: bigint, amount: bigint): Promise<Hash> {
    if (!this.walletClient) {
      throw new Error('Wallet client required for write operations')
    }

    const hash = await this.walletClient.writeContract({
      chain: this.chain,
      address: this.config.stakingAddress,
      abi: FlectraStakingAbi,
      functionName: 'initiateUnstake',
      args: [robotId, amount],
    })

    return hash
  }

  /**
   * Completes unstaking after lock period
   */
  async completeUnstake(robotId: bigint): Promise<Hash> {
    if (!this.walletClient) {
      throw new Error('Wallet client required for write operations')
    }

    const hash = await this.walletClient.writeContract({
      chain: this.chain,
      address: this.config.stakingAddress,
      abi: FlectraStakingAbi,
      functionName: 'completeUnstake',
      args: [robotId],
    })

    return hash
  }

  // ============================================================================
  // USDC Methods
  // ============================================================================

  /**
   * Gets USDC balance
   */
  async getUsdcBalance(address: Address): Promise<bigint> {
    return this.publicClient.readContract({
      address: this.config.usdcAddress,
      abi: ERC20Abi,
      functionName: 'balanceOf',
      args: [address],
    })
  }

  /**
   * Approves USDC spending
   */
  async approveUsdc(spender: Address, amount: bigint): Promise<Hash> {
    if (!this.walletClient) {
      throw new Error('Wallet client required for write operations')
    }

    const hash = await this.walletClient.writeContract({
      chain: this.chain,
      address: this.config.usdcAddress,
      abi: ERC20Abi,
      functionName: 'approve',
      args: [spender, amount],
    })

    return hash
  }

  // ============================================================================
  // Utility Methods
  // ============================================================================

  /**
   * Waits for a transaction to be confirmed
   */
  async waitForTransaction(hash: Hash) {
    return this.publicClient.waitForTransactionReceipt({ hash })
  }

  /**
   * Gets the operator address (if wallet client is configured)
   */
  getOperatorAddress(): Address | null {
    if (!this.walletClient?.account) {
      return null
    }
    return this.walletClient.account.address
  }
}
