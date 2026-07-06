/**
 * 시드 스크립트 — 최초 대표(OWNER) 계정 생성.
 * 실행: npx prisma db seed
 */
import "dotenv/config";
import { PrismaClient, Role, UserStatus } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg(process.env.DATABASE_URL!);
const db = new PrismaClient({ adapter });

async function main() {
  const ownerEmail = process.env.SEED_OWNER_EMAIL ?? "banbyeol.official@gmail.com";
  const ownerName = process.env.SEED_OWNER_NAME ?? "대표";

  const existing = await db.user.findUnique({ where: { email: ownerEmail } });

  if (existing) {
    console.log(`이미 존재하는 계정: ${ownerEmail}`);
    return;
  }

  const owner = await db.user.create({
    data: {
      email: ownerEmail,
      name: ownerName,
      role: Role.OWNER,
      status: UserStatus.ACTIVE,
      position: "대표",
    },
  });

  console.log(`✅ 대표 계정 생성 완료`);
  console.log(`   이메일: ${owner.email}`);
  console.log(`   이름:   ${owner.name}`);
  console.log(`   역할:   ${owner.role}`);
  console.log(``);
  console.log(`로그인: http://localhost:3000/login 에서 이메일 입력`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
