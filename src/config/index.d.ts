/**
 * Configuration loader with Zod validation
 */
import { z } from 'zod';
/**
 * Environment configuration schema
 */
declare const envSchema: z.ZodObject<{
    NODE_ENV: z.ZodDefault<z.ZodEnum<["development", "production", "test"]>>;
    LOG_LEVEL: z.ZodDefault<z.ZodEnum<["debug", "info", "warn", "error"]>>;
    DATABASE_PATH: z.ZodDefault<z.ZodString>;
    REDIS_HOST: z.ZodDefault<z.ZodString>;
    REDIS_PORT: z.ZodDefault<z.ZodNumber>;
    GOOGLE_PLACES_API_KEY: z.ZodOptional<z.ZodString>;
    YELP_API_KEY: z.ZodOptional<z.ZodString>;
    PROXYCURL_API_KEY: z.ZodOptional<z.ZodString>;
    HUNTER_API_KEY: z.ZodOptional<z.ZodString>;
    APOLLO_API_KEY: z.ZodOptional<z.ZodString>;
    PROXY_PROVIDER: z.ZodOptional<z.ZodEnum<["brightdata", "oxylabs", "iproyal", "custom"]>>;
    PROXY_USERNAME: z.ZodOptional<z.ZodString>;
    PROXY_PASSWORD: z.ZodOptional<z.ZodString>;
    PROXY_LIST_PATH: z.ZodOptional<z.ZodString>;
    MAX_CONCURRENT_SCRAPERS: z.ZodDefault<z.ZodNumber>;
    REQUEST_TIMEOUT_MS: z.ZodDefault<z.ZodNumber>;
    EXPORT_PATH: z.ZodDefault<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    NODE_ENV: "development" | "production" | "test";
    LOG_LEVEL: "debug" | "info" | "warn" | "error";
    DATABASE_PATH: string;
    REDIS_HOST: string;
    REDIS_PORT: number;
    MAX_CONCURRENT_SCRAPERS: number;
    REQUEST_TIMEOUT_MS: number;
    EXPORT_PATH: string;
    GOOGLE_PLACES_API_KEY?: string | undefined;
    YELP_API_KEY?: string | undefined;
    PROXYCURL_API_KEY?: string | undefined;
    HUNTER_API_KEY?: string | undefined;
    APOLLO_API_KEY?: string | undefined;
    PROXY_PROVIDER?: "brightdata" | "oxylabs" | "iproyal" | "custom" | undefined;
    PROXY_USERNAME?: string | undefined;
    PROXY_PASSWORD?: string | undefined;
    PROXY_LIST_PATH?: string | undefined;
}, {
    NODE_ENV?: "development" | "production" | "test" | undefined;
    LOG_LEVEL?: "debug" | "info" | "warn" | "error" | undefined;
    DATABASE_PATH?: string | undefined;
    REDIS_HOST?: string | undefined;
    REDIS_PORT?: number | undefined;
    GOOGLE_PLACES_API_KEY?: string | undefined;
    YELP_API_KEY?: string | undefined;
    PROXYCURL_API_KEY?: string | undefined;
    HUNTER_API_KEY?: string | undefined;
    APOLLO_API_KEY?: string | undefined;
    PROXY_PROVIDER?: "brightdata" | "oxylabs" | "iproyal" | "custom" | undefined;
    PROXY_USERNAME?: string | undefined;
    PROXY_PASSWORD?: string | undefined;
    PROXY_LIST_PATH?: string | undefined;
    MAX_CONCURRENT_SCRAPERS?: number | undefined;
    REQUEST_TIMEOUT_MS?: number | undefined;
    EXPORT_PATH?: string | undefined;
}>;
export declare const config: {
    NODE_ENV: "development" | "production" | "test";
    LOG_LEVEL: "debug" | "info" | "warn" | "error";
    DATABASE_PATH: string;
    REDIS_HOST: string;
    REDIS_PORT: number;
    MAX_CONCURRENT_SCRAPERS: number;
    REQUEST_TIMEOUT_MS: number;
    EXPORT_PATH: string;
    GOOGLE_PLACES_API_KEY?: string | undefined;
    YELP_API_KEY?: string | undefined;
    PROXYCURL_API_KEY?: string | undefined;
    HUNTER_API_KEY?: string | undefined;
    APOLLO_API_KEY?: string | undefined;
    PROXY_PROVIDER?: "brightdata" | "oxylabs" | "iproyal" | "custom" | undefined;
    PROXY_USERNAME?: string | undefined;
    PROXY_PASSWORD?: string | undefined;
    PROXY_LIST_PATH?: string | undefined;
};
export type Config = z.infer<typeof envSchema>;
/**
 * Check if an API key is configured
 */
export declare function hasApiKey(key: keyof Config): boolean;
/**
 * Get required API key or throw
 */
export declare function requireApiKey(key: keyof Config): string;
export {};
//# sourceMappingURL=index.d.ts.map