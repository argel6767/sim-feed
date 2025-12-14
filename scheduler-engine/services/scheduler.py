from apscheduler.schedulers.asyncio import AsyncIOScheduler
import asyncio
import random
import logging

from services.agent_actions import get_function_info
from services.ai_calls import run_deepseek_agent
from services.queries import fetch_personas

logger = logging.getLogger(__name__)


def create_scheduler(db):
    scheduler = AsyncIOScheduler()

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

    scheduler.add_job(run_all_agents, "interval", minutes=5)
    return scheduler