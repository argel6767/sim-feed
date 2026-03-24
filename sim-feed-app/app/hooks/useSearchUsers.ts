import { searchUsers } from "~/api/user-api/users";
import { useQuery } from "@tanstack/react-query";

export const useSearchUsers = (query: string) => {
  return useQuery({
    queryKey: ["users", query],
    queryFn: () => searchUsers(query),
    enabled: query.length > 3
  });
};