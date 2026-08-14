#!/usr/bin/env node
/**
 * Backfills poster paths (and Arabic/English overviews, only where empty) from TMDB.
 *
 *   TMDB_API_KEY=... npm run enrich
 *   npm run enrich -- --force      re-fetch titles that already have a poster
 *   npm run enrich -- --dry        show what would change, write nothing
 *
 * Runs manually and offline from the app: the site never calls TMDB at request
 * time, so it needs no key to work and never leaks one to the browser.
 */

import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const FILE = path.join(process.cwd(), "data", "titles.json");
const BASE = "https://api.themoviedb.org/3";

const args = new Set(process.argv.slice(2));
const FORCE = args.has("--force");
const DRY = args.has("--dry");

const KEY = process.env.TMDB_API_KEY?.trim();
if (!KEY) {
  console.error(
    "\n  TMDB_API_KEY غير موجود.\n\n" +
      "  احصل على مفتاح مجاني من https://www.themoviedb.org/settings/api\n" +
      "  وحطه في .env.local ثم شغّل:  npm run enrich\n\n" +
      "  الموقع يشتغل بدون المفتاح — بس بيعرض بوسترات بديلة.\n",
  );
  process.exit(1);
}

/** Load .env.local by hand; this script runs outside Next's env loading. */
async function loadEnvLocal() {
  try {
    const raw = await readFile(path.join(process.cwd(), ".env.local"), "utf8");
    for (const line of raw.split("\n")) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
      if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
    }
  } catch {
    // No .env.local — env vars may still come from the shell.
  }
}

async function tmdb(endpoint, params) {
  const url = new URL(`${BASE}${endpoint}`);
  url.searchParams.set("api_key", KEY);
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null && v !== "") url.searchParams.set(k, String(v));
  }

  const res = await fetch(url);
  if (res.status === 429) {
    // TMDB rate limit — back off once and retry.
    await new Promise((r) => setTimeout(r, 2000));
    return tmdb(endpoint, params);
  }
  if (!res.ok) throw new Error(`${endpoint} → ${res.status}`);
  return res.json();
}

/**
 * Egyptian and Gulf titles are indexed inconsistently: sometimes under an
 * English title, sometimes only under the Arabic one. Try both before giving up.
 */
async function findTitle(t) {
  const endpoint = t.kind === "series" ? "/search/tv" : "/search/movie";
  const yearKey = t.kind === "series" ? "first_air_date_year" : "year";

  const attempts = [
    { query: t.titleEn, language: "ar", [yearKey]: t.year },
    { query: t.titleEn, language: "ar" },
    { query: t.titleAr, language: "ar" },
  ];

  for (const params of attempts) {
    if (!params.query) continue;
    const data = await tmdb(endpoint, params);
    const hit = data.results?.find((r) => r.poster_path) ?? data.results?.[0];
    if (hit) return hit;
  }
  return null;
}

/**
 * The search above asks for Arabic, so the English overview needs its own call.
 * TMDB returns "" (not null) for a missing translation, hence the trim guard.
 */
async function overviewIn(kind, id, language) {
  const data = await tmdb(kind === "series" ? `/tv/${id}` : `/movie/${id}`, { language });
  return typeof data.overview === "string" ? data.overview.trim() : "";
}

async function main() {
  await loadEnvLocal();

  const titles = JSON.parse(await readFile(FILE, "utf8"));
  const todo = titles.filter((t) => FORCE || !t.posterPath);

  console.log(`\n  ${todo.length} من ${titles.length} عمل يحتاج بوستر\n`);

  let found = 0;
  let missed = 0;

  for (const t of todo) {
    try {
      const hit = await findTitle(t);
      if (!hit) {
        missed++;
        console.log(`  ✗ ${t.id} — ما لقينا نتيجة`);
        continue;
      }

      t.tmdbId = hit.id;
      if (hit.poster_path) t.posterPath = hit.poster_path;
      // Hand-written copy always wins over TMDB's, in either language.
      if (!t.overviewAr?.trim() && hit.overview?.trim()) t.overviewAr = hit.overview.trim();
      if (!t.overviewEn?.trim()) {
        const en = await overviewIn(t.kind, hit.id, "en-US");
        if (en) t.overviewEn = en;
      }

      found++;
      console.log(`  ✓ ${t.id} → ${hit.poster_path ?? "(بدون بوستر)"}`);
    } catch (e) {
      missed++;
      console.log(`  ! ${t.id} — ${e.message}`);
    }

    await new Promise((r) => setTimeout(r, 120));
  }

  if (DRY) {
    console.log(`\n  --dry: ما تم حفظ أي شي. (${found} ناجح، ${missed} فاشل)\n`);
    return;
  }

  await writeFile(FILE, `${JSON.stringify(titles, null, 2)}\n`, "utf8");
  console.log(`\n  تم الحفظ في data/titles.json — ${found} ناجح، ${missed} فاشل\n`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
