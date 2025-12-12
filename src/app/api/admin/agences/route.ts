import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getUserFromToken } from "@/lib/auth";

/**
 * GET /api/admin/agences
 * Liste toutes les agences
 */
export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get("session")?.value;
    const user = token ? await getUserFromToken(token) : null;

    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
    }

    const agences = await prisma.agence.findMany({
      orderBy: { name: "asc" },
      include: {
        _count: {
          select: { users: true, uts: true },
        },
      },
    });

    return NextResponse.json(agences);
  } catch (error) {
    console.error("Erreur GET /api/admin/agences:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

/**
 * POST /api/admin/agences
 * Crée une nouvelle agence
 */
export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get("session")?.value;
    const user = token ? await getUserFromToken(token) : null;

    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
    }

    const body = await req.json();
    const { name } = body;

    if (!name || !name.trim()) {
      return NextResponse.json({ error: "Nom requis" }, { status: 400 });
    }

    const agence = await prisma.agence.create({
      data: { name: name.trim() },
    });

    return NextResponse.json(agence);
  } catch (error) {
    console.error("Erreur POST /api/admin/agences:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
