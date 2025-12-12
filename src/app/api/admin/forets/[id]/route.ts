import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getUserFromToken } from "@/lib/auth";

/**
 * PATCH /api/admin/forets/[id]
 * Modifie une forêt
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
    const { name, triageId } = body;

    if (!name || !name.trim()) {
      return NextResponse.json({ error: "Nom requis" }, { status: 400 });
    }

    if (!triageId) {
      return NextResponse.json({ error: "Triage requis" }, { status: 400 });
    }

    const foret = await prisma.foret.update({
      where: { id },
      data: {
        name: name.trim(),
        triageId,
      },
      include: {
        triage: true,
      },
    });

    return NextResponse.json(foret);
  } catch (error: any) {
    if (error.code === "P2002") {
      return NextResponse.json({ error: "Ce nom existe déjà" }, { status: 400 });
    }
    console.error("Erreur PATCH /api/admin/forets/[id]:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

/**
 * DELETE /api/admin/forets/[id]
 * Supprime une forêt et ses parcelles en cascade
 */
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const token = req.cookies.get("session")?.value;
    const user = token ? await getUserFromToken(token) : null;

    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
    }

    const { id } = await params;

    // Supprimer d'abord les parcelles
    await prisma.parcelle.deleteMany({
      where: { foretId: id },
    });

    // Puis supprimer la forêt
    await prisma.foret.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erreur DELETE /api/admin/forets/[id]:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
