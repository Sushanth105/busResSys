from sqlmodel import SQLModel,Field,Relationship
from typing import Optional,List
from models.userRole import UserRole

class Users(SQLModel , table = True):
    id: Optional[int] = Field(default=None , primary_key=True)
    name: str
    email : str = Field(unique=True , index=True)
    password: str
    role: UserRole = Field(default=UserRole.USER)
    
    bookings: List['Bookings'] = Relationship(back_populates='user',cascade_delete=True) # type: ignore