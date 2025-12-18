import { useInfiniteQuery } from "@tanstack/react-query"
import { getPosts } from "~/api/endpoints"

export const useGetPosts = () => {
  return useInfiniteQuery({
    queryKey: ['posts'],
    queryFn: async ({ pageParam = 1 }): Promise<Post[]> => {
      return await getPosts(pageParam);
    },
    getNextPageParam: (lastPage, allPages) => {
      // Return next page number if there are more posts, undefined otherwise
      return lastPage.length > 0 ? allPages.length + 1 : undefined;
    },
    initialPageParam: 1,
  })
}