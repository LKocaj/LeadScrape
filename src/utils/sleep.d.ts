/**
 * Sleep utilities
 */
/**
 * Sleep for a given number of milliseconds
 */
export declare function sleep(ms: number): Promise<void>;
/**
 * Sleep for a random duration within a range
 */
export declare function sleepRandom(minMs: number, maxMs: number): Promise<void>;
/**
 * Add jitter to a base delay
 */
export declare function addJitter(baseMs: number, jitterPercent?: number): number;
//# sourceMappingURL=sleep.d.ts.map