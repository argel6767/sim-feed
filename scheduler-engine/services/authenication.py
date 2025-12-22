import os
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from passlib.context import CryptContext
from services.queries import fetch_admin_by_username, create_admin, fetch_admin_count, fetch_admin_invitation_by_email, fetch_admin_by_email
from datetime import datetime, timedelta, timezone
from configs.db import Database
from configs.get_db_singleton import get_db

ALGORITHM = 'HS256'
ACCESS_TOKEN_EXPIRE_MINUTES = 30

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)
    
def hash_password(password):
    return pwd_context.hash(password)
    
def get_secret_key():
    SECRET_KEY = os.getenv("SECRET_KEY")
    
    if not SECRET_KEY:
        raise ValueError("SECRET_KEY environment variable is not set")
    
    return SECRET_KEY
    
async def authenicate_admin(authenication_details, db:Database):
    if not authenication_details.get("username") or not authenication_details.get('password'):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Username or password is missing")
    
    admin = await fetch_admin_by_username(authenication_details["username"], db)
    if not admin:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Admin not found")
    
    if not verify_password(authenication_details["password"], admin["password"]):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Incorrect password")
    
    return admin
    
def create_access_token(data: dict, expires_delta: timedelta = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)):
    SECRET_KEY = get_secret_key()
    to_encode = data.copy()
    expire = datetime.now(timezone.utc)  + expires_delta
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, str(SECRET_KEY), algorithm=ALGORITHM)
    return encoded_jwt
    
async def get_current_user(db:Database = Depends(get_db), token = Depends(oauth2_scheme)):
    SECRET_KEY = get_secret_key()
    
    credentials_exception = HTTPException(
        status_code=status.HTTP_403_FORBIDDEN,
        detail="Invalid credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        payload = jwt.decode(token, str(SECRET_KEY), algorithms=[ALGORITHM])
        username = payload.get("sub")
        if username is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    user = await fetch_admin_by_username(username, db)
    if user is None:
        raise credentials_exception

    return user
    
async def authorize_admin_registration(authentication_details, db: Database):
    admin_count = await fetch_admin_count(db)
    
    if admin_count['count'] == 0:
        bootstrap_token = os.environ['BOOTSTRAP_TOKEN']
        if (not bootstrap_token):
           raise ValueError("BOOTSTRAP_TOKEN environment variable not set")
           
        if not authentication_details.get('bootstrap_token') or authentication_details['bootstrap_token'] != bootstrap_token:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Invalid bootstrap token given")
    
    else:
        if not authentication_details.get("invite_token"):
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invite token is missing")
        
        admin_invitation_info = await fetch_admin_invitation_by_email(authentication_details["email"], db)
        
        if not admin_invitation_info:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Admin invitation not found")
        
        if admin_invitation_info["expires_at"] < datetime.now(timezone.utc):
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin invitation expired, request a new one")
        
        if authentication_details["invite_token"] != admin_invitation_info["invite_token"]:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Invalid invite token given")

async def register_admin(authentication_details, db:Database):
    if not authentication_details.get('email') or not authentication_details.get("username") or not authentication_details.get('password'):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Username or password is missing")
    
    admin = await fetch_admin_by_username(authentication_details["username"], db)
    if admin:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Admin already exists")
        
    await authorize_admin_registration(authentication_details, db)
    admin = await fetch_admin_by_email(authentication_details["email"], db)
    
    if admin:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Admin already exists")
    
    hashed_password = hash_password(authentication_details["password"])
    authentication_details["password"] = hashed_password
    new_admin = await create_admin(authentication_details, db)
    return new_admin
