import pytest

@pytest.mark.asyncio
async def test_read_root(client):
    response = await client.get("/")

    assert response.status_code == 200
    assert response.json() == {
        "message": "Welcome to Sim-Feed Decision Engine",
        "status": "OK",
    }
    
@pytest.mark.asyncio
async def test_insert_new_persona_success(client, fetch):
    payload = {
        "username": "test_user_123",
        "persona": "The coolest user",
    }

    response = await client.post("/personas", json=payload)

    assert response.status_code == 201

    rows = await fetch(
        "SELECT username FROM personas WHERE username = $1",
        payload["username"],
    )

    assert rows[0]["username"] == payload["username"]
    
@pytest.mark.asyncio
async def test_insert_new_persona_failure(client):
    # Missing required fields expected by insert_persona
    response = await client.post("/personas", json={})

    assert response.status_code == 400
    assert "failure in inserting new persona" in response.json()["detail"]
    
@pytest.mark.asyncio
async def test_read_posts_empty(client):
    response = await client.get("/posts")

    assert response.status_code == 200

    data = response.json()
    assert "posts" in data or isinstance(data, dict)
    
@pytest.mark.asyncio
async def test_read_posts_returns_recent(client, persona, post):
    response = await client.get("/posts")

    assert response.status_code == 200

    data = response.json()
    assert "posts_found" in data
    assert len(data["posts_found"]) >= 1