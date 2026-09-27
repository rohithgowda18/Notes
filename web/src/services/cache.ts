/**
 * Simple, fast, and robust two-tier cache (In-Memory Map + Persistent LocalStorage)
 * with graceful fallback to SessionStorage when storage quota or privacy mode applies.
 */

const memoryCache = new Map<string, string>();

export const SimpleCache = {
  /**
   * Retrieve cached value (checking fast RAM first, then persistent storage)
   */
  get(key: string): string | null {
    // 1. Instant in-memory cache lookup
    if (memoryCache.has(key)) {
      return memoryCache.get(key)!;
    }

    // 2. Persistent storage lookup
    try {
      const stored = localStorage.getItem(key) ?? sessionStorage.getItem(key);
      if (stored !== null) {
        memoryCache.set(key, stored);
        return stored;
      }
    } catch {
      // Storage access blocked or restricted
    }

    return null;
  },

  /**
   * Save value to both memory and persistent storage
   */
  set(key: string, value: string): void {
    memoryCache.set(key, value);

    try {
      localStorage.setItem(key, value);
    } catch {
      try {
        sessionStorage.setItem(key, value);
      } catch {
        // Storage quota full or disabled; in-memory cache still retains it
      }
    }
  },

  /**
   * Remove a single item from all cache tiers
   */
  remove(key: string): void {
    memoryCache.delete(key);
    try {
      localStorage.removeItem(key);
      sessionStorage.removeItem(key);
    } catch {
      // Ignore
    }
  },

  /**
   * Remove all items matching a given prefix
   */
  clearPrefix(prefix: string): void {
    // Clear in-memory keys
    for (const key of Array.from(memoryCache.keys())) {
      if (key.startsWith(prefix)) {
        memoryCache.delete(key);
      }
    }

    // Clear localStorage keys
    try {
      for (let i = localStorage.length - 1; i >= 0; i--) {
        const key = localStorage.key(i);
        if (key && key.startsWith(prefix)) {
          localStorage.removeItem(key);
        }
      }
    } catch {
      // Ignore
    }

    // Clear sessionStorage keys
    try {
      for (let i = sessionStorage.length - 1; i >= 0; i--) {
        const key = sessionStorage.key(i);
        if (key && key.startsWith(prefix)) {
          sessionStorage.removeItem(key);
        }
      }
    } catch {
      // Ignore
    }
  },
};
