"use client";

import { useState } from "react";
import { Calculator } from "lucide-react";

function fmt(n: number) { return Math.round(n).toLocaleString(); }

export default function OutsourcePage() {
  const [pay, setPay] = useState("");
  const [result, setResult] = useState<null|{
    emp: { base:number; pension:number; health:number; industrial:number; employment:number; total:number };
    free: { base:number; tax33:number; total:number };
  }>(null);

  function calculate() {
    const p = parseInt(pay.replace(/,/g,"")) || 0;
    const pension = p * 0.045;
    const health = p * 0.03545 * 2;
    const industrial = p * 0.0090;
    const employment = p * (0.009 + 0.0025);
    const empTotal = p + pension + health + industrial + employment;
    const tax33 = p * 0.033;
    setResult({
      emp: { base:p, pension, health, industrial, employment, total:empTotal },
      free: { base:p, tax33, total:p },
    });
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">외주·프리랜서 vs 직원 비용 비교</h1>
        <p className="text-xs text-gray-400 mt-0.5">동일 보수 기준 사업주 실부담 비용 비교</p>
      </div>
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">월 보수 (원)</label>
          <input value={pay} onChange={(e) => { const v=e.target.value.replace(/[^\d]/g,""); setPay(v?parseInt(v).toLocaleString():""); }} placeholder="예: 3,000,000" className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none bg-white" />
        </div>
        <button onClick={calculate} className="w-full flex items-center justify-center gap-2 py-2.5 text-sm font-semibold text-white rounded-xl" style={{ backgroundColor: "var(--accent)" }}>
          <Calculator size={15} /> 비교하기
        </button>
        {result && (
          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
            {/* 직원 */}
            <div className="rounded-xl border border-blue-100 p-4 bg-blue-50/30">
              <p className="text-sm font-bold text-blue-700 mb-3">👔 직원 (4대보험 적용)</p>
              <div className="space-y-1.5 text-xs text-gray-600">
                <div className="flex justify-between"><span>기본 급여</span><span>{fmt(result.emp.base)}</span></div>
                <div className="flex justify-between text-red-500"><span>+ 국민연금 (4.5%)</span><span>{fmt(result.emp.pension)}</span></div>
                <div className="flex justify-between text-red-500"><span>+ 건강보험 사업주 (7.09%)</span><span>{fmt(result.emp.health)}</span></div>
                <div className="flex justify-between text-red-500"><span>+ 산재보험 (0.9%)</span><span>{fmt(result.emp.industrial)}</span></div>
                <div className="flex justify-between text-red-500"><span>+ 고용보험 사업주 (1.15%)</span><span>{fmt(result.emp.employment)}</span></div>
              </div>
              <div className="mt-3 pt-2 border-t border-blue-200 flex justify-between text-sm font-bold text-blue-800">
                <span>사업주 총비용</span><span>{fmt(result.emp.total)}</span>
              </div>
            </div>
            {/* 프리랜서 */}
            <div className="rounded-xl border border-emerald-100 p-4 bg-emerald-50/30">
              <p className="text-sm font-bold text-emerald-700 mb-3">💼 프리랜서 (3.3% 원천징수)</p>
              <div className="space-y-1.5 text-xs text-gray-600">
                <div className="flex justify-between"><span>계약금액</span><span>{fmt(result.free.base)}</span></div>
                <div className="flex justify-between text-emerald-600"><span>원천세 3.3% (근로자 부담)</span><span>- {fmt(result.free.tax33)}</span></div>
                <div className="flex justify-between text-gray-400"><span>4대보험 없음</span><span>-</span></div>
                <div className="flex justify-between text-gray-400"><span>퇴직금 없음</span><span>-</span></div>
                <div className="flex justify-between text-gray-400"><span>연차 없음</span><span>-</span></div>
              </div>
              <div className="mt-3 pt-2 border-t border-emerald-200 flex justify-between text-sm font-bold text-emerald-800">
                <span>사업주 총비용</span><span>{fmt(result.free.total)}</span>
              </div>
            </div>
            <div className="col-span-2 rounded-xl bg-gray-50 p-3 text-center">
              <span className="text-xs text-gray-500">직원 채용 시 추가 비용: </span>
              <span className="text-sm font-bold" style={{ color:"var(--accent)" }}>{fmt(result.emp.total - result.free.total)} 원/월</span>
              <span className="text-xs text-gray-400"> (연 {fmt((result.emp.total - result.free.total)*12)}원)</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
