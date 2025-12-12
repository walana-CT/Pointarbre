import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getUserFromToken } from "@/lib/auth";

/**
 * GET /api/admin/parcelles
 * Liste toutes les parcelles
 */
export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get("session")?.value;
    const user = token ? await getUserFromToken(token) : null;

    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
    }

    const parcelles = await prisma.parcelle.findMany({
      orderBy: { name: "asc" },
      include: {
        foret: {
          include: {
            triage: true,
          },
        },
      },
    });

    return NextResponse.json(parcelles);
  } catch (error) {
    console.error("Erreur GET /api/admin/parcelles:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

/**
 * POST /api/admin/parcelles
 * Crée une nouvelle parcelle
 */
export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get("session")?.value;
    const user = token ? await getUserFromToken(token) : null;

    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
    }

    const body = await req.json();
    const { name, foretId } = body;

    if (!name || !name.trim()) {
      return NextResponse.json({ error: "Nom requis" }, { status: 400 });
    }

    if (!foretId) {
      return NextResponse.json({ error: "Forêt requise" }, { status: 400 });
    }

    const parcelle = await prisma.parcelle.create({
      data: {
        name: name.trim(),
        foretId,
      },
      include: {
        foret: {
          include: {
            triage: true,
          },
        },
      },
    });

    return NextResponse.json(parcelle);
  } catch (error) {
    console.error("Erreur POST /api/admin/parcelles:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
