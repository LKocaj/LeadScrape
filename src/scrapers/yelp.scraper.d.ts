/**
 * Yelp Fusion API scraper
 *
 * Uses the official Yelp Fusion API (5,000 calls/day free)
 * https://www.yelp.com/developers/documentation/v3
 */
import { BaseScraper } from './base.scraper.js';
import { type ScrapeQuery, type RawLead, type LeadSource } from '../types/index.js';
/**
 * Yelp Fusion API scraper
 */
export declare class YelpScraper extends BaseScraper {
    readonly name: LeadSource;
    private apiKey;
    private apiClient;
    private readonly API_BASE;
    private readonly MAX_RESULTS_PER_REQUEST;
    private readonly MAX_OFFSET;
    constructor();
    /**
     * Initialize API key lazily
     */
    private getApiKey;
    /**
     * Test connection to Yelp API
     */
    testConnection(): Promise<boolean>;
    /**
     * Scrape leads from Yelp
     */
    scrape(query: ScrapeQuery): AsyncGenerator<RawLead, void, unknown>;
    /**
     * Search Yelp businesses
     */
    private searchBusinesses;
    /**
     * Convert Yelp business to RawLead
     */
    private businessToLead;
    /**
     * Build location string from query
     */
    private buildLocationString;
}
//# sourceMappingURL=yelp.scraper.d.ts.map