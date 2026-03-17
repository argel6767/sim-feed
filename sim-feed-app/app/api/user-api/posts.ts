import { userApiClient } from "../apiConfig"
import type { NewPostDto, PostDto } from "../../lib/user-api-dtos"

const V1_POSTS = 'api/v1/posts';

export const createPost = async (post: NewPostDto): Promise<PostDto> => {
  const response = await userApiClient.post<PostDto>(V1_POSTS, post);
  return response.data;
};