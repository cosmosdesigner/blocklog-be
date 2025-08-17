import { Injectable } from '@nestjs/common';

@Injectable()
export class TokenBlacklistService {
  private blacklistedTokens = new Set<string>();

  /**
   * Add a token to the blacklist
   */
  blacklistToken(token: string): void {
    this.blacklistedTokens.add(token);
  }

  /**
   * Check if a token is blacklisted
   */
  isTokenBlacklisted(token: string): boolean {
    return this.blacklistedTokens.has(token);
  }

  /**
   * Clean expired tokens from blacklist
   * This method should be called periodically to prevent memory leaks
   */
  cleanExpiredTokens(): void {
    // For now, we'll keep all tokens
    // In a production environment, you'd want to:
    // 1. Decode JWT to get expiration time
    // 2. Remove tokens that are already expired
    // 3. Use a database or Redis for persistent storage
  }

  /**
   * Get the size of the blacklist (for monitoring)
   */
  getBlacklistSize(): number {
    return this.blacklistedTokens.size;
  }
}
