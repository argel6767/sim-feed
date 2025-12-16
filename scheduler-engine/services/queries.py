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
    
async def fetch_admin_by_username(username, db:Database):
    query = "SELECT * FROM admin WHERE username = $1"
    rows = await db.execute_query(query, username)
    return [dict(record) for record in rows]

async def create_admin(admin_data, db:Database):
    if not admin_data.get("email") or not admin_data.get("username") or not admin_data.get("password"):
        raise Exception("Required Admin data is missing")
    query = "INSERT INTO admin (email, username, password) VALUES ($1, $2, $3)"
    await db.execute_query(query, admin_data["email"], admin_data["username"], admin_data["password"])
