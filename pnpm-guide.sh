#!/bin/bash

# 📦 Guide d'utilisation de pnpm
# Affiche les commandes courantes et des astuces pnpm

echo "=========================================="
echo "  📦 Guide pnpm pour ce projet"
echo "=========================================="
echo ""

echo "🚀 INSTALLATION"
echo "├─ Installation initiale: pnpm install"
echo "├─ Ajouter un package: pnpm add <package>"
echo "└─ Ajouter en devDeps: pnpm add -D <package>"
echo ""

echo "🔄 DÉVELOPPEMENT"
echo "├─ Démarrer dev: pnpm run dev"
echo "├─ Build: pnpm run build"
echo "├─ Lint: pnpm run lint"
echo "└─ Format: pnpm run format"
echo ""

echo "🗄️  BASE DE DONNÉES"
echo "├─ Migrations: pnpm run prisma:migrate"
echo "├─ Studio: pnpm run prisma:studio"
echo "├─ Generate: pnpm run prisma:generate"
echo "└─ Reset BD: pnpm run db:reset"
echo ""

echo "🔧 UTILITAIRES pnpm"
echo "├─ Voir versions: pnpm list"
echo "├─ Voir l'arborescence: pnpm list --depth=2"
echo "├─ Nettoyer cache: pnpm store prune"
echo "├─ Mettre à jour: pnpm update"
echo "└─ Enlever package: pnpm remove <package>"
echo ""

echo "💡 ASTUCES"
echo "├─ pnpm supporte les monorepos avec pnpm-workspace.yaml"
echo "├─ Les dépendances inutilisées sont détectées"
echo "├─ node_modules plus compact qu'avec npm"
echo "└─ Plus rapide grâce à la gestion stricte des dépendances"
echo ""

echo "📋 PLUS D'INFO: https://pnpm.io/docs"
