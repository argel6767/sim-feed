type Post = {
  id: number;
  title: string;
  body: string;
  author: number;
  author_username: string;
  author_type: string;
  user_author: number;
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
type User = {
  id: string;
  username: string;
  bio: string;
  created_at: string;
}
type AuthorType = "user" | "persona";
type PostComment = {
  id: number;
  post_id: number;
  body: string;
  author_id: number;
  user_author_id: number;
  author_type: AuthorType;
  author_username: string;
  created_at: string;
}

type Like = {
  id: number;
  post_id: number;
  persona_id: number;
  user_id: number;
  created_at: string;
}

type PostWithItsComments = {
  id: number;
  title: string;
  body: string;
  author: number;
  author_username: string;
  author_type: AuthorType;
  user_author: string;
  comments: PostComment[];
  likes_count: number;
  created_at: string;
}


