import bcrypt


def hash_password(password: str) -> str:
    # convert to bytes
    password_bytes = password.encode("utf-8")

    # hash
    hashed = bcrypt.hashpw(password_bytes, bcrypt.gensalt())

    # store as string
    return hashed.decode("utf-8")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return bcrypt.checkpw(
        plain_password.encode("utf-8"),
        hashed_password.encode("utf-8")
    )