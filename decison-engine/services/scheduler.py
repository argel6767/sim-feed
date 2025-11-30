from apscheduler.schedulers.background import BackgroundScheduler
import asyncio
import random

from services.ai_calls import run_deepseek_agent
from services.queries import fetch_personas, fetch_functions

async def run_all_agents():
    personas = await fetch_personas()
    functions_list = await fetch_functions()
    random.shuffle(personas)

    tasks = [run_deepseek_agent(persona, functions_list) for persona in personas]
    await asyncio.gather(*tasks)
    print("All agents completed")


def sync_wrapper():
    asyncio.run(run_all_agents())

scheduler = BackgroundScheduler()
scheduler.add_job(sync_wrapper, "interval", minutes=5)
scheduler.start()

