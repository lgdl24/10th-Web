import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getLps } from "../apis/lp";
import type { SortOrder } from "../types/lp";
import LpCard from "../components/LpCard";

const SkeletonCard = () => (
  <div className="aspect-square bg-zinc-800 animate-pulse rounded" />
);

const SORT_LABEL: Record<SortOrder, string> = {
  desc: "🕐 최신순",
  asc: "🕰 오래된순",
};

const HomePage = () => {
  // 서버 DTO order 값과 동일하게 "desc" | "asc" 사용
  const [order, setOrder] = useState<SortOrder>("desc");

  const { data, isPending, isError, refetch } = useQuery({
    queryKey: ["lps", order],
    queryFn: () => getLps(order),
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 5,
  });

  const lps = Array.isArray(data?.data?.data) ? data.data.data : [];

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

      {/* 로딩 — Skeleton UI */}
      {isPending && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      )}

      {/* 에러 */}
      {isError && (
        <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
          <p className="text-zinc-400">데이터를 불러오는 데 실패했습니다.</p>
          <button
            onClick={() => refetch()}
            className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            다시 시도
          </button>
        </div>
      )}

      {/* LP 그리드 */}
      {!isPending && !isError && (
        <>
          {lps.length === 0 ? (
            <p className="text-center text-zinc-500 py-20">
              등록된 LP가 없습니다.
            </p>
          ) : (
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
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default HomePage;
