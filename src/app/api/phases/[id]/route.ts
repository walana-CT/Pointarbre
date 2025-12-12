import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getUserFromToken } from "@/lib/auth";

/**
 * DELETE /api/phases/[id]
 * Supprime une phase
 */
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const token = req.cookies.get("session")?.value;
    const user = token ? await getUserFromToken(token) : null;

    if (!user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const { id } = await params;

    // Vérifier que la phase existe et que l'utilisateur a accès au chantier
    const phase = await prisma.phase.findUnique({
      where: { id },
      include: {
        jour: {
          include: {
            chantier: {
              select: { userId: true },
            },
          },
        },
      },
    });

    if (!phase) {
      return NextResponse.json({ error: "Phase introuvable" }, { status: 404 });
    }

    if (phase.jour.chantier.userId !== user.id && user.role !== "ADMIN") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
    }

    await prisma.phase.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erreur DELETE /api/phases/[id]:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
