/**
 * Google Places API scraper
 *
 * Uses the Google Places API (New) - $200 free credit/month
 * https://developers.google.com/maps/documentation/places/web-service
 */
import { BaseScraper } from './base.scraper.js';
import { type ScrapeQuery, type RawLead, type LeadSource } from '../types/index.js';
/**
 * Google Places API scraper
 */
export declare class GoogleMapsScraper extends BaseScraper {
    readonly name: LeadSource;
    private apiKey;
    private apiClient;
    private readonly API_BASE;
    private readonly MAX_RESULTS_PER_REQUEST;
    constructor();
    /**
     * Initialize API key lazily
     */
    private getApiKey;
    /**
     * Test connection to Google Places API
     */
    testConnection(): Promise<boolean>;
    /**
     * Scrape leads from Google Places
     */
    scrape(query: ScrapeQuery): AsyncGenerator<RawLead, void, unknown>;
    /**
     * Search places using Text Search
     */
    private searchPlaces;
    /**
     * Convert Google Place to RawLead
     */
    private placeToLead;
    /**
     * Parse address components from Google Places
     */
    private parseAddressComponents;
    /**
     * Build location string from query
     */
    private buildLocationString;
}
//# sourceMappingURL=google-maps.scraper.d.ts.map