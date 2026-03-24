import { useQuery } from "@tanstack/react-query";
import { getUserChats } from "~/api/user-api/chats";

export const useGetUserChats = () => {
  return useQuery({
    queryKey: ["userChats"],
    queryFn: getUserChats,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false
  });
};