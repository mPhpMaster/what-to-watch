import "server-only";
import crypto from "node:crypto";
import { cookies } from "next/headers";

/**
 * Password-in-env admin gate. The password never leaves the server and is
 * never stored in the catalog; the browser only ever holds a signed,
 * expiring, httpOnly cookie.
 */

export const ADMIN_COOKIE = "w2w_admin";
const TTL_MS = 12 * 60 * 60 * 1000;

export function isAdminConfigured(): boolean {
  return Boolean(process.env.ADMIN_PASSWORD && process.env.ADMIN_SECRET);
}

function sign(payload: string): string {
  return crypto
    .createHmac("sha256", process.env.ADMIN_SECRET ?? "")
    .update(payload)
    .digest("hex");
}

/** Compare digests so the check takes the same time whatever the input. */
function safeEqual(a: string, b: string): boolean {
  const ha = crypto.createHash("sha256").update(a).digest();
  const hb = crypto.createHash("sha256").update(b).digest();
  return crypto.timingSafeEqual(ha, hb);
}

export function checkPassword(input: string): boolean {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) return false;
  return safeEqual(input, expected);
}

export function createToken(): { value: string; maxAge: number } {
  const exp = Date.now() + TTL_MS;
  const payload = `admin.${exp}`;
  return { value: `${payload}.${sign(payload)}`, maxAge: Math.floor(TTL_MS / 1000) };
}

export function verifyToken(token: string): boolean {
  const parts = token.split(".");
  if (parts.length !== 3) return false;
  const [subject, expRaw, signature] = parts;
  if (subject !== "admin") return false;

  const exp = Number.parseInt(expRaw, 10);
  if (!Number.isFinite(exp) || exp < Date.now()) return false;

  return safeEqual(sign(`${subject}.${exp}`), signature);
}

export async function isAdmin(): Promise<boolean> {
  if (!isAdminConfigured()) return false;
  const token = (await cookies()).get(ADMIN_COOKIE)?.value;
  return Boolean(token && verifyToken(token));
}
