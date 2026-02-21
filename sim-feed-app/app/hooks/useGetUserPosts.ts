import { useInfiniteQuery } from "@tanstack/react-query"
import { getUserPosts } from "~/api/endpoints"

export const useGetUserPosts = (userId?: string) => {
  return useInfiniteQuery({
    queryKey: ["user-posts", userId],
    queryFn: async ({ pageParam = 1 }) => {
      if (!userId) throw new Error("userId is required");
      return await getUserPosts(userId, pageParam);
    },
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.length === 0) return undefined;
      return allPages.length + 1;
    },
    initialPageParam: 1,
  });
}