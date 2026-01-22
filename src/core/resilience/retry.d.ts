/**
 * Retry logic with exponential backoff
 */
export interface RetryConfig {
    /** Maximum number of retries */
    maxRetries: number;
    /** Base delay in milliseconds */
    baseDelayMs: number;
    /** Maximum delay in milliseconds */
    maxDelayMs: number;
    /** Jitter percentage (0-1) */
    jitterPercent?: number;
    /** Error messages that should trigger a retry */
    retryableErrors?: string[];
    /** HTTP status codes that should trigger a retry */
    retryableStatusCodes?: number[];
    /** Callback on retry */
    onRetry?: (error: Error, attempt: number, delayMs: number) => void;
}
/**
 * Execute a function with retry logic
 */
export declare function withRetry<T>(fn: () => Promise<T>, config: RetryConfig): Promise<T>;
/**
 * Create a retry wrapper with preset config
 */
export declare function createRetryWrapper(config: RetryConfig): <T>(fn: () => Promise<T>) => Promise<T>;
/**
 * Default retry config for API calls
 */
export declare const defaultApiRetryConfig: RetryConfig;
/**
 * Default retry config for scraping
 */
export declare const defaultScrapingRetryConfig: RetryConfig;
//# sourceMappingURL=retry.d.ts.map