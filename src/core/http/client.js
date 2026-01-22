/**
 * HTTP client with proxy support and rate limiting
 */
import axios from 'axios';
import { createLogger } from '../../utils/logger.js';
import { config } from '../../config/index.js';
import { getProxyRotator } from './proxy-rotator.js';
import { RateLimitError } from '../../errors/index.js';
const logger = createLogger('http-client');
/**
 * User agents for rotation
 */
const USER_AGENTS = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Safari/605.1.15',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0',
];
/**
 * Get a random user agent
 */
function getRandomUserAgent() {
    return USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)] ?? USER_AGENTS[0];
}
/**
 * HTTP client with built-in rate limiting and proxy rotation
 */
export class HttpClient {
    client;
    rateLimiter;
    proxyRotator;
    useProxy;
    rotateUserAgent;
    currentProxy;
    constructor(clientConfig = {}) {
        this.rateLimiter = clientConfig.rateLimiter;
        this.proxyRotator = clientConfig.proxyRotator ?? getProxyRotator();
        this.useProxy = clientConfig.useProxy ?? false;
        this.rotateUserAgent = clientConfig.rotateUserAgent ?? true;
        this.client = axios.create({
            baseURL: clientConfig.baseURL,
            timeout: clientConfig.timeout ?? config.REQUEST_TIMEOUT_MS,
            headers: {
                Accept: 'application/json, text/html, */*',
                'Accept-Language': 'en-US,en;q=0.9',
                ...clientConfig.headers,
            },
        });
        // Request interceptor
        this.client.interceptors.request.use(async (reqConfig) => {
            // Rate limiting
            if (this.rateLimiter) {
                await this.rateLimiter.acquire();
            }
            // User agent rotation
            if (this.rotateUserAgent) {
                reqConfig.headers['User-Agent'] = getRandomUserAgent();
            }
            // Proxy
            if (this.useProxy && this.proxyRotator.hasProxies()) {
                this.currentProxy = this.proxyRotator.getNext() ?? undefined;
                if (this.currentProxy) {
                    reqConfig.httpsAgent = this.proxyRotator.createAgent(this.currentProxy);
                    reqConfig.httpAgent = this.proxyRotator.createAgent(this.currentProxy);
                    logger.debug(`Using proxy: ${this.currentProxy.url}`);
                }
            }
            logger.debug(`${reqConfig.method?.toUpperCase()} ${reqConfig.url}`);
            return reqConfig;
        });
        // Response interceptor
        this.client.interceptors.response.use((response) => {
            // Mark proxy as successful
            if (this.currentProxy) {
                this.proxyRotator.markSuccess(this.currentProxy);
            }
            return response;
        }, (error) => {
            // Mark proxy as failed on error
            if (this.currentProxy) {
                this.proxyRotator.markFailure(this.currentProxy);
            }
            // Handle rate limiting
            if (axios.isAxiosError(error) && error.response?.status === 429) {
                const retryAfter = error.response.headers['retry-after'];
                const retryMs = retryAfter ? parseInt(retryAfter, 10) * 1000 : 60000;
                throw new RateLimitError(retryMs, error.config?.baseURL ?? 'unknown');
            }
            throw error;
        });
    }
    /**
     * Make a GET request
     */
    async get(url, config) {
        return this.client.get(url, config);
    }
    /**
     * Make a POST request
     */
    async post(url, data, config) {
        return this.client.post(url, data, config);
    }
    /**
     * Make a PUT request
     */
    async put(url, data, config) {
        return this.client.put(url, data, config);
    }
    /**
     * Make a DELETE request
     */
    async delete(url, config) {
        return this.client.delete(url, config);
    }
    /**
     * Get the underlying axios instance
     */
    getAxiosInstance() {
        return this.client;
    }
}
/**
 * Create an HTTP client for API calls (no proxy, with rate limiting)
 */
export function createApiClient(baseURL, rateLimiter, headers) {
    return new HttpClient({
        baseURL,
        rateLimiter,
        useProxy: false,
        rotateUserAgent: false,
        headers,
    });
}
/**
 * Create an HTTP client for scraping (proxy + user agent rotation)
 */
export function createScrapingClient(rateLimiter, proxyRotator) {
    return new HttpClient({
        rateLimiter,
        proxyRotator,
        useProxy: true,
        rotateUserAgent: true,
    });
}
//# sourceMappingURL=client.js.map