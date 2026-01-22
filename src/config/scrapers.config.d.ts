/**
 * Per-scraper configuration
 */
import { LeadSource } from '../types/index.js';
import type { ScraperConfig } from '../types/index.js';
/**
 * Default scraper configurations
 */
export declare const scraperConfigs: Record<LeadSource, ScraperConfig>;
/**
 * Get config for a specific scraper
 */
export declare function getScraperConfig(source: LeadSource): ScraperConfig;
/**
 * Get all enabled scrapers
 */
export declare function getEnabledScrapers(): LeadSource[];
//# sourceMappingURL=scrapers.config.d.ts.map