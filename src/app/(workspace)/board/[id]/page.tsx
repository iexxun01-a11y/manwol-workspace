import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect, notFound } from "next/navigation";
import TaskDetailClient from "./TaskDetailClient";
import { TaskWithRelations } from "@/types/task";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

export default async function TaskDetailPage({ params }: Props) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user) redirect("/login");

  const [task, users, files] = await Promise.all([
    db.task.findUnique({
      where: { id },
      include: {
        author: { select: { id: true, name: true } },
        assignee: { select: { id: true, name: true } },
        tags: { select: { tag: { select: { id: true, name: true, color: true } } } },
      },
    }),
    db.user.findMany({
      where: { status: { not: "INVITED" } },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
    db.file.findMany({
      where: { taskId: id },
      orderBy: { createdAt: "asc" },
      select: { id: true, filename: true, mimeType: true, size: true, createdAt: true },
    }),
  ]);

  if (!task) notFound();

  const serialized: TaskWithRelations = {
    ...task,
    dueDate: task.dueDate ? task.dueDate.toISOString() : null,
    createdAt: task.createdAt.toISOString(),
    updatedAt: task.updatedAt.toISOString(),
    tags: task.tags.map((tt) => tt.tag),
  };

  return (
    <TaskDetailClient
      task={serialized}
      users={users}
      files={files.map((f) => ({ ...f, createdAt: f.createdAt.toISOString() }))}
    />
  );
}
