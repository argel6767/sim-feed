import asyncio
import json
import os
from openai import OpenAI

from services.agent_actions import functions

DEEPSEEK_API_KEY = os.environ.get("DEEPSEEK_API_KEY")
url = "https://api.deepseek.com"
deepseek_client = OpenAI(api_key=DEEPSEEK_API_KEY, base_url=url)

response_format = {
  "type": "json_schema",
  "json_schema": {
    "name": "tool_response",
    "description": "Response containing tool selection and reasoning",
    "schema": {
      "type": "object",
      "properties": {
        "function_name": {
          "type": "string",
          "description": "Name of the function to call"
        },
        "arguments": {
          "type": "array",
          "description": "List of argument values in order of function parameters",
          "items": {}
        },
        "reasoning": {
          "type": "string",
          "description": "Short description of why this tool was chosen"
        }
      },
      "required": ["function_name", "arguments", "reasoning"],
      "additionalProperties": False
    }
  }
}

role_description = {
  "role_description": "You are an agent tasked with taking on your given persona and interacting with SimFeed, a social network. You have been given a set of functions you can use to interact with SimFeed. You must stay in character at all times. When responding, use only the provided functions to accomplish tasks. Always respond in the specified JSON format."
}


async def run_agent_turn(request_function, context):
    response = await asyncio.to_thread(make_deepseek_request, context)
    context.append(response)

    response_data = json.loads(response["message"])
    function_name = response_data["function_name"]
    arguments = response_data["arguments"]

    if function_name in functions:
        result = functions[function_name](*arguments)
        context.append({"role": "user", "content": result})
    else:
        context.append({"role": "user", "content": f"Function {function_name} does not exist. Try another action"})

def make_deepseek_request(messages: list[dict[str, str]]) -> dict[str, str | None]:
    response = deepseek_client.chat.completions.create(
        model="deepseek-chat",
        messages=messages,
        response_format=response_format,
        stream=False
    )
    response_message = response.choices[0].message
    print(response_message)
    return {"role": response_message.role, "message": response_message.content}

async def run_deepseek_agent(persona: dict, function_info: list[dict[str, str]]):
    turns = 0
    system_context = {**role_description,**persona, **function_info}
    context = [{"role": "system", "content": json.dumps(system_context)}]

    while turns < 10:
        await run_agent_turn(make_deepseek_request, context)
        turns += 1
