/**
 * Zod schemas for import validation
 */

import { z } from 'zod';
import { Trade, LeadSource } from '../types/index.js';

/**
 * Schema for a single imported lead row
 */
export const importRowSchema = z.object({
  companyName: z.string().min(1, 'Company name is required'),
  contactName: z.string().optional().nullable().transform(v => v || undefined),
  email: z.string().email('Invalid email format').optional().nullable()
    .or(z.literal(''))
    .transform(v => v || undefined),
  phone: z.string().optional().nullable().transform(v => v || undefined),
  website: z.string().url('Invalid URL format').optional().nullable()
    .or(z.literal(''))
    .transform(v => v || undefined),
  address: z.string().optional().nullable().transform(v => v || undefined),
  city: z.string().optional().nullable().transform(v => v || undefined),
  state: z.string().optional().nullable().transform(v => v || undefined),
  zipCode: z.string().optional().nullable().transform(v => v || undefined),
  trade: z.nativeEnum(Trade).optional().default(Trade.UNKNOWN),
  source: z.nativeEnum(LeadSource).optional().default(LeadSource.MANUAL),
  sourceUrl: z.string().optional().nullable().transform(v => v || undefined),
  sourceId: z.string().optional().nullable().transform(v => v || undefined),
  rating: z.coerce.number().min(0).max(5).optional().nullable().transform(v => v ?? undefined),
  reviewCount: z.coerce.number().int().min(0).optional().nullable().transform(v => v ?? undefined),
  notes: z.string().optional().nullable().transform(v => v || undefined),
});

export type ImportRow = z.infer<typeof importRowSchema>;

/**
 * Column mapping from file headers to lead fields
 */
export const columnMappingSchema = z.record(z.string(), z.string());

export type ColumnMapping = z.infer<typeof columnMappingSchema>;

/**
 * Import configuration options
 */
export const importConfigSchema = z.object({
  fileId: z.string(),
  columnMapping: columnMappingSchema,
  duplicateHandling: z.enum(['skip', 'merge', 'replace']).default('skip'),
  defaultTrade: z.nativeEnum(Trade).optional(),
  defaultSource: z.nativeEnum(LeadSource).optional().default(LeadSource.MANUAL),
});

export type ImportConfig = z.infer<typeof importConfigSchema>;

/**
 * Known column headers that can be auto-mapped
 */
export const KNOWN_COLUMN_MAPPINGS: Record<string, string> = {
  // Company name variations
  'company name': 'companyName',
  'company': 'companyName',
  'business name': 'companyName',
  'business': 'companyName',
  'name': 'companyName',
  'companyname': 'companyName',

  // Contact name variations
  'contact name': 'contactName',
  'contact': 'contactName',
  'full name': 'contactName',
  'contactname': 'contactName',
  'owner': 'contactName',
  'owner name': 'contactName',

  // Email variations
  'email': 'email',
  'email address': 'email',
  'e-mail': 'email',

  // Phone variations
  'phone': 'phone',
  'phone number': 'phone',
  'telephone': 'phone',
  'tel': 'phone',
  'mobile': 'phone',
  'cell': 'phone',

  // Website variations
  'website': 'website',
  'url': 'website',
  'web': 'website',
  'site': 'website',

  // Address variations
  'address': 'address',
  'street': 'address',
  'street address': 'address',

  // City variations
  'city': 'city',
  'town': 'city',

  // State variations
  'state': 'state',
  'province': 'state',
  'st': 'state',

  // Zip code variations
  'zip': 'zipCode',
  'zip code': 'zipCode',
  'zipcode': 'zipCode',
  'postal code': 'zipCode',
  'postal': 'zipCode',

  // Trade variations
  'trade': 'trade',
  'industry': 'trade',
  'category': 'trade',
  'type': 'trade',

  // Source variations
  'source': 'source',
  'lead source': 'source',

  // Rating variations
  'rating': 'rating',
  'stars': 'rating',
  'score': 'rating',

  // Review count variations
  'reviews': 'reviewCount',
  'review count': 'reviewCount',
  'reviewcount': 'reviewCount',
  'num reviews': 'reviewCount',

  // Notes variations
  'notes': 'notes',
  'comments': 'notes',
  'description': 'notes',
};

/**
 * Lead fields available for mapping
 */
export const LEAD_FIELDS = [
  { key: 'companyName', label: 'Company Name', required: true },
  { key: 'contactName', label: 'Contact Name', required: false },
  { key: 'email', label: 'Email', required: false },
  { key: 'phone', label: 'Phone', required: false },
  { key: 'website', label: 'Website', required: false },
  { key: 'address', label: 'Address', required: false },
  { key: 'city', label: 'City', required: false },
  { key: 'state', label: 'State', required: false },
  { key: 'zipCode', label: 'Zip Code', required: false },
  { key: 'trade', label: 'Trade', required: false },
  { key: 'source', label: 'Source', required: false },
  { key: 'rating', label: 'Rating', required: false },
  { key: 'reviewCount', label: 'Review Count', required: false },
  { key: 'notes', label: 'Notes', required: false },
] as const;
