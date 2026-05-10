/**
 * ISO 날짜 문자열을 "YYYY. MM. DD." 형식으로 변환합니다.
 * LpCard, LpDetailPage, CommentsSection 등에서 공통으로 사용합니다.
 */
export const formatDate = (iso: string): string =>
  new Date(iso).toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
