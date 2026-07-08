import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import UsersClient from "./UsersClient";

export const dynamic = "force-dynamic";

export default async function UsersPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (!["OWNER", "MANAGER"].includes(session.user.role)) redirect("/");

  const users = await db.user.findMany({
    orderBy: [{ status: "asc" }, { createdAt: "asc" }],
    select: { id: true, email: true, name: true, role: true, position: true, status: true, createdAt: true, firstLoginAt: true },
  });

  return <UsersClient initialUsers={users as never} currentUserId={session.user.id} />;
}
