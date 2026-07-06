import { auth } from "@/lib/auth";
import { getTask, updateTask, deleteTask, UpdateTaskSchema } from "@/lib/task-service";
import { handlePermissionError } from "@/lib/permissions";
import { Role } from "@prisma/client";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  try {
    const task = await getTask({ id: session.user.id, role: session.user.role as Role }, id);
    if (!task) return Response.json({ error: "Not found" }, { status: 404 });
    return Response.json(task);
  } catch (err) {
    return handlePermissionError(err) ?? Response.json({ error: "서버 오류" }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();
  const parsed = UpdateTaskSchema.safeParse(body);
  if (!parsed.success) return Response.json({ error: parsed.error.flatten() }, { status: 400 });

  try {
    const task = await updateTask(
      { id: session.user.id, role: session.user.role as Role },
      id,
      parsed.data
    );
    return Response.json(task);
  } catch (err) {
    return handlePermissionError(err) ?? Response.json({ error: "서버 오류" }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  try {
    await deleteTask({ id: session.user.id, role: session.user.role as Role }, id);
    return new Response(null, { status: 204 });
  } catch (err) {
    return handlePermissionError(err) ?? Response.json({ error: "서버 오류" }, { status: 500 });
  }
}
