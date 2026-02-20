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
  userFollowed?: UserDto;
  personaFollowed?: PersonaDto;
}

export type FollowExistsDto = {
  isFollowing: boolean;
  followId: number;
}