#!/bin/bash

# ✅ Script de vérification Prisma 6
# Vérifiez que tout est correctement configuré

set -e

echo "🔍 Vérification de la configuration Prisma 6..."
echo ""

# Couleurs
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

check_mark() {
    echo -e "${GREEN}✓${NC} $1"
}

error_mark() {
    echo -e "${RED}✗${NC} $1"
}

warning_mark() {
    echo -e "${YELLOW}⚠${NC} $1"
}

# 1. Vérifier que schema.prisma n'a pas d'url
echo "1️⃣ Vérification du fichier schema.prisma..."
if grep -q "url.*=.*env" prisma/schema.prisma; then
    error_mark "schema.prisma contient 'url = env(...)' - À ENLEVER!"
    echo "   Éditez prisma/schema.prisma et supprimez la ligne 'url = env(...)'"
    exit 1
else
    check_mark "schema.prisma est correct (pas de url)"
fi
echo ""

# 2. Vérifier que prisma.config.ts existe
echo "2️⃣ Vérification du fichier prisma.config.ts..."
if [ ! -f prisma/prisma.config.ts ]; then
    error_mark "prisma/prisma.config.ts n'existe pas!"
    exit 1
else
    if grep -q "DATABASE_URL" prisma/prisma.config.ts; then
        check_mark "prisma.config.ts contient DATABASE_URL"
    else
        error_mark "prisma.config.ts n'utilise pas DATABASE_URL"
        exit 1
    fi
fi
echo ""

# 3. Vérifier le .env.local
echo "3️⃣ Vérification du fichier .env.local..."
if [ ! -f .env.local ]; then
    warning_mark ".env.local n'existe pas"
    echo "   Créez-le avec: cp .env.example .env.local"
else
    if grep -q "DATABASE_URL" .env.local; then
        check_mark ".env.local contient DATABASE_URL"
        DB_URL=$(grep "DATABASE_URL" .env.local | cut -d'=' -f2 | tr -d '"')
        echo "   Database: $DB_URL"
    else
        error_mark ".env.local n'a pas de DATABASE_URL"
        exit 1
    fi
fi
echo ""

# 4. Vérifier que Docker est lancé
echo "4️⃣ Vérification de Docker..."
if command -v docker &> /dev/null; then
    check_mark "Docker est installé"
    
    if docker compose ps | grep -q "postgres"; then
        check_mark "PostgreSQL est en cours d'exécution"
    else
        warning_mark "PostgreSQL ne semble pas lancé"
        echo "   Lancez avec: docker compose up -d"
    fi
else
    error_mark "Docker n'est pas installé"
fi
echo ""

# 5. Vérifier l'instance Prisma
echo "5️⃣ Vérification de l'instance Prisma..."
if [ -f src/lib/db.ts ]; then
    if grep -q "new PrismaClient" src/lib/db.ts; then
        check_mark "src/lib/db.ts existe et contient PrismaClient"
    else
        error_mark "src/lib/db.ts n'a pas PrismaClient"
        exit 1
    fi
else
    warning_mark "src/lib/db.ts n'existe pas"
    echo "   Créez-le pour utiliser Prisma"
fi
echo ""

# 6. Vérifier les dépendances
echo "6️⃣ Vérification des dépendances..."
if grep -q "@prisma/client" package.json; then
    check_mark "@prisma/client est dans package.json"
else
    error_mark "@prisma/client manque dans package.json"
fi

if grep -q "prisma" package.json; then
    check_mark "prisma est dans package.json"
else
    error_mark "prisma manque dans package.json"
fi
echo ""

echo "═══════════════════════════════════════════════════════════"
echo "✨ Vérification terminée!"
echo "═══════════════════════════════════════════════════════════"
echo ""
echo "🎯 Prochaines étapes:"
echo "   1. pnpm run prisma:generate"
echo "   2. pnpm run prisma:migrate"
echo "   3. pnpm run prisma:studio"
echo ""
