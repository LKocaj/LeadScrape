/**
 * Sleep utilities
 */
/**
 * Sleep for a given number of milliseconds
 */
export function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
/**
 * Sleep for a random duration within a range
 */
export function sleepRandom(minMs, maxMs) {
    const ms = Math.floor(Math.random() * (maxMs - minMs + 1)) + minMs;
    return sleep(ms);
}
/**
 * Add jitter to a base delay
 */
export function addJitter(baseMs, jitterPercent = 0.2) {
    const jitter = baseMs * jitterPercent * (Math.random() * 2 - 1);
    return Math.max(0, baseMs + jitter);
}
//# sourceMappingURL=sleep.js.map