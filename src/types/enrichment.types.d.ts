/**
 * Enrichment API types
 */
/**
 * Result from email enrichment
 */
export interface EnrichmentResult {
    email?: string;
    firstName?: string;
    lastName?: string;
    position?: string;
    confidence: number;
    verificationStatus: EmailVerificationStatus;
    provider: EnrichmentProvider;
    raw?: Record<string, unknown>;
}
export type EmailVerificationStatus = 'valid' | 'invalid' | 'accept_all' | 'unknown' | 'pending';
export type EnrichmentProvider = 'hunter' | 'apollo' | 'manual';
/**
 * Hunter.io API response types
 */
export interface HunterDomainSearchResponse {
    data: {
        domain: string;
        disposable: boolean;
        webmail: boolean;
        accept_all: boolean;
        pattern: string | null;
        organization: string | null;
        emails: HunterEmail[];
    };
    meta: {
        results: number;
        limit: number;
        offset: number;
    };
}
export interface HunterEmail {
    value: string;
    type: 'personal' | 'generic';
    confidence: number;
    first_name: string | null;
    last_name: string | null;
    position: string | null;
    seniority: string | null;
    department: string | null;
    linkedin: string | null;
    twitter: string | null;
    phone_number: string | null;
    verification: {
        date: string | null;
        status: 'valid' | 'invalid' | 'accept_all' | 'unknown';
    };
}
export interface HunterEmailFinderResponse {
    data: {
        first_name: string;
        last_name: string;
        email: string;
        score: number;
        domain: string;
        accept_all: boolean;
        position: string | null;
        twitter: string | null;
        linkedin_url: string | null;
        phone_number: string | null;
        company: string | null;
        verification: {
            date: string | null;
            status: 'valid' | 'invalid' | 'accept_all' | 'unknown';
        };
    };
}
export interface HunterEmailVerifierResponse {
    data: {
        status: 'valid' | 'invalid' | 'accept_all' | 'unknown';
        result: 'deliverable' | 'undeliverable' | 'risky' | 'unknown';
        score: number;
        email: string;
        regexp: boolean;
        gibberish: boolean;
        disposable: boolean;
        webmail: boolean;
        mx_records: boolean;
        smtp_server: boolean;
        smtp_check: boolean;
        accept_all: boolean;
        block: boolean;
    };
}
/**
 * Apollo.io API response types
 */
export interface ApolloPersonSearchResponse {
    people: ApolloPerson[];
    pagination: {
        page: number;
        per_page: number;
        total_entries: number;
        total_pages: number;
    };
}
export interface ApolloPerson {
    id: string;
    first_name: string;
    last_name: string;
    name: string;
    email: string | null;
    email_status: 'verified' | 'guessed' | 'unavailable' | null;
    title: string | null;
    linkedin_url: string | null;
    organization: {
        id: string;
        name: string;
        website_url: string | null;
        phone: string | null;
    } | null;
    phone_numbers: {
        raw_number: string;
        sanitized_number: string;
        type: string;
    }[];
}
/**
 * Enrichment job for the queue
 */
export interface EnrichmentJob {
    id: string;
    leadId: string;
    status: 'pending' | 'running' | 'completed' | 'failed';
    provider: EnrichmentProvider;
    attempts: number;
    error?: string;
    createdAt: Date;
    completedAt?: Date;
}
/**
 * Options for enrichment
 */
export interface EnrichmentOptions {
    provider?: EnrichmentProvider;
    skipVerification?: boolean;
    maxCreditsPerLead?: number;
}
//# sourceMappingURL=enrichment.types.d.ts.map