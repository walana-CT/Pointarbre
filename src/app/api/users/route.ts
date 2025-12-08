import { prisma } from "@/lib/db";
import { hashPassword } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/users
 * Récupère tous les utilisateurs
 */
export async function GET() {
  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(users, { status: 200 });
  } catch (error) {
    console.error("Erreur lors de la récupération des utilisateurs:", error);
    return NextResponse.json({ error: "Erreur interne du serveur" }, { status: 500 });
  }
}

/**
 * POST /api/users
 * Crée un nouvel utilisateur
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, name, password } = body;

    // Validation
    if (!email) {
      return NextResponse.json({ error: "Email requis" }, { status: 400 });
    }

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json({ error: "Cet email existe déjà" }, { status: 409 });
    }

    // Valider le mot de passe
    if (!password) {
      return NextResponse.json({ error: "Password requis" }, { status: 400 });
    }

    const passwordHash = await hashPassword(password);

    // Créer l'utilisateur
    const user = await prisma.user.create({
      data: {
        email,
        name: name || null,
        passwordHash,
      },
    });

    return NextResponse.json(user, { status: 201 });
  } catch (error) {
    console.error("Erreur lors de la création de l'utilisateur:", error);
    return NextResponse.json({ error: "Erreur interne du serveur" }, { status: 500 });
  }
}
