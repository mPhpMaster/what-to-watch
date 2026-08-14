import { isReachable, type MatchResult, type QuizAnswers, type TimeBucket, type Title } from "./types";

/**
 * Pure ranking. No I/O, no randomness — the same answers always produce the
 * same result, which is what makes a shared result link reproducible.
 */

const W_MOOD = 40;
const W_TIME_EXACT = 25;
const W_TIME_NEAR = 8;
const W_COMPANY = 15;
const W_FAMILIARITY = 12;

/** short <-> movie and movie <-> binge are near misses; short <-> binge is not. */
const NEAR: Record<TimeBucket, TimeBucket[]> = {
  short: ["movie"],
  movie: ["short", "binge"],
  binge: ["movie"],
};

export function scoreTitle(t: Title, a: QuizAnswers): number {
  let score = 0;

  if (t.moods.includes(a.mood)) score += W_MOOD;

  if (t.timeBucket === a.time) score += W_TIME_EXACT;
  else if (NEAR[a.time].includes(t.timeBucket)) score += W_TIME_NEAR;

  if (t.audience.includes(a.who)) score += W_COMPANY;

  if (t.iconic === (a.fam === "known")) score += W_FAMILIARITY;

  score += t.popularity / 10;

  return score;
}

/** score desc, then popularity desc, then id asc — total order, no ties left. */
function rank(titles: Title[], a: QuizAnswers): Title[] {
  return [...titles].sort((x, y) => {
    const d = scoreTitle(y, a) - scoreTitle(x, a);
    if (d !== 0) return d;
    const p = y.popularity - x.popularity;
    if (p !== 0) return p;
    return x.id < y.id ? -1 : x.id > y.id ? 1 : 0;
  });
}

/**
 * @param variant bumped by "جرب مرة ثانية" — rotates the window into the ranked
 *   list so a retake surfaces the next-best titles rather than reshuffling.
 */
export function match(all: Title[], a: QuizAnswers, variant = 0): MatchResult {
  // Two hard filters, and only two. Reachability is a product promise (never
  // recommend something the user can't open) and the family flag is a safety
  // promise — neither is ever relaxed, not even in the fallback path.
  const pool = all.filter(
    (t) => isReachable(t) && (!a.kids || t.familyFriendly),
  );

  if (pool.length === 0) return { best: null, backups: [], relaxed: true };

  const onMood = pool.filter((t) => t.moods.includes(a.mood));
  const offMood = pool.filter((t) => !t.moods.includes(a.mood));

  let ranked = rank(onMood, a);
  let relaxed = false;

  // We need 4 (one hero + three backups). If this mood can't fill that under
  // the user's constraints, top up from the rest and say so in the UI.
  if (ranked.length < 4) {
    relaxed = ranked.length < pool.length && offMood.length > 0;
    ranked = [...ranked, ...rank(offMood, a)];
  }

  const offset = ranked.length > 0 ? variant % ranked.length : 0;
  const rotated = [...ranked.slice(offset), ...ranked.slice(0, offset)];

  return {
    best: rotated[0] ?? null,
    backups: rotated.slice(1, 4),
    relaxed,
  };
}

/** Homepage rails. Same catalog, sorted independently of the quiz. */
export function byPopularity(all: Title[]): Title[] {
  return [...all]
    .filter(isReachable)
    .sort((x, y) => y.popularity - x.popularity || (x.id < y.id ? -1 : 1));
}
