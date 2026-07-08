import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { Role, UserStatus } from "@prisma/client";

// 전체 직원 목록 (OWNER/MANAGER만)
export async function GET() {
  const session = await auth();
  if (!session?.user || !["OWNER", "MANAGER"].includes(session.user.role)) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const users = await db.user.findMany({
    orderBy: [{ status: "asc" }, { createdAt: "asc" }],
    select: { id: true, email: true, name: true, role: true, position: true, status: true, createdAt: true, firstLoginAt: true },
  });

  return Response.json(users);
}

// 직원 초대 (OWNER만)
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user || session.user.role !== "OWNER") {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const { email, name, role, position } = await req.json();
  if (!email || !name) return Response.json({ error: "이메일과 이름은 필수입니다" }, { status: 400 });

  const existing = await db.user.findUnique({ where: { email } });
  if (existing) return Response.json({ error: "이미 등록된 이메일입니다" }, { status: 409 });

  const user = await db.user.create({
    data: {
      email,
      name,
      role: (role as Role) ?? Role.MEMBER,
      position: position || null,
      status: UserStatus.INVITED,
    },
  });

  return Response.json(user, { status: 201 });
}
