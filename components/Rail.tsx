import TitleCard from "./TitleCard";
import type { Locale } from "@/lib/i18n";
import type { Title } from "@/lib/types";

/**
 * Horizontal snap rail. Scrolling follows the document direction natively, so
 * the same markup works for both rtl (ar) and ltr (en).
 */
export default function Rail({
  locale,
  heading,
  titles,
  priority = false,
}: {
  locale: Locale;
  heading: string;
  titles: Title[];
  priority?: boolean;
}) {
  if (titles.length === 0) return null;

  return (
    <section className="flex flex-col gap-3">
      <h2 className="px-4 text-lg font-bold sm:px-6 sm:text-xl">{heading}</h2>
      <div className="no-scrollbar flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2 sm:gap-4 sm:px-6">
        {titles.map((t, i) => (
          <div key={t.id} className="w-40 shrink-0 snap-start sm:w-44 lg:w-48">
            <TitleCard locale={locale} title={t} priority={priority && i < 3} />
          </div>
        ))}
      </div>
    </section>
  );
}
