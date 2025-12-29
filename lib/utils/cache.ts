interface CacheEntry<T> {
  value: T;
  timestamp: number;
  ttl: number; // time to live in milliseconds
}

class InMemoryCache {
  private cache: Map<string, CacheEntry<any>> = new Map();

  set<T>(key: string, value: T, ttl: number = 5 * 60 * 1000): void { // default 5 minutes
    this.cache.set(key, {
      value,
      timestamp: Date.now(),
      ttl,
    });
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);

    if (!entry) {
      return null;
    }

    // Check if entry has expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.value;
  }

  has(key: string): boolean {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return false;
    }

    // Check if entry has expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  // Clean up expired entries (call periodically)
  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
      }
    }
  }

  size(): number {
    // Clean up expired entries first
    this.cleanup();
    return this.cache.size;
  }
}

// Global cache instance
export const globalCache = new InMemoryCache();

// Run cleanup every 5 minutes
setInterval(() => {
  globalCache.cleanup();
}, 5 * 60 * 1000);

// Export for use in API routes
export const createCache = (namespace?: string) => {
  return {
    set: <T>(key: string, value: T, ttl?: number) => {
      const cacheKey = namespace ? `\${namespace}:\${key}` : key;
      globalCache.set(cacheKey, value, ttl);
    },
    get: <T>(key: string): T | null => {
      const cacheKey = namespace ? `\${namespace}:\${key}` : key;
      return globalCache.get<T>(cacheKey);
    },
    has: (key: string): boolean => {
      const cacheKey = namespace ? `\${namespace}:\${key}` : key;
      return globalCache.has(cacheKey);
    },
    delete: (key: string): boolean => {
      const cacheKey = namespace ? `\${namespace}:\${key}` : key;
      return globalCache.delete(cacheKey);
    },
  };
};
