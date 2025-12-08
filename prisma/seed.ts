import { PrismaClient } from "@prisma/client";
import argon2 from "argon2";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Démarrage du seed de la base de données...");

 //seeding de triages
  const triage1 = await prisma.triage.upsert({
    where: { name: 'Triage1' },
    update: {},
    create: {
      name: 'Triage1',
    },
  })

  const foret_bilsteinstal = await prisma.foret.upsert({
    where: { name: 'foret_bilsteinstal' },
    update: {},
    create: {
      name: 'foret_bilsteinstal',
      triage: {
        connect: { id: triage1.id } // <- ici on référence le triage existant
      }
    },
  })

   const foret_ursprung = await prisma.foret.upsert({
    where: { name: 'foret_ursprung' },
    update: {},
    create: {
      name: 'foret_ursprung',
      triage: {
        connect: { id: triage1.id } // <- ici on référence le triage existant
      }
    },
  }) 

  const parcelle1 = await prisma.parcelle.upsert({
    where: { id: 'some-id' },
    update: {},
    create: {
      name: 'parcelle1',
      foret: {
        connect: { id: foret_bilsteinstal.id }
      }
    },
  })


  const parcelle2 = await prisma.parcelle.upsert({
    where: { id: 'some-id' },
    update: {},
    create: {
      name: 'parcelle2',
      foret: {
        connect: { id: foret_bilsteinstal.id }
      }
    },
  })

  const parcelle3 = await prisma.parcelle.upsert({
    where: { id: 'some-id' },
    update: {},
    create: {
      name: 'parcelle3',
      foret: {
        connect: { id: foret_ursprung.id }
      }
    },
  })

  const parcelle4 = await prisma.parcelle.upsert({
    where: { id: 'some-id' },
    update: {},
    create: {
      name: 'parcelle3',
      foret: {
        connect: { id: foret_ursprung.id }
      }
    },
  })


  console.log({ triage1, foret_ursprung, foret_bilsteinstal})
  console.log({ parcelle1, parcelle2, parcelle3, parcelle4})


  // Hash du mot de passe "admin" pour l'utilisateur administrateur
  const adminPasswordHash = await argon2.hash("rob");

  // Créer un utilisateur administrateur
  const adminUser = await prisma.user.upsert({
    where: { email: "rob@mail.com" },
    update: {},
    create: {
      email: "rob@mail.com",
      name: "Administrator",
      passwordHash: adminPasswordHash,
      role: "ADMIN",
    },
  });

  console.log("✅ Utilisateur ADMIN créé:", {
    id: adminUser.id,
    email: adminUser.email,
    name: adminUser.name,
    role: adminUser.role,
  });

  // Créer un utilisateur de test (role USER par défaut)
  const testUserPasswordHash = await argon2.hash("bois");
  const testUser = await prisma.user.upsert({
    where: { email: "bucheron@mail.com" },
    update: {},
    create: {
      email: "bucheron@mail.com",
      name: "Coupeur2bois",
      passwordHash: testUserPasswordHash,
      role: "OUVRIER",
    },
  });

  console.log("✅ Utilisateur TEST créé:", {
    id: testUser.id,
    email: testUser.email,
    name: testUser.name,
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
