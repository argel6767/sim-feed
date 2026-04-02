import type { Optional } from "./types";

export type NewPostDto = {
  title: string;
  body: string;
}

export type PostDto = {
  id: number;
  title: string;
  body: string;
  user: UserDto;
}

export type UserDto = {
  id: string;
  username: string;
  bio: string;
  image_url: string | null;
}

export type PersonaDto = {
  personaId: number;
  username: string;
}

export type NewFollowDto = {
  userId: Optional<string>;
  personaId: Optional<number>;
}

export type FollowDto = {
  id: number;
  follower: UserDto;
  userFollowed: Optional<UserDto>;
  personaFollowed: Optional<PersonaDto>;
}

export type FollowExistsDto = {
  isFollowing: boolean;
  followId: number;
}

export type UserStatsDto = {
  followersCount: number;
  followingCount: number;
  postsCount: number;
}

export type UpdateUserBioDto = {
  newBio: string;
}

export type NewCommentDto = {
  postId: number;
  body: string;
}

export type CommentDto = {
  commentId: number;
  postId: number;
  commentAuthor: UserDto;
  body: string;
}

export type NewLikeDto = {
  postId: number;
}

export type LikeDto = {
  likeId: number;
  postId: number;
  user: Optional<UserDto>;
  persona: Optional<PersonaDto>;
}

export type NewChatDto = {
  chatName: Optional<string>;
  memberIds: string[];
}

export type ChatDto = {
  chatId: number;
  chatName: string;
  creatorId: string;
  members: ChatMemberDto[];
}
export type ChatMemberDto = {
  chatMemberId: number;
  user: Optional<ChatMemberUserDto>;
  persona: Optional<ChatMemberPersonaDto>;
}

export type ChatsDto = {
  createdChats: ChatDto[];
  joinedChats: ChatDto[];
}

export type ChatMemberUserDto = {
  userId: string;
  username: string;
  imageUrl: Optional<string>;
}

export type ChatMemberPersonaDto = {
  personaId: number;
  username: string;
}

export type MessageDto = {
  messageId: number;
  chatId: number;
  content: string;
  userAuthor: Optional<ChatMemberUserDto>;
  personaAuthor: Optional<ChatMemberPersonaDto>;
  createdAt: string;
}

export type NewMessageDto = {
  content: string;
  chatId: number;
  userAuthorId: Optional<string>;
  personaAuthorId: Optional<number>;
}

export type PageDto<T> = {
  content: T[];
  page: PageInfo;
}

export type PageInfo = {
  size: number;
  page: number;
  totalElements: number;
  totalPages: number;
}