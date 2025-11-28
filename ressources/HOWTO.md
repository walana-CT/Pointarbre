# Useful links



# Database

## reset DB
launch project with `make vdown ; make`

## explore DB

### accès à admin container (consulter la base de donnée)
http://localhost:8080/
- system `postgresql`
- server `postgres:5432`
- user `alice`
- pass `caglisse`
- database `pointarbre`

### Aller dans la base de donnée en SQL:
`docker exec -it postgres psql -U alice -d pointarbre`

## Prisma ORM

Liste des commandes les plus courantes pour prisma.

### npx prisma db pull
- exporter les data d'une DB existante vers Prisma

### npx prisma db push
- Pousser ton modèle Prisma vers la base de données, sans créer de migrations.
- à utiliser en dev pas en prod.

### npx prisma migrate dev --name [nom]
- Créer une nouvelle migration basée sur les changements du schema.prisma.
- Appliquer les migrations sur la base de développement.
- Regénérer le client Prisma.
- à utiliser dès que l'on modifie un modèle pour générer un historique

### npx prisma migrate deploy
- Appliquer toutes les migrations sans en créer de nouvelles.
- C’est la commande utilisée en production Sur un serveur (production), Dans un pipeline CI/CD, Pour synchroniser un environnement distant.

### npx prisma migrate reset
- drop des tables
- réapplique toutes les migrations
- regénère le client
- attention dangeureux à utiliser seulement en dev quand la DB est cassée

### npx prisma generate

- Générer le client Prisma (bibliothèque JavaScript utilisée pour interagir avec la DB).
- Après modification du schema.prisma.
- Après une migration.
- Après installation dans un nouveau container Docker.

### npx prisma validate
- Vérifier si ton schéma est valide (syntaxique et logique).

### npx prisma format
- Formatter automatiquement ton schema.prisma (comme Prettier mais pour Prisma).

### npx prisma studio
- Ouvre prisma studio



