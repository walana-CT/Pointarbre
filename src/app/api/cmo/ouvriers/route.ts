import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getUserFromToken } from "@/lib/auth";

// GET - Récupérer la liste des ouvriers attribués au CMO connecté
export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get("session")?.value;
    const user = token ? await getUserFromToken(token) : null;
    if (!user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    if (user.role !== "CMO" && user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Accès réservé aux CMO et administrateurs" },
        { status: 403 }
      );
    }

    // Récupérer les ouvriers attribués à ce CMO
    const attributions = await prisma.cmoOuvrier.findMany({
      where: { cmoId: user.id },
      include: {
        ouvrier: {
          select: {
            id: true,
            name: true,
            email: true,
            isDisabled: true,
          },
        },
      },
      orderBy: {
        ouvrier: {
          name: "asc",
        },
      },
    });

    // Récupérer tous les ouvriers disponibles pour permettre l'ajout
    const allOuvriers = await prisma.user.findMany({
      where: {
        role: "OUVRIER",
      },
      select: {
        id: true,
        name: true,
        email: true,
        isDisabled: true,
      },
      orderBy: {
        name: "asc",
      },
    });

    const attributedIds = new Set(attributions.map((a) => a.ouvrier.id));
    const availableOuvriers = allOuvriers.filter((o) => !attributedIds.has(o.id));

    return NextResponse.json({
      attributedOuvriers: attributions.map((a) => ({
        ...a.ouvrier,
        attributionId: a.id,
        attributedAt: a.createdAt,
      })),
      availableOuvriers,
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des ouvriers:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// POST - Attribuer un ouvrier au CMO connecté
export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get("session")?.value;
    const user = token ? await getUserFromToken(token) : null;
    if (!user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    if (user.role !== "CMO" && user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Accès réservé aux CMO et administrateurs" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { ouvrierId } = body;

    if (!ouvrierId || typeof ouvrierId !== "number") {
      return NextResponse.json({ error: "ID d'ouvrier invalide" }, { status: 400 });
    }

    // Vérifier que l'ouvrier existe et a bien le rôle OUVRIER
    const ouvrier = await prisma.user.findUnique({
      where: { id: ouvrierId },
    });

    if (!ouvrier || ouvrier.role !== "OUVRIER") {
      return NextResponse.json({ error: "Ouvrier non trouvé ou rôle invalide" }, { status: 404 });
    }

    // Créer l'attribution (unique constraint empêchera les doublons)
    const attribution = await prisma.cmoOuvrier.create({
      data: {
        cmoId: user.id,
        ouvrierId: ouvrierId,
      },
      include: {
        ouvrier: {
          select: {
            id: true,
            name: true,
            email: true,
            isDisabled: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      attribution: {
        ...attribution.ouvrier,
        attributionId: attribution.id,
        attributedAt: attribution.createdAt,
      },
    });
  } catch (error: any) {
    console.error("Erreur lors de l'attribution de l'ouvrier:", error);

    // Gérer le cas de doublon
    if (error.code === "P2002") {
      return NextResponse.json({ error: "Cet ouvrier est déjà attribué" }, { status: 409 });
    }

    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// DELETE - Retirer un ouvrier de la liste du CMO
export async function DELETE(req: NextRequest) {
  try {
    const token = req.cookies.get("session")?.value;
    const user = token ? await getUserFromToken(token) : null;
    if (!user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    if (user.role !== "CMO" && user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Accès réservé aux CMO et administrateurs" },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const attributionId = searchParams.get("attributionId");

    if (!attributionId) {
      return NextResponse.json({ error: "ID d'attribution manquant" }, { status: 400 });
    }

    // Vérifier que l'attribution appartient bien au CMO connecté
    const attribution = await prisma.cmoOuvrier.findUnique({
      where: { id: attributionId },
    });

    if (!attribution || attribution.cmoId !== user.id) {
      return NextResponse.json(
        { error: "Attribution non trouvée ou accès non autorisé" },
        { status: 404 }
      );
    }

    // Supprimer l'attribution
    await prisma.cmoOuvrier.delete({
      where: { id: attributionId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erreur lors de la suppression de l'attribution:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
