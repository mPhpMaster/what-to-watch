import type { Metadata } from "next";
import AdminApp from "@/components/admin/AdminApp";
import LoginForm from "@/components/admin/LoginForm";
import SiteHeader from "@/components/SiteHeader";
import { isAdmin, isAdminConfigured } from "@/lib/auth";
import { resolveLocale, t, type Locale } from "@/lib/i18n";
import { canWrite, getAllTitles, storageDriver } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const locale = resolveLocale((await params).locale);
  return {
    title: t(locale, "meta.admin.title"),
    robots: { index: false, follow: false },
  };
}

export default async function AdminPage({ params }: PageProps<"/[locale]/admin">) {
  const locale = resolveLocale((await params).locale);
  const configured = isAdminConfigured();
  const authed = configured && (await isAdmin());

  return (
    <>
      <SiteHeader locale={locale} />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8 sm:px-6">
        {!configured ? (
          <SetupNotice locale={locale} />
        ) : !authed ? (
          <LoginForm locale={locale} />
        ) : (
          <AdminApp
            locale={locale}
            initial={await getAllTitles()}
            writable={canWrite()}
            driver={storageDriver()}
          />
        )}
      </main>
    </>
  );
}

function SetupNotice({ locale }: { locale: Locale }) {
  return (
    <div className="mx-auto flex max-w-md flex-col gap-3 py-16">
      <h1 className="text-2xl font-bold">{t(locale, "admin.setup.title")}</h1>
      <p className="text-sm leading-relaxed text-muted">
        {t(locale, "admin.setup.bodyBefore")}{" "}
        <code className="text-foreground" dir="ltr">
          .env.local
        </code>{" "}
        {t(locale, "admin.setup.bodyAfter")}
      </p>
      <pre
        dir="ltr"
        className="overflow-x-auto rounded-xl border border-line bg-surface p-4 text-xs"
      >
        {`ADMIN_PASSWORD=your-password\nADMIN_SECRET=a-long-random-string`}
      </pre>
    </div>
  );
}
