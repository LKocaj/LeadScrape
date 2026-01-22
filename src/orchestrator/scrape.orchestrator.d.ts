/**
 * Scrape orchestrator - coordinates scraping from multiple sources
 */
import type { LeadSource, Trade } from '../types/index.js';
export interface ScrapeOptions {
    /** Sources to scrape from */
    sources: LeadSource[];
    /** Trades to search for */
    trades: Trade[];
    /** Location to search */
    location: {
        city?: string;
        county?: string;
        state?: string;
        zipCode?: string;
    };
    /** Maximum results per source */
    maxResultsPerSource?: number;
    /** Whether to skip deduplication */
    skipDeduplication?: boolean;
    /** Callback for progress updates */
    onProgress?: (progress: ScrapeProgress) => void;
}
export interface ScrapeProgress {
    source: LeadSource;
    trade?: Trade;
    found: number;
    saved: number;
    duplicates: number;
    status: 'starting' | 'scraping' | 'complete' | 'error';
    error?: string;
}
export interface ScrapeResult {
    totalFound: number;
    totalSaved: number;
    totalDuplicates: number;
    bySource: Record<string, {
        found: number;
        saved: number;
        duplicates: number;
    }>;
    errors: {
        source: string;
        error: string;
    }[];
}
/**
 * Orchestrate scraping from multiple sources
 */
export declare function runScrape(options: ScrapeOptions): Promise<ScrapeResult>;
/**
 * Get available sources that can be scraped
 */
export declare function getScrapableSources(): LeadSource[];
//# sourceMappingURL=scrape.orchestrator.d.ts.map