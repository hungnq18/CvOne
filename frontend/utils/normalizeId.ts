/**
 * Normalize ID helper - memoized để tối ưu performance
 */
const idCache = new Map<string | object, string | null>();

export function normalizeId(id: any): string | null {
  if (!id) return null;

  // Check cache first
  if (idCache.has(id)) {
    return idCache.get(id)!;
  }

  let result: string | null = null;

  if (typeof id === "string") {
    if (/^[0-9a-fA-F]{24}$/.test(id)) {
      result = id;
    }
  } else if (typeof id === "object") {
    if (id._id !== undefined && id._id !== null) {
      const idValue = id._id;
      if (typeof idValue === "string" && /^[0-9a-fA-F]{24}$/.test(idValue)) {
        result = idValue;
      } else if (typeof idValue === "object" && typeof idValue.toString === "function") {
        const str = idValue.toString();
        if (/^[0-9a-fA-F]{24}$/.test(str)) {
          result = str;
        }
      } else {
        const str = String(idValue);
        if (/^[0-9a-fA-F]{24}$/.test(str)) {
          result = str;
        }
      }
    } else if (typeof id.toString === "function") {
      const str = id.toString();
      if (str && str !== "[object Object]" && /^[0-9a-fA-F]{24}$/.test(str)) {
        result = str;
      }
    }
  }

  // Cache result (limit cache size to prevent memory leak)
  if (idCache.size > 1000) {
    const firstKey = idCache.keys().next().value;
    if (firstKey !== undefined) {
 idCache.delete(firstKey);
    }
  }
  idCache.set(id, result);

  return result;
}
