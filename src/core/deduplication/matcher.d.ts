/**
 * Lead deduplication with fuzzy matching
 */
import type { Lead, RawLead } from '../../types/index.js';
/**
 * Result of a duplicate check
 */
export interface DuplicateResult {
    match: Lead;
    confidence: number;
    reason: 'exact_phone' | 'exact_website' | 'exact_source_id' | 'fuzzy_name' | 'fuzzy_match';
}
/**
 * Deduplication matcher using Fuse.js for fuzzy matching
 */
export declare class LeadMatcher {
    private fuse;
    private phoneIndex;
    private websiteIndex;
    private sourceIdIndex;
    constructor(existingLeads: Lead[]);
    /**
     * Find duplicate of a new lead
     */
    findDuplicate(lead: Lead | RawLead): DuplicateResult | null;
    /**
     * Add a lead to the indexes
     */
    addLead(lead: Lead): void;
    /**
     * Calculate string similarity (Dice coefficient)
     */
    private calculateSimilarity;
    /**
     * Get bigrams (character pairs) from a string
     */
    private getBigrams;
    /**
     * Extract domain from URL
     */
    private extractDomain;
}
/**
 * Merge two leads, preferring non-empty values
 */
export declare function mergeLeads(canonical: Lead, duplicate: Lead): Lead;
//# sourceMappingURL=matcher.d.ts.map