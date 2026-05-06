import type { CommonResponse } from "./common";

// ────────────────────────────────────────────
// 공통 서브 타입
// ────────────────────────────────────────────

/** 서버 CursorPaginationDto의 order 필드값과 동일하게 맞춤 */
export type SortOrder = "desc" | "asc";

export type Tag = {
  id: number;
  name: string;
};

/** likes 배열의 개별 항목 — 길이로 좋아요 수를 계산하고, userId로 내 좋아요 여부를 판단 */
export type LpLike = {
  id: number;
  userId: number;
  lpId: number;
};

export type LpAuthor = {
  id: number;
  name: string;
  email: string;
  bio: string | null;
  avatar: string | null;
  createdAt: string;
  updatedAt: string;
};

// ────────────────────────────────────────────
// LP 기본 타입 (목록 아이템과 상세 공통 필드)
// ────────────────────────────────────────────

export type Lp = {
  id: number;
  title: string;
  content: string;
  thumbnail: string;
  published: boolean;
  authorId: number;
  tags: Tag[];
  likes: LpLike[];
  createdAt: string;
  updatedAt: string;
};

// ────────────────────────────────────────────
// LP 상세 (목록 필드 + author 객체 추가)
// ────────────────────────────────────────────

export type LpDetail = Lp & {
  author: LpAuthor;
};

// ────────────────────────────────────────────
// API 응답 래퍼 타입
// ────────────────────────────────────────────

export type LpListResponse = CommonResponse<{
  data: Lp[];
  nextCursor: number | null;
  hasNext: boolean;
}>;

export type LpDetailResponse = CommonResponse<LpDetail>;
