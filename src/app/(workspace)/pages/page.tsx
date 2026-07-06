import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import Link from "next/link";
import { TaskWithRelations, COLUMN_LABELS, PRIORITY_COLORS, PRIORITY_LABELS, stripHtml } from "@/types/task";
import { TaskStatus } from "@prisma/client";
import { FileText, Calendar, User } from "lucide-react";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function PagesPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const tasks = await db.task.findMany({
    include: {
      author: { select: { id: true, name: true } },
      assignee: { select: { id: true, name: true } },
      tags: { select: { tag: { select: { id: true, name: true, color: true } } } },
    },
    orderBy: { updatedAt: "desc" },
  });

  const serialized: TaskWithRelations[] = tasks.map((t) => ({
    ...t,
    dueDate: t.dueDate ? t.dueDate.toISOString() : null,
    createdAt: t.createdAt.toISOString(),
    updatedAt: t.updatedAt.toISOString(),
    tags: t.tags.map((tt) => tt.tag),
  }));

  const grouped = (Object.keys(COLUMN_LABELS) as TaskStatus[]).map((status) => ({
    status,
    label: COLUMN_LABELS[status],
    tasks: serialized.filter((t) => t.status === status),
  }));

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-lg font-semibold text-gray-900">페이지</h1>
        <p className="text-xs text-gray-400">{tasks.length}개 태스크</p>
      </div>

      <div className="space-y-8">
        {grouped.map(({ status, label, tasks }) =>
          tasks.length === 0 ? null : (
            <section key={status}>
              <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                {label} · {tasks.length}
              </h2>
              <div className="space-y-1">
                {tasks.map((task) => {
                  const preview = task.content ? stripHtml(task.content).slice(0, 100) : "";
                  return (
                    <Link
                      key={task.id}
                      href={`/board/${task.id}`}
                      className="flex items-start gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors group"
                    >
                      <FileText size={15} className="text-gray-400 mt-0.5 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                          <span className="text-sm font-medium text-gray-900 truncate">
                            {task.title}
                          </span>
                          <span className={cn("text-xs shrink-0", PRIORITY_COLORS[task.priority])}>
                            {PRIORITY_LABELS[task.priority]}
                          </span>
                          {task.tags.map((tag) => (
                            <span
                              key={tag.id}
                              className="text-xs px-1.5 py-0.5 rounded-full shrink-0"
                              style={{ backgroundColor: tag.color + "20", color: tag.color }}
                            >
                              {tag.name}
                            </span>
                          ))}
                        </div>
                        {preview && (
                          <p className="text-xs text-gray-400 truncate mb-0.5">{preview}</p>
                        )}
                        <div className="flex items-center gap-3 text-xs text-gray-400">
                          <span>
                            {new Date(task.updatedAt).toLocaleDateString("ko-KR", { month: "short", day: "numeric" })} 수정
                          </span>
                          {task.assignee && (
                            <span className="flex items-center gap-1">
                              <User size={10} />
                              {task.assignee.name}
                            </span>
                          )}
                          {task.dueDate && (
                            <span className="flex items-center gap-1">
                              <Calendar size={10} />
                              {new Date(task.dueDate).toLocaleDateString("ko-KR", { month: "short", day: "numeric" })}
                            </span>
                          )}
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </section>
          )
        )}

        {tasks.length === 0 && (
          <div className="text-center py-16 text-gray-400">
            <FileText size={32} className="mx-auto mb-3 opacity-40" />
            <p className="text-sm">아직 태스크가 없습니다.</p>
          </div>
        )}
      </div>
    </div>
  );
}
