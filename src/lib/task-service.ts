/**
 * 태스크 비즈니스 로직 — AI·자동화·API 모두 이 함수를 경유한다.
 * 권한 체크가 여기 집중되므로 호출 경로에 무관하게 일관된 보안.
 */
import { db } from "@/lib/db";
import { assertCan } from "@/lib/permissions";
import { TaskStatus, Priority, Role } from "@prisma/client";
import { z } from "zod";

export const CreateTaskSchema = z.object({
  title: z.string().min(1).max(200),
  content: z.string().optional().default(""),
  status: z.nativeEnum(TaskStatus).optional().default(TaskStatus.TODO),
  priority: z.nativeEnum(Priority).optional().default(Priority.MEDIUM),
  dueDate: z.string().datetime().nullable().optional(),
  assigneeId: z.string().nullable().optional(),
});

export const UpdateTaskSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  content: z.string().optional(),
  status: z.nativeEnum(TaskStatus).optional(),
  priority: z.nativeEnum(Priority).optional(),
  dueDate: z.string().datetime().nullable().optional(),
  assigneeId: z.string().nullable().optional(),
  order: z.number().int().optional(),
});

type SessionUser = { id: string; role: Role };

/** 태스크 목록 조회 */
export async function getTasks(actor: SessionUser) {
  assertCan(actor, "task:read:all");
  return db.task.findMany({
    orderBy: [{ status: "asc" }, { order: "asc" }, { createdAt: "desc" }],
    include: {
      author: { select: { id: true, name: true } },
      assignee: { select: { id: true, name: true } },
    },
  });
}

/** 태스크 단건 조회 */
export async function getTask(actor: SessionUser, taskId: string) {
  assertCan(actor, "task:read:all");
  return db.task.findUnique({
    where: { id: taskId },
    include: {
      author: { select: { id: true, name: true } },
      assignee: { select: { id: true, name: true } },
      files: true,
    },
  });
}

/** 태스크 생성 */
export async function createTask(
  actor: SessionUser,
  input: z.infer<typeof CreateTaskSchema>
) {
  assertCan(actor, "task:create");

  // 같은 status 내 마지막 order 계산
  const last = await db.task.findFirst({
    where: { status: input.status ?? TaskStatus.TODO },
    orderBy: { order: "desc" },
    select: { order: true },
  });

  return db.task.create({
    data: {
      title: input.title,
      content: input.content ?? "",
      status: input.status ?? TaskStatus.TODO,
      priority: input.priority ?? Priority.MEDIUM,
      dueDate: input.dueDate ? new Date(input.dueDate) : null,
      assigneeId: input.assigneeId ?? null,
      authorId: actor.id,
      order: (last?.order ?? -1) + 1,
    },
    include: {
      author: { select: { id: true, name: true } },
      assignee: { select: { id: true, name: true } },
    },
  });
}

/** 태스크 수정 */
export async function updateTask(
  actor: SessionUser,
  taskId: string,
  input: z.infer<typeof UpdateTaskSchema>
) {
  const task = await db.task.findUniqueOrThrow({ where: { id: taskId } });

  // MEMBER는 본인 태스크만, MANAGER/OWNER는 전체
  if (actor.role === Role.MEMBER) {
    assertCan(actor, "task:manage:own", task.authorId);
  } else {
    assertCan(actor, "task:manage:all");
  }

  return db.task.update({
    where: { id: taskId },
    data: {
      ...(input.title !== undefined && { title: input.title }),
      ...(input.content !== undefined && { content: input.content }),
      ...(input.status !== undefined && { status: input.status }),
      ...(input.priority !== undefined && { priority: input.priority }),
      ...(input.dueDate !== undefined && {
        dueDate: input.dueDate ? new Date(input.dueDate) : null,
      }),
      ...(input.assigneeId !== undefined && { assigneeId: input.assigneeId }),
      ...(input.order !== undefined && { order: input.order }),
    },
    include: {
      author: { select: { id: true, name: true } },
      assignee: { select: { id: true, name: true } },
    },
  });
}

/** 칸반 드래그: 상태 변경 + 순서 일괄 갱신 */
export async function moveTask(
  actor: SessionUser,
  taskId: string,
  newStatus: TaskStatus,
  newOrder: number
) {
  const task = await db.task.findUniqueOrThrow({ where: { id: taskId } });

  if (actor.role === Role.MEMBER) {
    assertCan(actor, "task:manage:own", task.authorId);
  } else {
    assertCan(actor, "task:manage:all");
  }

  return db.task.update({
    where: { id: taskId },
    data: { status: newStatus, order: newOrder },
  });
}

/** 태스크 삭제 */
export async function deleteTask(actor: SessionUser, taskId: string) {
  const task = await db.task.findUniqueOrThrow({ where: { id: taskId } });

  if (actor.role === Role.MEMBER) {
    assertCan(actor, "task:manage:own", task.authorId);
  } else {
    assertCan(actor, "task:manage:all");
  }

  return db.task.delete({ where: { id: taskId } });
}
