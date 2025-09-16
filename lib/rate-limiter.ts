import { RateLimiterMemory } from "rate-limiter-flexible";

// Rate limiter for buyer creation and updates
export const buyerRateLimiter = new RateLimiterMemory({
  points: 10, // Number of requests
  duration: 60, // Per 60 seconds
});

// Rate limiter for CSV imports
export const importRateLimiter = new RateLimiterMemory({
  points: 3, // Number of requests
  duration: 300, // Per 5 minutes
});

export async function checkRateLimit(
  limiter: RateLimiterMemory,
  key: string
): Promise<boolean> {
  try {
    await limiter.consume(key);
    return true;
  } catch (rejRes: any) {
    return false;
  }
}