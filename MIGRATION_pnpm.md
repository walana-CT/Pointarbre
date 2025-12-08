# ✨ Migration npm → pnpm

## 📋 Résumé des changements effectués

### ✅ Fichiers modifiés

1. **setup.sh**
   - Remplacé tous les `npm` par `pnpm`
   - `pnpm install`
   - `pnpm run prisma:migrate`
   - `pnpm run prisma:seed`

2. **README.md**
   - Prérequis mis à jour (pnpm only)
   - Ajout section "Installation de pnpm"
   - Toutes les commandes converties à pnpm
   - Nouvelle section "Migration vers pnpm"
   - Tableau comparatif npm vs pnpm

3. **src/app/page.tsx**
   - Exemples de commandes mis à jour
   - `pnpm run prisma:migrate` et `pnpm run prisma:studio`

### ✅ Nouveaux fichiers créés

1. **.npmrc**
   - Configuration pnpm
   - Auto-installation des peer dependencies
   - Registry par défaut

2. **pnpm-guide.sh**
   - Guide des commandes pnpm courantes
   - Astuces et bonnes pratiques
   - Lien vers la documentation

## 🚀 Prochaines étapes

1. **Installer pnpm** (si pas déjà fait) :

   ```bash
   npm install -g pnpm
   ```

2. **Nettoyer l'ancien package manager** :

   ```bash
   rm -rf node_modules package-lock.json
   ```

3. **Installer avec pnpm** :

   ```bash
   pnpm install
   ```

4. **Vérifier que tout fonctionne** :
   ```bash
   pnpm run dev
   ```

## 📊 Avantages de pnpm

✅ **30-50% plus rapide** que npm  
✅ **Économise de l'espace disque** (liens symboliques)  
✅ **Stricte** (détecte les dépendances non déclarées)  
✅ **Monorepo natif**  
✅ **Compatibilité** avec tous les packages npm

## 🔄 Cheat Sheet pnpm

```bash
# Installation
pnpm install              # Installer toutes les dépendances
pnpm add pkg              # Ajouter un package
pnpm add -D pkg           # Ajouter en devDependency
pnpm remove pkg           # Supprimer un package

# Scripts
pnpm run dev              # Exécuter un script npm
pnpm dev                  # Raccourci (sans "run")

# Maintenance
pnpm update               # Mettre à jour les packages
pnpm list                 # Voir les packages installés
pnpm store prune          # Nettoyer le cache pnpm

# Info
pnpm why pkg              # Pourquoi pkg est installé?
pnpm outdated             # Voir les packages outdated
```

## ✨ Bravo !

Vous utilisez maintenant **pnpm**, un gestionnaire de packages plus efficace et moderne ! 🎉

Pour toute question : https://pnpm.io
