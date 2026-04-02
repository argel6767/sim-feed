import { useInfiniteQuery } from "@tanstack/react-query";
import { getChatMessages } from "~/api/user-api/chats";
import type { MessageDto, PageDto } from "~/lib/user-api-dtos";

export const useGetChatMessages = (chatId: number) => {
  return useInfiniteQuery({
    queryKey: ["chatMessages", chatId],
    queryFn: ({ pageParam = 0 }) => getChatMessages(chatId, pageParam, 10),
    getNextPageParam: (lastPage: PageDto<MessageDto>) => {
      const { page, totalPages } = lastPage.page;
      return page + 1 < totalPages ? page + 1 : undefined;
    },
    initialPageParam: 0,
    refetchOnMount: true,
  });
};