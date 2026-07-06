import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Sidebar from "@/components/layout/Sidebar";
import { ThemeProvider } from "@/lib/theme";

export default async function WorkspaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  return (
    <ThemeProvider>
      <div
        className="flex h-screen overflow-hidden"
        style={{ backgroundColor: "var(--page-bg)" }}
      >
        <div className="no-print"><Sidebar user={session.user} /></div>
        {/* 각 페이지가 자체 스크롤을 처리 */}
        <main className="flex-1 overflow-hidden flex flex-col">
          <div className="flex-1 overflow-y-auto p-8">
            {children}
          </div>
        </main>
      </div>
    </ThemeProvider>
  );
}
