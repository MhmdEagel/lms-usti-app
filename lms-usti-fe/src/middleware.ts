import { NextResponse, NextRequest } from "next/server";
import { authRoutes, publicRoutes } from "./routes";
import authServices from "./services/auth.service";
import { cookies } from "next/headers";

export async function middleware(request: NextRequest) {
  const { nextUrl } = request;
  const cookieStorage = await cookies();
  const accessToken = cookieStorage.get("access_token");
  const isPublicRoute = publicRoutes.includes(nextUrl.pathname);
  const isAuthRoute = authRoutes.includes(nextUrl.pathname);

  const loginUrl = (callbackPath?: string) => {
    const url = new URL("/auth/login", request.url);
    if (callbackPath && callbackPath !== "/") {
      url.searchParams.set("callbackUrl", callbackPath);
    }
    return url;
  };

  if (!accessToken) {
    if (isAuthRoute || isPublicRoute) {
      return NextResponse.next();
    }
    return NextResponse.redirect(loginUrl(encodeURI(request.url)));
  }
  try {
    const me = await authServices.me();
    const user = me.data.data;

    const rolePaths: Record<string, string> = {
      MAHASISWA: "/mahasiswa",
      DOSEN: "/dosen",
      ADMIN: "/admin",
      PRODI: "/prodi",
    };
    const userRole = user.role;
    const userPath = rolePaths[userRole] || "/dosen";

    if (isAuthRoute) {
      return NextResponse.redirect(new URL(userPath, nextUrl));
    }

    if (!user && !isPublicRoute) {
      return NextResponse.redirect(loginUrl(nextUrl.pathname));
    }

    for (const [role, prefix] of Object.entries(rolePaths)) {
      if (nextUrl.pathname.startsWith(prefix) && userRole !== role) {
        return NextResponse.redirect(new URL(userPath, nextUrl));
      }
    }
  } catch {
    return NextResponse.redirect(loginUrl(nextUrl.pathname));
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
