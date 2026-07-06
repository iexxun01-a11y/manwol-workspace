import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

// 루트 경로는 칸반 보드로 리다이렉트
export default async function HomePage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  redirect("/board");
}
