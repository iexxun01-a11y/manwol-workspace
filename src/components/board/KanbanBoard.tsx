"use client";

import { useState, useCallback } from "react";
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
} from "@dnd-kit/core";
import { TaskStatus } from "@prisma/client";
import { TaskWithRelations, COLUMN_LABELS } from "@/types/task";
import KanbanColumn from "./KanbanColumn";
import TaskCard from "./TaskCard";
import TaskModal from "./TaskModal";

type Props = {
  initialTasks: TaskWithRelations[];
  users: { id: string; name: string }[];
};

const COLUMNS = [TaskStatus.TODO, TaskStatus.IN_PROGRESS, TaskStatus.DONE];

export default function KanbanBoard({ initialTasks, users }: Props) {
  const [tasks, setTasks] = useState<TaskWithRelations[]>(initialTasks);
  const [activeTask, setActiveTask] = useState<TaskWithRelations | null>(null);
  const [modal, setModal] = useState<
    | { type: "create"; status: TaskStatus }
    | { type: "edit"; task: TaskWithRelations }
    | null
  >(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const tasksByStatus = useCallback(
    (status: TaskStatus) =>
      tasks.filter((t) => t.status === status).sort((a, b) => a.order - b.order),
    [tasks]
  );

  function handleDragStart({ active }: DragStartEvent) {
    setActiveTask(tasks.find((t) => t.id === active.id) ?? null);
  }

  function handleDragOver({ active, over }: DragOverEvent) {
    if (!over) return;
    const activeId = active.id as string;
    const overId = over.id as string;

    const activeTask = tasks.find((t) => t.id === activeId);
    if (!activeTask) return;

    // over가 컬럼 ID(TaskStatus)인 경우
    const isOverColumn = COLUMNS.includes(overId as TaskStatus);
    if (isOverColumn && activeTask.status !== overId) {
      setTasks((prev) =>
        prev.map((t) =>
          t.id === activeId ? { ...t, status: overId as TaskStatus } : t
        )
      );
    }
  }

  async function handleDragEnd({ active, over }: DragEndEvent) {
    setActiveTask(null);
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    const activeTask = tasks.find((t) => t.id === activeId);
    if (!activeTask) return;

    const isOverColumn = COLUMNS.includes(overId as TaskStatus);
    const targetStatus = isOverColumn
      ? (overId as TaskStatus)
      : tasks.find((t) => t.id === overId)?.status ?? activeTask.status;

    const columnTasks = tasks
      .filter((t) => t.status === targetStatus)
      .sort((a, b) => a.order - b.order);

    let newOrder: number;
    if (isOverColumn) {
      newOrder = columnTasks.length;
    } else {
      const overIndex = columnTasks.findIndex((t) => t.id === overId);
      newOrder = overIndex >= 0 ? overIndex : columnTasks.length;
    }

    // 낙관적 업데이트
    setTasks((prev) =>
      prev.map((t) =>
        t.id === activeId ? { ...t, status: targetStatus, order: newOrder } : t
      )
    );

    // 서버 동기화
    await fetch(`/api/tasks/${activeId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: targetStatus, order: newOrder }),
    });
  }

  async function handleCreate(data: Partial<TaskWithRelations>) {
    const res = await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("생성 실패");
    const created: TaskWithRelations = await res.json();
    setTasks((prev) => [...prev, created]);
  }

  async function handleUpdate(taskId: string, data: Partial<TaskWithRelations>) {
    const res = await fetch(`/api/tasks/${taskId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("수정 실패");
    const updated: TaskWithRelations = await res.json();
    setTasks((prev) => prev.map((t) => (t.id === taskId ? updated : t)));
  }

  async function handleDelete(taskId: string) {
    await fetch(`/api/tasks/${taskId}`, { method: "DELETE" });
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
  }

  return (
    <>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-5 h-full overflow-x-auto pb-4">
          {COLUMNS.map((status) => (
            <KanbanColumn
              key={status}
              status={status}
              label={COLUMN_LABELS[status]}
              tasks={tasksByStatus(status)}
              onCardClick={(task) => setModal({ type: "edit", task })}
              onAddClick={(s) => setModal({ type: "create", status: s })}
            />
          ))}
        </div>

        <DragOverlay>
          {activeTask && (
            <TaskCard task={activeTask} onClick={() => {}} />
          )}
        </DragOverlay>
      </DndContext>

      {/* 태스크 생성 모달 */}
      {modal?.type === "create" && (
        <TaskModal
          mode={{ type: "create", initialStatus: modal.status }}
          users={users}
          onClose={() => setModal(null)}
          onSave={handleCreate}
        />
      )}

      {/* 태스크 수정 모달 */}
      {modal?.type === "edit" && (
        <TaskModal
          mode={{ type: "edit", task: modal.task }}
          users={users}
          onClose={() => setModal(null)}
          onSave={(data) => handleUpdate(modal.task.id, data)}
          onDelete={() => handleDelete(modal.task.id)}
        />
      )}
    </>
  );
}
