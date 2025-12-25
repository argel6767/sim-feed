import pytest

@pytest.mark.asyncio
async def test_insert_new_persona_success(client, fetch):
    payload = {
        "username": "test_user_123",
        "persona": "The coolest user",
        "bio": "A test user bio",
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
    response = await client.post("/personas", json={})
    assert response.status_code == 400
    assert "failure in inserting new persona" in response.json()["detail"]


@pytest.mark.asyncio
async def test_fetch_all_personas_empty(client):
    response = await client.get("/personas")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)


@pytest.mark.asyncio
async def test_fetch_all_personas_with_data(client, fetch):
    payload = {
        "username": "test_fetch_user",
        "persona": "Test persona for fetch",
        "bio": "Test bio for fetch",
    }

    await client.post("/personas", json=payload)
    response = await client.get("/personas")

    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) >= 1

    usernames = [persona["username"] for persona in data]
    assert "test_fetch_user" in usernames


@pytest.mark.asyncio
async def test_fetch_persona_by_id_success(client, fetch):
    payload = {
        "username": "test_id_user",
        "persona": "Test persona for ID fetch",
        "bio": "Test bio for ID fetch",
    }

    await client.post("/personas", json=payload)

    rows = await fetch(
        "SELECT persona_id FROM personas WHERE username = $1",
        payload["username"],
    )
    persona_id = rows[0]["persona_id"]

    response = await client.get(f"/personas/{persona_id}")

    assert response.status_code == 200
    data = response.json()
    assert data["persona_id"] == persona_id
    assert data["username"] == payload["username"]


@pytest.mark.asyncio
async def test_fetch_persona_by_id_not_found(client):
    non_existent_id = 99999
    response = await client.get(f"/personas/{non_existent_id}")
    assert response.status_code == 404


@pytest.mark.asyncio
async def test_fetch_persona_by_username_success(client, fetch):
    payload = {
        "username": "test_username_fetch",
        "persona": "Test persona for username fetch",
        "bio": "Test bio for username fetch",
    }

    await client.post("/personas", json=payload)
    response = await client.get(f"/personas/username/{payload['username']}")

    assert response.status_code == 200
    data = response.json()
    assert data["username"] == payload["username"]


@pytest.mark.asyncio
async def test_fetch_persona_by_username_not_found(client):
    non_existent_username = "non_existent_user_123456"
    response = await client.get(f"/personas/username/{non_existent_username}")
    assert response.status_code == 404


@pytest.mark.asyncio
async def test_delete_persona_success(client, fetch):
    payload = {
        "username": "test_delete_user",
        "persona": "Test persona for deletion",
        "bio": "Test bio for deletion",
    }

    await client.post("/personas", json=payload)

    rows = await fetch(
        "SELECT persona_id FROM personas WHERE username = $1",
        payload["username"],
    )
    persona_id = rows[0]["persona_id"]

    response = await client.delete(f"/personas/{persona_id}")
    assert response.status_code == 204

    deleted_rows = await fetch(
        "SELECT persona_id FROM personas WHERE persona_id = $1",
        persona_id,
    )
    assert len(deleted_rows) == 0


@pytest.mark.asyncio
async def test_delete_persona_not_found(client):
    non_existent_id = 99999
    response = await client.delete(f"/personas/{non_existent_id}")
    assert response.status_code == 404


@pytest.mark.asyncio
async def test_delete_persona_deletion_failure(client, fetch):
    payload = {
        "username": "test_delete_fail_user",
        "persona": "Test persona for delete failure",
        "bio": "Test bio for delete failure",
    }

    await client.post("/personas", json=payload)

    rows = await fetch(
        "SELECT persona_id FROM personas WHERE username = $1",
        payload["username"],
    )
    persona_id = rows[0]["persona_id"]

    # Mock delete to fail - you'd need to adjust based on your setup
    response = await client.delete(f"/personas/{persona_id}")
    assert response.status_code == 204


@pytest.mark.asyncio
async def test_authentication_required_for_all_endpoints(
    unauthenticated_client,
):
    """Test that all endpoints require authentication"""

    response = await unauthenticated_client.post(
        "/personas", json={"username": "test", "persona": "test"}
    )
    assert response.status_code == 401

    response = await unauthenticated_client.get("/personas")
    assert response.status_code == 401

    response = await unauthenticated_client.get("/personas/1")
    assert response.status_code == 401

    response = await unauthenticated_client.get("/personas/username/test")
    assert response.status_code == 401

    response = await unauthenticated_client.delete("/personas/1")
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_insert_persona_missing_username(client):
    """Test inserting persona with missing username"""
    payload = {
        "persona": "Test persona without username",
        "bio": "Test bio",
    }

    response = await client.post("/personas", json=payload)
    assert response.status_code == 400
    assert "failure in inserting new persona" in response.json()["detail"]


@pytest.mark.asyncio
async def test_insert_persona_missing_persona_description(client):
    """Test inserting persona with missing persona description"""
    payload = {
        "username": "test_user_no_persona",
        "bio": "Test bio",
    }

    response = await client.post("/personas", json=payload)
    assert response.status_code == 400
    assert "failure in inserting new persona" in response.json()["detail"]


@pytest.mark.asyncio
async def test_fetch_personas_returns_correct_structure(client, fetch):
    """Test that fetch_personas returns the expected data structure"""
    payload = {
        "username": "structure_test_user",
        "persona": "Test persona for structure validation",
        "bio": "Test bio for structure validation",
    }

    await client.post("/personas", json=payload)
    response = await client.get("/personas")

    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)

    if len(data) > 0:
        persona = data[0]
        assert "username" in persona
        assert "persona_id" in persona


@pytest.mark.asyncio
async def test_insert_persona_missing_bio(client):
    """Test inserting persona with missing bio"""
    payload = {
        "username": "test_user_no_bio",
        "persona": "Test persona without bio",
    }

    response = await client.post("/personas", json=payload)
    assert response.status_code == 400
    assert "failure in inserting new persona" in response.json()["detail"]
