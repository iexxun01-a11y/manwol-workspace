"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function LoginForm() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    try {
      await signIn("resend", {
        email,
        callbackUrl,
        redirect: false,
      });
      // 등록 여부와 무관하게 동일한 화면 표시 (이메일 존재 여부 노출 금지)
      setSubmitted(true);
    } finally {
      setIsLoading(false);
    }
  }

  if (submitted) {
    return (
      <div className="text-center">
        <div className="text-4xl mb-4">📬</div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          메일을 확인해주세요
        </h2>
        <p className="text-gray-500 text-sm">
          {email} 으로 로그인 링크를 발송했습니다.
          <br />
          링크는 15분 후 만료됩니다.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label
          htmlFor="email"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          이메일
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="name@manwol.co.kr"
          required
          autoFocus
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
        />
      </div>
      <button
        type="submit"
        disabled={isLoading || !email}
        className="w-full bg-gray-900 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {isLoading ? "발송 중..." : "로그인 링크 받기"}
      </button>
    </form>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900">만월연회</h1>
          <p className="text-gray-500 text-sm mt-1">사내 워크스페이스</p>
        </div>
        <Suspense>
          <LoginForm />
        </Suspense>
        <p className="mt-6 text-xs text-center text-gray-400">
          초대받은 직원만 로그인할 수 있습니다
        </p>
      </div>
    </div>
  );
}
