import { auth } from "@/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { pathname } = req.nextUrl;
  
  // Allow access to auth routes and API auth routes
  if (pathname.startsWith("/auth") || pathname.startsWith("/api/auth")) {
    return NextResponse.next();
  }
  
  // For API routes, check if authenticated
  if (pathname.startsWith("/api")) {
    if (!req.auth) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.next();
  }
  
  // For pages, redirect to signin if not authenticated
  if (!req.auth) {
    return NextResponse.redirect(new URL("/auth/signin", req.url));
  }
  
  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};