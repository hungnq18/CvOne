import { type NextRequest, NextResponse } from "next/server"

// Add paths that should be protected here
const protectedPaths = ["/dashboard"]

export function middleware(request: NextRequest) {
  const token = request.cookies.get("token")?.value
  const path = request.nextUrl.pathname

  // Check if the path is protected and there's no token
  const isProtectedPath = protectedPaths.some(
    (protectedPath) => path === protectedPath || path.startsWith(`${protectedPath}/`),
  )

  if (isProtectedPath && !token) {
    // Redirect to login page if trying to access protected route without token
    const url = new URL("/login", request.url)
    url.searchParams.set("callbackUrl", encodeURI(request.url))
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - public files
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.png$).*)",
  ],
}
