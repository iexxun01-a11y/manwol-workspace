"use client";

import { useState, useEffect } from "react";
import { TaskWithRelations, PRIORITY_LABELS } from "@/types/task";
import { TaskStatus, Priority } from "@prisma/client";
import { X, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

type Mode =
  | { type: "create"; initialStatus: TaskStatus }
  | { type: "edit"; task: TaskWithRelations };

type Props = {
  mode: Mode;
  users: { id: string; name: string }[];
  onClose: () => void;
  onSave: (data: Partial<TaskWithRelations>) => Promise<void>;
  onDelete?: () => Promise<void>;
};

export default function TaskModal({ mode, users, onClose, onSave, onDelete }: Props) {
  const isEdit = mode.type === "edit";
  const task = isEdit ? mode.task : null;

  const [title, setTitle] = useState(task?.title ?? "");
  const [status, setStatus] = useState<TaskStatus>(
    task?.status ?? (mode.type === "create" ? mode.initialStatus : TaskStatus.TODO)
  );
  const [priority, setPriority] = useState<Priority>(task?.priority ?? Priority.MEDIUM);
  const [dueDate, setDueDate] = useState(
    task?.dueDate ? new Date(task.dueDate).toISOString().split("T")[0] : ""
  );
  const [assigneeId, setAssigneeId] = useState(task?.assigneeId ?? "");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    setSaving(true);
    try {
      await onSave({
        title: title.trim(),
        status,
        priority,
        dueDate: dueDate ? new Date(dueDate).toISOString() : null,
        assigneeId: assigneeId || null,
      });
      onClose();
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!onDelete || !confirm("정말 삭제하시겠습니까?")) return;
    setDeleting(true);
    try {
      await onDelete();
      onClose();
    } finally {
      setDeleting(false);
    }
  }

  // ESC 닫기
  useEffect(() => {
    const handler = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* 오버레이 */}
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />

      {/* 모달 */}
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-semibold text-gray-900">
            {isEdit ? "태스크 수정" : "새 태스크"}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 제목 */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">제목 *</label>
            <input
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="태스크 제목"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* 상태 */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">상태</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as TaskStatus)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 bg-white"
              >
                <option value="TODO">할 일</option>
                <option value="IN_PROGRESS">진행 중</option>
                <option value="DONE">완료</option>
              </select>
            </div>

            {/* 우선순위 */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">우선순위</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as Priority)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 bg-white"
              >
                {Object.entries(PRIORITY_LABELS).map(([val, label]) => (
                  <option key={val} value={val}>{label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* 마감일 */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">마감일</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
              />
            </div>

            {/* 담당자 */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">담당자</label>
              <select
                value={assigneeId}
                onChange={(e) => setAssigneeId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 bg-white"
              >
                <option value="">없음</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>{u.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* 버튼 */}
          <div className="flex items-center justify-between pt-2">
            {isEdit && onDelete ? (
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="flex items-center gap-1.5 text-xs text-red-500 hover:text-red-700 disabled:opacity-50"
              >
                <Trash2 size={13} />
                삭제
              </button>
            ) : (
              <span />
            )}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900"
              >
                취소
              </button>
              <button
                type="submit"
                disabled={saving || !title.trim()}
                className="px-4 py-2 bg-gray-900 text-white text-sm rounded-lg hover:bg-gray-800 disabled:opacity-50"
              >
                {saving ? "저장 중..." : isEdit ? "저장" : "만들기"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
