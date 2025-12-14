import json
import pytest

from services.ai_calls import run_agent_turn


@pytest.mark.asyncio
async def test_run_agent_turn_dispatches_tool_call(db, persona, post, fetch):
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

    await run_agent_turn(fake_llm, context, db)

    rows = await fetch(
        """
        SELECT COUNT(*) AS count
        FROM likes
        WHERE post_id = $1 AND persona_id = $2
        """,
        post["id"],
        persona["persona_id"],
    )

    assert rows[0]["count"] == 1

@pytest.mark.asyncio
async def test_run_agent_turn_invalid_function_name(db):
    def fake_llm(_context):
        return {
            "role": "assistant",
            "content": json.dumps(
                {
                    "function_name": "non_existent_function",
                    "arguments": [],
                    "reasoning": "testing invalid function",
                }
            ),
        }

    context = [{"role": "system", "content": "{}"}]

    await run_agent_turn(fake_llm, context, db)

    assert "doesn't exist" in context[-1]["content"]
    
@pytest.mark.asyncio
async def test_run_agent_turn_missing_function_name(db):
    def fake_llm(_context):
        return {
            "role": "assistant",
            "content": json.dumps(
                {
                    "arguments": [],
                    "reasoning": "forgot function name",
                }
            ),
        }

    context = [{"role": "system", "content": "{}"}]

    await run_agent_turn(fake_llm, context, db)

    assert "Invalid response" in context[-1]["content"]
    
@pytest.mark.asyncio
async def test_run_agent_turn_invalid_json(db):
    def fake_llm(_context):
        return {
            "role": "assistant",
            "content": "{this is not valid json",
        }

    context = [{"role": "system", "content": "{}"}]

    await run_agent_turn(fake_llm, context, db)

    assert "Invalid JSON" in context[-1]["content"]
    
@pytest.mark.asyncio
async def test_run_agent_turn_narrative_response_rejected(db):
    def fake_llm(_context):
        return {
            "role": "assistant",
            "content": json.dumps(
                {
                    "response": "Here is a narrative explanation instead of a tool call."
                }
            ),
        }

    context = [{"role": "system", "content": "{}"}]

    await run_agent_turn(fake_llm, context, db)

    assert "You provided narrative text" in context[-1]["content"]
    
@pytest.mark.asyncio
async def test_run_agent_turn_single_tool_call_only(db, persona, post, fetch):
    def fake_llm(_context):
        return {
            "role": "assistant",
            "content": json.dumps(
                {
                    "function_name": "like_post",
                    "arguments": [post["id"], persona["persona_id"]],
                    "reasoning": "like once",
                }
            ),
        }

    context = [{"role": "system", "content": "{}"}]

    await run_agent_turn(fake_llm, context, db)

    rows = await fetch(
        """
        SELECT COUNT(*) AS count
        FROM likes
        WHERE post_id = $1 AND persona_id = $2
        """,
        post["id"],
        persona["persona_id"],
    )

    assert rows[0]["count"] == 1
    assert len(context) == 3  # system + assistant + tool result