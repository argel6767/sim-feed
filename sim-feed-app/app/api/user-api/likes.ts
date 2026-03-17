import type { NewLikeDto, LikeDto } from "~/lib/user-api-dtos";
import { userApiClient } from "../apiConfig";

const V1_LIKES = "/api/v1/likes"

export const getUserLikes = async (page: number, size: number, userId: string): Promise<LikeDto[]> => {
  const response = await userApiClient.get<LikeDto[]>(`${V1_LIKES}/users/${userId}`, {
    params: { page, size },
  });
  return response.data;
};

export const getUserLikesPostIds = async (userId: string, token: string): Promise<number[]> => {
  const response = await userApiClient.get<number[]>(`${V1_LIKES}/users/me/post-ids`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const createLike = async (like: NewLikeDto, token: string): Promise<LikeDto> => {
  const response = await userApiClient.post<LikeDto>(V1_LIKES, like, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const deleteLike = async (likeId: number, token: string): Promise<void> => {
  await userApiClient.delete(`${V1_LIKES}/${likeId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};
