// Rate limiting system for submissions
interface RateLimitEntry {
  count: number;
  resetTime: number;
}

interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
}

class RateLimiter {
  private limits: Map<string, RateLimitEntry> = new Map();
  private config: RateLimitConfig;

  constructor(config: RateLimitConfig) {
    this.config = config;
    
    // Clean up expired entries every minute
    setInterval(() => {
      this.cleanup();
    }, 60000);
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.limits.entries()) {
      if (now > entry.resetTime) {
        this.limits.delete(key);
      }
    }
  }

  private getClientId(): string {
    // In a real application, you might use IP address or user ID
    // For now, we'll use a combination of browser fingerprinting
    if (typeof window === 'undefined') return 'server';

    const userAgent = navigator.userAgent;
    const language = navigator.language;
    const platform = navigator.platform;
    const screenResolution = `${screen.width}x${screen.height}`;
    
    // Simple fingerprint (not foolproof, but good for basic rate limiting)
    const fingerprint = btoa(`${userAgent}-${language}-${platform}-${screenResolution}`);
    return fingerprint;
  }

  checkLimit(identifier?: string): { allowed: boolean; remainingRequests: number; resetTime: number } {
    const clientId = identifier || this.getClientId();
    const now = Date.now();
    
    let entry = this.limits.get(clientId);
    
    // If no entry exists or it's expired, create a new one
    if (!entry || now > entry.resetTime) {
      entry = {
        count: 0,
        resetTime: now + this.config.windowMs
      };
      this.limits.set(clientId, entry);
    }

    // Check if limit is exceeded
    if (entry.count >= this.config.maxRequests) {
      return {
        allowed: false,
        remainingRequests: 0,
        resetTime: entry.resetTime
      };
    }

    // Increment count and allow request
    entry.count++;
    this.limits.set(clientId, entry);

    return {
      allowed: true,
      remainingRequests: this.config.maxRequests - entry.count,
      resetTime: entry.resetTime
    };
  }

  getRemainingTime(identifier?: string): number {
    const clientId = identifier || this.getClientId();
    const entry = this.limits.get(clientId);
    
    if (!entry) return 0;
    
    const now = Date.now();
    return Math.max(0, entry.resetTime - now);
  }

  getCurrentUsage(identifier?: string): { used: number; limit: number; resetTime: number } {
    const clientId = identifier || this.getClientId();
    const entry = this.limits.get(clientId);
    const now = Date.now();
    
    if (!entry || now > entry.resetTime) {
      return {
        used: 0,
        limit: this.config.maxRequests,
        resetTime: now + this.config.windowMs
      };
    }

    return {
      used: entry.count,
      limit: this.config.maxRequests,
      resetTime: entry.resetTime
    };
  }

  // Admin function to reset limits for a specific client
  resetLimit(identifier: string): void {
    this.limits.delete(identifier);
  }

  // Admin function to get all current limits
  getAllLimits(): Array<{ clientId: string; count: number; resetTime: number }> {
    const result: Array<{ clientId: string; count: number; resetTime: number }> = [];
    
    for (const [clientId, entry] of this.limits.entries()) {
      result.push({
        clientId: clientId.substring(0, 16) + '...', // Truncate for privacy
        count: entry.count,
        resetTime: entry.resetTime
      });
    }
    
    return result;
  }
}

// Configuration for item submissions: 5 requests per minute
const submissionRateLimiter = new RateLimiter({
  maxRequests: 5,
  windowMs: 60 * 1000 // 1 minute
});

// Configuration for other operations (more lenient)
const generalRateLimiter = new RateLimiter({
  maxRequests: 30,
  windowMs: 60 * 1000 // 30 requests per minute
});

export { submissionRateLimiter, generalRateLimiter, RateLimiter };

// Helper function to format remaining time
export const formatRemainingTime = (ms: number): string => {
  if (ms <= 0) return '0s';
  
  const seconds = Math.ceil(ms / 1000);
  if (seconds < 60) return `${seconds}s`;
  
  const minutes = Math.ceil(seconds / 60);
  return `${minutes}m`;
};

// Rate limit error class
export class RateLimitError extends Error {
  constructor(
    message: string,
    public remainingTime: number,
    public resetTime: number
  ) {
    super(message);
    this.name = 'RateLimitError';
  }
}

// Enhanced submission function with rate limiting
export const submitWithRateLimit = async <T>(
  submitFunction: () => Promise<T>,
  rateLimiter: RateLimiter = submissionRateLimiter
): Promise<T> => {
  const limitCheck = rateLimiter.checkLimit();
  
  if (!limitCheck.allowed) {
    const remainingTime = rateLimiter.getRemainingTime();
    throw new RateLimitError(
      `Rate limit exceeded. Try again in ${formatRemainingTime(remainingTime)}.`,
      remainingTime,
      limitCheck.resetTime
    );
  }

  return await submitFunction();
};