# 🎯 Guide Complet: Configuration Prisma 6 ✓

## ✅ Ce qui a été fait pour vous

### 1. **Configuration Prisma 6** ✓

- ✅ `prisma/schema.prisma` - Configuré correctement (SANS url)
- ✅ `prisma/prisma.config.ts` - Crée pour gérer la DATABASE_URL
- ✅ `src/lib/db.ts` - Instance Prisma singleton créée

### 2. **Routes API Exemples** ✓

- ✅ `src/app/api/users/route.ts` - GET/POST users
- ✅ `src/app/api/users/[id]/route.ts` - GET/PUT/DELETE user par ID

### 3. **Documentation** ✓

- ✅ `PRISMA_6_CONFIG.md` - Guide détaillé Prisma 6
- ✅ `PRISMA_QUICKSTART.sh` - Guide de démarrage rapide
- ✅ `check-prisma.sh` - Script de vérification

### 4. **Fichiers Configurés** ✓

- ✅ `.env.local` - DATABASE_URL configurée
- ✅ `.npmrc` - Configuration pnpm
- ✅ `package.json` - Dépendances Prisma incluses

---

## 🚀 Démarrage en 5 Étapes

### Étape 1: Vérifier la Configuration

```bash
bash check-prisma.sh
```

**Résultat attendu:**

```
✓ schema.prisma est correct (pas de url)
✓ prisma.config.ts contient DATABASE_URL
✓ .env.local contient DATABASE_URL
✓ PostgreSQL est en cours d'exécution
```

### Étape 2: Installer les Dépendances

```bash
pnpm install
```

### Étape 3: Démarrer PostgreSQL

```bash
docker-compose up -d
sleep 5
```

Vérifier que c'est lancé:

```bash
docker-compose ps
```

### Étape 4: Initialiser la BD

```bash
# Générer Prisma Client
pnpm run prisma:generate

# Créer les migrations
pnpm run prisma:migrate
# → Nommez la migration: "init"

# Seed les données (optionnel)
pnpm run prisma:seed
```

### Étape 5: Vérifier Prisma Studio

```bash
pnpm run prisma:studio
```

Ouvre automatiquement: `http://localhost:5555`

---

## 🧪 Tester les APIs

### Avec curl

```bash
# GET tous les utilisateurs
curl http://localhost:3000/api/users

# POST un nouvel utilisateur
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","name":"John"}'

# GET un utilisateur spécifique
curl http://localhost:3000/api/users/1

# PUT mettre à jour
curl -X PUT http://localhost:3000/api/users/1 \
  -H "Content-Type: application/json" \
  -d '{"name":"Updated Name"}'

# DELETE
curl -X DELETE http://localhost:3000/api/users/1
```

### Avec Prisma Studio (UI)

```bash
pnpm run prisma:studio
# Ouvre http://localhost:5555
```

### Avec Thunder Client ou Postman

**Importer ces URLs:**

| Méthode | URL                                 | Utilité     |
| ------- | ----------------------------------- | ----------- |
| GET     | `http://localhost:3000/api/users`   | Lister tous |
| POST    | `http://localhost:3000/api/users`   | Créer       |
| GET     | `http://localhost:3000/api/users/1` | Détail      |
| PUT     | `http://localhost:3000/api/users/1` | Modifier    |
| DELETE  | `http://localhost:3000/api/users/1` | Supprimer   |

---

## 📚 Structure du Projet

```
new_stack/
├── prisma/
│   ├── schema.prisma       # Modèles de données ✓
│   ├── prisma.config.ts    # Config Prisma 6 ✓
│   ├── seed.ts             # Script de seed ✓
│   └── test.ts             # Test de connexion
│
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── health/route.ts      # Health check
│   │   │   └── users/
│   │   │       ├── route.ts         # GET/POST users ✓
│   │   │       └── [id]/route.ts    # GET/PUT/DELETE user ✓
│   │   ├── layout.tsx      # Layout racine
│   │   └── page.tsx        # Accueil
│   └── lib/
│       └── db.ts           # Instance Prisma ✓
│
├── .env.local              # Variables d'env ✓
├── .npmrc                  # Config pnpm ✓
├── docker-compose.yml      # PostgreSQL ✓
├── PRISMA_6_CONFIG.md      # Guide détaillé
├── PRISMA_QUICKSTART.sh    # Guide rapide
├── check-prisma.sh         # Vérification
└── README.md               # Doc générale
```

---

## 🔧 Commandes Courantes

```bash
# Développement
pnpm run dev                    # Démarrer le serveur
pnpm run build                  # Build production
pnpm run lint                   # Lint le code

# Prisma
pnpm run prisma:generate        # Générer Prisma Client
pnpm run prisma:migrate         # Créer/exécuter migrations
pnpm run prisma:studio          # Ouvrir UI de Prisma
pnpm run db:push                # Pousser le schéma
pnpm run db:reset               # Réinitialiser la BD

# Docker
docker-compose up -d            # Démarrer PostgreSQL
docker-compose down             # Arrêter PostgreSQL
docker-compose ps               # Voir le statut
docker-compose logs -f postgres # Voir les logs
```

---

## 🎓 Exemples de Code

### Créer un utilisateur (dans une route API)

```typescript
import { prisma } from "@/lib/db";

const user = await prisma.user.create({
  data: {
    email: "john@example.com",
    name: "John Doe",
  },
});
```

### Lire les utilisateurs (Server Component)

```typescript
import { prisma } from "@/lib/db";

export default async function UsersList() {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <ul>
      {users.map((user) => (
        <li key={user.id}>{user.name}</li>
      ))}
    </ul>
  );
}
```

### Mettre à jour un utilisateur

```typescript
const updated = await prisma.user.update({
  where: { id: 1 },
  data: { name: "Jane Doe" },
});
```

### Supprimer un utilisateur

```typescript
await prisma.user.delete({
  where: { id: 1 },
});
```

### Requêtes complexes

```typescript
// Avec filtrage
const activeUsers = await prisma.user.findMany({
  where: {
    email: {
      contains: "gmail.com",
    },
  },
  select: {
    id: true,
    email: true,
    name: true,
  },
});

// Avec pagination
const page1 = await prisma.user.findMany({
  skip: 0,
  take: 10,
  orderBy: { createdAt: "desc" },
});

// Avec count
const total = await prisma.user.count();
```

---

## ✨ Prochaines Étapes

1. ✅ **Vérifier** la configuration avec `bash check-prisma.sh`
2. ✅ **Installer** les dépendances avec `pnpm install`
3. ✅ **Démarrer** PostgreSQL avec `docker-compose up -d`
4. ✅ **Générer** Prisma avec `pnpm run prisma:generate`
5. ✅ **Créer** les migrations avec `pnpm run prisma:migrate`
6. ✅ **Tester** les APIs avec curl ou Prisma Studio
7. 📝 **Modifier** le schéma Prisma pour vos besoins
8. 🚀 **Créer** vos propres routes API
9. 🎨 **Construire** vos composants

---

## 🆘 Dépannage Rapide

### Erreur: "url is not supported in schema files"

→ Supprimez `url = env(...)` de `schema.prisma`

### Erreur: "Cannot connect to database"

→ Vérifiez que PostgreSQL est en cours d'exécution: `docker-compose ps`

### Erreur: "role does not exist"

→ Les identifiants ne correspondent pas entre `.env.local` et `docker-compose.yml`

### DATABASE_URL non reconnue

→ Vérifiez que `prisma.config.ts` utilise `process.env.DATABASE_URL`

---

## 📖 Documentation Prisma 6

- **Official Docs**: https://www.prisma.io/docs/orm/prisma-6
- **Prisma Schema**: https://www.prisma.io/docs/orm/prisma-schema
- **Query API**: https://www.prisma.io/docs/orm/reference/prisma-client-reference
- **Migration Guide**: https://www.prisma.io/docs/orm/prisma-migrate

---

**🎉 Vous êtes prêt à développer avec Prisma 6!**

Pour des questions, consultez `PRISMA_6_CONFIG.md` ou la documentation officielle.
