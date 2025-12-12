import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getUserFromToken } from "@/lib/auth";

/**
 * PATCH /api/admin/parcelles/[id]
 * Modifie une parcelle
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
    const { name, foretId } = body;

    if (!name || !name.trim()) {
      return NextResponse.json({ error: "Nom requis" }, { status: 400 });
    }

    if (!foretId) {
      return NextResponse.json({ error: "Forêt requise" }, { status: 400 });
    }

    const parcelle = await prisma.parcelle.update({
      where: { id },
      data: {
        name: name.trim(),
        foretId,
      },
      include: {
        foret: {
          include: {
            triage: true,
          },
        },
      },
    });

    return NextResponse.json(parcelle);
  } catch (error) {
    console.error("Erreur PATCH /api/admin/parcelles/[id]:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

/**
 * DELETE /api/admin/parcelles/[id]
 * Supprime une parcelle
 */
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const token = req.cookies.get("session")?.value;
    const user = token ? await getUserFromToken(token) : null;

    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
    }

    const { id } = await params;

    await prisma.parcelle.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erreur DELETE /api/admin/parcelles/[id]:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
