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
  transport:
    config.NODE_ENV === 'development'
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
export function createLogger(module: string): pino.Logger {
  return logger.child({ module });
}

/**
 * Log levels for convenience
 */
export type LogLevel = 'debug' | 'info' | 'warn' | 'error';
