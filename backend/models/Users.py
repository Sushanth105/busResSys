from sqlmodel import SQLModel,Field
from typing import Optional
from models.userRole import UserRole

class Users(SQLModel , table = True):
    id: Optional[int] = Field(default=None , primary_key=True)
    name: str
    email : str = Field(unique=True , index=True)
    password: str
    role: UserRole = Field(default=UserRole.USER)