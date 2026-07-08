"use client";

import { useState } from "react";
import { UserPlus, UserX, UserCheck, ChevronDown, X } from "lucide-react";
import { cn } from "@/lib/utils";

type User = {
  id: string;
  email: string;
  name: string;
  role: "OWNER" | "MANAGER" | "MEMBER";
  position: string | null;
  status: "INVITED" | "ACTIVE" | "INACTIVE";
  createdAt: string;
  firstLoginAt: string | null;
};

const ROLE_LABEL = { OWNER: "대표", MANAGER: "관리자", MEMBER: "직원" };
const STATUS_LABEL = { INVITED: "초대됨", ACTIVE: "재직중", INACTIVE: "퇴사" };
const STATUS_COLOR = {
  INVITED: "bg-yellow-100 text-yellow-700",
  ACTIVE: "bg-green-100 text-green-700",
  INACTIVE: "bg-gray-100 text-gray-500",
};

export default function UsersClient({ initialUsers, currentUserId }: { initialUsers: User[]; currentUserId: string }) {
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [showInvite, setShowInvite] = useState(false);
  const [form, setForm] = useState({ email: "", name: "", role: "MEMBER", position: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function invite() {
    if (!form.email || !form.name) { setError("이메일과 이름은 필수입니다"); return; }
    setLoading(true); setError("");
    const res = await fetch("/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (!res.ok) { setError(data.error ?? "오류가 발생했습니다"); setLoading(false); return; }
    setUsers((p) => [...p, data]);
    setForm({ email: "", name: "", role: "MEMBER", position: "" });
    setShowInvite(false);
    setLoading(false);
  }

  async function updateUser(id: string, patch: Partial<User>) {
    const res = await fetch(`/api/users/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    if (res.ok) {
      const updated = await res.json();
      setUsers((p) => p.map((u) => u.id === id ? { ...u, ...updated } : u));
    }
  }

  const inputCls = "w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 bg-white";

  return (
    <div className="max-w-4xl space-y-5">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">직원 관리</h1>
          <p className="text-xs text-gray-400 mt-0.5">총 {users.filter(u => u.status !== "INACTIVE").length}명 재직 중</p>
        </div>
        <button onClick={() => setShowInvite(true)}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white rounded-xl"
          style={{ backgroundColor: "var(--accent)" }}>
          <UserPlus size={14} /> 직원 초대
        </button>
      </div>

      {/* 초대 모달 */}
      {showInvite && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-bold text-gray-900">새 직원 초대</h2>
              <button onClick={() => { setShowInvite(false); setError(""); }} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">이메일 *</label>
                <input value={form.email} onChange={(e) => setForm(p => ({ ...p, email: e.target.value }))} placeholder="직원 이메일" className={inputCls} />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">이름 *</label>
                <input value={form.name} onChange={(e) => setForm(p => ({ ...p, name: e.target.value }))} placeholder="이름" className={inputCls} />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">직급</label>
                <input value={form.position} onChange={(e) => setForm(p => ({ ...p, position: e.target.value }))} placeholder="예: 매니저, 홀직원" className={inputCls} />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">권한</label>
                <select value={form.role} onChange={(e) => setForm(p => ({ ...p, role: e.target.value }))} className={inputCls}>
                  <option value="MEMBER">직원</option>
                  <option value="MANAGER">관리자</option>
                </select>
              </div>
              {error && <p className="text-xs text-red-500">{error}</p>}
            </div>
            <div className="flex gap-2 mt-5">
              <button onClick={() => { setShowInvite(false); setError(""); }} className="flex-1 px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50">취소</button>
              <button onClick={invite} disabled={loading}
                className="flex-1 px-4 py-2 text-sm font-medium text-white rounded-xl disabled:opacity-50"
                style={{ backgroundColor: "var(--accent)" }}>
                {loading ? "처리 중..." : "초대하기"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 직원 목록 */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 text-xs font-semibold text-gray-500">
              <th className="px-5 py-3 text-left">이름</th>
              <th className="px-5 py-3 text-left">이메일</th>
              <th className="px-5 py-3 text-left">직급</th>
              <th className="px-5 py-3 text-left">권한</th>
              <th className="px-5 py-3 text-left">상태</th>
              <th className="px-5 py-3 text-left">가입일</th>
              <th className="px-5 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {users.map((u) => (
              <tr key={u.id} className={cn("hover:bg-gray-50 transition-colors", u.status === "INACTIVE" && "opacity-50")}>
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
                      style={{ backgroundColor: u.status === "INACTIVE" ? "#9ca3af" : "var(--accent)" }}>
                      {u.name[0]}
                    </div>
                    <span className="text-sm font-medium text-gray-900">{u.name}</span>
                  </div>
                </td>
                <td className="px-5 py-3.5 text-sm text-gray-500">{u.email}</td>
                <td className="px-5 py-3.5">
                  {u.id !== currentUserId ? (
                    <input defaultValue={u.position ?? ""} onBlur={(e) => { if (e.target.value !== (u.position ?? "")) updateUser(u.id, { position: e.target.value || null } as Partial<User>); }}
                      className="text-sm text-gray-700 bg-transparent border-b border-transparent hover:border-gray-200 focus:border-gray-400 focus:outline-none w-24 py-0.5" placeholder="직급" />
                  ) : (
                    <span className="text-sm text-gray-700">{u.position ?? "-"}</span>
                  )}
                </td>
                <td className="px-5 py-3.5">
                  {u.id !== currentUserId && u.role !== "OWNER" ? (
                    <div className="relative">
                      <select defaultValue={u.role}
                        onChange={(e) => updateUser(u.id, { role: e.target.value as User["role"] })}
                        className="text-xs font-medium bg-transparent focus:outline-none pr-4 appearance-none cursor-pointer text-gray-700">
                        <option value="MEMBER">직원</option>
                        <option value="MANAGER">관리자</option>
                      </select>
                      <ChevronDown size={10} className="absolute right-0 top-1 text-gray-400 pointer-events-none" />
                    </div>
                  ) : (
                    <span className="text-xs font-medium text-gray-700">{ROLE_LABEL[u.role]}</span>
                  )}
                </td>
                <td className="px-5 py-3.5">
                  <span className={cn("text-xs font-medium px-2 py-0.5 rounded-full", STATUS_COLOR[u.status])}>
                    {STATUS_LABEL[u.status]}
                  </span>
                </td>
                <td className="px-5 py-3.5 text-xs text-gray-400">
                  {new Date(u.createdAt).toLocaleDateString("ko-KR")}
                </td>
                <td className="px-5 py-3.5">
                  {u.id !== currentUserId && u.role !== "OWNER" && (
                    <button
                      onClick={() => updateUser(u.id, { status: u.status === "INACTIVE" ? "ACTIVE" : "INACTIVE" })}
                      className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                      title={u.status === "INACTIVE" ? "복직" : "퇴사 처리"}>
                      {u.status === "INACTIVE" ? <UserCheck size={15} /> : <UserX size={15} />}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {users.length === 0 && (
          <div className="text-center py-12 text-sm text-gray-400">등록된 직원이 없습니다</div>
        )}
      </div>
    </div>
  );
}
