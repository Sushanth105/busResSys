from sqlmodel import SQLModel,Field
from typing import Optional

class RefreshToken(SQLModel , table = True):
    id: Optional[int] = Field(default=None , primary_key=True)
    email : str = Field(unique=True , index=True)
    token : str