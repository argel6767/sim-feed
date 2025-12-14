import json
import pytest

from services.ai_calls import run_agent_turn


@pytest.mark.asyncio
async def test_run_agent_turn_dispatches_tool_call(persona, post, fetch):
    def fake_llm(_context):
        return {
            "role": "assistant",
            "content": json.dumps(
                {
                    "function_name": "like_post",
                    "arguments": [post["id"], persona["persona_id"]],
                    "reasoning": "test dispatch",
                }
            ),
        }

    context = [{"role": "system", "content": "{}"}]
    await run_agent_turn(fake_llm, context)

    rows = await fetch(
        "SELECT COUNT(*) AS count FROM likes WHERE post_id = $1 AND persona_id = $2",
        post["id"],
        persona["persona_id"],
    )
    assert rows[0]["count"] == 1