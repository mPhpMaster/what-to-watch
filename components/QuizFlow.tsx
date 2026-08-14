"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { t, type Locale } from "@/lib/i18n";
import { QUESTIONS, parseAnswers, resultHref } from "@/lib/quiz";

const MATCH_DELAY_MS = 1200;

export default function QuizFlow({ locale }: { locale: Locale }) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [matching, setMatching] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  const question = QUESTIONS[step];
  const isLast = step === QUESTIONS.length - 1;

  const choose = useCallback(
    (value: string) => {
      const next = { ...answers, [question.key]: value };
      setAnswers(next);

      if (!isLast) {
        setStep(step + 1);
        return;
      }

      const href = resultHref(locale, parseAnswers(next));
      router.prefetch(href);
      setMatching(true);

      const reduced =
        typeof window !== "undefined" &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      timer.current = setTimeout(() => router.push(href), reduced ? 0 : MATCH_DELAY_MS);
    },
    [answers, isLast, locale, question.key, router, step],
  );

  const back = useCallback(() => {
    if (step === 0) router.push(`/${locale}`);
    else setStep(step - 1);
  }, [locale, router, step]);

  if (matching) return <Matching locale={locale} />;

  return (
    <div className="flex w-full max-w-md flex-1 flex-col gap-6">
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between text-xs text-muted">
          <button
            type="button"
            onClick={back}
            className="-me-2 inline-flex min-h-11 items-center gap-1 rounded-lg px-2 transition hover:text-foreground"
          >
            {/* The arrow points back, which is a different direction per locale. */}
            <span aria-hidden>{t(locale, "quiz.backArrow")}</span> {t(locale, "quiz.back")}
          </button>
          <span>
            {step + 1} {t(locale, "quiz.progressOf")} {QUESTIONS.length}
          </span>
        </div>

        <div
          className="h-1.5 w-full overflow-hidden rounded-full bg-surface-2"
          role="progressbar"
          aria-valuemin={1}
          aria-valuemax={QUESTIONS.length}
          aria-valuenow={step + 1}
        >
          <div
            className="h-full rounded-full bg-accent transition-[width] duration-300"
            style={{ width: `${((step + 1) / QUESTIONS.length) * 100}%` }}
          />
        </div>
      </div>

      <h1 className="text-balance text-2xl font-bold leading-snug sm:text-3xl">
        {t(locale, question.titleKey)}
      </h1>

      <div className="flex flex-col gap-3">
        {question.options.map((o) => {
          const selected = answers[question.key] === o.value;
          return (
            <button
              key={o.value}
              type="button"
              onClick={() => choose(o.value)}
              className={`flex min-h-16 w-full items-center gap-3 rounded-2xl border px-4 py-3 text-start transition active:scale-[0.99] ${
                selected
                  ? "border-accent bg-accent/10"
                  : "border-line bg-surface hover:border-accent/60 hover:bg-surface-2"
              }`}
            >
              <span aria-hidden className="text-2xl">
                {o.emoji}
              </span>
              <span className="flex flex-col">
                <span className="text-base font-semibold">{t(locale, o.labelKey)}</span>
                {o.hintKey && (
                  <span className="text-xs text-muted">{t(locale, o.hintKey)}</span>
                )}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function Matching({ locale }: { locale: Locale }) {
  return (
    <div
      className="flex flex-1 flex-col items-center justify-center gap-4 py-20"
      role="status"
      aria-live="polite"
    >
      <div className="flex gap-2">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="size-3 animate-bounce rounded-full bg-accent"
            style={{ animationDelay: `${i * 120}ms` }}
          />
        ))}
      </div>
      <p className="text-lg font-semibold">{t(locale, "quiz.matching.title")}</p>
      <p className="text-sm text-muted">{t(locale, "quiz.matching.sub")}</p>
    </div>
  );
}
