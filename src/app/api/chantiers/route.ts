import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getUserFromToken } from "@/lib/auth";

/**
 * GET /api/chantiers
 * Récupère tous les chantiers de l'utilisateur connecté
 */
export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get("session")?.value;
    const user = token ? await getUserFromToken(token) : null;

    if (!user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    // Récupérer le paramètre archived depuis l'URL
    const { searchParams } = new URL(req.url);
    const archived = searchParams.get("archived") === "true";

    const chantiers = await prisma.chantier.findMany({
      where: {
        userId: user.id,
        // Si archived=true, on prend les chantiers avec date_fin
        // Sinon, on prend ceux sans date_fin (actifs)
        date_fin: archived ? { not: null } : null,
      },
      orderBy: { date_debut: "desc" },
      include: {
        jours: {
          select: { id: true },
        },
      },
    });

    return NextResponse.json(chantiers);
  } catch (error) {
    console.error("Erreur GET /api/chantiers:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

/**
 * POST /api/chantiers
 * Crée un nouveau chantier pour l'utilisateur connecté
 */
export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get("session")?.value;
    const user = token ? await getUserFromToken(token) : null;

    if (!user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const body = await req.json();
    const { date_debut, foret, triage, parcelle } = body;

    // Validation basique
    if (!date_debut || !foret || !triage || !parcelle) {
      return NextResponse.json({ error: "Champs requis manquants" }, { status: 400 });
    }

    const dateDebut = new Date(date_debut);

    const chantier = await prisma.chantier.create({
      data: {
        date_debut: dateDebut,
        date_fin: null,
        foret,
        triage,
        parcelle,
        userId: user.id,
      },
    });

    return NextResponse.json(chantier, { status: 201 });
  } catch (error) {
    console.error("Erreur POST /api/chantiers:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
