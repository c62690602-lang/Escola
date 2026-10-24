import { createHmac, timingSafeEqual, randomBytes } from "node:crypto";
import type { NextRequest } from "next/server";
const ephemeral = randomBytes(32).toString("hex");
export function adminConfigured() {
  return (process.env.ADMIN_PASSWORD?.length || 0) >= 16;
}
function signature(s: string) {
  return createHmac("sha256", process.env.ADMIN_PASSWORD || ephemeral)
    .update(s)
    .digest("hex");
}
export function constantEqual(a: string, b: string) {
  const ah = createHmac("sha256", ephemeral).update(a).digest();
  const bh = createHmac("sha256", ephemeral).update(b).digest();
  return timingSafeEqual(ah, bh);
}
export function createSession() {
  const body = `${Date.now() + 8 * 60 * 60 * 1000}.${randomBytes(16).toString("hex")}`;
  return `${body}.${signature(body)}`;
}
export function validSession(token: string | undefined) {
  if (!token || !adminConfigured()) return false;
  const pieces = token.split(".");
  if (pieces.length !== 3 || !/^\d+$/.test(pieces[0])) return false;
  const expiry = Number(pieces[0]);
  return (
    expiry > Date.now() &&
    expiry <= Date.now() + 8 * 60 * 60 * 1000 &&
    constantEqual(signature(`${pieces[0]}.${pieces[1]}`), pieces[2])
  );
}
export function sameOrigin(req: NextRequest) {
  const origin = req.headers.get("origin");
  if (!origin) return false;
  try {
    return (
      new URL(origin).origin ===
      new URL(process.env.NEXT_PUBLIC_SITE_URL || req.url).origin
    );
  } catch {
    return false;
  }
}
export function clientKey(req: NextRequest) {
  // Vercel supplies x-vercel-forwarded-for; other deployments use a global bucket rather than trusting arbitrary forwarding headers.
  const ip = process.env.VERCEL
    ? req.headers.get("x-vercel-forwarded-for")?.split(",")[0]?.trim() ||
      "unknown"
    : "local-shared";
  return signature(ip);
}
