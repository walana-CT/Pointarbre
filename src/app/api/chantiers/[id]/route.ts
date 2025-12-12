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
