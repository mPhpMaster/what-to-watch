"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import {
  companyLabel,
  kindLabel,
  moodLabel,
  primaryTitle,
  t,
  tKey,
  timeLabel,
  type Locale,
  type MessageKey,
} from "@/lib/i18n";
import {
  COMPANIES,
  MOODS,
  TIME_BUCKETS,
  type Company,
  type Mood,
  type TimeBucket,
  type Title,
} from "@/lib/types";

interface Draft {
  id: string;
  titleAr: string;
  titleEn: string;
  year: string;
  kind: "movie" | "series";
  genres: string;
  moods: Mood[];
  timeBucket: TimeBucket;
  runtimeMin: string;
  seasons: string;
  familyFriendly: boolean;
  audience: Company[];
  iconic: boolean;
  popularity: string;
  overviewAr: string;
  overviewEn: string;
  shahid: boolean;
  netflix: boolean;
  shahidUrl: string;
  netflixUrl: string;
  posterPath: string;
}

const EMPTY: Draft = {
  id: "",
  titleAr: "",
  titleEn: "",
  year: String(new Date().getFullYear()),
  kind: "movie",
  genres: "",
  moods: [],
  timeBucket: "movie",
  runtimeMin: "",
  seasons: "",
  familyFriendly: true,
  audience: [],
  iconic: false,
  popularity: "50",
  overviewAr: "",
  overviewEn: "",
  shahid: false,
  netflix: false,
  shahidUrl: "",
  netflixUrl: "",
  posterPath: "",
};

function toDraft(x: Title): Draft {
  return {
    id: x.id,
    titleAr: x.titleAr,
    titleEn: x.titleEn,
    year: String(x.year),
    kind: x.kind,
    genres: x.genresAr.join("، "),
    moods: x.moods,
    timeBucket: x.timeBucket,
    runtimeMin: x.runtimeMin ? String(x.runtimeMin) : "",
    seasons: x.seasons ? String(x.seasons) : "",
    familyFriendly: x.familyFriendly,
    audience: x.audience,
    iconic: x.iconic,
    popularity: String(x.popularity),
    overviewAr: x.overviewAr,
    overviewEn: x.overviewEn ?? "",
    shahid: x.platforms.shahid,
    netflix: x.platforms.netflix,
    shahidUrl: x.shahidUrl ?? "",
    netflixUrl: x.netflixUrl ?? "",
    posterPath: x.posterPath ?? "",
  };
}

function toPayload(d: Draft) {
  return {
    id: d.id,
    titleAr: d.titleAr,
    titleEn: d.titleEn,
    year: d.year,
    kind: d.kind,
    genresAr: d.genres,
    moods: d.moods,
    timeBucket: d.timeBucket,
    runtimeMin: d.runtimeMin,
    seasons: d.seasons,
    familyFriendly: d.familyFriendly,
    audience: d.audience,
    iconic: d.iconic,
    popularity: d.popularity,
    overviewAr: d.overviewAr,
    overviewEn: d.overviewEn,
    platforms: { shahid: d.shahid, netflix: d.netflix },
    shahidUrl: d.shahidUrl,
    netflixUrl: d.netflixUrl,
    posterPath: d.posterPath,
  };
}

/** The API answers with message keys; turn them into text in the active locale. */
function readError(
  locale: Locale,
  body: { error?: string; errors?: string[] },
  fallback: MessageKey,
): string {
  if (Array.isArray(body.errors) && body.errors.length > 0) {
    return body.errors.map((k) => tKey(locale, k, fallback)).join(" · ");
  }
  return tKey(locale, body.error, fallback);
}

export default function AdminApp({
  locale,
  initial,
  writable,
  driver,
}: {
  locale: Locale;
  initial: Title[];
  writable: boolean;
  driver: "fs" | "blob";
}) {
  const router = useRouter();
  const [titles, setTitles] = useState(initial);
  const [query, setQuery] = useState("");
  const [draft, setDraft] = useState<Draft | null>(null);
  /** null = creating, string = editing that id */
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return titles;
    return titles.filter(
      (x) =>
        x.titleAr.includes(q) ||
        x.titleEn.toLowerCase().includes(q) ||
        x.id.includes(q),
    );
  }, [titles, query]);

  function set<K extends keyof Draft>(key: K, value: Draft[K]) {
    setDraft((d) => (d ? { ...d, [key]: value } : d));
  }

  function toggle<T>(list: T[], value: T): T[] {
    return list.includes(value) ? list.filter((x) => x !== value) : [...list, value];
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!draft) return;
    setBusy(true);
    setError(null);

    const res = await fetch(
      editingId ? `/api/titles/${encodeURIComponent(editingId)}` : "/api/titles",
      {
        method: editingId ? "PUT" : "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(toPayload(draft)),
      },
    );

    const body = (await res.json().catch(() => ({}))) as Title & {
      error?: string;
      errors?: string[];
    };

    if (!res.ok) {
      setError(readError(locale, body, "err.saveFailed"));
      setBusy(false);
      return;
    }

    setTitles((list) =>
      editingId
        ? list.map((x) => (x.id === editingId ? body : x))
        : [...list, body],
    );
    setDraft(null);
    setEditingId(null);
    setBusy(false);
    router.refresh();
  }

  async function remove(x: Title) {
    if (!confirm(`${t(locale, "admin.confirmDelete")}\n\n${primaryTitle(x, locale)}`)) {
      return;
    }
    setBusy(true);
    setError(null);

    const res = await fetch(`/api/titles/${encodeURIComponent(x.id)}`, { method: "DELETE" });
    if (!res.ok) {
      const body = (await res.json().catch(() => ({}))) as {
        error?: string;
        errors?: string[];
      };
      setError(readError(locale, body, "err.deleteFailed"));
    } else {
      setTitles((list) => list.filter((y) => y.id !== x.id));
      router.refresh();
    }
    setBusy(false);
  }

  async function logout() {
    await fetch("/api/admin/login", { method: "DELETE" });
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-5">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">{t(locale, "admin.title")}</h1>
          <p className="text-xs text-muted">
            {titles.length} {t(locale, "admin.titlesCount")} · {t(locale, "admin.storage")}{" "}
            {t(locale, driver === "blob" ? "admin.storage.blob" : "admin.storage.fs")}
          </p>
        </div>
        <button
          type="button"
          onClick={logout}
          className="min-h-10 rounded-lg border border-line px-3 text-sm text-muted hover:text-foreground"
        >
          {t(locale, "admin.logout")}
        </button>
      </header>

      {!writable && (
        <p className="rounded-xl border border-accent/40 bg-accent/10 px-4 py-3 text-sm">
          {t(locale, "admin.readOnly")}
        </p>
      )}

      {error && (
        <p className="rounded-xl border border-netflix/50 bg-netflix/10 px-4 py-3 text-sm">
          {error}
        </p>
      )}

      <div className="flex flex-wrap gap-2">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t(locale, "admin.search")}
          className="min-h-11 flex-1 rounded-xl border border-line bg-surface px-4 text-sm outline-none focus:border-accent"
        />
        <button
          type="button"
          disabled={!writable}
          onClick={() => {
            setDraft(EMPTY);
            setEditingId(null);
            setError(null);
          }}
          className="min-h-11 rounded-xl bg-accent px-4 text-sm font-bold text-black disabled:opacity-50"
        >
          {t(locale, "admin.new")}
        </button>
      </div>

      {draft && (
        <form
          onSubmit={save}
          className="flex flex-col gap-4 rounded-2xl border border-line bg-surface p-4"
        >
          <h2 className="font-bold">
            {editingId
              ? `${t(locale, "admin.form.editing")} ${editingId}`
              : t(locale, "admin.form.adding")}
          </h2>

          <div className="grid gap-3 sm:grid-cols-2">
            <Field label={t(locale, "admin.field.id")}>
              <input
                value={draft.id}
                onChange={(e) => set("id", e.target.value)}
                className={inputCls}
                dir="ltr"
                required
              />
            </Field>
            <Field label={t(locale, "admin.field.year")}>
              <input
                type="number"
                value={draft.year}
                onChange={(e) => set("year", e.target.value)}
                className={inputCls}
                required
              />
            </Field>
            <Field label={t(locale, "admin.field.titleAr")}>
              <input
                value={draft.titleAr}
                onChange={(e) => set("titleAr", e.target.value)}
                className={inputCls}
                dir="rtl"
                required
              />
            </Field>
            <Field label={t(locale, "admin.field.titleEn")}>
              <input
                value={draft.titleEn}
                onChange={(e) => set("titleEn", e.target.value)}
                className={inputCls}
                dir="ltr"
                required
              />
            </Field>
            <Field label={t(locale, "admin.field.kind")}>
              <select
                value={draft.kind}
                onChange={(e) => set("kind", e.target.value as Draft["kind"])}
                className={inputCls}
              >
                <option value="movie">{kindLabel(locale, "movie")}</option>
                <option value="series">{kindLabel(locale, "series")}</option>
              </select>
            </Field>
            <Field label={t(locale, "admin.field.timeBucket")}>
              <select
                value={draft.timeBucket}
                onChange={(e) => set("timeBucket", e.target.value as TimeBucket)}
                className={inputCls}
              >
                {TIME_BUCKETS.map((b) => (
                  <option key={b} value={b}>
                    {timeLabel(locale, b)}
                  </option>
                ))}
              </select>
            </Field>
            <Field label={t(locale, "admin.field.runtime")}>
              <input
                type="number"
                value={draft.runtimeMin}
                onChange={(e) => set("runtimeMin", e.target.value)}
                className={inputCls}
              />
            </Field>
            <Field label={t(locale, "admin.field.seasons")}>
              <input
                type="number"
                value={draft.seasons}
                onChange={(e) => set("seasons", e.target.value)}
                className={inputCls}
              />
            </Field>
            <Field label={t(locale, "admin.field.genres")}>
              <input
                value={draft.genres}
                onChange={(e) => set("genres", e.target.value)}
                className={inputCls}
                dir="rtl"
              />
            </Field>
            <Field label={t(locale, "admin.field.popularity")}>
              <input
                type="number"
                min={0}
                max={100}
                value={draft.popularity}
                onChange={(e) => set("popularity", e.target.value)}
                className={inputCls}
              />
            </Field>
          </div>

          <Field label={t(locale, "admin.field.overviewAr")}>
            <textarea
              value={draft.overviewAr}
              onChange={(e) => set("overviewAr", e.target.value)}
              rows={2}
              dir="rtl"
              className={`${inputCls} py-2`}
            />
          </Field>

          <Field label={t(locale, "admin.field.overviewEn")}>
            <textarea
              value={draft.overviewEn}
              onChange={(e) => set("overviewEn", e.target.value)}
              rows={2}
              dir="ltr"
              className={`${inputCls} py-2`}
            />
          </Field>

          <fieldset className="flex flex-wrap gap-2">
            <legend className="mb-1 text-xs text-muted">
              {t(locale, "admin.legend.moods")}
            </legend>
            {MOODS.map((m) => (
              <Toggle
                key={m}
                on={draft.moods.includes(m)}
                onClick={() => set("moods", toggle(draft.moods, m))}
              >
                {moodLabel(locale, m)}
              </Toggle>
            ))}
          </fieldset>

          <fieldset className="flex flex-wrap gap-2">
            <legend className="mb-1 text-xs text-muted">
              {t(locale, "admin.legend.audience")}
            </legend>
            {COMPANIES.map((c) => (
              <Toggle
                key={c}
                on={draft.audience.includes(c)}
                onClick={() => set("audience", toggle(draft.audience, c))}
              >
                {companyLabel(locale, c)}
              </Toggle>
            ))}
          </fieldset>

          <fieldset className="flex flex-wrap gap-2">
            <legend className="mb-1 text-xs text-muted">
              {t(locale, "admin.legend.traits")}
            </legend>
            <Toggle
              on={draft.familyFriendly}
              onClick={() => set("familyFriendly", !draft.familyFriendly)}
            >
              {t(locale, "admin.trait.familyFriendly")}
            </Toggle>
            <Toggle on={draft.iconic} onClick={() => set("iconic", !draft.iconic)}>
              {t(locale, "admin.trait.iconic")}
            </Toggle>
          </fieldset>

          <fieldset className="flex flex-col gap-3">
            <legend className="mb-1 text-xs text-muted">
              {t(locale, "admin.legend.platforms")}
            </legend>
            <div className="flex flex-wrap gap-2">
              <Toggle on={draft.shahid} onClick={() => set("shahid", !draft.shahid)}>
                {t(locale, "watch.shahid")}
              </Toggle>
              <Toggle on={draft.netflix} onClick={() => set("netflix", !draft.netflix)}>
                {t(locale, "watch.netflix")}
              </Toggle>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label={t(locale, "admin.field.shahidUrl")}>
                <input
                  value={draft.shahidUrl}
                  onChange={(e) => set("shahidUrl", e.target.value)}
                  className={inputCls}
                  dir="ltr"
                  placeholder="https://shahid.mbc.net/…"
                />
              </Field>
              <Field label={t(locale, "admin.field.netflixUrl")}>
                <input
                  value={draft.netflixUrl}
                  onChange={(e) => set("netflixUrl", e.target.value)}
                  className={inputCls}
                  dir="ltr"
                  placeholder="https://www.netflix.com/title/…"
                />
              </Field>
            </div>
          </fieldset>

          <Field label={t(locale, "admin.field.posterPath")}>
            <input
              value={draft.posterPath}
              onChange={(e) => set("posterPath", e.target.value)}
              className={inputCls}
              dir="ltr"
              placeholder="/abc123.jpg"
            />
          </Field>

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={busy}
              className="min-h-11 flex-1 rounded-xl bg-accent px-4 font-bold text-black disabled:opacity-50"
            >
              {t(locale, busy ? "admin.saving" : "admin.save")}
            </button>
            <button
              type="button"
              onClick={() => {
                setDraft(null);
                setEditingId(null);
                setError(null);
              }}
              className="min-h-11 rounded-xl border border-line px-4 text-sm"
            >
              {t(locale, "admin.cancel")}
            </button>
          </div>
        </form>
      )}

      <ul className="flex flex-col divide-y divide-line overflow-hidden rounded-2xl border border-line">
        {filtered.map((x) => (
          <li
            key={x.id}
            className="flex flex-wrap items-center gap-3 bg-surface px-4 py-3 text-sm"
          >
            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold">{primaryTitle(x, locale)}</p>
              <p className="truncate text-xs text-muted">
                <span dir="ltr">{x.id}</span> · {x.year} · {kindLabel(locale, x.kind)} ·{" "}
                {x.popularity}
              </p>
            </div>
            <div className="flex gap-1 text-[11px]">
              {x.platforms.shahid && (
                <span className="rounded bg-shahid px-1.5 py-0.5 text-white">
                  {t(locale, "watch.shahid")}
                </span>
              )}
              {x.platforms.netflix && (
                <span className="rounded bg-netflix px-1.5 py-0.5 text-white">
                  {t(locale, "watch.netflix")}
                </span>
              )}
            </div>
            <div className="flex gap-1">
              <button
                type="button"
                disabled={!writable}
                onClick={() => {
                  setDraft(toDraft(x));
                  setEditingId(x.id);
                  setError(null);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className="min-h-9 rounded-lg border border-line px-3 text-xs disabled:opacity-40"
              >
                {t(locale, "admin.edit")}
              </button>
              <button
                type="button"
                disabled={!writable || busy}
                onClick={() => remove(x)}
                className="min-h-9 rounded-lg border border-netflix/50 px-3 text-xs text-netflix disabled:opacity-40"
              >
                {t(locale, "admin.delete")}
              </button>
            </div>
          </li>
        ))}
        {filtered.length === 0 && (
          <li className="bg-surface px-4 py-6 text-center text-sm text-muted">
            {t(locale, "admin.noResults")}
          </li>
        )}
      </ul>
    </div>
  );
}

const inputCls =
  "min-h-11 w-full rounded-xl border border-line bg-surface-2 px-3 text-sm outline-none focus:border-accent";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-xs text-muted">{label}</span>
      {children}
    </label>
  );
}

function Toggle({
  on,
  onClick,
  children,
}: {
  on: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={on}
      className={`min-h-10 rounded-full border px-3 text-sm transition ${
        on ? "border-accent bg-accent/15 text-foreground" : "border-line text-muted"
      }`}
    >
      {children}
    </button>
  );
}
