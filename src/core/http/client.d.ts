/**
 * HTTP client with proxy support and rate limiting
 */
import { type AxiosInstance, type AxiosRequestConfig, type AxiosResponse } from 'axios';
import { ProxyRotator } from './proxy-rotator.js';
import { TokenBucketRateLimiter } from './rate-limiter.js';
export interface HttpClientConfig {
    /** Base URL for requests */
    baseURL?: string;
    /** Request timeout in ms */
    timeout?: number;
    /** Rate limiter instance */
    rateLimiter?: TokenBucketRateLimiter;
    /** Proxy rotator instance */
    proxyRotator?: ProxyRotator;
    /** Whether to use proxies */
    useProxy?: boolean;
    /** Whether to rotate user agents */
    rotateUserAgent?: boolean;
    /** Default headers */
    headers?: Record<string, string>;
}
/**
 * HTTP client with built-in rate limiting and proxy rotation
 */
export declare class HttpClient {
    private client;
    private rateLimiter?;
    private proxyRotator;
    private useProxy;
    private rotateUserAgent;
    private currentProxy?;
    constructor(clientConfig?: HttpClientConfig);
    /**
     * Make a GET request
     */
    get<T = unknown>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>>;
    /**
     * Make a POST request
     */
    post<T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<AxiosResponse<T>>;
    /**
     * Make a PUT request
     */
    put<T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<AxiosResponse<T>>;
    /**
     * Make a DELETE request
     */
    delete<T = unknown>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>>;
    /**
     * Get the underlying axios instance
     */
    getAxiosInstance(): AxiosInstance;
}
/**
 * Create an HTTP client for API calls (no proxy, with rate limiting)
 */
export declare function createApiClient(baseURL: string, rateLimiter?: TokenBucketRateLimiter, headers?: Record<string, string>): HttpClient;
/**
 * Create an HTTP client for scraping (proxy + user agent rotation)
 */
export declare function createScrapingClient(rateLimiter?: TokenBucketRateLimiter, proxyRotator?: ProxyRotator): HttpClient;
//# sourceMappingURL=client.d.ts.map