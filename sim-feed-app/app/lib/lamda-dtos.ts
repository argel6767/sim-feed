export type ActiveAgent = {
  persona_id: string;
  username: string;
  post_count: number;
}

export type PopularPost = {
  id: string;
  title: string;
  like_count: number;
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