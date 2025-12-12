import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getUserFromToken } from "@/lib/auth";

/**
 * POST /api/jours/[id]/phases
 * Crée une nouvelle phase pour un jour
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = req.cookies.get("session")?.value;
    const user = token ? await getUserFromToken(token) : null;

    if (!user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const { id: jourId } = await params;

    // Vérifier que le jour existe et que l'utilisateur a accès au chantier
    const jour = await prisma.jour.findUnique({
      where: { id: jourId },
      include: {
        chantier: {
          select: { userId: true },
        },
      },
    });

    if (!jour) {
      return NextResponse.json({ error: "Jour introuvable" }, { status: 404 });
    }

    if (jour.chantier.userId !== user.id && user.role !== "ADMIN") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
    }

    const body = await req.json();
    const { type, hours, minutes } = body;

    // Validation basique
    if (!type || hours === undefined || minutes === undefined) {
      return NextResponse.json({ error: "Type et durée requis" }, { status: 400 });
    }

    // Créer une date avec heures et minutes (utiliser une date arbitraire, seule la durée compte)
    const dureeDate = new Date(0);
    dureeDate.setHours(parseInt(hours));
    dureeDate.setMinutes(parseInt(minutes));

    const phase = await prisma.phase.create({
      data: {
        jourId,
        type,
        duree: dureeDate,
      },
    });

    return NextResponse.json(phase, { status: 201 });
  } catch (error) {
    console.error("Erreur POST /api/jours/[id]/phases:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
