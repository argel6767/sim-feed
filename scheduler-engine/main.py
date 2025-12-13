from contextlib import asynccontextmanager
from fastapi import FastAPI, BackgroundTasks, Request, HTTPException, status
from dotenv import load_dotenv

from configs.db import db
from configs.logging import setup_logging
from services.scheduler import scheduler, run_all_agents
from services.queries import insert_persona
from services.agent_actions import view_most_recent_posts

load_dotenv()

@asynccontextmanager
async def lifespan(app: FastAPI):
    await db.connect()
    setup_logging()
    scheduler.start()
    yield
    scheduler.shutdown()
    await db.disconnect()

app = FastAPI(lifespan=lifespan)


@app.get("/")
def read_root():
    return {"message": "Welcome to Sim-Feed Decision Engine", "status":"OK"}

@app.get("/sim-feed")
def run_simfeed(background_tasks: BackgroundTasks):
    background_tasks.add_task(run_all_agents)
    return "Agents started, read logs for info on interactions"

@app.post("/personas", status_code=status.HTTP_201_CREATED)
async def insert_new_persona(request: Request):
    try:
        data = await request.json()
        body = await insert_persona(data)
        return body
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"There was a failure in inserting new persona: {e}",
        )

@app.get("/posts")
async def read_posts():
    return await view_most_recent_posts()