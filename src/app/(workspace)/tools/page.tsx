import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import ToolsClient from "./ToolsClient";
import { Role } from "@prisma/client";

export const dynamic = "force-dynamic";

export default async function ToolsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const isAdmin = session.user.role === Role.OWNER || session.user.role === Role.MANAGER;

  // DB에서 카테고리+링크 불러오기 (없으면 기본값 사용)
  let categories: { id: string; name: string; links: { id: string; name: string; url: string; desc: string; emoji: string }[] }[] = [];
  try {
    const cats = await db.toolCategory.findMany({
      include: { links: { orderBy: { order: "asc" } } },
      orderBy: { order: "asc" },
    });
    if (cats.length > 0) {
      categories = cats.map((c) => ({
        id: c.id,
        name: c.name,
        links: c.links.map((l) => ({ id: l.id, name: l.name, url: l.url, desc: l.desc ?? "", emoji: l.emoji ?? "🔗" })),
      }));
    }
  } catch {
    // DB 테이블 없으면 기본값
  }

  return <ToolsClient initialCategories={categories} isAdmin={isAdmin} userId={session.user.id} />;
}
