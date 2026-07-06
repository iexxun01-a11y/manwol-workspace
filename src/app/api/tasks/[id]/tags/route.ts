import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";

/** 태그 추가 */
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: taskId } = await params;
  const session = await auth();
  if (!session?.user) return new Response("Unauthorized", { status: 401 });

  const { tagId } = z.object({ tagId: z.string() }).parse(await req.json());

  await db.taskTag.upsert({
    where: { taskId_tagId: { taskId, tagId } },
    update: {},
    create: { taskId, tagId },
  });

  return new Response(null, { status: 204 });
}

/** 태그 제거 */
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: taskId } = await params;
  const session = await auth();
  if (!session?.user) return new Response("Unauthorized", { status: 401 });

  const { tagId } = z.object({ tagId: z.string() }).parse(await req.json());

  await db.taskTag.deleteMany({ where: { taskId, tagId } });

  return new Response(null, { status: 204 });
}
