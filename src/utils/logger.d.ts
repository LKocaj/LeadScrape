/**
 * Pino logger setup
 */
import pino from 'pino';
/**
 * Main logger instance
 */
export declare const logger: pino.Logger<never, boolean>;
/**
 * Create a child logger for a specific module
 */
export declare function createLogger(module: string): pino.Logger;
/**
 * Log levels for convenience
 */
export type LogLevel = 'debug' | 'info' | 'warn' | 'error';
//# sourceMappingURL=logger.d.ts.map