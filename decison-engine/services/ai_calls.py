import json
import os
from openai import OpenAI

from services.agent_actions import like_post, comment_on_post, create_post, find_post_author, follow_user

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

functions = {
    "like_post":like_post,
    "comment_on_post": comment_on_post,
    "create_post": create_post,
    "find_post_author": find_post_author,
    "follow_user": follow_user,
}

def run_agent_turn(request_function, context):
    response = request_function(context)
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

def run_deepseek_agent(system_context: str):
    turns = 0
    context = [{"role": "system", "content": system_context}]

    while turns < 10:
        run_agent_turn(make_deepseek_request, context)
        turns += 1
