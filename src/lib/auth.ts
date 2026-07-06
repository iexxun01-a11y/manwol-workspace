/**
 * NextAuth v5 설정
 * - Email(매직링크) 프로바이더만 사용
 * - 등록된 이메일만 로그인 가능 (공개 가입 없음)
 * - 첫 로그인 시 INVITED → ACTIVE 전환
 *
 * Gmail 링크 스캐너 대응:
 * 이메일의 링크를 /login/confirm 으로 보내고,
 * 사용자가 버튼을 눌러 POST로 실제 토큰을 소비한다.
 */
import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Resend from "next-auth/providers/resend";
import { Resend as ResendClient } from "resend";
import { db } from "@/lib/db";
import { UserStatus } from "@prisma/client";

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(db),
  providers: [
    Resend({
      apiKey: process.env.RESEND_API_KEY,
      from: process.env.MAIL_FROM ?? "onboarding@resend.dev",
      maxAge: 15 * 60, // 15분

      // 이메일 링크를 /login/confirm 으로 커스터마이징
      // → Gmail 스캐너가 GET으로 토큰을 소비하는 문제 방지
      async sendVerificationRequest({ identifier: email, url, token, theme }) {
        // NextAuth가 생성한 콜백 URL에서 파라미터 추출
        const callbackUrl = new URL(url);
        const nextAuthCallbackUrl = callbackUrl.searchParams.get("callbackUrl") ?? "/";

        // 사용자에게 보낼 확인 페이지 URL
        const confirmUrl = new URL(
          "/login/confirm",
          process.env.NEXTAUTH_URL ?? "http://localhost:3000"
        );
        confirmUrl.searchParams.set("token", token);
        confirmUrl.searchParams.set("email", email);
        confirmUrl.searchParams.set("callbackUrl", nextAuthCallbackUrl);

        const resend = new ResendClient(process.env.RESEND_API_KEY);
        const { error } = await resend.emails.send({
          from: process.env.MAIL_FROM ?? "onboarding@resend.dev",
          to: email,
          subject: "만월연회 워크스페이스 로그인",
          html: `
            <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:40px 20px;">
              <h2 style="font-size:20px;font-weight:700;color:#111;margin-bottom:8px;">만월연회 워크스페이스</h2>
              <p style="color:#555;font-size:14px;margin-bottom:24px;">아래 버튼을 눌러 로그인을 완료하세요.<br/>링크는 15분 후 만료됩니다.</p>
              <a href="${confirmUrl.toString()}"
                 style="display:inline-block;background:#111;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-size:14px;font-weight:600;">
                로그인 확인
              </a>
              <p style="color:#aaa;font-size:12px;margin-top:24px;">
                이 메일을 요청하지 않았다면 무시하세요.
              </p>
            </div>
          `,
        });

        if (error) {
          throw new Error(`매직링크 발송 실패: ${JSON.stringify(error)}`);
        }
      },
    }),
  ],
  session: {
    strategy: "database",
    maxAge: 30 * 24 * 60 * 60, // 30일
  },
  pages: {
    signIn: "/login",
    verifyRequest: "/login/verify",
    error: "/login/error",
  },
  callbacks: {
    /**
     * 로그인 허용 여부 결정.
     * 등록 안 된 이메일 → 조용히 거부.
     * 이메일 존재 여부를 화면에 노출하지 않기 위해 동일한 응답.
     */
    async signIn({ user }) {
      if (!user.email) return false;

      const existing = await db.user.findUnique({
        where: { email: user.email },
        select: { id: true, status: true },
      });

      if (!existing || existing.status === UserStatus.INACTIVE) {
        return false;
      }

      return true;
    },

    /** 세션에 role, position 등 추가 정보 포함 */
    async session({ session, user }) {
      const dbUser = await db.user.findUnique({
        where: { id: user.id },
        select: { id: true, role: true, name: true, status: true, position: true },
      });

      if (dbUser) {
        session.user.id = dbUser.id;
        session.user.role = dbUser.role;
        session.user.name = dbUser.name;
        session.user.position = dbUser.position ?? undefined;
      }

      return session;
    },
  },
  events: {
    /** 첫 로그인 시 INVITED → ACTIVE 전환 */
    async signIn({ user }) {
      if (!user.email) return;

      const dbUser = await db.user.findUnique({
        where: { email: user.email },
        select: { status: true, firstLoginAt: true },
      });

      if (dbUser?.status === UserStatus.INVITED && !dbUser.firstLoginAt) {
        await db.user.update({
          where: { email: user.email },
          data: { status: UserStatus.ACTIVE, firstLoginAt: new Date() },
        });
      }
    },
  },
});
