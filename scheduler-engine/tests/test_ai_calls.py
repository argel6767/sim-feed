import json
import os
from datetime import date, datetime
from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from services.ai_calls import (
    make_deepseek_request,
    response_format,
    role_description,
    run_agent_turn,
    run_deepseek_agent,
)

class TestMakeDeepseekRequest:
    """Tests for the make_deepseek_request function."""

    def test_raises_error_when_api_key_not_set(self, monkeypatch):
        """Should raise ValueError when DEEPSEEK_API_KEY is not set."""
        monkeypatch.delenv("DEEPSEEK_API_KEY", raising=False)

        with pytest.raises(
            ValueError, match="DEEPSEEK_API_KEY environment variable is not set"
        ):
            make_deepseek_request([{"role": "user", "content": "test"}])

    @patch("services.ai_calls.OpenAI")
    def test_returns_formatted_response_with_valid_json(
        self, mock_openai_class, monkeypatch
    ):
        """Should return properly formatted response dict from DeepSeek API."""
        monkeypatch.setenv("DEEPSEEK_API_KEY", "fake_api_key")

        mock_message = MagicMock()
        mock_message.role = "assistant"
        mock_message.content = json.dumps(
            {
                "function_name": "create_post",
                "arguments": [1, "title", "body"],
                "reasoning": "test reasoning",
            }
        )

        mock_choice = MagicMock()
        mock_choice.message = mock_message

        mock_response = MagicMock()
        mock_response.choices = [mock_choice]

        mock_client = MagicMock()
        mock_client.chat.completions.create.return_value = mock_response
        mock_openai_class.return_value = mock_client

        messages = [{"role": "user", "content": "test message"}]
        result = make_deepseek_request(messages)

        assert result["role"] == "assistant"
        assert "function_name" in result["content"]

        mock_openai_class.assert_called_once_with(
            api_key="fake_api_key", base_url="https://api.deepseek.com"
        )
        mock_client.chat.completions.create.assert_called_once_with(
            model="deepseek-chat",
            messages=messages,
            response_format=response_format,
            stream=False,
        )

    @patch("services.ai_calls.OpenAI")
    def test_handles_invalid_json_response(self, mock_openai_class, monkeypatch):
        """Should handle invalid JSON response without crashing."""
        monkeypatch.setenv("DEEPSEEK_API_KEY", "fake_api_key")

        mock_message = MagicMock()
        mock_message.role = "assistant"
        mock_message.content = "This is not valid JSON"

        mock_choice = MagicMock()
        mock_choice.message = mock_message

        mock_response = MagicMock()
        mock_response.choices = [mock_choice]

        mock_client = MagicMock()
        mock_client.chat.completions.create.return_value = mock_response
        mock_openai_class.return_value = mock_client

        messages = [{"role": "user", "content": "test"}]
        result = make_deepseek_request(messages)

        assert result["role"] == "assistant"
        assert result["content"] == "This is not valid JSON"

    @patch("services.ai_calls.OpenAI")
    def test_logs_function_call_info_on_valid_response(
        self, mock_openai_class, monkeypatch, caplog
    ):
        """Should log function call info when response is valid JSON."""
        monkeypatch.setenv("DEEPSEEK_API_KEY", "fake_api_key")

        mock_message = MagicMock()
        mock_message.role = "assistant"
        mock_message.content = json.dumps(
            {
                "function_name": "like_post",
                "arguments": [1, 2],
                "reasoning": "I want to like this post",
            }
        )

        mock_choice = MagicMock()
        mock_choice.message = mock_message

        mock_response = MagicMock()
        mock_response.choices = [mock_choice]

        mock_client = MagicMock()
        mock_client.chat.completions.create.return_value = mock_response
        mock_openai_class.return_value = mock_client

        import logging

        with caplog.at_level(logging.INFO):
            make_deepseek_request([{"role": "user", "content": "test"}])

        assert "like_post" in caplog.text


class TestRunAgentTurn:
    """Tests for the run_agent_turn function."""

    @pytest.mark.asyncio
    async def test_function_returning_dict_is_json_serialized(self, db, persona):
        """When function returns a dict, it should be JSON serialized in context."""

        def fake_llm(_context):
            return {
                "role": "assistant",
                "content": json.dumps(
                    {
                        "function_name": "view_most_recent_posts",
                        "arguments": [],
                        "reasoning": "checking recent posts",
                    }
                ),
            }

        context = [{"role": "system", "content": "{}"}]
        await run_agent_turn(fake_llm, context, db)

        # The last message should be the result (JSON string of dict)
        last_content = context[-1]["content"]
        parsed = json.loads(last_content)
        assert "status" in parsed

    @pytest.mark.asyncio
    async def test_context_is_updated_with_assistant_response(self, db):
        """The assistant's response should be appended to context."""

        def fake_llm(_context):
            return {
                "role": "assistant",
                "content": json.dumps(
                    {
                        "function_name": "unknown_func",
                        "arguments": [],
                        "reasoning": "test",
                    }
                ),
            }

        context = [{"role": "system", "content": "{}"}]
        await run_agent_turn(fake_llm, context, db)

        # Context should have: system, assistant, error message
        assert len(context) == 3
        assert context[1]["role"] == "assistant"

    @pytest.mark.asyncio
    async def test_handles_empty_arguments_list(self, db):
        """Should handle functions with empty arguments list."""

        def fake_llm(_context):
            return {
                "role": "assistant",
                "content": json.dumps(
                    {
                        "function_name": "view_most_recent_posts",
                        "arguments": [],
                        "reasoning": "viewing posts",
                    }
                ),
            }

        context = [{"role": "system", "content": "{}"}]
        await run_agent_turn(fake_llm, context, db)

        # Should succeed without error
        last_content = context[-1]["content"]
        assert "doesn't exist" not in last_content

    @pytest.mark.asyncio
    async def test_creates_post_through_agent_turn(self, db, persona, fetch):
        """Test create_post function execution through agent turn."""

        def fake_llm(_context):
            return {
                "role": "assistant",
                "content": json.dumps(
                    {
                        "function_name": "create_post",
                        "arguments": [
                            persona["persona_id"],
                            "Agent Title",
                            "Agent created this post",
                        ],
                        "reasoning": "creating a new post",
                    }
                ),
            }

        context = [{"role": "system", "content": "{}"}]
        await run_agent_turn(fake_llm, context, db)

        rows = await fetch(
            """
            SELECT id, title, body, author
            FROM posts
            WHERE author = $1 AND body = $2
            """,
            persona["persona_id"],
            "Agent created this post",
        )
        assert len(rows) == 1
        assert rows[0]["title"] == "Agent Title"

    @pytest.mark.asyncio
    async def test_comment_on_post_through_agent_turn(self, db, persona, post, fetch):
        """Test comment_on_post function execution through agent turn."""

        def fake_llm(_context):
            return {
                "role": "assistant",
                "content": json.dumps(
                    {
                        "function_name": "comment_on_post",
                        "arguments": [post["id"], persona["persona_id"], "Great post!"],
                        "reasoning": "commenting on the post",
                    }
                ),
            }

        context = [{"role": "system", "content": "{}"}]
        await run_agent_turn(fake_llm, context, db)

        rows = await fetch(
            """
            SELECT id, body, author_id
            FROM comments
            WHERE post_id = $1 AND author_id = $2
            """,
            post["id"],
            persona["persona_id"],
        )
        assert len(rows) == 1
        assert rows[0]["body"] == "Great post!"

    @pytest.mark.asyncio
    async def test_follow_user_through_agent_turn(
        self, db, persona, other_persona, fetch
    ):
        """Test follow_user function execution through agent turn."""

        def fake_llm(_context):
            return {
                "role": "assistant",
                "content": json.dumps(
                    {
                        "function_name": "follow_user",
                        "arguments": [
                            persona["persona_id"],
                            other_persona["persona_id"],
                        ],
                        "reasoning": "following another user",
                    }
                ),
            }

        context = [{"role": "system", "content": "{}"}]
        await run_agent_turn(fake_llm, context, db)

        rows = await fetch(
            """
            SELECT follower, followed
            FROM follows
            WHERE follower = $1 AND followed = $2
            """,
            persona["persona_id"],
            other_persona["persona_id"],
        )
        assert len(rows) == 1

    @pytest.mark.asyncio
    async def test_update_bio_through_agent_turn(self, db, persona, fetch):
        """Test update_bio function execution through agent turn."""

        def fake_llm(_context):
            return {
                "role": "assistant",
                "content": json.dumps(
                    {
                        "function_name": "update_bio",
                        "arguments": [persona["persona_id"], "New bio from agent"],
                        "reasoning": "updating my bio",
                    }
                ),
            }

        context = [{"role": "system", "content": "{}"}]
        await run_agent_turn(fake_llm, context, db)

        rows = await fetch(
            """
            SELECT bio
            FROM personas
            WHERE persona_id = $1
            """,
            persona["persona_id"],
        )
        assert rows[0]["bio"] == "New bio from agent"


class TestRunDeepseekAgent:
    """Tests for the run_deepseek_agent function."""

    @pytest.mark.asyncio
    async def test_serializes_date_in_persona(self, db):
        """Should convert date objects in persona to strings."""
        persona = {
            "persona_id": 1,
            "username": "test_user",
            "birth_date": date(1990, 5, 15),
            "created_at": datetime(2024, 1, 1, 12, 0, 0),
        }
        function_info = []

        turn_count = 0

        def mock_request(context):
            nonlocal turn_count
            turn_count += 1

            # Verify serialization on first call
            if turn_count == 1:
                system_content = json.loads(context[0]["content"])
                assert system_content["birth_date"] == "1990-05-15"
                assert system_content["created_at"] == "2024-01-01 12:00:00"

            return {
                "role": "assistant",
                "content": json.dumps(
                    {
                        "function_name": "view_most_recent_posts",
                        "arguments": [],
                        "reasoning": "test",
                    }
                ),
            }

        with patch("services.ai_calls.make_deepseek_request", side_effect=mock_request):
            await run_deepseek_agent(persona, function_info, db)

    @pytest.mark.asyncio
    async def test_includes_role_description_in_context(self, db):
        """Should include role_description in system context."""
        persona = {"persona_id": 1, "username": "test"}
        function_info = [{"name": "test_func", "description": "test"}]

        captured_context = None

        def mock_request(context):
            nonlocal captured_context
            if captured_context is None:
                captured_context = context

            return {
                "role": "assistant",
                "content": json.dumps(
                    {
                        "function_name": "view_most_recent_posts",
                        "arguments": [],
                        "reasoning": "test",
                    }
                ),
            }

        with patch("services.ai_calls.make_deepseek_request", side_effect=mock_request):
            await run_deepseek_agent(persona, function_info, db)

        system_content = json.loads(captured_context[0]["content"])
        assert "role_description" in system_content
        assert "Available functions" in system_content["role_description"]

    @pytest.mark.asyncio
    async def test_includes_function_info_in_context(self, db):
        """Should include function_info in system context."""
        persona = {"persona_id": 1, "username": "test"}
        function_info = [
            {"name": "create_post", "description": "Creates a post", "parameters": []},
            {"name": "like_post", "description": "Likes a post", "parameters": []},
        ]

        captured_context = None

        def mock_request(context):
            nonlocal captured_context
            if captured_context is None:
                captured_context = context

            return {
                "role": "assistant",
                "content": json.dumps(
                    {
                        "function_name": "view_most_recent_posts",
                        "arguments": [],
                        "reasoning": "test",
                    }
                ),
            }

        with patch("services.ai_calls.make_deepseek_request", side_effect=mock_request):
            await run_deepseek_agent(persona, function_info, db)

        system_content = json.loads(captured_context[0]["content"])
        assert "functions" in system_content
        assert len(system_content["functions"]) == 2
        assert system_content["functions"][0]["name"] == "create_post"

    @pytest.mark.asyncio
    async def test_runs_exactly_10_turns(self, db):
        """Should run exactly 10 turns."""
        persona = {"persona_id": 1, "username": "test"}
        function_info = []

        turn_count = 0

        def mock_request(context):
            nonlocal turn_count
            turn_count += 1
            return {
                "role": "assistant",
                "content": json.dumps(
                    {
                        "function_name": "view_most_recent_posts",
                        "arguments": [],
                        "reasoning": "test",
                    }
                ),
            }

        with patch("services.ai_calls.make_deepseek_request", side_effect=mock_request):
            await run_deepseek_agent(persona, function_info, db)

        assert turn_count == 10

    @pytest.mark.asyncio
    async def test_includes_persona_data_in_context(self, db):
        """Should include persona data in system context."""
        persona = {
            "persona_id": 42,
            "username": "agent_user",
            "bio": "I am a test agent",
        }
        function_info = []

        captured_context = None

        def mock_request(context):
            nonlocal captured_context
            if captured_context is None:
                captured_context = context

            return {
                "role": "assistant",
                "content": json.dumps(
                    {
                        "function_name": "view_most_recent_posts",
                        "arguments": [],
                        "reasoning": "test",
                    }
                ),
            }

        with patch("services.ai_calls.make_deepseek_request", side_effect=mock_request):
            await run_deepseek_agent(persona, function_info, db)

        system_content = json.loads(captured_context[0]["content"])
        assert system_content["persona_id"] == 42
        assert system_content["username"] == "agent_user"
        assert system_content["bio"] == "I am a test agent"

    @pytest.mark.asyncio
    async def test_context_grows_with_each_turn(self, db):
        """Context should grow as turns are executed."""
        persona = {"persona_id": 1, "username": "test"}
        function_info = []

        context_lengths = []

        def mock_request(context):
            context_lengths.append(len(context))
            return {
                "role": "assistant",
                "content": json.dumps(
                    {
                        "function_name": "view_most_recent_posts",
                        "arguments": [],
                        "reasoning": "test",
                    }
                ),
            }

        with patch("services.ai_calls.make_deepseek_request", side_effect=mock_request):
            await run_deepseek_agent(persona, function_info, db)

        # Context should grow: 1, 3, 5, 7, ... (system, then +2 per turn)
        assert context_lengths[0] == 1  # Just system message
        assert context_lengths[1] == 3  # system + assistant + tool result
        assert context_lengths[2] == 5  # system + 2*(assistant + tool result)


class TestBeamsClientMocking:
    """Tests demonstrating BeamsClient mocking pattern for future use."""

    @patch("configs.beams.PushNotifications")
    def test_beams_client_can_be_mocked(self, mock_push_notifications):
        """BeamsClient can be mocked for tests that need it."""
        from configs.beams import BeamsClient

        mock_instance = MagicMock()
        mock_push_notifications.return_value = mock_instance

        client = BeamsClient()
        client.publish_to_interest(
            body={"web": {"notification": {"title": "Test"}}},
            interests=["test-interest"],
        )

        mock_instance.publish_to_interests.assert_called_once_with(
            interests=["test-interest"],
            publish_body={"web": {"notification": {"title": "Test"}}},
        )

    @patch("configs.beams.PushNotifications")
    def test_beams_client_singleton_can_be_mocked(self, mock_push_notifications):
        """BeamsClientSingleton can be mocked for tests."""
        from configs.beams import BeamsClientSingleton

        # Reset singleton for test isolation
        BeamsClientSingleton.instance = None

        mock_instance = MagicMock()
        mock_push_notifications.return_value = mock_instance

        client = BeamsClientSingleton.get_beams_client()
        assert client is not None

        # Clean up
        BeamsClientSingleton.instance = None
