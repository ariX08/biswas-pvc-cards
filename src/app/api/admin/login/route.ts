import { NextRequest, NextResponse } from "next/server";
import {
  createAdminSessionToken,
  sessionCookieOptions,
} from "@/lib/admin-auth";
import { rateLimit, clientIp } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  const ip = clientIp(req);
  const rl = rateLimit(`admin-login:${ip}`, 5, 60_000);
  if (!rl.ok) {
    return NextResponse.json(
      { error: "Too many attempts. Try again in a minute." },
      { status: 429 }
    );
  }

  const body = await req.json().catch(() => ({}));
  const password = body.password as string;
  const expected = process.env.ADMIN_PASSWORD;

  if (!expected) {
    return NextResponse.json({ error: "unavailable" }, { status: 503 });
  }
  if (!password || password !== expected) {
    return NextResponse.json({ error: "invalid" }, { status: 401 });
  }

  const token = await createAdminSessionToken();
  const res = NextResponse.json({ success: true });
  res.cookies.set("admin_session", token, sessionCookieOptions());
  return res;
}
