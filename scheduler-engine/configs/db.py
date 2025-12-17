import asyncpg
from dataclasses import dataclass

@dataclass
class Database:
    pool: asyncpg.Pool

    async def disconnect(self):
        if self.pool is not None:
            await self.pool.close()
            self.pool = None

    async def execute_query(self, query_string, *variables):
        if self.pool is None:
            raise Exception("Database not connected")
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
    async def fetch(self, query: str, *args) -> list[dict]:
            async with self.pool.acquire() as conn:
                rows = await conn.fetch(query, *args)
                return [dict(r) for r in rows]
                
    async def execute(self, query: str, *args) -> str:
            async with self.pool.acquire() as conn:
                return await conn.execute(query, *args)

async def create_pool(database_url: str) -> asyncpg.Pool:
    return await asyncpg.create_pool(database_url, ssl="prefer")
