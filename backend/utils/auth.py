from fastapi import Request, HTTPException
from jose import jwt, JWTError
import os

SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = "HS256"

def get_current_user(request: Request):
    auth_header = request.headers.get("Authorization")

    if not auth_header:
        raise HTTPException(status_code=401, detail="No auth header")

    try:
        scheme, token = auth_header.split()

        if scheme.lower() != "bearer":
            raise HTTPException(status_code=401, detail="Invalid auth scheme")

        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])

        # 🔥 IMPORTANT: normalize user_id here
        payload["sub"] = str(payload["sub"])

        return payload

    except (JWTError, ValueError):
        raise HTTPException(status_code=401, detail="Invalid token")