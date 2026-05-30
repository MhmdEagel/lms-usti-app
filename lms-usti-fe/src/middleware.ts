import { NextResponse, NextRequest } from "next/server";
import { authRoutes, publicRoutes } from "./routes";
import authServices from "./services/auth.service";
import { cookies } from "next/headers";

// This function can be marked `async` if using `await` inside
export async function middleware(request: NextRequest) {
  const { nextUrl } = request;
  const cookieStorage = await cookies();
  const accessToken = cookieStorage.get("access_token");
  const isPublicRoute = publicRoutes.includes(nextUrl.pathname);
  const isAuthRoute = authRoutes.includes(nextUrl.pathname);
  if (!accessToken) {
    if (isAuthRoute || isPublicRoute) {
      return NextResponse.next();
    }
    return NextResponse.redirect(new URL("/auth/login", nextUrl));
  }
  const me = await authServices.me();
  const user = me.data.data;
  if (isAuthRoute) {
    if (user.role === "MAHASISWA") {
      return NextResponse.redirect(new URL("/mahasiswa", nextUrl));
    } else {
      return NextResponse.redirect(new URL("/dosen", nextUrl));
    }
  }
  if (!user && !isPublicRoute) {
    return NextResponse.redirect(new URL("/auth/login", nextUrl));
  }
  const userRole = user.role;
  if (nextUrl.pathname.startsWith("/mahasiswa") && userRole !== "MAHASISWA") {
    return NextResponse.redirect(new URL("/dosen", nextUrl));
  }
  if (nextUrl.pathname.startsWith("/dosen") && userRole !== "DOSEN") {
    return NextResponse.redirect(new URL("/mahasiswa", nextUrl));
  }
}

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
