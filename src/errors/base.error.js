/**
 * Custom error classes
 */
/**
 * Base error for all LeadScrape errors
 */
export class LeadScrapeError extends Error {
    code;
    isRetryable;
    metadata;
    constructor(message, code, isRetryable = true, metadata) {
        super(message);
        this.code = code;
        this.isRetryable = isRetryable;
        this.metadata = metadata;
        this.name = 'LeadScrapeError';
        Error.captureStackTrace(this, this.constructor);
    }
    toJSON() {
        return {
            name: this.name,
            message: this.message,
            code: this.code,
            isRetryable: this.isRetryable,
            metadata: this.metadata,
        };
    }
}
/**
 * Error from a scraper
 */
export class ScraperError extends LeadScrapeError {
    source;
    constructor(message, source, isRetryable = true, metadata) {
        super(message, `SCRAPER_${source.toUpperCase().replace(/\s+/g, '_')}`, isRetryable, metadata);
        this.source = source;
        this.name = 'ScraperError';
    }
}
/**
 * Rate limit hit
 */
export class RateLimitError extends LeadScrapeError {
    retryAfterMs;
    constructor(retryAfterMs, source) {
        super(`Rate limited by ${source}. Retry after ${retryAfterMs}ms`, 'RATE_LIMITED', true, { retryAfterMs, source });
        this.retryAfterMs = retryAfterMs;
        this.name = 'RateLimitError';
    }
}
/**
 * Anti-bot detection triggered
 */
export class BlockedError extends LeadScrapeError {
    blockType;
    constructor(source, blockType = 'unknown') {
        super(`Blocked by ${source}: ${blockType}`, 'BLOCKED', true, // May be retryable with different proxy
        { source, blockType });
        this.blockType = blockType;
        this.name = 'BlockedError';
    }
}
/**
 * Error from enrichment API
 */
export class EnrichmentError extends LeadScrapeError {
    provider;
    constructor(message, provider, isRetryable = true, metadata) {
        super(message, `ENRICHMENT_${provider.toUpperCase()}`, isRetryable, metadata);
        this.provider = provider;
        this.name = 'EnrichmentError';
    }
}
/**
 * Missing required configuration
 */
export class ConfigurationError extends LeadScrapeError {
    configKey;
    constructor(message, configKey) {
        super(message, 'CONFIGURATION', false, { configKey });
        this.configKey = configKey;
        this.name = 'ConfigurationError';
    }
}
/**
 * Database error
 */
export class DatabaseError extends LeadScrapeError {
    operation;
    constructor(message, operation, isRetryable = true, metadata) {
        super(message, `DATABASE_${operation.toUpperCase()}`, isRetryable, metadata);
        this.operation = operation;
        this.name = 'DatabaseError';
    }
}
/**
 * Validation error
 */
export class ValidationError extends LeadScrapeError {
    field;
    constructor(message, field) {
        super(message, 'VALIDATION', false, { field });
        this.field = field;
        this.name = 'ValidationError';
    }
}
//# sourceMappingURL=base.error.js.map