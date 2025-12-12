import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

/**
 * GET /api/types-phases
 * Récupère tous les types de phases disponibles
 */
export async function GET() {
  try {
    const typesPhases = await prisma.typePhase.findMany({
      orderBy: { name: "asc" },
    });

    return NextResponse.json(typesPhases);
  } catch (error) {
    console.error("Erreur GET /api/types-phases:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
