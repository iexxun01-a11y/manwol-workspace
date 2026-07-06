"use client";

import { Editor } from "@tiptap/react";
import {
  Bold, Italic, Strikethrough, Highlighter,
  List, ListOrdered, ListChecks,
  Heading2, Heading3,
  Code, Quote, Minus,
} from "lucide-react";
import { cn } from "@/lib/utils";

type Props = { editor: Editor | null };

type BtnProps = {
  onClick: () => void;
  active?: boolean;
  title: string;
  children: React.ReactNode;
};

function ToolBtn({ onClick, active, title, children }: BtnProps) {
  return (
    <button
      type="button"
      onMouseDown={(e) => { e.preventDefault(); onClick(); }}
      title={title}
      className={cn(
        "p-1.5 rounded transition-colors",
        active
          ? "bg-gray-200 text-gray-900"
          : "text-gray-500 hover:bg-gray-100 hover:text-gray-800"
      )}
    >
      {children}
    </button>
  );
}

export default function EditorToolbar({ editor }: Props) {
  if (!editor) return null;

  return (
    <div className="flex flex-wrap items-center gap-0.5 p-2 border-b border-gray-200 bg-gray-50 rounded-t-lg">
      <ToolBtn
        onClick={() => editor.chain().focus().toggleBold().run()}
        active={editor.isActive("bold")}
        title="굵게 (Ctrl+B)"
      >
        <Bold size={14} />
      </ToolBtn>
      <ToolBtn
        onClick={() => editor.chain().focus().toggleItalic().run()}
        active={editor.isActive("italic")}
        title="기울임 (Ctrl+I)"
      >
        <Italic size={14} />
      </ToolBtn>
      <ToolBtn
        onClick={() => editor.chain().focus().toggleStrike().run()}
        active={editor.isActive("strike")}
        title="취소선"
      >
        <Strikethrough size={14} />
      </ToolBtn>
      <ToolBtn
        onClick={() => editor.chain().focus().toggleHighlight().run()}
        active={editor.isActive("highlight")}
        title="형광펜"
      >
        <Highlighter size={14} />
      </ToolBtn>

      <div className="w-px h-4 bg-gray-300 mx-1" />

      <ToolBtn
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        active={editor.isActive("heading", { level: 2 })}
        title="제목 2"
      >
        <Heading2 size={14} />
      </ToolBtn>
      <ToolBtn
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        active={editor.isActive("heading", { level: 3 })}
        title="제목 3"
      >
        <Heading3 size={14} />
      </ToolBtn>

      <div className="w-px h-4 bg-gray-300 mx-1" />

      <ToolBtn
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        active={editor.isActive("bulletList")}
        title="글머리 목록"
      >
        <List size={14} />
      </ToolBtn>
      <ToolBtn
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        active={editor.isActive("orderedList")}
        title="번호 목록"
      >
        <ListOrdered size={14} />
      </ToolBtn>
      <ToolBtn
        onClick={() => editor.chain().focus().toggleTaskList().run()}
        active={editor.isActive("taskList")}
        title="체크리스트"
      >
        <ListChecks size={14} />
      </ToolBtn>

      <div className="w-px h-4 bg-gray-300 mx-1" />

      <ToolBtn
        onClick={() => editor.chain().focus().toggleCode().run()}
        active={editor.isActive("code")}
        title="코드"
      >
        <Code size={14} />
      </ToolBtn>
      <ToolBtn
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        active={editor.isActive("blockquote")}
        title="인용"
      >
        <Quote size={14} />
      </ToolBtn>
      <ToolBtn
        onClick={() => editor.chain().focus().setHorizontalRule().run()}
        title="구분선"
      >
        <Minus size={14} />
      </ToolBtn>
    </div>
  );
}
