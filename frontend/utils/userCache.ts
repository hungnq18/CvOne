import { User } from "@/types/auth";
import { fetchWithAuth } from "@/api/apiClient";
import { API_ENDPOINTS } from "@/api/apiConfig";

/**
 * User Cache Service - Tối ưu để tránh gọi API lặp lại
 */
class UserCacheService {
  private cache: Map<string, { user: User; timestamp: number }> = new Map();
  private pendingRequests: Map<string, Promise<User | undefined>> = new Map();
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  /**
   * Normalize ID - đảm bảo luôn là string hợp lệ
   */
  private normalizeId(id: any): string | null {
    if (!id) return null;
    if (typeof id === "string") {
      // Kiểm tra xem có phải ObjectId hợp lệ không (24 ký tự hex)
      if (/^[0-9a-fA-F]{24}$/.test(id)) return id;
      return null;
    }
    if (typeof id === "object") {
      // Nếu là ObjectId hoặc có _id
      if (id._id) return this.normalizeId(id._id);
      if (id.toString && typeof id.toString === "function") {
        const str = id.toString();
        // Kiểm tra xem có phải ObjectId hợp lệ không (24 ký tự hex)
        if (/^[0-9a-fA-F]{24}$/.test(str)) return str;
      }
    }
    return null;
  }

  /**
   * Get user by ID with caching
   */
  async getUserById(userId: any): Promise<User | undefined> {
    // Normalize ID trước khi sử dụng
    const normalizedId = this.normalizeId(userId);
    if (!normalizedId) {
      // console.warn("Invalid userId provided:", userId);
      return undefined;
    }

    // Check cache first
    const cached = this.cache.get(normalizedId);
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      return cached.user;
    }

    // Check if request is already pending
    if (this.pendingRequests.has(normalizedId)) {
      return this.pendingRequests.get(normalizedId)!;
    }

    // Fetch user
    const promise: Promise<User | undefined> = fetchWithAuth(
      API_ENDPOINTS.USER.GET_BY_ID(normalizedId)
    )
      .then((user: User) => {
        this.cache.set(normalizedId, { user, timestamp: Date.now() });
        this.pendingRequests.delete(normalizedId);
        return user;
      })
      .catch((err) => {
        this.pendingRequests.delete(normalizedId);
        // console.error(`Failed to fetch user ${normalizedId}:`, err);
        return undefined;
      });

    this.pendingRequests.set(normalizedId, promise);
    return promise;
  }

  /**
   * Batch fetch multiple users
   */
  async getUsersByIds(userIds: any[]): Promise<Map<string, User>> {
    // Normalize tất cả IDs trước
    const normalizedIds = userIds
      .map((id) => this.normalizeId(id))
      .filter((id): id is string => id !== null);

    const uniqueIds = Array.from(new Set(normalizedIds));
    const results = new Map<string, User>();

    // Check cache first
    const uncachedIds: string[] = [];
    for (const id of uniqueIds) {
      const cached = this.cache.get(id);
      if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
        results.set(id, cached.user);
      } else {
        uncachedIds.push(id);
      }
    }

    // Fetch uncached users in parallel
    if (uncachedIds.length > 0) {
      const promises = uncachedIds.map((id) => this.getUserById(id));
      const users = await Promise.all(promises);
      users.forEach((user, index) => {
        if (user) {
          results.set(uncachedIds[index], user);
        }
      });
    }

    return results;
  }

  /**
   * Update user in cache
   */
  updateUser(userId: string, user: User): void {
    this.cache.set(userId, { user, timestamp: Date.now() });
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.cache.clear();
    this.pendingRequests.clear();
  }

  /**
   * Clear expired entries
   */
  clearExpired(): void {
    const now = Date.now();
    for (const [key, value] of this.cache.entries()) {
      if (now - value.timestamp >= this.CACHE_TTL) {
        this.cache.delete(key);
      }
    }
  }
}

// Singleton instance
export const userCache = new UserCacheService();

// Clean expired entries every minute
if (typeof window !== "undefined") {
  setInterval(() => {
    userCache.clearExpired();
  }, 60 * 1000);
}
