import type { Metadata } from "next";
import Link from "next/link";
import Poster from "@/components/Poster";
import ShareButton from "@/components/ShareButton";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";
import TitleCard from "@/components/TitleCard";
import WatchButtons from "@/components/WatchButtons";
import {
  companyLabel,
  genresFor,
  moodLabel,
  overviewFor,
  primaryTitle,
  resolveLocale,
  secondaryDir,
  secondaryTitle,
  t,
  timeLabel,
  type Locale,
} from "@/lib/i18n";
import { posterUrl } from "@/lib/links";
import { match } from "@/lib/match";
import { parseAnswers, parseVariant, resultHref } from "@/lib/quiz";
import { getTitles } from "@/lib/store";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const locale = resolveLocale((await params).locale);
  return { title: t(locale, "meta.result.title") };
}

export default async function ResultPage({
  params,
  searchParams,
}: PageProps<"/[locale]/result">) {
  const locale = resolveLocale((await params).locale);
  const sp = await searchParams;
  const answers = parseAnswers(sp);
  const variant = parseVariant(sp);

  const titles = await getTitles();
  const { best, backups, relaxed } = match(titles, answers, variant);

  return (
    <>
      <SiteHeader locale={locale} />

      <main className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-4 py-8 sm:px-6 sm:py-10">
        {!best ? (
          <EmptyState locale={locale} />
        ) : (
          <>
            <div className="flex flex-wrap items-center gap-2 text-xs text-muted">
              <span>{t(locale, "result.youPicked")}</span>
              <Chip>{moodLabel(locale, answers.mood)}</Chip>
              <Chip>{companyLabel(locale, answers.who)}</Chip>
              <Chip>{timeLabel(locale, answers.time)}</Chip>
              {answers.kids && <Chip>{t(locale, "result.familyChip")}</Chip>}
            </div>

            {relaxed && (
              <p className="rounded-xl border border-line bg-surface px-4 py-3 text-sm text-muted">
                {t(locale, "result.relaxed")}
              </p>
            )}

            <section className="flex flex-col gap-5 sm:flex-row sm:items-start sm:gap-6">
              <div className="relative mx-auto aspect-[2/3] w-44 shrink-0 overflow-hidden rounded-2xl bg-surface-2 ring-1 ring-line sm:mx-0 sm:w-56">
                <Poster
                  src={posterUrl(best, "w500")}
                  label={primaryTitle(best, locale)}
                  seed={best.id}
                  sizes="(max-width: 640px) 176px, 224px"
                  priority
                />
              </div>

              <div className="flex flex-1 flex-col gap-3">
                <p className="text-sm font-semibold text-accent">
                  {t(locale, "result.ourPick")}
                </p>
                <h1 className="text-balance text-2xl font-bold leading-tight sm:text-3xl">
                  {primaryTitle(best, locale)}
                </h1>
                <p className="text-sm text-muted">
                  {/* The other script keeps its own direction inside the page. */}
                  <span dir={secondaryDir(locale)}>{secondaryTitle(best, locale)}</span>
                  {" · "}
                  {best.year}
                  {" · "}
                  {best.kind === "series"
                    ? `${best.seasons ?? 1} ${t(locale, "result.seasons")}`
                    : `${best.runtimeMin ?? 0} ${t(locale, "result.minutes")}`}
                </p>
                <p className="text-sm leading-relaxed text-foreground/80">
                  {overviewFor(best, locale)}
                </p>
                <div className="flex flex-wrap gap-2">
                  {genresFor(best, locale).map((g) => (
                    <Chip key={g}>{g}</Chip>
                  ))}
                </div>

                <div className="mt-1 flex flex-col gap-3">
                  <WatchButtons locale={locale} title={best} size="lg" />
                  <div className="flex flex-wrap gap-2">
                    <Link
                      href={resultHref(locale, answers, variant + 1)}
                      className="inline-flex min-h-12 flex-1 items-center justify-center rounded-xl bg-surface-2 px-4 text-sm font-semibold transition hover:bg-surface"
                    >
                      {t(locale, "result.another")}
                    </Link>
                    <ShareButton locale={locale} title={primaryTitle(best, locale)} />
                  </div>
                </div>
              </div>
            </section>

            {backups.length > 0 && (
              <section className="flex flex-col gap-4">
                <h2 className="text-lg font-bold">{t(locale, "result.backups")}</h2>
                <div className="grid grid-cols-3 gap-3 sm:gap-4">
                  {backups.map((x) => (
                    <TitleCard key={x.id} locale={locale} title={x} />
                  ))}
                </div>
              </section>
            )}
          </>
        )}

        <div className="flex justify-center pt-2">
          <Link
            href={`/${locale}/quiz`}
            className="inline-flex min-h-12 items-center justify-center rounded-xl border border-accent px-6 text-sm font-bold text-accent transition hover:bg-accent hover:text-black"
          >
            {t(locale, "result.tryAgain")}
          </Link>
        </div>
      </main>

      <SiteFooter locale={locale} />
    </>
  );
}

function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full border border-line bg-surface px-2.5 py-1 text-xs text-muted">
      {children}
    </span>
  );
}

function EmptyState({ locale }: { locale: Locale }) {
  return (
    <div className="flex flex-col items-center gap-3 py-16 text-center">
      <span className="text-4xl" aria-hidden>
        🤔
      </span>
      <h1 className="text-xl font-bold">{t(locale, "result.empty.title")}</h1>
      <p className="max-w-sm text-sm text-muted">{t(locale, "result.empty.body")}</p>
    </div>
  );
}
