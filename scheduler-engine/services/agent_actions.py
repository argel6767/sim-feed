import inspect
from datetime import datetime, UTC
from configs.db import db


async def like_post(post_id: int, persona_id: int):
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
    date = datetime.now(UTC)
    query = "INSERT INTO likes (post_id, persona_id, created_at) VALUES ($1, $2, $3)"
    try:
        await db.execute_query(query, post_id, persona_id, date)
        return {"status": f"{post_id} liked successfully"}
    except Exception as e:
        return {"status": f"failed to like post {post_id} due to {e}. Try another action"}

async def comment_on_post(post_id: int, persona_id: int, comment_body: str):
    """
      Creates a new comment on a post from the current agent.

      Inserts a comment into the database with the post ID, the agent's persona ID as
      the commenter, the comment text, and current timestamp. Returns success or failure status.

      Args:
          post_id: The ID of the post being commented on (int)
          persona_id: The ID of the agent (persona) writing the comment (int)
          comment_body: The text content of the comment (string)

      Returns:
          Dictionary with status message indicating success or failure reason
      """
    date = datetime.now(UTC)
    query = "INSERT INTO comments (post_id, author_id, comment_body, created_at) VALUES ($1, $2, $3, $4)"
    try:
        await db.execute_query(query, post_id, persona_id, comment_body, date)
        return {"status": f"{post_id} commented successfully"}
    except Exception as e:
        return {"status": f"failed to comment on post {post_id} due to {e}. Try another action"}


async def create_post(persona_id: int, post_body: str):
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
    date = datetime.now(UTC)
    query = "INSERT INTO posts (body, author, created_at) VALUES ($1, $2, $3)"
    try:
        await db.execute_query(query, persona_id, post_body, date)
        return {"status": "New post created successfully"}
    except Exception as e:
        return {"status": f"failed to create post due to {e}. Try another action"}


async def find_post_author(post_id: int):
    """
    Retrieves author information for a given post.

    Looks up the post by post_id, identifies its author, and returns the author's
    persona details (persona_id, username, last_active timestamp). Returns author
    information or an error message if the post or author cannot be found.

    Args:
        post_id: The ID of the post whose author is being looked up (int)

    Returns:
        Dictionary with status message and author_info containing the author's
        persona_id, username, and last_active timestamp, or error message
    """
    query = "SELECT persona_id, username, last_active FROM personas WHERE persona_id = (SELECT author_id FROM posts WHERE post_id = $1)"
    try:
        rows = await db.execute_query(query, post_id)
        if len(rows) == 0:
            return {"status": f"No author was found with post_id {post_id}. Try another action"}
        return {"status": "Author information successfully fetched","author_info": rows}
    except Exception as e:
        return {"status": f"Failed to fetch author information due to {e}. Try another action"}


async def follow_user(persona_id: int, user_id: int):
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
    date = datetime.now(UTC)
    query = "INSERT INTO follows (follower, followed, created_at) VALUES ($1, $2, $3)"
    try:
        await db.execute_query(query, persona_id, user_id, date)
        return {"status": f"{user_id} followed successfully"}
    except Exception as e:
        return {"status": f"failed to follow user {user_id} due to {e}. Try another action"}

functions = {
    "like_post": like_post,
    "comment_on_post": comment_on_post,
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
        ]
        function_info.append({
            "name": name,
            "description": inspect.getdoc(func),
            "parameters": params,
        })
    return function_info