export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number; // Unix timestamp in seconds
}

interface MemoryRateLimitInfo {
  timestamps: number[];
}

// In-memory cache to keep track of request timestamps per IP
const memoryCache = new Map<string, MemoryRateLimitInfo>();
const MAX_MEMORY_CACHE_SIZE = 5000;

/**
 * Extracts the client's real IP address from headers or connection state.
 */
export function getClientIp(req: Request): string {
  // Try standard headers populated by proxies (like Vercel, Cloudflare, Nginx)
  const xForwardedFor = req.headers.get('x-forwarded-for');
  if (xForwardedFor) {
    const ips = xForwardedFor.split(',');
    const clientIp = ips[0].trim();
    if (clientIp) return clientIp;
  }

  const xRealIp = req.headers.get('x-real-ip');
  if (xRealIp) return xRealIp;

  // Next.js direct request IP
  const nextIp = (req as unknown as { ip?: string }).ip;
  if (nextIp) return nextIp;

  return '127.0.0.1';
}

/**
 * Slide-window based in-memory rate limiter to protect local development/single VPS.
 */
function checkMemoryRateLimit(ip: string, limit: number, windowMs: number): RateLimitResult {
  const now = Date.now();
  let info = memoryCache.get(ip);

  if (!info) {
    info = { timestamps: [] };
    
    // Evict old entries if the memory cache is getting too large
    if (memoryCache.size >= MAX_MEMORY_CACHE_SIZE) {
      for (const [k, v] of memoryCache.entries()) {
        const active = v.timestamps.filter(t => now - t < windowMs);
        if (active.length === 0) {
          memoryCache.delete(k);
        }
      }
      // If still too large, clear everything to avoid out-of-memory errors
      if (memoryCache.size >= MAX_MEMORY_CACHE_SIZE) {
        memoryCache.clear();
      }
    }
    
    memoryCache.set(ip, info);
  }

  // Filter timestamps to only keep those within the current sliding window
  info.timestamps = info.timestamps.filter(t => now - t < windowMs);

  if (info.timestamps.length >= limit) {
    const oldestTimestamp = info.timestamps[0];
    const resetTime = oldestTimestamp + windowMs;
    return {
      success: false,
      limit,
      remaining: 0,
      reset: Math.ceil(resetTime / 1000),
    };
  }

  info.timestamps.push(now);
  const resetTime = now + windowMs;
  return {
    success: true,
    limit,
    remaining: limit - info.timestamps.length,
    reset: Math.ceil(resetTime / 1000),
  };
}

/**
 * Main rate limiting entry point.
 * Uses Upstash Redis pipeline (REST API) if credentials are provided for distributed serverless setups,
 * and automatically falls back to an in-memory sliding window rate limiter if Redis fails or is unconfigured.
 */
export async function checkRateLimit(
  ip: string,
  limit: number,
  windowMs: number
): Promise<RateLimitResult> {
  const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
  const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (redisUrl && redisToken) {
    try {
      const key = `ratelimit:${ip}`;
      // Pipelining INCR and TTL to reduce Redis roundtrips
      const response = await fetch(`${redisUrl}/pipeline`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${redisToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify([
          ['INCR', key],
          ['TTL', key],
        ]),
        // Short timeout for Redis to ensure fast page loads even if Redis is slow
        signal: AbortSignal.timeout(1500),
      });

      if (response.ok) {
        const data = await response.json();
        // Upstash pipeline response is an array of command response objects
        // Format: [ { result: 1 }, { result: -1 } ] or [ { error: ... }, ... ]
        if (Array.isArray(data) && !data[0]?.error && !data[1]?.error) {
          const count = data[0]?.result ?? 0;
          let ttl = data[1]?.result ?? -1;

          // If the key has no TTL (new key created by INCR), set its expiration
          if (ttl === -1) {
            const windowSeconds = Math.ceil(windowMs / 1000);
            fetch(`${redisUrl}/EXPIRE/${key}/${windowSeconds}`, {
              method: 'POST',
              headers: {
                Authorization: `Bearer ${redisToken}`,
              },
            }).catch(err => console.error('Error setting Redis expiration:', err));
            ttl = windowSeconds;
          }

          const resetTime = Math.ceil(Date.now() / 1000) + (ttl > 0 ? ttl : Math.ceil(windowMs / 1000));

          if (count > limit) {
            return {
              success: false,
              limit,
              remaining: 0,
              reset: resetTime,
            };
          }

          return {
            success: true,
            limit,
            remaining: Math.max(0, limit - count),
            reset: resetTime,
          };
        }
      }
      console.warn('Upstash Redis pipeline returned error status, falling back to memory rate limiting.');
    } catch (error) {
      console.error('Failed to contact Upstash Redis, falling back to memory rate limiting:', error);
    }
  }

  // Default fallback to local in-memory limiter
  return checkMemoryRateLimit(ip, limit, windowMs);
}
