/**
 * SQLite client using sql.js (pure JS implementation)
 */
import { type Database, type SqlValue } from 'sql.js';
/**
 * Initialize the SQLite database
 */
export declare function initDatabase(): Promise<Database>;
/**
 * Get the database instance
 */
export declare function getDatabase(): Database;
/**
 * Save the database to disk
 */
export declare function saveDatabase(): Promise<void>;
/**
 * Close the database connection
 */
export declare function closeDatabase(): Promise<void>;
/**
 * Execute a query and return results
 */
export declare function query<T>(sql: string, params?: SqlValue[]): T[];
/**
 * Execute a query that modifies data
 */
export declare function execute(sql: string, params?: SqlValue[]): void;
/**
 * Get the number of rows affected by the last operation
 */
export declare function getChanges(): number;
//# sourceMappingURL=sqlite.client.d.ts.map