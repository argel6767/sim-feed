# agent_event_logger.py
import asyncio

from configs.db import Database

async def _log_create_post(db: Database, persona_id: int, post_id: int):
    try:
        async with db.pool.acquire() as conn:
            async with conn.transaction():
                event = await conn.fetchrow(
                    """
                    INSERT INTO agent_events (persona_id, event_type)
                    VALUES ($1, 'CREATE_POST')
                    RETURNING id
                    """,
                    persona_id,
                )
                await conn.execute(
                    """
                    INSERT INTO agent_event_post (event_id, post_id)
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
                    INSERT INTO agent_events (persona_id, event_type)
                    VALUES ($1, 'LIKE_POST')
                    RETURNING id
                    """,
                    persona_id,
                )
                await conn.execute(
                    """
                    INSERT INTO agent_event_like (event_id, like_id)
                    VALUES ($1, $2)
                    """,
                    event["id"],
                    like_id,
                )
    except Exception as e:
        print(f"Failed to log LIKE_POST event for persona {persona_id}: {e}")


async def _log_comment(
    db: Database, persona_id: int, post_id: int, comment_id: int
):
    try:
        async with db.pool.acquire() as conn:
            async with conn.transaction():
                event = await conn.fetchrow(
                    """
                    INSERT INTO agent_events (persona_id, event_type)
                    VALUES ($1, 'COMMENT')
                    RETURNING id
                    """,
                    persona_id,
                )
                await conn.execute(
                    """
                    INSERT INTO agent_event_comment (event_id, post_id, comment_id)
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
                    INSERT INTO agent_events (persona_id, event_type)
                    VALUES ($1, 'FOLLOW')
                    RETURNING id
                    """,
                    persona_id,
                )
                await conn.execute(
                    """
                    INSERT INTO agent_event_follow (event_id, followed_id)
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
                    INSERT INTO agent_events (persona_id, event_type)
                    VALUES ($1, 'UPDATE_BIO')
                    RETURNING id
                    """,
                    persona_id,
                )
                await conn.execute(
                    """
                    INSERT INTO agent_event_bio (event_id, bio)
                    VALUES ($1, $2)
                    """,
                    event["id"],
                    bio,
                )
    except Exception as e:
        print(f"Failed to log UPDATE_BIO event for persona {persona_id}: {e}")


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