import { NextResponse } from "next/server"

export async function GET() {
  // This is an example API route
  return NextResponse.json({ message: "Hello from the API!" })
}

export async function POST(request: Request) {
  try {
    const body = await request.json()

    // Process the data here

    return NextResponse.json({ success: true, data: body })
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to process request" }, { status: 400 })
  }
}
