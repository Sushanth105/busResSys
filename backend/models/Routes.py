from sqlmodel import SQLModel,Field,Relationship
from typing import Optional,List

class Routes(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    start_city: str = Field(max_length=100)
    end_city: str = Field(max_length=100)
    distance_km: int = Field(gt=0)
    
    trips: List["Trips"] = Relationship(back_populates="route" , cascade_delete=True) # type: ignore