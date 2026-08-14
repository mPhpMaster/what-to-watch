import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { StoreError, canWrite, createTitle, getAllTitles } from "@/lib/store";
import { validateTitle } from "@/lib/validate";

/**
 * API routes stay unprefixed — they serve both locales. Errors travel as
 * `lib/i18n` message keys so the admin UI can render them in the language it
 * is currently showing.
 */

export async function GET() {
  return NextResponse.json(await getAllTitles());
}

export async function POST(req: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "err.unauthorized" }, { status: 401 });
  }
  if (!canWrite()) {
    return NextResponse.json({ error: "err.readOnly" }, { status: 503 });
  }

  const parsed = validateTitle(await req.json().catch(() => null));
  if (!parsed.ok) {
    return NextResponse.json({ errors: parsed.errors }, { status: 400 });
  }

  try {
    return NextResponse.json(await createTitle(parsed.value), { status: 201 });
  } catch (e) {
    if (e instanceof StoreError) {
      return NextResponse.json({ error: e.message }, { status: e.status });
    }
    return NextResponse.json({ error: "err.server" }, { status: 500 });
  }
}
