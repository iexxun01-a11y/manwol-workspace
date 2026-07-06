"use client";

import { useState } from "react";
import { Printer } from "lucide-react";
import { cn } from "@/lib/utils";

type Tab = "regular" | "intern";
type DeductMethod = "3.3" | "4대보험";

export default function ContractClient() {
  const [tab, setTab] = useState<Tab>("regular");
  const today = new Date();

  // 모든 필드 공란
  const [company, setCompany] = useState("주식회사 만월연회");
  const [workerName, setWorkerName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [workplace, setWorkplace] = useState("");
  const [jobDesc, setJobDesc] = useState("");
  const [workStart, setWorkStart] = useState("");
  const [workEnd, setWorkEnd] = useState("");
  const [dailyHours, setDailyHours] = useState("");
  const [weeklyHours, setWeeklyHours] = useState("");
  const [breakStart, setBreakStart] = useState("");
  const [breakEnd, setBreakEnd] = useState("");
  const [workDays, setWorkDays] = useState("");
  const [salary, setSalary] = useState("");
  const [meal, setMeal] = useState("");
  const [payDay, setPayDay] = useState("");
  const [payMethod, setPayMethod] = useState("");
  // 정규직 사회보험
  const [insurance, setInsurance] = useState({ employment: false, industrial: false, pension: false, health: false });
  const [contractYear, setContractYear] = useState(String(today.getFullYear()));
  const [contractMonth, setContractMonth] = useState("");
  const [contractDay, setContractDay] = useState("");
  const [ceo, setCeo] = useState("");
  const [bizNo, setBizNo] = useState("");
  const [workerPhone, setWorkerPhone] = useState("");
  const [workerSsn, setWorkerSsn] = useState("");

  // 수습 전용
  const [internStart, setInternStart] = useState("");
  const [internEnd, setInternEnd] = useState("");
  const [salaryRate, setSalaryRate] = useState("");
  // 수습은 공제방식 하나로만 — 4대보험 vs 3.3%
  const [deductMethod, setDeductMethod] = useState<DeductMethod>("3.3");

  const inputCls = "w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 bg-white";
  const labelCls = "block text-xs font-medium text-gray-500 mb-1";

  const dateFmt = (s: string) => {
    if (!s) return "　　　년　　월　　일";
    return `${s.slice(0,4)}년 ${parseInt(s.slice(5,7))}월 ${parseInt(s.slice(8,10))}일`;
  };
  const startDateShort = startDate
    ? `${startDate.slice(0,4)} 년   ${parseInt(startDate.slice(5,7))}월  ${parseInt(startDate.slice(8,10))}일부터`
    : "　　년　　월　　일부터";

  const insuranceCheck = (k: keyof typeof insurance) => insurance[k] ? "☑" : "☐";

  // 수습일 때 사회보험 출력용
  const internInsuranceLine = deductMethod === "4대보험"
    ? `${insuranceCheck("employment")} 고용보험  ${insuranceCheck("industrial")} 산재보험  ${insuranceCheck("pension")} 국민연금  ${insuranceCheck("health")} 건강보험`
    : "적용 제외 (3.3% 기타소득세 공제 적용)";

  return (
    <>
      <style>{`
        @media screen { #contract-print-area { position: absolute; left: -9999px; visibility: hidden; height: 0; overflow: hidden; } }
        @page { margin: 10mm 8mm; }
        @media print {
          * { overflow: visible !important; height: auto !important; max-height: none !important; }
          html, body { margin: 0 !important; }
          .no-print { display: none !important; }
          #contract-print-area { position: static; visibility: visible; }
          #contract-print-area { font-family: "Malgun Gothic", "맑은 고딕", serif; font-size: 9pt; line-height: 1.45; }
        }
        #contract-print-area table { border-collapse: collapse; width: 100%; margin-bottom: 6px; }
        #contract-print-area td, #contract-print-area th { border: 1px solid #444; padding: 5px 8px; vertical-align: top; }
        #contract-print-area .art { font-weight: bold; background: #e0e0e0; text-align: center; width: 130px; }
        #contract-print-area .hl { background: #fffb80; }
        #contract-print-area p { margin: 2px 0; }
      `}</style>

      <div className="max-w-3xl">
        {/* 화면 헤더 */}
        <div className="flex items-center justify-between mb-6 no-print">
          <div>
            <h1 className="text-xl font-bold text-gray-900">근로계약서</h1>
            <p className="text-xs text-gray-400 mt-0.5">작성 후 출력/PDF 저장하세요</p>
          </div>
          <button onClick={() => window.print()} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white rounded-xl" style={{ backgroundColor: "var(--accent)" }}>
            <Printer size={14} /> 출력 / PDF 저장
          </button>
        </div>

        {/* 탭 */}
        <div className="flex gap-1 p-1 bg-gray-100 rounded-xl mb-5 no-print w-fit">
          {([["regular", "📄 정규직"], ["intern", "📋 수습·계약직"]] as [Tab, string][]).map(([t, label]) => (
            <button key={t} onClick={() => setTab(t)} className={cn("px-5 py-2 text-sm font-medium rounded-lg transition-all", tab === t ? "bg-white shadow-sm text-gray-900" : "text-gray-500 hover:text-gray-700")}>
              {label}
            </button>
          ))}
        </div>

        {/* 화면 입력 폼 */}
        <div className="no-print bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
          {tab === "intern" && (
            <div className="rounded-xl border border-purple-100 bg-purple-50/50 p-4 space-y-4">
              <p className="text-xs font-semibold text-purple-600 uppercase tracking-wider">수습 조건</p>
              <div className="grid grid-cols-2 gap-4">
                <div><label className={labelCls}>수습기간 시작일</label><input type="date" value={internStart} onChange={(e) => setInternStart(e.target.value)} className={inputCls} /></div>
                <div><label className={labelCls}>수습기간 종료일</label><input type="date" value={internEnd} onChange={(e) => setInternEnd(e.target.value)} className={inputCls} /></div>
                <div><label className={labelCls}>급여 지급률 (%)</label><input value={salaryRate} onChange={(e) => setSalaryRate(e.target.value)} placeholder="예: 80" className={inputCls} /></div>
                <div>
                  <label className={labelCls}>공제·보험 적용 방식</label>
                  <div className="flex gap-3 mt-1">
                    {([["3.3", "3.3% 공제 (계약직/프리랜서)"], ["4대보험", "4대보험 적용"]] as [DeductMethod, string][]).map(([v, l]) => (
                      <label key={v} className="flex items-center gap-1.5 cursor-pointer">
                        <input type="radio" name="deduct" value={v} checked={deductMethod === v} onChange={() => setDeductMethod(v)} className="accent-violet-600" />
                        <span className="text-sm text-gray-700">{l}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
              {/* 4대보험 선택 시 체크박스 */}
              {deductMethod === "4대보험" && (
                <div className="flex gap-5 pt-1">
                  {[["employment","고용보험"],["industrial","산재보험"],["pension","국민연금"],["health","건강보험"]].map(([k,l]) => (
                    <label key={k} className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={insurance[k as keyof typeof insurance]} onChange={(e) => setInsurance((p) => ({...p,[k]:e.target.checked}))} className="w-4 h-4 rounded accent-violet-600" />
                      <span className="text-sm text-gray-700">{l}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="rounded-xl border border-gray-100 p-4 space-y-4">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">당사자 정보</p>
            <div className="grid grid-cols-2 gap-4">
              <div><label className={labelCls}>사업주 (회사명)</label><input value={company} onChange={(e) => setCompany(e.target.value)} className={inputCls} /></div>
              <div><label className={labelCls}>근로자 성명</label><input value={workerName} onChange={(e) => setWorkerName(e.target.value)} placeholder="성명" className={inputCls} /></div>
              <div><label className={labelCls}>사업자번호</label><input value={bizNo} onChange={(e) => setBizNo(e.target.value)} placeholder="000-00-00000" className={inputCls} /></div>
              <div><label className={labelCls}>대표자</label><input value={ceo} onChange={(e) => setCeo(e.target.value)} placeholder="대표자 성명" className={inputCls} /></div>
              <div><label className={labelCls}>근로자 주민번호</label><input value={workerSsn} onChange={(e) => setWorkerSsn(e.target.value)} placeholder="000000-0000000" className={inputCls} /></div>
              <div><label className={labelCls}>근로자 연락처</label><input value={workerPhone} onChange={(e) => setWorkerPhone(e.target.value)} placeholder="010-0000-0000" className={inputCls} /></div>
            </div>
          </div>

          <div className="rounded-xl border border-gray-100 p-4 space-y-4">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">근무 조건</p>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2"><label className={labelCls}>근로개시일</label><input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className={inputCls} /></div>
              <div className="col-span-2"><label className={labelCls}>근무장소</label><input value={workplace} onChange={(e) => setWorkplace(e.target.value)} placeholder="근무지 주소 또는 설명" className={inputCls} /></div>
              <div className="col-span-2"><label className={labelCls}>업무내용</label><input value={jobDesc} onChange={(e) => setJobDesc(e.target.value)} placeholder="직무 내용" className={inputCls} /></div>
              <div><label className={labelCls}>근무 시작 시간</label><input type="time" value={workStart} onChange={(e) => setWorkStart(e.target.value)} className={inputCls} /></div>
              <div><label className={labelCls}>근무 종료 시간</label><input type="time" value={workEnd} onChange={(e) => setWorkEnd(e.target.value)} className={inputCls} /></div>
              <div><label className={labelCls}>1일 근무시간 (시간)</label><input value={dailyHours} onChange={(e) => setDailyHours(e.target.value)} placeholder="예: 8" className={inputCls} /></div>
              <div><label className={labelCls}>주 근무시간 (시간)</label><input value={weeklyHours} onChange={(e) => setWeeklyHours(e.target.value)} placeholder="예: 40" className={inputCls} /></div>
              <div><label className={labelCls}>휴게 시작</label><input type="time" value={breakStart} onChange={(e) => setBreakStart(e.target.value)} className={inputCls} /></div>
              <div><label className={labelCls}>휴게 종료</label><input type="time" value={breakEnd} onChange={(e) => setBreakEnd(e.target.value)} className={inputCls} /></div>
              <div className="col-span-2"><label className={labelCls}>근무일 / 휴일</label><input value={workDays} onChange={(e) => setWorkDays(e.target.value)} placeholder="예: 매주 월~금 / 주휴일, 법정공휴일" className={inputCls} /></div>
            </div>
          </div>

          <div className="rounded-xl border border-gray-100 p-4 space-y-4">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">임금</p>
            <div className="grid grid-cols-2 gap-4">
              <div><label className={labelCls}>연봉 (원)</label><input value={salary} onChange={(e) => setSalary(e.target.value)} placeholder="예: 24,000,000" className={inputCls} /></div>
              <div><label className={labelCls}>식대 (월, 원)</label><input value={meal} onChange={(e) => setMeal(e.target.value)} placeholder="예: 200,000" className={inputCls} /></div>
              <div><label className={labelCls}>임금 지급일</label><input value={payDay} onChange={(e) => setPayDay(e.target.value)} placeholder="예: 매월 10일" className={inputCls} /></div>
              <div><label className={labelCls}>지급 방법</label><input value={payMethod} onChange={(e) => setPayMethod(e.target.value)} placeholder="예: 근로자 명의 예금통장" className={inputCls} /></div>
            </div>
          </div>

          {tab === "regular" && (
            <div className="rounded-xl border border-gray-100 p-4">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">사회보험</p>
              <div className="flex gap-6">
                {[["employment","고용보험"],["industrial","산재보험"],["pension","국민연금"],["health","건강보험"]].map(([k,l]) => (
                  <label key={k} className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={insurance[k as keyof typeof insurance]} onChange={(e) => setInsurance((p) => ({...p,[k]:e.target.checked}))} className="w-4 h-4 rounded accent-violet-600" />
                    <span className="text-sm text-gray-700">{l}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          <div className="rounded-xl border border-gray-100 p-4 space-y-4">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">계약 날짜</p>
            <div className="grid grid-cols-3 gap-4">
              <div><label className={labelCls}>계약 연도</label><input value={contractYear} onChange={(e) => setContractYear(e.target.value)} className={inputCls} /></div>
              <div><label className={labelCls}>월</label><input value={contractMonth} onChange={(e) => setContractMonth(e.target.value)} placeholder="　" className={inputCls} /></div>
              <div><label className={labelCls}>일</label><input value={contractDay} onChange={(e) => setContractDay(e.target.value)} placeholder="　" className={inputCls} /></div>
            </div>
          </div>
        </div>

        {/* ─── 출력 전용 (화면에서 숨김, 인쇄 시 표시) ─── */}
        <div id="contract-print-area">
          <div style={{ textAlign: "center", marginBottom: 14 }}>
            <div style={{ fontSize: 9, color: "#666", marginBottom: 2 }}>( 기간의 정함이 없는 경우 )</div>
            <div style={{ fontSize: 20, fontWeight: "bold", letterSpacing: 4 }}>표 준 근 로 계 약 서</div>
          </div>

          <p style={{ marginBottom: 10, lineHeight: 1.8 }}>
            ㈜ {company.replace("주식회사 ", "")} (이하 "사업주"라 함)과(와) &nbsp;
            <u style={{ paddingLeft: 60, paddingRight: 4 }}>{workerName}</u>&nbsp;
            (이하 "근로자"라 함)은 다음과 같이 근로계약을 체결한다.
          </p>

          {/* 수습 조건 */}
          {tab === "intern" && (
            <table style={{ marginBottom: 10 }}>
              <tbody>
                <tr>
                  <td className="art" style={{ width: 80 }}>수습기간</td>
                  <td className="hl">{dateFmt(internStart)} ~ {dateFmt(internEnd)}</td>
                  <td className="art" style={{ width: 60 }}>지급률</td>
                  <td className="hl">정규직 대비 {salaryRate}%</td>
                </tr>
                <tr>
                  <td className="art">공제방식</td>
                  <td className="hl" colSpan={3}>
                    {deductMethod === "3.3" ? "3.3% 기타소득세 공제 (계약직/프리랜서 기준)" : "4대보험 공제 적용"}
                  </td>
                </tr>
              </tbody>
            </table>
          )}

          <table>
            <tbody>
              <tr>
                <td className="art">제1조 근로개시일</td>
                <td>{startDateShort}</td>
              </tr>
              <tr>
                <td className="art">제2조 근무장소</td>
                <td>{workplace}</td>
              </tr>
              <tr>
                <td className="art">제3조 업무의 내용</td>
                <td>{jobDesc}</td>
              </tr>
              <tr>
                <td className="art">제4조 소정근로시간</td>
                <td>
                  <p>1. {workStart || "　　"} 부터 {workEnd || "　　"} 까지 (1일 {dailyHours || "　"}시간, 주 {weeklyHours || "　"}시간)</p>
                  <p style={{ paddingLeft: 14, color: "#555" }}>(회사의 업무상 필요 시, 사전 통보 후 연장근로 가능)</p>
                  <p>2. 휴게시간 {breakStart || "　　"} ~ {breakEnd || "　　"} (1시간)</p>
                </td>
              </tr>
              <tr>
                <td className="art">제5조 근무일/휴일</td>
                <td>{workDays}</td>
              </tr>
              <tr>
                <td className="art">제6조 임　　금</td>
                <td>
                  <p>1. 연　　봉 : {salary}원 {meal ? `(식대 월 ${meal}원 포함)` : ""}</p>
                  <p>2. 상여금 등 : 내부 취업규칙에 따름</p>
                  <p>3. 임금지급일 : {payDay}</p>
                  <p>4. 지 급 방 법 : {payMethod}</p>
                  <p>5. 기타급여(제수당 등) : 근로자의 연장/야간/휴일근로수당은 모두 포함하여 월 급여에 포함하는 것으로 한다. 다만 실제 근무시간에 따라 법정최저임금에 미달하는 경우에는 관련 법령에 따라 정산 및 지급한다.</p>
                </td>
              </tr>
              <tr>
                <td className="art">제7조 연차유급휴가</td>
                <td>연차유급휴가는 근속기간 1년 경과 시, 근로기준법에서 정하는 바에 따라 부여한다.</td>
              </tr>
              <tr>
                <td className="art">제8조 사회보험 적용여부</td>
                <td>
                  {tab === "regular"
                    ? `해당란에 v 체크  ${insuranceCheck("employment")} 고용보험   ${insuranceCheck("industrial")} 산재보험   ${insuranceCheck("pension")} 국민연금   ${insuranceCheck("health")} 건강보험`
                    : internInsuranceLine
                  }
                </td>
              </tr>
              <tr>
                <td className="art">제9조 근로계약서 교부</td>
                <td>사업주는 근로계약을 체결함과 동시에 본 계약서를 사본하여 근로자의 교부 요구와 관계없이 근로자에게 교부한다. (근로기준법 제17조 이행)</td>
              </tr>
              <tr>
                <td className="art">제10조 비밀유지 및 겸직금지</td>
                <td>근로자는 회사의 영업비밀 및 인사, 재무, 운영 관련 정보를 외부에 유출해서는 안되며, 회사의 사전 승인 없이 겸직이나 부업을 수행할 수 없다.</td>
              </tr>
              <tr>
                <td className="art">제11조 근로계약·취업규칙 등의 성실한 이행의무</td>
                <td>사업주와 근로자는 각자가 근로계약, 취업규칙, 단체협약을 지키고 성실하게 이행하여야 한다.</td>
              </tr>
              <tr>
                <td className="art">제12조 근로자의 의무</td>
                <td>
                  <p>1. 근로자는 업무수행 상 착오, 과오 등이 발생하는 경우 즉시 상사에게 보고하여야 하며, 그의 지시를 받아 필요한 조치를 하여야 한다.</p>
                  <p>2. 근로자는 본인 또는 타인의 급여나 연봉을 제3자에게 누설하지 않는다.</p>
                  <p>3. 근로자가 고의 또는 중대한 과실로 사업주에게 손해를 끼쳤을 때, 근로자는 이를 배상하여야 한다.</p>
                  <p>4. 중도 퇴직 시 최소한 사업주에게 1개월 전에 사전 통보하고 퇴직승인을 득한 후에 퇴사 시점까지의 업무를 마감하여 신입자와 인수인계한다.</p>
                </td>
              </tr>
              <tr>
                <td className="art">제13조 기　　타</td>
                <td>
                  <p>1. 이 계약에 정함이 없는 사항은 근로기준법령에 의함.</p>
                  <p>2. 이 계약에 포함되지 아니한 내용 중 필요사항은 별도의 합의 후 첨부문서로 갈음하기로 한다.</p>
                  <p>3. 별도 합의한 내용과 본 계약이 상충하는 경우, 별도합의를 우선으로 한다.</p>
                </td>
              </tr>
            </tbody>
          </table>

          <p style={{ fontSize: 9, color: "#555", textAlign: "center", marginTop: 8, marginBottom: 6 }}>
            본 계약의 서명은 전자서명으로 대체할 수 있으며 해당 서명은 자필 서명과 동일한 효력을 가진다.
          </p>
          <p style={{ textAlign: "center", marginBottom: 10 }}>
            {contractYear}년 &nbsp; {contractMonth || "　　"}월 &nbsp; {contractDay || "　　"}일
          </p>

          <table>
            <tbody>
              <tr>
                <td style={{ width: "50%", padding: "10px 14px" }}>
                  <p style={{ fontWeight: "bold", marginBottom: 5 }}>사업주 (갑)</p>
                  <p>회사명 : {company}</p>
                  <p>사업자번호 : {bizNo}</p>
                  <p>대표자 : <u style={{ paddingLeft: 60, paddingRight: 8 }}>{ceo}</u> (인)</p>
                </td>
                <td style={{ width: "50%", padding: "10px 14px" }}>
                  <p style={{ fontWeight: "bold", marginBottom: 5 }}>근로자 (을)</p>
                  <p>성　　명 : <u style={{ paddingLeft: 60, paddingRight: 8 }}>{workerName}</u> (인)</p>
                  <p>주민번호 : {workerSsn}</p>
                  <p>연 락 처 : {workerPhone}</p>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
