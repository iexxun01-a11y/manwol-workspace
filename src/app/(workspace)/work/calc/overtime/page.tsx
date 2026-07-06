"use client";

import { useState } from "react";
import { Calculator } from "lucide-react";

function fmt(n: number) { return Math.round(n).toLocaleString(); }

export default function OvertimePage() {
  const [monthly, setMonthly] = useState("");
  const [night, setNight] = useState("0");
  const [overtime, setOvertime] = useState("0");
  const [holiday, setHoliday] = useState("0");
  const [result, setResult] = useState<null | { hourly: number; nightPay: number; overtimePay: number; holidayPay: number; total: number }>(null);

  function calculate() {
    const m = parseInt(monthly.replace(/,/g, "")) || 0;
    const hourly = m / 209;
    const nightPay = hourly * 0.5 * (parseInt(night) || 0);
    const overtimePay = hourly * 1.5 * (parseInt(overtime) || 0);
    const holidayPay = hourly * 1.5 * (parseInt(holiday) || 0);
    const total = nightPay + overtimePay + holidayPay;
    setResult({ hourly, nightPay, overtimePay, holidayPay, total });
  }

  const inputCls = "w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none bg-white";
  const labelCls = "block text-xs font-medium text-gray-500 mb-1";

  return (
    <div className="max-w-xl">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">야간·연장·휴일 수당</h1>
        <p className="text-xs text-gray-400 mt-0.5">통상임금 기반 가산수당 계산 (근로기준법 기준)</p>
      </div>
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
        <div><label className={labelCls}>월 통상임금 (원)</label><input value={monthly} onChange={(e) => { const v=e.target.value.replace(/[^\d]/g,""); setMonthly(v?parseInt(v).toLocaleString():""); }} placeholder="예: 2,000,000" className={inputCls} /></div>
        <div className="grid grid-cols-3 gap-3">
          <div><label className={labelCls}>야간 근무 (시간)</label><input type="number" min="0" value={night} onChange={(e) => setNight(e.target.value)} className={inputCls} /></div>
          <div><label className={labelCls}>연장 근무 (시간)</label><input type="number" min="0" value={overtime} onChange={(e) => setOvertime(e.target.value)} className={inputCls} /></div>
          <div><label className={labelCls}>휴일 근무 (시간)</label><input type="number" min="0" value={holiday} onChange={(e) => setHoliday(e.target.value)} className={inputCls} /></div>
        </div>
        <button onClick={calculate} className="w-full flex items-center justify-center gap-2 py-2.5 text-sm font-semibold text-white rounded-xl" style={{ backgroundColor: "var(--accent)" }}>
          <Calculator size={15} /> 계산하기
        </button>
        {result && (
          <div className="pt-4 border-t border-gray-100 space-y-2">
            <div className="flex justify-between text-xs text-gray-500"><span>통상시급 (월급÷209h)</span><span>{fmt(result.hourly)} 원/시간</span></div>
            <div className="flex justify-between text-sm text-gray-600"><span>야간수당 (×0.5 가산)</span><span>{fmt(result.nightPay)} 원</span></div>
            <div className="flex justify-between text-sm text-gray-600"><span>연장수당 (×1.5 가산)</span><span>{fmt(result.overtimePay)} 원</span></div>
            <div className="flex justify-between text-sm text-gray-600"><span>휴일수당 (×1.5 가산)</span><span>{fmt(result.holidayPay)} 원</span></div>
            <div className="flex justify-between text-base font-bold rounded-xl p-3 mt-2" style={{ backgroundColor: "var(--accent)", color: "#fff" }}>
              <span>총 추가 수당</span><span>{fmt(result.total)} 원</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
