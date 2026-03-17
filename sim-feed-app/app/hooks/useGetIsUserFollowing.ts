import { useQuery } from "@tanstack/react-query";
import { isFollowing } from "~/api/user-api/follows";
import type { Optional } from "~/lib/types";

export const useGetIsUserFollowing = (
  userId: Optional<string>,
  personaId: Optional<number>,
) => {
  return useQuery({
    queryKey: ["isFollowing", userId, personaId],
    queryFn: async () => {
      return await isFollowing(userId, personaId);
    },
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 5,
  });
};
