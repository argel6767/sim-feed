import os
import uuid

import pytest_asyncio
import pytest
from main import app, get_db
from httpx import AsyncClient, ASGITransport

from configs.db import Database, create_pool


@pytest_asyncio.fixture(scope="function")
async def db():
    """
    Create a fresh Database instance (asyncpg pool) per test.

    This guarantees:
    - pool is created on the same event loop as the test
    - no cross-loop asyncpg usage
    - clean isolation between tests
    """
    database_url = os.environ.get("DATABASE_URL")
    if not database_url:
        raise RuntimeError("DATABASE_URL must be set for tests.")

    pool = await create_pool(database_url)
    try:
        yield Database(pool=pool)
    finally:
        await pool.close()


@pytest_asyncio.fixture
def fetch(db: Database):
    """
    Convenience helper for SELECT / RETURNING queries in tests.
    """
    async def _fetch(query, *args):
        return await db.fetch(query, *args)

    return _fetch


@pytest_asyncio.fixture
async def persona(db: Database, fetch):
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

    await db.execute(
        "DELETE FROM follows WHERE follower = $1 OR followed = $1",
        p["persona_id"],
    )
    await db.execute("DELETE FROM likes WHERE persona_id = $1", p["persona_id"])
    await db.execute("DELETE FROM comments WHERE author_id = $1", p["persona_id"])
    await db.execute("DELETE FROM posts WHERE author = $1", p["persona_id"])
    await db.execute(
        "DELETE FROM personas WHERE persona_id = $1",
        p["persona_id"],
    )


@pytest_asyncio.fixture
async def other_persona(db: Database, fetch):
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

    await db.execute(
        "DELETE FROM follows WHERE follower = $1 OR followed = $1",
        p["persona_id"],
    )
    await db.execute("DELETE FROM likes WHERE persona_id = $1", p["persona_id"])
    await db.execute("DELETE FROM comments WHERE author_id = $1", p["persona_id"])
    await db.execute("DELETE FROM posts WHERE author = $1", p["persona_id"])
    await db.execute(
        "DELETE FROM personas WHERE persona_id = $1",
        p["persona_id"],
    )


@pytest_asyncio.fixture
async def post(db: Database, fetch, persona):
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

    await db.execute("DELETE FROM likes WHERE post_id = $1", p["id"])
    await db.execute("DELETE FROM comments WHERE post_id = $1", p["id"])
    await db.execute("DELETE FROM posts WHERE id = $1", p["id"])
    
@pytest.fixture
async def client(db):
    async def override_get_db():
        return db

    app.dependency_overrides[get_db] = override_get_db

    transport = ASGITransport(app=app)

    async with AsyncClient(
        transport=transport,
        base_url="http://test",
    ) as ac:
        yield ac

    app.dependency_overrides.clear()

@pytest.fixture(autouse=True)
def override_get_db(db):
    async def _get_db_override():
        yield db

    app.dependency_overrides[get_db] = _get_db_override
    yield
    app.dependency_overrides.clear()