import pytest
from services.agent_actions import (
    comment_on_post,
    create_post,
    find_post_author,
    follow_user,
    like_post,
    view_comments_on_post,
    view_follows_recent_actions,
    view_most_recent_posts,
)


@pytest.mark.asyncio
async def test_create_post_inserts_row(db, persona, fetch):
    result = await create_post(db, persona["persona_id"], "post created in test")
    assert "New post created successfully" in result["status"]

    rows = await fetch(
        """
        SELECT id, body, author
        FROM posts
        WHERE author = $1
        ORDER BY created_at DESC
        LIMIT 1
        """,
        persona["persona_id"],
    )
    assert rows
    assert rows[0]["body"] == "post created in test"


@pytest.mark.asyncio
async def test_view_most_recent_posts_returns_recent(db, post):
    result = await view_most_recent_posts(db)
    assert "posts successfully fetched" in result["status"]

    posts = result.get("posts_found", [])
    assert any(p["id"] == post["id"] for p in posts)


@pytest.mark.asyncio
async def test_comment_on_post_and_view_comments(db, post, persona):
    await comment_on_post(db, post["id"], persona["persona_id"], "first comment")
    await comment_on_post(db, post["id"], persona["persona_id"], "second comment")

    result = await view_comments_on_post(db, post["id"])
    assert "Successfully fetched all comments" in result["status"]

    comments = result.get("comments found", [])
    bodies = [c["body"] for c in comments]

    assert "first comment" in bodies
    assert "second comment" in bodies


@pytest.mark.asyncio
async def test_find_post_author_returns_persona(db, post, persona):
    result = await find_post_author(db, post["id"])
    assert "Author information successfully fetched" in result["status"]
    assert result["author_info"][0]["persona_id"] == persona["persona_id"]


@pytest.mark.asyncio
async def test_like_post_is_idempotent(db, post, persona, fetch):
    await like_post(db, post["id"], persona["persona_id"])
    await like_post(db, post["id"], persona["persona_id"])

    rows = await fetch(
        """
        SELECT COUNT(*) AS count
        FROM likes
        WHERE post_id = $1 AND persona_id = $2
        """,
        post["id"],
        persona["persona_id"],
    )
    assert rows[0]["count"] == 1


@pytest.mark.asyncio
async def test_follow_user_cannot_follow_self(db, persona):
    result = await follow_user(db, persona["persona_id"], persona["persona_id"])
    assert "cannot follow yourself" in result["status"].lower()


@pytest.mark.asyncio
async def test_follow_user_is_idempotent(db, persona, other_persona, fetch):
    await follow_user(db, persona["persona_id"], other_persona["persona_id"])
    await follow_user(db, persona["persona_id"], other_persona["persona_id"])

    rows = await fetch(
        """
        SELECT COUNT(*) AS count
        FROM follows
        WHERE follower = $1 AND followed = $2
        """,
        persona["persona_id"],
        other_persona["persona_id"],
    )
    assert rows[0]["count"] == 1


@pytest.mark.asyncio
async def test_view_follows_recent_actions_empty_when_not_following(db, persona):
    result = await view_follows_recent_actions(db, persona["persona_id"])
    assert result == {}


@pytest.mark.asyncio
async def test_view_follows_recent_actions_returns_followed_posts(
    db, persona, other_persona, fetch
):
    # Follow other_persona
    await follow_user(db, persona["persona_id"], other_persona["persona_id"])

    # Create posts by other_persona
    await fetch(
        """
        INSERT INTO posts (body, author)
        VALUES ($1, $2)
        """,
        "post by followed user",
        other_persona["persona_id"],
    )

    result = await view_follows_recent_actions(db, persona["persona_id"])

    assert other_persona["persona_id"] in result
    activities = result[other_persona["persona_id"]]
    assert len(activities) > 0
    assert any(
        a["activity_type"] == "post" and a["content"] == "post by followed user"
        for a in activities
    )


@pytest.mark.asyncio
async def test_view_follows_recent_actions_returns_followed_comments(
    db, persona, other_persona, fetch
):
    # Follow other_persona
    await follow_user(db, persona["persona_id"], other_persona["persona_id"])

    # Create a post by persona
    post_rows = await fetch(
        """
        INSERT INTO posts (body, author)
        VALUES ($1, $2)
        RETURNING id
        """,
        "post for commenting",
        persona["persona_id"],
    )
    post_id = post_rows[0]["id"]

    # Create comment by other_persona
    await fetch(
        """
        INSERT INTO comments (post_id, author_id, body)
        VALUES ($1, $2, $3)
        """,
        post_id,
        other_persona["persona_id"],
        "comment by followed user",
    )

    result = await view_follows_recent_actions(db, persona["persona_id"])

    assert other_persona["persona_id"] in result
    activities = result[other_persona["persona_id"]]
    assert any(
        a["activity_type"] == "comment" and a["content"] == "comment by followed user"
        for a in activities
    )


@pytest.mark.asyncio
async def test_view_follows_recent_actions_returns_followed_likes(
    db, persona, other_persona, fetch
):
    # Follow other_persona
    await follow_user(db, persona["persona_id"], other_persona["persona_id"])

    # Create a post by persona
    post_rows = await fetch(
        """
        INSERT INTO posts (body, author)
        VALUES ($1, $2)
        RETURNING id
        """,
        "post to be liked",
        persona["persona_id"],
    )
    post_id = post_rows[0]["id"]

    # Like the post as other_persona
    await fetch(
        """
        INSERT INTO likes (post_id, persona_id)
        VALUES ($1, $2)
        """,
        post_id,
        other_persona["persona_id"],
    )

    result = await view_follows_recent_actions(db, persona["persona_id"])

    assert other_persona["persona_id"] in result
    activities = result[other_persona["persona_id"]]
    assert any(
        a["activity_type"] == "like" and a["content"] == "post to be liked"
        for a in activities
    )


@pytest.mark.asyncio
async def test_view_follows_recent_actions_limits_to_5_per_type(
    db, persona, other_persona, fetch
):
    # Follow other_persona
    await follow_user(db, persona["persona_id"], other_persona["persona_id"])

    # Create 10 posts by other_persona
    for i in range(10):
        await fetch(
            """
            INSERT INTO posts (body, author)
            VALUES ($1, $2)
            """,
            f"post number {i}",
            other_persona["persona_id"],
        )

    result = await view_follows_recent_actions(db, persona["persona_id"])

    assert other_persona["persona_id"] in result
    activities = result[other_persona["persona_id"]]

    # Should have at most 5 posts (plus any comments/likes, but we only created posts)
    post_activities = [a for a in activities if a["activity_type"] == "post"]
    assert len(post_activities) <= 5


@pytest.mark.asyncio
async def test_view_follows_recent_actions_multiple_follows(
    db, persona, other_persona, fetch
):
    # Create a third persona
    third_persona_rows = await fetch(
        """
        INSERT INTO personas (description, username)
        VALUES ($1, $2)
        RETURNING persona_id, username
        """,
        "third persona",
        f"test_third_{persona['persona_id']}",
    )
    third_persona = third_persona_rows[0]

    # Follow both other_persona and third_persona
    await follow_user(db, persona["persona_id"], other_persona["persona_id"])
    await follow_user(db, persona["persona_id"], third_persona["persona_id"])

    # Create posts by both
    await fetch(
        """
        INSERT INTO posts (body, author)
        VALUES ($1, $2)
        """,
        "post by second user",
        other_persona["persona_id"],
    )
    await fetch(
        """
        INSERT INTO posts (body, author)
        VALUES ($1, $2)
        """,
        "post by third user",
        third_persona["persona_id"],
    )

    result = await view_follows_recent_actions(db, persona["persona_id"])

    # Should have activities from both followed personas
    assert other_persona["persona_id"] in result
    assert third_persona["persona_id"] in result
    assert len(result) == 2

    # Cleanup third persona
    await db.execute("DELETE FROM posts WHERE author = $1", third_persona["persona_id"])
    await db.execute(
        "DELETE FROM follows WHERE followed = $1", third_persona["persona_id"]
    )
    await db.execute(
        "DELETE FROM personas WHERE persona_id = $1", third_persona["persona_id"]
    )


@pytest.mark.asyncio
async def test_view_follows_recent_actions_mixed_activity_types(
    db, persona, other_persona, fetch
):
    # Follow other_persona
    await follow_user(db, persona["persona_id"], other_persona["persona_id"])

    # Create a post by other_persona
    post_rows = await fetch(
        """
        INSERT INTO posts (body, author)
        VALUES ($1, $2)
        RETURNING id
        """,
        "original post",
        other_persona["persona_id"],
    )
    post_id = post_rows[0]["id"]

    # Create another post for commenting/liking
    another_post_rows = await fetch(
        """
        INSERT INTO posts (body, author)
        VALUES ($1, $2)
        RETURNING id
        """,
        "post for interaction",
        persona["persona_id"],
    )
    another_post_id = another_post_rows[0]["id"]

    # Comment on the post as other_persona
    await fetch(
        """
        INSERT INTO comments (post_id, author_id, body)
        VALUES ($1, $2, $3)
        """,
        another_post_id,
        other_persona["persona_id"],
        "a comment",
    )

    # Like the post as other_persona
    await fetch(
        """
        INSERT INTO likes (post_id, persona_id)
        VALUES ($1, $2)
        """,
        another_post_id,
        other_persona["persona_id"],
    )

    result = await view_follows_recent_actions(db, persona["persona_id"])

    assert other_persona["persona_id"] in result
    activities = result[other_persona["persona_id"]]

    # Should have all three types of activities
    activity_types = {a["activity_type"] for a in activities}
    assert "post" in activity_types
    assert "comment" in activity_types
    assert "like" in activity_types
