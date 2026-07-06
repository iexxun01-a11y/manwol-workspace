import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import AiChat from "@/components/ai/AiChat";

export default async function AiPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  return (
    <div className="flex flex-col" style={{ height: "calc(100vh - 4rem)" }}>
      <div className="mb-5 shrink-0">
        <h1 className="text-lg font-semibold text-gray-900">AI 어시스턴트</h1>
        <p className="text-xs text-gray-400 mt-0.5">태스크 관리를 도와드립니다</p>
      </div>
      <div className="flex-1 min-h-0">
        <AiChat />
      </div>
    </div>
  );
}
