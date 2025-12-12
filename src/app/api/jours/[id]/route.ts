import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getUserFromToken } from "@/lib/auth";

/**
 * DELETE /api/jours/[id]
 * Supprime un jour
 */
/**
 * PATCH /api/jours/[id]
 * Met à jour un jour
 */
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const token = req.cookies.get("session")?.value;
    const user = token ? await getUserFromToken(token) : null;

    if (!user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const { id } = await params;

    // Vérifier que le jour existe et que l'utilisateur a accès au chantier
    const jour = await prisma.jour.findUnique({
      where: { id },
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
    const { date, h_rendement, location_materiel, ind_kilometrique, transport_materiel, panier } =
      body;

    const updatedJour = await prisma.jour.update({
      where: { id },
      data: {
        ...(date && { date: new Date(date) }),
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

    return NextResponse.json(updatedJour);
  } catch (error) {
    console.error("Erreur PATCH /api/jours/[id]:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

/**
 * DELETE /api/jours/[id]
 * Supprime un jour
 */
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const token = req.cookies.get("session")?.value;
    const user = token ? await getUserFromToken(token) : null;

    if (!user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const { id } = await params;

    // Vérifier que le jour existe et que l'utilisateur a accès au chantier
    const jour = await prisma.jour.findUnique({
      where: { id },
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

    // Supprimer le jour (les phases seront supprimées en cascade si configuré)
    await prisma.jour.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erreur DELETE /api/jours/[id]:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
