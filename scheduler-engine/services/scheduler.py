from apscheduler.schedulers.asyncio import AsyncIOScheduler
import asyncio
import random
import logging
import os
from services.agent_actions import get_function_info
from services.ai_calls import run_deepseek_agent
from services.queries import fetch_personas
from fastapi import APIRouter, Depends, HTTPException, Request, status
from services.authenication import get_current_user

logger = logging.getLogger(__name__)

SCHEDULER_JOB_INTERVAL = os.environ["SCHEDULER_JOB_INTERVAL"]

if not SCHEDULER_JOB_INTERVAL:
    raise ValueError("SCHEDULER_JOB_INTERVAL environment variable is not set")
    
scheduler = AsyncIOScheduler()

router = APIRouter(prefix="/scheduler", tags=["Scheduler"])
@router.put("/interval", status_code=status.HTTP_204_NO_CONTENT)
async def update_scheduler_interval(request: Request, current_user: dict = Depends(get_current_user)):
    body = await request.json()
    interval = body.get("interval")
    if not interval:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Missing interval")
    
    SCHEDULER_JOB_INTERVAL = int(interval)
    scheduler.reschedule_job("run_all_agents", trigger="interval", minutes=SCHEDULER_JOB_INTERVAL)
    logger.info(f"Scheduler interval updated to {interval} minutes")

def create_scheduler(db):

    async def run_all_agents():
        personas = await fetch_personas(db)
        functions_list = get_function_info()
        random.shuffle(personas)

        tasks = [
            run_deepseek_agent(persona, functions_list, db)
            for persona in personas
        ]
        await asyncio.gather(*tasks)
        logger.info("All agents completed")

    scheduler.add_job(run_all_agents, "interval", minutes=int(SCHEDULER_JOB_INTERVAL), id="run_all_agents")
    return scheduler