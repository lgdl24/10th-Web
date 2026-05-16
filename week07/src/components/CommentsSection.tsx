import { useCallback, useEffect, useRef, useState } from "react";
import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { deleteComment, getComments, patchComment, postComment } from "../apis/lp";
import type { SortOrder } from "../types/lp";
import { useIntersectionObserver } from "../hooks/useIntersectionObserver";
import { formatDate } from "../utils/date";
import { useAuth } from "../context/AuthContext";

// ══════════════════════════════════════════════
// 스켈레톤 컴포넌트 (댓글용)
// ══════════════════════════════════════════════
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

  // 메뉴 열림 상태 (commentId | null)
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);

  // 인라인 수정 상태
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editText, setEditText] = useState("");

  const menuRef = useRef<HTMLDivElement>(null);

  const queryClient = useQueryClient();
  const { userId } = useAuth();

  // 메뉴 외부 클릭 시 닫기
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ── 댓글 목록 조회
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
      return getComments(lpId, order, pageParam);
    },
    initialPageParam: undefined as number | undefined,
    getNextPageParam: (lastPage) =>
      lastPage.data?.hasNext
        ? (lastPage.data.nextCursor ?? undefined)
        : undefined,
  });

  const comments = data?.pages.flatMap((page) => page.data?.data ?? []) ?? [];

  const handleIntersect = useCallback(() => {
    fetchNextPage();
  }, [fetchNextPage]);

  const sentinelRef = useIntersectionObserver(handleIntersect, {
    enabled: hasNextPage && !isFetchingNextPage,
  });

  // ── 댓글 작성 mutation
  const createCommentMutation = useMutation({
    mutationFn: (content: string) => postComment(lpId, content),
    onSuccess: () => {
      setCommentText("");
      queryClient.invalidateQueries({ queryKey: ["lpComments", lpId] });
    },
    onError: (error) => {
      console.error("댓글 등록 실패:", error);
      alert("댓글을 등록하는 데 실패했습니다.");
    },
  });

  // ── 댓글 수정 mutation
  const editCommentMutation = useMutation({
    mutationFn: ({
      commentId,
      content,
    }: {
      commentId: number;
      content: string;
    }) => patchComment(lpId, commentId, content),
    onSuccess: () => {
      setEditingId(null);
      setEditText("");
      queryClient.invalidateQueries({ queryKey: ["lpComments", lpId] });
    },
    onError: (error) => {
      console.error("댓글 수정 실패:", error);
      alert("댓글을 수정하는 데 실패했습니다.");
    },
  });

  // ── 댓글 삭제 mutation
  const deleteCommentMutation = useMutation({
    mutationFn: (commentId: number) => deleteComment(lpId, commentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lpComments", lpId] });
    },
    onError: (error) => {
      console.error("댓글 삭제 실패:", error);
      alert("댓글을 삭제하는 데 실패했습니다.");
    },
  });

  // ── 핸들러
  const handleSubmitComment = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (commentText.trim().length === 0) return;
    createCommentMutation.mutate(commentText);
  };

  const handleStartEdit = (commentId: number, currentContent: string) => {
    setEditingId(commentId);
    setEditText(currentContent);
    setOpenMenuId(null);
  };

  const handleSubmitEdit = (commentId: number) => {
    if (editText.trim().length === 0) return;
    editCommentMutation.mutate({ commentId, content: editText });
  };

  const handleDeleteComment = (commentId: number) => {
    setOpenMenuId(null);
    if (!window.confirm("댓글을 삭제하시겠습니까?")) return;
    deleteCommentMutation.mutate(commentId);
  };

  const isSubmitDisabled =
    commentText.trim().length === 0 || createCommentMutation.isPending;

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
        <form onSubmit={handleSubmitComment} className="flex gap-2">
          <input
            type="text"
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="댓글을 입력하세요..."
            maxLength={200}
            disabled={createCommentMutation.isPending}
            className="flex-1 bg-zinc-800 border border-zinc-700 text-white placeholder-zinc-500 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500 transition disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={isSubmitDisabled}
            className="px-4 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-500 transition disabled:bg-zinc-700 disabled:text-zinc-500 shrink-0"
          >
            {createCommentMutation.isPending ? "등록 중..." : "등록"}
          </button>
        </form>
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
          {comments.map((comment) => {
            const isMyComment = userId !== null && comment.authorId === userId;
            const isEditing = editingId === comment.id;

            return (
              <li key={comment.id} className="flex gap-3 py-4">
                <img
                  src={comment.author?.avatar ?? "/images/gora.jpeg"}
                  alt={comment.author?.name ?? "사용자"}
                  className="w-8 h-8 rounded-full object-cover shrink-0 bg-zinc-700"
                />
                <div className="flex-1 min-w-0">
                  {/* 작성자 정보 + … 메뉴 버튼 */}
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-white">
                        {comment.author?.name ?? "알 수 없음"}
                      </span>
                      <span className="text-xs text-zinc-500">
                        {formatDate(comment.createdAt)}
                      </span>
                    </div>

                    {/* 본인 댓글에만 … 버튼 표시 */}
                    {isMyComment && (
                      <div
                        className="relative"
                        ref={openMenuId === comment.id ? menuRef : null}
                      >
                        <button
                          onClick={() =>
                            setOpenMenuId((prev) =>
                              prev === comment.id ? null : comment.id,
                            )
                          }
                          className="p-1 text-zinc-500 hover:text-zinc-300 rounded transition"
                          aria-label="댓글 메뉴"
                        >
                          {/* ··· 아이콘 */}
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                          >
                            <circle cx="5" cy="12" r="2" />
                            <circle cx="12" cy="12" r="2" />
                            <circle cx="19" cy="12" r="2" />
                          </svg>
                        </button>

                        {/* 드롭다운 메뉴 */}
                        {openMenuId === comment.id && (
                          <div className="absolute right-0 top-7 z-10 bg-zinc-800 border border-zinc-700 rounded-lg shadow-lg overflow-hidden min-w-[90px]">
                            <button
                              onClick={() =>
                                handleStartEdit(comment.id, comment.content)
                              }
                              className="w-full px-4 py-2 text-left text-sm text-zinc-200 hover:bg-zinc-700 transition"
                            >
                              수정
                            </button>
                            <button
                              onClick={() => handleDeleteComment(comment.id)}
                              disabled={deleteCommentMutation.isPending}
                              className="w-full px-4 py-2 text-left text-sm text-red-400 hover:bg-zinc-700 transition disabled:opacity-50"
                            >
                              삭제
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* 댓글 내용 or 인라인 수정 입력창 */}
                  {isEditing ? (
                    <div className="flex gap-2 mt-1">
                      <input
                        type="text"
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        maxLength={200}
                        autoFocus
                        className="flex-1 bg-zinc-700 border border-zinc-600 text-white rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-blue-500 transition"
                      />
                      <button
                        onClick={() => handleSubmitEdit(comment.id)}
                        disabled={
                          editText.trim().length === 0 ||
                          editCommentMutation.isPending
                        }
                        className="px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-500 transition disabled:bg-zinc-700 disabled:text-zinc-500 shrink-0"
                      >
                        {editCommentMutation.isPending ? "저장 중..." : "저장"}
                      </button>
                      <button
                        onClick={() => {
                          setEditingId(null);
                          setEditText("");
                        }}
                        className="px-3 py-1.5 border border-zinc-600 text-zinc-400 text-xs font-medium rounded-lg hover:bg-zinc-700 transition shrink-0"
                      >
                        취소
                      </button>
                    </div>
                  ) : (
                    <p className="text-sm text-zinc-300 break-words leading-relaxed">
                      {comment.content}
                    </p>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {/* 다음 페이지 로딩 중 — 하단 스켈레톤 */}
      {isFetchingNextPage && <CommentSkeletonList count={2} />}

      <div ref={sentinelRef} className="h-4" aria-hidden="true" />
    </section>
  );
};

export default CommentsSection;
