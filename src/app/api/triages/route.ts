import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

/**
 * GET /api/triages
 * Récupère tous les triages disponibles
 */
export async function GET() {
  try {
    const triages = await prisma.triage.findMany({
      orderBy: { name: "asc" },
    });

    return NextResponse.json(triages);
  } catch (error) {
    console.error("Erreur GET /api/triages:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
