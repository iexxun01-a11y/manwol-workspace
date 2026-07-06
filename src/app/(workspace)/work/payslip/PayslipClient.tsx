"use client";

import { useState } from "react";
import { Printer, Plus } from "lucide-react";

type PayRow = { id: number; category: string; item: string; amount: string };
type DeductRow = { id: number; item: string; amount: string };

let pid = 3, did = 9;

const DEFAULT_PAY: PayRow[] = [
  { id: 1, category: "매월", item: "기본급", amount: "" },
  { id: 2, category: "", item: "", amount: "" },
];
const DEFAULT_DEDUCT: DeductRow[] = [
  { id: 1, item: "국민연금", amount: "" },
  { id: 2, item: "건강보험", amount: "" },
  { id: 3, item: "장기요양보험료", amount: "" },
  { id: 4, item: "소득세", amount: "" },
  { id: 5, item: "지방소득세", amount: "" },
  { id: 6, item: "건강정산보험료", amount: "" },
  { id: 7, item: "건강환급이자", amount: "" },
  { id: 8, item: "장기요양정산보험료", amount: "" },
];

export default function PayslipClient() {
  const today = new Date();
  const [company, setCompany] = useState("주식회사 만월연회");
  const [year, setYear] = useState(String(today.getFullYear()));
  const [month, setMonth] = useState("");
  const [payDate, setPayDate] = useState("");
  const [empName, setEmpName] = useState("");
  const [birthNo, setBirthNo] = useState("");
  const [dept, setDept] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [payRows, setPayRows] = useState<PayRow[]>(DEFAULT_PAY);
  const [deductRows, setDeductRows] = useState<DeductRow[]>(DEFAULT_DEDUCT);
  const [calcNote, setCalcNote] = useState("");

  const fmtAmt = (v: string) => { const n = v.replace(/[^\d-]/g, ""); return n ? parseInt(n).toLocaleString() : ""; };
  const parseAmt = (v: string) => parseInt(v.replace(/,/g, "")) || 0;

  const totalPay = payRows.reduce((s, r) => s + parseAmt(r.amount), 0);
  const totalDeduct = deductRows.reduce((s, r) => s + parseAmt(r.amount), 0);
  const netPay = totalPay - totalDeduct;

  const inputCls = "w-full px-2 py-1.5 text-sm border-0 focus:outline-none focus:bg-gray-50 bg-transparent rounded";
  const labelCls = "block text-xs font-medium text-gray-500 mb-1";
  const fieldCls = "w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none bg-white";

  const maxRows = Math.max(payRows.length, deductRows.length);

  return (
    <>
      <style>{`
        @media screen { #payslip-print { position: absolute; left: -9999px; visibility: hidden; height: 0; overflow: hidden; } }
        @page { margin: 10mm 8mm; }
        @media print {
          * { overflow: visible !important; height: auto !important; max-height: none !important; }
          html, body { margin: 0 !important; }
          .no-print { display: none !important; }
          #payslip-print { position: static; visibility: visible; }
          #payslip-print { font-family: "Malgun Gothic", serif; font-size: 9pt; }
        }
        #payslip-print table { border-collapse: collapse; width: 100%; }
        #payslip-print td, #payslip-print th { border: 1px solid #444; padding: 5px 8px; font-size: 10pt; }
        #payslip-print .head { background: #e8e8e8; font-weight: bold; text-align: center; }
      `}</style>

      <div className="max-w-3xl">
        <div className="flex items-center justify-between mb-6 no-print">
          <div><h1 className="text-xl font-bold text-gray-900">급여명세서</h1><p className="text-xs text-gray-400 mt-0.5">작성 후 출력/PDF 저장하세요</p></div>
          <button onClick={() => window.print()} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white rounded-xl" style={{ backgroundColor: "var(--accent)" }}>
            <Printer size={14} /> 출력 / PDF 저장
          </button>
        </div>

        {/* 화면 폼 */}
        <div className="no-print bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
          <div className="rounded-xl border border-gray-100 p-4">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">기본 정보</p>
            <div className="grid grid-cols-3 gap-3">
              <div><label className={labelCls}>회사명</label><input value={company} onChange={(e) => setCompany(e.target.value)} className={fieldCls} /></div>
              <div><label className={labelCls}>년</label><input value={year} onChange={(e) => setYear(e.target.value)} className={fieldCls} /></div>
              <div><label className={labelCls}>월</label><input value={month} onChange={(e) => setMonth(e.target.value)} placeholder="　" className={fieldCls} /></div>
              <div><label className={labelCls}>지급일</label><input value={payDate} onChange={(e) => setPayDate(e.target.value)} placeholder="예: 2026.07.10" className={fieldCls} /></div>
              <div><label className={labelCls}>성명</label><input value={empName} onChange={(e) => setEmpName(e.target.value)} className={fieldCls} /></div>
              <div><label className={labelCls}>생년월일(사번)</label><input value={birthNo} onChange={(e) => setBirthNo(e.target.value)} placeholder="2000.08.28" className={fieldCls} /></div>
              <div><label className={labelCls}>부서</label><input value={dept} onChange={(e) => setDept(e.target.value)} className={fieldCls} /></div>
              <div><label className={labelCls}>직급</label><input value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} className={fieldCls} /></div>
            </div>
          </div>

          <div className="rounded-xl border border-gray-100 p-4">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">세부내역 <span className="text-gray-400 font-normal">(단위: 원)</span></p>
            <table className="w-full text-sm">
              <thead><tr className="bg-gray-50 text-xs font-semibold text-gray-500">
                <th className="px-3 py-2 text-left w-16">구분</th>
                <th className="px-3 py-2 text-left w-1/4">지급 항목</th>
                <th className="px-3 py-2 text-right w-1/4">지급 금액</th>
                <th className="px-3 py-2 text-left w-1/4">공제 항목</th>
                <th className="px-3 py-2 text-right w-1/4">공제 금액</th>
              </tr></thead>
              <tbody className="divide-y divide-gray-50">
                {Array.from({ length: maxRows }).map((_, i) => {
                  const p = payRows[i];
                  const d = deductRows[i];
                  return (
                    <tr key={i}>
                      <td className="px-1 py-0.5 text-xs text-gray-400">{p && <input value={p.category} onChange={(e) => setPayRows((prev) => prev.map((r, idx) => idx === i ? {...r, category: e.target.value} : r))} className={inputCls} />}</td>
                      <td className="px-1 py-0.5">{p && <input value={p.item} onChange={(e) => setPayRows((prev) => prev.map((r, idx) => idx === i ? {...r, item: e.target.value} : r))} className={inputCls} placeholder="항목명" />}</td>
                      <td className="px-1 py-0.5">{p && <input value={p.amount} onChange={(e) => setPayRows((prev) => prev.map((r, idx) => idx === i ? {...r, amount: fmtAmt(e.target.value)} : r))} className={inputCls + " text-right"} placeholder="0" />}</td>
                      <td className="px-1 py-0.5">{d && <input value={d.item} onChange={(e) => setDeductRows((prev) => prev.map((r, idx) => idx === i ? {...r, item: e.target.value} : r))} className={inputCls} />}</td>
                      <td className="px-1 py-0.5">{d && <input value={d.amount} onChange={(e) => setDeductRows((prev) => prev.map((r, idx) => idx === i ? {...r, amount: fmtAmt(e.target.value)} : r))} className={inputCls + " text-right"} />}</td>
                    </tr>
                  );
                })}
                <tr className="bg-gray-50 font-semibold text-sm">
                  <td colSpan={2} className="px-3 py-2 text-gray-700">지급액계</td>
                  <td className="px-3 py-2 text-right">{totalPay.toLocaleString()}</td>
                  <td className="px-3 py-2 text-gray-700">공제액계</td>
                  <td className="px-3 py-2 text-right">{totalDeduct.toLocaleString()}</td>
                </tr>
                <tr className="font-bold text-sm">
                  <td colSpan={3}></td>
                  <td className="px-3 py-2 text-gray-700">실지급액</td>
                  <td className="px-3 py-2 text-right" style={{ color: "var(--accent)" }}>{netPay.toLocaleString()}</td>
                </tr>
              </tbody>
            </table>
            <div className="flex gap-2 mt-2">
              <button onClick={() => setPayRows((p) => [...p, { id: pid++, category: "", item: "", amount: "" }])} className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 px-2 py-1 rounded hover:bg-gray-50"><Plus size={11} /> 지급 행 추가</button>
              <button onClick={() => setDeductRows((p) => [...p, { id: did++, item: "", amount: "" }])} className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 px-2 py-1 rounded hover:bg-gray-50"><Plus size={11} /> 공제 행 추가</button>
            </div>
          </div>

          <div className="rounded-xl border border-gray-100 p-4">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">계산방법</p>
            <textarea value={calcNote} onChange={(e) => setCalcNote(e.target.value)} placeholder="산출식 또는 산출방법 입력..." rows={3} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none resize-none" />
          </div>
        </div>

        {/* ─── 출력 전용 ─── */}
        <div id="payslip-print">
          <div style={{ textAlign: "center", marginBottom: 14 }}>
            <h1 style={{ fontSize: 20, fontWeight: "bold", letterSpacing: 6, margin: 0 }}>급 여 명 세 서</h1>
            <p style={{ fontSize: 11, marginTop: 4, color: "#555" }}>{year}년 {month}월분</p>
          </div>

          {/* 기본정보 */}
          <table style={{ marginBottom: 12 }}>
            <tbody>
              <tr>
                <td className="head" style={{ width: 70 }}>회 사 명</td>
                <td style={{ width: "30%" }}>{company}</td>
                <td className="head" style={{ width: 60 }}>지 급 일</td>
                <td>{payDate}</td>
              </tr>
              <tr>
                <td className="head">성　　명</td>
                <td>{empName}</td>
                <td className="head">생년월일</td>
                <td>{birthNo}</td>
              </tr>
              <tr>
                <td className="head">부　　서</td>
                <td>{dept}</td>
                <td className="head">직　　급</td>
                <td>{jobTitle}</td>
              </tr>
            </tbody>
          </table>

          {/* 세부내역 */}
          <table>
            <thead>
              <tr>
                <th className="head" style={{ width: "7%" }}>구분</th>
                <th className="head" style={{ width: "25%" }}>지 급 항 목</th>
                <th className="head" style={{ width: "18%", textAlign: "right" }}>지 급 금 액</th>
                <th className="head" style={{ width: "25%" }}>공 제 항 목</th>
                <th className="head" style={{ width: "25%", textAlign: "right" }}>공 제 금 액</th>
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: maxRows }).map((_, i) => {
                const p = payRows[i];
                const d = deductRows[i];
                return (
                  <tr key={i}>
                    <td style={{ textAlign: "center", fontSize: 9, color: "#666" }}>{p?.category ?? ""}</td>
                    <td>{p?.item ?? ""}</td>
                    <td style={{ textAlign: "right" }}>{p?.amount ?? ""}</td>
                    <td>{d?.item ?? ""}</td>
                    <td style={{ textAlign: "right" }}>{d?.amount ?? ""}</td>
                  </tr>
                );
              })}
              <tr style={{ background: "#e8e8e8", fontWeight: "bold" }}>
                <td colSpan={2} style={{ textAlign: "center" }}>지 급 액 계</td>
                <td style={{ textAlign: "right" }}>{totalPay.toLocaleString()}</td>
                <td style={{ textAlign: "center" }}>공 제 액 계</td>
                <td style={{ textAlign: "right" }}>{totalDeduct.toLocaleString()}</td>
              </tr>
              <tr style={{ fontWeight: "bold" }}>
                <td colSpan={3}></td>
                <td style={{ textAlign: "center", background: "#e8e8e8" }}>실 지 급 액</td>
                <td style={{ textAlign: "right" }}>{netPay.toLocaleString()} 원</td>
              </tr>
            </tbody>
          </table>

          {calcNote && (
            <div style={{ marginTop: 10, padding: "6px 10px", border: "1px solid #ccc", fontSize: 10 }}>
              <strong>계산방법 :</strong> {calcNote}
            </div>
          )}

          <p style={{ textAlign: "center", marginTop: 24, fontSize: 11 }}>귀하의 노고에 감사드립니다.</p>
        </div>
      </div>
    </>
  );
}
