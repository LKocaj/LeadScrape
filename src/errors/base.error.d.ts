/**
 * Custom error classes
 */
/**
 * Base error for all LeadScrape errors
 */
export declare class LeadScrapeError extends Error {
    code: string;
    isRetryable: boolean;
    metadata?: Record<string, unknown> | undefined;
    constructor(message: string, code: string, isRetryable?: boolean, metadata?: Record<string, unknown> | undefined);
    toJSON(): {
        name: string;
        message: string;
        code: string;
        isRetryable: boolean;
        metadata: Record<string, unknown> | undefined;
    };
}
/**
 * Error from a scraper
 */
export declare class ScraperError extends LeadScrapeError {
    source: string;
    constructor(message: string, source: string, isRetryable?: boolean, metadata?: Record<string, unknown>);
}
/**
 * Rate limit hit
 */
export declare class RateLimitError extends LeadScrapeError {
    retryAfterMs: number;
    constructor(retryAfterMs: number, source: string);
}
/**
 * Anti-bot detection triggered
 */
export declare class BlockedError extends LeadScrapeError {
    blockType: 'captcha' | 'ip_block' | 'fingerprint' | 'unknown';
    constructor(source: string, blockType?: 'captcha' | 'ip_block' | 'fingerprint' | 'unknown');
}
/**
 * Error from enrichment API
 */
export declare class EnrichmentError extends LeadScrapeError {
    provider: string;
    constructor(message: string, provider: string, isRetryable?: boolean, metadata?: Record<string, unknown>);
}
/**
 * Missing required configuration
 */
export declare class ConfigurationError extends LeadScrapeError {
    configKey?: string | undefined;
    constructor(message: string, configKey?: string | undefined);
}
/**
 * Database error
 */
export declare class DatabaseError extends LeadScrapeError {
    operation: string;
    constructor(message: string, operation: string, isRetryable?: boolean, metadata?: Record<string, unknown>);
}
/**
 * Validation error
 */
export declare class ValidationError extends LeadScrapeError {
    field?: string | undefined;
    constructor(message: string, field?: string | undefined);
}
//# sourceMappingURL=base.error.d.ts.map