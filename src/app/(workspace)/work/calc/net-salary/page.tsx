"use client";

import { useState } from "react";
import { Calculator } from "lucide-react";

function fmt(n: number) { return Math.round(n).toLocaleString(); }

export default function NetSalaryPage() {
  const [annual, setAnnual] = useState("");
  const [result, setResult] = useState<null | { monthly: number; pension: number; health: number; longterm: number; employment: number; incomeTax: number; localTax: number; totalDeduct: number; net: number }>(null);

  function calculate() {
    const a = parseInt(annual.replace(/,/g, "")) || 0;
    const monthly = a / 12;
    const pension = Math.min(monthly * 0.045, 2700000 * 0.045);
    const health = monthly * 0.03545;
    const longterm = health * 0.1295;
    const employment = monthly * 0.009;
    const taxBase = monthly - pension - health - longterm - employment - 150000;
    const incomeTax = taxBase > 0 ? taxBase * 0.06 * 0.55 : 0;
    const localTax = incomeTax * 0.1;
    const totalDeduct = pension + health + longterm + employment + incomeTax + localTax;
    setResult({ monthly, pension, health, longterm, employment, incomeTax, localTax, totalDeduct, net: monthly - totalDeduct });
  }

  return (
    <div className="max-w-xl">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">실수령액 계산기</h1>
        <p className="text-xs text-gray-400 mt-0.5">4대보험·소득세 공제 후 실제 받는 금액 (2024년 기준 추정치)</p>
      </div>
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">연봉 (원)</label>
          <input value={annual} onChange={(e) => { const v = e.target.value.replace(/[^\d]/g,""); setAnnual(v ? parseInt(v).toLocaleString() : ""); }} placeholder="예: 24,000,000" className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 bg-white" onKeyDown={(e) => e.key === "Enter" && calculate()} />
        </div>
        <button onClick={calculate} className="w-full flex items-center justify-center gap-2 py-2.5 text-sm font-semibold text-white rounded-xl transition-colors" style={{ backgroundColor: "var(--accent)" }}>
          <Calculator size={15} /> 계산하기
        </button>
        {result && (
          <div className="mt-2 space-y-2 pt-4 border-t border-gray-100">
            <div className="flex justify-between text-sm text-gray-600"><span>월 세전급여</span><span className="font-medium">{fmt(result.monthly)} 원</span></div>
            <div className="pl-3 space-y-1 text-xs text-gray-500">
              <div className="flex justify-between"><span>국민연금 (4.5%)</span><span>- {fmt(result.pension)}</span></div>
              <div className="flex justify-between"><span>건강보험 (3.545%)</span><span>- {fmt(result.health)}</span></div>
              <div className="flex justify-between"><span>장기요양 (건보료×12.95%)</span><span>- {fmt(result.longterm)}</span></div>
              <div className="flex justify-between"><span>고용보험 (0.9%)</span><span>- {fmt(result.employment)}</span></div>
              <div className="flex justify-between"><span>소득세 (간이세액)</span><span>- {fmt(result.incomeTax)}</span></div>
              <div className="flex justify-between"><span>지방소득세 (소득세×10%)</span><span>- {fmt(result.localTax)}</span></div>
            </div>
            <div className="flex justify-between text-sm text-gray-600 border-t border-gray-100 pt-2"><span>총 공제액</span><span className="text-red-500 font-medium">- {fmt(result.totalDeduct)} 원</span></div>
            <div className="flex justify-between text-base font-bold rounded-xl p-3 mt-2" style={{ backgroundColor: "var(--accent)", color: "#fff" }}>
              <span>월 실수령액</span><span>{fmt(result.net)} 원</span>
            </div>
            <p className="text-xs text-gray-400 text-center">※ 부양가족 0명·비과세 150,000원 기준 추정치입니다</p>
          </div>
        )}
      </div>
    </div>
  );
}
