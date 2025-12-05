-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'CMO', 'BUCHERON');

-- CreateTable
CREATE TABLE "user" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "firstname" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "agenceId" TEXT,
    "email" TEXT NOT NULL,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "image" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "session" (
    "id" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "token" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "userId" TEXT NOT NULL,

    CONSTRAINT "session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "account" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "accessToken" TEXT,
    "refreshToken" TEXT,
    "idToken" TEXT,
    "accessTokenExpiresAt" TIMESTAMP(3),
    "refreshTokenExpiresAt" TIMESTAMP(3),
    "scope" TEXT,
    "password" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verification" (
    "id" TEXT NOT NULL,
    "identifier" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "verification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "agence" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "agence_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ut" (
    "id" TEXT NOT NULL,
    "number" TEXT NOT NULL,

    CONSTRAINT "ut_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "foret" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "triageId" TEXT NOT NULL,

    CONSTRAINT "foret_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "parcelle" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "foretId" TEXT NOT NULL,

    CONSTRAINT "parcelle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "triage" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "triage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chantier" (
    "id" TEXT NOT NULL,
    "date_debut" TIMESTAMP(3) NOT NULL,
    "date_fin" TIMESTAMP(3) NOT NULL,
    "date_cloture" TIMESTAMP(3) NOT NULL,
    "foret" TEXT NOT NULL,
    "triage" TEXT NOT NULL,
    "parcelle" TEXT NOT NULL,

    CONSTRAINT "chantier_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "jour" (
    "id" TEXT NOT NULL,
    "chantierId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "h_rendement" INTEGER,
    "location_materiel" INTEGER,
    "ind_kilometrique" INTEGER,
    "transport_materiel" BOOLEAN NOT NULL,
    "panier" BOOLEAN NOT NULL,

    CONSTRAINT "jour_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "phase" (
    "id" TEXT NOT NULL,
    "jourId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "duree" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "phase_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_AgenceUTs" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_AgenceUTs_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_UserUTs" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_UserUTs_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_email_key" ON "user"("email");

-- CreateIndex
CREATE INDEX "session_userId_idx" ON "session"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "session_token_key" ON "session"("token");

-- CreateIndex
CREATE INDEX "account_userId_idx" ON "account"("userId");

-- CreateIndex
CREATE INDEX "verification_identifier_idx" ON "verification"("identifier");

-- CreateIndex
CREATE INDEX "_AgenceUTs_B_index" ON "_AgenceUTs"("B");

-- CreateIndex
CREATE INDEX "_UserUTs_B_index" ON "_UserUTs"("B");

-- AddForeignKey
ALTER TABLE "user" ADD CONSTRAINT "user_agenceId_fkey" FOREIGN KEY ("agenceId") REFERENCES "agence"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "session" ADD CONSTRAINT "session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "account" ADD CONSTRAINT "account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "foret" ADD CONSTRAINT "foret_triageId_fkey" FOREIGN KEY ("triageId") REFERENCES "triage"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "parcelle" ADD CONSTRAINT "parcelle_foretId_fkey" FOREIGN KEY ("foretId") REFERENCES "foret"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "jour" ADD CONSTRAINT "jour_chantierId_fkey" FOREIGN KEY ("chantierId") REFERENCES "chantier"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "phase" ADD CONSTRAINT "phase_jourId_fkey" FOREIGN KEY ("jourId") REFERENCES "jour"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AgenceUTs" ADD CONSTRAINT "_AgenceUTs_A_fkey" FOREIGN KEY ("A") REFERENCES "agence"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AgenceUTs" ADD CONSTRAINT "_AgenceUTs_B_fkey" FOREIGN KEY ("B") REFERENCES "ut"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_UserUTs" ADD CONSTRAINT "_UserUTs_A_fkey" FOREIGN KEY ("A") REFERENCES "ut"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_UserUTs" ADD CONSTRAINT "_UserUTs_B_fkey" FOREIGN KEY ("B") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
