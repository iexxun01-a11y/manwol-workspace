import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { assertCan } from "@/lib/permissions";
import { z } from "zod";

const RegisterSchema = z.object({
  storageKey: z.string().min(1),
  filename: z.string().min(1).max(255),
  mimeType: z.string().min(1),
  size: z.number().int().positive(),
  taskId: z.string().optional(),
});

/** 업로드 완료 후 DB에 파일 메타 등록 */
export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) return new Response("Unauthorized", { status: 401 });

  const body = await req.json().catch(() => null);
  const parsed = RegisterSchema.safeParse(body);
  if (!parsed.success) return new Response("Bad Request", { status: 400 });

  try {
    assertCan(session.user, "file:upload");
  } catch {
    return new Response("Forbidden", { status: 403 });
  }

  const file = await db.file.create({
    data: {
      storageKey: parsed.data.storageKey,
      filename: parsed.data.filename,
      mimeType: parsed.data.mimeType,
      size: parsed.data.size,
      uploadedById: session.user.id,
      taskId: parsed.data.taskId ?? null,
    },
  });

  return Response.json(file, { status: 201 });
}
