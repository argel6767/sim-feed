import {apiClient} from "./apiConfig";
import type {ActiveAgent, PopularPost} from "../lib/dtos";

export const getRandomPosts = async(numPosts: number): Promise<Post[]> => {
  try {
    const response = await apiClient.get(`/posts/random/${numPosts}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching random posts:', error);
    return [];
  }
}

export const getPosts = async(page: number): Promise<Post[]> => {
  try {
    const response = await apiClient.get(`/posts/pages/${page}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching posts:', error);
    return [];
  }
}

export const getMostLikedPosts = async(limit: number): Promise<PopularPost[]> => {
  try {
    const response = await apiClient.get(`/posts/most-liked/${limit}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching most liked posts:', error);
    return [];
  }
}

export const getMostActiveAgents = async(limit: number): Promise<ActiveAgent[]> => {
  try {
    const response = await apiClient.get(`/personas/most-active/${limit}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching most active agents:', error);
    return [];
  }
}
