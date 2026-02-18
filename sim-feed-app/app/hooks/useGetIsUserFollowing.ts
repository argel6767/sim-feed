import { useQuery } from "@tanstack/react-query";
import { isFollowing } from "~/api/user-api/follows";
import type { Optional } from "~/lib/types";

export const useGetIsUserFollowing = (
  userId: Optional<string>,
  personaId: Optional<number>,
  getToken: () => Promise<string | null>,
) => {
  return useQuery({
    queryKey: ["isFollowing", userId, personaId],
    queryFn: async () => {
      const token = await getToken();
      if (!token)
        throw new Error(
          "Token is required. This query should not be called without a token.",
        );
      return await isFollowing(userId, personaId, token);
    },
  });
};
