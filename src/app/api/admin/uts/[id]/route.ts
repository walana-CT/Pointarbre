import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getUserFromToken } from "@/lib/auth";

/**
 * PATCH /api/admin/uts/[id]
 * Modifie une UT
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
    const { number, name } = body;

    if (!number || !number.trim()) {
      return NextResponse.json({ error: "Numéro requis" }, { status: 400 });
    }

    if (!name || !name.trim()) {
      return NextResponse.json({ error: "Nom requis" }, { status: 400 });
    }

    const ut = await prisma.ut.update({
      where: { id },
      data: {
        number: number.trim(),
        name: name.trim(),
      },
    });

    return NextResponse.json(ut);
  } catch (error) {
    console.error("Erreur PATCH /api/admin/uts/[id]:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

/**
 * DELETE /api/admin/uts/[id]
 * Supprime une UT (seulement si aucun utilisateur ou agence associé)
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
    const ut = await prisma.ut.findUnique({
      where: { id },
      include: {
        _count: {
          select: { users: true, agences: true },
        },
      },
    });

    if (!ut) {
      return NextResponse.json({ error: "UT introuvable" }, { status: 404 });
    }

    const totalDeps = ut._count.users + ut._count.agences;
    if (totalDeps > 0) {
      return NextResponse.json(
        {
          error: `Impossible de supprimer : ${ut._count.users} utilisateur(s) et ${ut._count.agences} agence(s) associé(s)`,
        },
        { status: 400 }
      );
    }

    await prisma.ut.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erreur DELETE /api/admin/uts/[id]:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
