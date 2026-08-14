import type { Locale, MessageKey } from "./i18n";
import type { Company, Familiarity, Mood, QuizAnswers, TimeBucket } from "./types";

/**
 * The quiz carries message *keys*, never text: `lib/i18n.ts` owns every
 * user-facing string, and a key that does not exist there is a type error.
 */

export interface QuizOption<V extends string = string> {
  value: V;
  labelKey: MessageKey;
  emoji: string;
  hintKey?: MessageKey;
}

export interface QuizQuestion {
  /** URL param name — also the key in QuizAnswers. */
  key: "mood" | "who" | "time" | "fam" | "kids";
  titleKey: MessageKey;
  options: QuizOption[];
}

export const QUESTIONS: QuizQuestion[] = [
  {
    key: "mood",
    titleKey: "q.mood.title",
    options: [
      { value: "laugh", labelKey: "q.mood.laugh", emoji: "😄" },
      { value: "thrill", labelKey: "q.mood.thrill", emoji: "🔥" },
      { value: "horror", labelKey: "q.mood.horror", emoji: "👻" },
      { value: "drama", labelKey: "q.mood.drama", emoji: "💔" },
      { value: "chill", labelKey: "q.mood.chill", emoji: "🌿" },
    ],
  },
  {
    key: "who",
    titleKey: "q.who.title",
    options: [
      { value: "alone", labelKey: "q.who.alone", emoji: "🧍" },
      { value: "family", labelKey: "q.who.family", emoji: "👨‍👩‍👧" },
      { value: "friends", labelKey: "q.who.friends", emoji: "🧑‍🤝‍🧑" },
    ],
  },
  {
    key: "time",
    titleKey: "q.time.title",
    options: [
      { value: "short", labelKey: "q.time.short", emoji: "⏱️", hintKey: "q.time.short.hint" },
      { value: "movie", labelKey: "q.time.movie", emoji: "🎬", hintKey: "q.time.movie.hint" },
      { value: "binge", labelKey: "q.time.binge", emoji: "📺", hintKey: "q.time.binge.hint" },
    ],
  },
  {
    key: "fam",
    titleKey: "q.fam.title",
    options: [
      { value: "new", labelKey: "q.fam.new", emoji: "✨" },
      { value: "known", labelKey: "q.fam.known", emoji: "❤️" },
    ],
  },
  {
    key: "kids",
    titleKey: "q.kids.title",
    options: [
      { value: "1", labelKey: "q.kids.yes", emoji: "✅", hintKey: "q.kids.yes.hint" },
      { value: "0", labelKey: "q.kids.no", emoji: "🤷" },
    ],
  },
];

const MOOD_VALUES = new Set<string>(["laugh", "thrill", "horror", "drama", "chill"]);
const COMPANY_VALUES = new Set<string>(["alone", "family", "friends"]);
const TIME_VALUES = new Set<string>(["short", "movie", "binge"]);
const FAM_VALUES = new Set<string>(["new", "known"]);

type RawParams = Record<string, string | string[] | undefined>;

function first(v: string | string[] | undefined): string | undefined {
  return Array.isArray(v) ? v[0] : v;
}

/**
 * Result links are shareable, so params arrive from strangers' clipboards.
 * Anything unrecognised falls back to a sane default instead of throwing.
 */
export function parseAnswers(params: RawParams): QuizAnswers {
  const mood = first(params.mood);
  const who = first(params.who);
  const time = first(params.time);
  const fam = first(params.fam);
  const kids = first(params.kids);

  return {
    mood: (mood && MOOD_VALUES.has(mood) ? mood : "thrill") as Mood,
    who: (who && COMPANY_VALUES.has(who) ? who : "alone") as Company,
    time: (time && TIME_VALUES.has(time) ? time : "movie") as TimeBucket,
    fam: (fam && FAM_VALUES.has(fam) ? fam : "new") as Familiarity,
    kids: kids === "1" || kids === "true",
  };
}

export function parseVariant(params: RawParams): number {
  const raw = first(params.v);
  const n = Number.parseInt(raw ?? "0", 10);
  return Number.isFinite(n) && n > 0 ? n : 0;
}

/** Only the path is localised; the query shape is what makes a link shareable. */
export function resultHref(locale: Locale, a: QuizAnswers, variant = 0): string {
  const q = new URLSearchParams({
    mood: a.mood,
    who: a.who,
    time: a.time,
    fam: a.fam,
    kids: a.kids ? "1" : "0",
  });
  if (variant > 0) q.set("v", String(variant));
  return `/${locale}/result?${q.toString()}`;
}
