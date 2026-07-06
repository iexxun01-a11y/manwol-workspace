import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import KanbanBoard from "@/components/board/KanbanBoard";
import { TaskWithRelations } from "@/types/task";

export const dynamic = "force-dynamic";

const TASK_INCLUDE = {
  author: { select: { id: true, name: true } },
  assignee: { select: { id: true, name: true } },
  tags: { select: { tag: { select: { id: true, name: true, color: true } } } },
} as const;

function serializeTask(t: {
  dueDate: Date | null;
  createdAt: Date;
  updatedAt: Date;
  tags: { tag: { id: string; name: string; color: string } }[];
  [key: string]: unknown;
}): TaskWithRelations {
  return {
    ...(t as unknown as TaskWithRelations),
    dueDate: t.dueDate ? t.dueDate.toISOString() : null,
    createdAt: t.createdAt.toISOString(),
    updatedAt: t.updatedAt.toISOString(),
    tags: t.tags.map((tt) => tt.tag),
  };
}

export default async function BoardPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const [tasks, users] = await Promise.all([
    db.task.findMany({ include: TASK_INCLUDE, orderBy: { order: "asc" } }),
    db.user.findMany({
      where: { status: { not: "INVITED" } },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
  ]);

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-lg font-semibold text-gray-900">칸반 보드</h1>
      </div>
      <div className="flex-1 overflow-hidden">
        <KanbanBoard initialTasks={tasks.map(serializeTask)} users={users} />
      </div>
    </div>
  );
}
