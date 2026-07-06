"use client";

import { useState } from "react";
import { useTheme, Theme } from "@/lib/theme";
import { Check, User, Palette } from "lucide-react";
import { cn } from "@/lib/utils";
import { Role } from "@prisma/client";

type SessionUser = { id: string; name: string; email: string; role: Role; position?: string | null };

const THEMES: { id: Theme; label: string; desc: string; sidebar: string; accent: string }[] = [
  { id: "notion", label: "라이트톤", desc: "밝고 미니멀한 스타일", sidebar: "#ffffff", accent: "#111827" },
  { id: "figma", label: "다크톤", desc: "다크 사이드바 + 보라 포인트", sidebar: "#1e1e1e", accent: "#7c3aed" },
];

const MENU = [
  { id: "profile", label: "프로필", icon: User },
  { id: "theme", label: "테마", icon: Palette },
];

export default function SettingsClient({ user }: { user: SessionUser }) {
  const [tab, setTab] = useState("profile");
  const { theme, setTheme } = useTheme();

  // 프로필 수정 상태
  const [name, setName] = useState(user.name);
  const [position, setPosition] = useState(user.position ?? "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handleProfileSave(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    try {
      await fetch("/api/users/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), position: position.trim() || null }),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex gap-8 max-w-3xl">
      {/* 좌측 메뉴 */}
      <div className="w-40 shrink-0">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-3">계정</p>
        <nav className="space-y-0.5">
          {MENU.map((item) => {
            const Icon = item.icon;
            const active = tab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setTab(item.id)}
                className={cn(
                  "w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-left transition-colors",
                  active ? "bg-gray-100 text-gray-900 font-medium" : "text-gray-500 hover:bg-gray-50 hover:text-gray-800"
                )}
              >
                <Icon size={14} />
                {item.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* 우측 컨텐츠 */}
      <div className="flex-1 min-w-0">
        {tab === "profile" && (
          <div>
            <h2 className="text-base font-semibold text-gray-900 mb-1">프로필</h2>
            <p className="text-xs text-gray-400 mb-6">이름과 직급을 변경할 수 있습니다</p>

            {/* 아바타 */}
            <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-100">
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center text-xl font-semibold text-white shrink-0"
                style={{ backgroundColor: "var(--accent)" }}
              >
                {name.charAt(0)}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">{name}</p>
                <p className="text-xs text-gray-400">{user.email}</p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {user.role === "OWNER" ? "대표" : user.role === "MANAGER" ? "관리자" : "직원"}
                </p>
              </div>
            </div>

            <form onSubmit={handleProfileSave} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">이름</label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                  placeholder="이름 입력"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">직급</label>
                <input
                  value={position}
                  onChange={(e) => setPosition(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                  placeholder="예: 팀장, 실장, 대리"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">이메일</label>
                <input
                  value={user.email}
                  disabled
                  className="w-full px-3 py-2 text-sm border border-gray-100 rounded-lg bg-gray-50 text-gray-400 cursor-not-allowed"
                />
              </div>
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={saving || !name.trim()}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white rounded-lg disabled:opacity-40 transition-colors"
                  style={{ backgroundColor: "var(--accent)" }}
                >
                  {saved ? <><Check size={14} /> 저장됨</> : saving ? "저장 중..." : "변경 저장"}
                </button>
              </div>
            </form>
          </div>
        )}

        {tab === "theme" && (
          <div>
            <h2 className="text-base font-semibold text-gray-900 mb-1">테마</h2>
            <p className="text-xs text-gray-400 mb-6">워크스페이스 테마를 선택합니다. 브라우저에 저장됩니다.</p>
            <div className="grid grid-cols-2 gap-4">
              {THEMES.map((t) => {
                const isActive = theme === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => setTheme(t.id)}
                    className={cn(
                      "relative text-left rounded-2xl border-2 overflow-hidden transition-all",
                      isActive ? "shadow-md" : "border-gray-200 hover:border-gray-300"
                    )}
                    style={isActive ? { borderColor: "var(--accent)" } : {}}
                  >
                    {/* 미리보기 */}
                    <div className="flex h-24" style={{ backgroundColor: "#f5f5f5" }}>
                      <div className="w-12 flex flex-col gap-2 p-2 pt-3 shrink-0" style={{ backgroundColor: t.sidebar, borderRight: "1px solid #e5e7eb22" }}>
                        {[...Array(4)].map((_, i) => (
                          <div key={i} className="h-1.5 rounded-full" style={{ width: i === 0 ? "80%" : "60%", backgroundColor: i === 0 ? t.accent : "#6b728040" }} />
                        ))}
                      </div>
                      <div className="flex-1 p-2.5 flex flex-col gap-1.5">
                        <div className="h-1.5 w-1/2 rounded-full bg-gray-300" />
                        <div className="flex gap-1 mt-0.5">
                          {[...Array(3)].map((_, i) => (
                            <div key={i} className="flex-1 rounded-lg p-1.5" style={{ backgroundColor: "#ffffff", border: "1px solid #e5e7eb" }}>
                              <div className="h-1.5 rounded-full bg-gray-200 w-3/4 mb-1" />
                              <div className="h-1.5 rounded-full bg-gray-100 w-1/2" />
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                    {/* 정보 */}
                    <div className="px-3 py-2.5 bg-white flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{t.label}</p>
                        <p className="text-xs text-gray-400">{t.desc}</p>
                      </div>
                      {isActive && (
                        <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: "var(--accent)" }}>
                          <Check size={11} className="text-white" />
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
