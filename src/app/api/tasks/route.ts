import { auth } from "@/lib/auth";
import { createTask, getTasks, CreateTaskSchema } from "@/lib/task-service";
import { handlePermissionError } from "@/lib/permissions";
import { Role } from "@prisma/client";

export async function GET() {
  const session = await auth();
  if (!session?.user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const tasks = await getTasks({ id: session.user.id, role: session.user.role as Role });
    return Response.json(tasks);
  } catch (err) {
    return handlePermissionError(err) ?? Response.json({ error: "서버 오류" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = CreateTaskSchema.safeParse(body);
  if (!parsed.success) return Response.json({ error: parsed.error.flatten() }, { status: 400 });

  try {
    const task = await createTask(
      { id: session.user.id, role: session.user.role as Role },
      parsed.data
    );
    return Response.json(task, { status: 201 });
  } catch (err) {
    return handlePermissionError(err) ?? Response.json({ error: "서버 오류" }, { status: 500 });
  }
}
