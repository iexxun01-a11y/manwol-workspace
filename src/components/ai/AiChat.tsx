"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Loader2, Wrench } from "lucide-react";
import { cn } from "@/lib/utils";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  toolsUsed?: string[];
};

const TOOL_LABELS: Record<string, string> = {
  list_tasks: "태스크 목록 조회",
  create_task: "태스크 생성",
  update_task: "태스크 수정",
  list_users: "직원 목록 조회",
};

const SUGGESTIONS = [
  "현재 할 일 태스크 목록 보여줘",
  "진행 중인 태스크가 몇 개야?",
  "우선순위 높은 태스크 알려줘",
];

export default function AiChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [toolsActive, setToolsActive] = useState<string[]>([]);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, toolsActive]);

  async function sendMessage(text: string) {
    if (!text.trim() || loading) return;

    const userMsg: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: text.trim(),
    };

    const history = [...messages, userMsg];
    setMessages(history);
    setInput("");
    setLoading(true);
    setToolsActive([]);

    // AI 응답 자리 확보
    const assistantId = crypto.randomUUID();
    setMessages((prev) => [
      ...prev,
      { id: assistantId, role: "assistant", content: "", toolsUsed: [] },
    ]);

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: history.map((m) => ({ role: m.role, content: m.content })),
        }),
      });

      if (!res.ok) {
        const errText = await res.text();
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId
              ? { ...m, content: `오류: ${errText}` }
              : m
          )
        );
        return;
      }

      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let accText = "";
      const usedTools: string[] = [];

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          try {
            const event = JSON.parse(line.slice(6));
            if (event.type === "text") {
              accText += event.text;
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === assistantId ? { ...m, content: accText } : m
                )
              );
            } else if (event.type === "tool_start") {
              setToolsActive((prev) => [...prev, event.name]);
            } else if (event.type === "tool_end") {
              setToolsActive((prev) => prev.filter((t) => t !== event.name));
              if (!usedTools.includes(event.name)) usedTools.push(event.name);
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === assistantId ? { ...m, toolsUsed: [...usedTools] } : m
                )
              );
            } else if (event.type === "error") {
              accText = `오류가 발생했습니다: ${event.text}`;
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === assistantId ? { ...m, content: accText } : m
                )
              );
            }
          } catch {
            // JSON 파싱 실패 무시
          }
        }
      }
    } finally {
      setLoading(false);
      setToolsActive([]);
      inputRef.current?.focus();
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  }

  return (
    <div className="flex flex-col h-full max-w-2xl mx-auto">
      {/* 메시지 영역 */}
      <div className="flex-1 overflow-y-auto space-y-5 pb-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center py-16">
            <div className="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
              <Bot size={24} className="text-gray-500" />
            </div>
            <h2 className="text-base font-semibold text-gray-900 mb-1">AI 어시스턴트</h2>
            <p className="text-sm text-gray-400 mb-6">
              태스크 조회, 생성, 수정을 도와드립니다.
            </p>
            <div className="flex flex-col gap-2 w-full max-w-sm">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => sendMessage(s)}
                  className="text-sm text-left px-4 py-2.5 rounded-xl border border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-colors text-gray-700"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg) => (
          <div
            key={msg.id}
            className={cn(
              "flex gap-3",
              msg.role === "user" ? "flex-row-reverse" : "flex-row"
            )}
          >
            {/* 아바타 */}
            <div
              className={cn(
                "w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5",
                msg.role === "user" ? "bg-gray-900" : "bg-gray-100"
              )}
            >
              {msg.role === "user" ? (
                <User size={13} className="text-white" />
              ) : (
                <Bot size={13} className="text-gray-600" />
              )}
            </div>

            <div className={cn("max-w-[80%]", msg.role === "user" ? "items-end" : "items-start")}>
              {/* 도구 사용 표시 */}
              {msg.toolsUsed && msg.toolsUsed.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {msg.toolsUsed.map((t) => (
                    <span
                      key={t}
                      className="flex items-center gap-1 text-xs text-gray-400 bg-gray-50 border border-gray-200 rounded-full px-2 py-0.5"
                    >
                      <Wrench size={9} />
                      {TOOL_LABELS[t] ?? t}
                    </span>
                  ))}
                </div>
              )}

              {/* 말풍선 */}
              <div
                className={cn(
                  "rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap",
                  msg.role === "user"
                    ? "bg-gray-900 text-white rounded-tr-sm"
                    : "bg-gray-100 text-gray-900 rounded-tl-sm"
                )}
              >
                {msg.content || (
                  <span className="flex items-center gap-1.5 text-gray-400">
                    <Loader2 size={13} className="animate-spin" />
                    생각 중...
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}

        {/* 도구 실행 중 표시 */}
        {toolsActive.length > 0 && (
          <div className="flex gap-3">
            <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
              <Bot size={13} className="text-gray-600" />
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-400 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2">
              <Loader2 size={11} className="animate-spin" />
              {TOOL_LABELS[toolsActive[0]] ?? toolsActive[0]} 중...
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* 입력창 */}
      <div className="border-t border-gray-200 pt-4">
        <div className="flex items-end gap-2 bg-gray-50 rounded-2xl border border-gray-200 px-4 py-3 focus-within:border-gray-400 transition-colors">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="메시지 입력... (Enter로 전송, Shift+Enter 줄바꿈)"
            rows={1}
            disabled={loading}
            className="flex-1 bg-transparent text-sm text-gray-900 placeholder-gray-400 resize-none outline-none max-h-32 disabled:opacity-50"
            style={{ lineHeight: "1.5" }}
            onInput={(e) => {
              const el = e.currentTarget;
              el.style.height = "auto";
              el.style.height = `${Math.min(el.scrollHeight, 128)}px`;
            }}
          />
          <button
            onClick={() => sendMessage(input)}
            disabled={!input.trim() || loading}
            className="w-8 h-8 bg-gray-900 rounded-xl flex items-center justify-center text-white disabled:opacity-30 hover:bg-gray-700 transition-colors shrink-0"
          >
            <Send size={13} />
          </button>
        </div>
      </div>
    </div>
  );
}
