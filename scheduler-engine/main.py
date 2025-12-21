from contextlib import asynccontextmanager
from fastapi import FastAPI, Depends
from dotenv import load_dotenv

from configs.db import Database, create_pool
from configs.logging import setup_logging
from configs.get_db_singleton import get_db
from configs.ssm import get_ssm_parameters
from services.scheduler import create_scheduler, router
from services.agent_actions import view_most_recent_posts
from routers import auths, personas
import os


env = os.environ.get("ENVIRONMENT")

if not env:
    raise ValueError("ENVIRONMENT environment variable is not set")

if env == "dev":
    load_dotenv()
elif env == "prod":
    get_ssm_parameters()
else:
    raise ValueError("Invalid environment value set")


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
app.include_router(auths.router)
app.include_router(personas.router)
app.include_router(router)

@app.get("/")
def read_root():
    return {"message": "Welcome to Sim-Feed Decision Engine", "status":"OK"}

@app.get("/posts")
async def read_posts(db: Database = Depends(get_db)):
    return await view_most_recent_posts(db)