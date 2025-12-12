import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getUserFromToken } from "@/lib/auth";

/**
 * GET /api/chantiers/[id]
 * Récupère un chantier par son ID
 */
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const token = req.cookies.get("session")?.value;
    const user = token ? await getUserFromToken(token) : null;

    if (!user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const { id } = await params;

    const chantier = await prisma.chantier.findUnique({
      where: { id },
    });

    if (!chantier) {
      return NextResponse.json({ error: "Chantier introuvable" }, { status: 404 });
    }

    if (chantier.userId !== user.id && user.role !== "ADMIN") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
    }

    return NextResponse.json(chantier);
  } catch (error) {
    console.error("Erreur GET /api/chantiers/[id]:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

/**
 * PATCH /api/chantiers/[id]
 * Met à jour un chantier (notamment pour finaliser)
 */
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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

    // Si action=finalize, trouver le jour le plus récent et définir date_fin
    if (body.action === "finalize") {
      const lastJour = await prisma.jour.findFirst({
        where: { chantierId: id },
        orderBy: { date: "desc" },
        select: { date: true },
      });

      if (!lastJour) {
        return NextResponse.json(
          { error: "Impossible de finaliser : aucun jour enregistré" },
          { status: 400 }
        );
      }

      const updatedChantier = await prisma.chantier.update({
        where: { id },
        data: {
          date_fin: lastJour.date,
          date_cloture: lastJour.date,
        },
      });

      return NextResponse.json(updatedChantier);
    }

    // Si action=reopen, remettre date_fin et date_cloture à null
    if (body.action === "reopen") {
      const updatedChantier = await prisma.chantier.update({
        where: { id },
        data: {
          date_fin: null,
          date_cloture: null,
        },
      });

      return NextResponse.json(updatedChantier);
    }

    return NextResponse.json({ error: "Action non reconnue" }, { status: 400 });
  } catch (error) {
    console.error("Erreur PATCH /api/chantiers/[id]:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

/**
 * DELETE /api/chantiers/[id]
 * Supprime un chantier
 */
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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

    // Supprimer le chantier (les jours seront supprimés en cascade)
    await prisma.chantier.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erreur DELETE /api/chantiers/[id]:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
