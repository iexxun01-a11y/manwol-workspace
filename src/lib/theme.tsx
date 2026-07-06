"use client";

import { createContext, useContext, useEffect, useState } from "react";

export type Theme = "notion" | "figma";

const STORAGE_KEY = "manwol-theme";

type ThemeContextType = {
  theme: Theme;
  setTheme: (t: Theme) => void;
};

const ThemeContext = createContext<ThemeContextType>({
  theme: "notion",
  setTheme: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("notion");

  // 마운트 시 localStorage에서 읽기
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY) as Theme | null;
    if (saved === "notion" || saved === "figma") {
      setThemeState(saved);
    }
  }, []);

  // 테마 변경 시 localStorage 저장 + data-theme 속성 적용
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, theme);
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  function setTheme(t: Theme) {
    setThemeState(t);
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
