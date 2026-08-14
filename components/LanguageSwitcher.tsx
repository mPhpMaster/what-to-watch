"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { LOCALES, isLocale, t, type Locale } from "@/lib/i18n";

const SHORT = { ar: "lang.ar.short", en: "lang.en.short" } as const;
const NAME = { ar: "lang.ar.name", en: "lang.en.name" } as const;

/**
 * Swaps only the locale segment. The rest of the path *and the query string*
 * are preserved, because /result carries the quiz answers in its query — losing
 * them would silently change the user's recommendation on a language switch.
 */
export default function LanguageSwitcher({ locale }: { locale: Locale }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const query = searchParams.toString();

  function hrefFor(target: Locale): string {
    const segments = pathname.split("/").filter(Boolean);
    if (segments.length > 0 && isLocale(segments[0])) segments[0] = target;
    else segments.unshift(target);
    return `/${segments.join("/")}${query ? `?${query}` : ""}`;
  }

  return (
    <div
      className="flex items-center overflow-hidden rounded-lg border border-line text-xs font-semibold"
      role="group"
      aria-label={t(locale, "nav.language")}
    >
      {LOCALES.map((target) => {
        const active = target === locale;
        return (
          <Link
            key={target}
            href={hrefFor(target)}
            hrefLang={target}
            aria-current={active ? "true" : undefined}
            aria-label={t(locale, NAME[target])}
            dir="ltr"
            className={`inline-flex min-h-9 min-w-9 items-center justify-center px-2 transition ${
              active
                ? "bg-accent text-black"
                : "text-muted hover:bg-surface-2 hover:text-foreground"
            }`}
          >
            {t(locale, SHORT[target])}
          </Link>
        );
      })}
    </div>
  );
}
