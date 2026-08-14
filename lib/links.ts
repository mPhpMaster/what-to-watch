import type { Title } from "./types";

/**
 * Neither Shahid nor Netflix exposes a public availability API, so a curated
 * deep link wins when we have one and a platform search URL is the guaranteed
 * fallback: it always resolves, it never 404s, and it costs the user one tap.
 */

export function shahidLink(t: Title): string {
  if (t.shahidUrl) return t.shahidUrl;
  const q = t.titleAr || t.titleEn;
  return `https://shahid.mbc.net/ar/search?q=${encodeURIComponent(q)}`;
}

export function netflixLink(t: Title): string {
  if (t.netflixUrl) return t.netflixUrl;
  // Netflix search indexes the international title far better than the Arabic one.
  const q = t.titleEn || t.titleAr;
  return `https://www.netflix.com/search?q=${encodeURIComponent(q)}`;
}

export function posterUrl(
  t: Title,
  size: "w342" | "w500" | "w780" = "w500",
): string | null {
  return t.posterPath ? `https://image.tmdb.org/t/p/${size}${t.posterPath}` : null;
}
