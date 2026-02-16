import { userApiClient } from "../apiConfig"
import type { NewPostDto, PostDto } from "../../lib/user-api-dtos"

const V1_POSTS = 'api/v1/posts';

export const createPost = async (post: NewPostDto, token: string): Promise<PostDto> => {
  const response = await userApiClient.post<PostDto>(V1_POSTS, post, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};