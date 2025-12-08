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
