import { type NextRequest, NextResponse } from "next/server";
import { jwtDecode } from "jwt-decode";


const adminRoutes = [
  "/admin",
  "/dashboard",
  "/cv-template",
  "/cl-template",
];

const hrRoutes = [
  "/hr/dashboard",
  "/hr/manageJob",
  "/hr/manageApplyJob",
  "/hr/manageCandidate",
];

const mktRoutes = [
  "/marketing",
  "/marketing/ads",
  "/marketing/voucher",
];

const userRoutes = [
  "/userDashboard",
  "/myDocuments",
  "/myJobs",
  "/myDocuments",
  "/uploadCV-overlay",
  "/uploadJD",
  "/user/apply",
  "/user/applyOption",
  "/user/profile",
  "/work-history",
  "/work-style",
  "/strengths",
  "/recipent-info",
  "/personal-info",
  "/job-description",
  "/job-description-cv",
  "/customize",
  "/createCV-AIManual",
  "/createCV-AI",
  "/createCLTemplate",
  "/createCV",
  "/chooseOption",
  "/chooseCreateCV",
];

// Nếu có route dùng chung cho nhiều role
const commonRoutes = [
  "/user/profile",
  "/chat",
  "/notifications"
];



const roleBasedPaths: { [key: string]: string[] } = {};
adminRoutes.forEach((route) => {
  roleBasedPaths[route] = ["admin"];
});
hrRoutes.forEach((route) => {
  roleBasedPaths[route] = ["hr"];
});
mktRoutes.forEach((route) => {
  roleBasedPaths[route] = ["mkt"];
});
userRoutes.forEach((route) => {
  roleBasedPaths[route] = ["user"];
});

// Nếu có route dùng chung cho nhiều role
commonRoutes.forEach((route) => {
  roleBasedPaths[route] = ["admin", "hr", "user"];
});
export interface DecodedToken {
  exp: number;
  role: string;
  user: string;
}

export function middleware(request: NextRequest) {
  const token = request.cookies.get("token")?.value;
  const path = request.nextUrl.pathname;

  // Tìm role yêu cầu cho path này
  const requiredRoles = Object.entries(roleBasedPaths).find(([route]) =>
    path === route || path.startsWith(`${route}/`)
  )?.[1];

  // Nếu route yêu cầu role mà không có token thì redirect
  if (requiredRoles && !token) {
    const url = new URL("/login", request.url);
    url.searchParams.set("callbackUrl", encodeURI(request.url));
    return NextResponse.redirect(url);
  }

  // Nếu có token, kiểm tra role và hạn token
  if (token) {
    try {
      const decoded: DecodedToken = jwtDecode(token);
      const currentTime = Math.floor(Date.now() / 1000);
      if (decoded.exp < currentTime) {
        // Token hết hạn, xóa cookie và redirect
        const response = NextResponse.redirect(new URL("/login", request.url));
        response.cookies.delete("token");
        return response;
      }
      // Nếu route yêu cầu role mà user không có role phù hợp thì redirect
      if (requiredRoles && !requiredRoles.includes(decoded.role)) {
        const response = NextResponse.redirect(new URL("/login", request.url));
        response.cookies.delete("token");
        return response;
      }
    } catch (err) {
      // Token không hợp lệ
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
