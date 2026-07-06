"use client";

import { useTheme, Theme } from "@/lib/theme";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

const THEMES: {
  id: Theme;
  label: string;
  desc: string;
  preview: {
    sidebar: string;
    accent: string;
    sidebarText: string;
    activeText: string;
  };
}[] = [
  {
    id: "notion",
    label: "Notion",
    desc: "밝고 미니멀한 스타일",
    preview: {
      sidebar: "#ffffff",
      accent: "#111827",
      sidebarText: "#9ca3af",
      activeText: "#111827",
    },
  },
  {
    id: "figma",
    label: "Figma",
    desc: "다크 사이드바 + 보라 포인트",
    preview: {
      sidebar: "#1e1e1e",
      accent: "#7c3aed",
      sidebarText: "#a1a1aa",
      activeText: "#ffffff",
    },
  },
];

export default function ThemeSettings() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="grid grid-cols-2 gap-4">
      {THEMES.map((t) => {
        const isActive = theme === t.id;
        return (
          <button
            key={t.id}
            onClick={() => setTheme(t.id)}
            className={cn(
              "relative text-left rounded-2xl border-2 overflow-hidden transition-all",
              isActive
                ? "border-[var(--accent)] shadow-md"
                : "border-gray-200 hover:border-gray-300"
            )}
          >
            {/* 미리보기 */}
            <div className="flex h-28" style={{ backgroundColor: "#f5f5f5" }}>
              {/* 미니 사이드바 */}
              <div
                className="w-14 flex flex-col gap-2 p-2 pt-3 shrink-0"
                style={{ backgroundColor: t.preview.sidebar, borderRight: "1px solid #e5e7eb22" }}
              >
                {[...Array(4)].map((_, i) => (
                  <div
                    key={i}
                    className="h-2 rounded-full"
                    style={{
                      width: i === 0 ? "80%" : i === 2 ? "60%" : "70%",
                      backgroundColor:
                        i === 0 ? t.preview.accent : t.preview.sidebarText + "50",
                    }}
                  />
                ))}
              </div>
              {/* 미니 콘텐츠 */}
              <div className="flex-1 p-3 flex flex-col gap-2">
                <div className="h-2 w-1/2 rounded-full bg-gray-300" />
                <div className="flex gap-1.5 mt-1">
                  {[...Array(3)].map((_, i) => (
                    <div
                      key={i}
                      className="flex-1 rounded-lg p-1.5 flex flex-col gap-1"
                      style={{ backgroundColor: "#ffffff", border: "1px solid #e5e7eb" }}
                    >
                      <div className="h-1.5 rounded-full bg-gray-200 w-3/4" />
                      <div className="h-1.5 rounded-full bg-gray-100 w-1/2" />
                    </div>
                  ))}
                </div>
                <div
                  className="h-6 rounded-lg mt-auto flex items-center justify-center"
                  style={{ backgroundColor: t.preview.accent }}
                >
                  <div className="h-1.5 w-8 rounded-full bg-white opacity-80" />
                </div>
              </div>
            </div>

            {/* 테마 정보 */}
            <div className="px-4 py-3 bg-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-900">{t.label}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{t.desc}</p>
                </div>
                {isActive && (
                  <div
                    className="w-5 h-5 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: "var(--accent)" }}
                  >
                    <Check size={11} className="text-white" />
                  </div>
                )}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
