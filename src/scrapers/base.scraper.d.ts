/**
 * Base scraper abstract class
 */
import CircuitBreaker from 'opossum';
import pino from 'pino';
import { HttpClient } from '../core/http/client.js';
import { TokenBucketRateLimiter } from '../core/http/rate-limiter.js';
import { ProxyRotator } from '../core/http/proxy-rotator.js';
import type { IScraper, ScraperConfig, ScrapeQuery, RawLead, LeadSource } from '../types/index.js';
/**
 * Base class for all scrapers
 */
export declare abstract class BaseScraper implements IScraper {
    abstract readonly name: LeadSource;
    protected _logger?: pino.Logger;
    protected _httpClient?: HttpClient;
    protected _rateLimiter?: TokenBucketRateLimiter;
    protected _proxyRotator?: ProxyRotator;
    protected _circuitBreaker?: CircuitBreaker<unknown[], unknown>;
    protected _config?: ScraperConfig;
    private _initialized;
    /**
     * Lazy initialization - called on first use
     */
    protected initialize(): void;
    /**
     * Get logger (initializes if needed)
     */
    protected get logger(): pino.Logger;
    /**
     * Get HTTP client (initializes if needed)
     */
    protected get httpClient(): HttpClient;
    /**
     * Get rate limiter (initializes if needed)
     */
    protected get rateLimiter(): TokenBucketRateLimiter;
    /**
     * Get proxy rotator (initializes if needed)
     */
    protected get proxyRotator(): ProxyRotator;
    /**
     * Get the scraper configuration
     */
    get config(): ScraperConfig;
    /**
     * Override config (for testing)
     */
    setConfig(config: Partial<ScraperConfig>): void;
    /**
     * Scrape leads from this source
     * Subclasses must implement this
     */
    abstract scrape(query: ScrapeQuery): AsyncGenerator<RawLead, void, unknown>;
    /**
     * Test connection to the source
     */
    abstract testConnection(): Promise<boolean>;
    /**
     * Clean up resources
     */
    cleanup(): Promise<void>;
    /**
     * Execute a function with retry logic
     */
    protected withRetry<T>(fn: () => Promise<T>): Promise<T>;
    /**
     * Create a circuit breaker for a function
     */
    protected createCircuitBreaker<T extends (...args: unknown[]) => Promise<unknown>>(fn: T, cbName: string): CircuitBreaker<Parameters<T>, Awaited<ReturnType<T>>>;
    /**
     * Check if the scraper is enabled
     */
    isEnabled(): boolean;
    /**
     * Check if proxies are required but not available
     */
    needsProxy(): boolean;
}
//# sourceMappingURL=base.scraper.d.ts.map