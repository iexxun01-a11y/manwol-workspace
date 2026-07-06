import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { TaskWithRelations } from "@/types/task";
import TaskCalendar from "@/components/calendar/TaskCalendar";

export const dynamic = "force-dynamic";

export default async function CalendarPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const [tasks, users] = await Promise.all([
    db.task.findMany({
      include: {
        author: { select: { id: true, name: true } },
        assignee: { select: { id: true, name: true } },
        tags: { select: { tag: { select: { id: true, name: true, color: true } } } },
      },
      orderBy: { dueDate: "asc" },
    }),
    db.user.findMany({
      where: { status: { not: "INVITED" } },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
  ]);

  const serialized: TaskWithRelations[] = tasks.map((t) => ({
    ...t,
    dueDate: t.dueDate ? t.dueDate.toISOString() : null,
    createdAt: t.createdAt.toISOString(),
    updatedAt: t.updatedAt.toISOString(),
    tags: t.tags.map((tt) => tt.tag),
  }));

  return (
    <div className="flex flex-col" style={{ height: "calc(100vh - 4rem)" }}>
      <div className="mb-5 shrink-0">
        <h1 className="text-lg font-semibold text-gray-900">캘린더</h1>
        <p className="text-xs text-gray-400 mt-0.5">마감일 기준으로 태스크를 표시합니다</p>
      </div>
      <div className="flex-1 min-h-0">
        <TaskCalendar tasks={serialized} users={users} />
      </div>
    </div>
  );
}
