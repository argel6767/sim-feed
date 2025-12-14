from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, HTTPException, status, Depends
from dotenv import load_dotenv

from configs.db import Database, create_pool
from configs.logging import setup_logging
from services.scheduler import create_scheduler
from services.queries import insert_persona
from services.agent_actions import view_most_recent_posts
import os

load_dotenv()

def get_db(request: Request) -> Database:
    return request.app.state.db

@asynccontextmanager
async def lifespan(app: FastAPI):
    setup_logging()
    pool = await create_pool(os.environ["DATABASE_URL"])
    db = Database(pool=pool)
    app.state.db = db

    scheduler = create_scheduler(db)
    scheduler.start()
    app.state.scheduler = scheduler

    try:
        yield
    finally:
        scheduler.shutdown(wait=False)
        await pool.close()

app = FastAPI(lifespan=lifespan)


@app.get("/")
def read_root():
    return {"message": "Welcome to Sim-Feed Decision Engine", "status":"OK"}

@app.post("/personas", status_code=status.HTTP_201_CREATED)
async def insert_new_persona(request: Request, db: Database = Depends(get_db)):
    try:
        data = await request.json()
        body = await insert_persona(data, db)
        return body
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"There was a failure in inserting new persona: {e}",
        )

@app.get("/posts")
async def read_posts(db: Database = Depends(get_db)):
    return await view_most_recent_posts(db)