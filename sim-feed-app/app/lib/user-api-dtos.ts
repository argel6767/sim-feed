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
