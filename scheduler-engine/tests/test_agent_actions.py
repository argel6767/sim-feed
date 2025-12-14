# tests/test_agent_actions.py
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
async def test_create_post_inserts_row(persona, fetch):
    result = await create_post(persona["persona_id"], "post created in test")
    assert "New post created successfully" in result["status"]

    rows = await fetch(
        "SELECT id, body, author FROM posts WHERE author = $1 ORDER BY created_at DESC LIMIT 1",
        persona["persona_id"],
    )
    assert rows
    assert rows[0]["body"] == "post created in test"


@pytest.mark.asyncio
async def test_view_most_recent_posts_returns_recent(post):
    result = await view_most_recent_posts()
    assert "posts successfully fetched" in result["status"]
    posts = result.get("posts found", [])
    assert any(p["id"] == post["id"] for p in posts)


@pytest.mark.asyncio
async def test_comment_on_post_and_view_comments(post, persona):
    await comment_on_post(post["id"], persona["persona_id"], "first comment")
    await comment_on_post(post["id"], persona["persona_id"], "second comment")

    result = await view_comments_on_post(post["id"])
    assert "Successfully fetched all comments" in result["status"]

    comments = result.get("comments found", [])
    assert len(comments) >= 2
    bodies = [c["body"] for c in comments]
    assert "first comment" in bodies
    assert "second comment" in bodies


@pytest.mark.asyncio
async def test_find_post_author_returns_persona(post, persona):
    result = await find_post_author(post["id"])
    assert "Author information successfully fetched" in result["status"]
    assert result["author_info"][0]["persona_id"] == persona["persona_id"]


@pytest.mark.asyncio
async def test_like_post_is_idempotent(post, persona, fetch):
    await like_post(post["id"], persona["persona_id"])
    await like_post(post["id"], persona["persona_id"])

    rows = await fetch(
        "SELECT COUNT(*) AS count FROM likes WHERE post_id = $1 AND persona_id = $2",
        post["id"],
        persona["persona_id"],
    )
    assert rows[0]["count"] == 1


@pytest.mark.asyncio
async def test_follow_user_cannot_follow_self(persona):
    result = await follow_user(persona["persona_id"], persona["persona_id"])
    assert "cannot follow yourself" in result["status"].lower()


@pytest.mark.asyncio
async def test_follow_user_is_idempotent(persona, other_persona, fetch):
    await follow_user(persona["persona_id"], other_persona["persona_id"])
    await follow_user(persona["persona_id"], other_persona["persona_id"])

    rows = await fetch(
        "SELECT COUNT(*) AS count FROM follows WHERE follower = $1 AND followed = $2",
        persona["persona_id"],
        other_persona["persona_id"],
    )
    assert rows[0]["count"] == 1