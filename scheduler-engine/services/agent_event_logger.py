# agent_event_logger.py
import asyncio

from configs.db import Database


async def _log_create_post(db: Database, persona_id: int, post_id: int):
    try:
        async with db.pool.acquire() as conn:
            async with conn.transaction():
                event = await conn.fetchrow(
                    """
                    INSERT INTO agent_events (persona_id, event_type, created_at)
                    VALUES ($1, 'CREATE_POST', NOW())
                    RETURNING id
                    """,
                    persona_id,
                )
                await conn.execute(
                    """
                    INSERT INTO agent_event_post (id, post_id)
                    VALUES ($1, $2)
                    """,
                    event["id"],
                    post_id,
                )
    except Exception as e:
        print(f"Failed to log CREATE_POST event for persona {persona_id}: {e}")


async def _log_like_post(db: Database, persona_id: int, like_id: int):
    try:
        async with db.pool.acquire() as conn:
            async with conn.transaction():
                event = await conn.fetchrow(
                    """
                    INSERT INTO agent_events (persona_id, event_type, created_at)
                    VALUES ($1, 'LIKE_POST', NOW())
                    RETURNING id
                    """,
                    persona_id,
                )
                await conn.execute(
                    """
                    INSERT INTO agent_event_like (id, like_id)
                    VALUES ($1, $2)
                    """,
                    event["id"],
                    like_id,
                )
    except Exception as e:
        print(f"Failed to log LIKE_POST event for persona {persona_id}: {e}")


async def _log_comment(db: Database, persona_id: int, post_id: int, comment_id: int):
    try:
        async with db.pool.acquire() as conn:
            async with conn.transaction():
                event = await conn.fetchrow(
                    """
                    INSERT INTO agent_events (persona_id, event_type, created_at)
                    VALUES ($1, 'COMMENT', NOW())
                    RETURNING id
                    """,
                    persona_id,
                )
                await conn.execute(
                    """
                    INSERT INTO agent_event_comment (id, post_id, comment_id)
                    VALUES ($1, $2, $3)
                    """,
                    event["id"],
                    post_id,
                    comment_id,
                )
    except Exception as e:
        print(f"Failed to log COMMENT event for persona {persona_id}: {e}")


async def _log_follow(db: Database, persona_id: int, followed_id: int):
    try:
        async with db.pool.acquire() as conn:
            async with conn.transaction():
                event = await conn.fetchrow(
                    """
                    INSERT INTO agent_events (persona_id, event_type, created_at)
                    VALUES ($1, 'FOLLOW', NOW())
                    RETURNING id
                    """,
                    persona_id,
                )
                await conn.execute(
                    """
                    INSERT INTO agent_event_follow (id, followed_id)
                    VALUES ($1, $2)
                    """,
                    event["id"],
                    followed_id,
                )
    except Exception as e:
        print(f"Failed to log FOLLOW event for persona {persona_id}: {e}")


async def _log_update_bio(db: Database, persona_id: int, bio: str):
    try:
        async with db.pool.acquire() as conn:
            async with conn.transaction():
                event = await conn.fetchrow(
                    """
                    INSERT INTO agent_events (persona_id, event_type, created_at)
                    VALUES ($1, 'UPDATE_BIO', NOW())
                    RETURNING id
                    """,
                    persona_id,
                )
                await conn.execute(
                    """
                    INSERT INTO agent_event_bio (id, bio)
                    VALUES ($1, $2)
                    """,
                    event["id"],
                    bio,
                )
    except Exception as e:
        print(f"Failed to log UPDATE_BIO event for persona {persona_id}: {e}")


async def get_persona_last_run_events(db: Database, persona_id: int) -> list[dict]:
    """
    Retrieves the 10 most recent events the persona performed in their last
    agent run.

    Queries agent_events and LEFT JOINs all five detail tables so every event
    type is covered in a single pass. Only columns relevant to the matched event
    type will be non-null in each row; null fields are stripped from the returned
    dicts so the agent receives clean, minimal records.

    Args:
        persona_id: The ID of the persona whose history is being fetched (int)

    Returns:
        A list of up to 10 dicts, each containing event_id, event_type,
        created_at (ISO string), and the non-null detail fields for that
        event type:
          CREATE_POST  -> post_id, post_title, post_body
          LIKE_POST    -> like_id, liked_post_id, liked_post_body
          COMMENT      -> comment_id, commented_post_id, comment_body
          FOLLOW       -> followed_id, followed_username
          UPDATE_BIO   -> updated_bio
    """
    query = """
        SELECT
          ae.id              AS event_id,
          ae.event_type,
          ae.created_at,
          cp.post_id,
          p_post.title       AS post_title,
          p_post.body        AS post_body,
          cl.like_id,
          p_liked.id         AS liked_post_id,
          p_liked.body       AS liked_post_body,
          cc.comment_id,
          cc.post_id         AS commented_post_id,
          c.body             AS comment_body,
          cf.followed_id,
          per_f.username     AS followed_username,
          cb.bio             AS updated_bio
        FROM agent_events ae
        LEFT JOIN agent_event_post    cp      ON ae.id = cp.id
        LEFT JOIN posts               p_post  ON cp.post_id = p_post.id
        LEFT JOIN agent_event_like    cl      ON ae.id = cl.id
        LEFT JOIN likes               lk      ON cl.like_id = lk.id
        LEFT JOIN posts               p_liked ON lk.post_id = p_liked.id
        LEFT JOIN agent_event_comment cc      ON ae.id = cc.id
        LEFT JOIN comments            c       ON cc.comment_id = c.id
        LEFT JOIN agent_event_follow  cf      ON ae.id = cf.id
        LEFT JOIN personas            per_f   ON cf.followed_id = per_f.persona_id
        LEFT JOIN agent_event_bio     cb      ON ae.id = cb.id
        WHERE ae.persona_id = $1
        ORDER BY ae.created_at DESC
        LIMIT 10
    """

    rows = await db.fetch(query, persona_id)

    result = []
    for row in rows:
        cleaned = {
            k: (v.isoformat() if hasattr(v, "isoformat") else v)
            for k, v in dict(row).items()
            if v is not None
        }
        result.append(cleaned)

    return result


def log_create_post(db: Database, persona_id: int, post_id: int):
    asyncio.create_task(_log_create_post(db, persona_id, post_id))


def log_like_post(db: Database, persona_id: int, like_id: int):
    asyncio.create_task(_log_like_post(db, persona_id, like_id))


def log_comment(db: Database, persona_id: int, post_id: int, comment_id: int):
    asyncio.create_task(_log_comment(db, persona_id, post_id, comment_id))


def log_follow(db: Database, persona_id: int, followed_id: int):
    asyncio.create_task(_log_follow(db, persona_id, followed_id))


def log_update_bio(db: Database, persona_id: int, bio: str):
    asyncio.create_task(_log_update_bio(db, persona_id, bio))
