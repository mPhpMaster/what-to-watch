import type { MessageKey } from "./i18n";
import { COMPANIES, MOODS, TIME_BUCKETS, type Title } from "./types";

/**
 * Admin input is the only way bad data enters the catalog, so everything is
 * checked here — including the invariant that a title must be reachable on at
 * least one platform, or the site would recommend something nobody can open.
 *
 * Errors are message *keys*, not sentences: validation runs on the server but
 * the reader's language is only known in the browser, so the API hands the key
 * back and the admin UI renders it in whichever locale it is showing.
 */

export type Validated =
  | { ok: true; value: Title }
  | { ok: false; errors: MessageKey[] };

const ID_RE = /^[a-z0-9][a-z0-9-]*$/;

function str(v: unknown): string {
  return typeof v === "string" ? v.trim() : "";
}

function strArray(v: unknown): string[] {
  if (Array.isArray(v)) return v.map((x) => str(x)).filter(Boolean);
  if (typeof v === "string") {
    return v
      .split(/[,،]/)
      .map((s) => s.trim())
      .filter(Boolean);
  }
  return [];
}

function num(v: unknown): number | undefined {
  const n = typeof v === "number" ? v : Number.parseInt(str(v), 10);
  return Number.isFinite(n) ? n : undefined;
}

function bool(v: unknown): boolean {
  return v === true || v === "true" || v === "1" || v === "on";
}

function httpsUrl(
  v: unknown,
  error: MessageKey,
  errors: MessageKey[],
): string | undefined {
  const s = str(v);
  if (!s) return undefined;
  if (!/^https:\/\//i.test(s)) {
    errors.push(error);
    return undefined;
  }
  return s;
}

export function validateTitle(input: unknown): Validated {
  const errors: MessageKey[] = [];
  const raw = (input ?? {}) as Record<string, unknown>;

  const id = str(raw.id).toLowerCase();
  if (!ID_RE.test(id)) errors.push("err.id");

  const titleAr = str(raw.titleAr);
  if (!titleAr) errors.push("err.titleAr");

  const titleEn = str(raw.titleEn);
  if (!titleEn) errors.push("err.titleEn");

  const year = num(raw.year);
  if (year === undefined || year < 1900 || year > 2100) errors.push("err.year");

  const kind = str(raw.kind);
  if (kind !== "movie" && kind !== "series") errors.push("err.kind");

  const moods = strArray(raw.moods).filter((m) => (MOODS as string[]).includes(m));
  if (moods.length === 0) errors.push("err.moods");

  const audience = strArray(raw.audience).filter((a) => (COMPANIES as string[]).includes(a));
  if (audience.length === 0) errors.push("err.audience");

  const timeBucket = str(raw.timeBucket);
  if (!(TIME_BUCKETS as string[]).includes(timeBucket)) errors.push("err.timeBucket");

  const popularity = num(raw.popularity) ?? 50;
  if (popularity < 0 || popularity > 100) errors.push("err.popularity");

  const platformsRaw = (raw.platforms ?? {}) as Record<string, unknown>;
  const platforms = {
    shahid: bool(platformsRaw.shahid),
    netflix: bool(platformsRaw.netflix),
  };
  if (!platforms.shahid && !platforms.netflix) {
    errors.push("err.platforms");
  }

  const shahidUrl = httpsUrl(raw.shahidUrl, "err.shahidUrl", errors);
  const netflixUrl = httpsUrl(raw.netflixUrl, "err.netflixUrl", errors);

  if (errors.length > 0) return { ok: false, errors };

  const value: Title = {
    id,
    titleAr,
    titleEn,
    year: year!,
    kind: kind as Title["kind"],
    genresAr: strArray(raw.genresAr),
    moods: moods as Title["moods"],
    timeBucket: timeBucket as Title["timeBucket"],
    familyFriendly: bool(raw.familyFriendly),
    audience: audience as Title["audience"],
    iconic: bool(raw.iconic),
    popularity,
    overviewAr: str(raw.overviewAr),
    platforms,
  };

  const overviewEn = str(raw.overviewEn);
  if (overviewEn) value.overviewEn = overviewEn;

  const runtimeMin = num(raw.runtimeMin);
  if (runtimeMin && runtimeMin > 0) value.runtimeMin = runtimeMin;

  const seasons = num(raw.seasons);
  if (seasons && seasons > 0) value.seasons = seasons;

  if (shahidUrl) value.shahidUrl = shahidUrl;
  if (netflixUrl) value.netflixUrl = netflixUrl;

  const tmdbId = num(raw.tmdbId);
  if (tmdbId) value.tmdbId = tmdbId;

  const posterPath = str(raw.posterPath);
  if (posterPath) value.posterPath = posterPath;

  return { ok: true, value };
}
