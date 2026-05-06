import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getLpDetail } from "../apis/lp";

// ── 공통 UX 컴포넌트 ─────────────────────────────

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

/** 네트워크/서버 에러 — refetch 가능 */
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

/**
 * 서버가 data: null 을 반환하는 경우
 * — 요청은 성공했지만 해당 LP가 존재하지 않음 (refetch 의미 없음)
 */
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

// ── 날짜 포맷 ─────────────────────────────────────

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

// ── 메인 페이지 ───────────────────────────────────

const LpDetailPage = () => {
  const { lpId } = useParams<{ lpId: string }>();
  const navigate = useNavigate();
  const id = Number(lpId);

  const { data, isPending, isError, refetch } = useQuery({
    queryKey: ["lp", id],
    queryFn: () => getLpDetail(id),
    enabled: !isNaN(id),
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 5,
  });

  if (isPending) return <DetailSkeleton />;

  // 네트워크/HTTP 오류 — 재시도 유도
  if (isError) return <DetailError onRetry={refetch} />;

  const lp = data?.data;

  // 서버가 data: null 반환 — LP가 존재하지 않음
  if (!lp) return <DetailNotFound onBack={() => navigate("/")} />;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">

      {/* ── 썸네일 ── */}
      <div className="w-full aspect-square overflow-hidden rounded-xl mb-6 bg-zinc-800">
        <img
          src={lp.thumbnail}
          alt={lp.title}
          className="w-full h-full object-cover"
        />
      </div>

      {/* ── 제목 + 수정/삭제 버튼 ── */}
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

      {/* ── 날짜 + 좋아요 버튼 ── */}
      <div className="flex items-center gap-4 text-sm text-zinc-400 mb-4">
        <span>{formatDate(lp.createdAt)}</span>
        <button className="flex items-center gap-1 hover:text-red-400 transition">
          <span>🤍</span>
          <span>{lp.likes.length}</span>
        </button>
      </div>

      {/* ── 태그 ── */}
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

      {/* ── 본문 ── */}
      <p className="text-zinc-300 leading-relaxed whitespace-pre-wrap">
        {lp.content}
      </p>

    </div>
  );
};

export default LpDetailPage;
