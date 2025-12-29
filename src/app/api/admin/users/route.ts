import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getUserFromToken } from "@/lib/auth";
import { hash } from "argon2";

// GET /api/admin/users - Liste des utilisateurs (sauf ADMIN)
export async function GET(req: NextRequest) {
  const token = req.cookies.get("session")?.value;
  const user = token ? await getUserFromToken(token) : null;

  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
  }

  const users = await prisma.user.findMany({
    where: {
      role: {
        not: "ADMIN",
      },
    },
    select: {
      id: true,
      email: true,
      nom: true,
      prenom: true,
      role: true,
      isDisabled: true,
      agenceId: true,
      agence: {
        select: {
          id: true,
          name: true,
        },
      },
      ut: {
        select: {
          id: true,
          number: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return NextResponse.json(users);
}

// POST /api/admin/users - Créer un utilisateur (sauf ADMIN)
export async function POST(req: NextRequest) {
  const token = req.cookies.get("session")?.value;
  const user = token ? await getUserFromToken(token) : null;

  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { email, nom, prenom, password, role, agenceId, utIds } = body;

    if (!email || !nom|| !prenom || !password || !role) {
      return NextResponse.json({ error: "Email, Nom, Prenom, mot de passe et rôle requis" }, { status: 400 });
    }

    // Empêcher la création d'admin
    if (role === "ADMIN") {
      return NextResponse.json({ error: "Impossible de créer un administrateur" }, { status: 403 });
    }

    // Vérifier que l'email n'existe pas déjà
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json({ error: "Cet email est déjà utilisé" }, { status: 400 });
    }

    // Hasher le mot de passe
    const passwordHash = await hash(password);

    // Créer l'utilisateur avec les relations
    const user = await prisma.user.create({
      data: {
        email,
        nom: nom,
        prenom: prenom,
        passwordHash,
        role,
        agenceId: agenceId || null,
        ut:
          utIds && utIds.length > 0
            ? {
                connect: utIds.map((id: string) => ({ id })),
              }
            : undefined,
      },
      include: {
        agence: true,
        ut: true,
      },
    });

    return NextResponse.json(user);
  } catch (error: any) {
    console.error("Erreur création utilisateur:", error);
    if (error.code === "P2002") {
      return NextResponse.json({ error: "Cet email est déjà utilisé" }, { status: 400 });
    }
    return NextResponse.json({ error: "Erreur lors de la création" }, { status: 500 });
  }
}
