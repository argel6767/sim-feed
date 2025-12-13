import os
import asyncpg

DATABASE_URL = os.environ.get("DATABASE_URL")


class Database:
    def __init__(self):
        self.pool = None

    async def connect(self):
        self.pool = await asyncpg.create_pool(
            DATABASE_URL,
            ssl="prefer",
        )

    async def disconnect(self):
        await self.pool.close()

    async def execute_query(self, query_string, *variables):
        async with self.pool.acquire() as conn:
            try:
                # Check if query is SELECT
                if query_string.strip().upper().startswith("SELECT"):
                    rows = await conn.fetch(query_string, *variables)
                    return [dict(r) for r in rows]
                else:
                    # For INSERT/DELETE/UPDATE
                    result = await conn.execute(query_string, *variables)
                    return result
            except Exception as e:
                raise e


db = Database()