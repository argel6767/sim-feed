import os
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from passlib.context import CryptContext
from service.queries import fetch_admin_by_username, create_admin


SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = 'HS256'
ACCESS_TOKEN_EXPIRE_MINUTES = 30

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)
    
def hash_password(password):
    return pwd_context.hash(password)
    
async def authenicate_admin(authenication_details):
    if not authenication_details.get("username") or not authenication_details.get('password'):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Username or password is missing")
    
    admin = await fetch_admin_by_username(authenication_details["username"])
    if not admin:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Admin not found")
    
    if not verify_password(authenication_details["password"], admin.password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Incorrect password")
    
    return admin

async def create_admin(authentication_details):
    if not authentication_details.get('email') or not authentication_details.get("username") or not authentication_details.get('password'):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Username or password is missing")
    
    admin = await fetch_admin_by_username(authentication_details["username"])
    if admin:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Admin already exists")
    
    hashed_password = hash_password(authentication_details["password"])
    authentication_details["password"] = hashed_password
    new_admin = await create_admin(authentication_details)
    return new_admin
