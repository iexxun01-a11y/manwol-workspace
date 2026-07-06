"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2, X, Check, Star, ExternalLink, ChevronDown, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

type Link = { id: string; name: string; url: string; desc: string; emoji: string };
type Category = { id: string; name: string; links: Link[] };

const DEFAULT_CATEGORIES: Category[] = [
  { id: "ai", name: "AI 업무 도구", links: [
    { id: "manus", name: "Manus", url: "https://manus.im/app", desc: "AI 자율 에이전트", emoji: "🤖" },
    { id: "perp", name: "Perplexity", url: "https://www.perplexity.ai/", desc: "시장조사·리서치", emoji: "🔍" },
    { id: "genspark", name: "Genspark", url: "https://www.genspark.ai/", desc: "AI 검색 에이전트", emoji: "✨" },
    { id: "liner", name: "Liner", url: "https://app.liner.com/ko", desc: "AI 하이라이트 리서치", emoji: "📌" },
    { id: "alan", name: "앨런", url: "https://myalan.ai/solution/intro-deep-research", desc: "딥리서치 AI", emoji: "🧠" },
    { id: "claude", name: "Claude", url: "https://claude.ai", desc: "문서 작성·분석", emoji: "💬" },
    { id: "chatgpt", name: "ChatGPT", url: "https://chatgpt.com", desc: "범용 AI 대화", emoji: "🟢" },
    { id: "gemini", name: "Gemini", url: "https://gemini.google.com", desc: "Google 연동 AI", emoji: "♊" },
  ]},
  { id: "google", name: "Google 도구", links: [
    { id: "aistudio", name: "AI Studio", url: "https://aistudio.google.com/prompts/new_chat", desc: "Gemini API·프롬프트", emoji: "🔬" },
    { id: "appsscript", name: "Apps Script", url: "https://workspace.google.com/products/apps-script/", desc: "Google 자동화 스크립트", emoji: "⚙️" },
    { id: "pomelli", name: "Pomelli", url: "https://labs.google.com/u/0/pomelli/onboarding", desc: "Google Labs 실험 AI", emoji: "🧪" },
  ]},
  { id: "design", name: "디자인·창작", links: [
    { id: "canva", name: "Canva", url: "https://canva.com", desc: "SNS 포스터 디자인", emoji: "🖼️" },
    { id: "miricanvas", name: "미리캔버스", url: "https://www.miricanvas.com/ko/templates", desc: "한국형 템플릿 디자인", emoji: "🎨" },
    { id: "firefly", name: "Adobe Firefly", url: "https://firefly.adobe.com/", desc: "AI 이미지 생성", emoji: "🔥" },
    { id: "gamma", name: "Gamma", url: "https://gamma.app/ko", desc: "AI 프레젠테이션 생성", emoji: "📊" },
    { id: "flaticon", name: "Flaticon", url: "https://www.flaticon.com/kr/free-icons/app", desc: "무료 아이콘 라이브러리", emoji: "🔷" },
    { id: "colorhunt", name: "ColorHunt", url: "https://colorhunt.co/", desc: "컬러 팔레트 아이디어", emoji: "🌈" },
  ]},
  { id: "tools", name: "이미지·편집 도구", links: [
    { id: "photoroom", name: "PhotoRoom", url: "https://www.photoroom.com/ko/tools/background-remover", desc: "누끼 제거·배경 교체", emoji: "📸" },
    { id: "pixlr", name: "Pixlr", url: "https://pixlr.com/kr/editor/", desc: "온라인 사진 편집", emoji: "✏️" },
    { id: "ilovepdf", name: "ilovePDF", url: "https://www.ilovepdf.com/ko", desc: "PDF 변환·편집·압축", emoji: "📄" },
  ]},
  { id: "tax", name: "세무·정부·지원금", links: [
    { id: "hometax", name: "홈택스", url: "https://hometax.go.kr", desc: "국세청 전자신고", emoji: "🏛️" },
    { id: "wetax", name: "위택스", url: "https://wetax.go.kr", desc: "지방세 신고·납부", emoji: "🏢" },
    { id: "4insure", name: "4대보험포털", url: "https://www.4insure.or.kr/pbiz/main/main.do", desc: "4대보험 업무", emoji: "🛡️" },
    { id: "work24", name: "워크넷", url: "https://www.work24.go.kr/", desc: "고용지원금 신청", emoji: "💼" },
    { id: "bizinfo", name: "비즈인포", url: "https://www.bizinfo.go.kr/", desc: "정책자금·지원사업 정보", emoji: "📋" },
    { id: "kstartup", name: "K-스타트업", url: "https://www.k-startup.go.kr/", desc: "창업 지원 포털", emoji: "🚀" },
    { id: "mss", name: "소상공인마당", url: "https://www.mss.go.kr/site/smba/ex/bbs/List.do?cbIdx=310", desc: "소상공인 지원·공지", emoji: "🏪" },
    { id: "g2b", name: "나라장터", url: "https://www.g2b.go.kr/", desc: "공공조달·입찰", emoji: "🏗️" },
  ]},
];

export default function ToolsClient({ initialCategories, isAdmin, userId }: {
  initialCategories: Category[];
  isAdmin: boolean;
  userId: string;
}) {
  const [categories, setCategories] = useState<Category[]>(
    initialCategories.length > 0 ? initialCategories : DEFAULT_CATEGORIES
  );
  const [favorites, setFavorites] = useState<Set<string>>(() => {
    try { return new Set(JSON.parse(localStorage.getItem(`favorites-${userId}`) ?? "[]")); } catch { return new Set(); }
  });
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());
  const [editMode, setEditMode] = useState(false);

  // 편집 상태
  const [addingCat, setAddingCat] = useState(false);
  const [newCatName, setNewCatName] = useState("");
  const [addingLink, setAddingLink] = useState<string | null>(null);
  const [newLink, setNewLink] = useState({ name: "", url: "", desc: "", emoji: "🔗" });

  function toggleFav(id: string) {
    setFavorites((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      localStorage.setItem(`favorites-${userId}`, JSON.stringify([...next]));
      return next;
    });
  }

  function toggleCollapse(id: string) {
    setCollapsed((prev) => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  }

  async function addCategory() {
    if (!newCatName.trim()) return;
    const res = await fetch("/api/tools/categories", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: newCatName.trim() }) });
    if (res.ok) {
      const cat = await res.json();
      setCategories((prev) => [...prev, { ...cat, links: [] }]);
      setNewCatName(""); setAddingCat(false);
    }
  }

  async function deleteCategory(catId: string) {
    if (!confirm("카테고리와 하위 링크를 모두 삭제합니까?")) return;
    await fetch(`/api/tools/categories/${catId}`, { method: "DELETE" });
    setCategories((prev) => prev.filter((c) => c.id !== catId));
  }

  async function addLink(catId: string) {
    if (!newLink.name.trim() || !newLink.url.trim()) return;
    const url = newLink.url.startsWith("http") ? newLink.url : "https://" + newLink.url;
    const res = await fetch("/api/tools/links", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...newLink, url, categoryId: catId }) });
    if (res.ok) {
      const link = await res.json();
      setCategories((prev) => prev.map((c) => c.id === catId ? { ...c, links: [...c.links, link] } : c));
      setNewLink({ name: "", url: "", desc: "", emoji: "🔗" }); setAddingLink(null);
    }
  }

  async function deleteLink(catId: string, linkId: string) {
    await fetch(`/api/tools/links/${linkId}`, { method: "DELETE" });
    setCategories((prev) => prev.map((c) => c.id === catId ? { ...c, links: c.links.filter((l) => l.id !== linkId) } : c));
  }

  const favLinks = categories.flatMap((c) => c.links.filter((l) => favorites.has(l.id)));
  const inputCls = "px-2.5 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 bg-white";

  return (
    <div className="max-w-5xl">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">업무도구</h1>
          <p className="text-xs text-gray-400 mt-0.5">자주 쓰는 외부 서비스 바로가기 · ★ 클릭으로 즐겨찾기</p>
        </div>
        {isAdmin && (
          <button onClick={() => setEditMode((v) => !v)} className={cn("flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-all", editMode ? "border-violet-300 bg-violet-50 text-violet-700" : "border-gray-200 text-gray-600 hover:bg-gray-50")}>
            <Pencil size={12} /> {editMode ? "편집 완료" : "편집"}
          </button>
        )}
      </div>

      {/* 즐겨찾기 */}
      {favLinks.length > 0 && (
        <div className="mb-6">
          <p className="text-xs font-semibold text-amber-600 mb-2 flex items-center gap-1.5"><Star size={12} fill="currentColor" /> 즐겨찾기</p>
          <div className="flex flex-wrap gap-2">
            {favLinks.map((l) => (
              <a key={l.id} href={l.url} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-amber-200 bg-amber-50 hover:bg-amber-100 transition-colors text-sm font-medium text-gray-800">
                <span>{l.emoji}</span>{l.name}<ExternalLink size={11} className="text-gray-400" />
              </a>
            ))}
          </div>
        </div>
      )}

      {/* 카테고리별 */}
      <div className="space-y-4">
        {categories.map((cat) => (
          <div key={cat.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            {/* 카테고리 헤더 */}
            <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-100">
              <button onClick={() => toggleCollapse(cat.id)} className="flex items-center gap-2 text-sm font-semibold text-gray-800 hover:text-gray-600">
                {collapsed.has(cat.id) ? <ChevronRight size={14} /> : <ChevronDown size={14} />}
                {cat.name}
                <span className="text-xs font-normal text-gray-400">{cat.links.length}개</span>
              </button>
              {editMode && (
                <div className="flex items-center gap-2">
                  <button onClick={() => setAddingLink(cat.id)} className="text-xs text-violet-600 hover:text-violet-800 flex items-center gap-1"><Plus size={11} />링크 추가</button>
                  <button onClick={() => deleteCategory(cat.id)} className="text-xs text-red-400 hover:text-red-600"><Trash2 size={12} /></button>
                </div>
              )}
            </div>

            {!collapsed.has(cat.id) && (
              <div className="p-4">
                {/* 링크 그리드 */}
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-2">
                  {cat.links.map((link) => (
                    <div key={link.id} className="relative group">
                      <a href={link.url} target="_blank" rel="noopener noreferrer"
                        className="flex flex-col items-center gap-1.5 p-2.5 rounded-xl border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all bg-gray-50/50 hover:bg-white text-center">
                        <span className="text-xl">{link.emoji}</span>
                        <div>
                          <p className="text-xs font-semibold text-gray-900 leading-tight">{link.name}</p>
                          <p className="text-[10px] text-gray-400 mt-0.5 leading-snug line-clamp-2">{link.desc}</p>
                        </div>
                      </a>
                      {/* 즐겨찾기 버튼 */}
                      <button onClick={() => toggleFav(link.id)}
                        className={cn("absolute top-1.5 right-1.5 p-1 rounded-full transition-all", favorites.has(link.id) ? "text-amber-400 opacity-100" : "text-gray-300 opacity-0 group-hover:opacity-100 hover:text-amber-400")}>
                        <Star size={12} fill={favorites.has(link.id) ? "currentColor" : "none"} />
                      </button>
                      {/* 삭제 버튼 (편집모드) */}
                      {editMode && (
                        <button onClick={() => deleteLink(cat.id, link.id)}
                          className="absolute -top-1.5 -left-1.5 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <X size={10} />
                        </button>
                      )}
                    </div>
                  ))}

                  {/* 링크 추가 입력 */}
                  {addingLink === cat.id && (
                    <div className="col-span-full mt-2 p-3 rounded-xl border border-violet-200 bg-violet-50 space-y-2">
                      <div className="flex gap-2 flex-wrap">
                        <input value={newLink.emoji} onChange={(e) => setNewLink((p) => ({...p, emoji: e.target.value}))} placeholder="이모지" className={inputCls} style={{ width: 60 }} />
                        <input value={newLink.name} onChange={(e) => setNewLink((p) => ({...p, name: e.target.value}))} placeholder="이름" className={inputCls} style={{ width: 120 }} />
                        <input value={newLink.url} onChange={(e) => setNewLink((p) => ({...p, url: e.target.value}))} placeholder="URL (https://...)" className={cn(inputCls, "flex-1")} />
                        <input value={newLink.desc} onChange={(e) => setNewLink((p) => ({...p, desc: e.target.value}))} placeholder="설명" className={cn(inputCls, "flex-1")} />
                        <button onClick={() => addLink(cat.id)} className="px-3 py-1.5 bg-violet-600 text-white text-xs rounded-lg hover:bg-violet-700 flex items-center gap-1"><Check size={12} />추가</button>
                        <button onClick={() => setAddingLink(null)} className="px-3 py-1.5 border border-gray-200 text-gray-500 text-xs rounded-lg hover:bg-gray-50"><X size={12} /></button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}

        {/* 카테고리 추가 (편집모드) */}
        {editMode && (
          <div>
            {addingCat ? (
              <div className="flex gap-2 items-center p-3 bg-white rounded-xl border border-violet-200">
                <input autoFocus value={newCatName} onChange={(e) => setNewCatName(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") addCategory(); if (e.key === "Escape") setAddingCat(false); }} placeholder="카테고리 이름" className={inputCls} />
                <button onClick={addCategory} className="px-3 py-1.5 bg-violet-600 text-white text-xs rounded-lg flex items-center gap-1"><Check size={12} />추가</button>
                <button onClick={() => setAddingCat(false)} className="px-3 py-1.5 border border-gray-200 text-xs rounded-lg text-gray-500"><X size={12} /></button>
              </div>
            ) : (
              <button onClick={() => setAddingCat(true)} className="w-full py-3 border-2 border-dashed border-gray-200 rounded-2xl text-sm text-gray-400 hover:border-gray-300 hover:text-gray-600 transition-colors flex items-center justify-center gap-2">
                <Plus size={14} /> 카테고리 추가
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
