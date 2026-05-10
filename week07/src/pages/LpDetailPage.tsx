import { useCallback, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { getComments, getLpDetail } from "../apis/lp";
import type { SortOrder } from "../types/lp";
import { useIntersectionObserver } from "../hooks/useIntersectionObserver";
import { formatDate } from "../utils/date";

// ── 임시 지연 (스켈레톤 확인용) — 확인 후 삭제 ──
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

// ══════════════════════════════════════════════
// 스켈레톤 컴포넌트
// ══════════════════════════════════════════════

const DetailSkeleton = () => (
  <div className="max-w-2xl mx-auto px-4 py-8 animate-pulse">
    <div className="w-full aspect-square bg-zinc-700 rounded-xl mb-6" />
    <div className="h-7 bg-zinc-700 rounded w-3/4 mb-3" />
    <div className="flex gap-4 mb-4">
      <div className="h-4 bg-zinc-700 rounded w-24" />
      <div className="h-4 bg-zinc-700 rounded w-16" />
    </div>
    <div className="flex gap-2 mb-6">
      {[1, 2, 3].map((i) => (
        <div key={i} className="h-6 bg-zinc-700 rounded-full w-14" />
      ))}
    </div>
    <div className="space-y-2">
      <div className="h-4 bg-zinc-700 rounded w-full" />
      <div className="h-4 bg-zinc-700 rounded w-5/6" />
      <div className="h-4 bg-zinc-700 rounded w-4/6" />
    </div>
  </div>
);

const CommentSkeleton = () => (
  <div className="flex gap-3 animate-pulse py-3">
    <div className="w-8 h-8 rounded-full bg-zinc-700 shrink-0" />
    <div className="flex-1 space-y-2">
      <div className="h-3 bg-zinc-700 rounded w-24" />
      <div className="h-3 bg-zinc-700 rounded w-full" />
      <div className="h-3 bg-zinc-700 rounded w-3/4" />
    </div>
  </div>
);

const CommentSkeletonList = ({ count = 3 }: { count?: number }) => (
  <div className="divide-y divide-zinc-800">
    {Array.from({ length: count }).map((_, i) => (
      <CommentSkeleton key={i} />
    ))}
  </div>
);

// ══════════════════════════════════════════════
// 에러 / 404 상태
// ══════════════════════════════════════════════

const DetailError = ({ onRetry }: { onRetry: () => void }) => (
  <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
    <p className="text-zinc-400">데이터를 불러오는 데 실패했습니다.</p>
    <button
      onClick={onRetry}
      className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition"
    >
      다시 시도
    </button>
  </div>
);

const DetailNotFound = ({ onBack }: { onBack: () => void }) => (
  <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
    <p className="text-2xl">🎵</p>
    <p className="text-white font-medium">찾을 수 없는 LP입니다.</p>
    <p className="text-zinc-400 text-sm">삭제되었거나 존재하지 않는 페이지입니다.</p>
    <button
      onClick={onBack}
      className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition"
    >
      목록으로 돌아가기
    </button>
  </div>
);

// ══════════════════════════════════════════════
// 댓글 섹션
// ══════════════════════════════════════════════

const COMMENT_SORT_LABEL: Record<SortOrder, string> = {
  desc: "🕐 최신순",
  asc: "🕰 오래된순",
};

interface CommentsSectionProps {
  lpId: number;
}

const CommentsSection = ({ lpId }: CommentsSectionProps) => {
  const [order, setOrder] = useState<SortOrder>("desc");
  const [commentText, setCommentText] = useState("");

  const {
    data,
    isPending,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ["lpComments", lpId, order],
    queryFn: async ({ pageParam }) => {
      await sleep(2000); // TODO: 스켈레톤 확인 후 이 줄 삭제
      return getComments(lpId, order, pageParam);
    },
    initialPageParam: undefined as number | undefined,
    getNextPageParam: (lastPage) =>
      lastPage.data?.hasNext ? (lastPage.data.nextCursor ?? undefined) : undefined,
  });

  const comments = data?.pages.flatMap((page) => page.data?.data ?? []) ?? [];

  // enabled 옵션이 조건 제어를 담당하므로 콜백은 fetchNextPage만 호출
  const handleIntersect = useCallback(() => {
    fetchNextPage();
  }, [fetchNextPage]);

  const sentinelRef = useIntersectionObserver(handleIntersect, {
    enabled: hasNextPage && !isFetchingNextPage,
  });

  const isSubmitDisabled = commentText.trim().length === 0;

  return (
    <section className="mt-10 border-t border-zinc-800 pt-8">

      {/* ── 섹션 헤더 */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-white">댓글</h2>
        <button
          onClick={() => setOrder((prev) => (prev === "desc" ? "asc" : "desc"))}
          className="px-3 py-1.5 rounded-lg border border-zinc-700 text-zinc-400 text-xs font-medium hover:bg-zinc-800 transition"
        >
          {COMMENT_SORT_LABEL[order]}
        </button>
      </div>

      {/* ── 댓글 작성 UI */}
      <div className="mb-6">
        <div className="flex gap-2">
          <input
            type="text"
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="댓글을 입력하세요..."
            maxLength={200}
            className="flex-1 bg-zinc-800 border border-zinc-700 text-white placeholder-zinc-500
                       rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500 transition"
          />
          <button
            type="button"
            disabled={isSubmitDisabled}
            className="px-4 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg
                       hover:bg-blue-500 transition disabled:bg-zinc-700 disabled:text-zinc-500 shrink-0"
          >
            등록
          </button>
        </div>
        <p className="mt-1.5 text-xs text-zinc-500">
          {commentText.length > 0
            ? `${commentText.length} / 200자`
            : "최대 200자까지 입력 가능합니다."}
        </p>
      </div>

      {/* ── 댓글 목록 */}

      {isPending && <CommentSkeletonList count={3} />}

      {isError && (
        <p className="text-zinc-500 text-sm text-center py-6">
          댓글을 불러오지 못했습니다.
        </p>
      )}

      {!isPending && !isError && comments.length === 0 && (
        <p className="text-zinc-500 text-sm text-center py-6">
          첫 번째 댓글을 남겨보세요!
        </p>
      )}

      {!isPending && !isError && comments.length > 0 && (
        <ul className="divide-y divide-zinc-800">
          {comments.map((comment) => (
            <li key={comment.id} className="flex gap-3 py-4">
              {/* user 필드가 null일 수 있으므로 옵셔널 체이닝 필수 */}
              <img
                src={comment.user?.avatar ?? "/images/gora.jpeg"}
                alt={comment.user?.name ?? "사용자"}
                className="w-8 h-8 rounded-full object-cover shrink-0 bg-zinc-700"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-medium text-white">
                    {comment.user?.name ?? "알 수 없음"}
                  </span>
                  <span className="text-xs text-zinc-500">
                    {formatDate(comment.createdAt)}
                  </span>
                </div>
                <p className="text-sm text-zinc-300 break-words leading-relaxed">
                  {comment.content}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* 다음 페이지 로딩 중 — 하단 스켈레톤 */}
      {isFetchingNextPage && <CommentSkeletonList count={2} />}

      <div ref={sentinelRef} className="h-4" aria-hidden="true" />
    </section>
  );
};

// ══════════════════════════════════════════════
// 메인 페이지
// ══════════════════════════════════════════════

const LpDetailPage = () => {
  const { lpId } = useParams<{ lpId: string }>();
  const navigate = useNavigate();
  const id = Number(lpId);

  // NaN guard: /lp/abc 같은 잘못된 경로 접근 시 스켈레톤 무한 표시 방지
  if (isNaN(id)) {
    return <DetailNotFound onBack={() => navigate("/")} />;
  }

  const { data, isPending, isError, refetch } = useQuery({
    queryKey: ["lp", id],
    queryFn: async () => {
      await sleep(2000); // TODO: 스켈레톤 확인 후 이 줄 삭제
      return getLpDetail(id);
    },
    // staleTime/gcTime 은 main.tsx 전역 설정(5분)에서 상속 — 중복 선언 불필요
  });

  if (isPending) return <DetailSkeleton />;
  if (isError) return <DetailError onRetry={refetch} />;

  const lp = data?.data;
  if (!lp) return <DetailNotFound onBack={() => navigate("/")} />;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">

      {/* ── 썸네일 */}
      <div className="w-full aspect-square overflow-hidden rounded-xl mb-6 bg-zinc-800">
        <img
          src={lp.thumbnail}
          alt={lp.title}
          className="w-full h-full object-cover"
        />
      </div>

      {/* ── 제목 + 수정/삭제 버튼 */}
      <div className="flex items-start justify-between gap-4 mb-2">
        <h1 className="text-2xl font-bold text-white leading-snug">
          {lp.title}
        </h1>
        <div className="flex items-center gap-2 shrink-0">
          <button className="px-3 py-1.5 text-sm text-zinc-300 border border-zinc-600 rounded-lg hover:bg-zinc-800 transition">
            수정
          </button>
          <button className="px-3 py-1.5 text-sm border border-red-500 text-red-400 rounded-lg hover:bg-red-900/30 transition">
            삭제
          </button>
        </div>
      </div>

      {/* ── 날짜 + 좋아요 */}
      <div className="flex items-center gap-4 text-sm text-zinc-400 mb-4">
        <span>{formatDate(lp.createdAt)}</span>
        <button className="flex items-center gap-1 hover:text-red-400 transition">
          <span>🤍</span>
          <span>{lp.likes.length}</span>
        </button>
      </div>

      {/* ── 태그 */}
      {lp.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-6">
          {lp.tags.map((tag) => (
            <span
              key={tag.id}
              className="px-3 py-1 bg-zinc-800 text-zinc-300 text-xs rounded-full"
            >
              #{tag.name}
            </span>
          ))}
        </div>
      )}

      {/* ── 본문 */}
      <p className="text-zinc-300 leading-relaxed whitespace-pre-wrap">
        {lp.content}
      </p>

      {/* ── 댓글 섹션 */}
      <CommentsSection lpId={id} />

    </div>
  );
};

export default LpDetailPage;
