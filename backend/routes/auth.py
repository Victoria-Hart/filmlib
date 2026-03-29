# 📁 backend/routes/auth.py

from fastapi import APIRouter, HTTPException, status, Response
from datetime import datetime, timedelta
from jose import jwt
import os
from schemas.user import UserCreate, UserLogin
from database import users_collection
from utils.security import hash_password, verify_password

router = APIRouter(prefix="/auth", tags=["auth"])

SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60


@router.post("/register", status_code=201)
def register(user: UserCreate):
    existing = users_collection.find_one({"username": user.username})
    if existing:
        raise HTTPException(status_code=400, detail="Username already exists")

    hashed = hash_password(user.password)

    result = users_collection.insert_one({
        "username": user.username,
        "hashed_password": hashed
    })

    return {
        "id": str(result.inserted_id),
        "username": user.username
    }


@router.post("/login")
def login(user: UserLogin, response: Response):
    db_user = users_collection.find_one({"username": user.username})

    if not db_user:
        raise HTTPException(status_code=400, detail="Invalid username or password")

    if not verify_password(user.password, db_user["hashed_password"]):
        raise HTTPException(status_code=400, detail="Invalid username or password")

    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)

    token_data = {
        "sub": str(db_user["_id"]),
        "username": db_user["username"],
        "exp": expire
    }

    token = jwt.encode(token_data, SECRET_KEY, algorithm=ALGORITHM)

    return {
        "access_token": token,
        "token_type": "bearer"
    }


@router.post("/logout")
def logout(response: Response):
    response.delete_cookie("access_token")
    return {"message": "Logged out"}