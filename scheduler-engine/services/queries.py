from datetime import datetime, UTC

from configs.db import Database

async def fetch_personas(db:Database):
    query = "SELECT * FROM personas"
    rows =  await db.execute_query(query)
    return [dict(record) for record in rows]

async def insert_persona(persona_data, db:Database):
    if not persona_data.get("persona") or not persona_data.get("username"):
        raise Exception("Required Persona data is missing")
    query = "INSERT INTO personas (description, username, created_at) VALUES ($1, $2, $3)"
    date = datetime.now(UTC)
    await db.execute_query(query, persona_data["persona"], persona_data["username"], date)
