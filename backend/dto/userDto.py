from pydantic import BaseModel
from models.userRole import UserRole

class UserCreate(BaseModel):
    name: str
    email: str
    password: str
    role: str

class UserLogin(BaseModel):
    email: str
    password: str
    
class GetUser(BaseModel):
    name: str
    email: str
    role: UserRole
    