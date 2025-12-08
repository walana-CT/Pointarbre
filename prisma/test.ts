// 🧪 Test simple de Prisma
// Exécutez ceci pour vérifier que Prisma fonctionne

import { prisma } from "@/lib/db";

async function main() {
  console.log("🧪 Test de connexion Prisma...");

  try {
    // Test 1: Vérifier la connexion
    console.log("✓ Étape 1: Vérifier la connexion à la BD...");
    const count = await prisma.user.count();
    console.log(`  → ${count} utilisateurs trouvés`);

    // Test 2: Créer un utilisateur
    console.log("✓ Étape 2: Créer un utilisateur...");
    const newUser = await prisma.user.create({
      data: {
        email: `test-${Date.now()}@example.com`,
        name: "Test User",
      },
    });
    console.log(`  → Utilisateur créé: ${newUser.email}`);

    // Test 3: Lire les utilisateurs
    console.log("✓ Étape 3: Lire tous les utilisateurs...");
    const users = await prisma.user.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
    });
    console.log(`  → ${users.length} utilisateur(s) récupéré(s)`);
    users.forEach((u) => {
      console.log(`     - ${u.email} (${u.name})`);
    });

    // Test 4: Mettre à jour
    console.log("✓ Étape 4: Mettre à jour un utilisateur...");
    const updated = await prisma.user.update({
      where: { id: newUser.id },
      data: { name: "Updated Test User" },
    });
    console.log(`  → Utilisateur mis à jour: ${updated.name}`);

    // Test 5: Supprimer
    console.log("✓ Étape 5: Supprimer l'utilisateur de test...");
    await prisma.user.delete({
      where: { id: newUser.id },
    });
    console.log(`  → Utilisateur supprimé`);

    console.log("");
    console.log("✅ Tous les tests sont passés! Prisma fonctionne parfaitement.");
  } catch (error) {
    console.error("❌ Erreur lors du test:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
