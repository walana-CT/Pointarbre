import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getUserFromToken } from "@/lib/auth";

/**
 * PATCH /api/admin/triages/[id]
 * Modifie un triage
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

    const triage = await prisma.triage.update({
      where: { id },
      data: { name: name.trim() },
    });

    return NextResponse.json(triage);
  } catch (error: any) {
    if (error.code === "P2002") {
      return NextResponse.json({ error: "Ce nom existe déjà" }, { status: 400 });
    }
    console.error("Erreur PATCH /api/admin/triages/[id]:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

/**
 * DELETE /api/admin/triages/[id]
 * Supprime un triage (seulement si aucune forêt associée)
 */
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const token = req.cookies.get("session")?.value;
    const user = token ? await getUserFromToken(token) : null;

    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
    }

    const { id } = await params;

    // Vérifier s'il y a des forêts associées
    const foretsCount = await prisma.foret.count({
      where: { triageId: id },
    });

    if (foretsCount > 0) {
      return NextResponse.json(
        { error: `Impossible de supprimer : ${foretsCount} forêt(s) associée(s)` },
        { status: 400 }
      );
    }

    await prisma.triage.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erreur DELETE /api/admin/triages/[id]:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
