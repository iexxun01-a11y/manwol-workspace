"use client";

import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { cn } from "@/lib/utils";
import { TaskWithRelations } from "@/types/task";
import TaskCard from "./TaskCard";
import { Plus } from "lucide-react";
import { TaskStatus } from "@prisma/client";

type Props = {
  status: TaskStatus;
  label: string;
  tasks: TaskWithRelations[];
  onCardClick: (task: TaskWithRelations) => void;
  onAddClick: (status: TaskStatus) => void;
};

export default function KanbanColumn({ status, label, tasks, onCardClick, onAddClick }: Props) {
  const { setNodeRef, isOver } = useDroppable({ id: status });

  return (
    <div className="flex flex-col w-72 shrink-0">
      {/* 컬럼 헤더 */}
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-gray-700">{label}</span>
          <span className="text-xs text-gray-400 bg-gray-100 rounded-full px-2 py-0.5">
            {tasks.length}
          </span>
        </div>
        <button
          onClick={() => onAddClick(status)}
          className="text-gray-400 hover:text-gray-700 transition-colors p-0.5 rounded"
        >
          <Plus size={16} />
        </button>
      </div>

      {/* 드롭 영역 */}
      <div
        ref={setNodeRef}
        className={cn(
          "flex-1 rounded-xl p-2 min-h-[200px] space-y-2 transition-colors",
          isOver ? "bg-blue-50 border-2 border-blue-200 border-dashed" : "bg-gray-100"
        )}
      >
        <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
          {tasks.map((task) => (
            <TaskCard key={task.id} task={task} onClick={() => onCardClick(task)} />
          ))}
        </SortableContext>

        {tasks.length === 0 && (
          <div className="flex items-center justify-center h-24 text-xs text-gray-400">
            태스크 없음
          </div>
        )}
      </div>
    </div>
  );
}
