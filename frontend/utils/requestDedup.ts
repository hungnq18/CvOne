/**
 * Simple Request Deduplication
 * Nếu request cùng ID đang chạy, return promise đó thay vì tạo request mới
 */

type PendingRequest<T> = Promise<T>;
const pendingRequests = new Map<string, PendingRequest<any>>();

export async function dedupRequest<T>(
  key: string,
  fetcher: () => Promise<T>
): Promise<T> {
  // Nếu đang fetch, return pending promise
  if (pendingRequests.has(key)) {
    return pendingRequests.get(key)!;
  }

  // Start new request
  const promise = fetcher()
    .then((data) => {
      pendingRequests.delete(key);
      return data;
    })
    .catch((err) => {
      pendingRequests.delete(key);
      throw err;
    });

  pendingRequests.set(key, promise);
  return promise;
}

/**
 * Batch get users - deduplicate requests
 */
export async function dedupGetUsers(
  userIds: string[],
  fetcher: (id: string) => Promise<any>
): Promise<Map<string, any>> {
  const results = await Promise.allSettled(
    userIds.map((id) =>
      dedupRequest(`user:${id}`, () => fetcher(id))
        .then((user) => [id, user] as [string, any])
        .catch(() => [id, null] as [string, null])
    )
  );

  const map = new Map<string, any>();
  results.forEach((result) => {
    if (result.status === "fulfilled") {
      map.set(result.value[0], result.value[1]);
    }
  });
  return map;
}

export function clearRequestCache() {
  pendingRequests.clear();
}
