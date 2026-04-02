import asyncio
import json
import logging
import os
from datetime import date, datetime

from configs.db import Database
from openai import OpenAI

from services.agent_actions import functions
from services.agent_event_logger import get_persona_last_run_events

logger = logging.getLogger(__name__)

response_format = {
    "type": "json_object",
    "schema": {
        "type": "object",
        "properties": {
            "function_name": {
                "type": "string",
                "description": "Name of the function to call",
            },
            "arguments": {
                "type": "array",
                "description": "List of argument values in order",
                "items": {},
            },
            "reasoning": {"type": "string", "description": "Why this tool was chosen"},
        },
        "required": ["function_name", "arguments", "reasoning"],
    },
}

role_description = {
    "role_description": """You MUST respond ONLY with this JSON structure. DO NOT make up any values for arguments. Do not write anything else:

{"function_name": "function_name_here", "arguments": [arg1, arg2], "reasoning": "why"}

Available functions: view_most_recent_posts, view_follows_recent_actions, like_post, comment_on_post, view_most_popular_posts, view_most_commented_posts, create_post, find_post_author, update_bio, follow_user, search_web, search_new_politcal_news, read_article_content

Initial functions: The initial function used should be one of the following if your bio is filled: view_most_recent_posts, view_follows_recent_actions, search_new_politcal_news, view_most_popular_posts, view_most_commented_posts, or create_post. Otherwise, it would be wise to update your bio.

Reasoning: Provide a brief explanation for your choice of function. For example, if you choose view_most_recent_posts, you might say "I want to see what recent posts have been made."
Keep reasoning short and concise. It should be no more than a few sentences.

If a function call fails or returns an error, you may retry it at most twice with corrected arguments. If it still fails after two retries, move on and choose a different action instead.

Variety: Aim to use a diverse mix of functions across your turns. Avoid calling the same function repeatedly in a row. For example, after viewing posts you should interact with them (like, comment, follow an author) rather than fetching more posts. Use your last_events history to avoid repeating actions you have already taken recently, such as liking a post you already liked or following someone you already follow.

If mentioning another user/agent in a post/comment, you should use their username and not their ID.

Example:
{"function_name": "create_post", "arguments": [1, "hey everyone!"], "reasoning": "I want to share my thoughts"}"""
}


async def run_agent_turn(request_function, context, db: Database):
    response = await asyncio.to_thread(request_function, context)
    context.append(response)

    try:
        response_data = json.loads(response["content"])

        if "function_name" not in response_data and "response" in response_data:
            context.append(
                {
                    "role": "user",
                    "content": 'You provided narrative text. Now you must choose ONE of the available functions and call it with the format: {"function_name": "...", "arguments": [...], "reasoning": "..."}',
                }
            )
            return

        function_name = response_data.get("function_name")
        arguments = response_data.get("arguments", [])
        reasoning = response_data.get("reasoning", "No reasoning provided.")

        if not function_name:
            context.append(
                {
                    "role": "user",
                    "content": "Invalid response. You must provide function_name, arguments, and reasoning.",
                }
            )
            return

    except json.JSONDecodeError as e:
        context.append(
            {"role": "user", "content": f"Invalid JSON: {e}. Respond with valid JSON."}
        )
        return

    if function_name in functions:
        logger.info(f"Executing function: {function_name} with arguments: {arguments}")
        logger.info(f"Agent reasoning: {reasoning}")
        result = await functions[function_name](db, *arguments)
        # Convert dict/result to JSON string
        result_str = json.dumps(result) if isinstance(result, dict) else str(result)
        context.append({"role": "user", "content": result_str})
    else:
        context.append(
            {
                "role": "user",
                "content": f"Function '{function_name}' doesn't exist. Choose from: {', '.join(functions.keys())}",
            }
        )


def make_deepseek_request(messages: list[dict[str, str]]) -> dict[str, str | None]:
    DEEPSEEK_API_KEY = os.environ.get("DEEPSEEK_API_KEY")
    if not DEEPSEEK_API_KEY:
        raise ValueError("DEEPSEEK_API_KEY environment variable is not set")

    url = "https://api.deepseek.com"

    deepseek_client = OpenAI(api_key=DEEPSEEK_API_KEY, base_url=url)
    response = deepseek_client.chat.completions.create(
        model="deepseek-chat",
        messages=messages,
        response_format=response_format,
        stream=False,
    )
    response_message = response.choices[0].message

    return {"role": response_message.role, "content": response_message.content}


async def run_deepseek_agent(
    persona: dict, function_info: list[dict[str, str]], db: Database
):
    turns = 0

    persona_serializable = {
        k: str(v) if isinstance(v, (date, datetime)) else v for k, v in persona.items()
    }

    last_events = await get_persona_last_run_events(db, persona["persona_id"])

    # Convert list of function dicts to a single dict with "functions" key
    system_context = {
        **role_description,
        **persona_serializable,
        "last_events": last_events,
        "functions": function_info,
    }
    context = [{"role": "system", "content": json.dumps(system_context)}]

    while turns < 10:
        await run_agent_turn(make_deepseek_request, context, db)
        turns += 1
