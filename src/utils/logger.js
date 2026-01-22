/**
 * Pino logger setup
 */
import pino from 'pino';
import { config } from '../config/index.js';
/**
 * Main logger instance
 */
export const logger = pino({
    level: config.LOG_LEVEL,
    transport: config.NODE_ENV === 'development'
        ? {
            target: 'pino-pretty',
            options: {
                colorize: true,
                translateTime: 'SYS:standard',
                ignore: 'pid,hostname',
            },
        }
        : undefined,
    base: {
        pid: process.pid,
    },
    timestamp: pino.stdTimeFunctions.isoTime,
});
/**
 * Create a child logger for a specific module
 */
export function createLogger(module) {
    return logger.child({ module });
}
//# sourceMappingURL=logger.js.map