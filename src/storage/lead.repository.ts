/**
 * Lead repository - CRUD operations for leads
 */

import { nanoid } from 'nanoid';
import type { SqlValue } from 'sql.js';
import { query, execute, getChanges, saveDatabase } from './sqlite.client.js';
import {
  normalizeCompanyName,
  normalizePhone,
  normalizeAddress,
} from '../utils/formatters.js';
import { createLogger } from '../utils/logger.js';
import type {
  Lead,
  RawLead,
  LeadFilters,
  LeadStatus,
  LeadMetadata,
} from '../types/index.js';

const logger = createLogger('lead-repository');

/**
 * Database row type
 */
interface LeadRow {
  id: string;
  company_name: string;
  contact_name: string | null;
  email: string | null;
  phone: string | null;
  website: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  zip_code: string | null;
  trade: string;
  source: string;
  source_url: string | null;
  source_id: string | null;
  rating: number | null;
  review_count: number | null;
  normalized_name: string;
  normalized_phone: string | null;
  normalized_address: string | null;
  status: string;
  notes: string;
  confidence: number;
  duplicate_of: string | null;
  metadata: string;
  scraped_at: string;
  enriched_at: string | null;
  verified_at: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Convert a database row to a Lead object
 */
function rowToLead(row: LeadRow): Lead {
  return {
    id: row.id,
    companyName: row.company_name,
    contactName: row.contact_name ?? undefined,
    email: row.email ?? undefined,
    phone: row.phone ?? undefined,
    website: row.website ?? undefined,
    address: row.address ?? undefined,
    city: row.city ?? undefined,
    state: row.state ?? undefined,
    zipCode: row.zip_code ?? undefined,
    trade: row.trade as Lead['trade'],
    source: row.source as Lead['source'],
    sourceUrl: row.source_url ?? undefined,
    sourceId: row.source_id ?? undefined,
    rating: row.rating ?? undefined,
    reviewCount: row.review_count ?? undefined,
    normalizedName: row.normalized_name,
    normalizedPhone: row.normalized_phone ?? undefined,
    normalizedAddress: row.normalized_address ?? undefined,
    status: row.status as LeadStatus,
    notes: row.notes,
    confidence: row.confidence,
    duplicateOf: row.duplicate_of ?? undefined,
    metadata: JSON.parse(row.metadata) as LeadMetadata,
    scrapedAt: new Date(row.scraped_at),
    enrichedAt: row.enriched_at ? new Date(row.enriched_at) : undefined,
    verifiedAt: row.verified_at ? new Date(row.verified_at) : undefined,
  };
}

/**
 * Create a new lead from raw scraped data
 */
export async function createLead(raw: RawLead): Promise<Lead> {
  const id = nanoid();
  const normalizedName = normalizeCompanyName(raw.companyName);
  const normalizedPhoneValue = normalizePhone(raw.phone);
  const normalizedAddressValue = normalizeAddress(raw.address);

  const lead: Lead = {
    ...raw,
    id,
    normalizedName,
    normalizedPhone: normalizedPhoneValue,
    normalizedAddress: normalizedAddressValue,
    status: 'New' as LeadStatus,
    notes: '',
    confidence: 0,
    metadata: {},
  };

  execute(
    `INSERT INTO leads (
      id, company_name, contact_name, email, phone, website,
      address, city, state, zip_code, trade, source,
      source_url, source_id, rating, review_count,
      normalized_name, normalized_phone, normalized_address,
      status, notes, confidence, duplicate_of, metadata, scraped_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      lead.id,
      lead.companyName,
      lead.contactName ?? null,
      lead.email ?? null,
      lead.phone ?? null,
      lead.website ?? null,
      lead.address ?? null,
      lead.city ?? null,
      lead.state ?? null,
      lead.zipCode ?? null,
      lead.trade,
      lead.source,
      lead.sourceUrl ?? null,
      lead.sourceId ?? null,
      lead.rating ?? null,
      lead.reviewCount ?? null,
      lead.normalizedName,
      lead.normalizedPhone ?? null,
      lead.normalizedAddress ?? null,
      lead.status,
      lead.notes,
      lead.confidence,
      lead.duplicateOf ?? null,
      JSON.stringify(lead.metadata),
      lead.scrapedAt.toISOString(),
    ]
  );

  logger.debug(`Created lead: ${lead.id} - ${lead.companyName}`);
  return lead;
}

/**
 * Get a lead by ID
 */
export function getLeadById(id: string): Lead | null {
  const rows = query<LeadRow>('SELECT * FROM leads WHERE id = ?', [id]);
  return rows[0] ? rowToLead(rows[0]) : null;
}

/**
 * Find leads matching filters
 */
export function findLeads(filters: LeadFilters = {}): Lead[] {
  const conditions: string[] = [];
  const params: SqlValue[] = [];

  if (filters.status) {
    const statuses = Array.isArray(filters.status)
      ? filters.status
      : [filters.status];
    conditions.push(`status IN (${statuses.map(() => '?').join(', ')})`);
    params.push(...statuses);
  }

  if (filters.trade) {
    const trades = Array.isArray(filters.trade)
      ? filters.trade
      : [filters.trade];
    conditions.push(`trade IN (${trades.map(() => '?').join(', ')})`);
    params.push(...trades);
  }

  if (filters.source) {
    const sources = Array.isArray(filters.source)
      ? filters.source
      : [filters.source];
    conditions.push(`source IN (${sources.map(() => '?').join(', ')})`);
    params.push(...sources);
  }

  if (filters.hasEmail !== undefined) {
    conditions.push(filters.hasEmail ? 'email IS NOT NULL' : 'email IS NULL');
  }

  if (filters.hasPhone !== undefined) {
    conditions.push(filters.hasPhone ? 'phone IS NOT NULL' : 'phone IS NULL');
  }

  if (filters.minConfidence !== undefined) {
    conditions.push('confidence >= ?');
    params.push(filters.minConfidence);
  }

  let sql = 'SELECT * FROM leads';
  if (conditions.length > 0) {
    sql += ` WHERE ${conditions.join(' AND ')}`;
  }
  sql += ' ORDER BY created_at DESC';

  if (filters.limit) {
    sql += ' LIMIT ?';
    params.push(filters.limit);
  }

  if (filters.offset) {
    sql += ' OFFSET ?';
    params.push(filters.offset);
  }

  const rows = query<LeadRow>(sql, params);
  return rows.map(rowToLead);
}

/**
 * Update a lead
 */
export function updateLead(
  id: string,
  updates: Partial<Omit<Lead, 'id'>>
): boolean {
  const setClauses: string[] = [];
  const params: SqlValue[] = [];

  const fieldMap: Record<string, string> = {
    companyName: 'company_name',
    contactName: 'contact_name',
    zipCode: 'zip_code',
    sourceUrl: 'source_url',
    sourceId: 'source_id',
    reviewCount: 'review_count',
    normalizedName: 'normalized_name',
    normalizedPhone: 'normalized_phone',
    normalizedAddress: 'normalized_address',
    duplicateOf: 'duplicate_of',
    scrapedAt: 'scraped_at',
    enrichedAt: 'enriched_at',
    verifiedAt: 'verified_at',
  };

  for (const [key, value] of Object.entries(updates)) {
    if (key === 'metadata') {
      setClauses.push('metadata = ?');
      params.push(JSON.stringify(value));
    } else if (value instanceof Date) {
      const column = fieldMap[key] ?? key;
      setClauses.push(`${column} = ?`);
      params.push(value.toISOString());
    } else if (typeof value === 'string' || typeof value === 'number' || value === null) {
      const column = fieldMap[key] ?? key;
      setClauses.push(`${column} = ?`);
      params.push(value);
    } else if (value === undefined) {
      const column = fieldMap[key] ?? key;
      setClauses.push(`${column} = ?`);
      params.push(null);
    }
  }

  if (setClauses.length === 0) return false;

  setClauses.push('updated_at = datetime("now")');
  params.push(id);

  execute(
    `UPDATE leads SET ${setClauses.join(', ')} WHERE id = ?`,
    params
  );

  return getChanges() > 0;
}

/**
 * Delete a lead
 */
export function deleteLead(id: string): boolean {
  execute('DELETE FROM leads WHERE id = ?', [id]);
  return getChanges() > 0;
}

/**
 * Find potential duplicate leads
 */
export function findPotentialDuplicates(lead: Lead | RawLead): Lead[] {
  const normalizedName =
    'normalizedName' in lead
      ? lead.normalizedName
      : normalizeCompanyName(lead.companyName);
  const normalizedPhoneValue =
    'normalizedPhone' in lead ? lead.normalizedPhone : normalizePhone(lead.phone);

  const conditions: string[] = [];
  const params: SqlValue[] = [];

  // Match by normalized name
  conditions.push('normalized_name = ?');
  params.push(normalizedName);

  // Or match by phone
  if (normalizedPhoneValue) {
    conditions.push('normalized_phone = ?');
    params.push(normalizedPhoneValue);
  }

  // Or match by website
  if (lead.website) {
    conditions.push('website = ?');
    params.push(lead.website);
  }

  // Or match by source ID
  if (lead.sourceId) {
    conditions.push('(source = ? AND source_id = ?)');
    params.push(lead.source, lead.sourceId);
  }

  // Exclude duplicates and the lead itself
  const excludeId = 'id' in lead ? lead.id : null;
  let sql = `SELECT * FROM leads WHERE (${conditions.join(' OR ')}) AND status != 'Duplicate'`;
  if (excludeId) {
    sql += ' AND id != ?';
    params.push(excludeId);
  }

  const rows = query<LeadRow>(sql, params);
  return rows.map(rowToLead);
}

/**
 * Count leads by status
 */
export function countLeadsByStatus(): Record<string, number> {
  const rows = query<{ status: string; count: number }>(
    'SELECT status, COUNT(*) as count FROM leads GROUP BY status'
  );

  const counts: Record<string, number> = {};
  for (const row of rows) {
    counts[row.status] = row.count;
  }
  return counts;
}

/**
 * Count leads by source
 */
export function countLeadsBySource(): Record<string, number> {
  const rows = query<{ source: string; count: number }>(
    'SELECT source, COUNT(*) as count FROM leads GROUP BY source'
  );

  const counts: Record<string, number> = {};
  for (const row of rows) {
    counts[row.source] = row.count;
  }
  return counts;
}

/**
 * Count leads by trade
 */
export function countLeadsByTrade(): Record<string, number> {
  const rows = query<{ trade: string; count: number }>(
    'SELECT trade, COUNT(*) as count FROM leads GROUP BY trade'
  );

  const counts: Record<string, number> = {};
  for (const row of rows) {
    counts[row.trade] = row.count;
  }
  return counts;
}

/**
 * Get total lead count
 */
export function getTotalLeadCount(): number {
  const rows = query<{ count: number }>('SELECT COUNT(*) as count FROM leads');
  return rows[0]?.count ?? 0;
}

/**
 * Save changes to disk
 */
export async function persistChanges(): Promise<void> {
  await saveDatabase();
}
