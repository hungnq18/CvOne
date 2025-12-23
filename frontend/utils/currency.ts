/**
 * Currency conversion utilities
 * Conversion rate: 2000 VND = 1000 token
 * Therefore: 1 token = 2 VND, 1 VND = 0.5 token
 */

/**
 * Convert VND to tokens
 * @param vnd - Amount in VND
 * @returns Number of tokens
 */
export function vndToToken(vnd: number): number {
    // 2000 VND = 1000 token
    // 1 VND = 0.5 token
    return Math.floor(vnd * 1)
}

/**
 * Convert tokens to VND
 * @param tokens - Number of tokens
 * @returns Amount in VND
 */
export function tokenToVnd(tokens: number): number {
    // 1000 token = 2000 VND
    // 1 token = 2 VND
    return tokens * 1
}
/**
 * Format VND currency
 * @param amount - Amount in VND
 * @returns Formatted string
 */
export function formatVnd(amount: number): string {
    return amount.toLocaleString("vi-VN")
}

/**
 * Format tokens
 * @param tokens - Number of tokens
 * @returns Formatted string
 */
export function formatTokens(tokens: number): string {
    return tokens.toLocaleString("vi-VN")
}

