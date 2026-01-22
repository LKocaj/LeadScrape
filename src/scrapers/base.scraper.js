/**
 * Base scraper abstract class
 */
import { createLogger } from '../utils/logger.js';
import { createApiClient, createScrapingClient } from '../core/http/client.js';
import { createRateLimiter, } from '../core/http/rate-limiter.js';
import { getProxyRotator } from '../core/http/proxy-rotator.js';
import { createCircuitBreaker } from '../core/resilience/circuit-breaker.js';
import { withRetry } from '../core/resilience/retry.js';
import { getScraperConfig } from '../config/scrapers.config.js';
/**
 * Base class for all scrapers
 */
export class BaseScraper {
    _logger;
    _httpClient;
    _rateLimiter;
    _proxyRotator;
    _circuitBreaker;
    _config;
    _initialized = false;
    /**
     * Lazy initialization - called on first use
     */
    initialize() {
        if (this._initialized)
            return;
        // Get config from registry
        this._config = getScraperConfig(this.name);
        // Create logger
        this._logger = createLogger(`scraper:${this.name}`);
        // Create rate limiter
        this._rateLimiter = createRateLimiter(this.name, this._config.rateLimit.maxRequests, this._config.rateLimit.windowMs);
        // Get proxy rotator
        this._proxyRotator = getProxyRotator();
        // Create HTTP client based on scraper requirements
        if (this._config.browserRequired) {
            // Browser-based scrapers use scraping client with proxies
            this._httpClient = createScrapingClient(this._rateLimiter, this._proxyRotator);
        }
        else {
            // API-based scrapers use simpler client
            this._httpClient = createApiClient('', this._rateLimiter);
        }
        this._initialized = true;
        this._logger.debug(`Initialized ${this.name} scraper`);
    }
    /**
     * Get logger (initializes if needed)
     */
    get logger() {
        this.initialize();
        return this._logger;
    }
    /**
     * Get HTTP client (initializes if needed)
     */
    get httpClient() {
        this.initialize();
        return this._httpClient;
    }
    /**
     * Get rate limiter (initializes if needed)
     */
    get rateLimiter() {
        this.initialize();
        return this._rateLimiter;
    }
    /**
     * Get proxy rotator (initializes if needed)
     */
    get proxyRotator() {
        this.initialize();
        return this._proxyRotator;
    }
    /**
     * Get the scraper configuration
     */
    get config() {
        this.initialize();
        return this._config;
    }
    /**
     * Override config (for testing)
     */
    setConfig(config) {
        this.initialize();
        this._config = { ...this._config, ...config };
    }
    /**
     * Clean up resources
     */
    async cleanup() {
        if (this._initialized) {
            this.logger.debug(`Cleaning up ${this.name} scraper`);
        }
        // Subclasses can override for browser cleanup, etc.
    }
    /**
     * Execute a function with retry logic
     */
    async withRetry(fn) {
        this.initialize();
        return withRetry(fn, {
            maxRetries: this._config.retryConfig.maxRetries,
            baseDelayMs: this._config.retryConfig.baseDelayMs,
            maxDelayMs: this._config.retryConfig.maxDelayMs,
            onRetry: (error, attempt, delayMs) => {
                this.logger.warn(`Retry ${attempt}/${this._config.retryConfig.maxRetries} after ${delayMs}ms: ${error.message}`);
            },
        });
    }
    /**
     * Create a circuit breaker for a function
     */
    createCircuitBreaker(fn, cbName) {
        this.initialize();
        return createCircuitBreaker(fn, {
            name: `${this.name}:${cbName}`,
            timeout: this._config.circuitBreaker.timeout,
            errorThresholdPercentage: this._config.circuitBreaker.errorThresholdPercentage,
            resetTimeout: this._config.circuitBreaker.resetTimeout,
        });
    }
    /**
     * Check if the scraper is enabled
     */
    isEnabled() {
        this.initialize();
        return this._config.enabled;
    }
    /**
     * Check if proxies are required but not available
     */
    needsProxy() {
        this.initialize();
        return this._config.proxyRequired && !this._proxyRotator.hasProxies();
    }
}
//# sourceMappingURL=base.scraper.js.map