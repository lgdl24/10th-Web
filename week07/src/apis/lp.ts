import type {
  CommentListResponse,
  LpDetailResponse,
  LpListResponse,
  LpResponse,
  SortOrder,
  Lp,
} from "../types/lp";
import type { PostCommentResponse } from "../types/lp";
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
export const postComment = async (
  lpId: number,
  content: string,
): Promise<PostCommentResponse> => {
  const { data } = await axiosInstance.post(`/v1/lps/${lpId}/comments`, {
    content,
  });
  return data;
};

export const patchComment = async (
  lpId: number,
  commentId: number,
  content: string,
): Promise<PostCommentResponse> => {
  const { data } = await axiosInstance.patch(
    `/v1/lps/${lpId}/comments/${commentId}`,
    { content },
  );
  return data;
};

export const deleteComment = async (
  lpId: number,
  commentId: number,
): Promise<void> => {
  await axiosInstance.delete(`/v1/lps/${lpId}/comments/${commentId}`);
};

/*


export const postLp = async (
  title: string,
  content: string,
  tags: string[],
): Promise<Lp> => {
  const response = await axiosInstance.post<LpResponse>("/v1/lps", {
    title,
    content,
    tags,
    published: true,
  });

  return response.data.data;
};

*/

export const postLp = async (
  title: string,
  content: string,
  tags: string[],
  thumbnail?: string,
): Promise<Lp> => {
  const response = await axiosInstance.post<LpResponse>("/v1/lps", {
    title,
    content,
    thumbnail,
    tags,
    published: true,
  });

  return response.data.data;
};

export const patchLp = async (
  lpId: number,
  title: string,
  content: string,
  tags: string[],
  thumbnail?: string,
): Promise<Lp> => {
  const response = await axiosInstance.patch<LpResponse>(`/v1/lps/${lpId}`, {
    title,
    content,
    thumbnail,
    tags,
    published: true,
  });

  return response.data.data;
};

export const deleteLp = async (lpId: number): Promise<void> => {
  await axiosInstance.delete(`/v1/lps/${lpId}`);
};

export const postLike = async (lpId: number): Promise<void> => {
  await axiosInstance.post(`/v1/lps/${lpId}/likes`);
};

export const deleteLike = async (lpId: number): Promise<void> => {
  await axiosInstance.delete(`/v1/lps/${lpId}/likes`);
};
