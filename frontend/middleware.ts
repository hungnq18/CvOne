import { type NextRequest, NextResponse } from "next/server";
import { jwtDecode } from "jwt-decode";

const roleBasedPaths: { [key: string]: string[] } = {
  "/admin": ["admin"],
  "/dashboard": ["admin"],
  "/cv-template": ["admin"],
  "/cl-template": ["admin"],
  "/admin/newHrRegister": ["admin"],

  "/hr/dashboard": ["hr"],
  "/hr/manageJob": ["hr"],
  "/hr/manageApplyJob": ["hr"],
  "/hr/manageCandidate": ["hr"],

  "/marketing": ["mkt"],
  "/marketing/ads": ["mkt"],
  "/marketing/voucher": ["mkt"],
  "/marketing/feedback": ["mkt"],

  "/userDashboard": ["user"],
  "/myDocuments": ["user"],
  "/myJobs": ["user"],
  "/uploadCV-overlay": ["user"],
  "/uploadJD": ["user"],
  "/user/apply": ["user"],
  "/user/applyOption": ["user"],
  "/user/profile": ["user", "admin", "hr"],
  "/work-history": ["user"],
  "/work-style": ["user"],
  "/strengths": ["user"],
  "/recipent-info": ["user"],
  "/personal-info": ["user"],
  "/job-description": ["user"],
  "/job-description-cv": ["user"],
  "/customize": ["user"],
  "/createCV-AIManual": ["user"],
  "/createCV-AI": ["user"],
  "/createCLTemplate": ["user"],
  "/createCV": ["user"],
  "/chooseOption": ["user"],
  "/chooseCreateCV": ["user"],
  "/user/Wallet": ["user"],
  "/user/Wallet/deposit": ["user"],
  "/user/Wallet/history": ["user"],

  "/payment/cancel": ["admin", "hr", "user"],
  "/payment/success": ["admin", "hr", "user"],
  "/chat": ["admin", "hr", "user"],
  "/notifications": ["admin", "hr", "user"],
};

export interface DecodedToken {
  exp: number;
  role: string;
  user: string;
  isActive?: boolean; // chỉ HR có
}

export function middleware(request: NextRequest) {
  const token = request.cookies.get("token")?.value;
  const path = request.nextUrl.pathname;

  const requiredRoles = Object.entries(roleBasedPaths).find(([route]) =>
    path === route || path.startsWith(`${route}/`)
  )?.[1];

  // Route yêu cầu role nhưng chưa login
  if (requiredRoles && !token) {
    const url = new URL("/login", request.url);
    url.searchParams.set("callbackUrl", request.url);
    return NextResponse.redirect(url);
  }

  if (token) {
    try {
      const decoded: DecodedToken = jwtDecode(token);
      const currentTime = Math.floor(Date.now() / 1000);

      // Token hết hạn
      if (decoded.exp < currentTime) {
        const response = NextResponse.redirect(new URL("/login", request.url));
        response.cookies.delete("token");
        return response;
      }

      // Kiểm tra role
      if (requiredRoles && !requiredRoles.includes(decoded.role)) {
        const response = NextResponse.redirect(new URL("/login", request.url));
        response.cookies.delete("token");
        return response;
      }

      // Chặn HR chưa active
      if (decoded.role === "hr" && decoded.isActive === false) {
        const response = NextResponse.redirect(new URL("/not-active", request.url));
        return response;
      }

    } catch (err) {
      const response = NextResponse.redirect(new URL("/login", request.url));
      response.cookies.delete("token");
      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.png$).*)"],
};
