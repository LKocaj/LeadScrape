/**
 * Re-export scrapers
 */
export * from './base.scraper.js';
export * from './yelp.scraper.js';
export * from './google-maps.scraper.js';
import type { IScraper, LeadSource } from '../types/index.js';
/**
 * Get a scraper instance by source
 */
export declare function getScraper(source: LeadSource): IScraper | null;
/**
 * Get all available scraper sources
 */
export declare function getAvailableScrapers(): LeadSource[];
/**
 * Check if a scraper is available for a source
 */
export declare function hasScraperFor(source: LeadSource): boolean;
//# sourceMappingURL=index.d.ts.map