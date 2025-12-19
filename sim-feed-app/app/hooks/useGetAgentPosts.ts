import { useInfiniteQuery } from "@tanstack/react-query"
import { getAgentPosts } from "~/api/endpoints"

export const useGetAgentPosts = (persona_id?: number) => {
  return useInfiniteQuery({
    queryKey: ["agent-posts", persona_id],
    queryFn: async ({ pageParam = 1 }) => {
      if (!persona_id) throw new Error("persona_id is required");
      return await getAgentPosts(persona_id, pageParam);
    },
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.length === 0) return undefined;
      return allPages.length + 1;
    },
    initialPageParam: 1,
  });
};