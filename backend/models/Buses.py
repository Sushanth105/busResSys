from sqlmodel import SQLModel,Field,Relationship
from typing import Optional,List
from models.busType import BusAirType,BusSeatType

class Buses(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    operator: str = Field(max_length=100)
    bus_number: str = Field(unique=True)
    air_type: BusAirType
    seat_type: BusSeatType
    total_seat: int = Field(gt=0)
    rating: float = Field(ge=0, le=5)
    
    trips: List["Trips"] = Relationship(back_populates="bus" , cascade_delete=True) # type: ignore
