import { NextResponse } from "next/server";
import { BetaAnalyticsDataClient } from "@google-analytics/data";

const analyticsDataClient = new BetaAnalyticsDataClient({
  credentials: {
    client_email: process.env.GA4_CLIENT_EMAIL,
    // Lưu ý: nếu bạn lưu private key dạng chuỗi có \n trong .env
    // thì cần replace lại thành xuống dòng thật
    private_key: process.env.GA4_PRIVATE_KEY?.replace(/\\n/g, "\n"),
  },
});

export async function GET() {
  if (
    !process.env.GA4_PROPERTY_ID ||
    !process.env.GA4_CLIENT_EMAIL ||
    !process.env.GA4_PRIVATE_KEY
  ) {
    return NextResponse.json(
      {
        error: "Google Analytics env vars are not configured",
        activeUsers: 0,
      },
      { status: 500 },
    );
  }

  try {
    const [response] = await analyticsDataClient.runRealtimeReport({
      property: `properties/${process.env.GA4_PROPERTY_ID}`,
      metrics: [{ name: "activeUsers" }],
    });

    const value = response.totals?.[0]?.values?.[0] ?? "0";
    const activeUsers = Number(value) || 0;

    return NextResponse.json({ activeUsers });
  } catch (error) {
    console.error("Failed to fetch GA4 active users:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch GA4 active users",
        activeUsers: 0,
      },
      { status: 500 },
    );
  }
}


