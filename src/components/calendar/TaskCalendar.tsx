"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  format, startOfMonth, endOfMonth, startOfWeek, endOfWeek,
  addDays, addMonths, addWeeks, subMonths, subWeeks,
  isSameMonth, isSameDay, isToday, eachDayOfInterval,
} from "date-fns";
import { ko } from "date-fns/locale";
import { ChevronLeft, ChevronRight, Plus, X, Calendar, User, Flag, Hash, AlignLeft, Check } from "lucide-react";
import { TaskWithRelations, COLUMN_LABELS, TagRecord } from "@/types/task";
import { TaskStatus, Priority } from "@prisma/client";
import { cn } from "@/lib/utils";

type View = "month" | "week" | "day";
type Props = {
  tasks: TaskWithRelations[];
  users: { id: string; name: string }[];
};

const STATUS_DOT: Record<TaskStatus, string> = {
  TODO: "#9ca3af",
  IN_PROGRESS: "#3b82f6",
  DONE: "#22c55e",
};

const PRIORITY_OPTIONS: { value: Priority; label: string; color: string }[] = [
  { value: "LOW", label: "낮음", color: "#22c55e" },
  { value: "MEDIUM", label: "보통", color: "#f59e0b" },
  { value: "HIGH", label: "높음", color: "#ef4444" },
];

const TAG_COLORS = ["#ef4444","#f97316","#eab308","#22c55e","#3b82f6","#8b5cf6","#ec4899","#6b7280"];

const DOW = ["일", "월", "화", "수", "목", "금", "토"];

function getTasksForDay(tasks: TaskWithRelations[], day: Date) {
  return tasks.filter((t) => t.dueDate && isSameDay(new Date(t.dueDate), day));
}

// ── 노션 스타일 태스크 생성 패널 ──
function CreateTaskPanel({
  date,
  users,
  onClose,
  onCreated,
}: {
  date: Date;
  users: { id: string; name: string }[];
  onClose: () => void;
  onCreated: (task: TaskWithRelations) => void;
}) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [assigneeId, setAssigneeId] = useState("");
  const [priority, setPriority] = useState<Priority>("MEDIUM");
  const [dueDate, setDueDate] = useState(format(date, "yyyy-MM-dd"));
  const [tags, setTags] = useState<TagRecord[]>([]);
  const [allTags, setAllTags] = useState<TagRecord[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [tagOpen, setTagOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const titleRef = useRef<HTMLTextAreaElement>(null);
  const tagDropRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    titleRef.current?.focus();
    fetch("/api/tags").then((r) => r.json()).then(setAllTags).catch(() => {});
  }, []);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (!tagDropRef.current?.contains(e.target as Node)) setTagOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const filteredTags = allTags.filter(
    (t) => !tags.find((tt) => tt.id === t.id) && t.name.toLowerCase().includes(tagInput.toLowerCase())
  );
  const canCreateTag = tagInput.trim().length > 0 && !allTags.find((t) => t.name.toLowerCase() === tagInput.trim().toLowerCase());

  async function addTag(tag: TagRecord) {
    if (tags.find((t) => t.id === tag.id)) return;
    setTags((prev) => [...prev, tag]);
    setTagInput("");
    setTagOpen(false);
  }

  async function createTag() {
    const name = tagInput.trim();
    if (!name) return;
    const color = TAG_COLORS[Math.abs([...name].reduce((a, c) => a + c.charCodeAt(0), 0)) % TAG_COLORS.length];
    const res = await fetch("/api/tags", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, color }),
    });
    const tag: TagRecord = await res.json();
    setAllTags((prev) => prev.find((t) => t.id === tag.id) ? prev : [...prev, tag]);
    addTag(tag);
  }

  async function handleSave() {
    if (!title.trim()) { titleRef.current?.focus(); return; }
    setSaving(true);
    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          content,
          dueDate: new Date(dueDate).toISOString(),
          assigneeId: assigneeId || null,
          priority,
          status: "TODO",
        }),
      });
      if (!res.ok) throw new Error();
      const created = await res.json();

      // 태그 연결
      for (const tag of tags) {
        await fetch(`/api/tasks/${created.id}/tags`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ tagId: tag.id }),
        });
      }

      onCreated({ ...created, tags });
      onClose();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px]" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden mx-4">

        {/* 상단 바 */}
        <div className="flex items-center justify-between px-6 pt-5 pb-2 shrink-0">
          <span className="text-xs text-gray-400 font-medium">새 태스크</span>
          <div className="flex items-center gap-2">
            <button
              onClick={handleSave}
              disabled={!title.trim() || saving}
              className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-white rounded-lg disabled:opacity-40 transition-colors"
              style={{ backgroundColor: "var(--accent)" }}
            >
              <Check size={12} />
              {saving ? "저장 중..." : "저장"}
            </button>
            <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100">
              <X size={15} />
            </button>
          </div>
        </div>

        <div className="overflow-y-auto px-6 pb-6">
          {/* 제목 */}
          <textarea
            ref={titleRef}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleSave(); } }}
            placeholder="제목 없음"
            rows={1}
            className="w-full text-3xl font-bold text-gray-900 placeholder-gray-200 outline-none resize-none mb-4 mt-2 leading-tight"
            style={{ fieldSizing: "content" } as React.CSSProperties}
          />

          {/* 속성 목록 */}
          <div className="space-y-1 mb-5">
            {/* 날짜 */}
            <div className="flex items-center gap-3 py-1.5 hover:bg-gray-50 rounded-lg px-2 -mx-2 group">
              <div className="flex items-center gap-2 w-28 shrink-0">
                <Calendar size={14} className="text-gray-400" />
                <span className="text-xs text-gray-400">날짜</span>
              </div>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="text-sm text-gray-700 outline-none bg-transparent cursor-pointer"
              />
            </div>

            {/* 담당자 */}
            <div className="flex items-center gap-3 py-1.5 hover:bg-gray-50 rounded-lg px-2 -mx-2">
              <div className="flex items-center gap-2 w-28 shrink-0">
                <User size={14} className="text-gray-400" />
                <span className="text-xs text-gray-400">담당자</span>
              </div>
              <select
                value={assigneeId}
                onChange={(e) => setAssigneeId(e.target.value)}
                className="text-sm text-gray-700 outline-none bg-transparent cursor-pointer"
              >
                <option value="">없음</option>
                {users.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
              </select>
            </div>

            {/* 우선순위 */}
            <div className="flex items-center gap-3 py-1.5 hover:bg-gray-50 rounded-lg px-2 -mx-2">
              <div className="flex items-center gap-2 w-28 shrink-0">
                <Flag size={14} className="text-gray-400" />
                <span className="text-xs text-gray-400">우선순위</span>
              </div>
              <div className="flex items-center gap-1.5">
                {PRIORITY_OPTIONS.map((p) => (
                  <button
                    key={p.value}
                    onClick={() => setPriority(p.value)}
                    className={cn(
                      "px-2.5 py-0.5 rounded-full text-xs font-medium transition-all",
                      priority === p.value ? "text-white" : "text-gray-400 bg-gray-100 hover:bg-gray-200"
                    )}
                    style={priority === p.value ? { backgroundColor: p.color } : {}}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 태그 */}
            <div className="flex items-start gap-3 py-1.5 hover:bg-gray-50 rounded-lg px-2 -mx-2">
              <div className="flex items-center gap-2 w-28 shrink-0 mt-0.5">
                <Hash size={14} className="text-gray-400" />
                <span className="text-xs text-gray-400">태그</span>
              </div>
              <div className="flex-1">
                <div className="flex flex-wrap gap-1.5 mb-1.5">
                  {tags.map((tag) => (
                    <span
                      key={tag.id}
                      className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium"
                      style={{ backgroundColor: tag.color + "20", color: tag.color }}
                    >
                      {tag.name}
                      <button onClick={() => setTags((prev) => prev.filter((t) => t.id !== tag.id))} className="hover:opacity-70">
                        <X size={9} />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="relative" ref={tagDropRef}>
                  <button
                    onClick={() => setTagOpen(true)}
                    className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <Plus size={11} />
                    태그 추가
                  </button>
                  {tagOpen && (
                    <div className="absolute left-0 top-6 z-20 w-52 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
                      <div className="p-2 border-b border-gray-100">
                        <input
                          autoFocus
                          value={tagInput}
                          onChange={(e) => setTagInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") { filteredTags[0] ? addTag(filteredTags[0]) : canCreateTag && createTag(); }
                            if (e.key === "Escape") setTagOpen(false);
                          }}
                          placeholder="태그 검색 또는 생성..."
                          className="w-full text-xs outline-none text-gray-800 placeholder-gray-400"
                        />
                      </div>
                      <div className="max-h-36 overflow-y-auto py-1">
                        {filteredTags.map((tag) => (
                          <button key={tag.id} onClick={() => addTag(tag)} className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-gray-50 text-left">
                            <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: tag.color }} />
                            <span className="text-xs text-gray-700">{tag.name}</span>
                          </button>
                        ))}
                        {canCreateTag && (
                          <button onClick={createTag} className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-gray-50 text-left">
                            <Plus size={11} className="text-gray-400 shrink-0" />
                            <span className="text-xs text-gray-500"><span className="font-medium text-gray-800">"{tagInput.trim()}"</span> 생성</span>
                          </button>
                        )}
                        {filteredTags.length === 0 && !canCreateTag && (
                          <p className="text-xs text-gray-400 text-center py-3">태그 없음</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* 구분선 */}
          <div className="border-t border-gray-100 mb-4" />

          {/* 상세 내용 */}
          <div className="flex items-start gap-2 mb-2">
            <AlignLeft size={14} className="text-gray-300 mt-1 shrink-0" />
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="내용을 입력하세요..."
              rows={6}
              className="flex-1 text-sm text-gray-700 placeholder-gray-300 outline-none resize-none leading-relaxed"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// ── 날짜 셀 태스크 뱃지 (우측 상단 작은 표시) ──
function TaskBadge({ task, onClick, onToggleDone }: { task: TaskWithRelations; onClick: () => void; onToggleDone: (id: string) => void }) {
  const isDone = task.status === "DONE";
  return (
    <div
      className="flex items-center gap-1 text-xs rounded-md px-1 py-0.5 w-full group/badge"
      style={{
        backgroundColor: STATUS_DOT[task.status] + "15",
        border: `1px solid ${STATUS_DOT[task.status]}30`,
      }}
    >
      {/* 체크박스 */}
      <button
        onClick={(e) => { e.stopPropagation(); onToggleDone(task.id); }}
        className="shrink-0 w-3.5 h-3.5 rounded border flex items-center justify-center transition-all hover:scale-110"
        style={{
          borderColor: isDone ? STATUS_DOT["DONE"] : STATUS_DOT[task.status],
          backgroundColor: isDone ? STATUS_DOT["DONE"] : "transparent",
        }}
        title={isDone ? "완료 취소" : "완료로 변경"}
      >
        {isDone && <svg width="8" height="8" viewBox="0 0 8 8" fill="none"><path d="M1 4l2.5 2.5L7 1.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
      </button>
      {/* 제목 클릭 → 상세 이동 */}
      <button
        onClick={(e) => { e.stopPropagation(); onClick(); }}
        className={cn("truncate font-medium hover:underline", isDone ? "line-through text-gray-400" : "text-gray-700")}
        style={{ fontSize: "11px" }}
      >
        {task.title}
      </button>
      {task.tags[0] && (
        <span
          className="shrink-0 rounded-full px-1"
          style={{ backgroundColor: task.tags[0].color + "25", color: task.tags[0].color, fontSize: "10px" }}
        >
          {task.tags[0].name}
        </span>
      )}
    </div>
  );
}

export default function TaskCalendar({ tasks: initialTasks, users }: Props) {
  const router = useRouter();
  const [tasks, setTasks] = useState<TaskWithRelations[]>(initialTasks);
  const [view, setView] = useState<View>("month");
  const [current, setCurrent] = useState(new Date());
  const [createDate, setCreateDate] = useState<Date | null>(null);

  const goTo = useCallback((task: TaskWithRelations) => router.push(`/board/${task.id}`), [router]);

  const toggleDone = useCallback(async (id: string) => {
    const task = tasks.find((t) => t.id === id);
    if (!task) return;
    const newStatus = task.status === "DONE" ? "TODO" : "DONE";
    setTasks((prev) => prev.map((t) => t.id === id ? { ...t, status: newStatus } : t));
    await fetch(`/api/tasks/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
  }, [tasks]);

  function navPrev() {
    if (view === "month") setCurrent((d) => subMonths(d, 1));
    else if (view === "week") setCurrent((d) => subWeeks(d, 1));
    else setCurrent((d) => addDays(d, -1));
  }
  function navNext() {
    if (view === "month") setCurrent((d) => addMonths(d, 1));
    else if (view === "week") setCurrent((d) => addWeeks(d, 1));
    else setCurrent((d) => addDays(d, 1));
  }

  function headerTitle() {
    if (view === "month") return format(current, "yyyy년 M월", { locale: ko });
    if (view === "week") {
      const s = startOfWeek(current, { weekStartsOn: 0 });
      const e = endOfWeek(current, { weekStartsOn: 0 });
      return `${format(s, "M월 d일", { locale: ko })} – ${format(e, "M월 d일", { locale: ko })}`;
    }
    return format(current, "yyyy년 M월 d일 (eee)", { locale: ko });
  }

  // ── 날짜 셀 ──
  function DayCell({ day, inMonth = true, minH = "min-h-[90px]" }: { day: Date; inMonth?: boolean; minH?: string }) {
    const dayTasks = getTasksForDay(tasks, day);
    const today = isToday(day);
    const [hovered, setHovered] = useState(false);

    return (
      <div
        className={cn("bg-white p-1.5 relative flex flex-col", minH, !inMonth && "opacity-40")}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {/* 날짜 숫자 행 */}
        <div className="flex items-center justify-between mb-0.5">
          <span
            className={cn("text-xs w-6 h-6 flex items-center justify-center rounded-full font-medium shrink-0", today ? "text-white" : "text-gray-600")}
            style={today ? { backgroundColor: "var(--accent)" } : {}}
          >
            {format(day, "d")}
          </span>
          {/* + 버튼 (hover) */}
          <button
            onClick={(e) => { e.stopPropagation(); setCreateDate(day); }}
            className={cn("w-5 h-5 flex items-center justify-center rounded-md text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-all", hovered ? "opacity-100" : "opacity-0")}
          >
            <Plus size={12} />
          </button>
        </div>

        {/* 태스크 뱃지들 — 날짜 아래 세로 나열 */}
        <div className="flex flex-col gap-0.5">
          {dayTasks.slice(0, 3).map((t) => (
            <TaskBadge key={t.id} task={t} onClick={() => goTo(t)} onToggleDone={toggleDone} />
          ))}
          {dayTasks.length > 3 && (
            <span className="text-[10px] text-gray-400 pl-1">+{dayTasks.length - 3}개 더</span>
          )}
        </div>
      </div>
    );
  }

  // ── 월간 뷰 ──
  function MonthView() {
    const days = eachDayOfInterval({
      start: startOfWeek(startOfMonth(current), { weekStartsOn: 0 }),
      end: endOfWeek(endOfMonth(current), { weekStartsOn: 0 }),
    });
    return (
      <div className="flex-1 flex flex-col min-h-0">
        <div className="grid grid-cols-7 mb-1">
          {DOW.map((d) => (
            <div key={d} className="text-center text-xs font-medium text-gray-400 py-2">{d}</div>
          ))}
        </div>
        <div className="flex-1 grid grid-cols-7 gap-px bg-gray-100 rounded-xl overflow-hidden border border-gray-100">
          {days.map((day) => (
            <DayCell key={day.toISOString()} day={day} inMonth={isSameMonth(day, current)} />
          ))}
        </div>
      </div>
    );
  }

  // ── 주간 뷰 ──
  function WeekView() {
    const days = Array.from({ length: 7 }, (_, i) => addDays(startOfWeek(current, { weekStartsOn: 0 }), i));
    return (
      <div className="flex-1 grid grid-cols-7 gap-px bg-gray-100 rounded-xl overflow-hidden border border-gray-100">
        {days.map((day) => {
          const today = isToday(day);
          return (
            <div key={day.toISOString()} className="bg-white flex flex-col min-h-0">
              <div className="text-center py-3 border-b border-gray-100">
                <p className="text-xs text-gray-400">{DOW[day.getDay()]}</p>
                <span
                  className={cn("text-lg font-semibold mt-0.5 w-9 h-9 flex items-center justify-center rounded-full mx-auto", today ? "text-white" : "text-gray-800")}
                  style={today ? { backgroundColor: "var(--accent)" } : {}}
                >
                  {format(day, "d")}
                </span>
              </div>
              <DayCell day={day} minH="flex-1" />
            </div>
          );
        })}
      </div>
    );
  }

  // ── 일간 뷰 ──
  function DayView() {
    const dayTasks = getTasksForDay(tasks, current);
    const today = isToday(current);
    return (
      <div className="flex-1 rounded-xl border border-gray-100 bg-white p-6 overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <span
              className={cn("text-3xl font-bold w-14 h-14 flex items-center justify-center rounded-2xl", today ? "text-white" : "text-gray-800")}
              style={today ? { backgroundColor: "var(--accent)" } : { backgroundColor: "#f3f4f6" }}
            >
              {format(current, "d")}
            </span>
            <div>
              <p className="text-sm font-medium text-gray-800">{format(current, "EEEE", { locale: ko })}</p>
              <p className="text-xs text-gray-400">마감 태스크 {dayTasks.length}개</p>
            </div>
          </div>
          <button
            onClick={() => setCreateDate(current)}
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg font-medium text-white transition-colors"
            style={{ backgroundColor: "var(--accent)" }}
          >
            <Plus size={13} />
            태스크 추가
          </button>
        </div>
        {dayTasks.length === 0 ? (
          <div className="text-center py-12 text-gray-300">
            <p className="text-sm">이 날 마감 태스크가 없습니다.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {dayTasks.map((t) => (
              <button
                key={t.id}
                onClick={() => goTo(t)}
                className="w-full text-left p-3 rounded-xl border transition-all hover:shadow-sm"
                style={{ borderColor: STATUS_DOT[t.status] + "40", backgroundColor: STATUS_DOT[t.status] + "08" }}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: STATUS_DOT[t.status] }} />
                  <span className="text-sm font-medium text-gray-900">{t.title}</span>
                  {t.tags.map((tag) => (
                    <span key={tag.id} className="text-xs px-1.5 py-0.5 rounded-full" style={{ backgroundColor: tag.color + "20", color: tag.color }}>{tag.name}</span>
                  ))}
                </div>
                <div className="flex items-center gap-3 pl-4 text-xs text-gray-400">
                  <span>{COLUMN_LABELS[t.status]}</span>
                  {t.assignee && <span>담당: {t.assignee.name}</span>}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col h-full gap-4">
        {/* 헤더 */}
        <div className="flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <button onClick={() => setCurrent(new Date())} className="px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors" style={{ color: "var(--accent)" }}>오늘</button>
            <div className="flex items-center gap-1">
              <button onClick={navPrev} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors text-gray-500"><ChevronLeft size={15} /></button>
              <button onClick={navNext} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors text-gray-500"><ChevronRight size={15} /></button>
            </div>
            <h2 className="text-sm font-semibold text-gray-900">{headerTitle()}</h2>
          </div>
          <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
            {(["month", "week", "day"] as View[]).map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={cn("px-3 py-1 text-xs font-medium rounded-md transition-all", view === v ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700")}
              >
                {{ month: "월", week: "주", day: "일" }[v]}
              </button>
            ))}
          </div>
        </div>

        {view === "month" && <MonthView />}
        {view === "week" && <WeekView />}
        {view === "day" && <DayView />}
      </div>

      {/* 노션 스타일 태스크 생성 패널 */}
      {createDate && (
        <CreateTaskPanel
          date={createDate}
          users={users}
          onClose={() => setCreateDate(null)}
          onCreated={(task) => {
            setTasks((prev) => [...prev, task]);
            setCreateDate(null);
          }}
        />
      )}
    </>
  );
}
