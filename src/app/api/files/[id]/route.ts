import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { deleteFromR2, createDownloadUrl } from "@/lib/r2";
import { Role } from "@prisma/client";

/** 다운로드 URL 발급 */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user) return new Response("Unauthorized", { status: 401 });

  const file = await db.file.findUnique({ where: { id } });
  if (!file) return new Response("Not Found", { status: 404 });

  try {
    const url = await createDownloadUrl(file.storageKey);
    return Response.json({ url, filename: file.filename });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "R2 오류";
    return new Response(msg, { status: 500 });
  }
}

/** 파일 삭제 */
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user) return new Response("Unauthorized", { status: 401 });

  const file = await db.file.findUnique({ where: { id } });
  if (!file) return new Response("Not Found", { status: 404 });

  // 본인 업로드 파일 또는 OWNER/MANAGER만 삭제 가능
  const isOwner = file.uploadedById === session.user.id;
  const isAdmin = session.user.role === Role.OWNER || session.user.role === Role.MANAGER;
  if (!isOwner && !isAdmin) return new Response("Forbidden", { status: 403 });

  await deleteFromR2(file.storageKey);
  await db.file.delete({ where: { id } });

  return new Response(null, { status: 204 });
}
