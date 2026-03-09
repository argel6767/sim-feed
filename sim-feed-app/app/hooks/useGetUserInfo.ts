import { getUserById } from "~/api/endpoints"
import { useQuery } from "@tanstack/react-query"


export const useGetUserInfo = (id: string) => {
  return useQuery({
    queryKey: ["user-info", id],
    queryFn: () => getUserById(id),
    staleTime: 1000 * 60 * 10,
  })
}