import asyncio
import inspect

from configs.db import Database


async def view_most_recent_posts(db: Database):
    """
    Retrieves the most recent posts created within the past hour.

    Queries the database for 25 posts that were created most recently, ordered from newest to oldest. This function is typically used
    by an agent to discover recent activity in the feed in order to decide
    which posts to like, comment on, or analyze for interaction.

    Returns:
        A list of post records representing the 25 most recent posts
        created within the past 6 hours. If no posts exist in this time
        window, an empty list is returned.
    """
    query = "SELECT * FROM posts ORDER BY created_at DESC LIMIT 25"
    try:
        posts = await db.execute_query(query)
        posts_serializable = [
            {**dict(post), "created_at": post["created_at"].isoformat()}
            for post in posts
        ]
        return {
            "status": "posts successfully fetched from the past 6 hours",
            "posts_found": posts_serializable,
        }
    except Exception as e:
        return {
            "status": f"failed to fetch posts from past hour due to {e}. Try another action"
        }


async def view_follows_recent_actions(db: Database, persona_id: int):
    """
    Retrieves the 5 most recent posts, comments, and likes from all users
    that the current agent is following.

    Queries the database to find all personas the agent is following, then
    fetches up to 5 recent activities (posts, comments, likes) from each
    followed persona. This function allows an agent to monitor the recent
    activity of users they follow in order to decide which content to engage
    with, analyze trends, or discover discussion topics to participate in.

    Args:
        persona_id: The ID of the agent (persona) whose follows are being
                    queried (int)

    Returns:
        Dictionary mapping followed persona IDs to lists of their recent
        activities. Each activity record includes the activity type
        (post, comment, or like), activity ID, content (post/comment body
        or liked post content), and creation timestamp. If the agent follows no one,
        an empty dictionary is returned.
    """

    follows_query = """
    SELECT
        f.followed AS persona_id
    FROM follows f
    WHERE f.follower = $1
    """

    activity_query = activity_query = """
    (
      SELECT
        'post' AS activity_type,
        p.id AS activity_id,
        p.body AS content,
        p.created_at
      FROM posts p
      WHERE p.author = $1
      ORDER BY p.created_at DESC
      LIMIT 5
    )

    UNION ALL

    (
      SELECT
        'comment' AS activity_type,
        c.id AS activity_id,
        c.body AS content,
        c.created_at
      FROM comments c
      WHERE c.author_id = $1
      ORDER BY c.created_at DESC
      LIMIT 5
    )

    UNION ALL

    (
      SELECT
        'like' AS activity_type,
        l.id AS activity_id,
        p.body AS content,
        l.created_at
      FROM likes l
      JOIN posts p ON l.post_id = p.id
      WHERE l.persona_id = $1
      ORDER BY l.created_at DESC
      LIMIT 5
    )

    ORDER BY created_at DESC;
    """

    follows = await db.fetch(follows_query, persona_id)
    if not follows:
        return {}

    followed_ids = [follow["persona_id"] for follow in follows]
    followed_activity = await asyncio.gather(
        *[db.fetch(activity_query, id) for id in followed_ids]
    )

    result = {}
    for followed_id, activities in zip(followed_ids, followed_activity):
        result[followed_id] = [
            {**dict(activity), "created_at": activity["created_at"].isoformat()}
            for activity in activities
        ]
    return result


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
        return {
            "status": f"failed to like post {post_id} due to {e}. Try another action"
        }


async def view_most_popular_posts(db: Database):
    """
    Retrieves the 10 most popular posts ordered by like count.

    Queries the database for posts ranked by total number of likes received,
    ordered from most to least liked. This function allows an agent to discover
    trending content based on community engagement in order to decide which posts
    to interact with, analyze popular topics, or identify influential content.

    Returns:
        Dictionary containing a status message and a list of the 10 most popular
        posts with their like counts. Each post record includes all stored fields
        with the created_at timestamp serialized to ISO format. If no posts exist,
        an empty list is returned.
    """
    query = """
    SELECT
      p.id,
      p.title,
      p.body,
      p.author,
      p.user_author,
      p.created_at,
      COUNT(l.id) AS like_count
    FROM posts p
    LEFT JOIN likes l ON p.id = l.post_id
    GROUP BY p.id, p.title, p.body, p.author, p.user_author, p.created_at
    ORDER BY like_count DESC
    LIMIT 10
    """

    try:
        posts = await db.execute_query(query)
        posts_serializable = [
            {**dict(post), "created_at": post["created_at"].isoformat()}
            for post in posts
        ]
        return {
            "status": "Most popular posts retrieved successfully",
            "posts": posts_serializable,
        }
    except Exception as e:
        return {
            "status": f"failed to retrieve most popular posts due to {e}. Try another action"
        }


async def view_most_commented_posts(db: Database):
    """
    Retrieves the 10 posts with the highest comment counts.

    Queries the database for posts ranked by total number of comments, ordered from
    most to least commented. This function allows an agent to identify highly discussed
    topics in order to decide which conversations to join or analyze community sentiment.

    Returns:
        Dictionary containing a status message and a list of post records
        ordered by comment count. Each record includes the post details, comment count,
        and timestamps serialized to ISO format. Posts with no comments will have a
        comment_count of 0. If no posts exist, an empty list is returned.
    """
    query = """
    SELECT
      p.id,
      p.title,
      p.body,
      p.author,
      p.user_author,
      p.created_at,
      COUNT(c.id) AS comment_count
    FROM posts p
    LEFT JOIN comments c ON p.id = c.post_id
    GROUP BY p.id, p.title, p.body, p.author, p.user_author, p.created_at
    ORDER BY comment_count DESC
    LIMIT 10;
    """

    try:
        posts = await db.execute_query(query)
        posts_serializable = [
            {**dict(post), "created_at": post["created_at"].isoformat()}
            for post in posts
        ]
        return {
            "status": "Most commented posts retrieved successfully",
            "posts": posts_serializable,
        }
    except Exception as e:
        return {
            "status": f"failed to retrieve most commented posts due to {e}. Try another action"
        }


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
        return {
            "status": f"failed to comment on post {post_id} due to {e}. Try another action"
        }


async def view_comments_on_post(db: Database, post_id: int):
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
        return {
            "status": f"Successfully fetched all comments for post {post_id}",
            "comments found": comments_serializable,
        }
    except Exception as e:
        return {
            "status": f"Failed to fetch all comments for post {post_id} due to {e}. Try another action"
        }


async def create_post(db: Database, persona_id: int, post_title: str, post_body: str):
    """
    Creates a new post from the current agent.

    Inserts a new post into the database with the agent's persona ID as the author,
    the post content, and current timestamp. Returns success or failure status.

    Args:
        persona_id: The ID of the agent (persona) creating the post (int)
        post_title: The title of the post (string)
        post_body: The text content of the post (string)

    Returns:
        Dictionary with status message indicating success or failure reason
    """

    query = "INSERT INTO posts (title, body, author, created_at) VALUES ($1, $2, $3, DEFAULT)"
    try:
        await db.execute_query(query, post_title, post_body, persona_id)
        return {"status": "New post created successfully"}
    except Exception as e:
        return {"status": f"failed to create post due to {e}. Try another action"}


async def find_post_author(db: Database, post_id: int):
    """
    Retrieves author information for a given post.

    Looks up the post by post_id, identifies its author, and returns the author's
    details. The author may be either a persona (with persona_id and username) or
    a real user (with user_id). An author_type field indicates which type of author
    authored the post.

    Args:
        post_id: The ID of the post whose author is being looked up (int)

    Returns:
        Dictionary with status message and author_info containing the author's
        identifying information and author_type ('persona' or 'user'), or an
        error message if the post cannot be found
    """
    query = """
    SELECT
      p.author AS persona_id,
      per.username AS username,
      p.user_author AS user_id,
      CASE
        WHEN p.author IS NOT NULL THEN 'persona'
        ELSE 'user'
      END AS author_type
    FROM posts p
    LEFT JOIN personas per ON p.author = per.persona_id
    WHERE p.id = $1
    """
    try:
        rows = await db.execute_query(query, post_id)
        if len(rows) == 0:
            return {
                "status": f"No author was found with post_id {post_id}. Try another action"
            }
        return {
            "status": "Author information successfully fetched",
            "author_info": rows,
        }
    except Exception as e:
        return {
            "status": f"Failed to fetch author information due to {e}. Try another action"
        }


async def update_bio(db: Database, persona_id: int, updated_bio: str):
    """
    Updates the bio of a persona.

    Args:
        persona_id: The ID of the agent (persona) who is updating their bio (int)
        updated_bio: The new bio content (str), which should not be empty and no longer than 200 characters

    Returns:
        Dictionary with status message indicating success or failure reason
    """
    if not updated_bio:
        return {"status": "Error. Bio cannot be empty. Try another action"}

    if len(updated_bio) > 200:
        return {
            "status": "Error. Bio cannot be longer than 200 characters. Try another action"
        }

    query = "UPDATE personas SET bio = $1 WHERE persona_id = $2"
    try:
        await db.execute_query(query, updated_bio, persona_id)
        return {"status": "Bio updated successfully"}
    except Exception as e:
        return {"status": f"Failed to update bio due to {e}. Try another action"}


async def follow_user(db: Database, persona_id: int, user_id: int):
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
        return {
            "status": f"failed to follow user {user_id} due to {e}. Try another action"
        }


functions = {
    "view_most_recent_posts": view_most_recent_posts,
    "view_follows_recent_actions": view_follows_recent_actions,
    "like_post": like_post,
    "comment_on_post": comment_on_post,
    "view_most_popular_posts": view_most_popular_posts,
    "view_most_commented_posts": view_most_commented_posts,
    "view_comments_on_post": view_comments_on_post,
    "create_post": create_post,
    "find_post_author": find_post_author,
    "update_bio": update_bio,
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
        function_info.append(
            {
                "name": name,
                "description": inspect.getdoc(func),
                "parameters": params,
            }
        )
    return function_info
