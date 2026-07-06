"use client";

import { useState, useEffect, useRef } from "react";
import { TagRecord } from "@/types/task";
import { Plus, X, Hash } from "lucide-react";

type Props = {
  taskId: string;
  initialTags: TagRecord[];
};

export default function TagSelector({ taskId, initialTags }: Props) {
  const [tags, setTags] = useState<TagRecord[]>(initialTags);
  const [allTags, setAllTags] = useState<TagRecord[]>([]);
  const [input, setInput] = useState("");
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/tags")
      .then((r) => r.json())
      .then(setAllTags);
  }, []);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (!dropdownRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const filtered = allTags.filter(
    (t) =>
      !tags.find((tt) => tt.id === t.id) &&
      t.name.toLowerCase().includes(input.toLowerCase())
  );

  const canCreate =
    input.trim().length > 0 &&
    !allTags.find((t) => t.name.toLowerCase() === input.trim().toLowerCase());

  async function addTag(tag: TagRecord) {
    if (tags.find((t) => t.id === tag.id)) { setInput(""); return; }
    await fetch(`/api/tasks/${taskId}/tags`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tagId: tag.id }),
    });
    setTags((prev) => prev.find((t) => t.id === tag.id) ? prev : [...prev, tag]);
    setInput("");
  }

  async function createAndAdd() {
    const name = input.trim();
    if (!name) return;
    const res = await fetch("/api/tags", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    const tag: TagRecord = await res.json();
    setAllTags((prev) =>
      prev.find((t) => t.id === tag.id) ? prev : [...prev, tag]
    );
    await addTag(tag);
  }

  async function removeTag(tagId: string) {
    await fetch(`/api/tasks/${taskId}/tags`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tagId }),
    });
    setTags((prev) => prev.filter((t) => t.id !== tagId));
  }

  return (
    <div>
      <p className="text-xs font-medium text-gray-400 mb-2">태그</p>

      {/* 현재 태그 목록 */}
      <div className="flex flex-wrap gap-1.5 mb-2">
        {tags.map((tag) => (
          <span
            key={tag.id}
            className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium"
            style={{ backgroundColor: tag.color + "20", color: tag.color }}
          >
            {tag.name}
            <button
              onClick={() => removeTag(tag.id)}
              className="hover:opacity-70 transition-opacity"
            >
              <X size={10} />
            </button>
          </span>
        ))}
      </div>

      {/* 태그 추가 드롭다운 */}
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => { setOpen(true); setTimeout(() => inputRef.current?.focus(), 50); }}
          className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-700 transition-colors px-2 py-1 rounded-lg border border-dashed border-gray-200 hover:border-gray-400"
        >
          <Plus size={11} />
          태그 추가
        </button>

        {open && (
          <div className="absolute left-0 top-8 z-20 w-52 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
            <div className="p-2 border-b border-gray-100">
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    if (filtered[0]) addTag(filtered[0]);
                    else if (canCreate) createAndAdd();
                  }
                  if (e.key === "Escape") setOpen(false);
                }}
                placeholder="태그 검색 또는 생성..."
                className="w-full text-xs outline-none text-gray-800 placeholder-gray-400"
              />
            </div>
            <div className="max-h-40 overflow-y-auto py-1">
              {filtered.map((tag) => (
                <button
                  key={tag.id}
                  onClick={() => addTag(tag)}
                  className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-gray-50 text-left"
                >
                  <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: tag.color }}
                  />
                  <span className="text-xs text-gray-700">{tag.name}</span>
                </button>
              ))}
              {canCreate && (
                <button
                  onClick={createAndAdd}
                  className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-gray-50 text-left"
                >
                  <Hash size={12} className="text-gray-400 shrink-0" />
                  <span className="text-xs text-gray-500">
                    <span className="font-medium text-gray-800">"{input.trim()}"</span> 생성
                  </span>
                </button>
              )}
              {filtered.length === 0 && !canCreate && (
                <p className="text-xs text-gray-400 text-center py-3">태그 없음</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
