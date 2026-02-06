import type { Address, Hash, Hex } from 'viem'

/**
 * Formats a USDC amount (6 decimals) to a human-readable string
 *
 * @param amount - Amount in USDC base units (6 decimals)
 * @param decimals - Number of decimal places to show (default 2)
 * @returns Formatted string
 *
 * @example
 * ```ts
 * formatUsdc(1500000n) // "1.50"
 * formatUsdc(1500000n, 6) // "1.500000"
 * ```
 */
export function formatUsdc(amount: bigint, decimals = 2): string {
  const str = amount.toString().padStart(7, '0')
  const whole = str.slice(0, -6) || '0'
  const fraction = str.slice(-6).slice(0, decimals)
  return `${whole}.${fraction}`
}

/**
 * Parses a USDC amount from a human-readable string to base units
 *
 * @param amount - Human-readable amount (e.g., "100.50")
 * @returns Amount in USDC base units (6 decimals)
 *
 * @example
 * ```ts
 * parseUsdc("100") // 100000000n
 * parseUsdc("100.50") // 100500000n
 * ```
 */
export function parseUsdc(amount: string): bigint {
  const [whole, fraction = ''] = amount.split('.')
  const paddedFraction = fraction.padEnd(6, '0').slice(0, 6)
  return BigInt(whole + paddedFraction)
}

/**
 * Shortens an address for display
 *
 * @param address - Full address
 * @param chars - Number of characters to show on each end (default 4)
 * @returns Shortened address
 *
 * @example
 * ```ts
 * shortenAddress("0x266C3434C2a723939836F109FE01Bcfb96346c88")
 * // "0x266C...6c88"
 * ```
 */
export function shortenAddress(address: Address, chars = 4): string {
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`
}

/**
 * Shortens a hash for display
 *
 * @param hash - Full hash
 * @param chars - Number of characters to show on each end (default 6)
 * @returns Shortened hash
 */
export function shortenHash(hash: Hash, chars = 6): string {
  return `${hash.slice(0, chars + 2)}...${hash.slice(-chars)}`
}

/**
 * Validates that a string is a valid Ethereum address
 */
export function isValidAddress(address: string): address is Address {
  return /^0x[a-fA-F0-9]{40}$/.test(address)
}

/**
 * Validates that a string is a valid 32-byte hash
 */
export function isValidHash(hash: string): hash is Hash {
  return /^0x[a-fA-F0-9]{64}$/.test(hash)
}

/**
 * Validates that a string is valid hex
 */
export function isValidHex(hex: string): hex is Hex {
  return /^0x[a-fA-F0-9]*$/.test(hex)
}

/**
 * Calculates trust score as a percentage
 *
 * @param score - Trust score (0-10000)
 * @returns Percentage string
 */
export function formatTrustScore(score: number): string {
  return `${(score / 100).toFixed(1)}%`
}

/**
 * Gets a trust score label based on the score
 */
export function getTrustScoreLabel(
  score: number
): 'excellent' | 'good' | 'fair' | 'poor' {
  if (score >= 8000) return 'excellent'
  if (score >= 6000) return 'good'
  if (score >= 4000) return 'fair'
  return 'poor'
}

/**
 * Delays execution for a specified time
 */
export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Retries a function with exponential backoff
 */
export async function retry<T>(
  fn: () => Promise<T>,
  maxAttempts = 3,
  initialDelay = 1000
): Promise<T> {
  let lastError: Error | undefined

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error as Error
      if (attempt < maxAttempts - 1) {
        await delay(initialDelay * Math.pow(2, attempt))
      }
    }
  }

  throw lastError
}
