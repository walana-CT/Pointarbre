import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getUserFromToken } from "@/lib/auth";

/**
 * GET /api/chantiers/[id]/jours
 * Récupère tous les jours d'un chantier avec leurs phases
 */
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const token = req.cookies.get("session")?.value;
    const user = token ? await getUserFromToken(token) : null;

    if (!user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const { id } = await params;

    // Vérifier que le chantier appartient à l'utilisateur
    const chantier = await prisma.chantier.findUnique({
      where: { id },
      select: { userId: true },
    });

    if (!chantier) {
      return NextResponse.json({ error: "Chantier introuvable" }, { status: 404 });
    }

    if (chantier.userId !== user.id && user.role !== "ADMIN") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
    }

    const jours = await prisma.jour.findMany({
      where: { chantierId: id },
      orderBy: { date: "desc" },
      include: {
        phases: {
          orderBy: { id: "asc" },
        },
      },
    });

    return NextResponse.json(jours);
  } catch (error) {
    console.error("Erreur GET /api/chantiers/[id]/jours:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

/**
 * POST /api/chantiers/[id]/jours
 * Crée un nouveau jour pour un chantier
 */
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const token = req.cookies.get("session")?.value;
    const user = token ? await getUserFromToken(token) : null;

    if (!user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const { id } = await params;

    // Vérifier que le chantier appartient à l'utilisateur
    const chantier = await prisma.chantier.findUnique({
      where: { id },
      select: { userId: true },
    });

    if (!chantier) {
      return NextResponse.json({ error: "Chantier introuvable" }, { status: 404 });
    }

    if (chantier.userId !== user.id && user.role !== "ADMIN") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
    }

    const body = await req.json();
    const { date, h_rendement, location_materiel, ind_kilometrique, transport_materiel, panier } =
      body;

    // Validation basique
    if (!date) {
      return NextResponse.json({ error: "Date requise" }, { status: 400 });
    }

    const jour = await prisma.jour.create({
      data: {
        chantierId: id,
        date: new Date(date),
        h_rendement: h_rendement ? parseInt(h_rendement) : null,
        location_materiel: location_materiel ? parseInt(location_materiel) : null,
        ind_kilometrique: ind_kilometrique ? parseInt(ind_kilometrique) : null,
        transport_materiel: transport_materiel === true || transport_materiel === "true",
        panier: panier === true || panier === "true",
      },
      include: {
        phases: true,
      },
    });

    return NextResponse.json(jour, { status: 201 });
  } catch (error) {
    console.error("Erreur POST /api/chantiers/[id]/jours:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
