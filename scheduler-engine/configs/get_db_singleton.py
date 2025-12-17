from fastapi import Request
from configs.db import Database

def get_db(request: Request) -> Database:
    return request.app.state.db