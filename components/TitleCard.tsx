import Poster from "./Poster";
import WatchButtons from "./WatchButtons";
import {
  genresFor,
  kindLabel,
  primaryTitle,
  secondaryDir,
  secondaryTitle,
  type Locale,
} from "@/lib/i18n";
import { posterUrl } from "@/lib/links";
import type { Title } from "@/lib/types";

export default function TitleCard({
  locale,
  title,
  priority = false,
}: {
  locale: Locale;
  title: Title;
  priority?: boolean;
}) {
  const primary = primaryTitle(title, locale);

  return (
    <article className="flex h-full flex-col gap-2">
      <div className="relative aspect-[2/3] overflow-hidden rounded-2xl bg-surface-2 ring-1 ring-line">
        <Poster
          src={posterUrl(title, "w342")}
          label={primary}
          seed={title.id}
          sizes="(max-width: 640px) 45vw, 200px"
          priority={priority}
        />
        <span className="absolute end-2 top-2 rounded-full bg-black/70 px-2 py-0.5 text-[11px] font-medium text-white/90 backdrop-blur">
          {kindLabel(locale, title.kind)}
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-1">
        <h3 className="text-sm font-bold leading-tight text-foreground sm:text-base">
          {primary}
        </h3>
        <p className="text-xs text-muted">
          {/* The other script keeps its own direction inside the page. */}
          <span dir={secondaryDir(locale)}>{secondaryTitle(title, locale)}</span>
          {" · "}
          {title.year}
        </p>
        <p className="line-clamp-1 text-xs text-muted">
          {genresFor(title, locale).join(" · ")}
        </p>
      </div>

      <WatchButtons locale={locale} title={title} />
    </article>
  );
}
