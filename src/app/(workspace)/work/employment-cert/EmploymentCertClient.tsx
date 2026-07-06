"use client";

import { useState } from "react";
import { Printer } from "lucide-react";

export default function EmploymentCertClient() {
  const today = new Date();
  const fmt = (d: Date) => d.toISOString().split("T")[0];
  const autoDocNo = `${today.getFullYear()}${String(today.getMonth()+1).padStart(2,"0")}${String(today.getDate()).padStart(2,"0")}-001`;

  // 모든 필드 공란
  const [docNo, setDocNo] = useState(autoDocNo);
  const [issueDate, setIssueDate] = useState(fmt(today));
  const [purpose, setPurpose] = useState("");
  const [address, setAddress] = useState("");
  const [name, setName] = useState("");
  const [ssn, setSsn] = useState("");
  const [company, setCompany] = useState("주식회사 만월연회");
  const [companyAddr, setCompanyAddr] = useState("");
  const [dept, setDept] = useState("");
  const [position, setPosition] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("현재까지");
  const [ceo, setCeo] = useState("");

  const inputCls = "w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 bg-white";
  const labelCls = "block text-xs font-medium text-gray-500 mb-1";

  const issueDateFmt = issueDate
    ? `${issueDate.slice(0,4)}년 ${parseInt(issueDate.slice(5,7))}월 ${parseInt(issueDate.slice(8,10))}일`
    : "";
  const startDateFmt = startDate
    ? `${startDate.slice(0,4)}. ${parseInt(startDate.slice(5,7))}. ${parseInt(startDate.slice(8,10))}.`
    : "　　　.　　.　　.";

  return (
    <>
      <style>{`
        @media screen { #cert-print { position: absolute; left: -9999px; visibility: hidden; height: 0; overflow: hidden; } }
        @page { margin: 10mm 8mm; }
        @media print {
          * { overflow: visible !important; height: auto !important; max-height: none !important; }
          html, body { margin: 0 !important; }
          .no-print { display: none !important; }
          #cert-print { position: static; visibility: visible; }
          #cert-print { font-family: "Malgun Gothic", serif; font-size: 9.5pt; }
        }
        #cert-print table { border-collapse: collapse; width: 100%; }
        #cert-print td, #cert-print th { border: 1px solid #555; padding: 6px 10px; font-size: 10.5pt; }
        #cert-print .th { background: #f0f0f0; font-weight: bold; text-align: center; white-space: nowrap; }
        #cert-print .sec { font-weight: bold; font-size: 12pt; border-bottom: 2px solid #c8963c; padding: 4px 0 2px 2px; margin: 16px 0 0 0; color: #c8963c; }
      `}</style>

      <div className="max-w-3xl">
        {/* 화면 헤더 */}
        <div className="no-print">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-xl font-bold text-gray-900">재직증명서</h1>
              <p className="text-xs text-gray-400 mt-0.5">작성 후 출력/PDF 저장하세요</p>
            </div>
            <button onClick={() => window.print()} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white rounded-xl" style={{ backgroundColor: "var(--accent)" }}>
              <Printer size={14} /> 출력 / PDF 저장
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
            <div className="rounded-xl border border-gray-100 p-4 space-y-4">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">문서 정보</p>
              <div className="grid grid-cols-3 gap-4">
                <div><label className={labelCls}>문서번호</label><input value={docNo} onChange={(e) => setDocNo(e.target.value)} className={inputCls} /></div>
                <div><label className={labelCls}>발급일</label><input type="date" value={issueDate} onChange={(e) => setIssueDate(e.target.value)} className={inputCls} /></div>
                <div><label className={labelCls}>용도</label><input value={purpose} onChange={(e) => setPurpose(e.target.value)} placeholder="예: 제출용" className={inputCls} /></div>
              </div>
            </div>
            <div className="rounded-xl border border-gray-100 p-4 space-y-4">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">인적사항</p>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2"><label className={labelCls}>주소</label><input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="주소 입력" className={inputCls} /></div>
                <div><label className={labelCls}>성명</label><input value={name} onChange={(e) => setName(e.target.value)} className={inputCls} /></div>
                <div><label className={labelCls}>주민등록번호</label><input value={ssn} onChange={(e) => setSsn(e.target.value)} placeholder="000000-0000000" className={inputCls} /></div>
              </div>
            </div>
            <div className="rounded-xl border border-gray-100 p-4 space-y-4">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">재직사항</p>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2"><label className={labelCls}>회사명</label><input value={company} onChange={(e) => setCompany(e.target.value)} className={inputCls} /></div>
                <div><label className={labelCls}>소재지</label><input value={companyAddr} onChange={(e) => setCompanyAddr(e.target.value)} className={inputCls} /></div>
                <div><label className={labelCls}>소속</label><input value={dept} onChange={(e) => setDept(e.target.value)} className={inputCls} /></div>
                <div><label className={labelCls}>직급</label><input value={position} onChange={(e) => setPosition(e.target.value)} className={inputCls} /></div>
                <div></div>
                <div><label className={labelCls}>재직기간 시작</label><input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className={inputCls} /></div>
                <div><label className={labelCls}>재직기간 종료</label><input value={endDate} onChange={(e) => setEndDate(e.target.value)} className={inputCls} /></div>
              </div>
            </div>
            <div className="rounded-xl border border-gray-100 p-4">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">발급기관</p>
              <div className="w-48"><label className={labelCls}>대표이사</label><input value={ceo} onChange={(e) => setCeo(e.target.value)} className={inputCls} /></div>
            </div>
          </div>
        </div>

        {/* ─── 출력 전용 ─── */}
        <div id="cert-print">
          {/* 제목 */}
          <div style={{ textAlign: "center", marginBottom: 20 }}>
            <h1 style={{ fontSize: 26, fontWeight: "bold", letterSpacing: 10, margin: 0 }}>재 직 증 명 서</h1>
          </div>

          <p style={{ fontSize: 10, color: "#777", marginBottom: 6 }}>문서번호 {docNo}</p>

          {/* 1. 인적사항 */}
          <p className="sec">1. 인적사항</p>
          <table style={{ marginTop: 6, marginBottom: 0 }}>
            <tbody>
              <tr>
                <td className="th" style={{ width: 80 }}>주　　소</td>
                <td colSpan={3}>{address}</td>
              </tr>
              <tr>
                <td className="th">성　　명</td>
                <td style={{ width: "30%" }}>{name}</td>
                <td className="th" style={{ width: 90 }}>주민등록번호</td>
                <td>{ssn}</td>
              </tr>
            </tbody>
          </table>

          {/* 2. 재직사항 */}
          <p className="sec">2. 재직사항</p>
          <table style={{ marginTop: 6, marginBottom: 20 }}>
            <tbody>
              <tr>
                <td className="th" style={{ width: 80 }}>회 사 명</td>
                <td colSpan={3}>{company}</td>
              </tr>
              <tr>
                <td className="th">소 재 지</td>
                <td colSpan={3}>{companyAddr}</td>
              </tr>
              <tr>
                <td className="th">소　　속</td>
                <td style={{ width: "30%" }}>{dept}</td>
                <td className="th" style={{ width: 60 }}>직　급</td>
                <td>{position}</td>
              </tr>
              <tr>
                <td className="th">재직기간</td>
                <td colSpan={3}>{startDateFmt} ~ {endDate}</td>
              </tr>
            </tbody>
          </table>

          {/* 증명 문구 */}
          <p style={{ textAlign: "center", fontSize: 11, marginBottom: 24 }}>
            상기인은 {issueDateFmt} 당사 (㈜{company.replace("주식회사 ", "")})에 현재 재직 중에 있음을 증명합니다.
          </p>

          <div style={{ textAlign: "center" }}>
            <p style={{ fontSize: 11 }}>용　도 : <u style={{ paddingLeft: 8, paddingRight: 40 }}>{purpose}</u></p>
            <p style={{ fontSize: 11, marginTop: 10 }}>{issueDateFmt}</p>
          </div>

          <div style={{ textAlign: "center", marginTop: 40 }}>
            <p style={{ fontSize: 14, fontWeight: "bold" }}>{company}</p>
            <p style={{ fontSize: 13, marginTop: 10 }}>대 표 이 사 &nbsp;&nbsp;&nbsp; {ceo} &nbsp;&nbsp; (인)</p>
          </div>
        </div>
      </div>
    </>
  );
}
