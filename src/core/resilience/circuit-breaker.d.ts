/**
 * Circuit breaker wrapper using Opossum
 */
import CircuitBreaker from 'opossum';
export interface CircuitBreakerConfig {
    /** Name for logging */
    name: string;
    /** Time in ms before timeout error */
    timeout: number;
    /** Error percentage that opens the circuit */
    errorThresholdPercentage: number;
    /** Time in ms before trying again after circuit opens */
    resetTimeout: number;
    /** Minimum requests before circuit can open */
    volumeThreshold?: number;
    /** Fallback function */
    fallback?: (...args: unknown[]) => unknown;
}
/**
 * Circuit breaker state
 */
export type CircuitState = 'CLOSED' | 'OPEN' | 'HALF_OPEN';
/**
 * Wrap a function with circuit breaker protection
 */
export declare function createCircuitBreaker<T extends (...args: unknown[]) => Promise<unknown>>(fn: T, config: CircuitBreakerConfig): CircuitBreaker<Parameters<T>, Awaited<ReturnType<T>>>;
/**
 * Get circuit breaker stats
 */
export declare function getCircuitStats(breaker: CircuitBreaker): {
    state: string;
    successes: number;
    failures: number;
    fallbacks: number;
    rejects: number;
    timeouts: number;
    latencyMean: number;
    latencyP50: number | undefined;
    latencyP95: number | undefined;
    latencyP99: number | undefined;
};
/**
 * Default circuit breaker config for APIs
 */
export declare const defaultApiCircuitConfig: Omit<CircuitBreakerConfig, 'name'>;
/**
 * Default circuit breaker config for scraping
 */
export declare const defaultScrapingCircuitConfig: Omit<CircuitBreakerConfig, 'name'>;
//# sourceMappingURL=circuit-breaker.d.ts.map