import { useQuery } from "@tanstack/react-query"
import { getFollows, getFollowers } from "~/api/user-api/follows"

export const useGetUserFollows = (id: string) => {
  return useQuery({
    queryKey: ["follows", id],
    queryFn: () => getFollows(id)
  })
}

export const useGetUserFollowers = (id: string) => {
  return useQuery({
    queryKey: ["followers", id],
    queryFn: () => getFollowers(id),
    staleTime: 1000 * 60 * 10,
  })
}