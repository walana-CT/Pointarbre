import { PrismaClient } from "@prisma/client";
import argon2 from "argon2";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Démarrage du seed de la base de données...");

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
