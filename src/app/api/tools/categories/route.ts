import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { Role } from "@prisma/client";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const isAdmin = session.user.role === Role.OWNER || session.user.role === Role.MANAGER;
  if (!isAdmin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { name } = await req.json();
  const count = await db.toolCategory.count();
  const cat = await db.toolCategory.create({ data: { name, order: count } });
  return NextResponse.json(cat);
}
