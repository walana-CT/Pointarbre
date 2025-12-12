import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getUserFromToken } from "@/lib/auth";

/**
 * PATCH /api/admin/agences/[id]
 * Modifie une agence
 */
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const token = req.cookies.get("session")?.value;
    const user = token ? await getUserFromToken(token) : null;

    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
    }

    const { id } = await params;
    const body = await req.json();
    const { name } = body;

    if (!name || !name.trim()) {
      return NextResponse.json({ error: "Nom requis" }, { status: 400 });
    }

    const agence = await prisma.agence.update({
      where: { id },
      data: { name: name.trim() },
    });

    return NextResponse.json(agence);
  } catch (error) {
    console.error("Erreur PATCH /api/admin/agences/[id]:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

/**
 * DELETE /api/admin/agences/[id]
 * Supprime une agence (seulement si aucun utilisateur ou UT associé)
 */
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const token = req.cookies.get("session")?.value;
    const user = token ? await getUserFromToken(token) : null;

    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
    }

    const { id } = await params;

    // Vérifier les dépendances
    const agence = await prisma.agence.findUnique({
      where: { id },
      include: {
        _count: {
          select: { users: true, uts: true },
        },
      },
    });

    if (!agence) {
      return NextResponse.json({ error: "Agence introuvable" }, { status: 404 });
    }

    const totalDeps = agence._count.users + agence._count.uts;
    if (totalDeps > 0) {
      return NextResponse.json(
        {
          error: `Impossible de supprimer : ${agence._count.users} utilisateur(s) et ${agence._count.uts} UT(s) associé(s)`,
        },
        { status: 400 }
      );
    }

    await prisma.agence.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erreur DELETE /api/admin/agences/[id]:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
