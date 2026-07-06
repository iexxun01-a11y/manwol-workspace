import { TaskStatus, Priority } from "@prisma/client";

export type TagRecord = {
  id: string;
  name: string;
  color: string;
};

export type TaskWithRelations = {
  id: string;
  title: string;
  content: string;
  status: TaskStatus;
  priority: Priority;
  dueDate: string | null;
  order: number;
  authorId: string;
  assigneeId: string | null;
  createdAt: string;
  updatedAt: string;
  author: { id: string; name: string };
  assignee: { id: string; name: string } | null;
  tags: TagRecord[];
};

export const COLUMN_LABELS: Record<TaskStatus, string> = {
  TODO: "할 일",
  IN_PROGRESS: "진행 중",
  DONE: "완료",
};

export const PRIORITY_LABELS: Record<Priority, string> = {
  LOW: "낮음",
  MEDIUM: "보통",
  HIGH: "높음",
};

export const PRIORITY_COLORS: Record<Priority, string> = {
  LOW: "text-blue-500",
  MEDIUM: "text-yellow-500",
  HIGH: "text-red-500",
};

/** HTML 태그 제거 → 순수 텍스트 */
export function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}
