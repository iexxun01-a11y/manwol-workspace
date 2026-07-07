/**
 * Next.js 16 Proxy (구 middleware) — Edge Runtime에서 실행.
 * Edge에서는 Prisma/pg 같은 Node.js 네이티브 모듈 사용 불가.
 * 세션 쿠키 존재 여부만 확인 → 실제 세션 유효성은 레이아웃에서 검증.
 */
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PUBLIC_PATHS = ["/login", "/api/auth", "/api/cron"];

// NextAuth v5가 사용하는 세션 쿠키 이름
const SESSION_COOKIE =
  process.env.NODE_ENV === "production"
    ? "__Secure-authjs.session-token"
    : "authjs.session-token";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 공개 경로는 통과
  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  // 세션 쿠키가 없으면 로그인 페이지로
  const sessionCookie = request.cookies.get(SESSION_COOKIE);
  if (!sessionCookie) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
