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