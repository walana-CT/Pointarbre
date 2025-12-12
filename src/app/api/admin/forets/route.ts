import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getUserFromToken } from "@/lib/auth";

/**
 * GET /api/admin/forets
 * Liste toutes les forêts
 */
export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get("session")?.value;
    const user = token ? await getUserFromToken(token) : null;

    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
    }

    const forets = await prisma.foret.findMany({
      orderBy: { name: "asc" },
      include: {
        triage: true,
        _count: {
          select: { parcelles: true },
        },
      },
    });

    return NextResponse.json(forets);
  } catch (error) {
    console.error("Erreur GET /api/admin/forets:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

/**
 * POST /api/admin/forets
 * Crée une nouvelle forêt
 */
export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get("session")?.value;
    const user = token ? await getUserFromToken(token) : null;

    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
    }

    const body = await req.json();
    const { name, triageId } = body;

    if (!name || !name.trim()) {
      return NextResponse.json({ error: "Nom requis" }, { status: 400 });
    }

    if (!triageId) {
      return NextResponse.json({ error: "Triage requis" }, { status: 400 });
    }

    const foret = await prisma.foret.create({
      data: {
        name: name.trim(),
        triageId,
      },
      include: {
        triage: true,
      },
    });

    return NextResponse.json(foret);
  } catch (error: any) {
    if (error.code === "P2002") {
      return NextResponse.json({ error: "Ce nom existe déjà" }, { status: 400 });
    }
    console.error("Erreur POST /api/admin/forets:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
