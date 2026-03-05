import { useQuery } from "@tanstack/react-query";
import { getRandomPosts } from "~/api/endpoints";

export const useGetRandomPosts = (numPosts: number) => {
  return useQuery({
    queryKey: ["random-posts", numPosts],
    queryFn: () => getRandomPosts(numPosts),
    enabled: numPosts > 0,
    staleTime: 60000 * 3
  });
}