import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";

const TAG_COLORS = [
  "#ef4444", "#f97316", "#eab308", "#22c55e",
  "#3b82f6", "#8b5cf6", "#ec4899", "#6b7280",
];

function pickColor(name: string) {
  let hash = 0;
  for (const c of name) hash = (hash * 31 + c.charCodeAt(0)) & 0xffffffff;
  return TAG_COLORS[Math.abs(hash) % TAG_COLORS.length];
}

/** 전체 태그 목록 */
export async function GET() {
  const session = await auth();
  if (!session?.user) return new Response("Unauthorized", { status: 401 });

  const tags = await db.tag.findMany({ orderBy: { name: "asc" } });
  return Response.json(tags);
}

/** 태그 생성 (이미 있으면 기존 반환) */
export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) return new Response("Unauthorized", { status: 401 });

  const { name } = z.object({ name: z.string().min(1).max(30) }).parse(await req.json());

  const tag = await db.tag.upsert({
    where: { name },
    update: {},
    create: { name, color: pickColor(name) },
  });

  return Response.json(tag, { status: 201 });
}
