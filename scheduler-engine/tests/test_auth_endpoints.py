import pytest
from services.authenication import hash_password


@pytest.mark.asyncio
async def test_register_first_admin_success(unauthenticated_client, fetch, db):
    """Test successful registration of first admin with bootstrap token"""
    # Ensure no admins exist
    await db.execute("DELETE FROM admin")

    payload = {
        "username": "first_admin",
        "email": "first@admin.com",
        "password": "SecurePass123!",
        "bootstrap_token": "fake_bootstrap_token",
    }

    response = await unauthenticated_client.post("/auths/register", json=payload)

    assert response.status_code == 201
    assert "message" in response.json()
    assert "Admin registered successfully" in response.json()["message"]

    # Verify admin was created in database
    rows = await fetch(
        "SELECT username, email FROM admin WHERE username = $1",
        payload["username"],
    )
    assert len(rows) == 1
    assert rows[0]["username"] == payload["username"]
    assert rows[0]["email"] == payload["email"]


@pytest.mark.asyncio
async def test_register_missing_username(unauthenticated_client, db):
    """Test registration with missing username"""
    await db.execute("DELETE FROM admin")

    payload = {
        "email": "test@admin.com",
        "password": "SecurePass123!",
        "bootstrap_token": "test_bootstrap_token",
    }

    response = await unauthenticated_client.post("/auths/register", json=payload)

    assert response.status_code == 400
    assert "Username or password is missing" in response.json()["detail"]


@pytest.mark.asyncio
async def test_register_missing_email(unauthenticated_client, db):
    """Test registration with missing email"""
    await db.execute("DELETE FROM admin")

    payload = {
        "username": "test_admin",
        "password": "SecurePass123!",
        "bootstrap_token": "test_bootstrap_token",
    }

    response = await unauthenticated_client.post("/auths/register", json=payload)

    assert response.status_code == 400
    assert "Username or password is missing" in response.json()["detail"]


@pytest.mark.asyncio
async def test_register_missing_password(unauthenticated_client, db):
    """Test registration with missing password"""
    await db.execute("DELETE FROM admin")

    payload = {
        "username": "test_admin",
        "email": "test@admin.com",
        "bootstrap_token": "test_bootstrap_token",
    }

    response = await unauthenticated_client.post("/auths/register", json=payload)

    assert response.status_code == 400
    assert "Username or password is missing" in response.json()["detail"]


@pytest.mark.asyncio
async def test_register_first_admin_invalid_bootstrap_token(unauthenticated_client, db):
    """Test first admin registration with invalid bootstrap token"""
    await db.execute("DELETE FROM admin")

    payload = {
        "username": "first_admin",
        "email": "first@admin.com",
        "password": "SecurePass123!",
        "bootstrap_token": "wrong_token",
    }

    response = await unauthenticated_client.post("/auths/register", json=payload)

    assert response.status_code == 403
    assert "Invalid bootstrap token given" in response.json()["detail"]


@pytest.mark.asyncio
async def test_register_first_admin_missing_bootstrap_token(unauthenticated_client, db):
    """Test first admin registration without bootstrap token"""
    await db.execute("DELETE FROM admin")

    payload = {
        "username": "first_admin",
        "email": "first@admin.com",
        "password": "SecurePass123!",
    }

    response = await unauthenticated_client.post("/auths/register", json=payload)
    
    assert response.status_code == 403
    assert "Invalid bootstrap token given" in response.json()["detail"]


@pytest.mark.asyncio
async def test_register_duplicate_username(unauthenticated_client, fetch, db):
    """Test registration with existing username"""
    await db.execute("DELETE FROM admin")

    # Create first admin
    hashed_pass = hash_password("ExistingPass123!")
    await db.execute(
        "INSERT INTO admin (username, email, password) VALUES ($1, $2, $3)",
        "existing_admin",
        "existing@admin.com",
        hashed_pass,
    )

    payload = {
        "username": "existing_admin",
        "email": "new@admin.com",
        "password": "SecurePass123!",
        "invite_token": "test_invite_token",
    }

    response = await unauthenticated_client.post("/auths/register", json=payload)

    assert response.status_code == 409
    assert "Admin already exists" in response.json()["detail"]


@pytest.mark.asyncio
async def test_register_duplicate_email(unauthenticated_client, fetch, db):
    """Test registration with existing email"""
    await db.execute("DELETE FROM admin")

    # Create first admin
    hashed_pass = hash_password("ExistingPass123!")
    await db.execute(
        "INSERT INTO admin (username, email, password) VALUES ($1, $2, $3)",
        "existing_admin",
        "existing@admin.com",
        hashed_pass,
    )

    # Try to register with same email but different username
    from datetime import datetime, timedelta, timezone

    # Create an invitation for the email
    await db.execute(
        "INSERT INTO admin_invitations (email, invite_token, expires_at) VALUES ($1, $2, $3)",
        "existing@admin.com",
        "valid_token",
        datetime.now(timezone.utc) + timedelta(days=1),
    )

    payload = {
        "username": "new_admin",
        "email": "existing@admin.com",
        "password": "SecurePass123!",
        "invite_token": "valid_token",
    }

    response = await unauthenticated_client.post("/auths/register", json=payload)

    assert response.status_code == 409
    assert "Admin already exists" in response.json()["detail"]


@pytest.mark.asyncio
async def test_register_subsequent_admin_with_valid_invite(
    unauthenticated_client, fetch, db
):
    """Test registration of subsequent admin with valid invite token"""
    from datetime import datetime, timedelta, timezone

    await db.execute("DELETE FROM admin")
    await db.execute("DELETE FROM admin_invitations")

    # Create first admin
    hashed_pass = hash_password("FirstPass123!")
    await db.execute(
        "INSERT INTO admin (username, email, password) VALUES ($1, $2, $3)",
        "first_admin",
        "first@admin.com",
        hashed_pass,
    )

    # Create invitation
    await db.execute(
        "INSERT INTO admin_invitations (email, invite_token, expires_at) VALUES ($1, $2, $3)",
        "second@admin.com",
        "valid_invite_token",
        datetime.now(timezone.utc) + timedelta(days=1),
    )

    payload = {
        "username": "second_admin",
        "email": "second@admin.com",
        "password": "SecurePass123!",
        "invite_token": "valid_invite_token",
    }

    response = await unauthenticated_client.post("/auths/register", json=payload)

    assert response.status_code == 201
    assert "Admin registered successfully" in response.json()["message"]

    # Verify second admin was created
    rows = await fetch(
        "SELECT username, email FROM admin WHERE username = $1",
        payload["username"],
    )
    assert len(rows) == 1
    assert rows[0]["username"] == payload["username"]


@pytest.mark.asyncio
async def test_register_subsequent_admin_missing_invite_token(
    unauthenticated_client, db
):
    """Test subsequent admin registration without invite token"""
    await db.execute("DELETE FROM admin")

    # Create first admin
    hashed_pass = hash_password("FirstPass123!")
    await db.execute(
        "INSERT INTO admin (username, email, password) VALUES ($1, $2, $3)",
        "first_admin",
        "first@admin.com",
        hashed_pass,
    )

    payload = {
        "username": "second_admin",
        "email": "second@admin.com",
        "password": "SecurePass123!",
    }

    response = await unauthenticated_client.post("/auths/register", json=payload)

    assert response.status_code == 400
    assert "Invite token is missing" in response.json()["detail"]


@pytest.mark.asyncio
async def test_register_subsequent_admin_invalid_invite_token(
    unauthenticated_client, db
):
    """Test subsequent admin registration with invalid invite token"""
    from datetime import datetime, timedelta, timezone

    await db.execute("DELETE FROM admin")
    await db.execute("DELETE FROM admin_invitations")

    # Create first admin
    hashed_pass = hash_password("FirstPass123!")
    await db.execute(
        "INSERT INTO admin (username, email, password) VALUES ($1, $2, $3)",
        "first_admin",
        "first@admin.com",
        hashed_pass,
    )

    # Create invitation with different token
    await db.execute(
        "INSERT INTO admin_invitations (email, invite_token, expires_at) VALUES ($1, $2, $3)",
        "second@admin.com",
        "correct_token",
        datetime.now(timezone.utc) + timedelta(days=1),
    )

    payload = {
        "username": "second_admin",
        "email": "second@admin.com",
        "password": "SecurePass123!",
        "invite_token": "wrong_token",
    }

    response = await unauthenticated_client.post("/auths/register", json=payload)

    assert response.status_code == 403
    assert "Invalid invite token given" in response.json()["detail"]


@pytest.mark.asyncio
async def test_register_subsequent_admin_expired_invite(unauthenticated_client, db):
    """Test subsequent admin registration with expired invite token"""
    from datetime import datetime, timedelta, timezone

    await db.execute("DELETE FROM admin")
    await db.execute("DELETE FROM admin_invitations")

    # Create first admin
    hashed_pass = hash_password("FirstPass123!")
    await db.execute(
        "INSERT INTO admin (username, email, password) VALUES ($1, $2, $3)",
        "first_admin",
        "first@admin.com",
        hashed_pass,
    )

    # Create expired invitation
    await db.execute(
        "INSERT INTO admin_invitations (email, invite_token, expires_at) VALUES ($1, $2, $3)",
        "second@admin.com",
        "valid_token",
        datetime.now(timezone.utc) - timedelta(days=1),
    )

    payload = {
        "username": "second_admin",
        "email": "second@admin.com",
        "password": "SecurePass123!",
        "invite_token": "valid_token",
    }

    response = await unauthenticated_client.post("/auths/register", json=payload)

    assert response.status_code == 403
    assert "Admin invitation expired" in response.json()["detail"]


@pytest.mark.asyncio
async def test_register_subsequent_admin_no_invitation_found(
    unauthenticated_client, db
):
    """Test subsequent admin registration when no invitation exists"""
    await db.execute("DELETE FROM admin")
    await db.execute("DELETE FROM admin_invitations")

    # Create first admin
    hashed_pass = hash_password("FirstPass123!")
    await db.execute(
        "INSERT INTO admin (username, email, password) VALUES ($1, $2, $3)",
        "first_admin",
        "first@admin.com",
        hashed_pass,
    )

    payload = {
        "username": "second_admin",
        "email": "second@admin.com",
        "password": "SecurePass123!",
        "invite_token": "some_token",
    }

    response = await unauthenticated_client.post("/auths/register", json=payload)

    assert response.status_code == 404
    assert "Admin invitation not found" in response.json()["detail"]


@pytest.mark.asyncio
async def test_login_success(unauthenticated_client, db):
    """Test successful login with valid credentials"""
    await db.execute("DELETE FROM admin")

    # Create admin
    password = "TestPassword123!"
    hashed_pass = hash_password(password)
    await db.execute(
        "INSERT INTO admin (username, email, password) VALUES ($1, $2, $3)",
        "test_admin",
        "test@admin.com",
        hashed_pass,
    )

    payload = {
        "username": "test_admin",
        "password": password,
    }

    response = await unauthenticated_client.post("/auths/login", json=payload)

    assert response.status_code == 200

    data = response.json()
    assert "access_token" in data
    assert "token_type" in data
    assert data["token_type"] == "bearer"
    assert isinstance(data["access_token"], str)
    assert len(data["access_token"]) > 0


@pytest.mark.asyncio
async def test_login_missing_username(unauthenticated_client):
    """Test login with missing username"""
    payload = {
        "password": "TestPassword123!",
    }

    response = await unauthenticated_client.post("/auths/login", json=payload)

    assert response.status_code == 400
    assert "Username or password is missing" in response.json()["detail"]


@pytest.mark.asyncio
async def test_login_missing_password(unauthenticated_client):
    """Test login with missing password"""
    payload = {
        "username": "test_admin",
    }

    response = await unauthenticated_client.post("/auths/login", json=payload)

    assert response.status_code == 400
    assert "Username or password is missing" in response.json()["detail"]


@pytest.mark.asyncio
async def test_login_user_not_found(unauthenticated_client):
    """Test login with non-existent user"""
    payload = {
        "username": "nonexistent_admin",
        "password": "TestPassword123!",
    }

    response = await unauthenticated_client.post("/auths/login", json=payload)

    assert response.status_code == 404
    assert "Admin not found" in response.json()["detail"]


@pytest.mark.asyncio
async def test_login_incorrect_password(unauthenticated_client, db):
    """Test login with incorrect password"""
    await db.execute("DELETE FROM admin")

    # Create admin
    hashed_pass = hash_password("CorrectPassword123!")
    await db.execute(
        "INSERT INTO admin (username, email, password) VALUES ($1, $2, $3)",
        "test_admin",
        "test@admin.com",
        hashed_pass,
    )

    payload = {
        "username": "test_admin",
        "password": "WrongPassword123!",
    }

    response = await unauthenticated_client.post("/auths/login", json=payload)

    assert response.status_code == 401
    assert "Incorrect password" in response.json()["detail"]


@pytest.mark.asyncio
async def test_login_empty_credentials(unauthenticated_client):
    """Test login with empty username and password"""
    payload = {
        "username": "",
        "password": "",
    }

    response = await unauthenticated_client.post("/auths/login", json=payload)

    assert response.status_code == 400
    assert "Username or password is missing" in response.json()["detail"]


@pytest.mark.asyncio
async def test_register_response_structure(unauthenticated_client, db):
    """Test that register endpoint returns proper response structure"""
    await db.execute("DELETE FROM admin")

    payload = {
        "username": "structure_test_admin",
        "email": "structure@admin.com",
        "password": "SecurePass123!",
        "bootstrap_token": "fake_bootstrap_token",
    }

    response = await unauthenticated_client.post("/auths/register", json=payload)

    assert response.status_code == 201

    data = response.json()
    assert "message" in data
    assert "admin_info" in data


@pytest.mark.asyncio
async def test_login_response_structure(unauthenticated_client, db):
    """Test that login endpoint returns proper response structure"""
    await db.execute("DELETE FROM admin")

    password = "TestPassword123!"
    hashed_pass = hash_password(password)
    await db.execute(
        "INSERT INTO admin (username, email, password) VALUES ($1, $2, $3)",
        "test_admin",
        "test@admin.com",
        hashed_pass,
    )

    payload = {
        "username": "test_admin",
        "password": password,
    }

    response = await unauthenticated_client.post("/auths/login", json=payload)

    assert response.status_code == 200

    data = response.json()
    assert "access_token" in data
    assert "token_type" in data
    assert data["token_type"] == "bearer"
