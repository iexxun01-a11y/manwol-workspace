import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import ExpenseClient from "./ExpenseClient";

export const dynamic = "force-dynamic";

export default async function ExpensePage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  return <ExpenseClient userName={session.user.name} />;
}
