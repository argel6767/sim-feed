import type { UserStatsDto, UpdateUserBioDto } from "~/lib/user-api-dtos";
import { userApiClient } from "../apiConfig";

const V1_USERS = "/api/v1/users";

export const getUserStats = async (id: string): Promise<UserStatsDto> => {
  const response = await userApiClient.get(`${V1_USERS}/${id}/stats`);
  return response.data;
};

export const updateUserBio = async (id: string, token: string, newBio: UpdateUserBioDto) => {
  const response = await userApiClient.patch(`${V1_USERS}/${id}/bio`, newBio, { headers: { Authorization: `Bearer ${token}` } });
  return response.data;
};