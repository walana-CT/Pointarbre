# 🚀 Stack Next.js + Prisma + PostgreSQL

Une stack moderne, bien structurée et prête pour un développement professionnel en solo.

## 📋 Table des matières

- [Architecture](#-architecture)
- [Prérequis](#-prérequis)
- [Installation et Démarrage](#-installation-et-démarrage)
- [Variables d'Environnement](#-variables-denvironnement)
- [Commandes Utiles](#-commandes-utiles)
- [Structure des Dossiers](#-structure-des-dossiers)
- [Workflow de Développement](#-workflow-de-développement)
- [Prisma et Base de Données](#-prisma-et-base-de-données)
- [Ressources](#-ressources)

---

## 🏗️ Architecture

### Stack Technique

```
Frontend:
├─ Next.js 15 (React 19)
├─ TypeScript
├─ Tailwind CSS
└─ App Router

Backend:
├─ Next.js API Routes
├─ Prisma ORM
└─ PostgreSQL
```

### Avantages

✅ **Full-Stack JavaScript/TypeScript** - Un seul langage partout  
✅ **Type Safety** - Erreurs détectées à la compilation  
✅ **ORM Moderne** - Prisma simplifie la gestion de la BD  
✅ **Database Agnostic** - Facile de changer de SGBD  
✅ **Fast Development** - Hot reload intégré  
✅ **Production Ready** - Optimisé pour le déploiement

---

## 📦 Prérequis

Assurez-vous d'avoir installé :

- **Node.js** >= 18 (vérifiez avec `node --version`)
- **pnpm** (vérifiez avec `pnpm --version`) - [Installer pnpm](https://pnpm.io/installation)
- **Docker** et **Docker Compose** (vérifiez avec `docker --version`)
- **Git** (vérifiez avec `git --version`)

### Installation de pnpm

```bash
npm install -g pnpm
# ou via Homebrew (macOS)
brew install pnpm
# ou via votre gestionnaire de paquets
```

### Installation de Docker (si nécessaire)

**Ubuntu/Debian:**

```bash
sudo apt-get update
sudo apt-get install docker.io docker-compose
sudo usermod -aG docker $USER
# Redémarrez votre terminal
```

**macOS:**

```bash
# Installez Docker Desktop depuis : https://www.docker.com/products/docker-desktop
```

**Windows:**

```bash
# Installez Docker Desktop depuis : https://www.docker.com/products/docker-desktop
```

---

## 🚀 Installation et Démarrage

### 1️⃣ Cloner ou Initialiser le Projet

```bash
cd /home/robin/Documents/Projets_ONF/new_stack
```

### 2️⃣ Installer les Dépendances

```bash
pnpm install
```

### 3️⃣ Configurer l'Environnement

Créez un fichier `.env.local` à la racine du projet :

```bash
cp .env.example .env.local
```

Éditez `.env.local` avec vos paramètres :

```env
# Base de données PostgreSQL
DATABASE_URL="postgresql://nextjs_user:nextjs_password@localhost:5432/nextjs_db"

# Environnement
NODE_ENV="development"

# Next.js
NEXT_PUBLIC_APP_NAME="Mon Site Web"
```

### 4️⃣ Démarrer la Base de Données

```bash
# Démarrez PostgreSQL avec Docker Compose
docker-compose up -d

# Vérifiez que le conteneur est en cours d'exécution
docker-compose ps
```

### 5️⃣ Exécuter les Migrations Prisma

```bash
# Générez et exécutez les migrations
pnpm run prisma:migrate

# Quand on vous demande, nommez votre première migration (ex: "init")
```

### 6️⃣ (Optionnel) Seeder la Base de Données

```bash
pnpm run prisma:seed
```

### 7️⃣ Démarrer le Serveur de Développement

```bash
pnpm run dev
```

Ouvrez [http://localhost:3000](http://localhost:3000) dans votre navigateur.

---

## 🔐 Variables d'Environnement

### Fichier `.env.example` (Template)

```env
# ===== BASE DE DONNÉES =====
DATABASE_URL="postgresql://user:password@host:port/database"

# ===== ENVIRONNEMENT =====
NODE_ENV="development" # ou "production"

# ===== NEXT.JS =====
NEXT_PUBLIC_APP_NAME="Mon Site Web"
NEXT_PUBLIC_API_URL="http://localhost:3000"

# ===== OPTIONNEL =====
# Ajoutez ici d'autres variables selon vos besoins
```

### Sécurité

⚠️ **IMPORTANT:**

- Ne commitez JAMAIS `.env.local` dans Git
- Utilisez `.env.example` pour documenter les variables
- Les variables commençant par `NEXT_PUBLIC_` sont exposées au navigateur

---

## 🛠️ Commandes Utiles

### Développement

```bash
# Démarrer le serveur de développement
pnpm run dev

# Build pour la production
pnpm run build

# Démarrer le serveur de production
pnpm start

# Linter le code
pnpm run lint

# Formater le code
pnpm run format
```

### Prisma

```bash
# Créer et exécuter une nouvelle migration
pnpm run prisma:migrate

# Ouvrir Prisma Studio (UI pour explorer votre BD)
pnpm run prisma:studio

# Générer le client Prisma
pnpm run prisma:generate

# Pousser le schéma à la BD (sans migration)
pnpm run db:push

# Réinitialiser la BD complètement
pnpm run db:reset
```

### Docker

```bash
# Démarrer les services
docker-compose up

# Démarrer en arrière-plan
docker-compose up -d

# Arrêter les services
docker-compose down

# Voir les logs
docker-compose logs -f postgres

# Supprimer tout (conteneurs, volumes, etc.)
docker-compose down -v
```

---

## 📂 Structure des Dossiers

```
new_stack/
├── src/
│   ├── app/                 # Next.js App Router
│   │   ├── api/            # Routes API
│   │   │   └── health/     # Exemple d'endpoint
│   │   ├── layout.tsx      # Layout racine
│   │   └── page.tsx        # Page d'accueil
│   ├── components/         # Composants React réutilisables
│   │   └── (créez des sous-dossiers)
│   ├── lib/                # Fonctions utilitaires
│   │   └── db.ts          # Instance Prisma (à créer)
│   ├── types/              # Types TypeScript
│   │   └── index.ts       # Types globaux
│   └── styles/             # Feuilles de style
│       └── globals.css    # Styles globaux Tailwind
├── prisma/
│   ├── schema.prisma       # Schéma de la BD
│   ├── seed.ts            # Script de seed
│   └── prisma.config.ts   # Config Prisma
├── public/                 # Fichiers statiques
├── .env.local             # Variables d'environnement (local)
├── .env.example           # Template des variables
├── .env.docker            # Variables Docker Compose
├── .gitignore             # Fichiers à ignorer dans Git
├── docker-compose.yml     # Configuration Docker
├── next.config.ts         # Configuration Next.js
├── tsconfig.json          # Configuration TypeScript
├── tailwind.config.ts     # Configuration Tailwind
├── postcss.config.mjs     # Configuration PostCSS
├── .prettierrc.mjs        # Configuration Prettier
├── package.json           # Dépendances et scripts
└── README.md              # Ce fichier
```

---

## 🔄 Workflow de Développement

### Cycle Typique

#### 1. **Vous modifiez le schéma Prisma**

Éditez `prisma/schema.prisma` pour ajouter/modifier des modèles :

```prisma
model Post {
  id    Int     @id @default(autoincrement())
  title String
  content String
  authorId Int
  author User @relation(fields: [authorId], references: [id])
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@map("posts")
}
```

#### 2. **Créer une migration**

```bash
pnpm run prisma:migrate
# Nommez-la: "add_posts_table"
```

Cela crée:

- Un fichier de migration dans `prisma/migrations/`
- Met à jour votre BD
- Génère le client Prisma

#### 3. **Utiliser votre modèle dans le code**

```typescript
// src/app/api/posts/route.ts
import { prisma } from "@/lib/db";

export async function GET() {
  const posts = await prisma.post.findMany();
  return Response.json(posts);
}
```

#### 4. **Visualiser avec Prisma Studio**

```bash
pnpm run prisma:studio
```

---

## 🗄️ Prisma et Base de Données

### Créer l'Instance Prisma

Créez `src/lib/db.ts` :

```typescript
import { PrismaClient } from "@prisma/client";

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: ["query"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
```

### Exemple: Créer une Route API avec Prisma

```typescript
// src/app/api/users/route.ts
import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

// GET: Récupérer tous les users
export async function GET() {
  const users = await prisma.user.findMany();
  return NextResponse.json(users);
}

// POST: Créer un user
export async function POST(req: NextRequest) {
  const { email, name } = await req.json();

  const user = await prisma.user.create({
    data: { email, name },
  });

  return NextResponse.json(user, { status: 201 });
}
```

### Lire les Données dans un Composant (avec Async Server Component)

```typescript
// src/app/components/UsersList.tsx
import { prisma } from "@/lib/db";

export default async function UsersList() {
  const users = await prisma.user.findMany();

  return (
    <div>
      <h1>Utilisateurs</h1>
      <ul>
        {users.map((user) => (
          <li key={user.id}>{user.name} ({user.email})</li>
        ))}
      </ul>
    </div>
  );
}
```

---

## 📚 Ressources

### Documentation Officielle

- 📘 [Next.js Documentation](https://nextjs.org/docs)
- 📗 [Prisma Documentation](https://www.prisma.io/docs/)
- 📙 [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- 📕 [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- 📓 [TypeScript Documentation](https://www.typescriptlang.org/docs/)

### Tutoriels Recommandés

- [Next.js by Example](https://nextjs.org/learn)
- [Prisma Quickstart](https://www.prisma.io/docs/getting-started/quickstart)
- [Docker for Developers](https://docs.docker.com/get-started/)

### Outils Utiles

- **Prisma Studio** - UI pour explorer votre BD: `pnpm run prisma:studio`
- **Next.js DevTools** - Devtools intégrés dans Next.js 15
- **VSCode Extensions:**
  - Prisma
  - ES7+ React/Redux/React-Native snippets
  - Tailwind CSS IntelliSense
  - Thunder Client (pour tester les APIs)

---

## 🐛 Dépannage

### Erreur: "Cannot find module @prisma/client"

```bash
pnpm install
pnpm run prisma:generate
```

### Erreur: "Connection refused" (PostgreSQL)

```bash
# Vérifiez que Docker est lancé
docker-compose ps

# Relancez Docker
docker-compose down
docker-compose up -d

# Attendez quelques secondes avant de relancer votre app
```

### Erreur: "Database connection timeout"

Vérifiez que `DATABASE_URL` dans `.env.local` est correcte:

```env
# Format correct:
DATABASE_URL="postgresql://user:password@localhost:5432/dbname"
```

### La BD est corrompue ou en état incohérent

```bash
# Réinitialisez complètement (ATTENTION: perte de données)
npm run db:reset
```

---

## 📝 Prochaines Étapes

1. ✅ Lire ce README entièrement
2. ✅ Installer les dépendances (`pnpm install`)
3. ✅ Configurer `.env.local`
4. ✅ Démarrer Docker (`docker-compose up -d`)
5. ✅ Exécuter les migrations (`pnpm run prisma:migrate`)
6. ✅ Démarrer le dev server (`pnpm run dev`)
7. 📝 Commencer à modéliser votre BD dans `prisma/schema.prisma`
8. 🚀 Créer vos premières routes API
9. 🎨 Construire vos composants React

---

## 💡 Conseils Développement

### Bonnes Pratiques

- 📁 **Organisez vos dossiers** par feature/domaine
- 🔒 **Ne commitez jamais** `.env.local`
- 📝 **Documentez** vos modèles Prisma avec des commentaires
- 🧪 **Testez** vos migrations avant de pousser
- 🔄 **Faites des commits** atomiques et réguliers
- 📚 **Utilisez** des types TypeScript partout

### Exemple de Structure Avancée

```
src/
├── app/
│   ├── (auth)/          # Route group pour authentification
│   ├── (dashboard)/     # Route group pour tableau de bord
│   └── api/
│       ├── v1/          # API version 1
│       │   ├── users/
│       │   └── posts/
│       └── v2/          # API version 2
├── components/
│   ├── common/          # Réutilisables (Button, Card, etc.)
│   ├── auth/            # Composants d'authentification
│   └── dashboard/       # Composants du tableau de bord
├── hooks/               # React Hooks personnalisés
├── lib/
│   ├── db.ts
│   ├── auth.ts          # Logique d'authentification
│   └── utils.ts
└── types/
    ├── index.ts
    └── api.ts           # Types pour les APIs
```

---

## 📞 Support

Pour des questions:

- Consultez la [Documentation Next.js](https://nextjs.org)
- Visitez la [Communauté Prisma](https://www.prisma.io/community)
- Posez des questions sur [Stack Overflow](https://stackoverflow.com)

## 🎯 Migration vers pnpm

Vous avez décidé d'utiliser **pnpm** ? C'est un excellent choix ! Voici les avantages :

✅ **Plus rapide** - Gestion des dépendances optimisée  
✅ **Espace disque** - Structure de liens symboliques (node_modules plus petit)  
✅ **Stricte** - Détecte les dépendances non déclarées  
✅ **Monorepo** - Support natif des workspaces

### Démarrage avec pnpm

Si vous n'avez pas encore pnpm :

```bash
# Installation globale
npm install -g pnpm

# Vérification
pnpm --version
```

Ensuite, supprimez les anciens fichiers et réinstallez :

```bash
# Supprimer les anciens fichiers de package manager
rm -rf node_modules
rm -f package-lock.json  # Si vous aviez npm
rm -f yarn.lock         # Si vous aviez yarn

# Installer avec pnpm
pnpm install

# Tout est prêt!
```

### Commandes pnpm vs npm

| Tâche                | npm                  | pnpm              |
| -------------------- | -------------------- | ----------------- |
| Installer            | `npm install`        | `pnpm install`    |
| Ajouter un package   | `npm install pkg`    | `pnpm add pkg`    |
| Supprimer un package | `npm uninstall pkg`  | `pnpm remove pkg` |
| Exécuter un script   | `npm run dev`        | `pnpm run dev`    |
| Globallement         | `npm install -g pkg` | `pnpm add -g pkg` |

---

**Bon développement! 🎉**

_Stack créée le 5 décembre 2025 - Migré vers pnpm_
