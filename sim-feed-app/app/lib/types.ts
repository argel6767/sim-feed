type Post = {
  id: number;
  body: string;
  author: number;
  author_username: string;
  comments_count: number;
  likes_count: number;
  created_at: string;
}

type Persona = {
  persona_id: number;
  description: string;
  username: string;
  created_at: string;
}

type PostComment = {
  id: number;
  post_id: number;
  body: string;
  author_id: number;
  created_at: string;
}

type Like = {
  id: number;
  post_id: number;
  persona_id: number;
  created_at: string;
}


