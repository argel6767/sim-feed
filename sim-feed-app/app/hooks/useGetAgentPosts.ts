import { useInfiniteQuery } from "@tanstack/react-query"
import { getAgentPosts } from "~/api/endpoints"

export const useGetAgentPosts = (personaId: number) => {
  return useInfiniteQuery({
    queryKey: ["agent-posts", personaId],
    queryFn: async ({ pageParam = 1 }) => await getAgentPosts(personaId, pageParam),
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.length === 0) return undefined;
      return allPages.length + 1;
    },
    initialPageParam: 1,
  });
};