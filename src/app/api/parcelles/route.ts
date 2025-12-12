import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

/**
 * GET /api/parcelles?foretId=xxx
 * Récupère toutes les parcelles d'une forêt
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const foretId = searchParams.get("foretId");

    if (!foretId) {
      return NextResponse.json({ error: "foretId requis" }, { status: 400 });
    }

    const parcelles = await prisma.parcelle.findMany({
      where: { foretId },
      orderBy: { name: "asc" },
    });

    return NextResponse.json(parcelles);
  } catch (error) {
    console.error("Erreur GET /api/parcelles:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
