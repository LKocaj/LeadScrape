/**
 * Core lead data types for the scraper
 */
export declare enum Trade {
    HVAC = "HVAC",
    PLUMBING = "Plumbing",
    ELECTRICAL = "Electrical",
    ROOFING = "Roofing",
    GENERAL = "General Contractor",
    UNKNOWN = "Unknown"
}
export declare enum LeadSource {
    GOOGLE_MAPS = "Google Maps",
    YELP = "Yelp",
    LINKEDIN = "LinkedIn",
    HOMEADVISOR = "HomeAdvisor",
    ANGI = "Angi",
    THUMBTACK = "Thumbtack",
    BBB = "BBB",
    MANUAL = "Manual"
}
export declare enum LeadStatus {
    NEW = "New",
    ENRICHED = "Enriched",
    VERIFIED = "Verified",
    EXPORTED = "Exported",
    INVALID = "Invalid",
    DUPLICATE = "Duplicate"
}
/**
 * Raw lead data from scraping before processing
 */
export interface RawLead {
    companyName: string;
    contactName?: string;
    email?: string;
    phone?: string;
    website?: string;
    address?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    trade: Trade;
    source: LeadSource;
    sourceUrl?: string;
    sourceId?: string;
    rating?: number;
    reviewCount?: number;
    scrapedAt: Date;
}
/**
 * Processed lead with normalization and deduplication metadata
 */
export interface Lead extends RawLead {
    id: string;
    normalizedName: string;
    normalizedPhone?: string;
    normalizedAddress?: string;
    enrichedAt?: Date;
    verifiedAt?: Date;
    status: LeadStatus;
    notes: string;
    duplicateOf?: string;
    confidence: number;
    metadata: LeadMetadata;
}
export interface LeadMetadata {
    mergedFrom?: string[];
    enrichmentProvider?: string;
    enrichmentRaw?: Record<string, unknown>;
    scrapeAttempts?: number;
    lastError?: string;
    [key: string]: unknown;
}
/**
 * Lead export format matching OnCall template
 */
export interface ExportLead {
    'Company Name': string;
    'Contact Name': string;
    Email: string;
    Phone: string;
    Website: string;
    Address: string;
    Trade: string;
    Source: string;
    Notes: string;
    Status: string;
}
/**
 * Filters for querying leads
 */
export interface LeadFilters {
    status?: LeadStatus | LeadStatus[];
    trade?: Trade | Trade[];
    source?: LeadSource | LeadSource[];
    hasEmail?: boolean;
    hasPhone?: boolean;
    minConfidence?: number;
    limit?: number;
    offset?: number;
}
//# sourceMappingURL=lead.types.d.ts.map