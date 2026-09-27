import { NextRequest, NextResponse } from "next/server";
import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";
import { SESSION_COOKIE } from "./lib/auth/constants";
import { jwtVerify } from "jose";

const intlMiddleware = createMiddleware(routing);

function getSecret() {
  const secret =
    process.env.AUTH_SECRET ||
    "dev-auth-secret-change-me-in-production-32chars";
  return new TextEncoder().encode(secret);
}

async function getUserFromRequest(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, getSecret());
    return payload.user as {
      role: "ADMIN" | "MERCHANT";
      status: string;
    } | null;
  } catch {
    return null;
  }
}

export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const localeMatch = pathname.match(/^\/(en|ar)(?=\/|$)/);
  const locale = localeMatch?.[1] || routing.defaultLocale;
  const pathWithoutLocale = pathname.replace(/^\/(en|ar)/, "") || "/";

  const isAuthPage =
    pathWithoutLocale.startsWith("/login") ||
    pathWithoutLocale.startsWith("/forgot-password") ||
    pathWithoutLocale.startsWith("/reset-password");
  const isAdminRoute = pathWithoutLocale.startsWith("/admin");
  const isMerchantRoute = pathWithoutLocale.startsWith("/merchant");

  const user = await getUserFromRequest(request);

  if ((isAdminRoute || isMerchantRoute) && !user) {
    const url = request.nextUrl.clone();
    url.pathname = `/${locale}/login`;
    url.searchParams.set("next", pathWithoutLocale);
    return NextResponse.redirect(url);
  }

  if (isAdminRoute && user?.role === "MERCHANT") {
    const url = request.nextUrl.clone();
    url.pathname = `/${locale}/merchant/dashboard`;
    return NextResponse.redirect(url);
  }

  if (isMerchantRoute && user?.role === "ADMIN") {
    const url = request.nextUrl.clone();
    url.pathname = `/${locale}/admin/dashboard`;
    return NextResponse.redirect(url);
  }

  if (isAuthPage && user) {
    const url = request.nextUrl.clone();
    url.pathname =
      user.role === "ADMIN"
        ? `/${locale}/admin/dashboard`
        : `/${locale}/merchant/dashboard`;
    return NextResponse.redirect(url);
  }

  if (pathWithoutLocale === "/") {
    const url = request.nextUrl.clone();
    if (user?.role === "ADMIN") {
      url.pathname = `/${locale}/admin/dashboard`;
    } else if (user?.role === "MERCHANT") {
      url.pathname = `/${locale}/merchant/dashboard`;
    } else {
      url.pathname = `/${locale}/login`;
    }
    return NextResponse.redirect(url);
  }

  return intlMiddleware(request);
}

export const config = {
  matcher: ["/", "/(ar|en)/:path*", "/((?!api|_next|_vercel|.*\\..*).*)"],
};
