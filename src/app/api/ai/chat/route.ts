import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import Anthropic from "@anthropic-ai/sdk";
import { getTasks, createTask, updateTask } from "@/lib/task-service";
import { CreateTaskSchema, UpdateTaskSchema } from "@/lib/task-service";
import { z } from "zod";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const MessageSchema = z.object({
  messages: z.array(
    z.object({
      role: z.enum(["user", "assistant"]),
      content: z.string(),
    })
  ),
});

// AI가 사용할 수 있는 도구 목록
const tools: Anthropic.Tool[] = [
  {
    name: "list_tasks",
    description: "현재 모든 태스크 목록을 조회합니다. 태스크의 상태, 우선순위, 담당자, 마감일을 확인할 수 있습니다.",
    input_schema: {
      type: "object" as const,
      properties: {},
      required: [],
    },
  },
  {
    name: "create_task",
    description: "새 태스크를 생성합니다.",
    input_schema: {
      type: "object" as const,
      properties: {
        title: { type: "string", description: "태스크 제목 (필수)" },
        content: { type: "string", description: "태스크 상세 내용" },
        status: {
          type: "string",
          enum: ["TODO", "IN_PROGRESS", "DONE"],
          description: "태스크 상태 (기본값: TODO)",
        },
        priority: {
          type: "string",
          enum: ["LOW", "MEDIUM", "HIGH"],
          description: "우선순위 (기본값: MEDIUM)",
        },
        dueDate: {
          type: "string",
          description: "마감일 (ISO 8601 형식, 예: 2026-07-15T00:00:00.000Z)",
        },
        assigneeId: {
          type: "string",
          description: "담당자 사용자 ID",
        },
      },
      required: ["title"],
    },
  },
  {
    name: "update_task",
    description: "기존 태스크를 수정합니다.",
    input_schema: {
      type: "object" as const,
      properties: {
        taskId: { type: "string", description: "수정할 태스크 ID (필수)" },
        title: { type: "string", description: "새 제목" },
        content: { type: "string", description: "새 내용" },
        status: {
          type: "string",
          enum: ["TODO", "IN_PROGRESS", "DONE"],
          description: "새 상태",
        },
        priority: {
          type: "string",
          enum: ["LOW", "MEDIUM", "HIGH"],
          description: "새 우선순위",
        },
        dueDate: { type: "string", description: "새 마감일 (ISO 8601)" },
        assigneeId: { type: "string", description: "새 담당자 ID" },
      },
      required: ["taskId"],
    },
  },
  {
    name: "list_users",
    description: "현재 활성 직원 목록을 조회합니다. 태스크 담당자 지정 시 사용하세요.",
    input_schema: {
      type: "object" as const,
      properties: {},
      required: [],
    },
  },
];

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) return new Response("Unauthorized", { status: 401 });

  const body = await req.json().catch(() => null);
  const parsed = MessageSchema.safeParse(body);
  if (!parsed.success) return new Response("Bad Request", { status: 400 });

  const actor = session.user;

  // 도구 실행 핸들러
  async function executeTool(name: string, input: Record<string, unknown>): Promise<string> {
    try {
      if (name === "list_tasks") {
        const tasks = await getTasks(actor);
        return JSON.stringify(
          tasks.map((t) => ({
            id: t.id,
            title: t.title,
            status: t.status,
            priority: t.priority,
            dueDate: t.dueDate,
            assignee: t.assignee?.name ?? null,
            author: t.author.name,
          }))
        );
      }

      if (name === "create_task") {
        const parsed = CreateTaskSchema.safeParse(input);
        if (!parsed.success) return `오류: ${parsed.error.message}`;
        const task = await createTask(actor, parsed.data);
        return JSON.stringify({ id: task.id, title: task.title, status: task.status });
      }

      if (name === "update_task") {
        const { taskId, ...rest } = input as { taskId: string } & Record<string, unknown>;
        if (!taskId) return "오류: taskId가 필요합니다.";
        const parsed = UpdateTaskSchema.safeParse(rest);
        if (!parsed.success) return `오류: ${parsed.error.message}`;
        const task = await updateTask(actor, taskId, parsed.data);
        return JSON.stringify({ id: task.id, title: task.title, status: task.status });
      }

      if (name === "list_users") {
        const users = await db.user.findMany({
          where: { status: "ACTIVE" },
          select: { id: true, name: true, position: true, role: true },
        });
        return JSON.stringify(users);
      }

      return "알 수 없는 도구입니다.";
    } catch (err) {
      return `오류: ${err instanceof Error ? err.message : String(err)}`;
    }
  }

  // 스트리밍 응답
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const send = (data: object) =>
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));

      try {
        let messages: Anthropic.MessageParam[] = parsed.data.messages;

        // tool_use 루프 (최대 5회)
        for (let i = 0; i < 5; i++) {
          const response = await client.messages.create({
            model: "claude-haiku-4-5-20251001",
            max_tokens: 4096,
            system: `당신은 만월연회 내부 워크스페이스 AI 어시스턴트입니다.
직원들의 태스크 관리를 도와주세요.
현재 로그인한 사용자: ${actor.name} (${actor.role})
오늘 날짜: ${new Date().toLocaleDateString("ko-KR")}

규칙:
- 항상 한국어로 답변하세요.
- 태스크 생성/수정 전 반드시 사용자에게 확인하세요.
- 권한 범위 안에서만 작업하세요.
- 간결하고 명확하게 답변하세요.`,
            messages,
            tools,
          });

          if (response.stop_reason === "end_turn") {
            for (const block of response.content) {
              if (block.type === "text") {
                send({ type: "text", text: block.text });
              }
            }
            break;
          }

          if (response.stop_reason === "tool_use") {
            const toolUseBlocks = response.content.filter((b) => b.type === "tool_use");
            const textBlocks = response.content.filter((b) => b.type === "text");

            for (const block of textBlocks) {
              if (block.type === "text" && block.text) {
                send({ type: "text", text: block.text });
              }
            }

            // 도구 실행
            const toolResults: Anthropic.ToolResultBlockParam[] = [];
            for (const block of toolUseBlocks) {
              if (block.type !== "tool_use") continue;
              send({ type: "tool_start", name: block.name });
              const result = await executeTool(
                block.name,
                block.input as Record<string, unknown>
              );
              send({ type: "tool_end", name: block.name });
              toolResults.push({
                type: "tool_result",
                tool_use_id: block.id,
                content: result,
              });
            }

            messages = [
              ...messages,
              { role: "assistant", content: response.content },
              { role: "user", content: toolResults },
            ];
            continue;
          }

          break;
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : "알 수 없는 오류";
        send({ type: "error", text: msg });
      } finally {
        send({ type: "done" });
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
