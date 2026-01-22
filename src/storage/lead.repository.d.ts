/**
 * Lead repository - CRUD operations for leads
 */
import type { Lead, RawLead, LeadFilters } from '../types/index.js';
/**
 * Create a new lead from raw scraped data
 */
export declare function createLead(raw: RawLead): Promise<Lead>;
/**
 * Get a lead by ID
 */
export declare function getLeadById(id: string): Lead | null;
/**
 * Find leads matching filters
 */
export declare function findLeads(filters?: LeadFilters): Lead[];
/**
 * Update a lead
 */
export declare function updateLead(id: string, updates: Partial<Omit<Lead, 'id'>>): boolean;
/**
 * Delete a lead
 */
export declare function deleteLead(id: string): boolean;
/**
 * Find potential duplicate leads
 */
export declare function findPotentialDuplicates(lead: Lead | RawLead): Lead[];
/**
 * Count leads by status
 */
export declare function countLeadsByStatus(): Record<string, number>;
/**
 * Count leads by source
 */
export declare function countLeadsBySource(): Record<string, number>;
/**
 * Count leads by trade
 */
export declare function countLeadsByTrade(): Record<string, number>;
/**
 * Get total lead count
 */
export declare function getTotalLeadCount(): number;
/**
 * Save changes to disk
 */
export declare function persistChanges(): Promise<void>;
//# sourceMappingURL=lead.repository.d.ts.map