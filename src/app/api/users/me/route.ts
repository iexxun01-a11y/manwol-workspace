import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";

const Schema = z.object({
  name: z.string().min(1).max(50).optional(),
  position: z.string().max(30).nullable().optional(),
});

export async function PATCH(req: Request) {
  const session = await auth();
  if (!session?.user) return new Response("Unauthorized", { status: 401 });

  const body = await req.json().catch(() => null);
  const parsed = Schema.safeParse(body);
  if (!parsed.success) return new Response("Bad Request", { status: 400 });

  const user = await db.user.update({
    where: { id: session.user.id },
    data: {
      ...(parsed.data.name !== undefined && { name: parsed.data.name }),
      ...(parsed.data.position !== undefined && { position: parsed.data.position }),
    },
    select: { id: true, name: true, position: true },
  });

  return Response.json(user);
}
