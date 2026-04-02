import type { NewLikeDto, LikeDto, PageDto } from "~/lib/user-api-dtos";
import { userApiClient } from "../apiConfig";

const V1_LIKES = "/api/v1/likes"

export const getUserLikes = async (page: number, size: number, userId: string): Promise<PageDto<LikeDto>> => {
  const response = await userApiClient.get<PageDto<LikeDto>>(`${V1_LIKES}/users/${userId}`, {
    params: { page, size },
  });
  return response.data;
};

export const getUserLikesPostIds = async (): Promise<number[]> => {
  const response = await userApiClient.get<number[]>(`${V1_LIKES}/users/me/post-ids`);
  return response.data;
};

export const createLike = async (like: NewLikeDto): Promise<LikeDto> => {
  const response = await userApiClient.post<LikeDto>(V1_LIKES, like);
  return response.data;
};

export const deleteLike = async (likeId: number): Promise<void> => {
  await userApiClient.delete(`${V1_LIKES}/${likeId}`);
};
