import Link from "next/link";
import { Suspense } from "react";
import LanguageSwitcher from "./LanguageSwitcher";
import { t, type Locale } from "@/lib/i18n";

export default function SiteHeader({ locale }: { locale: Locale }) {
  return (
    <header className="sticky top-0 z-20 border-b border-line bg-background/85 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <Link href={`/${locale}`} className="flex items-center gap-2">
          <span className="grid size-8 place-items-center rounded-lg bg-accent text-base">
            🍿
          </span>
          <span className="text-lg font-bold">{t(locale, "brand.name")}</span>
        </Link>

        <div className="flex items-center gap-2">
          {/* useSearchParams needs a boundary so a static page isn't deopted. */}
          <Suspense fallback={<div className="h-9 w-[4.5rem]" />}>
            <LanguageSwitcher locale={locale} />
          </Suspense>
          <Link
            href={`/${locale}/quiz`}
            className="rounded-lg border border-line px-3 py-1.5 text-sm font-semibold text-muted transition hover:border-accent hover:text-foreground"
          >
            {t(locale, "nav.takeQuiz")}
          </Link>
        </div>
      </div>
    </header>
  );
}
