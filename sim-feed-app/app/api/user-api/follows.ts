import type { Optional } from "~/lib/types";
import { userApiClient } from "../apiConfig";
import type { NewFollowDto, FollowDto, FollowExistsDto } from "~/lib/user-api-dtos";

const V1_FOLLOW = "/api/v1/follows";

export const follow = async (
  newFollow: NewFollowDto
): Promise<FollowDto> => {
  const response = await userApiClient.post(V1_FOLLOW, newFollow);
  return response.data;
};

export const unfollow = async (
  followId: number,
): Promise<void> => {
  await userApiClient.delete(`${V1_FOLLOW}/${followId}`);
};

export const getFollows = async (
  userId: string,
): Promise<FollowDto[]> => {
  const response = await userApiClient.get(
    `${V1_FOLLOW}/users/${userId}/follows`
  );
  return response.data;
};

export const getFollowers = async (
  userId: string
): Promise<FollowDto[]> => {
  const response = await userApiClient.get(
    `${V1_FOLLOW}/users/${userId}/followers`
  );
  return response.data;
};

export const isFollowing = async (
  userId: Optional<string>,
  personaId: Optional<number>,
): Promise<FollowExistsDto> => {
  const params: Record<string, string | number> = {};
  if (userId) params.userId = userId;
  if (personaId) params.personaId = personaId;

  const response = await userApiClient.get(`${V1_FOLLOW}/is-following`, {
    params,
  });
  return response.data;
};
