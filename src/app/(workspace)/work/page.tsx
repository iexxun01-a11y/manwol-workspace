import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  ScrollText, BadgeDollarSign, UserCheck, Receipt,
  Calendar, Calculator, Moon, Clock, Scale, ChevronRight,
} from "lucide-react";

export const dynamic = "force-dynamic";

const TAX_ITEMS: { month: number; day: number | "말일"; desc: string }[] = [
  { month: 1, day: 10, desc: "원천세 신고" },
  { month: 1, day: 25, desc: "부가세 확정신고" },
  { month: 2, day: 10, desc: "원천세 신고" },
  { month: 3, day: 10, desc: "지급명세서 제출" },
  { month: 3, day: "말일", desc: "법인세 신고" },
  { month: 4, day: 10, desc: "원천세 신고" },
  { month: 5, day: 10, desc: "원천세 신고" },
  { month: 5, day: 25, desc: "부가세 예정신고" },
  { month: 5, day: "말일", desc: "종합소득세 확정신고" },
  { month: 6, day: 10, desc: "원천세 신고" },
  { month: 7, day: 10, desc: "원천세 신고" },
  { month: 7, day: 25, desc: "부가세 확정신고" },
  { month: 8, day: 10, desc: "원천세 신고" },
  { month: 9, day: 10, desc: "원천세 신고" },
  { month: 10, day: 10, desc: "원천세 신고" },
  { month: 10, day: 25, desc: "부가세 예정신고" },
  { month: 11, day: 10, desc: "원천세 신고" },
  { month: 11, day: "말일", desc: "종합소득세 중간예납" },
  { month: 12, day: 10, desc: "원천세 신고" },
  { month: 12, day: 15, desc: "종합부동산세 납부" },
];

function getNextTaxItems(count = 2) {
  const now = new Date();
  const year = now.getFullYear();
  return TAX_ITEMS.map((item) => {
    const lastDay = new Date(year, item.month, 0).getDate();
    const d = item.day === "말일" ? lastDay : item.day;
    const target = new Date(year, item.month - 1, d);
    const dday = Math.ceil((target.getTime() - now.getTime()) / 86400000);
    return { ...item, dday, dateStr: `${year}.${String(item.month).padStart(2,"0")}.${String(d).padStart(2,"0")}` };
  }).filter(x => x.dday >= 0).sort((a, b) => a.dday - b.dday).slice(0, count);
}

const CATEGORIES = [
  {
    id: "hr",
    label: "노무·급여",
    desc: "계약서·급여·증명서 발급",
    emoji: "📋",
    color: "#7c3aed",
    bg: "from-violet-500 to-purple-600",
    items: [
      { label: "근로계약서", desc: "정규직·수습 계약서 작성", href: "/work/contract", icon: ScrollText },
      { label: "급여명세서", desc: "월별 급여 명세 발급", href: "/work/payslip", icon: BadgeDollarSign },
      { label: "재직증명서", desc: "재직 사실 확인 서류", href: "/work/employment-cert", icon: UserCheck },
    ],
  },
  {
    id: "finance",
    label: "세무·재무",
    desc: "지출결의·세무 일정 관리",
    emoji: "💰",
    color: "#0284c7",
    bg: "from-sky-500 to-blue-600",
    items: [
      { label: "지출결의서", desc: "지출 내역 및 증빙 처리", href: "/work/expense", icon: Receipt },
      { label: "세무 스케줄", desc: "연간 신고·납부 일정", href: "/work/tax-schedule", icon: Calendar },
    ],
  },
  {
    id: "calc",
    label: "임금계산",
    desc: "각종 급여·수당 자동 계산",
    emoji: "🧮",
    color: "#059669",
    bg: "from-emerald-500 to-teal-600",
    items: [
      { label: "실수령액 계산기", desc: "4대보험·세금 공제 후 실수령", href: "/work/calc/net-salary", icon: Calculator },
      { label: "야간·연장·휴일 수당", desc: "통상임금 기반 가산수당", href: "/work/calc/overtime", icon: Moon },
      { label: "원급여 계산기 (시급)", desc: "시급→월급·주휴수당 포함", href: "/work/calc/hourly", icon: Clock },
      { label: "외주 vs 직원 비용", desc: "사업주 총비용 비교 분석", href: "/work/calc/outsource", icon: Scale },
    ],
  },
];

export default async function WorkPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const taxItems = getNextTaxItems(2);
  const nextTax = taxItems[0];

  return (
    <div className="max-w-3xl space-y-5">

      {/* ── 세무 D-day 배너 ── */}
      {nextTax && (
        <Link href="/work/tax-schedule"
          className="block rounded-2xl overflow-hidden hover:shadow-lg transition-all group"
          style={{ background: "linear-gradient(135deg, #1e1b4b 0%, #312e81 60%, #4c1d95 100%)" }}
        >
          <div className="p-5">
            <p className="text-xs font-medium text-indigo-300 mb-3 flex items-center gap-1.5">
              <span>📅</span> 다음 세무 신고·납부 일정
            </p>
            <div className="flex items-end gap-4">
              <div>
                <span className="text-6xl font-black text-white leading-none">D-{nextTax.dday}</span>
              </div>
              <div className="pb-1">
                <p className="text-lg font-bold text-white">{nextTax.dateStr}</p>
                <p className="text-sm text-indigo-200">{nextTax.desc}</p>
              </div>
              {taxItems[1] && (
                <div className="ml-auto pb-1 text-right">
                  <p className="text-xs text-indigo-300">다음 일정</p>
                  <p className="text-sm font-bold text-indigo-200">D-{taxItems[1].dday}</p>
                  <p className="text-xs text-indigo-300">{taxItems[1].dateStr} {taxItems[1].desc}</p>
                </div>
              )}
            </div>
          </div>
          <div className="px-5 pb-3 flex items-center gap-1 text-xs text-indigo-400 group-hover:text-indigo-200 transition-colors">
            전체 일정 보기 <ChevronRight size={12} />
          </div>
        </Link>
      )}

      {/* ── 카테고리 섹션들 ── */}
      {CATEGORIES.map((cat) => (
        <div key={cat.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {/* 카드 헤더 */}
          <div className={`bg-gradient-to-r ${cat.bg} px-5 py-3 flex items-center justify-between`}>
            <div className="flex items-center gap-2.5">
              <span className="text-xl">{cat.emoji}</span>
              <div>
                <h2 className="text-sm font-bold text-white">{cat.label}</h2>
                <p className="text-xs text-white/60">{cat.desc}</p>
              </div>
            </div>
            <span className="text-xs text-white/60 font-medium">{cat.items.length}개 도구</span>
          </div>

          {/* 항목 리스트 */}
          <div className="divide-y divide-gray-50">
            {cat.items.map((item) => {
              const Icon = item.icon;
              return (
                <Link key={item.href} href={item.href}
                  className="flex items-center gap-3.5 px-5 py-3.5 hover:bg-gray-50 transition-colors group"
                >
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                    style={{ backgroundColor: cat.color + "18" }}>
                    <Icon size={16} style={{ color: cat.color }} strokeWidth={1.8} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900">{item.label}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{item.desc}</p>
                  </div>
                  <ChevronRight size={14} className="text-gray-300 group-hover:text-gray-500 transition-colors shrink-0" />
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
