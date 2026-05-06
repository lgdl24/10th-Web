import type {
  LpDetailResponse,
  LpListResponse,
  SortOrder,
} from "../types/lp";
import { axiosInstance } from "./axios";

export const getLps = async (
  order: SortOrder,
  cursor?: number,   // 첫 요청은 undefined → 파라미터 자체를 생략
  limit = 20,
): Promise<LpListResponse> => {
  const { data } = await axiosInstance.get("/v1/lps", {
    params: {
      order,          // ← 서버 DTO 필드명: order (asc | desc)
      limit,
      ...(cursor !== undefined && { cursor }),
    },
  });
  return data;
};

export const getLpDetail = async (lpId: number): Promise<LpDetailResponse> => {
  const { data } = await axiosInstance.get(`/v1/lps/${lpId}`);
  return data;
};
