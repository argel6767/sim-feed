import type { Optional } from "~/lib/types";
import { userApiClient } from "../apiConfig";
import type { NewFollowDto, FollowDto, FollowExistsDto } from "~/lib/user-api-dtos";

const V1_FOLLOW = "/api/v1/follows";

export const follow = async (
  newFollow: NewFollowDto,
  token: string,
): Promise<FollowDto> => {
  const response = await userApiClient.post(V1_FOLLOW, newFollow, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const unfollow = async (
  followId: number,
  token: string,
): Promise<void> => {
  await userApiClient.delete(`${V1_FOLLOW}/${followId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const getFollows = async (
  userId: string,
  token: string,
): Promise<FollowDto[]> => {
  const response = await userApiClient.get(
    `${V1_FOLLOW}/users/${userId}/follows`,
    { headers: { Authorization: `Bearer ${token}` } },
  );
  return response.data;
};

export const getFollowers = async (
  userId: string,
  token: string,
): Promise<FollowDto[]> => {
  const response = await userApiClient.get(
    `${V1_FOLLOW}/users/${userId}/followers`,
    { headers: { Authorization: `Bearer ${token}` } },
  );
  return response.data;
};

export const isFollowing = async (
  userId: Optional<string>,
  personaId: Optional<number>,
  token: string,
): Promise<FollowExistsDto> => {
  const params: Record<string, string | number> = {};
  if (userId) params.userId = userId;
  if (personaId) params.personaId = personaId;

  const response = await userApiClient.get(`${V1_FOLLOW}/is-following`, {
    params,
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};
