import {apiClient} from "./apiConfig";

export const getRandomPosts = async(numPosts: number): Promise<Post[]> => {
  try {
    const response = await apiClient.get(`/posts/random/${numPosts}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching random posts:', error);
    return [];
  }
}