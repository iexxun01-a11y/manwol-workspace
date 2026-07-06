"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Role } from "@prisma/client";
import {
  LayoutGrid, Calendar, FileText, Settings, LogOut, Sparkles,
  Briefcase, Link2, Users, ChevronDown, ChevronRight,
  ScrollText, BadgeDollarSign, Receipt, Calculator,
  UserCheck, Clock, Scale, Moon,
} from "lucide-react";

type User = { id: string; name: string; email: string; role: Role; position?: string | null };

const SUB_ITEMS = {
  "인사·노무": [
    { label: "근로계약서", href: "/work/contract" },
    { label: "급여명세서", href: "/work/payslip" },
    { label: "재직증명서", href: "/work/employment-cert" },
  ],
  "세무·재무": [
    { label: "지출결의서", href: "/work/expense" },
    { label: "세무 스케줄", href: "/work/tax-schedule" },
  ],
  "임금계산": [
    { label: "실수령액 계산기", href: "/work/calc/net-salary" },
    { label: "야간·연장·휴일 수당", href: "/work/calc/overtime" },
    { label: "원급여 계산기 (시급)", href: "/work/calc/hourly" },
    { label: "외주·프리랜서 vs 직원", href: "/work/calc/outsource" },
  ],
};

const SUB_ICONS: Record<string, React.ElementType> = {
  "근로계약서": ScrollText,
  "급여명세서": BadgeDollarSign,
  "재직증명서": UserCheck,
  "지출결의서": Receipt,
  "세무 스케줄": Calendar,
  "실수령액 계산기": Calculator,
  "야간·연장·휴일 수당": Moon,
  "원급여 계산기 (시급)": Clock,
  "외주·프리랜서 vs 직원": Scale,
};

export default function Sidebar({ user }: { user: User }) {
  const pathname = usePathname();
  const isAdmin = user.role === Role.OWNER || user.role === Role.MANAGER;

  const [workOpen, setWorkOpen] = useState(pathname.startsWith("/work"));
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {};
    Object.keys(SUB_ITEMS).forEach((g) => {
      init[g] = pathname.startsWith("/work");
    });
    return init;
  });

  function toggleGroup(g: string) {
    setOpenGroups((prev) => ({ ...prev, [g]: !prev[g] }));
  }

  function isActive(href: string) {
    if (href === "/board") return pathname === "/board" || pathname.startsWith("/board/");
    return pathname.startsWith(href);
  }

  const linkStyle = (active: boolean) => ({
    color: active ? "var(--sidebar-text-active)" : "var(--sidebar-text)",
    backgroundColor: active ? "var(--sidebar-active-bg)" : "transparent",
    fontWeight: active ? 500 : 400,
  });

  function NavLink({ href, icon: Icon, label, indent = false }: { href: string; icon: React.ElementType; label: string; indent?: boolean }) {
    const active = isActive(href);
    return (
      <Link
        href={href}
        className={cn("flex items-center gap-2.5 py-1.5 rounded-lg text-sm transition-all duration-150", indent ? "px-2 ml-3" : "px-3")}
        style={linkStyle(active)}
        onMouseEnter={(e) => { if (!active) { (e.currentTarget as HTMLElement).style.backgroundColor = "var(--sidebar-hover-bg)"; (e.currentTarget as HTMLElement).style.color = "var(--sidebar-text-active)"; } }}
        onMouseLeave={(e) => { if (!active) { (e.currentTarget as HTMLElement).style.backgroundColor = "transparent"; (e.currentTarget as HTMLElement).style.color = "var(--sidebar-text)"; } }}
      >
        <Icon size={indent ? 13 : 15} strokeWidth={1.8} />
        <span className={indent ? "text-xs" : "text-sm"}>{label}</span>
      </Link>
    );
  }

  return (
    <aside
      className="w-56 flex flex-col h-full shrink-0 transition-colors duration-200"
      style={{ backgroundColor: "var(--sidebar-bg)", borderRight: "1px solid var(--sidebar-border)" }}
    >
      {/* 헤더 */}
      <div className="px-5 py-5" style={{ borderBottom: "1px solid var(--sidebar-border)" }}>
        <h1 className="text-sm font-semibold tracking-tight" style={{ color: "var(--sidebar-brand)" }}>만월연회</h1>
        <p className="text-xs mt-0.5" style={{ color: "var(--sidebar-brand-sub)" }}>워크스페이스</p>
      </div>

      {/* 네비게이션 */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto space-y-0.5">

        {/* 기본 메뉴 */}
        <NavLink href="/board" icon={LayoutGrid} label="칸반 보드" />
        <NavLink href="/pages" icon={FileText} label="페이지" />
        <NavLink href="/calendar" icon={Calendar} label="캘린더" />
        <NavLink href="/ai" icon={Sparkles} label="AI 어시스턴트" />

        {/* 구분선 */}
        <div className="my-2 mx-1" style={{ height: 1, backgroundColor: "var(--sidebar-border)" }} />

        {/* 업무관리 */}
        <div className="flex items-center rounded-lg overflow-hidden" style={{ backgroundColor: pathname.startsWith("/work") ? "var(--sidebar-active-bg)" : "transparent" }}>
          <Link
            href="/work"
            className="flex items-center gap-2.5 px-3 py-1.5 text-sm flex-1 transition-all duration-150"
            style={{ color: pathname.startsWith("/work") ? "var(--sidebar-text-active)" : "var(--sidebar-text)", fontWeight: pathname.startsWith("/work") ? 500 : 400 }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "var(--sidebar-text-active)"; }}
            onMouseLeave={(e) => { if (!pathname.startsWith("/work")) (e.currentTarget as HTMLElement).style.color = "var(--sidebar-text)"; }}
          >
            <Briefcase size={15} strokeWidth={1.8} />
            <span>업무관리</span>
          </Link>
          <button
            onClick={() => setWorkOpen((v) => !v)}
            className="px-2 py-1.5 transition-colors"
            style={{ color: "var(--sidebar-text)" }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "var(--sidebar-text-active)"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "var(--sidebar-text)"; }}
          >
            {workOpen ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
          </button>
        </div>

        {workOpen && (
          <div className="space-y-0.5">
            {(Object.entries(SUB_ITEMS) as [string, { label: string; href: string }[]][]).map(([group, items]) => (
              <div key={group}>
                {/* 그룹 헤더 */}
                <button
                  onClick={() => toggleGroup(group)}
                  className="w-full flex items-center gap-2 px-3 py-1 rounded-md text-xs transition-all ml-1"
                  style={{ color: "var(--sidebar-text)" }}
                >
                  {openGroups[group] ? <ChevronDown size={10} /> : <ChevronRight size={10} />}
                  <span className="font-medium opacity-60">{group}</span>
                </button>
                {openGroups[group] && (
                  <div className="space-y-0.5 ml-1">
                    {items.map((item) => {
                      const Icon = SUB_ICONS[item.label] ?? FileText;
                      return <NavLink key={item.href} href={item.href} icon={Icon} label={item.label} indent />;
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* 업무도구 */}
        <NavLink href="/tools" icon={Link2} label="업무도구" />

        {/* 직원관리 (관리자만) */}
        {isAdmin && <NavLink href="/admin/users" icon={Users} label="직원관리" />}

        {/* 구분선 */}
        <div className="my-2 mx-1" style={{ height: 1, backgroundColor: "var(--sidebar-border)" }} />

        {/* 설정 */}
        <NavLink href="/settings" icon={Settings} label="설정" />
      </nav>

      {/* 프로필 */}
      <div className="px-4 py-4" style={{ borderTop: "1px solid var(--sidebar-border)" }}>
        <div className="flex items-center gap-2.5 mb-3">
          <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium shrink-0" style={{ backgroundColor: "var(--accent)", color: "var(--accent-text)" }}>
            {user.name.charAt(0)}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-medium truncate" style={{ color: "var(--sidebar-text-active)" }}>{user.name}</p>
            <p className="text-xs truncate" style={{ color: "var(--sidebar-text)" }}>{user.position ?? user.role}</p>
          </div>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="flex items-center gap-2 text-xs transition-colors"
          style={{ color: "var(--sidebar-text)" }}
          onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "var(--sidebar-text-active)")}
          onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "var(--sidebar-text)")}
        >
          <LogOut size={13} />
          로그아웃
        </button>
      </div>
    </aside>
  );
}
