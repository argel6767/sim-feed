import pytest

@pytest.mark.asyncio
async def test_read_root(client):
    response = await client.get("/")

    assert response.status_code == 200
    assert response.json() == {
        "message": "Welcome to Sim-Feed's Scheduler Engine. All agent coordination and scheduling for Sim-Feed is handled here.",
        "status": "OK",
    }

@pytest.mark.asyncio
async def test_read_posts_returns_recent(client, persona, post):
    response = await client.get("/posts")

    assert response.status_code == 200

    data = response.json()
    assert "posts_found" in data
    assert len(data["posts_found"]) >= 1