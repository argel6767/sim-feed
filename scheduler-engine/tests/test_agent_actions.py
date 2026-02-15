import pytest
from services.agent_actions import (
    comment_on_post,
    create_post,
    find_post_author,
    follow_user,
    like_post,
    update_bio,
    view_comments_on_post,
    view_follows_recent_actions,
    view_most_commented_posts,
    view_most_popular_posts,
    view_most_recent_posts,
)


@pytest.mark.asyncio
async def test_create_post_inserts_row(db, persona, fetch):
    result = await create_post(
        db, persona["persona_id"], "test post title", "post created in test"
    )
    assert "New post created successfully" in result["status"]

    rows = await fetch(
        """
        SELECT id, title, body, author
        FROM posts
        WHERE author = $1
        ORDER BY created_at DESC
        LIMIT 1
        """,
        persona["persona_id"],
    )
    assert rows
    assert rows[0]["title"] == "test post title"
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
    author = result["author_info"][0]
    assert author["persona_id"] == persona["persona_id"]
    assert author["username"] == persona["username"]
    assert author["author_type"] == "persona"
    assert author["user_id"] is None


@pytest.mark.asyncio
async def test_find_post_author_returns_user(db, fetch):
    # Create a user
    user_rows = await fetch(
        """
        INSERT INTO users (id, bio)
        VALUES ($1, $2)
        RETURNING id
        """,
        "clerk_test_user_123",
        "test user bio",
    )
    user_id = user_rows[0]["id"]

    # Create a post authored by the user
    post_rows = await fetch(
        """
        INSERT INTO posts (title, body, user_author)
        VALUES ($1, $2, $3)
        RETURNING id
        """,
        "user post title",
        "user post body",
        user_id,
    )
    post_id = post_rows[0]["id"]

    result = await find_post_author(db, post_id)
    assert "Author information successfully fetched" in result["status"]
    author = result["author_info"][0]
    assert author["user_id"] == user_id
    assert author["author_type"] == "user"
    assert author["persona_id"] is None
    assert author["username"] is None

    # Cleanup
    await fetch("DELETE FROM posts WHERE id = $1", post_id)
    await fetch("DELETE FROM users WHERE id = $1", user_id)


@pytest.mark.asyncio
async def test_find_post_author_not_found_for_missing_post(db):
    result = await find_post_author(db, 999999)
    assert "No author was found" in result["status"]


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
        INSERT INTO posts (title, body, author)
        VALUES ($1, $2, $3)
        """,
        "test title",
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
        INSERT INTO posts (title, body, author)
        VALUES ($1, $2, $3)
        RETURNING id
        """,
        "test title",
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
        INSERT INTO posts (title, body, author)
        VALUES ($1, $2, $3)
        RETURNING id
        """,
        "test title",
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
            INSERT INTO posts (title, body, author)
            VALUES ($1, $2, $3)
            """,
            f"post title {i}",
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
        INSERT INTO personas (description, bio, username)
        VALUES ($1, $2, $3)
        RETURNING persona_id, username
        """,
        "third persona",
        "third persona bio",
        f"test_third_{persona['persona_id']}",
    )
    third_persona = third_persona_rows[0]

    # Follow both other_persona and third_persona
    await follow_user(db, persona["persona_id"], other_persona["persona_id"])
    await follow_user(db, persona["persona_id"], third_persona["persona_id"])

    # Create posts by both
    await fetch(
        """
        INSERT INTO posts (title, body, author)
        VALUES ($1, $2, $3)
        """,
        "test title",
        "post by second user",
        other_persona["persona_id"],
    )
    await fetch(
        """
        INSERT INTO posts (title, body, author)
        VALUES ($1, $2, $3)
        """,
        "test title",
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
        INSERT INTO posts (title, body, author)
        VALUES ($1, $2, $3)
        RETURNING id
        """,
        "test title",
        "original post",
        other_persona["persona_id"],
    )
    post_id = post_rows[0]["id"]

    # Create another post for commenting/liking
    another_post_rows = await fetch(
        """
        INSERT INTO posts (title, body, author)
        VALUES ($1, $2, $3)
        RETURNING id
        """,
        "test title",
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


@pytest.mark.asyncio
async def test_update_bio_success(db, persona, fetch):
    result = await update_bio(db, persona["persona_id"], "This is my new bio")
    assert "Bio updated successfully" in result["status"]

    rows = await fetch(
        """
        SELECT bio
        FROM personas
        WHERE persona_id = $1
        """,
        persona["persona_id"],
    )
    assert rows
    assert rows[0]["bio"] == "This is my new bio"


@pytest.mark.asyncio
async def test_update_bio_empty_bio_rejected(db, persona):
    result = await update_bio(db, persona["persona_id"], "")
    assert "Bio cannot be empty" in result["status"]


@pytest.mark.asyncio
async def test_update_bio_none_bio_rejected(db, persona):
    result = await update_bio(db, persona["persona_id"], None)
    assert "Bio cannot be empty" in result["status"]


@pytest.mark.asyncio
async def test_update_bio_too_long_rejected(db, persona):
    long_bio = "a" * 201
    result = await update_bio(db, persona["persona_id"], long_bio)
    assert "Bio cannot be longer than 200 characters" in result["status"]


@pytest.mark.asyncio
async def test_update_bio_exactly_200_characters_allowed(db, persona, fetch):
    bio_200_chars = "a" * 200
    result = await update_bio(db, persona["persona_id"], bio_200_chars)
    assert "Bio updated successfully" in result["status"]

    rows = await fetch(
        """
        SELECT bio
        FROM personas
        WHERE persona_id = $1
        """,
        persona["persona_id"],
    )
    assert rows
    assert rows[0]["bio"] == bio_200_chars


@pytest.mark.asyncio
async def test_update_bio_overwrites_existing_bio(db, persona, fetch):
    await update_bio(db, persona["persona_id"], "First bio")
    result = await update_bio(db, persona["persona_id"], "Second bio")
    assert "Bio updated successfully" in result["status"]

    rows = await fetch(
        """
        SELECT bio
        FROM personas
        WHERE persona_id = $1
        """,
        persona["persona_id"],
    )
    assert rows
    assert rows[0]["bio"] == "Second bio"


@pytest.mark.asyncio
async def test_view_most_popular_posts_returns_posts_ordered_by_likes(
    db, persona, other_persona, fetch
):
    # Create multiple posts
    post1_rows = await fetch(
        """
        INSERT INTO posts (title, body, author)
        VALUES ($1, $2, $3)
        RETURNING id
        """,
        "post 1",
        "first post",
        persona["persona_id"],
    )
    post1_id = post1_rows[0]["id"]

    post2_rows = await fetch(
        """
        INSERT INTO posts (title, body, author)
        VALUES ($1, $2, $3)
        RETURNING id
        """,
        "post 2",
        "second post",
        persona["persona_id"],
    )
    post2_id = post2_rows[0]["id"]

    post3_rows = await fetch(
        """
        INSERT INTO posts (title, body, author)
        VALUES ($1, $2, $3)
        RETURNING id
        """,
        "post 3",
        "third post",
        other_persona["persona_id"],
    )
    post3_id = post3_rows[0]["id"]

    # Like post2 twice, post3 once, post1 zero times
    await fetch(
        """
        INSERT INTO likes (post_id, persona_id)
        VALUES ($1, $2)
        """,
        post2_id,
        persona["persona_id"],
    )
    await fetch(
        """
        INSERT INTO likes (post_id, persona_id)
        VALUES ($1, $2)
        """,
        post2_id,
        other_persona["persona_id"],
    )
    await fetch(
        """
        INSERT INTO likes (post_id, persona_id)
        VALUES ($1, $2)
        """,
        post3_id,
        persona["persona_id"],
    )

    result = await view_most_popular_posts(db)
    assert "Most popular posts retrieved successfully" in result["status"]

    posts = result.get("posts", [])
    assert len(posts) > 0

    # Find our test posts in the results
    our_posts = [p for p in posts if p["id"] in [post1_id, post2_id, post3_id]]
    assert len(our_posts) == 3

    # Verify ordering by like count
    post2_result = next(p for p in our_posts if p["id"] == post2_id)
    post3_result = next(p for p in our_posts if p["id"] == post3_id)
    post1_result = next(p for p in our_posts if p["id"] == post1_id)

    assert post2_result["like_count"] == 2
    assert post3_result["like_count"] == 1
    assert post1_result["like_count"] == 0

    # Verify both author columns are present; persona-authored posts have user_author as None
    assert post1_result["author"] == persona["persona_id"]
    assert post1_result["user_author"] is None

    # Cleanup
    await db.execute(
        "DELETE FROM likes WHERE post_id IN ($1, $2, $3)", post1_id, post2_id, post3_id
    )
    await db.execute(
        "DELETE FROM posts WHERE id IN ($1, $2, $3)", post1_id, post2_id, post3_id
    )


@pytest.mark.asyncio
async def test_view_most_popular_posts_includes_user_authored_posts(db, persona, fetch):
    # Create a user
    user_rows = await fetch(
        """
        INSERT INTO users (id, bio)
        VALUES ($1, $2)
        RETURNING id
        """,
        "clerk_popular_user",
        "popular user bio",
    )
    user_id = user_rows[0]["id"]

    # Create a post by the user
    user_post_rows = await fetch(
        """
        INSERT INTO posts (title, body, user_author)
        VALUES ($1, $2, $3)
        RETURNING id
        """,
        "user popular post",
        "a post by a real user",
        user_id,
    )
    user_post_id = user_post_rows[0]["id"]

    # Like the user's post from a persona
    await fetch(
        """
        INSERT INTO likes (post_id, persona_id)
        VALUES ($1, $2)
        """,
        user_post_id,
        persona["persona_id"],
    )

    result = await view_most_popular_posts(db)
    assert "Most popular posts retrieved successfully" in result["status"]

    posts = result.get("posts", [])
    user_post_entries = [p for p in posts if p["id"] == user_post_id]
    assert len(user_post_entries) == 1
    assert user_post_entries[0]["user_author"] == user_id
    assert user_post_entries[0]["author"] is None
    assert user_post_entries[0]["like_count"] == 1

    # Cleanup
    await fetch("DELETE FROM likes WHERE post_id = $1", user_post_id)
    await fetch("DELETE FROM posts WHERE id = $1", user_post_id)
    await fetch("DELETE FROM users WHERE id = $1", user_id)


@pytest.mark.asyncio
async def test_view_most_popular_posts_returns_empty_when_no_posts(db, fetch):
    # Delete all posts temporarily
    await fetch("DELETE FROM likes")
    await fetch("DELETE FROM comments")
    await fetch("DELETE FROM posts")

    result = await view_most_popular_posts(db)
    assert "Most popular posts retrieved successfully" in result["status"]
    assert result.get("posts", []) == []


@pytest.mark.asyncio
async def test_view_most_popular_posts_limits_to_10(db, persona, fetch):
    # Create 15 posts
    post_ids = []
    for i in range(15):
        rows = await fetch(
            """
            INSERT INTO posts (title, body, author)
            VALUES ($1, $2, $3)
            RETURNING id
            """,
            f"post {i}",
            f"post body {i}",
            persona["persona_id"],
        )
        post_ids.append(rows[0]["id"])

    result = await view_most_popular_posts(db)
    assert "Most popular posts retrieved successfully" in result["status"]

    posts = result.get("posts", [])
    assert len(posts) <= 10

    # Cleanup
    for post_id in post_ids:
        await db.execute("DELETE FROM posts WHERE id = $1", post_id)


@pytest.mark.asyncio
async def test_view_most_commented_posts_returns_posts_with_comments(
    db, persona, other_persona, fetch
):
    # Create a post
    post_rows = await fetch(
        """
        INSERT INTO posts (title, body, author)
        VALUES ($1, $2, $3)
        RETURNING id
        """,
        "commented post",
        "this post has comments",
        persona["persona_id"],
    )
    post_id = post_rows[0]["id"]

    # Add comments to the post
    await fetch(
        """
        INSERT INTO comments (post_id, author_id, body)
        VALUES ($1, $2, $3)
        """,
        post_id,
        persona["persona_id"],
        "first comment",
    )
    await fetch(
        """
        INSERT INTO comments (post_id, author_id, body)
        VALUES ($1, $2, $3)
        """,
        post_id,
        other_persona["persona_id"],
        "second comment",
    )

    result = await view_most_commented_posts(db)
    assert "Most commented posts retrieved successfully" in result["status"]

    posts = result.get("posts", [])
    assert len(posts) > 0

    # Find our post in the results
    our_post_entries = [p for p in posts if p["id"] == post_id]
    assert len(our_post_entries) == 1  # One row per post

    # Verify comment count
    assert our_post_entries[0]["comment_count"] == 2

    # Verify both author columns are present
    assert our_post_entries[0]["author"] == persona["persona_id"]
    assert our_post_entries[0]["user_author"] is None

    # Cleanup
    await db.execute("DELETE FROM comments WHERE post_id = $1", post_id)
    await db.execute("DELETE FROM posts WHERE id = $1", post_id)


@pytest.mark.asyncio
async def test_view_most_commented_posts_includes_user_authored_posts(
    db, persona, fetch
):
    # Create a user
    user_rows = await fetch(
        """
        INSERT INTO users (id, bio)
        VALUES ($1, $2)
        RETURNING id
        """,
        "clerk_commented_user",
        "commented user bio",
    )
    user_id = user_rows[0]["id"]

    # Create a post by the user
    user_post_rows = await fetch(
        """
        INSERT INTO posts (title, body, user_author)
        VALUES ($1, $2, $3)
        RETURNING id
        """,
        "user commented post",
        "a user post with comments",
        user_id,
    )
    user_post_id = user_post_rows[0]["id"]

    # Add a comment from a persona
    await fetch(
        """
        INSERT INTO comments (post_id, author_id, body)
        VALUES ($1, $2, $3)
        """,
        user_post_id,
        persona["persona_id"],
        "persona commenting on user post",
    )

    result = await view_most_commented_posts(db)
    assert "Most commented posts retrieved successfully" in result["status"]

    posts = result.get("posts", [])
    user_post_entries = [p for p in posts if p["id"] == user_post_id]
    assert len(user_post_entries) == 1
    assert user_post_entries[0]["user_author"] == user_id
    assert user_post_entries[0]["author"] is None
    assert user_post_entries[0]["comment_count"] == 1

    # Cleanup
    await fetch("DELETE FROM comments WHERE post_id = $1", user_post_id)
    await fetch("DELETE FROM posts WHERE id = $1", user_post_id)
    await fetch("DELETE FROM users WHERE id = $1", user_id)


@pytest.mark.asyncio
async def test_view_most_commented_posts_orders_by_comment_count(
    db, persona, other_persona, fetch
):
    # Create three posts
    post1_rows = await fetch(
        """
        INSERT INTO posts (title, body, author)
        VALUES ($1, $2, $3)
        RETURNING id
        """,
        "post 1",
        "one comment",
        persona["persona_id"],
    )
    post1_id = post1_rows[0]["id"]

    post2_rows = await fetch(
        """
        INSERT INTO posts (title, body, author)
        VALUES ($1, $2, $3)
        RETURNING id
        """,
        "post 2",
        "three comments",
        persona["persona_id"],
    )
    post2_id = post2_rows[0]["id"]

    post3_rows = await fetch(
        """
        INSERT INTO posts (title, body, author)
        VALUES ($1, $2, $3)
        RETURNING id
        """,
        "post 3",
        "no comments",
        other_persona["persona_id"],
    )
    post3_id = post3_rows[0]["id"]

    # Add 1 comment to post1
    await fetch(
        """
        INSERT INTO comments (post_id, author_id, body)
        VALUES ($1, $2, $3)
        """,
        post1_id,
        persona["persona_id"],
        "comment on post1",
    )

    # Add 3 comments to post2
    for i in range(3):
        await fetch(
            """
            INSERT INTO comments (post_id, author_id, body)
            VALUES ($1, $2, $3)
            """,
            post2_id,
            persona["persona_id"],
            f"comment {i} on post2",
        )

    result = await view_most_commented_posts(db)
    assert "Most commented posts retrieved successfully" in result["status"]

    posts = result.get("posts", [])
    assert len(posts) > 0

    # Find our posts
    post2_entries = [p for p in posts if p["id"] == post2_id]
    post1_entries = [p for p in posts if p["id"] == post1_id]
    post3_entries = [p for p in posts if p["id"] == post3_id]

    # Verify each post appears once
    assert len(post2_entries) == 1
    assert len(post1_entries) == 1
    assert len(post3_entries) == 1

    # Verify comment counts
    assert post2_entries[0]["comment_count"] == 3
    assert post1_entries[0]["comment_count"] == 1
    assert post3_entries[0]["comment_count"] == 0

    # Verify ordering - post2 (3 comments) should come before post1 (1 comment)
    post2_index = next(i for i, p in enumerate(posts) if p["id"] == post2_id)
    post1_index = next(i for i, p in enumerate(posts) if p["id"] == post1_id)
    assert post2_index < post1_index

    # Cleanup
    await db.execute(
        "DELETE FROM comments WHERE post_id IN ($1, $2, $3)",
        post1_id,
        post2_id,
        post3_id,
    )
    await db.execute(
        "DELETE FROM posts WHERE id IN ($1, $2, $3)", post1_id, post2_id, post3_id
    )


@pytest.mark.asyncio
async def test_view_most_commented_posts_includes_posts_with_no_comments(
    db, persona, fetch
):
    # Create a post with no comments
    post_rows = await fetch(
        """
        INSERT INTO posts (title, body, author)
        VALUES ($1, $2, $3)
        RETURNING id
        """,
        "lonely post",
        "nobody commented on this",
        persona["persona_id"],
    )
    post_id = post_rows[0]["id"]

    result = await view_most_commented_posts(db)
    assert "Most commented posts retrieved successfully" in result["status"]

    posts = result.get("posts", [])

    # Find our post in the results
    our_post_entries = [p for p in posts if p["id"] == post_id]

    # Should have exactly one entry with comment_count of 0
    assert len(our_post_entries) == 1
    assert our_post_entries[0]["comment_count"] == 0

    # Cleanup
    await db.execute("DELETE FROM posts WHERE id = $1", post_id)


@pytest.mark.asyncio
async def test_view_most_commented_posts_serializes_timestamps(db, persona, fetch):
    # Create a post with a comment
    post_rows = await fetch(
        """
        INSERT INTO posts (title, body, author)
        VALUES ($1, $2, $3)
        RETURNING id
        """,
        "test post",
        "test body",
        persona["persona_id"],
    )
    post_id = post_rows[0]["id"]

    await fetch(
        """
        INSERT INTO comments (post_id, author_id, body)
        VALUES ($1, $2, $3)
        """,
        post_id,
        persona["persona_id"],
        "test comment",
    )

    result = await view_most_commented_posts(db)
    assert "Most commented posts retrieved successfully" in result["status"]

    posts = result.get("posts", [])
    our_post_entries = [p for p in posts if p["id"] == post_id]

    assert len(our_post_entries) == 1
    # Verify timestamps are serialized as ISO format strings
    assert isinstance(our_post_entries[0]["created_at"], str)
    assert "T" in our_post_entries[0]["created_at"]  # ISO format indicator
    # Verify comment count
    assert our_post_entries[0]["comment_count"] == 1

    # Cleanup
    await db.execute("DELETE FROM comments WHERE post_id = $1", post_id)
    await db.execute("DELETE FROM posts WHERE id = $1", post_id)
