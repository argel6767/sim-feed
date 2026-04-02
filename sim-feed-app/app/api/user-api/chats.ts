import type { ChatsDto, ChatDto, NewChatDto, MessageDto, PageDto } from "~/lib/user-api-dtos";
import { userApiClient } from "../apiConfig";

const V1_CHATS = "/api/v1/chats"

export const getUserChats = async (): Promise<ChatsDto> => {
  const response = await userApiClient.get<ChatsDto>(V1_CHATS);
  return response.data;
};

export const getChatMessages = async (chatId: number, page: number, size: number): Promise<PageDto<MessageDto>> => {
  const response = await userApiClient.get<PageDto<MessageDto>>(`${V1_CHATS}/${chatId}/messages`, {params: {page, size}});
  return response.data;
};

export const createChat = async (newChat: NewChatDto): Promise<ChatDto> => {
  const response = await userApiClient.post<ChatDto>(V1_CHATS, newChat);
  return response.data;
};

export const deleteChat = async (chatId: number): Promise<void> => {
  await userApiClient.delete(`${V1_CHATS}/${chatId}`);
};

export const updateChatName = async (chatId: number, newName: string): Promise<void> => {
  await userApiClient.patch(`${V1_CHATS}/${chatId}`, { chatName: newName });
};

export const leaveChat = async (chatId: number): Promise<void> => {
  await userApiClient.delete(`${V1_CHATS}/${chatId}/members`);
};

export const kickMember = async (chatId: number, memberId: number): Promise<void> => {
  await userApiClient.delete(`${V1_CHATS}/${chatId}/members/${memberId}`);
};

export const addMember = async (chatId: number, memberId: number): Promise<void> => {
  await userApiClient.post(`${V1_CHATS}/${chatId}/members/${memberId}`);
};