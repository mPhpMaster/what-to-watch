import "server-only";
import { t, type Locale } from "./i18n";

/**
 * A small local touch under the CTA. It is decoration: every failure path
 * degrades to a time-of-day line, and nothing here may block the page.
 */

const RIYADH = { lat: 24.7136, lon: 46.6753, tz: "Asia/Riyadh" };

export interface Vibe {
  emoji: string;
  text: string;
}

function riyadhHour(): number {
  const hour = new Intl.DateTimeFormat("en-US", {
    timeZone: RIYADH.tz,
    hour: "numeric",
    hour12: false,
  }).format(new Date());
  return Number.parseInt(hour, 10) % 24;
}

function timeOfDayVibe(locale: Locale): Vibe {
  const h = riyadhHour();
  if (h < 5) return { emoji: "🌙", text: t(locale, "vibe.night") };
  if (h < 12) return { emoji: "☀️", text: t(locale, "vibe.morning") };
  if (h < 17) return { emoji: "🌤️", text: t(locale, "vibe.afternoon") };
  return { emoji: "🌆", text: t(locale, "vibe.evening") };
}

function withTemp(locale: Locale, key: "vibe.hot" | "vibe.cold", temp: number): string {
  return t(locale, key).replace("{temp}", String(Math.round(temp)));
}

/** Open-Meteo needs no API key, so this works out of the box. */
export async function getVibe(locale: Locale): Promise<Vibe> {
  try {
    const url =
      `https://api.open-meteo.com/v1/forecast?latitude=${RIYADH.lat}` +
      `&longitude=${RIYADH.lon}&current=temperature_2m&timezone=${encodeURIComponent(RIYADH.tz)}`;

    const res = await fetch(url, {
      next: { revalidate: 3600 },
      signal: AbortSignal.timeout(2500),
    });
    if (!res.ok) return timeOfDayVibe(locale);

    const data = (await res.json()) as { current?: { temperature_2m?: number } };
    const temp = data.current?.temperature_2m;
    if (typeof temp !== "number") return timeOfDayVibe(locale);

    if (temp >= 38) return { emoji: "🥵", text: withTemp(locale, "vibe.hot", temp) };
    if (temp <= 15) return { emoji: "🧣", text: withTemp(locale, "vibe.cold", temp) };
    return timeOfDayVibe(locale);
  } catch {
    return timeOfDayVibe(locale);
  }
}
