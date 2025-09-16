// Simple in-memory rate limiter
class SimpleRateLimiter {
  private requests: Map<string, number[]> = new Map();
  private maxRequests: number;
  private windowMs: number;

  constructor(maxRequests: number, windowMs: number) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
  }

  async consume(key: string): Promise<boolean> {
    const now = Date.now();
    const userRequests = this.requests.get(key) || [];
    
    // Remove old requests outside the window
    const validRequests = userRequests.filter(time => now - time < this.windowMs);
    
    if (validRequests.length >= this.maxRequests) {
      // Rate limit exceeded
      this.requests.set(key, validRequests);
      return false;
    }
    
    // Add new request
    validRequests.push(now);
    this.requests.set(key, validRequests);
    return true;
  }
}

// Rate limiter for buyer creation and updates (10 requests per 60 seconds)
export const buyerRateLimiter = new SimpleRateLimiter(10, 60 * 1000);

// Rate limiter for CSV imports (3 requests per 5 minutes)
export const importRateLimiter = new SimpleRateLimiter(3, 5 * 60 * 1000);

export async function checkRateLimit(
  limiter: SimpleRateLimiter,
  key: string
): Promise<boolean> {
  return await limiter.consume(key);
}