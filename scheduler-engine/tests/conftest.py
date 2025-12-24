import os
import uuid
import pytest
import pytest_asyncio
from configs.db import Database, create_pool
from configs.get_db_singleton import get_db
from httpx import ASGITransport, AsyncClient
from main import app
from services.authenication import get_current_user

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
async def fetch(db: Database):
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
        INSERT INTO personas (description, bio, username)
        VALUES ($1, $2, $3)
        RETURNING persona_id, username
        """,
        "test persona",
        "test bio",
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
        INSERT INTO personas (description, bio, username)
        VALUES ($1, $2, $3)
        RETURNING persona_id, username
        """,
        "other persona",
        "other test bio",
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
        INSERT INTO posts (title, body, author)
        VALUES ($1, $2, $3)
        RETURNING id, title, body, author
        """,
        "test post title",
        "hello from tests",
        persona["persona_id"],
    )
    p = rows[0]
    yield p

    await db.execute("DELETE FROM likes WHERE post_id = $1", p["id"])
    await db.execute("DELETE FROM comments WHERE post_id = $1", p["id"])
    await db.execute("DELETE FROM posts WHERE id = $1", p["id"])


@pytest_asyncio.fixture
async def client(db: Database):
    """Async client with auth overrides for authenticated requests."""

    async def override_get_db():
        return db

    async def override_get_current_user():
        return {"username": "test_admin", "email": "email@example.com"}

    app.dependency_overrides[get_db] = override_get_db
    app.dependency_overrides[get_current_user] = override_get_current_user

    transport = ASGITransport(app=app)

    async with AsyncClient(
        transport=transport,
        base_url="http://test",
    ) as ac:
        yield ac

    app.dependency_overrides.clear()


@pytest_asyncio.fixture
async def unauthenticated_client(db: Database):
    """Async client without auth to test 401 responses."""

    async def override_get_db():
        return db

    app.dependency_overrides[get_db] = override_get_db
    # Don't override get_current_user - let it fail with 401

    transport = ASGITransport(app=app)

    async with AsyncClient(
        transport=transport,
        base_url="http://test",
    ) as ac:
        yield ac

    app.dependency_overrides.clear()
