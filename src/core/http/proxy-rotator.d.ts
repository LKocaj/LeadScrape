/**
 * Proxy rotation for avoiding blocks
 */
import type { Agent } from 'http';
export interface Proxy {
    url: string;
    type: 'http' | 'https' | 'socks5';
    lastUsed?: Date;
    failCount: number;
    successCount: number;
}
export interface ProxyRotatorConfig {
    /** Minimum time between uses of the same proxy (ms) */
    cooldownMs?: number;
    /** Max fail rate before removing proxy (0-1) */
    maxFailRate?: number;
    /** Whether to auto-remove failed proxies */
    autoRemove?: boolean;
}
/**
 * Rotates through a pool of proxies with health tracking
 */
export declare class ProxyRotator {
    private proxies;
    private currentIndex;
    private cooldownMs;
    private maxFailRate;
    private autoRemove;
    constructor(config?: ProxyRotatorConfig);
    /**
     * Add proxies from a list of URLs
     */
    addProxies(urls: string[]): void;
    /**
     * Get the next available proxy
     */
    getNext(): Proxy | null;
    /**
     * Mark a proxy request as successful
     */
    markSuccess(proxy: Proxy): void;
    /**
     * Mark a proxy request as failed
     */
    markFailure(proxy: Proxy): void;
    /**
     * Create an HTTP agent for a proxy
     */
    createAgent(proxy: Proxy): Agent;
    /**
     * Get count of available proxies
     */
    getProxyCount(): number;
    /**
     * Check if proxies are configured
     */
    hasProxies(): boolean;
    /**
     * Get proxy stats
     */
    getStats(): {
        total: number;
        healthy: number;
        degraded: number;
    };
    /**
     * Detect proxy type from URL
     */
    private detectProxyType;
}
/**
 * Get the default proxy rotator instance
 */
export declare function getProxyRotator(): ProxyRotator;
/**
 * Initialize proxy rotator from config
 */
export declare function initProxyRotator(proxyUrls: string[], config?: ProxyRotatorConfig): ProxyRotator;
//# sourceMappingURL=proxy-rotator.d.ts.map