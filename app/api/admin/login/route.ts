import { NextResponse } from "next/server";
import { ADMIN_COOKIE, checkPassword, createToken, isAdminConfigured } from "@/lib/auth";

/** Errors are `lib/i18n` message keys; the login form localises them. */
export async function POST(req: Request) {
  if (!isAdminConfigured()) {
    return NextResponse.json({ error: "err.adminNotConfigured" }, { status: 503 });
  }

  let password = "";
  try {
    const body = (await req.json()) as { password?: unknown };
    password = typeof body.password === "string" ? body.password : "";
  } catch {
    return NextResponse.json({ error: "err.badRequest" }, { status: 400 });
  }

  if (!checkPassword(password)) {
    return NextResponse.json({ error: "err.wrongPassword" }, { status: 401 });
  }

  const token = createToken();
  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE, token.value, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: token.maxAge,
  });
  return res;
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE, "", { path: "/", maxAge: 0 });
  return res;
}
