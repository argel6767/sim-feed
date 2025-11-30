from contextlib import asynccontextmanager
from fastapi import FastAPI
from dotenv import load_dotenv

from configs.db import db
from services.scheduler import scheduler

load_dotenv()

@asynccontextmanager
async def lifespan(app: FastAPI):
    await db.connect()
    yield
    await db.disconnect()
    scheduler.shutdown()

app = FastAPI(lifespan=lifespan)


@app.get("/")
def read_root():
    return {"message": "Welcome to Sim-Feed Decision Engine"}
