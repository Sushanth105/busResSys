from fastapi import Depends,HTTPException
from passlib.context import CryptContext
from datetime import datetime,timedelta,timezone
from jose import jwt, JWTError
from dotenv import load_dotenv
import os

load_dotenv()

SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = os.getenv("ALGORITHM")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES"))
REFRESH_TOKEN_EXPIRE_DAYS = int(os.getenv("REFRESH_TOKEN_EXPIRE_DAYS"))

pwd_context = CryptContext(schemes=["bcrypt"],deprecated="auto")

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(password:str,hashed:str)->bool:
    return pwd_context.verify(password,hashed)

def create_access_token(data: dict):
    to_encode = data.copy()
    exp = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({'exp' : exp})
    return jwt.encode(to_encode,key=SECRET_KEY,algorithm=ALGORITHM)

def create_refresh_token(data: dict):
    to_encode = data.copy()
    exp = datetime.now(timezone.utc) + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
    to_encode.update({'exp' : exp})
    return jwt.encode(to_encode,key=SECRET_KEY,algorithm=ALGORITHM)

def verify_token(token : str ):
    try:
        payload = jwt.decode(token=token,key=SECRET_KEY,algorithms=[ALGORITHM])
        email = payload.get('sub')
        if email is None :
            raise HTTPException(status_code=401 , detail="Token is invalid or expired")
        return email
    except JWTError:
        raise HTTPException(status_code=401 , detail="Token is invalid or expired")
