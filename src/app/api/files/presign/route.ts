import { auth } from "@/lib/auth";
import { assertCan } from "@/lib/permissions";
import { createUploadPresignedPost } from "@/lib/r2";
import { z } from "zod";
import { randomUUID } from "crypto";

const Schema = z.object({
  filename: z.string().min(1).max(255),
  mimeType: z.string().min(1),
  taskId: z.string().optional(),
});

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) return new Response("Unauthorized", { status: 401 });

  const body = await req.json().catch(() => null);
  const parsed = Schema.safeParse(body);
  if (!parsed.success) return new Response("Bad Request", { status: 400 });

  const { filename, mimeType, taskId } = parsed.data;

  try {
    assertCan(session.user, "file:upload");
  } catch {
    return new Response("Forbidden", { status: 403 });
  }

  // 안전한 스토리지 키 생성 (원본 파일명은 메타 DB에만 보관)
  const ext = filename.includes(".") ? filename.split(".").pop()! : "";
  const storageKey = `tasks/${taskId ?? "general"}/${randomUUID()}${ext ? `.${ext}` : ""}`;

  try {
    const presigned = await createUploadPresignedPost(storageKey, mimeType);
    return Response.json({ storageKey, presigned });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "R2 오류";
    return new Response(msg, { status: 500 });
  }
}
