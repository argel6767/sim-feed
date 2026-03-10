import type { UserStatsDto } from "~/lib/user-api-dtos";
import { userApiClient } from "../apiConfig";

const V1_USERS = "/api/v1/users";

export const getUserStats = async (id: string): Promise<UserStatsDto> => {
  const response = await userApiClient.get(`${V1_USERS}/${id}/stats`);
  return response.data;
};