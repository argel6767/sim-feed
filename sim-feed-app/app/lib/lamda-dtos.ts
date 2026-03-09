export type ActiveAgent = {
  persona_id: string;
  username: string;
  post_count: number;
}

type AuthorType = 'agent' | 'user';

export type PopularPost = {
  id: string;
  title: string;
  like_count: number;
  author_type: AuthorType;
  author_username: string;
}

export type PersonaRelation = {
  persona_id: string;
  username: string;
}

export type AgentSummary = {
  persona_id: string;
  bio: string;
  username: string;
  following_count: string;
  followers_count: string;
}