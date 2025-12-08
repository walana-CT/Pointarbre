import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyPassword, createSession } from "@/lib/auth";
import { z } from "zod";

const bodySchema = z.object({ email: z.string().email(), password: z.string() });

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = bodySchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: "Invalid payload" }, { status: 400 });

    const { email, password } = parsed.data;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    if (user.isDisabled) return NextResponse.json({ error: "Account disabled" }, { status: 403 });

    const ok = await verifyPassword(user.passwordHash, password);
    if (!ok) return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });

    const { token, cookie } = await createSession(user.id, 60 * 60 * 24 * 7); // 7 days
    const res = NextResponse.json({ id: user.id, email: user.email, name: user.name });
    res.headers.set("Set-Cookie", cookie);
    return res;
  } catch (err) {
    console.error("Login error", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
