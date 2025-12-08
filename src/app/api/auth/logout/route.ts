import { NextRequest, NextResponse } from "next/server";
import { revokeSession, parseTokenFromCookieHeader, clearSessionCookie } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const cookieHeader = req.headers.get("cookie") || "";
    const token = parseTokenFromCookieHeader(cookieHeader);
    if (token) await revokeSession(token);
    const res = NextResponse.json({ ok: true });
    res.headers.set("Set-Cookie", clearSessionCookie());
    return res;
  } catch (err) {
    console.error("Logout error", err);
    const res = NextResponse.json({ ok: false }, { status: 500 });
    res.headers.set("Set-Cookie", clearSessionCookie());
    return res;
  }
}
