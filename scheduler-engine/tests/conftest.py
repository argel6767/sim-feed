# tests/conftest.py
import os
import uuid

import pytest_asyncio

from configs.db import db


@pytest_asyncio.fixture(scope="function")
async def db_pool():
    """
    Create a fresh asyncpg pool per test.

    This avoids cross-event-loop reuse of a pool, which is the root cause of:
    - RuntimeError: Future attached to a different loop
    - cannot perform operation: another operation is in progress
    - connection was closed in the middle of operation
    """
    if not os.environ.get("DATABASE_URL"):
        raise RuntimeError("DATABASE_URL must be set for tests.")

    await db.connect()
    try:
        yield db.pool
    finally:
        await db.disconnect()


@pytest_asyncio.fixture
def fetch(db_pool):
    async def _fetch(query, *args):
        async with db_pool.acquire() as conn:
            rows = await conn.fetch(query, *args)
            return [dict(r) for r in rows]

    return _fetch


@pytest_asyncio.fixture
async def persona(fetch, db_pool):
    username = f"test_{uuid.uuid4().hex[:10]}"
    rows = await fetch(
        """
        INSERT INTO personas (description, username)
        VALUES ($1, $2)
        RETURNING persona_id, username
        """,
        "test persona",
        username,
    )
    p = rows[0]
    yield p

    async with db_pool.acquire() as conn:
        await conn.execute(
            "DELETE FROM follows WHERE follower = $1 OR followed = $1",
            p["persona_id"],
        )
        await conn.execute("DELETE FROM likes WHERE persona_id = $1", p["persona_id"])
        await conn.execute("DELETE FROM comments WHERE author_id = $1", p["persona_id"])
        await conn.execute("DELETE FROM posts WHERE author = $1", p["persona_id"])
        await conn.execute(
            "DELETE FROM personas WHERE persona_id = $1",
            p["persona_id"],
        )


@pytest_asyncio.fixture
async def other_persona(fetch, db_pool):
    username = f"test_{uuid.uuid4().hex[:10]}"
    rows = await fetch(
        """
        INSERT INTO personas (description, username)
        VALUES ($1, $2)
        RETURNING persona_id, username
        """,
        "other persona",
        username,
    )
    p = rows[0]
    yield p

    async with db_pool.acquire() as conn:
        await conn.execute(
            "DELETE FROM follows WHERE follower = $1 OR followed = $1",
            p["persona_id"],
        )
        await conn.execute("DELETE FROM likes WHERE persona_id = $1", p["persona_id"])
        await conn.execute("DELETE FROM comments WHERE author_id = $1", p["persona_id"])
        await conn.execute("DELETE FROM posts WHERE author = $1", p["persona_id"])
        await conn.execute(
            "DELETE FROM personas WHERE persona_id = $1",
            p["persona_id"],
        )


@pytest_asyncio.fixture
async def post(fetch, db_pool, persona):
    rows = await fetch(
        """
        INSERT INTO posts (body, author)
        VALUES ($1, $2)
        RETURNING id, body, author
        """,
        "hello from tests",
        persona["persona_id"],
    )
    p = rows[0]
    yield p

    async with db_pool.acquire() as conn:
        await conn.execute("DELETE FROM likes WHERE post_id = $1", p["id"])
        await conn.execute("DELETE FROM comments WHERE post_id = $1", p["id"])
        await conn.execute("DELETE FROM posts WHERE id = $1", p["id"])