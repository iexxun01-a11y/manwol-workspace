"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";

function ErrorContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  const message =
    error === "AccessDenied"
      ? "등록된 이메일이 아니거나 접근 권한이 없습니다."
      : "로그인 중 오류가 발생했습니다. 다시 시도해주세요.";

  return (
    <div className="text-center">
      <div className="text-4xl mb-4">⚠️</div>
      <h2 className="text-xl font-semibold text-gray-900 mb-2">
        로그인 실패
      </h2>
      <p className="text-gray-500 text-sm mb-6">{message}</p>
      <Link
        href="/login"
        className="text-sm font-medium text-gray-900 underline underline-offset-2"
      >
        다시 시도
      </Link>
    </div>
  );
}

export default function LoginErrorPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 w-full max-w-sm">
        <Suspense>
          <ErrorContent />
        </Suspense>
      </div>
    </div>
  );
}
