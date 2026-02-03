export type LeadStatus = 'New' | 'Enriched' | 'Verified' | 'Exported' | 'Invalid' | 'Duplicate';

export type Trade =
  // Home Services
  | 'HVAC' | 'Plumbing' | 'Electrical' | 'Roofing' | 'General Contractor'
  | 'Landscaping' | 'Painting' | 'Flooring' | 'Pest Control' | 'Cleaning'
  | 'Windows & Doors' | 'Garage Door' | 'Fencing' | 'Concrete' | 'Siding'
  | 'Insulation' | 'Solar' | 'Pool & Spa' | 'Tree Service' | 'Handyman'
  | 'Appliance Repair' | 'Locksmith' | 'Moving'
  // Auto
  | 'Auto Repair' | 'Auto Body' | 'Auto Detailing' | 'Towing'
  // Healthcare
  | 'Dental' | 'Medical' | 'Chiropractic' | 'Veterinary' | 'Pharmacy'
  // Professional Services
  | 'Legal' | 'Accounting' | 'Insurance' | 'Real Estate' | 'Marketing'
  | 'IT Services' | 'Consulting'
  // Food & Hospitality
  | 'Restaurant' | 'Catering' | 'Bakery' | 'Hotel'
  // Retail & Personal
  | 'Retail' | 'E-commerce' | 'Salon & Spa' | 'Fitness' | 'Photography'
  | 'Pet Services' | 'Tutoring' | 'Daycare'
  // Other
  | 'Manufacturing' | 'Construction' | 'Transportation' | 'Nonprofit'
  | 'Other' | 'Unknown';

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
  hasWebsite?: boolean;
  needsEnrichment?: boolean;
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

// Import types
export interface ImportUploadResult {
  fileId: string;
  filename: string;
  rowCount: number;
  columns: string[];
  suggestedMapping: Record<string, string>;
  sampleRows: Record<string, string>[];
}

export interface ImportField {
  key: string;
  label: string;
  required: boolean;
}

export interface ImportFieldsResponse {
  fields: ImportField[];
  knownMappings: Record<string, string>;
  trades: Trade[];
  sources: LeadSource[];
}

export interface ImportRowValidation {
  rowNumber: number;
  isValid: boolean;
  data?: Record<string, unknown>;
  errors?: Record<string, string[]>;
}

export interface ImportPreviewResult {
  rows: ImportRowValidation[];
  validCount: number;
  invalidCount: number;
}

export interface ImportConfig {
  fileId: string;
  columnMapping: Record<string, string>;
  duplicateHandling: 'skip' | 'merge' | 'replace';
  defaultTrade?: Trade;
  defaultSource?: LeadSource;
}

export interface ImportRowResult {
  rowNumber: number;
  status: 'created' | 'skipped' | 'merged' | 'replaced' | 'error';
  leadId?: string;
  errors?: string[];
  duplicateOf?: string;
}

export interface ImportResult {
  totalRows: number;
  created: number;
  skipped: number;
  merged: number;
  replaced: number;
  errors: number;
  rows: ImportRowResult[];
}

// Analytics types
export interface AnalyticsOverview {
  total: number;
  byStatus: Record<string, number>;
  bySource: Record<string, number>;
  byTrade: Record<string, number>;
  quality: {
    emailRate: number;
    phoneRate: number;
    addressRate: number;
    websiteRate: number;
    duplicateRate: number;
    enrichedRate: number;
    verifiedRate: number;
    averageConfidence: number;
  };
  trends: {
    thisWeek: number;
    lastWeek: number;
    changePercent: number;
    thisWeekWithEmail: number;
    lastWeekWithEmail: number;
    emailChangePercent: number;
  };
}

export interface TimelineData {
  date: string;
  count: number;
}

export interface SourceMetrics {
  source: string;
  total: number;
  withEmail: number;
  withPhone: number;
  withWebsite: number;
  emailRate: number;
  phoneRate: number;
  websiteRate: number;
  averageRating: number;
  duplicateCount: number;
  duplicateRate: number;
}
