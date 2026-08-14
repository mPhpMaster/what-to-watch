import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { StoreError, canWrite, deleteTitle, updateTitle } from "@/lib/store";
import { validateTitle } from "@/lib/validate";

/** Errors are `lib/i18n` message keys; the admin UI localises them. */

async function guard(): Promise<NextResponse | null> {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "err.unauthorized" }, { status: 401 });
  }
  if (!canWrite()) {
    return NextResponse.json({ error: "err.readOnly" }, { status: 503 });
  }
  return null;
}

function failure(e: unknown): NextResponse {
  if (e instanceof StoreError) {
    return NextResponse.json({ error: e.message }, { status: e.status });
  }
  return NextResponse.json({ error: "err.server" }, { status: 500 });
}

export async function PUT(req: Request, { params }: RouteContext<"/api/titles/[id]">) {
  const blocked = await guard();
  if (blocked) return blocked;

  const { id } = await params;
  const parsed = validateTitle(await req.json().catch(() => null));
  if (!parsed.ok) {
    return NextResponse.json({ errors: parsed.errors }, { status: 400 });
  }

  try {
    return NextResponse.json(await updateTitle(id, parsed.value));
  } catch (e) {
    return failure(e);
  }
}

export async function DELETE(_req: Request, { params }: RouteContext<"/api/titles/[id]">) {
  const blocked = await guard();
  if (blocked) return blocked;

  const { id } = await params;
  try {
    await deleteTitle(id);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return failure(e);
  }
}
