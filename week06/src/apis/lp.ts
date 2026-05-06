import type {
  CommentListResponse,
  LpDetailResponse,
  LpListResponse,
  SortOrder,
} from "../types/lp";
import { axiosInstance } from "./axios";

export const getLps = async (
  order: SortOrder,
  cursor?: number,
  limit = 20,
): Promise<LpListResponse> => {
  const { data } = await axiosInstance.get("/v1/lps", {
    params: {
      order,
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

export const getComments = async (
  lpId: number,
  order: SortOrder,
  cursor?: number,
  limit = 15,
): Promise<CommentListResponse> => {
  const { data } = await axiosInstance.get(`/v1/lps/${lpId}/comments`, {
    params: {
      order,
      limit,
      ...(cursor !== undefined && { cursor }),
    },
  });
  return data;
};
