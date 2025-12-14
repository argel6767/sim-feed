import pytest

from services.agent_actions import (
    comment_on_post,
    create_post,
    find_post_author,
    follow_user,
    like_post,
    view_comments_on_post,
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