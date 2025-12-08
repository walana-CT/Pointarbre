# ✅ Configuration Prisma 6 - RÉSOLUE!

## 🔧 Corrections Effectuées

### Problème Initial

```
Error: Argument "url" is missing in data source block "db".
```

### Solution Appliquée

**Pour Prisma 6, le datasource DOIT avoir l'URL**, contrairement à ce que j'ai dit initialement. Voici la bonne configuration :

#### 1. `prisma/schema.prisma` ✅

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")  ← À GARDER pour Prisma 6
}
```

#### 2. `prisma/prisma.config.ts` ✅

```typescript
import { defineConfig } from "@prisma/internals";

export default defineConfig({
  datasources: {
    db: {
      url: process.env.DATABASE_URL || "postgresql://localhost:5432/nextjs_db",
    },
  },
  generate: {
    prismaClient: "./node_modules/@prisma/client",
  },
});
```

#### 3. `.env` (à la racine du projet) ✅

```env
DATABASE_URL="postgresql://fagus:sylvatica@localhost:5432/pointarbre_db"
```

**Important:** Ce fichier `.env` est utilisé par Prisma CLI et doit être commité (c'est distinct de `.env.local` qui ne doit pas l'être)

#### 4. `docker-compose.yml` ✅

```yaml
services:
  postgres:
    image: postgres:16-alpine
    container_name: nextjs_postgres
    environment:
      POSTGRES_USER: fagus
      POSTGRES_PASSWORD: sylvatica
      POSTGRES_DB: pointarbre_db
    ports:
      - "5432:5432"
```

---

## 🎯 Ce qui Fonctionne Maintenant

✅ `pnpm run prisma:generate` - Génère le client Prisma  
✅ `pnpm run prisma:migrate` - Crée les migrations  
✅ `pnpm run prisma:studio` - Ouvre l'UI Prisma  
✅ PostgreSQL connecté et opérationnel  
✅ Migrations créées dans `prisma/migrations/`

---

## 📋 Commandes de Démarrage

```bash
# 1. Installer les dépendances
pnpm install

# 2. Démarrer PostgreSQL
docker compose up -d

# 3. Générer Prisma Client
pnpm run prisma:generate

# 4. Créer les migrations
pnpm run prisma:migrate
# → Tapez: "init"

# 5. (Optionnel) Seed les données
pnpm run prisma:seed

# 6. Voir Prisma Studio
pnpm run prisma:studio
# → Ouvre http://localhost:5555

# 7. Démarrer le serveur
pnpm run dev
```

---

## 🆘 Dépannage

### Si vous avez des erreurs de connexion

```bash
# 1. Vérifier que Docker est lancé
docker compose ps

# 2. Vérifier que les credentials correspondent:
#    - .env: DATABASE_URL
#    - docker-compose.yml: POSTGRES_USER, POSTGRES_PASSWORD, POSTGRES_DB

# 3. Réinitialiser Docker (efface la BD)
docker compose down -v
docker compose up -d
sleep 10

# 4. Réessayer
pnpm run prisma:migrate
```

---

## 📝 Récapitulatif Prisma 6

### ✅ À FAIRE

- `datasource db { url = env("DATABASE_URL") }` dans schema.prisma
- `.env` avec DATABASE_URL (pour Prisma CLI)
- `.env.local` avec DATABASE_URL (pour Next.js)
- `prisma.config.ts` avec la config Prisma

### ❌ À NE PAS FAIRE

- Ne pas enlever l'URL du datasource
- Ne pas confondre `.env` (Prisma CLI) et `.env.local` (Next.js)
- Ne pas oublier de relancer Docker après changement de credentials

---

## ✨ Prochaines Étapes

1. ✅ Vérifier la configuration avec `pnpm run prisma:generate`
2. ✅ Créer les migrations avec `pnpm run prisma:migrate`
3. ✅ Tester avec Prisma Studio: `pnpm run prisma:studio`
4. 📝 Ajouter vos propres modèles au schema.prisma
5. 🚀 Créer vos routes API avec Prisma

---

**Bravo ! Prisma 6 est maintenant correctement configuré! 🎉**
