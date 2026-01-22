/**
 * Data formatting utilities
 */
/**
 * Normalize a phone number to E.164 format
 */
export declare function normalizePhone(phone: string | undefined): string | undefined;
/**
 * Format a phone number for display
 */
export declare function formatPhoneDisplay(phone: string | undefined): string;
/**
 * Normalize a company name for deduplication
 */
export declare function normalizeCompanyName(name: string): string;
/**
 * Normalize an address for deduplication
 */
export declare function normalizeAddress(address: string | undefined): string | undefined;
/**
 * Extract domain from a URL or website string
 */
export declare function extractDomain(url: string | undefined): string | undefined;
/**
 * Format a full address from components
 */
export declare function formatFullAddress(parts: {
    address?: string;
    city?: string;
    state?: string;
    zipCode?: string;
}): string;
/**
 * Parse a contact name into first and last names
 */
export declare function parseContactName(name: string): {
    firstName: string;
    lastName: string;
};
//# sourceMappingURL=formatters.d.ts.map