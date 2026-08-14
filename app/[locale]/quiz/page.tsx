import type { Metadata } from "next";
import QuizFlow from "@/components/QuizFlow";
import SiteHeader from "@/components/SiteHeader";
import { resolveLocale, t } from "@/lib/i18n";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const locale = resolveLocale((await params).locale);
  return { title: t(locale, "meta.quiz.title") };
}

export default async function QuizPage({ params }: PageProps<"/[locale]/quiz">) {
  const locale = resolveLocale((await params).locale);

  return (
    <>
      <SiteHeader locale={locale} />
      <main className="mx-auto flex w-full max-w-5xl flex-1 justify-center px-4 py-8 sm:px-6 sm:py-12">
        <QuizFlow locale={locale} />
      </main>
    </>
  );
}
