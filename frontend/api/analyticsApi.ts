export const getActiveUsers = async (): Promise<number> => {
  try {
    const res = await fetch("/api/analytics/active-users", {
      method: "GET",
      cache: "no-store",
    });

    if (!res.ok) {
      return 0;
    }

    const data = await res.json();
    return typeof data.activeUsers === "number" ? data.activeUsers : 0;
  } catch (error) {
    return 0;
  }
};
