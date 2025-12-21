from configs.db import Database
from configs.get_db_singleton import get_db
from fastapi import APIRouter, Depends, Request
from services.authenication import (
    authenicate_admin,
    create_access_token,
    register_admin,
)

router = APIRouter(prefix="/auths", tags=["Authentication"])


@router.post("/register", status_code=201)
async def register(request: Request, db: Database = Depends(get_db)):
    body = await request.json()
    new_admin = await register_admin(body, db)
    return {
        "message": "Admin registered successfully. You can now log in.",
        "admin_info": new_admin,
    }


@router.post("/login")
async def login(request: Request, db: Database = Depends(get_db)):
    body = await request.json()
    admin = await authenicate_admin(body, db)
    data = {"sub": admin["username"], "id": admin["id"], "email": admin["email"]}
    token = create_access_token(data)
    return {"access_token": token, "token_type": "bearer"}
