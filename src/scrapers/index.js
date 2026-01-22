/**
 * Re-export scrapers
 */
export * from './base.scraper.js';
export * from './yelp.scraper.js';
export * from './google-maps.scraper.js';
import { YelpScraper } from './yelp.scraper.js';
import { GoogleMapsScraper } from './google-maps.scraper.js';
/**
 * Registry of all available scrapers
 */
const scraperRegistry = new Map();
// Register scrapers
scraperRegistry.set('Yelp', () => new YelpScraper());
scraperRegistry.set('Google Maps', () => new GoogleMapsScraper());
/**
 * Get a scraper instance by source
 */
export function getScraper(source) {
    const factory = scraperRegistry.get(source);
    return factory ? factory() : null;
}
/**
 * Get all available scraper sources
 */
export function getAvailableScrapers() {
    return Array.from(scraperRegistry.keys());
}
/**
 * Check if a scraper is available for a source
 */
export function hasScraperFor(source) {
    return scraperRegistry.has(source);
}
//# sourceMappingURL=index.js.map