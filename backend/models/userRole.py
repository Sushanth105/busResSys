from enum import Enum

class UserRole(str, Enum):   # Use `str` for JSON compatibility in FastAPI
    ADMIN = "admin"
    USER = "user"