import { useNavigate } from "react-router-dom";
import type { LpLike } from "../types/lp";

interface LpCardProps {
  id: number;
  title: string;
  thumbnail: string;
  createdAt: string;
  likes: LpLike[];
}

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

const LpCard = ({ id, title, thumbnail, createdAt, likes }: LpCardProps) => {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate(`/lp/${id}`)}
      className="relative overflow-hidden cursor-pointer group aspect-square"
    >
      {/* 썸네일 */}
      <img
        src={thumbnail}
        alt={title}
        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
      />

      {/* 호버 오버레이 — scale과 별도로 fade-in */}
      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
        <p className="text-white font-bold text-base leading-snug line-clamp-2">
          {title}
        </p>
        <p className="text-gray-300 text-xs mt-1">{formatDate(createdAt)}</p>
        <div className="flex items-center gap-1 text-white text-sm mt-1">
          <span>🤍</span>
          <span>{likes.length}</span>
        </div>
      </div>
    </div>
  );
};

export default LpCard;
