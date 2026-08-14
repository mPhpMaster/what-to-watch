import Link from "next/link";
import Rail from "@/components/Rail";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";
import { resolveLocale, t } from "@/lib/i18n";
import { byPopularity } from "@/lib/match";
import { getTitles } from "@/lib/store";
import { getVibe } from "@/lib/weather";

// The admin panel edits the catalog live, so pages read it on every request.
export const dynamic = "force-dynamic";

export default async function Home({ params }: PageProps<"/[locale]">) {
  const locale = resolveLocale((await params).locale);
  const [titles, vibe] = await Promise.all([getTitles(), getVibe(locale)]);
  const popular = byPopularity(titles);

  return (
    <>
      <SiteHeader locale={locale} />

      <main className="mx-auto flex w-full max-w-5xl flex-col gap-10 pb-12">
        <section className="flex flex-col items-center gap-4 px-4 pt-10 text-center sm:px-6 sm:pt-14">
          <h1 className="text-balance text-3xl font-bold leading-tight sm:text-5xl">
            {t(locale, "home.title")}
          </h1>
          <p className="max-w-md text-balance text-sm leading-relaxed text-muted sm:text-base">
            {t(locale, "home.subtitle")}
          </p>

          <p className="flex items-center gap-2 rounded-full border border-line bg-surface px-3 py-1.5 text-xs text-muted sm:text-sm">
            <span aria-hidden>{vibe.emoji}</span>
            {vibe.text}
          </p>

          <Link
            href={`/${locale}/quiz`}
            className="mt-1 w-full max-w-sm rounded-2xl bg-accent px-6 py-4 text-lg font-bold text-black shadow-lg shadow-accent/20 transition hover:bg-accent-strong active:scale-[0.99]"
          >
            {t(locale, "home.cta")}
          </Link>
          <span className="text-xs text-muted">{t(locale, "home.ctaNote")}</span>
        </section>

        <Rail
          locale={locale}
          heading={t(locale, "rail.popular")}
          titles={popular.slice(0, 14)}
          priority
        />
        <Rail
          locale={locale}
          heading={t(locale, "rail.family")}
          titles={popular.filter((x) => x.familyFriendly).slice(0, 14)}
        />
        <Rail
          locale={locale}
          heading={t(locale, "rail.binge")}
          titles={popular
            .filter((x) => x.kind === "series" && x.timeBucket === "binge")
            .slice(0, 14)}
        />
        <Rail
          locale={locale}
          heading={t(locale, "rail.laugh")}
          titles={popular.filter((x) => x.moods.includes("laugh")).slice(0, 14)}
        />
        <Rail
          locale={locale}
          heading={t(locale, "rail.short")}
          titles={popular.filter((x) => x.timeBucket === "short").slice(0, 14)}
        />
      </main>

      <SiteFooter locale={locale} />
    </>
  );
}
