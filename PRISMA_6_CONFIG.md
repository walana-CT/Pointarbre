# 🔧 Configuration Prisma 6 - Guide Complet

## ⚠️ Changements Majeurs dans Prisma 6

Prisma 6 a apporté des **changements majeurs** concernant la configuration du datasource. Voici ce que vous devez savoir :

---

## 📋 Architecture Prisma 6

### Structure des fichiers

```
prisma/
├── schema.prisma        # Schéma (SANS url du datasource)
├── prisma.config.ts     # Configuration (AVEC la url)
└── seed.ts              # Script de seed
```

### ❌ AVANT (Prisma < 6) - NE PLUS FAIRE

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")  // ❌ ERREUR en Prisma 6
}
```

### ✅ APRÈS (Prisma 6+) - À FAIRE

**schema.prisma:**

```prisma
datasource db {
  provider = "postgresql"
  // La URL n'est plus ici!
}
```

**prisma.config.ts:**

```typescript
import { defineConfig } from "@prisma/internals";

export default defineConfig({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});
```

---

## 🚀 Configuration Complète (Prisma 6)

### 1. Fichier `prisma/schema.prisma`

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
}

model User {
  id    Int     @id @default(autoincrement())
  email String  @unique
  name  String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@map("users")
}
```

**Points clés:**

- ✅ `provider = "postgresql"` - SEULEMENT ça
- ❌ PAS de `url = env(...)`
- ✅ Les relations, indices, etc. restent normaux

### 2. Fichier `prisma/prisma.config.ts`

```typescript
import { defineConfig } from "@prisma/internals";

export default defineConfig({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});
```

**Pourquoi separé ?**

- Permet d'utiliser des variables d'environnement au runtime
- Plus flexible pour différents environnements
- Compatible avec Prisma Accelerate
- Meilleure séparation des concerns

### 3. Fichier `.env.local`

```env
DATABASE_URL="postgresql://user:password@host:port/database"
NODE_ENV="development"
NEXT_PUBLIC_APP_NAME="Mon App"
```

**Format de la DATABASE_URL:**

```
postgresql://USERNAME:PASSWORD@HOST:PORT/DATABASE
```

Exemple avec Docker Compose:

```
postgresql://nextjs_user:nextjs_password@localhost:5432/nextjs_db
```

---

## 🔄 Workflow Prisma 6

### Créer le premier schéma

1. **Modifier `schema.prisma`:**

```prisma
model Post {
  id    Int     @id @default(autoincrement())
  title String
  content String
  authorId Int
  author User @relation(fields: [authorId], references: [id])
}
```

2. **Créer la migration:**

```bash
pnpm run prisma:migrate
# Nommez-la: "add_posts_table"
```

3. **Générer le client:**

```bash
pnpm run prisma:generate
```

4. **Explorer la BD:**

```bash
pnpm run prisma:studio
```

### Utiliser Prisma dans votre code

**Instance Prisma (`src/lib/db.ts`):**

```typescript
import { PrismaClient } from "@prisma/client";

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
```

**Route API (`src/app/api/users/route.ts`):**

```typescript
import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  const users = await prisma.user.findMany();
  return NextResponse.json(users);
}

export async function POST(req: NextRequest) {
  const { email, name } = await req.json();

  const user = await prisma.user.create({
    data: { email, name },
  });

  return NextResponse.json(user, { status: 201 });
}
```

**Server Component (Next.js App Router):**

```typescript
import { prisma } from "@/lib/db";

export default async function UsersList() {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <h1>Utilisateurs</h1>
      <ul>
        {users.map((user) => (
          <li key={user.id}>
            {user.name} ({user.email})
          </li>
        ))}
      </ul>
    </div>
  );
}
```

---

## 🆘 Dépannage Prisma 6

### ❌ Erreur: "url is not supported in schema files"

**Problème:** Vous avez `url = env(...)` dans `schema.prisma`

**Solution:**

```bash
# 1. Supprimer de schema.prisma
# 2. Ajouter dans prisma.config.ts
# 3. Réexécuter:
pnpm run prisma:generate
```

### ❌ Erreur: "Cannot find DATABASE_URL"

**Problème:** Variable d'environnement manquante

**Solution:**

```bash
# 1. Vérifier .env.local existe
ls -la .env.local

# 2. Vérifier le format
cat .env.local | grep DATABASE_URL

# 3. Vérifier le fichier prisma.config.ts lit bien depuis process.env
pnpm run prisma:generate
```

### ❌ Erreur: "Connection refused"

**Problème:** PostgreSQL n'est pas en cours d'exécution

**Solution:**

```bash
# 1. Vérifier Docker
docker-compose ps

# 2. Relancer Docker
docker-compose down
docker-compose up -d

# 3. Attendre que PostgreSQL soit prêt (10 secondes)
sleep 10

# 4. Vérifier la connexion
pnpm run prisma:generate
```

### ❌ Erreur: "role 'user' does not exist"

**Problème:** Les credentials du `.env.local` ne correspondent pas à Docker

**Solution:**
Vérifiez que dans `.env.local`:

```env
# Doit correspondre à docker-compose.yml
DATABASE_URL="postgresql://nextjs_user:nextjs_password@localhost:5432/nextjs_db"
```

Et dans `docker-compose.yml`:

```yaml
environment:
  POSTGRES_USER: nextjs_user
  POSTGRES_PASSWORD: nextjs_password
  POSTGRES_DB: nextjs_db
```

### 🔍 Vérifier la connexion

```bash
# Tester si la BD est accessible
psql postgresql://user:password@localhost:5432/database

# Ou avec pnpm:
pnpm run prisma:studio
```

---

## 📚 Commandes Essentielles

```bash
# Générer le client Prisma
pnpm run prisma:generate

# Créer/exécuter une migration
pnpm run prisma:migrate

# Explorer la BD graphiquement
pnpm run prisma:studio

# Pousser le schéma sans migration
pnpm run db:push

# Réinitialiser complètement
pnpm run db:reset

# Afficher les migrations
prisma migrate status
```

---

## ✨ Checklist Configuration Prisma 6

- [ ] `schema.prisma` - **SANS** `url = env(...)`
- [ ] `prisma.config.ts` - **AVEC** `url: process.env.DATABASE_URL`
- [ ] `.env.local` - Contient `DATABASE_URL`
- [ ] `src/lib/db.ts` - Instance Prisma créée
- [ ] Docker - PostgreSQL en cours d'exécution
- [ ] `pnpm run prisma:generate` - Exécuté avec succès
- [ ] `pnpm run prisma:migrate` - Migrations exécutées
- [ ] `pnpm run prisma:studio` - Fonctionne et affiche la BD

---

## 🔗 Ressources

- [Prisma 6 Migration Guide](https://www.prisma.io/docs/orm/prisma-6)
- [Prisma Configuration](https://www.prisma.io/docs/orm/reference/prisma-client-reference#datasource)
- [PostgreSQL Connection String](https://www.postgresql.org/docs/current/libpq-connect.html)

---

**Bon développement avec Prisma 6! 🚀**
