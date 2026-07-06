"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { TaskWithRelations, PRIORITY_COLORS, PRIORITY_LABELS, stripHtml } from "@/types/task";
import { Calendar, User, ExternalLink } from "lucide-react";

type Props = {
  task: TaskWithRelations;
  onClick: () => void;
};

export default function TaskCard({ task, onClick }: Props) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    borderColor: "var(--card-border)",
    boxShadow: isDragging ? undefined : "var(--card-shadow)",
  };
  const preview = task.content ? stripHtml(task.content).slice(0, 80) : "";

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "bg-white rounded-xl border p-3 select-none group transition-all",
        "hover:shadow-md",
        isDragging && "opacity-50 shadow-xl rotate-1"
      )}
    >
      <div {...attributes} {...listeners} onClick={onClick} className="cursor-pointer" suppressHydrationWarning>
        {/* 우선순위 + 링크 */}
        <div className="flex items-center justify-between mb-1.5">
          <span className={cn("text-xs font-medium", PRIORITY_COLORS[task.priority])}>
            {PRIORITY_LABELS[task.priority]}
          </span>
          <Link
            href={`/board/${task.id}`}
            onClick={(e) => e.stopPropagation()}
            className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-gray-700 transition-opacity p-0.5 rounded"
            title="상세 페이지"
          >
            <ExternalLink size={11} />
          </Link>
        </div>

        {/* 제목 */}
        <p className="text-sm font-medium text-gray-900 line-clamp-2 mb-1">{task.title}</p>

        {/* 내용 미리보기 */}
        {preview && (
          <p className="text-xs text-gray-400 line-clamp-2 mb-2 leading-relaxed">{preview}</p>
        )}

        {/* 태그 */}
        {task.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2">
            {task.tags.slice(0, 3).map((tag) => (
              <span
                key={tag.id}
                className="text-xs px-1.5 py-0.5 rounded-full font-medium"
                style={{ backgroundColor: tag.color + "20", color: tag.color }}
              >
                {tag.name}
              </span>
            ))}
            {task.tags.length > 3 && (
              <span className="text-xs text-gray-400">+{task.tags.length - 3}</span>
            )}
          </div>
        )}
      </div>

      {/* 하단 메타 */}
      <div className="flex items-center gap-3 text-xs text-gray-400 mt-1">
        {task.dueDate && (
          <span className="flex items-center gap-1">
            <Calendar size={11} />
            {new Date(task.dueDate).toLocaleDateString("ko-KR", { month: "short", day: "numeric" })}
          </span>
        )}
        {task.assignee && (
          <span className="flex items-center gap-1 ml-auto">
            <User size={11} />
            {task.assignee.name}
          </span>
        )}
      </div>
    </div>
  );
}
