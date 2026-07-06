"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { TaskWithRelations, PRIORITY_LABELS, PRIORITY_COLORS, COLUMN_LABELS } from "@/types/task";
import { TaskStatus, Priority } from "@prisma/client";
import RichEditor from "@/components/editor/RichEditor";
import FileAttachments from "@/components/files/FileAttachments";
import TagSelector from "@/components/tags/TagSelector";
import { ArrowLeft, Trash2, Check, X } from "lucide-react";
import { cn } from "@/lib/utils";

type FileRecord = {
  id: string;
  filename: string;
  mimeType: string;
  size: number;
  createdAt: string;
};

type Props = {
  task: TaskWithRelations;
  users: { id: string; name: string }[];
  files: FileRecord[];
};

export default function TaskDetailClient({ task: initialTask, users, files: initialFiles }: Props) {
  const router = useRouter();
  const [task, setTask] = useState(initialTask);
  const [saving, setSaving] = useState(false);
  const [titleEditing, setTitleEditing] = useState(false);
  const [titleDraft, setTitleDraft] = useState(task.title);

  async function patch(data: Record<string, unknown>) {
    setSaving(true);
    try {
      const res = await fetch(`/api/tasks/${task.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("저장 실패");
      const updated: TaskWithRelations = await res.json();
      setTask(updated);
    } finally {
      setSaving(false);
    }
  }

  const handleContentChange = useCallback(
    async (html: string) => {
      await patch({ content: html });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [task.id]
  );

  async function handleTitleSave() {
    if (!titleDraft.trim()) { setTitleDraft(task.title); setTitleEditing(false); return; }
    await patch({ title: titleDraft.trim() });
    setTitleEditing(false);
  }

  async function handleDelete() {
    if (!confirm("정말 삭제하시겠습니까?")) return;
    await fetch(`/api/tasks/${task.id}`, { method: "DELETE" });
    router.push("/board");
  }

  return (
    <div className="max-w-3xl mx-auto py-2">
      {/* 상단 네비게이션 */}
      <div className="flex items-center justify-between mb-6">
        <Link
          href="/board"
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft size={15} />
          칸반 보드
        </Link>
        <div className="flex items-center gap-3">
          {saving && <span className="text-xs text-gray-400">저장 중...</span>}
          <button
            onClick={handleDelete}
            className="flex items-center gap-1 text-xs text-red-400 hover:text-red-600 transition-colors"
          >
            <Trash2 size={13} />
            삭제
          </button>
        </div>
      </div>

      {/* 제목 */}
      <div className="mb-6">
        {titleEditing ? (
          <div className="flex items-center gap-2">
            <input
              autoFocus
              value={titleDraft}
              onChange={(e) => setTitleDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleTitleSave();
                if (e.key === "Escape") { setTitleDraft(task.title); setTitleEditing(false); }
              }}
              className="flex-1 text-2xl font-bold text-gray-900 border-b-2 border-gray-900 outline-none bg-transparent"
            />
            <button onClick={handleTitleSave} className="text-gray-500 hover:text-gray-900">
              <Check size={16} />
            </button>
            <button onClick={() => { setTitleDraft(task.title); setTitleEditing(false); }} className="text-gray-400 hover:text-gray-700">
              <X size={16} />
            </button>
          </div>
        ) : (
          <h1
            className="text-2xl font-bold text-gray-900 cursor-text hover:bg-gray-50 rounded px-1 -mx-1 py-0.5 transition-colors"
            onClick={() => setTitleEditing(true)}
          >
            {task.title}
          </h1>
        )}
      </div>

      <div className="flex gap-8">
        {/* 메타 사이드바 */}
        <div className="w-48 shrink-0 space-y-4">
          {/* 상태 */}
          <div>
            <p className="text-xs font-medium text-gray-400 mb-1.5">상태</p>
            <select
              value={task.status}
              onChange={(e) => patch({ status: e.target.value })}
              className="w-full text-sm border border-gray-200 rounded-lg px-2 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-gray-900"
            >
              {(Object.keys(COLUMN_LABELS) as TaskStatus[]).map((s) => (
                <option key={s} value={s}>{COLUMN_LABELS[s]}</option>
              ))}
            </select>
          </div>

          {/* 우선순위 */}
          <div>
            <p className="text-xs font-medium text-gray-400 mb-1.5">우선순위</p>
            <select
              value={task.priority}
              onChange={(e) => patch({ priority: e.target.value })}
              className="w-full text-sm border border-gray-200 rounded-lg px-2 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-gray-900"
            >
              {(Object.keys(PRIORITY_LABELS) as Priority[]).map((p) => (
                <option key={p} value={p}>{PRIORITY_LABELS[p]}</option>
              ))}
            </select>
          </div>

          {/* 담당자 */}
          <div>
            <p className="text-xs font-medium text-gray-400 mb-1.5">담당자</p>
            <select
              value={task.assigneeId ?? ""}
              onChange={(e) => patch({ assigneeId: e.target.value || null })}
              className="w-full text-sm border border-gray-200 rounded-lg px-2 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-gray-900"
            >
              <option value="">없음</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>{u.name}</option>
              ))}
            </select>
          </div>

          {/* 마감일 */}
          <div>
            <p className="text-xs font-medium text-gray-400 mb-1.5">마감일</p>
            <input
              type="date"
              value={task.dueDate ? task.dueDate.split("T")[0] : ""}
              onChange={(e) =>
                patch({ dueDate: e.target.value ? new Date(e.target.value).toISOString() : null })
              }
              className="w-full text-sm border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-gray-900"
            />
          </div>

          {/* 작성자 */}
          <div>
            <p className="text-xs font-medium text-gray-400 mb-1">작성자</p>
            <p className="text-sm text-gray-700">{task.author.name}</p>
          </div>

          {/* 생성일 */}
          <div>
            <p className="text-xs font-medium text-gray-400 mb-1">생성일</p>
            <p className="text-sm text-gray-500">
              {new Date(task.createdAt).toLocaleDateString("ko-KR")}
            </p>
          </div>

          {/* 태그 */}
          <div className="pt-1">
            <TagSelector taskId={task.id} initialTags={task.tags} />
          </div>
        </div>

        {/* 본문 에디터 + 첨부파일 */}
        <div className="flex-1 min-w-0 space-y-6">
          <div>
            <p className="text-xs font-medium text-gray-400 mb-2">내용</p>
            <RichEditor
              content={task.content || ""}
              onChange={handleContentChange}
              placeholder="내용을 입력하세요..."
            />
          </div>

          <div className="border-t border-gray-100 pt-4">
            <FileAttachments taskId={task.id} initialFiles={initialFiles} />
          </div>
        </div>
      </div>
    </div>
  );
}
