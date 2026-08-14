"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { t, tKey, type Locale } from "@/lib/i18n";

export default function LoginForm({ locale }: { locale: Locale }) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);

    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ password }),
    });

    if (res.ok) {
      setPassword("");
      router.refresh();
    } else {
      // The API answers with a message key, so it reads in the active language.
      const body = (await res.json().catch(() => ({}))) as { error?: string };
      setError(tKey(locale, body.error, "err.loginFailed"));
    }
    setBusy(false);
  }

  return (
    <form onSubmit={submit} className="mx-auto flex w-full max-w-sm flex-col gap-4 py-16">
      <h1 className="text-2xl font-bold">{t(locale, "admin.title")}</h1>
      <p className="text-sm text-muted">{t(locale, "admin.login.hint")}</p>

      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder={t(locale, "admin.login.password")}
        autoComplete="current-password"
        className="min-h-12 rounded-xl border border-line bg-surface px-4 outline-none focus:border-accent"
      />

      {error && (
        <p className="rounded-lg border border-netflix/40 bg-netflix/10 px-3 py-2 text-sm">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={busy || !password}
        className="min-h-12 rounded-xl bg-accent font-bold text-black transition disabled:opacity-50"
      >
        {t(locale, busy ? "admin.login.busy" : "admin.login.submit")}
      </button>
    </form>
  );
}
