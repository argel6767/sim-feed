from configs.db import db

async def fetch_personas():
    query = "SELECT * FROM personas"
    rows =  await db.execute_query(query)
    return [dict(record) for record in rows]