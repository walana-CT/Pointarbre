import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getUserFromToken } from "@/lib/auth";

/**
 * GET /api/admin/triages
 * Liste tous les triages
 */
export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get("session")?.value;
    const user = token ? await getUserFromToken(token) : null;

    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
    }

    const triages = await prisma.triage.findMany({
      orderBy: { name: "asc" },
      include: {
        _count: {
          select: { forets: true },
        },
      },
    });

    return NextResponse.json(triages);
  } catch (error) {
    console.error("Erreur GET /api/admin/triages:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

/**
 * POST /api/admin/triages
 * Crée un nouveau triage
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

    const triage = await prisma.triage.create({
      data: { name: name.trim() },
    });

    return NextResponse.json(triage);
  } catch (error: any) {
    if (error.code === "P2002") {
      return NextResponse.json({ error: "Ce nom existe déjà" }, { status: 400 });
    }
    console.error("Erreur POST /api/admin/triages:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
