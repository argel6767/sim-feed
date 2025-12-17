from configs.db import Database
from fastapi import APIRouter, Depends, HTTPException, Request, status
from configs.get_db_singleton import get_db
from services.authenication import get_current_user
from services.queries import (
    delete_persona_by_id,
    fetch_persona_by_id,
    fetch_persona_by_username,
    fetch_personas,
    insert_persona,
)

router = APIRouter(prefix="/personas", tags=["Personas"])


@router.post("", status_code=status.HTTP_201_CREATED)
async def insert_new_persona(
    request: Request,
    db: Database = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    try:
        data = await request.json()
        body = await insert_persona(data, db)
        return body
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"There was a failure in inserting new persona: {e}",
        )


@router.get("/")
async def fetch_all_personas(
    db: Database = Depends(get_db), current_user: dict = Depends(get_current_user)
):
    personas = await fetch_personas(db)
    return personas


@router.get("/{id}")
async def fetch_persona_by_id_endpoint(
    id: int, db: Database = Depends(get_db), current_user: dict = Depends(get_current_user)
):
    persona = await fetch_persona_by_id(id, db)
    if not persona:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Persona with id {id} not found",
        )
    return persona


@router.get("/username/{username}")
async def fetch_persona_by_username_endpoint(
    username: str,
    db: Database = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    persona = await fetch_persona_by_username(username, db)
    if not persona:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Persona with username {username} not found",
        )
    return persona


@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_persona(
    id: int, db: Database = Depends(get_db), current_user: dict = Depends(get_current_user)
):
    if not await fetch_persona_by_id(id, db):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Persona with id {id} not found",
        )

    try:
        await delete_persona_by_id(id, db)
        return {"message": f"Persona with id {id} deleted successfully"}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"There was a failure in deleting persona: {e}",
        )
