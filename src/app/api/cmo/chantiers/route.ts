import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getUserFromToken } from "@/lib/auth";

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  try {
    const sessionToken = req.cookies.get("session")?.value;
    const user = sessionToken ? await getUserFromToken(sessionToken) : null;

    if (!user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    // Vérifier que l'utilisateur est CMO ou ADMIN
    if (user.role !== "CMO" && user.role !== "ADMIN") {
      return NextResponse.json({ error: "Accès non autorisé" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const utId = searchParams.get("utId");
    const month = searchParams.get("month");
    const year = searchParams.get("year");

    if (!utId || !month || !year) {
      return NextResponse.json(
        { error: "Paramètres manquants: utId, month, year requis" },
        { status: 400 }
      );
    }

    const monthNum = parseInt(month);
    const yearNum = parseInt(year);

    // Dates de début et fin du mois
    const startDate = new Date(yearNum, monthNum - 1, 1);
    const endDate = new Date(yearNum, monthNum, 0, 23, 59, 59);

    // Récupérer tous les ouvriers de l'UT
    const ouvriers = await prisma.user.findMany({
      where: {
        ut: {
          some: {
            id: utId,
          },
        },
        role: "OUVRIER",
        isDisabled: false,
      },
      select: {
        id: true,
        nom: true,
        prenom: true,
        email: true,
      },
    });

    // Pour chaque ouvrier, récupérer ses chantiers et jours du mois
    const ouvrierData = await Promise.all(
      ouvriers.map(async (ouvrier) => {
        const chantiers = await prisma.chantier.findMany({
          where: {
            userId: ouvrier.id,
            jours: {
              some: {
                date: {
                  gte: startDate,
                  lte: endDate,
                },
              },
            },
          },
          include: {
            jours: {
              where: {
                date: {
                  gte: startDate,
                  lte: endDate,
                },
              },
              include: {
                phases: true,
              },
              orderBy: {
                date: "asc",
              },
            },
          },
          orderBy: {
            date_debut: "desc",
          },
        });

        // Calculer les totaux
        let totalJours = 0;
        let totalHeuresRendement = 0;
        let totalLocationMateriel = 0;
        let totalIndKilometrique = 0;
        let totalTransportMateriel = 0;
        let totalPanier = 0;

        chantiers.forEach((chantier) => {
          chantier.jours.forEach((jour) => {
            totalJours++;
            totalHeuresRendement += jour.h_rendement || 0;
            totalLocationMateriel += jour.location_materiel || 0;
            totalIndKilometrique += jour.ind_kilometrique || 0;
            if (jour.transport_materiel) totalTransportMateriel++;
            if (jour.panier) totalPanier++;
          });
        });

        return {
          ouvrier: {
            id: ouvrier.id,
            nom: ouvrier.nom,
            prenom: ouvrier.prenom,
            email: ouvrier.email,
          },
          chantiers,
          totaux: {
            jours: totalJours,
            heuresRendement: totalHeuresRendement,
            locationMateriel: totalLocationMateriel,
            indKilometrique: totalIndKilometrique,
            transportMateriel: totalTransportMateriel,
            panier: totalPanier,
          },
        };
      })
    );

    // Filtrer les ouvriers qui ont au moins un jour de travail dans le mois
    const ouvrierDataFiltered = ouvrierData.filter((data) => data.totaux.jours > 0);

    return NextResponse.json(ouvrierDataFiltered);
  } catch (error) {
    console.error("Erreur lors de la récupération des données CMO:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des données" },
      { status: 500 }
    );
  }
}
