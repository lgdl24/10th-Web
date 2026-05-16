import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { deleteLike, deleteLp, getLpDetail, postLike } from "../apis/lp";
import { formatDate } from "../utils/date";
import { useAuth } from "../context/AuthContext";
import CommentsSection from "../components/CommentsSection";
import WriteModal from "../components/WriteModal";
import WarningModal from "../components/WarningModal";
import type { LpDetailResponse } from "../types/lp";

// ══════════════════════════════════════════════
// 스켈레톤 컴포넌트 (상세 페이지용)
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
    <p className="text-zinc-400 text-sm">
      삭제되었거나 존재하지 않는 페이지입니다.
    </p>
    <button
      onClick={onBack}
      className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition"
    >
      목록으로 돌아가기
    </button>
  </div>
);

// ══════════════════════════════════════════════
// 메인 페이지
// ══════════════════════════════════════════════
const LpDetailPage = () => {
  const { lpId } = useParams<{ lpId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { userId } = useAuth();

  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const id = Number(lpId);

  if (isNaN(id)) {
    return <DetailNotFound onBack={() => navigate("/")} />;
  }

  const { data, isPending, isError, refetch } = useQuery({
    queryKey: ["lp", id],
    queryFn: () => getLpDetail(id),
  });

  // ── LP 삭제 useMutation
  const deleteMutation = useMutation({
    mutationFn: () => deleteLp(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lps"] });
      navigate("/", { replace: true });
    },
    onError: () => {
      alert("LP 삭제 중 오류가 발생했습니다.");
    },
  });

  // ── 좋아요 토글 useMutation (낙관적 업데이트)
  const likeMutation = useMutation({
    mutationFn: (isCurrentlyLiked: boolean) =>
      isCurrentlyLiked ? deleteLike(id) : postLike(id),

    // ✅ onMutate: 서버 응답 전에 캐시를 먼저 업데이트
    onMutate: async (isCurrentlyLiked) => {
      // 진행 중인 refetch가 낙관적 업데이트를 덮어쓰지 않도록 취소
      await queryClient.cancelQueries({ queryKey: ["lp", id] });

      // 롤백용 이전 캐시 저장
      const previousLp = queryClient.getQueryData<LpDetailResponse>(["lp", id]);

      // ✅ 캐시 즉시 업데이트 (좋아요 추가 or 제거)
      queryClient.setQueryData<LpDetailResponse>(["lp", id], (old) => {
        if (!old?.data) return old;
        const likes = isCurrentlyLiked
          ? old.data.likes.filter((l) => l.userId !== userId) // 취소: 제거
          : [
              ...old.data.likes,
              { id: Date.now(), userId: userId!, lpId: id }, // 추가: 임시 객체
            ];
        return { ...old, data: { ...old.data, likes } };
      });

      return { previousLp };
    },

    // ✅ 실패 시 롤백
    onError: (_err, _vars, context) => {
      if (context?.previousLp) {
        queryClient.setQueryData(["lp", id], context.previousLp);
      }
    },

    // ✅ 성공/실패 모두 서버 데이터로 최종 동기화
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["lp", id] });
    },
  });

  if (isPending) return <DetailSkeleton />;
  if (isError) return <DetailError onRetry={refetch} />;

  const lp = data?.data;
  if (!lp) return <DetailNotFound onBack={() => navigate("/")} />;

  const isMyLp = userId !== null && lp.authorId === userId;
  // 현재 유저가 좋아요를 눌렀는지 확인
  const isLiked = userId !== null && lp.likes.some((l) => l.userId === userId);

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

      {/* ── 제목 + 수정/삭제 버튼 (본인 LP만 표시) */}
      <div className="flex items-start justify-between gap-4 mb-2">
        <h1 className="text-2xl font-bold text-white leading-snug">
          {lp.title}
        </h1>
        {isMyLp && (
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setShowEditModal(true)}
              className="px-3 py-1.5 text-sm text-zinc-300 border border-zinc-600 rounded-lg hover:bg-zinc-800 transition"
            >
              수정
            </button>
            <button
              onClick={() => setShowDeleteModal(true)}
              disabled={deleteMutation.isPending}
              className="px-3 py-1.5 text-sm border border-red-500 text-red-400 rounded-lg hover:bg-red-900/30 transition disabled:opacity-50"
            >
              {deleteMutation.isPending ? "삭제 중..." : "삭제"}
            </button>
          </div>
        )}
      </div>

      {/* ── 날짜 + 좋아요 */}
      <div className="flex items-center gap-4 text-sm text-zinc-400 mb-4">
        <span>{formatDate(lp.createdAt)}</span>

        {/* ✅ 좋아요 버튼 — 낙관적 업데이트 적용 */}
        <button
          onClick={() => likeMutation.mutate(isLiked)}
          disabled={likeMutation.isPending}
          className={`flex items-center gap-1 transition ${
            isLiked
              ? "text-red-400 hover:text-zinc-400"
              : "hover:text-red-400"
          }`}
        >
          <span>{isLiked ? "❤️" : "🤍"}</span>
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

      {/* ── 수정 모달 */}
      {showEditModal && (
        <WriteModal
          lpId={id}
          initialValues={{
            title: lp.title,
            content: lp.content,
            tags: lp.tags.map((t) => t.name),
            thumbnail: lp.thumbnail,
          }}
          onClose={() => setShowEditModal(false)}
        />
      )}

      {/* ── 삭제 확인 모달 */}
      {showDeleteModal && (
        <WarningModal
          message={"LP를 삭제하시겠습니까?\n삭제 후에는 되돌릴 수 없습니다."}
          confirmText="예, 삭제할게요"
          cancelText="아니오"
          onConfirm={() => {
            setShowDeleteModal(false);
            deleteMutation.mutate();
          }}
          onCancel={() => setShowDeleteModal(false)}
        />
      )}
    </div>
  );
};

export default LpDetailPage;
