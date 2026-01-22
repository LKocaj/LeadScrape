/**
 * Circuit breaker wrapper using Opossum
 */
import CircuitBreaker from 'opossum';
import { createLogger } from '../../utils/logger.js';
const logger = createLogger('circuit-breaker');
/**
 * Wrap a function with circuit breaker protection
 */
export function createCircuitBreaker(fn, config) {
    const breaker = new CircuitBreaker(fn, {
        timeout: config.timeout,
        errorThresholdPercentage: config.errorThresholdPercentage,
        resetTimeout: config.resetTimeout,
        volumeThreshold: config.volumeThreshold ?? 5,
        name: config.name,
    });
    // Set up fallback if provided
    if (config.fallback) {
        breaker.fallback(config.fallback);
    }
    // Event logging
    breaker.on('open', () => {
        logger.warn(`[${config.name}] Circuit OPENED - too many failures`);
    });
    breaker.on('halfOpen', () => {
        logger.info(`[${config.name}] Circuit HALF-OPEN - testing recovery`);
    });
    breaker.on('close', () => {
        logger.info(`[${config.name}] Circuit CLOSED - back to normal`);
    });
    breaker.on('reject', () => {
        logger.debug(`[${config.name}] Request rejected - circuit is open`);
    });
    breaker.on('timeout', () => {
        logger.warn(`[${config.name}] Request timed out after ${config.timeout}ms`);
    });
    breaker.on('fallback', () => {
        logger.debug(`[${config.name}] Fallback executed`);
    });
    return breaker;
}
/**
 * Get circuit breaker stats
 */
export function getCircuitStats(breaker) {
    const stats = breaker.stats;
    return {
        state: breaker.opened ? 'OPEN' : breaker.halfOpen ? 'HALF_OPEN' : 'CLOSED',
        successes: stats.successes,
        failures: stats.failures,
        fallbacks: stats.fallbacks,
        rejects: stats.rejects,
        timeouts: stats.timeouts,
        latencyMean: stats.latencyMean,
        latencyP50: stats.percentiles['50'],
        latencyP95: stats.percentiles['95'],
        latencyP99: stats.percentiles['99'],
    };
}
/**
 * Default circuit breaker config for APIs
 */
export const defaultApiCircuitConfig = {
    timeout: 30000,
    errorThresholdPercentage: 50,
    resetTimeout: 60000,
    volumeThreshold: 5,
};
/**
 * Default circuit breaker config for scraping
 */
export const defaultScrapingCircuitConfig = {
    timeout: 60000,
    errorThresholdPercentage: 30,
    resetTimeout: 120000,
    volumeThreshold: 3,
};
//# sourceMappingURL=circuit-breaker.js.map