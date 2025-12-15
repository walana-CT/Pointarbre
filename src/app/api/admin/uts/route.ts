import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getUserFromToken } from "@/lib/auth";

/**
 * GET /api/admin/uts
 * Liste toutes les UTs
 */
export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get("session")?.value;
    const user = token ? await getUserFromToken(token) : null;

    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
    }

    const uts = await prisma.ut.findMany({
      orderBy: { number: "asc" },
      include: {
        _count: {
          select: { users: true, agences: true },
        },
      },
    });

    return NextResponse.json(uts);
  } catch (error) {
    console.error("Erreur GET /api/admin/uts:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

/**
 * POST /api/admin/uts
 * Crée une nouvelle UT
 */
export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get("session")?.value;
    const user = token ? await getUserFromToken(token) : null;

    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
    }

    const body = await req.json();
    const { number, name } = body;

    if (!number || !number.trim()) {
      return NextResponse.json({ error: "Numéro requis" }, { status: 400 });
    }

    if (!name || !name.trim()) {
      return NextResponse.json({ error: "Nom requis" }, { status: 400 });
    }

    const ut = await prisma.ut.create({
      data: { 
        number: number.trim(),
        name: name.trim(),
      },
    });

    return NextResponse.json(ut);
  } catch (error) {
    console.error("Erreur POST /api/admin/uts:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
