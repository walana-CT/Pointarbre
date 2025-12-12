import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

/**
 * GET /api/forets?triageId=xxx
 * Récupère toutes les forêts d'un triage
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const triageId = searchParams.get("triageId");

    if (!triageId) {
      return NextResponse.json({ error: "triageId requis" }, { status: 400 });
    }

    const forets = await prisma.foret.findMany({
      where: { triageId },
      orderBy: { name: "asc" },
    });

    return NextResponse.json(forets);
  } catch (error) {
    console.error("Erreur GET /api/forets:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
