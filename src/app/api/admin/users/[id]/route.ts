import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getUserFromToken } from "@/lib/auth";
import { hash } from "argon2";

// PATCH /api/admin/users/[id] - Modifier un utilisateur
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const token = req.cookies.get("session")?.value;
  const user = token ? await getUserFromToken(token) : null;

  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
  }

  try {
    const { id: idStr } = await params;
    const id = parseInt(idStr);
    const body = await req.json();
    const { email, name, password, role, agenceId, utIds, isDisabled } = body;

    // Vérifier que l'utilisateur existe et n'est pas admin
    const existingUser = await prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      return NextResponse.json({ error: "Utilisateur non trouvé" }, { status: 404 });
    }

    if (existingUser.role === "ADMIN") {
      return NextResponse.json(
        { error: "Impossible de modifier un administrateur" },
        { status: 403 }
      );
    }

    // Empêcher de passer un utilisateur en admin
    if (role === "ADMIN") {
      return NextResponse.json(
        { error: "Impossible de promouvoir un utilisateur en administrateur" },
        { status: 403 }
      );
    }

    // Préparer les données de mise à jour
    const updateData: any = {};

    if (email !== undefined) updateData.email = email;
    if (name !== undefined) updateData.name = name || null;
    if (role !== undefined) updateData.role = role;
    if (isDisabled !== undefined) updateData.isDisabled = isDisabled;
    if (agenceId !== undefined) updateData.agenceId = agenceId || null;

    // Si un nouveau mot de passe est fourni
    if (password && password.trim()) {
      updateData.passwordHash = await hash(password);
    }

    // Gérer les UTs
    if (utIds !== undefined) {
      // Déconnecter toutes les UTs existantes puis connecter les nouvelles
      updateData.ut = {
        set: utIds.map((id: string) => ({ id })),
      };
    }

    const user = await prisma.user.update({
      where: { id },
      data: updateData,
      include: {
        agence: true,
        ut: true,
      },
    });

    return NextResponse.json(user);
  } catch (error: any) {
    console.error("Erreur modification utilisateur:", error);
    if (error.code === "P2002") {
      return NextResponse.json({ error: "Cet email est déjà utilisé" }, { status: 400 });
    }
    return NextResponse.json({ error: "Erreur lors de la modification" }, { status: 500 });
  }
}

// DELETE /api/admin/users/[id] - Supprimer un utilisateur
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const token = req.cookies.get("session")?.value;
  const user = token ? await getUserFromToken(token) : null;

  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
  }

  try {
    const { id: idStr } = await params;
    const id = parseInt(idStr);

    // Vérifier que l'utilisateur existe et n'est pas admin
    const existingUser = await prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      return NextResponse.json({ error: "Utilisateur non trouvé" }, { status: 404 });
    }

    if (existingUser.role === "ADMIN") {
      return NextResponse.json(
        { error: "Impossible de supprimer un administrateur" },
        { status: 403 }
      );
    }

    // Vérifier les chantiers associés
    const chantiersCount = await prisma.chantier.count({
      where: { userId: id },
    });

    if (chantiersCount > 0) {
      return NextResponse.json(
        { error: `Impossible de supprimer: ${chantiersCount} chantier(s) associé(s)` },
        { status: 400 }
      );
    }

    await prisma.user.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erreur suppression utilisateur:", error);
    return NextResponse.json({ error: "Erreur lors de la suppression" }, { status: 500 });
  }
}
