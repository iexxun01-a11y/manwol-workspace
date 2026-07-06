"use client";

import { cn } from "@/lib/utils";

type DateType = "10일" | "25일" | "말일" | "15일";
type TaxItem = { date: DateType; desc: string };
type MonthData = { month: number; major?: string; color: string; items: TaxItem[] };

const SCHEDULE: MonthData[] = [
  { month: 1, major: "감사결산", color: "#ef4444", items: [
    { date: "10일", desc: "원천세 신고 (월별/반기별)" },
    { date: "25일", desc: "부가세 확정신고" },
    { date: "말일", desc: "9월말법인 지방소득세 신고마감" },
    { date: "말일", desc: "일용/간이 지급명세서 마감" },
    { date: "말일", desc: "종합소득세 중간예납 분납" },
  ]},
  { month: 2, major: "연말정산", color: "#f97316", items: [
    { date: "10일", desc: "원천세 신고 (월별)" },
    { date: "10일", desc: "사업장현황신고 (면세)" },
    { date: "말일", desc: "양도소득세 (주식·하반기)" },
    { date: "말일", desc: "지급명세서 제출 (기타/이자/배당)" },
    { date: "말일", desc: "6월말 법인세 중간예납" },
  ]},
  { month: 3, major: "법인세", color: "#eab308", items: [
    { date: "10일", desc: "원천세 신고 (월별)" },
    { date: "10일", desc: "지급명세서 제출 (근로/사업/퇴직)" },
    { date: "말일", desc: "12월말 법인세 신고" },
    { date: "말일", desc: "일용/간이 지급명세서 마감" },
  ]},
  { month: 4, major: "", color: "#84cc16", items: [
    { date: "10일", desc: "원천세 신고 (월별)" },
    { date: "말일", desc: "12월 지방소득세(법인세분) 신고" },
    { date: "말일", desc: "일용/간이 지급명세서 마감" },
  ]},
  { month: 5, major: "종합소득세", color: "#22c55e", items: [
    { date: "10일", desc: "원천세 신고 (월별)" },
    { date: "25일", desc: "부가세 예정신고" },
    { date: "말일", desc: "9월말 법인 중간예납 신고" },
    { date: "말일", desc: "종합소득세 (양도소득 포함) 확정신고" },
    { date: "말일", desc: "일용/간이 지급명세서 마감" },
  ]},
  { month: 6, major: "종합소득세(성실)", color: "#06b6d4", items: [
    { date: "10일", desc: "원천세 신고 (월별)" },
    { date: "10일", desc: "부가세 총괄납부/사업자단위과세 신청" },
    { date: "말일", desc: "원천세 반기별 신청기한" },
    { date: "말일", desc: "3월말 법인 법인세 신고" },
    { date: "말일", desc: "성실신고 확인대상자 종소세 신고" },
  ]},
  { month: 7, major: "", color: "#3b82f6", items: [
    { date: "10일", desc: "원천세 신고 (월별/반기별)" },
    { date: "25일", desc: "부가세 확정신고" },
    { date: "말일", desc: "3월말 법인 지방소득세(법인세분)" },
    { date: "말일", desc: "일용/간이/근로 지급명세서 마감" },
    { date: "말일", desc: "종합소득세 분납기한" },
  ]},
  { month: 8, major: "", color: "#6366f1", items: [
    { date: "말일", desc: "12월말 법인 중간예납 신고" },
    { date: "말일", desc: "양도소득세(주식·상반기)" },
    { date: "말일", desc: "일용/간이 지급명세서 마감" },
  ]},
  { month: 9, major: "", color: "#8b5cf6", items: [
    { date: "10일", desc: "원천세 신고 (월별)" },
    { date: "말일", desc: "6월말 법인세 신고" },
    { date: "말일", desc: "종부세 합산배제 및 과세특례 신청" },
    { date: "말일", desc: "재산세(주택2기, 토지분) 고지분 납부" },
  ]},
  { month: 10, major: "", color: "#ec4899", items: [
    { date: "10일", desc: "원천세 신고 (월별)" },
    { date: "25일", desc: "부가세 예정신고" },
    { date: "말일", desc: "12월 중간예납 분납기한" },
    { date: "말일", desc: "일용/간이 지급명세서 마감" },
  ]},
  { month: 11, major: "법인/개인 손익예상", color: "#f43f5e", items: [
    { date: "10일", desc: "원천세 신고 (월별)" },
    { date: "말일", desc: "종합소득세 중간예납 납부" },
    { date: "말일", desc: "3월말 법인 중간예납 신고" },
    { date: "말일", desc: "일용/간이 지급명세서 마감" },
  ]},
  { month: 12, major: "법인/개인 손익예상", color: "#ef4444", items: [
    { date: "10일", desc: "원천세 신고 (월별)" },
    { date: "10일", desc: "부가세 총괄납부/사업자단위과세 신청" },
    { date: "15일", desc: "종합부동산세 고지분 납부" },
    { date: "말일", desc: "9월말 법인 법인세 신고" },
    { date: "말일", desc: "원천세 반기별 신청기한" },
  ]},
];

const DATE_STYLE: Record<DateType, { bg: string; text: string; dot: string }> = {
  "10일":  { bg: "bg-blue-100",   text: "text-blue-700",   dot: "bg-blue-500" },
  "25일":  { bg: "bg-green-100",  text: "text-green-700",  dot: "bg-green-500" },
  "말일":  { bg: "bg-amber-100",  text: "text-amber-700",  dot: "bg-amber-500" },
  "15일":  { bg: "bg-purple-100", text: "text-purple-700", dot: "bg-purple-500" },
};

export default function TaxScheduleClient() {
  const now = new Date();
  const currentMonth = now.getMonth() + 1;

  function getDday(month: number, dateLabel: DateType): number {
    const year = now.getFullYear();
    const lastDay = new Date(year, month, 0).getDate();
    const targetDay = dateLabel === "말일" ? lastDay : parseInt(dateLabel);
    const target = new Date(year, month - 1, targetDay);
    return Math.ceil((target.getTime() - now.getTime()) / 86400000);
  }

  return (
    <div className="max-w-6xl">
      <div className="mb-5">
        <h1 className="text-xl font-bold text-gray-900">세무 스케줄표</h1>
        <p className="text-xs text-gray-400 mt-0.5">2026년 연간 신고·납부 일정 — 일반 기준이며 법령 개정에 따라 변경될 수 있습니다</p>
      </div>

      {/* 범례 */}
      <div className="flex items-center gap-4 mb-5 px-4 py-2.5 bg-white border border-gray-100 rounded-xl w-fit text-xs shadow-sm">
        <span className="font-semibold text-gray-500">기준일</span>
        {(Object.entries(DATE_STYLE) as [DateType, typeof DATE_STYLE[DateType]][]).map(([k, v]) => (
          <span key={k} className="flex items-center gap-1.5">
            <span className={cn("w-2 h-2 rounded-full", v.dot)} />
            <span className={cn("font-medium", v.text)}>{k}</span>
          </span>
        ))}
      </div>

      {/* 월별 캘린더 그리드 */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        {SCHEDULE.map(({ month, major, color, items }) => {
          const isCurrentMonth = month === currentMonth;

          // 날짜 기준으로 그룹화
          const grouped: Partial<Record<DateType, TaxItem[]>> = {};
          items.forEach((item) => {
            if (!grouped[item.date]) grouped[item.date] = [];
            grouped[item.date]!.push(item);
          });

          return (
            <div
              key={month}
              className={cn(
                "rounded-2xl border overflow-hidden bg-white transition-all hover:shadow-md",
                isCurrentMonth ? "ring-2 shadow-md" : "border-gray-100"
              )}
              style={isCurrentMonth ? { borderColor: color, outline: `2px solid ${color}` } : {}}
            >
              {/* 헤더 */}
              <div
                className="px-4 py-3 flex items-center justify-between"
                style={{ backgroundColor: isCurrentMonth ? color : "#f9fafb" }}
              >
                <div className="flex items-center gap-2">
                  <span
                    className={cn("text-2xl font-black", isCurrentMonth ? "text-white" : "text-gray-800")}
                  >
                    {month}월
                  </span>
                  {major && (
                    <span
                      className={cn("text-xs font-semibold px-2 py-0.5 rounded-full", isCurrentMonth ? "bg-white/25 text-white" : "text-white")}
                      style={!isCurrentMonth ? { backgroundColor: color } : {}}
                    >
                      {major}
                    </span>
                  )}
                </div>
                {isCurrentMonth && (
                  <span className="text-xs font-bold text-white/90 bg-white/20 px-2 py-0.5 rounded-full">이번 달</span>
                )}
              </div>

              {/* 날짜별 그룹 */}
              <div className="p-3 space-y-2">
                {(["10일", "25일", "15일", "말일"] as DateType[]).map((dateKey) => {
                  const group = grouped[dateKey];
                  if (!group) return null;
                  const dday = getDday(month, dateKey);
                  const isPast = dday < 0;
                  const st = DATE_STYLE[dateKey];
                  return (
                    <div key={dateKey} className={cn("rounded-xl p-2.5", st.bg, isPast && "opacity-50")}>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className={cn("text-xs font-bold px-2 py-0.5 rounded-full bg-white/70", st.text)}>
                          {dateKey}
                        </span>
                        {!isPast && dday <= 30 && (
                          <span className={cn(
                            "text-xs font-black",
                            dday <= 3 ? "text-red-600" : dday <= 7 ? "text-amber-600" : st.text
                          )}>
                            D-{dday}
                          </span>
                        )}
                        {isPast && <span className="text-xs text-gray-400">완료</span>}
                      </div>
                      <ul className="space-y-1">
                        {group.map((item, i) => (
                          <li key={i} className={cn("flex items-start gap-1.5 text-xs", st.text)}>
                            <span className={cn("mt-1 w-1 h-1 rounded-full shrink-0", st.dot)} />
                            <span className="leading-relaxed">{item.desc}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <p className="text-xs text-gray-400 mt-4 text-center">
        ※ 상기 일정은 일반적인 기준이며, 법령 개정 및 공휴일 등으로 변경될 수 있습니다.
      </p>
    </div>
  );
}
