import { NextRequest, NextResponse } from "next/server";
import { parseTokenFromCookieHeader, getUserFromToken } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const cookieHeader = req.headers.get("cookie") || "";
    const token = parseTokenFromCookieHeader(cookieHeader);
    const user = await getUserFromToken(token || undefined);
    if (!user) return NextResponse.json({ user: null }, { status: 200 });
    return NextResponse.json(
      { user: { id: user.id, email: user.email, name: user.name, role: user.role } },
      { status: 200 }
    );
  } catch (err) {
    console.error("Me error", err);
    return NextResponse.json({ user: null }, { status: 500 });
  }
}
