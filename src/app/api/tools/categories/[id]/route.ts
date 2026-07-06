import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { Role } from "@prisma/client";

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const isAdmin = session.user.role === Role.OWNER || session.user.role === Role.MANAGER;
  if (!isAdmin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  await db.toolCategory.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
