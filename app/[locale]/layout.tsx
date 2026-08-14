import type { Metadata, Viewport } from "next";
import { IBM_Plex_Sans_Arabic, Inter } from "next/font/google";
import { LOCALES, OG_LOCALE, dirOf, resolveLocale, t } from "@/lib/i18n";
import "../globals.css";

/**
 * This is the root layout: `app/layout.tsx` is intentionally absent so the
 * locale segment sits *above* the root layout, which is what lets `<html>`
 * carry a per-locale `lang`/`dir`. See the layout API reference ("The root
 * layout can be under a dynamic segment, for example when implementing
 * internationalization with app/[lang]/layout.js").
 */

// Both loaders publish the same custom property; only one class is ever applied.
const arabicFont = IBM_Plex_Sans_Arabic({
  variable: "--font-app",
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const latinFont = Inter({
  variable: "--font-app",
  subsets: ["latin"],
  display: "swap",
});

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const locale = resolveLocale((await params).locale);

  return {
    title: {
      default: t(locale, "meta.title"),
      template: t(locale, "meta.titleTemplate"),
    },
    description: t(locale, "meta.description"),
    openGraph: {
      title: t(locale, "meta.og.title"),
      description: t(locale, "meta.og.description"),
      locale: OG_LOCALE[locale],
      type: "website",
    },
  };
}

export const viewport: Viewport = {
  themeColor: "#0a0a0f",
};

export default async function RootLayout({ children, params }: LayoutProps<"/[locale]">) {
  const locale = resolveLocale((await params).locale);
  const font = locale === "ar" ? arabicFont : latinFont;

  return (
    <html
      lang={locale}
      dir={dirOf(locale)}
      className={`${font.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
