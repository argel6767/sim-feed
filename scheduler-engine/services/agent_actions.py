import inspect

from _pytest.stash import D
from configs.db import Database

async def view_most_recent_posts(db: Database):
    """
    Retrieves the most recent posts created within the past hour.

    Queries the database for up to 20 posts that were created in the last
    hour, ordered from newest to oldest. This function is typically used
    by an agent to discover recent activity in the feed in order to decide
    which posts to like, comment on, or analyze for interaction.

    Returns:
        A list of post records representing the 20 most recent posts
        created within the past hour. If no posts exist in this time
        window, an empty list is returned.
    """
    query = "SELECT * FROM posts WHERE created_at >= NOW() - INTERVAL '1 hour' ORDER BY created_at DESC LIMIT 20"
    try:
        posts = await db.execute_query(query)
        posts_serializable = [
            {**dict(post), "created_at": post["created_at"].isoformat()}
            for post in posts
        ]
        return {"status": "posts successfully fetched from the past hour","posts_found": posts_serializable}
    except Exception as e:
        return {"status": f"failed to fetch posts from past hour due to {e}. Try another action"}

async def like_post(db: Database, post_id: int, persona_id: int):
    """
    Adds a like from the current agent to a post.

    Records a new like entry in the database for the post with the agent's persona ID
    and current timestamp. Returns success or failure status.

    Args:
        post_id: The ID of the post being liked (int)
        persona_id: The ID of the agent (persona) liking the post (int)

    Returns:
        Dictionary with status message indicating success or failure reason
    """


    
    query = "INSERT INTO likes (post_id, persona_id, created_at) VALUES ($1, $2, DEFAULT) ON CONFLICT (post_id, persona_id) DO NOTHING"
    try:
        await db.execute_query(query, post_id, persona_id)
        return {"status": f"{post_id} liked successfully"}
    except Exception as e:
        return {"status": f"failed to like post {post_id} due to {e}. Try another action"}

async def comment_on_post(db: Database, post_id: int, persona_id: int, body: str):
    """
      Creates a new comment on a post from the current agent.

      Inserts a comment into the database with the post ID, the agent's persona ID as
      the commenter, the comment text, and current timestamp. Returns success or failure status.

      Args:
          post_id: The ID of the post being commented on (int)
          persona_id: The ID of the agent (persona) writing the comment (int)
          body: The text content of the comment (string)

      Returns:
          Dictionary with status message indicating success or failure reason
      """
    
    query = "INSERT INTO comments (post_id, author_id, body, created_at) VALUES ($1, $2, $3, DEFAULT)"
    try:
        await db.execute_query(query, post_id, persona_id, body)
        return {"status": f"{post_id} commented successfully"}
    except Exception as e:
        return {"status": f"failed to comment on post {post_id} due to {e}. Try another action"}
async def view_comments_on_post(db:Database, post_id: int):
    """
    Retrieves all comments associated with a specific post.

    Queries the database for every comment linked to the given post ID,
    ordered from newest to oldest by creation time. This function allows
    an agent to review discussion activity on a post in order to analyze
    sentiment, decide whether to reply, or understand engagement context.

    Args:
        post_id: The ID of the post whose comments are being retrieved (int)

    Returns:
        Dictionary containing a status message and a list of comment records.
        Each comment includes all stored fields with the created_at timestamp
        serialized to ISO format. If no comments exist for the post, an empty
        list is returned.
    """
    query = "SELECT * FROM comments WHERE post_id = $1 ORDER BY created_at DESC"
    try:
        comments = await db.execute_query(query, post_id)
        comments_serializable = [
            {**dict(comment), "created_at": comment["created_at"].isoformat()}
            for comment in comments
        ]
        return {"status":f"Successfully fetched all comments for post {post_id}","comments found": comments_serializable}
    except Exception as e:
        return {"status":f"Failed to fetch all comments for post {post_id} due to {e}. Try another action"}

async def create_post(db:Database, persona_id: int, post_body: str):
    """
    Creates a new post from the current agent.

    Inserts a new post into the database with the agent's persona ID as the author,
    the post content, and current timestamp. Returns success or failure status.

    Args:
        persona_id: The ID of the agent (persona) creating the post (int)
        post_body: The text content of the post (string)

    Returns:
        Dictionary with status message indicating success or failure reason
    """
    
    query = "INSERT INTO posts (body, author, created_at) VALUES ($1, $2, DEFAULT)"
    try:
        await db.execute_query(query, post_body, persona_id)
        return {"status": "New post created successfully"}
    except Exception as e:
        return {"status": f"failed to create post due to {e}. Try another action"}


async def find_post_author(db:Database, post_id: int):
    """
    Retrieves author information for a given post.

    Looks up the post by post_id, identifies its author, and returns the author's
    persona details (persona_id, username). Returns author
    information or an error message if the post or author cannot be found.

    Args:
        post_id: The ID of the post whose author is being looked up (int)

    Returns:
        Dictionary with status message and author_info containing the author's
        persona_id and username or error message
    """
    query = "SELECT persona_id, username FROM personas WHERE persona_id = (SELECT author FROM posts WHERE id = $1)"
    try:
        rows = await db.execute_query(query, post_id)
        if len(rows) == 0:
            return {"status": f"No author was found with post_id {post_id}. Try another action"}
        return {"status": "Author information successfully fetched","author_info": rows}
    except Exception as e:
        return {"status": f"Failed to fetch author information due to {e}. Try another action"}


async def follow_user(db:Database, persona_id: int, user_id: int):
    """
        Creates a follow relationship where the current agent follows another user.

        Records that the agent (persona_id) is now following the specified user (user_id)
        in the database with the current timestamp. Returns success or failure status.

        Args:
            persona_id: The ID of the agent (persona) who is following (int)
            user_id: The ID of the user (persona) being followed by the agent (int)

        Returns:
            Dictionary with status message indicating success or failure reason
        """
    if persona_id == user_id:
        return {"status": "Error. You cannot follow yourself. Try another action"}
    
    query = "INSERT INTO follows (follower, followed, created_at) VALUES ($1, $2, DEFAULT) ON CONFLICT (follower, followed) DO NOTHING"
    try:
        await db.execute_query(query, persona_id, user_id)
        return {"status": f"{user_id} followed successfully"}
    except Exception as e:
        return {"status": f"failed to follow user {user_id} due to {e}. Try another action"}

functions = {
    "view_most_recent_posts": view_most_recent_posts,
    "like_post": like_post,
    "comment_on_post": comment_on_post,
    "view_comments_on_post": view_comments_on_post,
    "create_post": create_post,
    "find_post_author": find_post_author,
    "follow_user": follow_user,
}

def get_function_info() -> list[dict]:
    function_info = []
    for name, func in functions.items():
        sig = inspect.signature(func)
        params = [
            {"name": p.name, "type": str(p.annotation.__name__)}
            for p in sig.parameters.values()
            if p.name != "db"
        ]
        function_info.append({
            "name": name,
            "description": inspect.getdoc(func),
            "parameters": params,
        })
    return function_info