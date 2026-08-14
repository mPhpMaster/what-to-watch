# وش أشاهد؟ / What2Watch

A bilingual (Arabic-first, RTL) site that answers one question for a Saudi audience: **what should I watch tonight?**

Two ways in, one catalog:

1. **Homepage** — trending and popular picks, visible immediately, no quiz required.
2. **Quiz** — five quick questions that return one personalized match plus three backups.

Every recommendation ends in an obvious **شاهد** / **نتفليكس** button, so the user can watch on whichever service they already pay for.

```bash
npm install
npm run dev          # http://localhost:3000 -> redirects to /ar
```

## Stack

Next.js 16 (App Router) · React 19 · TypeScript · Tailwind v4 · Vitest. No database and no i18n library — the catalog is a JSON file and translations are a typed object.

## Environment

Copy `.env.example` to `.env.local`. Everything is optional; the site runs with none of it set.

| Key | Needed for | Notes |
| --- | --- | --- |
| `ADMIN_PASSWORD` | `/admin` | Without it the panel shows a setup notice instead of a login |
| `ADMIN_SECRET` | `/admin` | Signs the session cookie. `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` |
| `TMDB_API_KEY` | `npm run enrich` | Posters only. Never read at request time |
| `BLOB_READ_WRITE_TOKEN` | admin writes on Vercel | Vercel's filesystem is read-only; see [Deploying](#deploying) |

## Scripts

```bash
npm run dev      # dev server
npm run build    # production build
npm test         # matcher + catalog integrity tests
npm run lint
npm run enrich   # backfill posters/overviews from TMDB (needs TMDB_API_KEY)
```

`npm run enrich -- --dry` previews without writing; `-- --force` re-fetches titles that already have a poster.

## Layout

```
app/[locale]/          pages: home, quiz, result, admin  (locale = ar | en)
app/api/               titles CRUD + admin login (unprefixed, shared by both locales)
proxy.ts               redirects / -> /ar
components/            UI, plus components/admin/
lib/
  types.ts             Title, QuizAnswers, the isReachable invariant
  i18n.ts              every user-facing string, both locales
  quiz.ts              question/answer config, URL param parsing
  match.ts             ranking (pure, no I/O)
  links.ts             Shahid/Netflix URL builders
  store.ts             catalog read/write, fs + blob drivers
  validate.ts          admin input validation
  auth.ts              HMAC-signed admin session
  weather.ts           Open-Meteo vibe line
data/titles.json       the catalog (64 seeded titles)
```

## How matching works

`lib/match.ts` is pure and deterministic — the same answers always produce the same result, which is what makes a shared result link reproducible.

**Two hard filters, never relaxed:**

- **Reachability** — a title with no platform is dropped everywhere, including the homepage. Recommending something the user can't open is worse than recommending nothing.
- **Family-safe** — if the user asked for family content, non-family titles are gone. Not loosened even when it leaves nothing to show.

**Then scoring:** mood +40, exact time bucket +25 (adjacent +8), company +15, familiarity +12, popularity ÷10. Ties break on popularity, then id, so the order is total.

If the chosen mood can't fill four slots under those filters, the pool widens to other moods, the result is flagged `relaxed`, and the UI says so. Asking for **رعب** *and* family-safe content hits this deliberately — no horror title in the catalog is family-friendly, so you get family-safe alternatives and an explanation, never a horror film slipped past the filter.

**"عطني اقتراح ثاني"** bumps a `?v=` counter that rotates the window into the ranked list, so a retake surfaces the next-best titles rather than reshuffling the same ones.

## Watch links

Neither Shahid nor Netflix publishes an availability API. Each title carries a curated `platforms` flag plus optional verified deep links:

- A deep link (`shahidUrl` / `netflixUrl`) is used when present.
- Otherwise the button opens that platform's **search** for the title — always resolves, never 404s.

Shahid search uses the Arabic title and Netflix the English one regardless of UI language, because that's what each catalog indexes best.

**Availability flags are best-effort and will drift** as catalogs change. A wrong flag costs one extra tap, never a dead link. The admin panel is the correction mechanism.

## Languages

Arabic is the default and `/` redirects to `/ar`. `/en` mirrors it with `dir="ltr"` and a Latin font.

All copy lives in `lib/i18n.ts`. The Arabic table defines the key type, so a missing or misspelled English translation is a **compile error**, not a blank string at runtime. Server-side validation and API errors travel as message keys (`{"errors":["err.platforms"]}`) and are rendered in whichever language the UI is showing.

The 64 seeded overviews are Arabic only. `overviewEn` exists on the model and is backfilled by `npm run enrich`; until then `/en` falls back to the Arabic overview rather than showing nothing.

## Admin

`/ar/admin` or `/en/admin` — add, edit, and delete titles without a redeploy.

Password from `ADMIN_PASSWORD`, compared in constant time; the browser only ever holds an httpOnly, sameSite, HMAC-signed cookie that expires in 12 hours. Every mutating route re-checks it and returns 401 otherwise. Validation rejects a title with no platform, so the reachability invariant can't be broken through the UI.

Writes go through a queue (read-modify-write) so two concurrent saves can't clobber each other.

## Deploying

The `fs` driver writes `data/titles.json` and works in dev and on any Node host with a writable disk.

On Vercel the filesystem is read-only. Add a Blob store and set `BLOB_READ_WRITE_TOKEN` — `lib/store.ts` switches drivers automatically. Without it the admin panel renders **read-only with a visible banner** rather than accepting edits that would silently vanish.

## Known limits

- **64 titles, not the 150–300 a production catalog wants.** Padding the seed further would have meant inventing availability data. Grow it through the admin panel.
- **Posters need a TMDB key.** Without one, every card falls back to a generated gradient poster with the title set large — the layout is designed for it, nothing breaks.
- **The weather line is decoration.** Open-Meteo needs no key; any failure degrades silently to a time-of-day line.
