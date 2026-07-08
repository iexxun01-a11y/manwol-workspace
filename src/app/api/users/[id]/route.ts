import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { Role, UserStatus } from "@prisma/client";

// 직원 정보 수정 (OWNER만)
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user || session.user.role !== "OWNER") {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const body = await req.json();
  const { name, role, position, status } = body;

  // 본인 역할 변경 방지
  if (id === session.user.id && role && role !== session.user.role) {
    return Response.json({ error: "본인 역할은 변경할 수 없습니다" }, { status: 400 });
  }

  const user = await db.user.update({
    where: { id },
    data: {
      ...(name && { name }),
      ...(role && { role: role as Role }),
      ...(position !== undefined && { position }),
      ...(status && { status: status as UserStatus }),
    },
  });

  return Response.json(user);
}
