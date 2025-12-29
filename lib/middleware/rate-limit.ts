/**
 * Rate limiting middleware for API routes
 * Simple in-memory rate limiter using sliding window
 */

import { validateClientIdentifier } from '@/lib/security/input-sanitizer';

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
}

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetIn: number;
  retryAfter?: number;
}

// In-memory store for rate limit entries
const rateLimitStore = new Map<string, RateLimitEntry>();

// Clean up expired entries periodically
let cleanupInterval: NodeJS.Timeout | null = null;

function startCleanup() {
  if (cleanupInterval) return;

  cleanupInterval = setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of rateLimitStore.entries()) {
      if (now > entry.resetTime) {
        rateLimitStore.delete(key);
      }
    }
  }, 60000); // Clean up every minute

  // Prevent interval from keeping Node.js alive
  if (cleanupInterval.unref) {
    cleanupInterval.unref();
  }
}

/**
 * Check if a request should be rate limited
 *
 * @param identifier - Unique identifier for the client (e.g., IP address, user ID)
 * @param config - Rate limit configuration
 * @returns Rate limit result with allowed status and headers
 */
export function checkRateLimit(
  identifier: string,
  config: RateLimitConfig
): RateLimitResult {
  startCleanup();

  const now = Date.now();
  const entry = rateLimitStore.get(identifier);

  // No existing entry or expired entry
  if (!entry || now > entry.resetTime) {
    rateLimitStore.set(identifier, {
      count: 1,
      resetTime: now + config.windowMs,
    });

    return {
      allowed: true,
      remaining: config.maxRequests - 1,
      resetIn: config.windowMs,
    };
  }

  // Check if limit exceeded
  if (entry.count >= config.maxRequests) {
    const retryAfter = Math.ceil((entry.resetTime - now) / 1000);

    return {
      allowed: false,
      remaining: 0,
      resetIn: entry.resetTime - now,
      retryAfter,
    };
  }

  // Increment count
  entry.count++;

  return {
    allowed: true,
    remaining: config.maxRequests - entry.count,
    resetIn: entry.resetTime - now,
  };
}

/**
 * Get rate limit headers for response
 */
export function getRateLimitHeaders(result: RateLimitResult, config: RateLimitConfig): Record<string, string> {
  const headers: Record<string, string> = {
    'X-RateLimit-Limit': config.maxRequests.toString(),
    'X-RateLimit-Remaining': result.remaining.toString(),
    'X-RateLimit-Reset': Math.ceil(result.resetIn / 1000).toString(),
  };

  if (result.retryAfter !== undefined) {
    headers['Retry-After'] = result.retryAfter.toString();
  }

  return headers;
}

/**
 * Default rate limit configs for different endpoints
 */
export const RATE_LIMITS = {
  // AI generation endpoints - more restrictive
  generation: {
    maxRequests: 10,
    windowMs: 60 * 1000, // 10 requests per minute
  },

  // Knowledge base endpoints - less restrictive
  knowledge: {
    maxRequests: 30,
    windowMs: 60 * 1000, // 30 requests per minute
  },

  // Document upload - restrictive
  upload: {
    maxRequests: 5,
    windowMs: 60 * 1000, // 5 uploads per minute
  },

  // General API - moderate
  default: {
    maxRequests: 20,
    windowMs: 60 * 1000, // 20 requests per minute
  },
} as const;

/**
 * Get client identifier from request
 */
export function getClientIdentifier(request: Request): string {
  // Try to get real IP from headers (for proxied requests)
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) {
    // Extract the first IP from the forwarded-for header
    const firstIp = forwardedFor.split(',')[0].trim();
    return validateClientIdentifier(firstIp);
  }

  const realIp = request.headers.get('x-real-ip');
  if (realIp) {
    return validateClientIdentifier(realIp);
  }

  // Fallback to a generic identifier
  return 'anonymous';
}
