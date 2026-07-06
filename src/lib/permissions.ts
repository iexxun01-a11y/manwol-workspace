/**
 * 권한 시스템 — 모든 판단이 이 파일 하나를 통한다.
 * 코드 곳곳에 `user.role === 'OWNER'` 직접 비교 금지.
 */
import { Role } from "@prisma/client";

// ── 정의된 액션 목록 ──
export type Action =
  // 태스크
  | "task:create"
  | "task:read:all"       // 전체 태스크 열람
  | "task:manage:own"     // 본인 태스크 수정/삭제
  | "task:manage:all"     // 모든 태스크 수정/삭제
  // 직원
  | "user:invite"         // 직원 초대
  | "user:manage"         // 직원 수정/비활성화
  | "user:read:all"       // 직원 목록 열람
  // 파일
  | "file:upload"
  | "file:delete:own"
  | "file:delete:all"
  // 자리만 정의 — Phase 11~12에서 구현
  | "leave:apply"
  | "leave:approve"
  | "document:request"
  | "document:approve"
  | "document:stamp";

// ── 역할별 허용 액션 ──
const ROLE_PERMISSIONS: Record<Role, Set<Action>> = {
  OWNER: new Set<Action>([
    "task:create",
    "task:read:all",
    "task:manage:own",
    "task:manage:all",
    "user:invite",
    "user:manage",
    "user:read:all",
    "file:upload",
    "file:delete:own",
    "file:delete:all",
    "leave:apply",
    "leave:approve",
    "document:request",
    "document:approve",
    "document:stamp",
  ]),
  MANAGER: new Set<Action>([
    "task:create",
    "task:read:all",
    "task:manage:own",
    "task:manage:all",
    "user:read:all",
    "file:upload",
    "file:delete:own",
    "leave:apply",
    "leave:approve",
    "document:request",
    "document:approve",
  ]),
  MEMBER: new Set<Action>([
    "task:create",
    "task:read:all",
    "task:manage:own",
    "user:read:all",
    "file:upload",
    "file:delete:own",
    "leave:apply",
    "document:request",
  ]),
};

type MinimalUser = {
  id: string;
  role: Role;
};

/**
 * 권한 확인 — 역할 기반.
 * `resourceOwnerId`를 넘기면 소유권 기반 판단도 함께 수행.
 */
export function can(
  user: MinimalUser,
  action: Action,
  resourceOwnerId?: string
): boolean {
  const allowed = ROLE_PERMISSIONS[user.role];
  if (!allowed.has(action)) return false;

  // 소유권 한정 액션: 본인 것만 허용
  const ownOnlyActions: Action[] = [
    "task:manage:own",
    "file:delete:own",
  ];
  if (ownOnlyActions.includes(action) && resourceOwnerId !== undefined) {
    return resourceOwnerId === user.id;
  }

  return true;
}

/**
 * 권한 없으면 예외 발생.
 * 모든 API 핸들러 첫 줄에서 사용.
 */
export function assertCan(
  user: MinimalUser,
  action: Action,
  resourceOwnerId?: string
): void {
  if (!can(user, action, resourceOwnerId)) {
    throw new PermissionError(
      `권한 없음: ${user.role} 는 '${action}' 을 수행할 수 없습니다.`
    );
  }
}

export class PermissionError extends Error {
  readonly status = 403;
  constructor(message: string) {
    super(message);
    this.name = "PermissionError";
  }
}

/** API 핸들러에서 PermissionError를 Response로 변환할 때 사용 */
export function handlePermissionError(err: unknown): Response | null {
  if (err instanceof PermissionError) {
    return Response.json({ error: err.message }, { status: 403 });
  }
  return null;
}
