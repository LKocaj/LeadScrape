/**
 * Yelp Fusion API scraper
 *
 * Uses the official Yelp Fusion API (5,000 calls/day free)
 * https://www.yelp.com/developers/documentation/v3
 */
import { BaseScraper } from './base.scraper.js';
import { createApiClient } from '../core/http/client.js';
import { createRateLimiter } from '../core/http/rate-limiter.js';
import { requireApiKey } from '../config/index.js';
import { ConfigurationError } from '../errors/index.js';
import { Trade, } from '../types/index.js';
/**
 * Map trade to Yelp categories
 */
const TRADE_TO_CATEGORIES = {
    [Trade.HVAC]: ['hvac', 'heating', 'airconditioning', 'hvacr'],
    [Trade.PLUMBING]: ['plumbing', 'waterheaterinstallation'],
    [Trade.ELECTRICAL]: ['electricians', 'lighting', 'electricalrepair'],
    [Trade.ROOFING]: ['roofing', 'gutterservices'],
    [Trade.GENERAL]: ['contractors', 'homeservices'],
    [Trade.UNKNOWN]: ['homeservices'],
};
/**
 * Yelp Fusion API scraper
 */
export class YelpScraper extends BaseScraper {
    name = 'Yelp';
    apiKey = null;
    apiClient;
    API_BASE = 'https://api.yelp.com/v3';
    MAX_RESULTS_PER_REQUEST = 50; // Yelp limit
    MAX_OFFSET = 1000; // Yelp limit
    constructor() {
        super();
        // Create dedicated API client with rate limiting
        const rateLimiter = createRateLimiter('yelp-api', 5, 1000); // 5 QPS
        this.apiClient = createApiClient(this.API_BASE, rateLimiter);
    }
    /**
     * Initialize API key lazily
     */
    getApiKey() {
        if (!this.apiKey) {
            try {
                this.apiKey = requireApiKey('YELP_API_KEY');
            }
            catch {
                throw new ConfigurationError('Yelp API key not configured. Set YELP_API_KEY in your .env file.', 'YELP_API_KEY');
            }
        }
        return this.apiKey;
    }
    /**
     * Test connection to Yelp API
     */
    async testConnection() {
        try {
            const apiKey = this.getApiKey();
            // Simple autocomplete request to test API
            await this.apiClient.get('/autocomplete', {
                params: { text: 'plumber' },
                headers: { Authorization: `Bearer ${apiKey}` },
            });
            this.logger.info('Yelp API connection successful');
            return true;
        }
        catch (error) {
            this.logger.error(`Yelp API connection failed: ${error}`);
            return false;
        }
    }
    /**
     * Scrape leads from Yelp
     */
    async *scrape(query) {
        const apiKey = this.getApiKey();
        // Build location string
        const location = this.buildLocationString(query);
        // Scrape each trade
        for (const trade of query.trades) {
            const categories = TRADE_TO_CATEGORIES[trade] ?? [];
            this.logger.info(`Scraping ${trade} businesses in ${location}`);
            let offset = 0;
            let hasMore = true;
            while (hasMore && offset < this.MAX_OFFSET) {
                try {
                    const response = await this.withRetry(() => this.searchBusinesses(apiKey, {
                        location,
                        categories: categories.join(','),
                        limit: this.MAX_RESULTS_PER_REQUEST,
                        offset,
                    }));
                    if (response.businesses.length === 0) {
                        hasMore = false;
                        break;
                    }
                    // Convert to RawLead and yield
                    for (const business of response.businesses) {
                        if (!business.is_closed) {
                            yield this.businessToLead(business, trade);
                        }
                    }
                    // Check if we should continue
                    offset += response.businesses.length;
                    hasMore = offset < response.total && offset < this.MAX_OFFSET;
                    if (query.maxResults && offset >= query.maxResults) {
                        hasMore = false;
                    }
                    this.logger.debug(`Scraped ${offset}/${Math.min(response.total, this.MAX_OFFSET)} ${trade} businesses`);
                }
                catch (error) {
                    this.logger.error(`Error scraping Yelp: ${error}`);
                    hasMore = false;
                }
            }
        }
    }
    /**
     * Search Yelp businesses
     */
    async searchBusinesses(apiKey, params) {
        const response = await this.apiClient.get('/businesses/search', {
            params,
            headers: { Authorization: `Bearer ${apiKey}` },
        });
        return response.data;
    }
    /**
     * Convert Yelp business to RawLead
     */
    businessToLead(business, trade) {
        return {
            companyName: business.name,
            phone: business.phone || undefined,
            website: undefined, // Yelp API doesn't provide website directly
            address: business.location.address1 || undefined,
            city: business.location.city,
            state: business.location.state,
            zipCode: business.location.zip_code,
            trade,
            source: 'Yelp',
            sourceUrl: business.url,
            sourceId: business.id,
            rating: business.rating,
            reviewCount: business.review_count,
            scrapedAt: new Date(),
        };
    }
    /**
     * Build location string from query
     */
    buildLocationString(query) {
        const parts = [];
        if (query.location.city) {
            parts.push(query.location.city);
        }
        if (query.location.county) {
            parts.push(query.location.county);
        }
        if (query.location.state) {
            parts.push(query.location.state);
        }
        if (query.location.zipCode) {
            parts.push(query.location.zipCode);
        }
        return parts.join(', ') || 'Westchester County, NY';
    }
}
//# sourceMappingURL=yelp.scraper.js.map