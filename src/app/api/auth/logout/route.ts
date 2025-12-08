import { NextRequest, NextResponse } from "next/server";
import { revokeSession, clearSessionCookie } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get("session")?.value;
    if (token) {
      await revokeSession(token);
    }

    const res = NextResponse.json({ ok: true });
    res.headers.set("Set-Cookie", clearSessionCookie());
    return res;
  } catch (err) {
    console.error("Logout error", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
