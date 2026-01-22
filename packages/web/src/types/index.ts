export type LeadStatus = 'New' | 'Enriched' | 'Verified' | 'Exported' | 'Invalid' | 'Duplicate';

export type Trade = 'HVAC' | 'Plumbing' | 'Electrical' | 'Roofing' | 'General Contractor' | 'Unknown';

export type LeadSource =
  | 'Google Maps'
  | 'Yelp'
  | 'LinkedIn'
  | 'HomeAdvisor'
  | 'Angi'
  | 'Thumbtack'
  | 'BBB'
  | 'Manual';

export interface Lead {
  id: string;
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
  rating?: number;
  reviewCount?: number;
  status: LeadStatus;
  notes: string;
  confidence: number;
  scrapedAt: string;
  enrichedAt?: string;
}

export interface LeadFilters {
  status?: LeadStatus;
  trade?: Trade;
  source?: LeadSource;
  hasEmail?: boolean;
  hasPhone?: boolean;
  limit?: number;
  offset?: number;
}

export interface Stats {
  total: number;
  byStatus: Record<string, number>;
  bySource: Record<string, number>;
  byTrade: Record<string, number>;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
  meta?: {
    total?: number;
    limit?: number;
    offset?: number;
  };
}

export interface ScrapeRequest {
  sources: LeadSource[];
  trades: Trade[];
  location: {
    city?: string;
    county?: string;
    state?: string;
    zipCode?: string;
  };
  maxResultsPerSource?: number;
  skipDeduplication?: boolean;
}

export interface ScrapeResult {
  totalFound: number;
  totalSaved: number;
  totalDuplicates: number;
  bySource: Record<string, { found: number; saved: number; duplicates: number }>;
  errors: { source: string; error: string }[];
}

export interface ExportResult {
  filename: string;
  count: number;
  downloadUrl: string;
}
