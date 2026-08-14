import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { DEFAULT_LOCALE, LOCALES } from "@/lib/i18n";

/**
 * Every page lives under /[locale], so a bare path has to grow one before it
 * can be routed. Arabic is the default, which is why "/" lands on "/ar".
 *
 * `middleware.ts` is deprecated in Next 16 — the file convention is now
 * `proxy.ts` with an exported `proxy` function (see
 * node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/proxy.md
 * and the internationalization guide, which routes locales here).
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const hasLocale = LOCALES.some(
    (locale) => pathname === `/${locale}` || pathname.startsWith(`/${locale}/`),
  );
  if (hasLocale) return;

  const url = request.nextUrl.clone();
  // Cloning keeps the query string, so a shared /result link survives the hop.
  url.pathname = `/${DEFAULT_LOCALE}${pathname === "/" ? "" : pathname}`;
  return NextResponse.redirect(url);
}

export const config = {
  matcher: [
    // API routes stay unprefixed; static assets and files must not be touched.
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)",
  ],
};
