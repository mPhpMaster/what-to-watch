export type Mood = "laugh" | "thrill" | "horror" | "drama" | "chill";
export type Company = "alone" | "family" | "friends";
export type TimeBucket = "short" | "movie" | "binge";
export type Familiarity = "new" | "known";
export type Platform = "shahid" | "netflix";

export interface Title {
  /** Stable slug. Used in URLs and as the admin primary key. */
  id: string;
  titleAr: string;
  titleEn: string;
  year: number;
  kind: "movie" | "series";
  /** Display tags, already in Arabic. */
  genresAr: string[];
  moods: Mood[];
  timeBucket: TimeBucket;
  runtimeMin?: number;
  seasons?: number;
  familyFriendly: boolean;
  audience: Company[];
  /** true => a title people already know and rewatch, false => a discovery. */
  iconic: boolean;
  /** 0-100, hand-set local (Saudi) popularity. */
  popularity: number;
  overviewAr: string;
  /** Optional English copy; rendering falls back to overviewAr when empty. */
  overviewEn?: string;
  platforms: Record<Platform, boolean>;
  /** Optional verified deep links; when absent we fall back to platform search. */
  shahidUrl?: string;
  netflixUrl?: string;
  tmdbId?: number;
  /** TMDB poster path like "/abc123.jpg", filled by scripts/enrich-tmdb.mjs. */
  posterPath?: string;
}

export interface QuizAnswers {
  mood: Mood;
  who: Company;
  time: TimeBucket;
  fam: Familiarity;
  /** true when the user asked for family-safe content only. */
  kids: boolean;
}

export interface MatchResult {
  best: Title | null;
  backups: Title[];
  /** true when hard filters emptied the pool and we had to loosen them. */
  relaxed: boolean;
}

export const MOODS: Mood[] = ["laugh", "thrill", "horror", "drama", "chill"];
export const COMPANIES: Company[] = ["alone", "family", "friends"];
export const TIME_BUCKETS: TimeBucket[] = ["short", "movie", "binge"];

/** A title nobody can actually watch must never reach the UI. */
export function isReachable(t: Title): boolean {
  return Boolean(t.platforms?.shahid || t.platforms?.netflix);
}
