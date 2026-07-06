// Prisma 7 설정
// - datasource.url: 마이그레이션·인트로스펙션용
// - 런타임 클라이언트는 src/lib/db.ts 에서 어댑터로 별도 연결
import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "ts-node --compiler-options {\"module\":\"CommonJS\"} prisma/seed.ts",
  },
  datasource: {
    url: process.env.DATABASE_URL,
  },
});
