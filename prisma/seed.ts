import { PrismaClient } from "@prisma/client";
import argon2 from "argon2";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Démarrage du seed de la base de données...");

  //seeding de triages
  const triage1 = await prisma.triage.upsert({
    where: { name: "Triage1" },
    update: {},
    create: {
      name: "Triage1",
    },
  });

  const foret_bilsteinstal = await prisma.foret.upsert({
    where: { name: "foret_bilsteinstal" },
    update: {},
    create: {
      name: "foret_bilsteinstal",
      triage: {
        connect: { id: triage1.id }, // <- ici on référence le triage existant
      },
    },
  });

  const foret_ursprung = await prisma.foret.upsert({
    where: { name: "foret_ursprung" },
    update: {},
    create: {
      name: "foret_ursprung",
      triage: {
        connect: { id: triage1.id }, // <- ici on référence le triage existant
      },
    },
  });

  const parcelle1 = await prisma.parcelle.upsert({
    where: { id: "some-id" },
    update: {},
    create: {
      name: "parcelle1",
      foret: {
        connect: { id: foret_bilsteinstal.id },
      },
    },
  });

  const parcelle2 = await prisma.parcelle.upsert({
    where: { id: "some-id" },
    update: {},
    create: {
      name: "parcelle2",
      foret: {
        connect: { id: foret_bilsteinstal.id },
      },
    },
  });

  const parcelle3 = await prisma.parcelle.upsert({
    where: { id: "some-id" },
    update: {},
    create: {
      name: "parcelle3",
      foret: {
        connect: { id: foret_ursprung.id },
      },
    },
  });

  const parcelle4 = await prisma.parcelle.upsert({
    where: { id: "some-id" },
    update: {},
    create: {
      name: "parcelle4",
      foret: {
        connect: { id: foret_ursprung.id },
      },
    },
  });

  console.log({ triage1, foret_ursprung, foret_bilsteinstal });
  console.log({ parcelle1, parcelle2, parcelle3, parcelle4 });

  // Seeding des types de phases
  const typePhases = [
    { name: "Abattage", description: "Coupe et abattage des arbres" },
    { name: "Ébranchage", description: "Suppression des branches" },
    { name: "Tronçonnage", description: "Découpe du tronc en billons" },
    { name: "Débardage", description: "Transport des bois jusqu'à la route" },
    { name: "Façonnage", description: "Préparation et tri des bois" },
    { name: "Empilage", description: "Mise en tas des grumes" },
    { name: "Déplacement", description: "Déplacement entre parcelles ou zones" },
    { name: "Entretien matériel", description: "Maintenance des outils et machines" },
    { name: "Pause", description: "Pause repas ou repos" },
  ];

  for (const typePhase of typePhases) {
    await prisma.typePhase.upsert({
      where: { name: typePhase.name },
      update: {},
      create: typePhase,
    });
  }

  console.log("✅ Types de phases créés:", typePhases.length);

  const UTs = [
    { name: "Kaysersberg", number: "02" },
    { name: "Ribeauvillé", number: "03" },
    { name: "Guebwiller-Thur", number: "05" },
    { name: "Colmar-Rouffach", number: "07" },
    { name: "Munster", number: "08" },
    { name: "Saint-Amarin", number: "13" },
    { name: "Harth", number: "14" },
    { name: "Doller-Basse Largue", number: "15" },
    { name: "Sundgau", number: "16" },
    { name: "Jura Alsascien", number: "17" },
  ];

  for (const ut of UTs) {
    await prisma.ut.upsert({
      where: { name: ut.name },
      update: {},
      create: ut,
    });
  }

  console.log("✅ UTs créées:", UTs.length);

  // Récupérer une UT pour l'assigner au bucheron
  const utKaysersberg = await prisma.ut.findUnique({
    where: { name: "Kaysersberg" },
  });

  // Hash du mot de passe "admin" pour l'utilisateur administrateur
  const adminPasswordHash = await argon2.hash("rob");

  // Créer un utilisateur administrateur
  const adminUser = await prisma.user.upsert({
    where: { email: "rob@mail.com" },
    update: {},
    create: {
      email: "rob@mail.com",
      nom: "ADMIN",
      prenom: "Robin",
      passwordHash: adminPasswordHash,
      role: "ADMIN",
    },
  });

  console.log("✅ Utilisateur ADMIN créé:", {
    id: adminUser.id,
    email: adminUser.email,
    nom: adminUser.nom,
    prenom: adminUser.prenom,
    role: adminUser.role,
  });

  // Créer un utilisateur de test (role OUVRIER par défaut)
  const testUserPasswordHash = await argon2.hash("chene");
  const testUser = await prisma.user.upsert({
    where: { email: "jean.chene@mail.com" },
    update: {},
    create: {
      email: "jean.chene@mail.com",
      nom: "CHENE",
      prenom: "Jean",
      passwordHash: testUserPasswordHash,
      role: "OUVRIER",
      ut: {
        connect: utKaysersberg ? [{ id: utKaysersberg.id }] : [],
      },
    },
  });

  console.log("✅ Utilisateur TEST créé:", {
    id: testUser.id,
    email: testUser.email,
    nom: testUser.nom,
    prenom: testUser.prenom,
    role: testUser.role,
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
    console.log("✅ Seed complété avec succès!");
  })
  .catch(async (e) => {
    console.error("❌ Erreur lors du seed:", e);
    await prisma.$disconnect();
    process.exit(1);
  });
