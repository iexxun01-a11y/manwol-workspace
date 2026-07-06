"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import Highlight from "@tiptap/extension-highlight";
import { useEffect } from "react";
import { cn } from "@/lib/utils";
import EditorToolbar from "./EditorToolbar";

type Props = {
  content: string;
  onChange?: (html: string) => void;
  editable?: boolean;
  placeholder?: string;
  className?: string;
};

export default function RichEditor({
  content,
  onChange,
  editable = true,
  placeholder = "내용을 입력하세요...",
  className,
}: Props) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({ placeholder }),
      TaskList,
      TaskItem.configure({ nested: true }),
      Highlight,
    ],
    content,
    editable,
    onUpdate({ editor }) {
      onChange?.(editor.getHTML());
    },
    immediatelyRender: false,
  });

  useEffect(() => {
    if (!editor) return;
    const current = editor.getHTML();
    if (current !== content) {
      editor.commands.setContent(content, { emitUpdate: false });
    }
  }, [content, editor]);

  useEffect(() => {
    if (!editor) return;
    editor.setEditable(editable);
  }, [editable, editor]);

  return (
    <div className={cn("border border-gray-200 rounded-lg overflow-hidden", className)}>
      {editable && <EditorToolbar editor={editor} />}
      <div className="p-4">
        <div className="tiptap-wrapper">
          <EditorContent editor={editor} />
        </div>
      </div>
    </div>
  );
}
