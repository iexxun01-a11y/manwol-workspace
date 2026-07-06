"use client";

/**
 * 매직링크 확인 페이지.
 * Gmail 링크 스캐너가 GET으로 토큰을 소비하는 문제를 방지하기 위해
 * 사용자가 버튼을 누를 때 NextAuth 콜백 URL로 이동시킨다.
 */
import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Suspense } from "react";

function ConfirmContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const token = searchParams.get("token");
  const email = searchParams.get("email");
  const callbackUrl = searchParams.get("callbackUrl") ?? "/";

  useEffect(() => {
    if (!token || !email) router.replace("/login");
  }, [token, email, router]);

  function handleConfirm() {
    if (!token || !email) return;
    setLoading(true);

    // NextAuth 콜백 URL로 직접 이동 — 이 시점에 GET 요청으로 토큰 소비
    // (사용자가 버튼을 눌러야만 실행되므로 Gmail 스캐너 문제 없음)
    const callbackParams = new URLSearchParams({
      token,
      email,
      callbackUrl,
    });
    window.location.href = `/api/auth/callback/resend?${callbackParams.toString()}`;
  }

  if (error) {
    return (
      <div className="text-center">
        <div className="text-4xl mb-4">⚠️</div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">링크 만료됨</h2>
        <p className="text-gray-500 text-sm mb-6">
          링크가 만료되었거나 이미 사용됐습니다.
          <br />새 링크를 요청해주세요.
        </p>
        <a href="/login" className="text-sm font-medium text-gray-900 underline underline-offset-2">
          다시 로그인
        </a>
      </div>
    );
  }

  return (
    <div className="text-center">
      <div className="text-4xl mb-4">🔐</div>
      <h2 className="text-xl font-semibold text-gray-900 mb-2">로그인 확인</h2>
      <p className="text-gray-500 text-sm mb-6">
        <span className="font-medium text-gray-700">{email}</span>
        <br />으로 로그인합니다.
      </p>
      <button
        onClick={handleConfirm}
        disabled={loading}
        className="w-full bg-gray-900 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-gray-800 disabled:opacity-50 transition-colors"
      >
        {loading ? "로그인 중..." : "로그인 확인"}
      </button>
    </div>
  );
}

export default function ConfirmPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 w-full max-w-sm">
        <div className="mb-6 text-center">
          <h1 className="text-xl font-bold text-gray-900">만월연회</h1>
        </div>
        <Suspense>
          <ConfirmContent />
        </Suspense>
      </div>
    </div>
  );
}
