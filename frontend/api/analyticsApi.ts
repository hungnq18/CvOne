export const getActiveUsers = async (): Promise<number> => {
  try {
    const res = await fetch("/api/analytics/active-users", {
      method: "GET",
      cache: "no-store",
    });

    if (!res.ok) {
      console.error("Failed to fetch active users from /api/analytics/active-users");
      return 0;
    }

    const data = await res.json();
    return typeof data.activeUsers === "number" ? data.activeUsers : 0;
  } catch (error) {
    console.error("Error while fetching active users:", error);
    return 0;
  }
};


