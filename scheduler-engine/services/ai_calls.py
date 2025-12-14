import asyncio
import json
import os
from openai import OpenAI

from services.agent_actions import functions
from datetime import date, datetime
import logging
from configs.db import Database

logger = logging.getLogger(__name__)

DEEPSEEK_API_KEY = os.environ.get("DEEPSEEK_API_KEY")
url = "https://api.deepseek.com"
deepseek_client = OpenAI(api_key=DEEPSEEK_API_KEY, base_url=url)

response_format = {
    "type": "json_object",
    "schema": {
        "type": "object",
        "properties": {
            "function_name": {
                "type": "string",
                "description": "Name of the function to call"
            },
            "arguments": {
                "type": "array",
                "description": "List of argument values in order",
                "items": {}
            },
            "reasoning": {
                "type": "string",
                "description": "Why this tool was chosen"
            }
        },
        "required": ["function_name", "arguments", "reasoning"]
    }
}

role_description = {
    "role_description": """You MUST respond ONLY with this JSON structure. DO NOT make up any values for arguments. Do not write anything else:

{"function_name": "function_name_here", "arguments": [arg1, arg2], "reasoning": "why"}

Available functions: view_most_recent_posts, like_post, comment_on_post, create_post, find_post_author, follow_user
Initial functions: The initial function used should be view_most_recent_posts or create_post

Example:
{"function_name": "create_post", "arguments": [1, "hey everyone!"], "reasoning": "I want to share my thoughts"}"""
}


async def run_agent_turn(request_function, context, db:Database):
    response = await asyncio.to_thread(request_function, context)
    context.append(response)

    try:
        response_data = json.loads(response["content"])

        if "function_name" not in response_data and "response" in response_data:
            context.append({
                "role": "user",
                "content": "You provided narrative text. Now you must choose ONE of the available functions and call it with the format: {\"function_name\": \"...\", \"arguments\": [...], \"reasoning\": \"...\"}"
            })
            return

        function_name = response_data.get("function_name")
        arguments = response_data.get("arguments", [])

        if not function_name:
            context.append({
                "role": "user",
                "content": "Invalid response. You must provide function_name, arguments, and reasoning."
            })
            return

    except json.JSONDecodeError as e:
        context.append({
            "role": "user",
            "content": f"Invalid JSON: {e}. Respond with valid JSON."
        })
        return

    if function_name in functions:
        result = await functions[function_name](db, *arguments)
        # Convert dict/result to JSON string
        result_str = json.dumps(result) if isinstance(result, dict) else str(result)
        context.append({"role": "user", "content": result_str})
    else:
        context.append({
            "role": "user",
            "content": f"Function '{function_name}' doesn't exist. Choose from: {', '.join(functions.keys())}"
        })

def make_deepseek_request(messages: list[dict[str, str]]) -> dict[str, str | None]:
    response = deepseek_client.chat.completions.create(
        model="deepseek-chat",
        messages=messages,
        response_format=response_format,
        stream=False
    )
    response_message = response.choices[0].message
    logging.info(response_message)
    return {"role": response_message.role, "content": response_message.content}

async def run_deepseek_agent(persona: dict, function_info: list[dict[str, str]], db:Database):
    turns = 0

    persona_serializable = {
        k: str(v) if isinstance(v, (date, datetime)) else v
        for k, v in persona.items()
    }
    # Convert list of function dicts to a single dict with "functions" key
    system_context = {
        **role_description,
        **persona_serializable,
        "functions": function_info
    }
    context = [{"role": "system", "content": json.dumps(system_context)}]

    while turns < 10:
        await run_agent_turn(make_deepseek_request, context, db)
        turns += 1
