import { NextRequest, NextResponse } from "next/server";
import { parseTokenFromCookieHeader } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { hashToken } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const cookieHeader = req.headers.get("cookie") || "";
    const token = parseTokenFromCookieHeader(cookieHeader);
    if (!token) return NextResponse.json({ user: null }, { status: 200 });

    const tokenHash = hashToken(token);
    const session = await prisma.session.findUnique({
      where: { tokenHash },
      include: {
        user: {
          include: {
            ut: {
              select: {
                id: true,
                number: true,
                name: true,
              },
            },
          },
        },
      },
    });

    if (!session || session.expiresAt < new Date() || session.user.isDisabled) {
      return NextResponse.json({ user: null }, { status: 200 });
    }

    return NextResponse.json(
      {
        user: {
          id: session.user.id,
          email: session.user.email,
          nom: session.user.nom,
          prenom: session.user.prenom,
          role: session.user.role,
          createdAt: session.user.createdAt,
          isDisabled: session.user.isDisabled,
          uts: session.user.ut,
        },
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("Me error", err);
    return NextResponse.json({ user: null }, { status: 500 });
  }
}
