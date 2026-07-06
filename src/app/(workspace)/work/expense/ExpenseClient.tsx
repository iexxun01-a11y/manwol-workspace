"use client";

import { useState } from "react";
import { Plus, Trash2, Printer } from "lucide-react";

type Row = { id: number; desc: string; amount: string; note: string };
let nextId = 4;

export default function ExpenseClient({ userName }: { userName: string }) {
  const today = new Date();
  const fmt = (d: Date) => d.toISOString().split("T")[0];

  const [docNo, setDocNo] = useState("");
  const [draftDate, setDraftDate] = useState("");
  const [drafter, setDrafter] = useState("");
  const [expenseDate, setExpenseDate] = useState("");
  const [dept, setDept] = useState("");
  const [payMethod, setPayMethod] = useState("카드");
  const [rows, setRows] = useState<Row[]>([
    { id: 1, desc: "", amount: "", note: "" },
    { id: 2, desc: "", amount: "", note: "" },
    { id: 3, desc: "", amount: "", note: "" },
  ]);
  const [evidence, setEvidence] = useState({ receipt: false, card: false, other: false });
  const [writer, setWriter] = useState("");
  const [writeYear, setWriteYear] = useState(String(today.getFullYear()));
  const [writeMonth, setWriteMonth] = useState("");
  const [writeDay, setWriteDay] = useState("");

  const total = rows.reduce((s, r) => s + (parseInt(r.amount.replace(/,/g, "")) || 0), 0);

  function addRow() { setRows((prev) => [...prev, { id: nextId++, desc: "", amount: "", note: "" }]); }
  function removeRow(id: number) { setRows((prev) => prev.filter((r) => r.id !== id)); }
  function updateRow(id: number, field: keyof Row, value: string) { setRows((prev) => prev.map((r) => r.id === id ? { ...r, [field]: value } : r)); }
  function fmtAmount(v: string) { const n = v.replace(/[^\d]/g, ""); return n ? parseInt(n).toLocaleString() : ""; }

  const inputCls = "w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 bg-white";
  const labelCls = "block text-xs font-medium text-gray-500 mb-1";

  const evidenceStr = [
    evidence.receipt ? "[V] 영수증사본" : "[ ] 영수증사본",
    evidence.card    ? "[V] 카드내역서" : "[ ] 카드내역서",
    evidence.other   ? "[V] 기타 증빙자료" : "[ ] 기타 증빙자료",
  ].join("  ");

  return (
    <>
      <style>{`
        @media screen { #expense-print { position: absolute; left: -9999px; visibility: hidden; height: 0; overflow: hidden; } }
        @page { margin: 10mm 8mm; }
        @media print {
          * { overflow: visible !important; height: auto !important; max-height: none !important; }
          html, body { margin: 0 !important; }
          .no-print { display: none !important; }
          #expense-print { position: static; visibility: visible; }
          #expense-print { font-family: "Malgun Gothic", serif; font-size: 9pt; }
        }
        #expense-print table { border-collapse: collapse; width: 100%; }
        #expense-print td, #expense-print th { border: 1px solid #444; padding: 5px 8px; font-size: 10pt; }
        #expense-print .head { background: #e8e8e8; font-weight: bold; text-align: center; }
      `}</style>

      <div className="max-w-3xl">
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-6 no-print">
          <div>
            <h1 className="text-xl font-bold text-gray-900">지출결의서</h1>
            <p className="text-xs text-gray-400 mt-0.5">작성 후 출력/PDF 저장하세요</p>
          </div>
          <button onClick={() => window.print()} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white rounded-xl" style={{ backgroundColor: "var(--accent)" }}>
            <Printer size={14} /> 출력 / PDF 저장
          </button>
        </div>

        {/* 화면 입력 폼 */}
        <div className="no-print bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
          <div className="rounded-xl border border-gray-100 p-4 space-y-4">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">기본 정보</p>
            <div className="grid grid-cols-3 gap-4">
              <div><label className={labelCls}>문서번호</label><input value={docNo} onChange={(e) => setDocNo(e.target.value)} placeholder="직접 입력" className={inputCls} /></div>
              <div><label className={labelCls}>기안일자</label><input type="date" value={draftDate} onChange={(e) => setDraftDate(e.target.value)} className={inputCls} /></div>
              <div><label className={labelCls}>기안자</label><input value={drafter} onChange={(e) => setDrafter(e.target.value)} placeholder="성명" className={inputCls} /></div>
              <div><label className={labelCls}>지출일자</label><input type="date" value={expenseDate} onChange={(e) => setExpenseDate(e.target.value)} className={inputCls} /></div>
              <div><label className={labelCls}>소속</label><input value={dept} onChange={(e) => setDept(e.target.value)} placeholder="부서/소속" className={inputCls} /></div>
              <div><label className={labelCls}>결제수단</label>
                <select value={payMethod} onChange={(e) => setPayMethod(e.target.value)} className={inputCls}>
                  {["카드", "현금", "계좌이체", "기타"].map((v) => <option key={v}>{v}</option>)}
                </select>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-gray-100 p-4">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">지출 내역</p>
            <table className="w-full text-sm">
              <thead><tr className="bg-gray-50">
                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500 w-1/2">적요</th>
                <th className="px-3 py-2 text-right text-xs font-semibold text-gray-500 w-1/4">금액 (원)</th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500 w-1/4">비고</th>
                <th className="w-8"></th>
              </tr></thead>
              <tbody className="divide-y divide-gray-50">
                {rows.map((row) => (
                  <tr key={row.id} className="group">
                    <td className="px-1 py-1"><input value={row.desc} onChange={(e) => updateRow(row.id, "desc", e.target.value)} placeholder="적요" className="w-full px-2 py-1.5 text-sm rounded-lg focus:outline-none focus:bg-gray-50 bg-transparent" /></td>
                    <td className="px-1 py-1"><input value={row.amount} onChange={(e) => updateRow(row.id, "amount", fmtAmount(e.target.value))} placeholder="0" className="w-full px-2 py-1.5 text-sm rounded-lg focus:outline-none focus:bg-gray-50 bg-transparent text-right" /></td>
                    <td className="px-1 py-1"><input value={row.note} onChange={(e) => updateRow(row.id, "note", e.target.value)} placeholder="비고" className="w-full px-2 py-1.5 text-sm rounded-lg focus:outline-none focus:bg-gray-50 bg-transparent" /></td>
                    <td className="px-1 py-1"><button onClick={() => removeRow(row.id)} className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-600 p-1 rounded"><Trash2 size={13} /></button></td>
                  </tr>
                ))}
                <tr className="bg-gray-50 font-semibold">
                  <td className="px-3 py-2 text-sm text-gray-700">합 계</td>
                  <td className="px-3 py-2 text-sm text-right">{total.toLocaleString()} 원</td>
                  <td colSpan={2}></td>
                </tr>
              </tbody>
            </table>
            <button onClick={addRow} className="mt-3 flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-700 px-2 py-1 rounded-lg hover:bg-gray-50"><Plus size={13} /> 행 추가</button>
          </div>

          <div className="rounded-xl border border-gray-100 p-4">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">증빙자료</p>
            <div className="flex gap-6">
              {[{ key: "receipt", label: "영수증 사본" }, { key: "card", label: "카드내역서" }, { key: "other", label: "기타 증빙자료" }].map(({ key, label }) => (
                <label key={key} className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={evidence[key as keyof typeof evidence]} onChange={(e) => setEvidence((p) => ({ ...p, [key]: e.target.checked }))} className="w-4 h-4 rounded accent-violet-600" />
                  <span className="text-sm text-gray-700">{label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-gray-100 p-4">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">작성자 확인</p>
            <div className="grid grid-cols-4 gap-4">
              <div><label className={labelCls}>작성자</label><input value={writer} onChange={(e) => setWriter(e.target.value)} placeholder="성명" className={inputCls} /></div>
              <div><label className={labelCls}>년</label><input value={writeYear} onChange={(e) => setWriteYear(e.target.value)} className={inputCls} /></div>
              <div><label className={labelCls}>월</label><input value={writeMonth} onChange={(e) => setWriteMonth(e.target.value)} placeholder="　" className={inputCls} /></div>
              <div><label className={labelCls}>일</label><input value={writeDay} onChange={(e) => setWriteDay(e.target.value)} placeholder="　" className={inputCls} /></div>
            </div>
          </div>
        </div>

        {/* ─── 출력 전용 ─── */}
        <div id="expense-print">
          {/* 제목 + 결재란 */}
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 12 }}>
            <h1 style={{ fontSize: 22, fontWeight: "bold", letterSpacing: 6, margin: 0 }}>지 출 결 의 서</h1>
            {/* 결재란 */}
            <table style={{ width: 180, borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  {["입 안", "심 사", "결 재"].map((h) => (
                    <th key={h} style={{ border: "1px solid #444", padding: "3px 6px", fontSize: 9, textAlign: "center", background: "#e8e8e8", width: 60 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr>
                  {[0,1,2].map((i) => <td key={i} style={{ border: "1px solid #444", height: 36 }} />)}
                </tr>
                <tr>
                  <td colSpan={3} style={{ border: "1px solid #444", padding: "2px 6px", fontSize: 9, textAlign: "center", background: "#e8e8e8" }}>결 재</td>
                </tr>
              </tbody>
            </table>
          </div>

          <p style={{ textAlign: "center", fontSize: 11, marginBottom: 12 }}>
            아래와 같이 지출결의서를 제출하오니 승인하여 주시기 바랍니다.
          </p>

          {/* 기본정보 */}
          <table style={{ marginBottom: 12 }}>
            <tbody>
              <tr>
                <td className="head" style={{ width: 70 }}>문서번호</td>
                <td style={{ width: "30%" }}>{docNo}</td>
                <td className="head" style={{ width: 60 }}></td>
                <td></td>
              </tr>
              <tr>
                <td className="head">기안일자</td>
                <td>{draftDate}</td>
                <td className="head">기안자</td>
                <td>{drafter}</td>
              </tr>
              <tr>
                <td className="head">지출일자</td>
                <td>{expenseDate}</td>
                <td className="head">소속</td>
                <td>{dept}</td>
              </tr>
              <tr>
                <td className="head">지출금액</td>
                <td>{total.toLocaleString()} 원</td>
                <td className="head">결제수단</td>
                <td>{payMethod}</td>
              </tr>
            </tbody>
          </table>

          {/* 지출내역 */}
          <table style={{ marginBottom: 10 }}>
            <thead>
              <tr>
                <td colSpan={4} className="head" style={{ textAlign: "center" }}>내 　 역</td>
              </tr>
              <tr>
                <th className="head" style={{ width: "5%" }}>No.</th>
                <th className="head" style={{ width: "50%" }}>적　　요</th>
                <th className="head" style={{ width: "25%", textAlign: "right" }}>금　액</th>
                <th className="head" style={{ width: "20%" }}>비　고</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr key={row.id}>
                  <td style={{ textAlign: "center" }}>{i + 1}</td>
                  <td>{row.desc}</td>
                  <td style={{ textAlign: "right" }}>{row.amount}</td>
                  <td>{row.note}</td>
                </tr>
              ))}
              <tr style={{ background: "#e8e8e8", fontWeight: "bold" }}>
                <td colSpan={2} style={{ textAlign: "center" }}>합　　계</td>
                <td style={{ textAlign: "right" }}>{total.toLocaleString()}</td>
                <td></td>
              </tr>
            </tbody>
          </table>

          <p style={{ fontSize: 10, marginBottom: 6 }}>
            증빙자료 : {evidenceStr}
          </p>

          <div style={{ textAlign: "right", marginTop: 20 }}>
            <p style={{ fontSize: 11 }}>위 금액을 명수(청구) 합니다.</p>
            <p style={{ marginTop: 16 }}>{writeYear}년 &nbsp; {writeMonth || "　　"}월 &nbsp; {writeDay || "　　"}일</p>
            <p style={{ marginTop: 8 }}>작 성 자 &nbsp;&nbsp; {writer} &nbsp;&nbsp; (인)</p>
          </div>
        </div>
      </div>
    </>
  );
}
