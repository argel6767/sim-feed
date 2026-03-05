from datetime import datetime, UTC

from configs.db import Database

async def fetch_personas(db:Database):
    query = "SELECT * FROM personas"
    rows =  await db.execute_query(query)
    return [dict(record) for record in rows]
    
async def fetch_persona_by_id(id, db:Database):
    query = "SELECT * FROM personas WHERE persona_id = $1"
    rows = await db.execute_query(query, id)
    if not rows or len(rows) == 0:
        return None
    return [dict(record) for record in rows][0]

async def fetch_persona_by_username(username, db:Database):
    query = "SELECT * FROM personas WHERE username = $1"
    rows = await db.execute_query(query, username)
    if not rows or len(rows) == 0:
        return None
    return [dict(record) for record in rows][0]

async def insert_persona(persona_data, db:Database):
    if not persona_data.get("persona") or not persona_data.get("bio") or not persona_data.get("username"):
        raise Exception("Required Persona data is missing")
    query = "INSERT INTO personas (description, bio, username, created_at) VALUES ($1, $2, $3, $4)"
    date = datetime.now(UTC)
    await db.execute_query(query, persona_data["persona"], persona_data["bio"], persona_data["username"], date)

async def delete_persona_by_id(id, db:Database):
    query = "DELETE FROM personas WHERE persona_id = $1"
    await db.execute_query(query, id)

async def fetch_admin_by_username(username, db:Database):
    query = "SELECT * FROM admin WHERE username = $1"
    rows = await db.execute_query(query, username)
    if not rows or len(rows) == 0:
        return None
    return [dict(record) for record in rows][0]

async def fetch_admin_by_email(email, db:Database):
    query = "SELECT * FROM admin WHERE email = $1"
    rows = await db.execute_query(query, email)
    if not rows or len(rows) == 0:
        return None
    return [dict(record) for record in rows][0]

async def create_admin(admin_data, db:Database):
    query = "INSERT INTO admin (email, username, password) VALUES ($1, $2, $3)"
    await db.execute_query(query, admin_data["email"], admin_data["username"], admin_data["password"])

async def fetch_admin_count(db:Database):
    query = "SELECT COUNT(*) FROM admin"
    rows = await db.execute_query(query)
    return rows[0]
    
async def fetch_admin_invitation_by_email(email, db:Database):
    query = "SELECT * FROM admin_invitations WHERE email = $1"
    rows = await db.execute_query(query, email)
    if not rows or len(rows) == 0:
        return None
    return [dict(record) for record in rows][0]
    
async def get_most_recent_events(persona_id, db:Database):
    limit = 15
    query = '''
    SELECT
        e.id,
        e.persona_id,
        e.event_type,
        e.created_at,
        ap.post_id,
        al.like_id,
        ac.post_id AS comment_post_id,
        ac.comment_id,
        af.followed_id,
        ab.bio
    FROM agent_events e
    LEFT JOIN agent_event_post ap ON e.id = ap.event_id
    LEFT JOIN agent_event_like al ON e.id = al.event_id
    LEFT JOIN agent_event_comment ac ON e.id = ac.event_id
    LEFT JOIN agent_event_follow af ON e.id = af.event_id
    LEFT JOIN agent_event_bio ab ON e.id = ab.event_id
    WHERE e.persona_id = $1
    ORDER BY e.created_at DESC
    LIMIT $2;
    '''
    rows = await db.execute_query(query, persona_id, limit)
    if not rows or len(rows) == 0:
        return None
    return [dict(record) for record in rows]
