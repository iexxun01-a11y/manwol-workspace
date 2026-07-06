"use client";

import { useState } from "react";
import { Calculator } from "lucide-react";

function fmt(n: number) { return Math.round(n).toLocaleString(); }

export default function HourlyPage() {
  const [hourly, setHourly] = useState("");
  const [days, setDays] = useState("5");
  const [hours, setHours] = useState("8");
  const [result, setResult] = useState<null|{weeklyPay:number;weeklyHoliday:number;monthlyPay:number;monthlyHoliday:number;total:number}>(null);

  function calculate() {
    const h = parseInt(hourly.replace(/,/g,"")) || 0;
    const d = parseInt(days) || 5;
    const hrs = parseFloat(hours) || 8;
    const weeklyPay = h * hrs * d;
    const weeklyHoliday = h * hrs;
    const monthlyPay = weeklyPay * 4.345;
    const monthlyHoliday = weeklyHoliday * 4.345;
    const total = monthlyPay + monthlyHoliday;
    setResult({ weeklyPay, weeklyHoliday, monthlyPay, monthlyHoliday, total });
  }

  const inputCls = "w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none bg-white";
  const labelCls = "block text-xs font-medium text-gray-500 mb-1";

  return (
    <div className="max-w-xl">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">원급여 계산기 (시급제)</h1>
        <p className="text-xs text-gray-400 mt-0.5">시급 → 월급 변환, 주휴수당 포함 계산</p>
      </div>
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
        <div><label className={labelCls}>시급 (원)</label><input value={hourly} onChange={(e) => { const v=e.target.value.replace(/[^\d]/g,""); setHourly(v?parseInt(v).toLocaleString():""); }} placeholder="예: 10,030" className={inputCls} /></div>
        <div className="grid grid-cols-2 gap-3">
          <div><label className={labelCls}>주 근무일수 (일)</label><input type="number" min="1" max="6" value={days} onChange={(e) => setDays(e.target.value)} className={inputCls} /></div>
          <div><label className={labelCls}>1일 근무시간 (시간)</label><input type="number" min="1" max="12" step="0.5" value={hours} onChange={(e) => setHours(e.target.value)} className={inputCls} /></div>
        </div>
        <button onClick={calculate} className="w-full flex items-center justify-center gap-2 py-2.5 text-sm font-semibold text-white rounded-xl" style={{ backgroundColor: "var(--accent)" }}>
          <Calculator size={15} /> 계산하기
        </button>
        {result && (
          <div className="pt-4 border-t border-gray-100 space-y-2">
            <div className="flex justify-between text-sm text-gray-600"><span>주 기본급</span><span>{fmt(result.weeklyPay)} 원</span></div>
            <div className="flex justify-between text-sm text-gray-600"><span>주휴수당 (1일치)</span><span>{fmt(result.weeklyHoliday)} 원</span></div>
            <div className="flex justify-between text-sm text-gray-500 text-xs border-t border-dashed border-gray-100 pt-2"><span>월 기본급 (×4.345주)</span><span>{fmt(result.monthlyPay)} 원</span></div>
            <div className="flex justify-between text-sm text-gray-500 text-xs"><span>월 주휴수당 (×4.345주)</span><span>{fmt(result.monthlyHoliday)} 원</span></div>
            <div className="flex justify-between text-base font-bold rounded-xl p-3 mt-2" style={{ backgroundColor: "var(--accent)", color: "#fff" }}>
              <span>월 총 급여</span><span>{fmt(result.total)} 원</span>
            </div>
            <p className="text-xs text-gray-400 text-center">※ 주 15시간 이상 근무 시 주휴수당 발생 (근로기준법)</p>
          </div>
        )}
      </div>
    </div>
  );
}
