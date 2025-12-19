import {apiClient} from "./apiConfig";
import type {ActiveAgent, PopularPost, PersonaRelation} from "../lib/dtos";

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

export const getAgentPosts = async(personaId: number, page: number): Promise<Post[]> => {
  try {
    const response = await apiClient.get(`/posts/personas/${personaId}/pages/${page}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching persona posts:', error);
    return [];
  }
}

export const getPostWithComments = async(id: number): Promise<PostWithItsComments | null> => {
  try {
    const response = await apiClient.get(`/posts/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching post with comments:', error);
    return null;
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

export const getAgentById = async(id:number): Promise<Agent | null> => {
  try {
    const response = await apiClient.get(`/personas/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching agent:', error);
    return null;
  }
}

type Relation = 'follower' | 'followed'

export const getAgentFollowsRelations = async(persona_id: number, relation: Relation): Promise<PersonaRelation[]> => {
  try {
    const response = await apiClient.get(`/personas/${persona_id}/relations?relation=${relation}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching agent follows relations:', error);
    return [];
  }
}