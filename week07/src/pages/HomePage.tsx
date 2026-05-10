import { useCallback, useState } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { getLps } from "../apis/lp";
import type { SortOrder } from "../types/lp";
import LpCard from "../components/LpCard";
import { useIntersectionObserver } from "../hooks/useIntersectionObserver";
import FloatingButton from "../components/FloatingButton";

// ── 스켈레톤 ─────────────────────────────────

const SkeletonCard = () => (
  <div className="aspect-square bg-zinc-700 animate-pulse rounded" />
);

/** 초기 로딩 전용 — 8칸 전체 그리드 skeleton */
const InitialSkeletonGrid = () => (
  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
    {Array.from({ length: 8 }).map((_, i) => (
      <SkeletonCard key={i} />
    ))}
  </div>
);

// ── 정렬 레이블 ──────────────────────────────

const SORT_LABEL: Record<SortOrder, string> = {
  desc: "🕐 최신순",
  asc: "🕰 오래된순",
};

// ── 임시 지연 (스켈레톤 확인용) — 확인 후 삭제 ──
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

// ── 메인 컴포넌트 ─────────────────────────────

const HomePage = () => {
  const [order, setOrder] = useState<SortOrder>("desc");

  const {
    data,
    isPending,
    isError,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ["lps", order],
    queryFn: async ({ pageParam }) => {
      await sleep(2000); // TODO: 스켈레톤 확인 후 이 줄 삭제
      return getLps(order, pageParam);
    },
    initialPageParam: undefined as number | undefined,
    getNextPageParam: (lastPage) =>
      lastPage.data?.hasNext
        ? (lastPage.data.nextCursor ?? undefined)
        : undefined,
  });

  // 모든 페이지의 LP를 하나의 배열로 flatten
  const lps = data?.pages.flatMap((page) => page.data?.data ?? []) ?? [];

  // enabled 옵션이 조건 제어를 담당하므로 콜백은 fetchNextPage만 호출
  const handleIntersect = useCallback(() => {
    fetchNextPage();
  }, [fetchNextPage]);

  // hasNextPage && !isFetchingNextPage 일 때만 Observer 활성화
  const sentinelRef = useIntersectionObserver(handleIntersect, {
    enabled: hasNextPage && !isFetchingNextPage,
  });

  return (
    <div className="p-4">
      {/* 정렬 토글 */}
      <div className="flex justify-end mb-4">
        <button
          onClick={() => setOrder((prev) => (prev === "desc" ? "asc" : "desc"))}
          className="px-4 py-2 rounded-lg border border-zinc-700 text-zinc-300 text-sm font-medium hover:bg-zinc-800 transition"
        >
          {SORT_LABEL[order]}
        </button>
      </div>

      {/* 초기 로딩 — 전체 스켈레톤 */}
      {isPending && <InitialSkeletonGrid />}

      {/* 에러 */}
      {isError && (
        <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
          <p className="text-zinc-400">데이터를 불러오는 데 실패했습니다.</p>
          <button
            onClick={() => refetch()}
            className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition"
          >
            다시 시도
          </button>
        </div>
      )}

      {/* LP 그리드 */}
      {!isPending && !isError && (
        <>
          {lps.length === 0 && !isFetchingNextPage ? (
            <p className="text-center text-zinc-500 py-20">
              등록된 LP가 없습니다.
            </p>
          ) : (
            // 스켈레톤 카드를 LP 카드와 같은 grid 안에 두어 자연스럽게 이어지게 함
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              {lps.map((lp) => (
                <LpCard
                  key={lp.id}
                  id={lp.id}
                  title={lp.title}
                  thumbnail={lp.thumbnail}
                  createdAt={lp.createdAt}
                  likes={lp.likes}
                />
              ))}
              {/* 다음 페이지 로딩 중 — 같은 그리드에 skeleton 카드 append */}
              {isFetchingNextPage &&
                Array.from({ length: 4 }).map((_, i) => (
                  <SkeletonCard key={`sk-${i}`} />
                ))}
            </div>
          )}

          {/* Intersection sentinel — 뷰포트 진입 시 fetchNextPage 트리거 */}
          <div ref={sentinelRef} className="h-10" aria-hidden="true" />
        </>
      )}
      <FloatingButton />
    </div>
  );
};

export default HomePage;
