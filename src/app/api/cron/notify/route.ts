import { NextRequest } from "next/server";
import { db } from "@/lib/db";

const TAX_ITEMS: { month: number; day: number | "말일"; desc: string }[] = [
  { month: 1, day: 10, desc: "원천세 신고" },
  { month: 1, day: 25, desc: "부가세 확정신고" },
  { month: 2, day: 10, desc: "원천세 신고" },
  { month: 3, day: 10, desc: "지급명세서 제출" },
  { month: 3, day: "말일", desc: "법인세 신고" },
  { month: 4, day: 10, desc: "원천세 신고" },
  { month: 5, day: 10, desc: "원천세 신고" },
  { month: 5, day: 25, desc: "부가세 예정신고" },
  { month: 5, day: "말일", desc: "종합소득세 확정신고" },
  { month: 6, day: 10, desc: "원천세 신고" },
  { month: 7, day: 10, desc: "원천세 신고" },
  { month: 7, day: 25, desc: "부가세 확정신고" },
  { month: 8, day: 10, desc: "원천세 신고" },
  { month: 9, day: 10, desc: "원천세 신고" },
  { month: 10, day: 10, desc: "원천세 신고" },
  { month: 10, day: 25, desc: "부가세 예정신고" },
  { month: 11, day: 10, desc: "원천세 신고" },
  { month: 11, day: "말일", desc: "종합소득세 중간예납" },
  { month: 12, day: 10, desc: "원천세 신고" },
  { month: 12, day: 15, desc: "종합부동산세 납부" },
];

async function sendTelegram(message: string) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) return;

  await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text: message, parse_mode: "HTML" }),
  });
}

export async function GET(req: NextRequest) {
  // Vercel Cron 인증
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  // KST 기준 오늘 날짜
  const now = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Seoul" }));
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const tomorrow = new Date(today); tomorrow.setDate(today.getDate() + 1);
  const in3days = new Date(today); in3days.setDate(today.getDate() + 3);
  const in7days = new Date(today); in7days.setDate(today.getDate() + 7);

  const messages: string[] = [];

  // ── 1. 세무 일정 알림 ──
  const year = now.getFullYear();
  const taxAlerts: string[] = [];

  for (const item of TAX_ITEMS) {
    const lastDay = new Date(year, item.month, 0).getDate();
    const d = item.day === "말일" ? lastDay : item.day;
    const target = new Date(year, item.month - 1, d);
    const dday = Math.round((target.getTime() - today.getTime()) / 86400000);

    if (dday === 0) taxAlerts.push(`🔴 <b>오늘!</b> ${item.desc} (${item.month}/${d})`);
    else if (dday === 1) taxAlerts.push(`🟠 <b>내일</b> | ${item.desc} (${item.month}/${d})`);
    else if (dday === 3) taxAlerts.push(`🟡 <b>D-3</b> | ${item.desc} (${item.month}/${d})`);
    else if (dday === 7) taxAlerts.push(`🟢 <b>D-7</b> | ${item.desc} (${item.month}/${d})`);
  }

  if (taxAlerts.length > 0) {
    messages.push(`📋 <b>세무 신고·납부 알림</b>\n\n${taxAlerts.join("\n")}`);
  }

  // ── 2. 캘린더 태스크 마감 알림 ──
  const dueTasks = await db.task.findMany({
    where: {
      dueDate: { gte: today, lt: in3days },
      status: { not: "DONE" },
    },
    include: { assignee: true },
    orderBy: { dueDate: "asc" },
  });

  if (dueTasks.length > 0) {
    const taskLines = dueTasks.map((t) => {
      const taskDate = new Date(t.dueDate!);
      const dday = Math.round((taskDate.getTime() - today.getTime()) / 86400000);
      const ddayStr = dday === 0 ? "🔴 오늘 마감" : `🟠 내일 마감`;
      const assigneeStr = t.assignee ? ` (${t.assignee.name})` : "";
      return `${ddayStr} | ${t.title}${assigneeStr}`;
    });
    messages.push(`📌 <b>마감 임박 태스크</b>\n\n${taskLines.join("\n")}`);
  }

  // ── 발송 ──
  if (messages.length > 0) {
    const header = `🌅 <b>만월연회 워크스페이스</b>\n${now.getFullYear()}년 ${now.getMonth() + 1}월 ${now.getDate()}일 알림\n${"─".repeat(20)}`;
    await sendTelegram([header, ...messages].join("\n\n"));
  }

  return Response.json({ ok: true, sent: messages.length });
}
