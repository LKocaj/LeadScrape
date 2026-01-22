/**
 * Token bucket rate limiter
 */
export interface RateLimiterConfig {
    /** Maximum tokens in the bucket */
    maxTokens: number;
    /** Tokens added per second */
    refillRate: number;
    /** Name for logging */
    name?: string;
}
/**
 * Token bucket rate limiter
 *
 * Allows bursting up to maxTokens, then rate limits to refillRate per second
 */
export declare class TokenBucketRateLimiter {
    private config;
    private tokens;
    private lastRefill;
    private readonly name;
    constructor(config: RateLimiterConfig);
    /**
     * Acquire tokens, waiting if necessary
     */
    acquire(count?: number): Promise<void>;
    /**
     * Try to acquire tokens without waiting
     * Returns true if successful, false if not enough tokens
     */
    tryAcquire(count?: number): boolean;
    /**
     * Get current token count
     */
    getTokens(): number;
    /**
     * Get time until tokens will be available
     */
    getWaitTime(count?: number): number;
    /**
     * Refill tokens based on elapsed time
     */
    private refill;
}
/**
 * Create a rate limiter for a specific source
 */
export declare function createRateLimiter(name: string, maxRequests: number, windowMs: number): TokenBucketRateLimiter;
/**
 * Get or create a rate limiter for a source
 */
export declare function getRateLimiter(name: string, maxRequests: number, windowMs: number): TokenBucketRateLimiter;
//# sourceMappingURL=rate-limiter.d.ts.map