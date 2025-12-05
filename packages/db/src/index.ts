import 'dotenv/config'; // automatiquement charge le .env à la racine ou dans apps/web/.env si tu pointes le chemin
import { PrismaClient } from "../prisma/generated/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({
	connectionString: process.env.DATABASE_URL || "",
});

const prisma = new PrismaClient({ adapter });

export default prisma;