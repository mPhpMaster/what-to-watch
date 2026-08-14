import Link from "next/link";
import { t, type Locale } from "@/lib/i18n";

export default function SiteFooter({ locale }: { locale: Locale }) {
  return (
    <footer className="mt-auto border-t border-line px-4 py-8 text-center text-xs leading-relaxed text-muted sm:px-6">
      <p>{t(locale, "footer.note")}</p>
      <p className="mt-2">
        <Link
          href={`/${locale}/admin`}
          className="inline-flex min-h-11 items-center underline underline-offset-4 hover:text-foreground"
        >
          {t(locale, "footer.admin")}
        </Link>
      </p>
    </footer>
  );
}
