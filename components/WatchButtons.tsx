import { t, type Locale } from "@/lib/i18n";
import { netflixLink, shahidLink } from "@/lib/links";
import type { Title } from "@/lib/types";

/**
 * The whole point of the site: never a plain text link, always an obvious
 * button, and only for platforms where we believe the title is available.
 */
export default function WatchButtons({
  locale,
  title,
  size = "sm",
}: {
  locale: Locale;
  title: Title;
  size?: "sm" | "lg";
}) {
  const lg = size === "lg";
  const base = lg
    ? "flex-1 min-h-14 text-base gap-2"
    : "flex-1 min-h-11 text-sm gap-1.5";
  const cls = `inline-flex items-center justify-center rounded-xl px-3 font-semibold text-white transition active:scale-[0.98] ${base}`;

  return (
    <div className="flex gap-2">
      {title.platforms.shahid && (
        <a
          href={shahidLink(title)}
          target="_blank"
          rel="noopener noreferrer"
          className={`${cls} bg-shahid hover:brightness-110`}
        >
          <PlayIcon />
          {t(locale, lg ? "watch.shahid.long" : "watch.shahid")}
        </a>
      )}
      {title.platforms.netflix && (
        <a
          href={netflixLink(title)}
          target="_blank"
          rel="noopener noreferrer"
          className={`${cls} bg-netflix hover:brightness-110`}
        >
          <PlayIcon />
          {t(locale, lg ? "watch.netflix.long" : "watch.netflix")}
        </a>
      )}
    </div>
  );
}

function PlayIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className="size-4 shrink-0 fill-current">
      <path d="M8 5v14l11-7z" />
    </svg>
  );
}
