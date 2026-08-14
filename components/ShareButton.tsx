"use client";

import { useState } from "react";
import { t, type Locale } from "@/lib/i18n";

export default function ShareButton({
  locale,
  title,
}: {
  locale: Locale;
  title: string;
}) {
  const [copied, setCopied] = useState(false);

  async function share() {
    const url = window.location.href;
    const text = `${t(locale, "share.textPrefix")} ${title}`;

    if (navigator.share) {
      try {
        await navigator.share({ title: t(locale, "brand.name"), text, url });
        return;
      } catch {
        // User dismissed the sheet, or the browser refused — fall through to copy.
      }
    }

    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <button
      type="button"
      onClick={share}
      className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-line bg-surface px-4 text-sm font-semibold transition hover:border-accent/60 hover:bg-surface-2"
    >
      <svg viewBox="0 0 24 24" aria-hidden className="size-4 fill-current">
        <path d="M18 16.08a2.9 2.9 0 0 0-1.96.77L8.91 12.7a3.3 3.3 0 0 0 0-1.4l7.05-4.11A3 3 0 1 0 15 5c0 .24.04.47.09.7L8.04 9.81a3 3 0 1 0 0 4.38l7.12 4.16c-.05.21-.08.43-.08.65a2.92 2.92 0 1 0 2.92-2.92Z" />
      </svg>
      {t(locale, copied ? "share.copied" : "share.action")}
    </button>
  );
}
