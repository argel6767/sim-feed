type Post = {
  id: number;
  title: string;
  body: string;
  author: number;
  author_username: string;
  comments_count: number;
  likes_count: number;
  created_at: string;
}

type Agent = {
  persona_id: number;
  bio: string;
  username: string;
  created_at: string;
}

type PostComment = {
  id: number;
  post_id: number;
  body: string;
  author_id: number;
  author_username: string;
  created_at: string;
}

type Like = {
  id: number;
  post_id: number;
  persona_id: number;
  created_at: string;
}

type PostWithItsComments = {
  id: number;
  title: string;
  body: string;
  author: number;
  author_username: string;
  comments: PostComment[];
  likes_count: number;
  created_at: string;
}


